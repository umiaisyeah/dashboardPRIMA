import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { VerificationResult, DocumentPackage } from '../types';
import { formatRupiah, formatPercentage } from './normalizer';

export interface GeneratePdfOptions {
  packageTitle?: string;
  verifierName?: string;
  notes?: string;
}

export function downloadVerificationPdf(
  result: VerificationResult,
  docPackage?: DocumentPackage | null,
  options?: GeneratePdfOptions
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const primaryBlue = [0, 84, 166]; // #0054a6
  const cyanWater = [0, 173, 237]; // #00aded
  const darkNavy = [0, 70, 144]; // #004690
  const goldAmber = [245, 158, 11]; // #f59e0b
  const slateDark = [30, 41, 59];
  const slateMuted = [100, 116, 139];

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Header Banner Background
  doc.setFillColor(0, 84, 166);
  doc.rect(0, 0, pageWidth, 28, 'F');

  // Gold accent line under header
  doc.setFillColor(245, 158, 11);
  doc.rect(0, 28, pageWidth, 2, 'F');

  // Header Text
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('PRIMA - AIR BERSIH JAKARTA', 14, 12);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.text('Project Records, Intelligence, Monitoring and Assurance', 14, 18);
  doc.text('LAPORAN HASIL AUDIT & VERIFIKASI DOKUMEN PROYEK', 14, 23);

  // Right-aligned header metadata
  doc.setFontSize(7.5);
  doc.text(`Dicetak: ${new Date().toLocaleString('id-ID')}`, pageWidth - 14, 12, { align: 'right' });
  doc.text('Status: TERVERIFIKASI SISTEM PRIMA', pageWidth - 14, 18, { align: 'right' });
  doc.text('Klasifikasi: DOKUMEN KONTROL INTERNAL PMO', pageWidth - 14, 23, { align: 'right' });

  let currentY = 36;

  // Section 1: Identitas Proyek
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('1. INFORMASI & IDENTITAS PROYEK', 14, currentY);

  currentY += 4;

  const projectInfo = [
    [
      { content: 'Kode Proyek:', styles: { fontStyle: 'bold' as const, textColor: slateDark as [number, number, number] } },
      result.project.projectCode || '-',
      { content: 'Status Keselarasan:', styles: { fontStyle: 'bold' as const, textColor: slateDark as [number, number, number] } },
      result.project.identityMatchStatus === 'MATCH' ? 'SESUAI (MATCH)' : 'PERIKSA (DISCREPANCY)',
    ],
    [
      { content: 'Nama Proyek:', styles: { fontStyle: 'bold' as const, textColor: slateDark as [number, number, number] } },
      result.project.projectName || docPackage?.projectName || '-',
      { content: 'Nomor Revisi:', styles: { fontStyle: 'bold' as const, textColor: slateDark as [number, number, number] } },
      result.project.revision || 'Rev. 0',
    ],
    [
      { content: 'Subproyek/Area:', styles: { fontStyle: 'bold' as const, textColor: slateDark as [number, number, number] } },
      result.project.subproject || '-',
      { content: 'Paket Dokumen:', styles: { fontStyle: 'bold' as const, textColor: slateDark as [number, number, number] } },
      docPackage?.title || 'Paket Tunggal',
    ],
  ];

  autoTable(doc, {
    startY: currentY,
    body: projectInfo,
    theme: 'grid',
    styles: { fontSize: 8.5, cellPadding: 2 },
    columnStyles: {
      0: { cellWidth: 32, fillColor: [241, 245, 249] },
      1: { cellWidth: 65 },
      2: { cellWidth: 35, fillColor: [241, 245, 249] },
      3: { cellWidth: 50 },
    },
    margin: { left: 14, right: 14 },
  });

  currentY = (doc as any).lastAutoTable.finalY + 8;

  // Section 2: Ringkasan Hasil Verifikasi (Executive Summary)
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('2. RINGKASAN EKSEKUTIF & TINGKAT KEPATUHAN', 14, currentY);

  currentY += 4;

  const complianceRate = Math.round(
    (result.summary.verified / (result.summary.total_items || 1)) * 100
  );

  const summaryData = [
    [
      'Tingkat Kepatuhan (Compliance Rate)',
      `${complianceRate}%`,
      'Total Item Diperiksa',
      `${result.summary.total_items} Item`,
    ],
    [
      'Item Sesuai (Verified)',
      `${result.summary.verified} Item`,
      'Item Deviasi / Mismatch',
      `${result.summary.mismatch} Item`,
    ],
    [
      'Temuan Audit (Exceptions)',
      `${result.exceptions.length} Temuan`,
      'Item Butuh Review / Support',
      `${result.summary.need_support + result.summary.review} Item`,
    ],
  ];

  autoTable(doc, {
    startY: currentY,
    body: summaryData,
    theme: 'grid',
    styles: { fontSize: 8.5, cellPadding: 2 },
    columnStyles: {
      0: { cellWidth: 55, fillColor: [248, 250, 252], fontStyle: 'bold' },
      1: { cellWidth: 42, textColor: primaryBlue as [number, number, number], fontStyle: 'bold' },
      2: { cellWidth: 45, fillColor: [248, 250, 252], fontStyle: 'bold' },
      3: { cellWidth: 40, fontStyle: 'bold' },
    },
    margin: { left: 14, right: 14 },
  });

  currentY = (doc as any).lastAutoTable.finalY + 8;

  // Section 3: Rekapitulasi Anggaran & Finansial
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('3. REKAPITULASI BIAYA & NILAI RAB', 14, currentY);

  currentY += 4;

  const finTable = [
    ['Total RAB Baseline Awal', formatRupiah(result.total_rab.rab_initial)],
    ['Total RAB Usulan Revisi (JusFin)', formatRupiah(result.total_rab.rab_revised)],
    ['Delta Nilai Perubahan', formatRupiah(result.total_rab.system_calculated_delta)],
    [
      'Persentase Perubahan',
      `${(result.total_rab.system_calculated_percentage * 100).toFixed(2)}%`,
    ],
    [
      'Status Toleransi Plafon (10%)',
      result.total_rab.threshold_exceeded
        ? 'MELEBIHI AMBANG BATAS'
        : 'MEMENUHI TOLERANSI (<10%)',
    ],
  ];

  autoTable(doc, {
    startY: currentY,
    body: finTable,
    theme: 'striped',
    styles: { fontSize: 8.5, cellPadding: 2 },
    columnStyles: {
      0: { cellWidth: 95, fontStyle: 'bold', textColor: slateDark as [number, number, number] },
      1: { cellWidth: 87, fontStyle: 'bold', textColor: primaryBlue as [number, number, number], halign: 'right' },
    },
    margin: { left: 14, right: 14 },
  });

  currentY = (doc as any).lastAutoTable.finalY + 8;

  // Check if page break needed
  if (currentY > pageHeight - 65) {
    doc.addPage();
    currentY = 20;
  }

  // Section 4: Verifikasi Perubahan Teknis
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('4. DAFTAR PERUBAHAN TEKNIS & HASIL AUDIT PEKERJAAN', 14, currentY);

  currentY += 4;

  const techRows = (result.changes || []).slice(0, 15).map((tc, idx) => [
    String(idx + 1),
    tc.change_id,
    tc.item,
    tc.baseline,
    tc.proposed,
    tc.actual_bapl,
    tc.technical_status,
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [['No', 'ID', 'Item Pekerjaan', 'Baseline Awal', 'Usulan JusTek', 'Realisasi BAPL', 'Status']],
    body: techRows,
    theme: 'grid',
    styles: { fontSize: 7.5, cellPadding: 1.8 },
    headStyles: { fillColor: [0, 84, 166], textColor: [255, 255, 255], fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 16, fontStyle: 'bold' },
      2: { cellWidth: 45 },
      3: { cellWidth: 32 },
      4: { cellWidth: 32 },
      5: { cellWidth: 32 },
      6: { cellWidth: 17, halign: 'center', fontStyle: 'bold' },
    },
    margin: { left: 14, right: 14 },
  });

  currentY = (doc as any).lastAutoTable.finalY + 8;

  // Add Page for Exceptions and Signatures
  doc.addPage();
  currentY = 20;

  // Section 5: Temuan Audit (Exceptions) & Rekomendasi
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('5. CATATAN TEMUAN AUDIT (EXCEPTIONS) & REKOMENDASI KOREKSI', 14, currentY);

  currentY += 4;

  const exceptionRows = result.exceptions.map((exc, idx) => [
    String(idx + 1),
    exc.change_id,
    exc.finding,
    exc.recommended_action || 'Lengkapi dokumen pendukung.',
  ]);

  if (exceptionRows.length === 0) {
    autoTable(doc, {
      startY: currentY,
      body: [['Seluruh item pekerjaan valid dan telah memenuhi kriteria kepatuhan BAPL & JusTek.']],
      theme: 'plain',
      styles: { fontSize: 9, fontStyle: 'italic', textColor: [22, 101, 52] },
      margin: { left: 14, right: 14 },
    });
  } else {
    autoTable(doc, {
      startY: currentY,
      head: [['No', 'Kode Item', 'Kajian Temuan Discrepancy', 'Rekomendasi Tindakan / Addendum']],
      body: exceptionRows,
      theme: 'grid',
      styles: { fontSize: 7.5, cellPadding: 2 },
      headStyles: { fillColor: [220, 38, 38], textColor: [255, 255, 255], fontStyle: 'bold' },
      columnStyles: {
        0: { cellWidth: 8, halign: 'center' },
        1: { cellWidth: 26, fontStyle: 'bold' },
        2: { cellWidth: 74 },
        3: { cellWidth: 74 },
      },
      margin: { left: 14, right: 14 },
    });
  }

  // Footer on each page
  const totalPages = (doc.internal as any).getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(slateMuted[0], slateMuted[1], slateMuted[2]);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `PRIMA - Project Records, Intelligence, Monitoring and Assurance · Halaman ${i} dari ${totalPages}`,
      pageWidth / 2,
      pageHeight - 8,
      { align: 'center' }
    );
  }

  // Trigger download
  const safeCode = (result.project.projectCode || 'PROYEK').replace(/[^a-zA-Z0-9_-]/g, '_');
  const dateStr = new Date().toISOString().slice(0, 10);
  const filename = `Laporan_Verifikasi_PRIMA_${safeCode}_${dateStr}.pdf`;
  doc.save(filename);
}
