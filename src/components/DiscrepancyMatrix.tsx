import React, { useState } from 'react';
import { 
  DiscrepancyItem, 
  AuditDocument 
} from '../types/document';
import { 
  AlertCircle, 
  CheckCircle2, 
  Search, 
  Filter, 
  ArrowRight, 
  BellRing, 
  Wand2,
  FileSpreadsheet
} from 'lucide-react';

interface DiscrepancyMatrixProps {
  discrepancies: DiscrepancyItem[];
  documents: AuditDocument[];
  onOpenAutoSync: () => void;
  onSendAlert: (item: DiscrepancyItem) => void;
  onExportReport: () => void;
}

export const DiscrepancyMatrix: React.FC<DiscrepancyMatrixProps> = ({
  discrepancies,
  documents,
  onOpenAutoSync,
  onSendAlert,
  onExportReport,
}) => {
  const [filterSeverity, setFilterSeverity] = useState<'ALL' | 'KRITIS' | 'SEDANG'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDiscrepancies = discrepancies.filter((d) => {
    if (filterSeverity !== 'ALL' && d.severity !== filterSeverity) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchField = d.field.toLowerCase().includes(q);
      const matchDesc = d.description.toLowerCase().includes(q);
      const matchAction = d.recommendedAction.toLowerCase().includes(q);
      return matchField || matchDesc || matchAction;
    }
    return true;
  });

  const criticalCount = discrepancies.filter((d) => d.severity === 'KRITIS').length;
  const warningCount = discrepancies.filter((d) => d.severity === 'SEDANG').length;

  return (
    <div className="space-y-4">
      {/* Top Filter and Action Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Interactive Filter Segmented Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg shrink-0">
          <button
            onClick={() => setFilterSeverity('ALL')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              filterSeverity === 'ALL'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Semua ({discrepancies.length})
          </button>
          <button
            onClick={() => setFilterSeverity('KRITIS')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              filterSeverity === 'KRITIS'
                ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 font-semibold shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Kritis ({criticalCount})
          </button>
          <button
            onClick={() => setFilterSeverity('SEDANG')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              filterSeverity === 'SEDANG'
                ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 font-semibold shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Perhatian ({warningCount})
          </button>
        </div>

        {/* Search Bar & Export Button */}
        <div className="flex items-center gap-2.5 flex-1 max-w-md justify-end">
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari item, nominal, atau temuan..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-md focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white placeholder:text-slate-400"
            />
          </div>

          <button
            onClick={onExportReport}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-md transition-colors whitespace-nowrap shrink-0"
            title="Ekspor Laporan Audit Rekonsiliasi"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Ekspor BAST</span>
          </button>
        </div>
      </div>

      {/* Discrepancies Table / Cards */}
      {filteredDiscrepancies.length > 0 ? (
        <div className="space-y-3">
          {filteredDiscrepancies.map((item) => {
            const isCritical = item.severity === 'KRITIS';

            return (
              <div
                key={item.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 sm:p-5 transition-colors"
              >
                {/* Header of Discrepancy Card */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap text-xs">
                      <span
                        className={`font-semibold tracking-wide ${
                          isCritical
                            ? 'text-rose-600 dark:text-rose-400'
                            : 'text-amber-600 dark:text-amber-400'
                        }`}
                      >
                        {isCritical ? 'PERBEDAAN KRITIS (SIGNIFIKAN)' : 'PERHATIAN MODERAT'}
                      </span>
                      <span aria-hidden="true" className="text-slate-400">·</span>
                      <span className="text-slate-500 dark:text-slate-400">
                        Kategori: {item.category}
                      </span>
                      {item.differenceFormatted && (
                        <>
                          <span aria-hidden="true" className="text-slate-400">·</span>
                          <span className="font-mono tabular-nums font-semibold text-rose-600 dark:text-rose-400">
                            Selisih: {item.differenceFormatted}
                          </span>
                        </>
                      )}
                    </div>

                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                      {item.field}
                    </h3>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-4xl">
                      {item.description}
                    </p>
                  </div>

                  {/* Actions for this discrepancy */}
                  <div className="flex items-center gap-2 shrink-0 pt-1">
                    <button
                      onClick={() => onSendAlert(item)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors whitespace-nowrap shrink-0"
                    >
                      <BellRing className="w-3.5 h-3.5 text-amber-500" />
                      <span>Kirim Peringatan</span>
                    </button>

                    <button
                      onClick={onOpenAutoSync}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors whitespace-nowrap shrink-0"
                    >
                      <Wand2 className="w-3.5 h-3.5" />
                      <span>Sinkronkan</span>
                    </button>
                  </div>
                </div>

                {/* Values comparison across all documents */}
                <div className="mt-4">
                  <div className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                    Nilai Perbandingan Antar Dokumen:
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
                    {item.values.map((v, vIdx) => {
                      const docMeta = documents.find((d) => d.id === v.docId);
                      const isMaster = docMeta?.isSourceOfTruth;

                      return (
                        <div
                          key={vIdx}
                          className={`p-2.5 rounded-md border text-xs ${
                            isMaster
                              ? 'border-indigo-300 dark:border-indigo-800 bg-indigo-50/40 dark:bg-indigo-950/20'
                              : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40'
                          }`}
                        >
                          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                            <span className="truncate font-medium">{v.docTitle}</span>
                            {isMaster && (
                              <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold shrink-0">
                                Acuan
                              </span>
                            )}
                          </div>
                          <div className="font-mono tabular-nums font-semibold text-slate-900 dark:text-white break-words">
                            {String(v.value)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Recommended Resolution Note */}
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                  <span className="font-semibold text-slate-900 dark:text-white shrink-0">
                    Rekomendasi Auditor:
                  </span>
                  <span>{item.recommendedAction}</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty / Zero-discrepancy State */
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            Semua Dokumen Telah Selaras & Sinkron
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1 leading-relaxed">
            Tidak ditemukan perbedaan nominal, kuantitas fisik, nomor rekening, atau tanggal di luar batas toleransi yang ditentukan.
          </p>
          <div className="mt-4">
            <button
              onClick={onExportReport}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-900 hover:bg-slate-800 rounded-md transition-colors"
            >
              Cetak Berita Acara Kelayakan Audit
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
