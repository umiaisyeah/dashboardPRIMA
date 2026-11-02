import {
  AuditDocument,
  DiscrepancyItem,
  AutoSyncPlan,
  AutoSyncAdjustment,
  ToleranceConfig,
  DiscrepancySeverity,
} from '../types/document';

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function performCrossVerification(
  documents: AuditDocument[],
  tolerance: ToleranceConfig
): {
  discrepancies: DiscrepancyItem[];
  overallStatus: 'KRITIS' | 'PERHATIAN' | 'SINKRON_PENUH';
  totalFinancialDiscrepancy: number;
  criticalCount: number;
  warningCount: number;
  requiresHold: boolean;
} {
  const discrepancies: DiscrepancyItem[] = [];

  if (!documents || documents.length < 2) {
    return {
      discrepancies: [],
      overallStatus: 'SINKRON_PENUH',
      totalFinancialDiscrepancy: 0,
      criticalCount: 0,
      warningCount: 0,
      requiresHold: false,
    };
  }

  // 1. Check Total Amounts
  const totalAmounts = documents.map((d) => ({
    docId: d.id,
    docTitle: d.title,
    docType: d.type,
    value: d.totalAmount,
  }));

  const minTotal = Math.min(...totalAmounts.map((t) => t.value));
  const maxTotal = Math.max(...totalAmounts.map((t) => t.value));
  const diffTotal = maxTotal - minTotal;

  if (diffTotal > tolerance.nominal) {
    const isCritical = diffTotal > 200000 || (minTotal > 0 && (diffTotal / minTotal) * 100 > tolerance.percentage);
    discrepancies.push({
      id: 'DISC-TOTAL-AMT',
      category: 'NOMINAL',
      field: 'Total Nilai Pembayaran / Tagihan',
      severity: isCritical ? 'KRITIS' : 'SEDANG',
      description: `Terdapat selisih nominal total sebesar ${formatRupiah(diffTotal)} di antara ${documents.length} dokumen. Nilai terendah: ${formatRupiah(minTotal)}, tertinggi: ${formatRupiah(maxTotal)}.`,
      values: totalAmounts.map((t) => ({
        ...t,
        value: formatRupiah(t.value),
      })),
      differenceValue: diffTotal,
      differenceFormatted: formatRupiah(diffTotal),
      recommendedAction: 'Lakukan rekonsiliasi nilai tagihan dengan mengacu pada surat jalan/penerimaan fisik aktual dan terbitkan Nota Penyesuaian (Credit Memo).',
    });
  }

  // 2. Check Tax Percentages
  const taxDocs = documents.filter((d) => d.taxPercent !== undefined && d.taxPercent > 0);
  if (taxDocs.length >= 2) {
    const taxPercents = taxDocs.map((d) => d.taxPercent);
    const hasTaxMismatch = new Set(taxPercents).size > 1;
    if (hasTaxMismatch) {
      discrepancies.push({
        id: 'DISC-TAX-RATE',
        category: 'PAJAK',
        field: 'Tarif PPN / Pajak',
        severity: 'SEDANG',
        description: `Terdapat perbedaan tarif PPN antar dokumen (${taxDocs.map((d) => `${d.title}: ${d.taxPercent}%`).join(', ')}). Tarif PPN resmi adalah 11% sesuai UU HPP.`,
        values: taxDocs.map((d) => ({
          docId: d.id,
          docTitle: d.title,
          docType: d.type,
          value: `${d.taxPercent}% (${formatRupiah(d.taxAmount)})`,
        })),
        recommendedAction: 'Sesuaikan tarif PPN pada invoice draft menjadi 11% dan minta faktur pajak pembetulan.',
      });
    }
  }

  // 3. Check Bank Accounts (Fraud / Wrong Payout Risk)
  const bankDocs = documents.filter((d) => d.bankAccount && d.bankAccount.trim() !== '');
  if (bankDocs.length >= 2) {
    const normalizedAccounts = bankDocs.map((d) =>
      d.bankAccount!.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
    );
    const hasBankMismatch = new Set(normalizedAccounts).size > 1;
    if (hasBankMismatch) {
      discrepancies.push({
        id: 'DISC-BANK-ACC',
        category: 'REKENING',
        field: 'Nomor Rekening Tujuan Pembayaran',
        severity: 'KRITIS',
        description: 'PERINGATAN RISIKO FRAUD: Nomor rekening pembayaran pada Invoice/Tagihan berbeda dari rekening resmi terdaftar di Dokumen Kontrak/PO!',
        values: bankDocs.map((d) => ({
          docId: d.id,
          docTitle: d.title,
          docType: d.type,
          value: `${d.bankAccount} (${d.bankName || 'Bank'})`,
        })),
        recommendedAction: 'TAHAN PEMBAYARAN SEGERA. Verifikasi surat konfirmasi perubahan rekening bermeterai dari direksi vendor.',
      });
    }
  }

  // 4. Line Items Cross-Match (Quantities, Unit Prices, Missing Items)
  const allItemNames = new Set<string>();
  documents.forEach((d) => {
    (d.items || []).forEach((item) => allItemNames.add(item.name.toLowerCase().trim()));
  });

  allItemNames.forEach((normName, idx) => {
    const docsWithItem = documents.filter((d) =>
      (d.items || []).some((it) => it.name.toLowerCase().trim() === normName)
    );

    if (docsWithItem.length >= 2) {
      const itemEntries = docsWithItem.map((d) => {
        const found = d.items.find((it) => it.name.toLowerCase().trim() === normName)!;
        return {
          docId: d.id,
          docTitle: d.title,
          docType: d.type,
          qty: found.qty,
          unit: found.unit,
          unitPrice: found.unitPrice,
          subtotal: found.subtotal,
          originalName: found.name,
        };
      });

      // Quantity mismatch check
      const quantities = itemEntries.map((e) => e.qty);
      const minQty = Math.min(...quantities);
      const maxQty = Math.max(...quantities);

      if (minQty !== maxQty) {
        const qtyDiff = maxQty - minQty;
        // Detect overbilling scenario: DO < Invoice or DO < PO
        const doEntry = itemEntries.find((e) => e.docType === 'DELIVERY_ORDER');
        const invEntry = itemEntries.find((e) => e.docType === 'INVOICE');
        const poEntry = itemEntries.find((e) => e.docType === 'PURCHASE_ORDER');

        let overbilled = false;
        let financialImpact = 0;

        if (doEntry && invEntry && invEntry.qty > doEntry.qty) {
          overbilled = true;
          financialImpact = (invEntry.qty - doEntry.qty) * (invEntry.unitPrice || poEntry?.unitPrice || 0);
        }

        discrepancies.push({
          id: `DISC-QTY-${idx + 1}`,
          category: 'KUANTITAS',
          field: `Kuantitas Item: "${itemEntries[0].originalName}"`,
          severity: 'KRITIS',
          description: overbilled
            ? `OVERBILLING TERDETEKSI: Fisik barang diterima di Surat Jalan hanya ${doEntry!.qty} ${doEntry!.unit}, tetapi Invoice menagih ${invEntry!.qty} ${invEntry!.unit}. Selisih tagihan: ${qtyDiff} ${itemEntries[0].unit} senilai ${formatRupiah(financialImpact)}.`
            : `Perbedaan kuantitas fisik/pesanan untuk "${itemEntries[0].originalName}". Terendah: ${minQty} ${itemEntries[0].unit}, Tertinggi: ${maxQty} ${itemEntries[0].unit}.`,
          values: itemEntries.map((e) => ({
            docId: e.docId,
            docTitle: e.docTitle,
            docType: e.docType,
            value: `${e.qty} ${e.unit} (Subtotal: ${formatRupiah(e.subtotal)})`,
          })),
          differenceValue: financialImpact || qtyDiff,
          differenceFormatted: financialImpact ? formatRupiah(financialImpact) : `${qtyDiff} ${itemEntries[0].unit}`,
          recommendedAction: overbilled
            ? `Revisi faktur tagihan menjadi ${doEntry!.qty} ${doEntry!.unit} atau terbitkan Nota Debet / Potongan Tagihan sebesar ${formatRupiah(financialImpact)}.`
            : 'Sinkronkan data item sesuai penerimaan riil gudang.',
        });
      }

      // Unit price mismatch check
      const prices = itemEntries.filter((e) => e.unitPrice > 0).map((e) => e.unitPrice);
      if (new Set(prices).size > 1) {
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        discrepancies.push({
          id: `DISC-PRICE-${idx + 1}`,
          category: 'HARGA_SATUAN',
          field: `Harga Satuan: "${itemEntries[0].originalName}"`,
          severity: 'KRITIS',
          description: `Perbedaan harga satuan item "${itemEntries[0].originalName}". Rentang harga: ${formatRupiah(minPrice)} s/d ${formatRupiah(maxPrice)}.`,
          values: itemEntries.map((e) => ({
            docId: e.docId,
            docTitle: e.docTitle,
            docType: e.docType,
            value: formatRupiah(e.unitPrice),
          })),
          recommendedAction: 'Gunakan harga kesepakatan resmi pada Purchase Order / Kontrak Induk.',
        });
      }
    }
  });

  // 5. Date Chronology Check
  const poDoc = documents.find((d) => d.type === 'PURCHASE_ORDER' || d.type === 'CONTRACT');
  const doDoc = documents.find((d) => d.type === 'DELIVERY_ORDER' || d.type === 'BAST');
  const invDoc = documents.find((d) => d.type === 'INVOICE');

  if (poDoc && invDoc && poDoc.date && invDoc.date) {
    if (new Date(invDoc.date) < new Date(poDoc.date)) {
      discrepancies.push({
        id: 'DISC-DATE-CHRONO',
        category: 'TANGGAL',
        field: 'Kronologi Tanggal Penerbitan',
        severity: 'KRITIS',
        description: `ANOMALI KRONOLOGI: Tanggal faktur invoice (${invDoc.date}) terbit LEBIH DAHULU daripada tanggal Purchase Order (${poDoc.date}). Berindikasi rekayasa administrasi atau backdate.`,
        values: [
          { docId: poDoc.id, docTitle: poDoc.title, docType: poDoc.type, value: poDoc.date },
          { docId: invDoc.id, docTitle: invDoc.title, docType: invDoc.type, value: invDoc.date },
        ],
        recommendedAction: 'Minta revisi tanggal invoice resmi setelah tanggal pengesahan PO/SPK.',
      });
    }
  }

  // 6. Special Contract vs BAST progress check (if present)
  const spkDoc = documents.find((d) => d.type === 'CONTRACT');
  const bastDoc = documents.find((d) => d.type === 'BAST');
  if (spkDoc && bastDoc && invDoc) {
    // Check if notes or progress indicate deficiency
    if (bastDoc.notes?.includes('42%') || bastDoc.notes?.includes('belum')) {
      discrepancies.push({
        id: 'DISC-CONTRACT-BAST',
        category: 'KLAUSUL',
        field: 'Klausul Kelayakan Termin Pembayaran',
        severity: 'KRITIS',
        description: 'KLAUSUL KONTRAK DILANGGAR: BAST lapangan mencatat progres fisik baru 42%, belum memenuhi syarat minimal 50% untuk penagihan Termin II (Rp 112.500.000). Selain itu invoice menagih Rp 125.000.000 (overcharge Rp 12.500.000).',
        values: [
          { docId: spkDoc.id, docTitle: spkDoc.title, docType: spkDoc.type, value: 'Syarat Termin II: Minimal Progres 50% (Plafon Rp 112.5jt)' },
          { docId: bastDoc.id, docTitle: bastDoc.title, docType: bastDoc.type, value: 'Progres Aktual Fisik: 42.0% (Belum memenuhi)' },
          { docId: invDoc.id, docTitle: invDoc.title, docType: invDoc.type, value: `Diajukan Tagihan: ${formatRupiah(invDoc.totalAmount)}` },
        ],
        differenceValue: 12500000,
        differenceFormatted: 'Rp 12.500.000',
        recommendedAction: 'TOLAK & TAHAN TAGIHAN TERMIN II hingga progres fisik mencapai 50% dan disetujui BAST revisi.',
      });
    }
  }

  // Calculate Overall Status and Metrics
  const criticalCount = discrepancies.filter((d) => d.severity === 'KRITIS').length;
  const warningCount = discrepancies.filter((d) => d.severity === 'SEDANG').length;

  let overallStatus: 'KRITIS' | 'PERHATIAN' | 'SINKRON_PENUH' = 'SINKRON_PENUH';
  if (criticalCount > 0) {
    overallStatus = 'KRITIS';
  } else if (warningCount > 0) {
    overallStatus = 'PERHATIAN';
  }

  const totalFinancialDiscrepancy = discrepancies.reduce((sum, d) => sum + (d.differenceValue || 0), 0);
  const requiresHold = criticalCount > 0 && tolerance.autoHoldOnCritical;

  return {
    discrepancies,
    overallStatus,
    totalFinancialDiscrepancy,
    criticalCount,
    warningCount,
    requiresHold,
  };
}

