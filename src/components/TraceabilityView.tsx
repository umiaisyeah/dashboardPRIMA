import React, { useState } from 'react';
import { GitCommit, Search, CheckCircle2, AlertTriangle, Eye, X, Copy, Check } from 'lucide-react';
import { TraceabilityRecord } from '../types';
import { StatusBadge } from './TechnicalVerificationView';
import { HighlightedText } from './HighlightedText';

interface TraceabilityViewProps {
  records: TraceabilityRecord[];
}

export const TraceabilityView: React.FC<TraceabilityViewProps> = ({ records }) => {
  const [search, setSearch] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<TraceabilityRecord | null>(null);
  const [copied, setCopied] = useState(false);

  const filtered = records.filter(
    (r) =>
      r.item.toLowerCase().includes(search.toLowerCase()) ||
      r.change_id.toLowerCase().includes(search.toLowerCase()) ||
      (r.traceability_ref_id && r.traceability_ref_id.toLowerCase().includes(search.toLowerCase())) ||
      r.bapl_evidence.toLowerCase().includes(search.toLowerCase())
  );

  const handleCopy = (r: TraceabilityRecord) => {
    const txt = `[${r.change_id}] ${r.item}
Traceability ID: ${r.traceability_ref_id || '-'}
1. RAB Awal: ${r.rab_initial}
2. JusTek Claim: ${r.justek_claim}
3. BAPL Evidence: ${r.bapl_evidence}
4. RAB Revisi: ${r.rab_revised}
5. JusFin Claim: ${r.jusfin_claim}
6. Dokumen MCO: ${r.mco_document}
Konsistensi: ${r.chain_consistent ? 'LENGKAP' : 'GAPS'}
Status Final: ${r.final_status}`;

    navigator.clipboard.writeText(txt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <GitCommit className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              End-to-End Traceability Matrix
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Rantai penelusuran dokumen: DED / RAB Awal &rarr; JusTek &rarr; BAPL &rarr; RAB Revisi &rarr; JusFin &rarr; MCO Approval. Klik baris untuk teks lengkap.
            </p>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari item dalam rantai..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 w-56"
            />
          </div>
        </div>
      </div>

      {/* Traceability Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-3 w-16">ID</th>
                <th className="py-3 px-4 min-w-44">Item Pekerjaan</th>
                <th className="py-3 px-3 min-w-32">1. RAB Awal</th>
                <th className="py-3 px-3 min-w-36">2. JusTek Claim</th>
                <th className="py-3 px-4 min-w-44 bg-slate-100/70 dark:bg-slate-800/50">3. BAPL Evidence</th>
                <th className="py-3 px-3 min-w-36">4. RAB Revisi</th>
                <th className="py-3 px-3 min-w-32">5. JusFin</th>
                <th className="py-3 px-3 min-w-28">6. MCO Docs</th>
                <th className="py-3 px-3 w-24 text-center">Konsistensi</th>
                <th className="py-3 px-3 w-28 text-center">Final Status</th>
                <th className="py-3 px-3 w-16 text-center">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filtered.map((r, idx) => (
                <tr
                  key={`${r.change_id}_${idx}`}
                  onClick={() => setSelectedRecord(r)}
                  className="hover:bg-blue-50/40 dark:hover:bg-blue-950/20 transition-colors cursor-pointer group"
                >
                  <td className="py-3.5 px-3 font-mono font-bold text-slate-900 dark:text-white">
                    <div>{r.change_id}</div>
                    {r.traceability_ref_id && (
                      <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[8.5px] font-mono font-bold bg-blue-50 dark:bg-blue-950/70 text-blue-800 dark:text-cyan-300 border border-blue-200 dark:border-blue-800">
                        {r.traceability_ref_id}
                      </span>
                    )}
                    {r.ba_anomaly_type && r.ba_anomaly_type !== 'NONE' && (
                      <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[8px] font-bold bg-rose-600 text-white animate-pulse">
                        ⚠️ ANOMALI BA
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-[#00aded] transition-colors">
                    {r.item}
                  </td>
                  <td className="py-3.5 px-3 text-slate-600 dark:text-slate-300 text-[11px]">{r.rab_initial}</td>
                  <td className="py-3.5 px-3 text-slate-700 dark:text-slate-200 text-[11px]">{r.justek_claim}</td>
                  <td className="py-3.5 px-4 text-emerald-950 dark:text-emerald-200 font-medium text-[11px] bg-slate-50/70 dark:bg-slate-800/40">
                    <div className="space-y-1">
                      {r.evidence_type === 'EXPLICIT' && (
                        <span className="inline-block px-1.5 py-0.5 rounded text-[8.5px] font-bold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                          BUKTI EKSPLISIT
                        </span>
                      )}
                      {r.evidence_type === 'IMPLICIT' && (
                        <span className="inline-block px-1.5 py-0.5 rounded text-[8.5px] font-bold bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-800">
                          BUKTI IMPLISIT
                        </span>
                      )}
                      {(!r.evidence_type || r.evidence_type === 'NONE') && r.bapl_evidence.includes('TIDAK ADA BUKTI') && (
                        <span className="inline-block px-1.5 py-0.5 rounded text-[8.5px] font-bold bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                          TIDAK ADA BUKTI
                        </span>
                      )}
                      <p className="line-clamp-2">{r.bapl_evidence}</p>
                    </div>
                  </td>
                  <td className="py-3.5 px-3 text-slate-700 dark:text-slate-200 text-[11px]">{r.rab_revised}</td>
                  <td className="py-3.5 px-3 text-slate-600 dark:text-slate-300 text-[11px]">{r.jusfin_claim}</td>
                  <td className="py-3.5 px-3 font-mono text-[10px]">
                    <span className={`inline-block px-1.5 py-0.5 rounded ${
                      r.mco_document.toLowerCase().includes('approved') || r.mco_document.toLowerCase().includes('mc-0')
                        ? 'bg-purple-50 dark:bg-purple-950/70 text-purple-900 dark:text-purple-300 border border-purple-200 dark:border-purple-800 font-semibold'
                        : r.mco_document.toLowerCase().includes('draft')
                        ? 'bg-amber-50 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}>
                      {r.mco_document}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    {r.chain_consistent ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        LENGKAP
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300">
                        <AlertTriangle className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                        GAPS
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    <StatusBadge status={r.final_status} />
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedRecord(r);
                      }}
                      className="p-1 rounded bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-[#00aded] hover:bg-blue-100 dark:hover:bg-slate-700 transition-colors inline-flex items-center justify-center cursor-pointer"
                      title="Lihat seluruh teks rantai audit"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Full Detail Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/80 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-slate-900 dark:bg-slate-700 text-white">
                    {selectedRecord.change_id}
                  </span>
                  <StatusBadge status={selectedRecord.final_status} />
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-bold ${
                      selectedRecord.chain_consistent
                        ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300'
                        : 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300'
                    }`}
                  >
                    Rantai: {selectedRecord.chain_consistent ? 'Lengkap & Sinkron' : 'Ada Discrepancy'}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white pt-1 leading-snug">
                  {selectedRecord.item}
                </h3>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleCopy(selectedRecord)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-2xs cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-emerald-600 dark:text-emerald-400">Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                      <span>Salin</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRecord(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                    1. RAB Awal (Baseline Kontrak)
                  </span>
                  <p className="text-slate-900 dark:text-slate-100 font-medium leading-relaxed">
                    {selectedRecord.rab_initial}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 dark:text-cyan-300 block mb-1">
                    2. Klaim Justifikasi Teknis (JusTek)
                  </span>
                  <p className="text-slate-900 dark:text-slate-100 font-medium leading-relaxed">
                    {selectedRecord.justek_claim}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-900/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 block">
                      3. Bukti Fisik Lapangan &amp; Multi-Dokumen (BAPL / FAT / MC-0 / Back Up Volume)
                    </span>
                    {selectedRecord.evidence_type === 'EXPLICIT' && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-200/80 dark:bg-emerald-900/80 text-emerald-900 dark:text-emerald-200">
                        BUKTI EKSPLISIT
                      </span>
                    )}
                    {selectedRecord.evidence_type === 'IMPLICIT' && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-200/80 dark:bg-amber-900/80 text-amber-900 dark:text-amber-200">
                        BUKTI IMPLISIT (DEDUKSI REKAYASA)
                      </span>
                    )}
                  </div>
                  <p className="text-emerald-950 dark:text-emerald-100 font-semibold leading-relaxed">
                    <HighlightedText
                      text={selectedRecord.bapl_evidence}
                      matchTarget={[selectedRecord.item, selectedRecord.justek_claim, selectedRecord.rab_revised, selectedRecord.rab_initial]}
                    />
                  </p>

                  {selectedRecord.implicit_rationale && (
                    <div className="bg-white/90 dark:bg-slate-800/90 p-2.5 rounded-lg border border-emerald-200 dark:border-emerald-800 text-slate-800 dark:text-slate-200 text-[11px] leading-relaxed">
                      <span className="font-bold text-amber-900 dark:text-amber-300 block text-[10px] uppercase mb-0.5">
                        Alasan Teknis / Deduksi Implisit:
                      </span>
                      {selectedRecord.implicit_rationale}
                    </div>
                  )}
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                    4. RAB Revisi
                  </span>
                  <p className="text-slate-900 dark:text-slate-100 font-medium leading-relaxed">
                    {selectedRecord.rab_revised}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                    5. Klaim Justifikasi Finansial (JusFin)
                  </span>
                  <p className="text-slate-900 dark:text-slate-100 font-medium leading-relaxed">
                    {selectedRecord.jusfin_claim}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/50">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-800 dark:text-purple-300 block mb-1">
                    6. Dokumen Pendukung &amp; MCO Approval
                  </span>
                  <p className="text-slate-900 dark:text-slate-100 font-medium leading-relaxed">
                    {selectedRecord.mco_document}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 dark:bg-slate-700 text-white hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
