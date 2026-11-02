import React, { useState, useEffect } from 'react';
import {
  Database,
  Cloud,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Copy,
  ExternalLink,
  UploadCloud,
  DownloadCloud,
  X,
  ShieldCheck,
  Server,
  Zap,
} from 'lucide-react';
import {
  checkSupabaseHealth,
  SupabaseHealth,
  SUPABASE_SETUP_SQL,
  syncAllPackagesToSupabase,
  fetchPackagesFromSupabase,
  SUPABASE_URL,
} from '../services/supabaseService';
import { DocumentPackage } from '../types';

interface SupabaseSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  localPackages: DocumentPackage[];
  onPackagesUpdated: (packages: DocumentPackage[]) => void;
  autoSync: boolean;
  onToggleAutoSync: (enabled: boolean) => void;
}

export const SupabaseSyncModal: React.FC<SupabaseSyncModalProps> = ({
  isOpen,
  onClose,
  localPackages,
  onPackagesUpdated,
  autoSync,
  onToggleAutoSync,
}) => {
  const [health, setHealth] = useState<SupabaseHealth | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [syncMessage, setSyncMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const runHealthCheck = async () => {
    setIsChecking(true);
    setSyncMessage(null);
    try {
      const res = await checkSupabaseHealth();
      setHealth(res);
    } catch (e: any) {
      setHealth({
        connected: false,
        latencyMs: 0,
        tableReady: false,
        error: e.message || 'Gagal memeriksa koneksi',
        url: SUPABASE_URL,
        projectId: 'fiowsnbkottymnparejs',
      });
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      runHealthCheck();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SETUP_SQL);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handlePushToCloud = async () => {
    setIsSyncing(true);
    setSyncMessage(null);
    const res = await syncAllPackagesToSupabase(localPackages);
    setIsSyncing(false);

    if (res.success) {
      setSyncMessage({
        type: 'success',
        text: `Berhasil mengunggah ${res.count} paket dokumen ke Supabase Cloud!`,
      });
      runHealthCheck();
    } else {
      setSyncMessage({
        type: 'error',
        text: res.error || 'Gagal mengunggah paket ke Supabase.',
      });
    }
  };

  const handlePullFromCloud = async () => {
    setIsSyncing(true);
    setSyncMessage(null);
    const res = await fetchPackagesFromSupabase();
    setIsSyncing(false);

    if (res.success) {
      if (res.packages.length > 0) {
        onPackagesUpdated(res.packages);
        setSyncMessage({
          type: 'success',
          text: `Berhasil memuat ${res.packages.length} paket dokumen dari Supabase Cloud!`,
        });
      } else {
        setSyncMessage({
          type: 'success',
          text: 'Tabel di Supabase masih kosong. Silakan gunakan tombol Upload untuk mengirim data lokal.',
        });
      }
      runHealthCheck();
    } else {
      setSyncMessage({
        type: 'error',
        text: res.error || 'Gagal memuat paket dari Supabase.',
      });
    }
  };

  const sqlEditorUrl = `https://supabase.com/dashboard/project/${health?.projectId || 'fiowsnbkottymnparejs'}/sql/new`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-emerald-500/10 via-transparent to-blue-500/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Supabase Cloud Database
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  PostgreSQL Cloud
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Sinkronisasi paket verifikasi, BAPL opname, dan RAB secara realtime ke cloud database
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs leading-relaxed">
          {/* Status Bar */}
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Endpoint:</span>
                <code className="px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
                  {SUPABASE_URL}
                </code>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
                <span>Project ID: <strong className="text-slate-700 dark:text-slate-300 font-mono">{health?.projectId}</strong></span>
                {health?.latencyMs !== undefined && (
                  <>
                    <span>·</span>
                    <span className="flex items-center gap-1 font-mono">
                      <Zap className="w-3 h-3 text-amber-500" />
                      {health.latencyMs} ms
                    </span>
                  </>
                )}
              </div>
            </div>

            <button
              onClick={runHealthCheck}
              disabled={isChecking}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shrink-0 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin text-emerald-500' : ''}`} />
              <span>{isChecking ? 'Memeriksa...' : 'Cek Koneksi'}</span>
            </button>
          </div>

          {/* Connection & Table Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-start gap-3">
              <div
                className={`p-2 rounded-lg shrink-0 ${
                  health?.connected
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400'
                    : 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400'
                }`}
              >
                {health?.connected ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
              </div>
              <div>
                <span className="font-semibold text-slate-900 dark:text-white block">Status Koneksi API</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  {health?.connected ? 'Terhubung ke Supabase Cloud REST Gateway' : health?.error || 'Tidak terhubung'}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-start gap-3">
              <div
                className={`p-2 rounded-lg shrink-0 ${
                  health?.tableReady
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400'
                    : 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400'
                }`}
              >
                {health?.tableReady ? <Server className="w-4 h-4" /> : <Database className="w-4 h-4" />}
              </div>
              <div>
                <span className="font-semibold text-slate-900 dark:text-white block">Tabel document_packages</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  {health?.tableReady ? 'Tabel Siap di Database' : 'Tabel belum ada (jalankan skema SQL)'}
                </span>
              </div>
            </div>
          </div>

          {/* Success / Error Message Banner */}
          {syncMessage && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                syncMessage.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-800'
              }`}
            >
              {syncMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{syncMessage.text}</span>
            </div>
          )}

          {/* Case 1: Table is Ready -> Show Sync Actions */}
          {health?.tableReady ? (
            <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/40 dark:bg-emerald-950/20 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-emerald-950 dark:text-emerald-200 text-xs flex items-center gap-1.5">
                    <Cloud className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Sinkronisasi Data Realtime</span>
                  </h4>
                  <p className="text-[11px] text-emerald-800 dark:text-emerald-300 mt-0.5">
                    Data lokal: <strong>{localPackages.length} paket</strong>
                  </p>
                </div>

                <label className="flex items-center gap-2 cursor-pointer text-[11px] font-medium text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={autoSync}
                    onChange={(e) => onToggleAutoSync(e.target.checked)}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Auto-Sync Otomatis</span>
                </label>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                <button
                  onClick={handlePushToCloud}
                  disabled={isSyncing}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-xs disabled:opacity-50"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>{isSyncing ? 'Mengunggah...' : `Upload Semua (${localPackages.length}) ke Cloud`}</span>
                </button>

                <button
                  onClick={handlePullFromCloud}
                  disabled={isSyncing}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                >
                  <DownloadCloud className="w-4 h-4" />
                  <span>{isSyncing ? 'Memuat...' : 'Tarik Data dari Cloud ke Lokal'}</span>
                </button>
              </div>
            </div>
          ) : (
            /* Case 2: Table is Not Ready -> Show Guided SQL Script Instructions */
            <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-800/60 bg-amber-50/40 dark:bg-amber-950/20 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <h4 className="font-bold text-amber-950 dark:text-amber-200 text-xs flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                    <span>Langkah Mudah: Buat Tabel Dokumen di Supabase</span>
                  </h4>
                  <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
                    Agar data paket dokumen dan BAPL tersimpan secara permanen di cloud, jalankan skrip SQL berikut sekali saja di <strong>Supabase SQL Editor</strong> Anda:
                  </p>
                </div>

                <a
                  href={sqlEditorUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shrink-0"
                >
                  <span>Buka SQL Editor</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Code Box */}
              <div className="relative rounded-lg bg-slate-900 border border-slate-800 p-3 overflow-x-auto">
                <button
                  onClick={handleCopySql}
                  className="absolute top-2.5 right-2.5 inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] font-semibold text-emerald-400 border border-slate-700 transition-colors shadow-xs"
                >
                  {copiedSql ? <CheckCircle2 className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedSql ? 'Tersalin!' : 'Salin SQL'}</span>
                </button>
                <pre className="text-[10px] font-mono text-slate-300 leading-relaxed pt-1 pr-20">
                  {SUPABASE_SETUP_SQL}
                </pre>
              </div>

              <div className="flex items-center justify-between text-[11px] text-amber-900 dark:text-amber-200 pt-1">
                <span>Setelah klik 'Run' di Supabase SQL Editor:</span>
                <button
                  onClick={runHealthCheck}
                  disabled={isChecking}
                  className="px-3 py-1 rounded-lg bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700 font-bold hover:bg-amber-100 transition-colors text-amber-900 dark:text-amber-200"
                >
                  {isChecking ? 'Mengecek...' : 'Verifikasi Tabel Sudah Aktif'}
                </button>
              </div>
            </div>
          )}

          {/* Privacy & Security Note */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong>Penyimpanan Aman &amp; Terenkripsi:</strong> Kunci API Supabase menggunakan Anon Public Key dengan Row Level Security (RLS) terpasang. Seluruh data hasil verifikasi BAPL, DED, dan RAB dilindungi serta dicadangkan di server Supabase PostgreSQL.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 flex items-center justify-between text-xs">
          <span className="text-[11px] text-slate-400 font-mono">
            Supabase Project fiowsnbkottymnparejs
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl font-bold text-white bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
