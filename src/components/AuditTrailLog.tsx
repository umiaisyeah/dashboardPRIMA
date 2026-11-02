import React from 'react';
import { AuditLogEntry } from '../types/document';
import { History, Shield, CheckCircle2, AlertTriangle, Wand2, Mail } from 'lucide-react';

interface AuditTrailLogProps {
  logs: AuditLogEntry[];
  onClearLogs?: () => void;
}

export const AuditTrailLog: React.FC<AuditTrailLogProps> = ({ logs }) => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <History className="w-4 h-4 text-indigo-500" />
            Jejak Audit &amp; Riwayat Sinkronisasi (Audit Trail)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Log kronologis yang mencatat setiap aksi verifikasi, auto-sync, dan notifikasi peringatan
          </p>
        </div>
        <div className="text-xs text-slate-400 font-mono tabular-nums">
          Total {logs.length} entri terekam
        </div>
      </div>

      <div className="space-y-3">
        {logs.map((log) => {
          let Icon = Shield;
          let iconColor = 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40';

          if (log.action.includes('Auto-Sync')) {
            Icon = Wand2;
            iconColor = 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40';
          } else if (log.action.includes('Peringatan') || log.action.includes('Kritis')) {
            Icon = AlertTriangle;
            iconColor = 'text-rose-500 bg-rose-50 dark:bg-rose-950/40';
          } else if (log.action.includes('Notifikasi') || log.action.includes('Kirim')) {
            Icon = Mail;
            iconColor = 'text-amber-500 bg-amber-50 dark:bg-amber-950/40';
          }

          return (
            <div
              key={log.id}
              className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200 dark:border-slate-800/80 text-xs flex items-start gap-3"
            >
              <div className={`p-1.5 rounded-md shrink-0 ${iconColor}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {log.action}
                  </span>
                  <span className="font-mono tabular-nums text-slate-400 text-[11px] shrink-0">
                    {log.timestamp}
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                  {log.details}
                </p>
                <div className="mt-1 text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                  Operator: {log.operator}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