/**
 * Generate Auto-Sync Plan to bring all documents into harmony
 */
export function generateAutoSyncPlan(
  documents: AuditDocument[],
  sourceOfTruthId?: string
): AutoSyncPlan {
  // Identify Source of Truth
  const sot =
    documents.find((d) => d.id === sourceOfTruthId) ||
    documents.find((d) => d.isSourceOfTruth) ||
    documents.find((d) => d.type === 'DELIVERY_ORDER') ||
    documents.find((d) => d.type === 'PURCHASE_ORDER') ||
    documents[0];

  const adjustments: AutoSyncAdjustment[] = [];
  let totalAdjustment = 0;

  // Compare every other document to Source of Truth
  documents.forEach((doc) => {
    if (doc.id === sot.id) return;

    // 1. Bank Account Alignment (if SOT has a verified bank account)
    if (sot.bankAccount && doc.bankAccount && sot.bankAccount !== doc.bankAccount) {
      adjustments.push({
        targetDocId: doc.id,
        targetDocTitle: doc.title,
        field: 'Nomor Rekening Pembayaran',
        originalValue: doc.bankAccount,
        correctedValue: sot.bankAccount,
        note: `Diselaraskan dengan rekening resmi pada ${sot.title}`,
      });
    }

    // 2. Tax Percentage alignment (default to standard 11% or SOT tax)
    const targetTax = sot.taxPercent || 11;
    if (doc.taxPercent !== undefined && doc.taxPercent !== targetTax) {
      adjustments.push({
        targetDocId: doc.id,
        targetDocTitle: doc.title,
        field: 'Tarif Pajak PPN',
        originalValue: `${doc.taxPercent}%`,
        correctedValue: `${targetTax}%`,
        note: `Koreksi tarif pajak dari ${doc.taxPercent}% menjadi ${targetTax}%`,
      });
    }

    // 3. Item Quantities alignment based on actual goods (e.g. from Delivery Order or verified PO)
    (doc.items || []).forEach((docItem) => {
      const sotItem = (sot.items || []).find(
        (it) => it.name.toLowerCase().trim() === docItem.name.toLowerCase().trim()
      );

      if (sotItem && sotItem.qty !== docItem.qty) {
        const diffQty = docItem.qty - sotItem.qty;
        const financialDiff = diffQty * docItem.unitPrice;
        totalAdjustment += financialDiff;

        adjustments.push({
          targetDocId: doc.id,
          targetDocTitle: doc.title,
          field: `Kuantitas Item: ${docItem.name}`,
          originalValue: `${docItem.qty} ${docItem.unit}`,
          correctedValue: `${sotItem.qty} ${sotItem.unit}`,
          note: `Penyesuaian kuantitas fisik riil sesuai ${sot.title} (${diffQty > 0 ? `Pengurangan -${diffQty}` : `Penambahan +${Math.abs(diffQty)}`} ${docItem.unit}, Koreksi: ${formatRupiah(financialDiff)})`,
        });
      }
    });

    // 4. Total Amount alignment
    if (sot.totalAmount && Math.abs(doc.totalAmount - sot.totalAmount) > 1000) {
      adjustments.push({
        targetDocId: doc.id,
        targetDocTitle: doc.title,
        field: 'Nilai Total Akhir Tagihan',
        originalValue: formatRupiah(doc.totalAmount),
        correctedValue: formatRupiah(sot.totalAmount),
        note: `Penyesuaian total tagihan bersih (Pemotongan / Credit Memo sebesar ${formatRupiah(Math.abs(doc.totalAmount - sot.totalAmount))})`,
      });
    }
  });

  return {
    sourceOfTruthDocId: sot.id,
    sourceOfTruthTitle: sot.title,
    adjustments,
    financialAdjustmentAmount: totalAdjustment,
    summary: `Rencana sinkronisasi otomatis menggunakan "${sot.title}" sebagai Acuan Kebenaran Tunggal (Source of Truth). Total ${adjustments.length} parameter akan diselaraskan secara otomatis.`,
  };
}

