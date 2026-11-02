import React from 'react';
import { 
  AutoSyncPlan, 
  AuditDocument 
} from '../types/document';
import { 
  Wand2, 
  Check, 
  X, 
  ArrowRight, 
  ShieldCheck, 
  FileText,
  AlertCircle
} from 'lucide-react';
import { formatRupiah } from '../utils/reconciliationEngine';

interface AutoSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: AutoSyncPlan;
  documents: AuditDocument[];
  onApplySync: () => void;
}

export const AutoSyncModal: React.FC<AutoSyncModalProps> = ({
  isOpen,
  onClose,
  plan,
  documents,
  onApplySync,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
              <Wand2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                Sinkronisasi Otomatis (Auto-Sync)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Menyelaraskan data multi-dokumen secara otomatis dengan Acuan Kebenaran
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
          {/* Source of Truth banner */}
          <div className="p-3.5 bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800/60 rounded-lg text-xs">
            <div className="font-semibold text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5 mb-1">
              <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Acuan Kebenaran (Source of Truth): {plan.sourceOfTruthTitle}</span>
            </div>
            <p className="text-indigo-700 dark:text-indigo-300 leading-relaxed">
              {plan.summary}
            </p>
          </div>

          {/* Planned Adjustments list */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
              Daftar Penyesuaian Otomatis ({plan.adjustments.length} Atribut)
            </h4>

            {plan.adjustments.length > 0 ? (
              <div className="space-y-2.5">
                {plan.adjustments.map((adj, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-lg text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                      <span className="font-medium text-slate-700 dark:text-slate-200">
                        {adj.targetDocTitle}
                      </span>
                      <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                        {adj.field}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 font-mono tabular-nums text-xs">
                      <span className="line-through text-rose-500 dark:text-rose-400">
                        {String(adj.originalValue)}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {String(adj.correctedValue)}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      {adj.note}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-lg text-center text-xs text-slate-500">
                Semua dokumen sudah berada dalam kondisi selaras. Tidak diperlukan penyesuaian lanjutan.
              </div>
            )}
          </div>

          {/* Financial Correction Impact */}
          {plan.financialAdjustmentAmount > 0 && (
            <div className="p-3.5 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 rounded-lg text-xs flex items-center justify-between">
              <div>
                <span className="font-semibold text-amber-900 dark:text-amber-200">
                  Potensi Penghematan / Koreksi Tagihan:
                </span>
                <p className="text-amber-700 dark:text-amber-300 text-[11px] mt-0.5">
                  Diterbitkan sebagai Nota Debet / Pengurangan Faktur Vendor
                </p>
              </div>
              <span className="text-base font-bold font-mono tabular-nums text-amber-600 dark:text-amber-400">
                {formatRupiah(plan.financialAdjustmentAmount)}
              </span>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-md transition-colors"
          >
            Batal
          </button>
          <button
            onClick={() => {
              onApplySync();
              onClose();
            }}
            disabled={plan.adjustments.length === 0}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md shadow-xs transition-colors disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            <span>Terapkan Sinkronisasi Sekarang</span>
          </button>
        </div>
      </div>
    </div>
  );
};
