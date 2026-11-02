import React from 'react';
import { 
  FileStack, 
  AlertTriangle, 
  CheckCircle2, 
  Ban, 
  Coins 
} from 'lucide-react';
import { formatRupiah } from '../utils/reconciliationEngine';

interface StatRibbonProps {
  totalDocuments: number;
  totalFinancialDiscrepancy: number;
  overallStatus: 'KRITIS' | 'PERHATIAN' | 'SINKRON_PENUH';
  criticalCount: number;
  warningCount: number;
  requiresHold: boolean;
  onViewDiscrepancies: () => void;
  onOpenAutoSync: () => void;
}

export const StatRibbon: React.FC<StatRibbonProps> = ({
  totalDocuments,
  totalFinancialDiscrepancy,
  overallStatus,
  criticalCount,
  warningCount,
  requiresHold,
  onViewDiscrepancies,
  onOpenAutoSync,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* 1. Total Documents Connected */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
          <span className="text-xs font-medium">Dokumen Terkoneksi</span>
          <FileStack className="w-4 h-4 text-slate-400" />
        </div>
        <div className="mt-2">
          <span className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
            {totalDocuments}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 ml-1.5">berkas</span>
        </div>
        <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          Klaster perbandingan aktif
        </div>
      </div>

      {/* 2. Total Financial Discrepancy */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
          <span className="text-xs font-medium">Selisih Nominal Terdeteksi</span>
          <Coins className="w-4 h-4 text-amber-500" />
        </div>
        <div className="mt-2">
          <span
            className={`text-xl font-bold font-mono tabular-nums ${
              totalFinancialDiscrepancy > 0
                ? 'text-rose-600 dark:text-rose-400'
                : 'text-emerald-600 dark:text-emerald-400'
            }`}
          >
            {formatRupiah(totalFinancialDiscrepancy)}
          </span>
        </div>
        <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
          <span>Potensi overcharge / rugi</span>
          {totalFinancialDiscrepancy > 0 && (
            <button
              onClick={onOpenAutoSync}
              className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
            >
              Koreksi &rarr;
            </button>
          )}
        </div>
      </div>

      {/* 3. Status Rekonsiliasi */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
          <span className="text-xs font-medium">Status Sinkronisasi</span>
          {overallStatus === 'SINKRON_PENUH' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          )}
        </div>
        <div className="mt-2">
          {overallStatus === 'KRITIS' && (
            <span className="text-lg font-bold text-rose-600 dark:text-rose-400">
              Perbedaan Kritis
            </span>
          )}
          {overallStatus === 'PERHATIAN' && (
            <span className="text-lg font-bold text-amber-600 dark:text-amber-400">
              Perlu Perhatian
            </span>
          )}
          {overallStatus === 'SINKRON_PENUH' && (
            <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
              100% Selaras
            </span>
          )}
        </div>
        <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <span>{criticalCount} kritis</span>
          <span aria-hidden="true">·</span>
          <span>{warningCount} peringatan</span>
        </div>
      </div>

      {/* 4. Rekomendasi Hold / Approval Gate */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
          <span className="text-xs font-medium">Proteksi Pembayaran</span>
          <Ban className={`w-4 h-4 ${requiresHold ? 'text-rose-500' : 'text-slate-400'}`} />
        </div>
        <div className="mt-2">
          <span
            className={`text-lg font-bold ${
              requiresHold
                ? 'text-rose-600 dark:text-rose-400'
                : 'text-slate-700 dark:text-slate-200'
            }`}
          >
            {requiresHold ? 'HOLD PAYMENT' : 'Siap Disetujui'}
          </span>
        </div>
        <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          {requiresHold
            ? 'Otomatis tahan approval dana'
            : 'Dokumen memenuhi audit'}
        </div>
      </div>

      {/* 5. Tindakan Cepat */}
      <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-lg p-4 flex flex-col justify-between">
        <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
          Tindakan Langsung
        </div>
        <div className="mt-2 flex flex-col gap-1.5">
          <button
            onClick={onViewDiscrepancies}
            className="w-full text-left text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 py-1 transition-colors"
          >
            Periksa {criticalCount + warningCount} temuan detail &rarr;
          </button>
          <button
            onClick={onOpenAutoSync}
            className="w-full text-left text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white py-1 transition-colors"
          >
            Jalankan Rekonsiliasi Otomatis &rarr;
          </button>
        </div>
      </div>
    </div>
  );
};