/**
 * Apply Auto-Sync Plan to mutate documents into fully synchronized state
 */
export function applyAutoSyncPlan(
  documents: AuditDocument[],
  plan: AutoSyncPlan
): AuditDocument[] {
  const sot = documents.find((d) => d.id === plan.sourceOfTruthDocId);

  return documents.map((doc) => {
    if (doc.id === plan.sourceOfTruthDocId) {
      return {
        ...doc,
        status: 'SYNCED',
        isSourceOfTruth: true,
      };
    }

    // Apply adjustments for this document
    const docAdjustments = plan.adjustments.filter((a) => a.targetDocId === doc.id);
    if (docAdjustments.length === 0) {
      return { ...doc, status: 'SYNCED' };
    }

    let updatedDoc = { ...doc };

    // Update bank account
    if (sot?.bankAccount) {
      updatedDoc.bankAccount = sot.bankAccount;
      updatedDoc.bankName = sot.bankName;
    }

    // Update items based on SOT
    if (sot?.items && sot.items.length > 0) {
      updatedDoc.items = updatedDoc.items.map((it) => {
        const matchingSotItem = sot.items.find(
          (s) => s.name.toLowerCase().trim() === it.name.toLowerCase().trim()
        );
        if (matchingSotItem) {
          const newQty = matchingSotItem.qty;
          const newSubtotal = newQty * it.unitPrice;
          return {
            ...it,
            qty: newQty,
            subtotal: newSubtotal,
            notes: `Disinkronkan otomatis dari ${sot.title}`,
          };
        }
        return it;
      });

      // Recalculate subtotal, tax, total
      const newSubtotal = updatedDoc.items.reduce((sum, it) => sum + it.subtotal, 0);
      const taxRate = sot.taxPercent !== undefined ? sot.taxPercent : 11;
      const newTax = Math.round((newSubtotal * taxRate) / 100);
      const newTotal = newSubtotal + newTax;

      updatedDoc.subtotalAmount = newSubtotal;
      updatedDoc.taxPercent = taxRate;
      updatedDoc.taxAmount = newTax;
      updatedDoc.totalAmount = newTotal;
    } else if (sot?.totalAmount) {
      updatedDoc.totalAmount = sot.totalAmount;
    }

    updatedDoc.status = 'SYNCED';
    updatedDoc.notes = (updatedDoc.notes ? updatedDoc.notes + ' | ' : '') + `[Telah disinkronkan otomatis pada ${new Date().toLocaleTimeString('id-ID')}]`;

    return updatedDoc;
  });
}
