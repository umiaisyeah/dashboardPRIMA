import React, { useState } from 'react';
import { 
  Sparkles, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  RotateCw, 
  Copy, 
  Check, 
  FileCheck,
  ShieldAlert
} from 'lucide-react';
import { formatRupiah } from '../utils/reconciliationEngine';

interface AiDeepInspectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  aiAnalysis: any | null;
  error: string | null;
  onReRunAiAudit: () => void;
}

export const AiDeepInspectionModal: React.FC<AiDeepInspectionModalProps> = ({
  isOpen,
  onClose,
  isLoading,
  aiAnalysis,
  error,
  onReRunAiAudit,
}) => {
  const [copiedNotification, setCopiedNotification] = useState(false);

  if (!isOpen) return null;

  const handleCopyDraft = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                Forensik Audit Dokumen dengan Gemini 3.8 Flash
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pemeriksaan semantik mendalam terhadap klausul kontrak, perpajakan UU HPP, dan risiko overbilling
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {isLoading ? (
            <div className="py-16 text-center space-y-3">
              <RotateCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
              <div className="text-sm font-semibold text-slate-900 dark:text-white">
                Gemini AI sedang menganalisis dokumen...
              </div>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Memeriksa silang kuantitas item, tarif PPN, validitas nomor rekening, dan klausul hukum antar dokumen.
              </p>
            </div>
          ) : error ? (
            <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-lg text-xs space-y-2">
              <div className="font-semibold text-rose-800 dark:text-rose-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Pemeriksaan AI Menemukan Kendala</span>
              </div>
              <p className="text-rose-700 dark:text-rose-400 leading-relaxed">
                {error}
              </p>
              <div className="pt-2">
                <button
                  onClick={onReRunAiAudit}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded font-medium transition-colors"
                >
                  Coba Analisis Ulang
                </button>
              </div>
            </div>
          ) : aiAnalysis ? (
            <div className="space-y-5 text-xs">
              {/* Executive Summary */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Ringkasan Eksekutif Hasil Audit
                  </span>
                  <span
                    className={`font-semibold ${
                      aiAnalysis.overallStatus === 'KRITIS'
                        ? 'text-rose-600 dark:text-rose-400'
                        : aiAnalysis.overallStatus === 'PERHATIAN'
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-emerald-600 dark:text-emerald-400'
                    }`}
                  >
                    STATUS: {aiAnalysis.overallStatus}
                  </span>
                </div>
                <p className="text-slate-800 dark:text-slate-200 leading-relaxed text-xs">
                  {aiAnalysis.executiveSummary}
                </p>
              </div>

              {/* AI Discrepancies List */}
              <div>
                <h4 className="font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Daftar Diskrepansi yang Teridentifikasi ({aiAnalysis.discrepancies?.length || 0})
                </h4>

                <div className="space-y-2.5">
                  {(aiAnalysis.discrepancies || []).map((d: any, idx: number) => {
                    const isCrit = d.severity === 'KRITIS';
                    return (
                      <div
                        key={idx}
                        className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 dark:text-white">
                            {d.field}
                          </span>
                          <span
                            className={`font-semibold ${
                              isCrit
                                ? 'text-rose-600 dark:text-rose-400'
                                : 'text-amber-600 dark:text-amber-400'
                            }`}
                          >
                            {d.severity}
                          </span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                          {d.description}
                        </p>
                        {d.recommendedAction && (
                          <div className="pt-1 text-slate-500 dark:text-slate-400 text-[11px] flex items-start gap-1.5">
                            <span className="font-semibold text-indigo-600 dark:text-indigo-400 shrink-0">
                              Solusi:
                            </span>
                            <span>{d.recommendedAction}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Auto-Sync Advice from AI */}
              {aiAnalysis.autoSyncActionPlan && (
                <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800/60 rounded-lg space-y-2">
                  <div className="font-semibold text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span>
                      Rekomendasi Dokumen Acuan: {aiAnalysis.autoSyncActionPlan.recommendedSourceOfTruth}
                    </span>
                  </div>
                  <p className="text-indigo-800 dark:text-indigo-300 leading-relaxed">
                    {aiAnalysis.autoSyncActionPlan.justification}
                  </p>
                </div>
              )}

              {/* Official Notification Draft */}
              {aiAnalysis.officialNotificationDraft && (
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900 dark:text-white">
                      Draf Surat Klarifikasi Vendor Otomatis
                    </span>
                    <button
                      onClick={() =>
                        handleCopyDraft(aiAnalysis.officialNotificationDraft.body)
                      }
                      className="inline-flex items-center gap-1 text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      {copiedNotification ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedNotification ? 'Tersalin' : 'Salin Draf'}</span>
                    </button>
                  </div>
                  <div className="font-medium text-slate-700 dark:text-slate-300">
                    Subjek: {aiAnalysis.officialNotificationDraft.subject}
                  </div>
                  <pre className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded font-mono text-[11px] text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                    {aiAnalysis.officialNotificationDraft.body}
                  </pre>
                </div>
              )}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 text-xs">
              Klik tombol di bawah untuk memulai inspeksi AI mendalam.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-mono">
            Didukung oleh Google Gemini 3.8 Flash SDK Server-Side
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-md transition-colors"
            >
              Tutup
            </button>
            <button
              onClick={onReRunAiAudit}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md shadow-xs transition-colors disabled:opacity-50"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Analisis Ulang AI</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
