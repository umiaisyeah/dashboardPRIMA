import React, { useRef, useState } from 'react';
import { 
  AuditDocument, 
  DiscrepancyItem 
} from '../types/document';
import { 
  Printer, 
  Download, 
  Copy, 
  Check, 
  X, 
  FileText 
} from 'lucide-react';
import { formatRupiah } from '../utils/reconciliationEngine';

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  documents: AuditDocument[];
  discrepancies: DiscrepancyItem[];
  overallStatus: 'KRITIS' | 'PERHATIAN' | 'SINKRON_PENUH';
  totalFinancialDiscrepancy: number;
}

export const ExportReportModal: React.FC<ExportReportModalProps> = ({
  isOpen,
  onClose,
  documents,
  discrepancies,
  overallStatus,
  totalFinancialDiscrepancy,
}) => {
  const [copied, setCopied] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const todayStr = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = () => {
    const text = `BERITA ACARA REKONSILIASI MULTI-DOKUMEN
Nomor: BA-REKON/${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}
Tanggal: ${todayStr}

STATUS AUDIT: ${overallStatus}
DOKUMEN TERPERIKSA:
${documents.map((d, i) => `${i + 1}. [${d.type}] ${d.title} (No: ${d.refNumber}) - Nilai: ${formatRupiah(d.totalAmount)}`).join('\n')}

TOTAL SELISIH DISKREPANSI: ${formatRupiah(totalFinancialDiscrepancy)}

TEMUAN AUDIT:
${discrepancies.length > 0 ? discrepancies.map((d, i) => `${i + 1}. [${d.severity}] ${d.field}: ${d.description} -> Rekomendasi: ${d.recommendedAction}`).join('\n') : 'Semua dokumen 100% selaras tanpa selisih data.'}

REKOMENDASI: ${overallStatus === 'KRITIS' ? 'TAHAN PEMBAYARAN HINGGA TERBIT REVISI FAKTUR / NOTA DEBET.' : 'DOKUMEN MEMENUHI SYARAT PEMBAYARAN.'}
`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              Berita Acara Rekonsiliasi &amp; Hasil Audit
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyText}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Tersalin' : 'Salin Teks'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / Simpan PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Document Printable View */}
        <div className="p-8 overflow-y-auto bg-slate-100 dark:bg-slate-950/70">
          <div
            ref={printRef}
            className="max-w-3xl mx-auto bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 p-8 sm:p-12 shadow-sm border border-slate-200 dark:border-slate-800 font-sans text-xs leading-relaxed space-y-6"
          >
            {/* Kop Surat Resmi */}
            <div className="border-b-2 border-slate-900 dark:border-slate-100 pb-4 flex justify-between items-start">
              <div>
                <h1 className="text-lg font-bold tracking-tight uppercase">
                  PT. WIJAYA BANGUN MANDIRI
                </h1>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                  Internal Audit, Procurement &amp; Financial Control Division
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Menara Mandiri Lt. 18, Jl. Jend. Sudirman Kav. 54-55, Jakarta Selatan
                </p>
              </div>
              <div className="text-right font-mono text-[11px] space-y-0.5">
                <div>No: BA-REKON/2026/088-AUD</div>
                <div>Tanggal: {todayStr}</div>
              </div>
            </div>

            {/* Title */}
            <div className="text-center py-2">
              <h2 className="text-sm font-bold uppercase tracking-wider underline">
                BERITA ACARA HASIL REKONSILIASI &amp; VERIFIKASI MULTI-DOKUMEN
              </h2>
            </div>

            {/* Preamble */}
            <p>
              Pada hari ini, tanggal <strong>{todayStr}</strong>, telah dilakukan pemeriksaan dan verifikasi silang otomatis terhadap keabsahan serta keselarasan data transaksi antar dokumen pengadaan dan penagihan keuangan dengan rincian sebagai berikut:
            </p>

            {/* Compared Documents List */}
            <div>
              <h3 className="font-bold uppercase tracking-wider mb-2">
                I. Berkas Dokumen yang Diverifikasi:
              </h3>
              <table className="w-full border-collapse border border-slate-300 dark:border-slate-700 text-left">
                <thead className="bg-slate-50 dark:bg-slate-800 font-semibold">
                  <tr>
                    <th className="border border-slate-300 dark:border-slate-700 p-2">No</th>
                    <th className="border border-slate-300 dark:border-slate-700 p-2">Jenis Dokumen</th>
                    <th className="border border-slate-300 dark:border-slate-700 p-2">Nomor Referensi</th>
                    <th className="border border-slate-300 dark:border-slate-700 p-2">Pihak Penerbit</th>
                    <th className="border border-slate-300 dark:border-slate-700 p-2 text-right">Nilai Tercatat</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((d, i) => (
                    <tr key={d.id}>
                      <td className="border border-slate-300 dark:border-slate-700 p-2 text-center">{i + 1}</td>
                      <td className="border border-slate-300 dark:border-slate-700 p-2 font-medium">{d.title}</td>
                      <td className="border border-slate-300 dark:border-slate-700 p-2 font-mono">{d.refNumber}</td>
                      <td className="border border-slate-300 dark:border-slate-700 p-2">{d.vendor}</td>
                      <td className="border border-slate-300 dark:border-slate-700 p-2 text-right font-mono tabular-nums font-semibold">
                        {formatRupiah(d.totalAmount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Findings Section */}
            <div>
              <h3 className="font-bold uppercase tracking-wider mb-2">
                II. Ringkasan Temuan &amp; Diskrepansi Data:
              </h3>
              {discrepancies.length > 0 ? (
                <div className="space-y-2">
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded font-semibold text-rose-800 dark:text-rose-300">
                    TOTAL SELISIH FINANSIAL: {formatRupiah(totalFinancialDiscrepancy)} ({discrepancies.filter((d) => d.severity === 'KRITIS').length} Temuan Kritis)
                  </div>
                  <ol className="list-decimal pl-5 space-y-1.5">
                    {discrepancies.map((d) => (
                      <li key={d.id}>
                        <span className="font-bold">{d.field}</span>: {d.description}
                        <br />
                        <span className="text-slate-500 dark:text-slate-400 italic">
                          Tindakan: {d.recommendedAction}
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>
              ) : (
                <p className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded text-emerald-800 dark:text-emerald-300 font-semibold">
                  NIHIL DISKREPANSI: Semua dokumen 100% selaras dengan acuan kebenaran fisik dan kontrak.
                </p>
              )}
            </div>

            {/* Final Decision / Recommendation */}
            <div className="border border-slate-300 dark:border-slate-700 p-4 rounded bg-slate-50 dark:bg-slate-800/40">
              <h3 className="font-bold uppercase tracking-wider mb-1">
                III. Kesimpulan &amp; Rekomendasi Eksekutif:
              </h3>
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                {overallStatus === 'KRITIS'
                  ? 'STATUS: PEMBAYARAN DITANGGUHKAN (HOLD PAYMENT). Invoice vendor wajib direvisi sesuai barang fisik yang diterima di Surat Jalan atau dipotong Nota Debet.'
                  : overallStatus === 'PERHATIAN'
                  ? 'STATUS: PEMBAYARAN DAPAT DILANJUTKAN DENGAN CATATAN PENYESUAIAN PAJAK.'
                  : 'STATUS: LOLOS AUDIT (VERIFIED & CLEAR). Pembayaran dapat diproses 100% oleh Tim Treasury.'}
              </p>
            </div>

            {/* Signatures */}
            <div className="pt-8 grid grid-cols-3 gap-6 text-center">
              <div>
                <p className="font-medium text-slate-600 dark:text-slate-400">Auditor Pelaksana</p>
                <div className="h-16 flex items-end justify-center font-serif text-slate-400 italic">
                  (Digital Certified)
                </div>
                <p className="font-bold border-t border-slate-400 pt-1">Bambang S., CPA</p>
                <p className="text-[10px] text-slate-500">Internal Audit Lead</p>
              </div>

              <div>
                <p className="font-medium text-slate-600 dark:text-slate-400">Finance Controller</p>
                <div className="h-16 flex items-end justify-center font-serif text-slate-400 italic">
                  (Digital Certified)
                </div>
                <p className="font-bold border-t border-slate-400 pt-1">Citra Handayani, SE, Ak</p>
                <p className="text-[10px] text-slate-500">Head of Treasury &amp; AP</p>
              </div>

              <div>
                <p className="font-medium text-slate-600 dark:text-slate-400">Penyelia Pengadaan / Vendor</p>
                <div className="h-16 flex items-end justify-center font-serif text-slate-400 italic">
                  (Disahkan di Lokasi)
                </div>
                <p className="font-bold border-t border-slate-400 pt-1">Ir. Hendra Kusuma</p>
                <p className="text-[10px] text-slate-500">Procurement Manager</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
