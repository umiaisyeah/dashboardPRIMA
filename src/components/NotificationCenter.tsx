import React, { useState } from 'react';
import { 
  NotificationAlert, 
  ToleranceConfig, 
  DiscrepancyItem 
} from '../types/document';
import { 
  Bell, 
  AlertTriangle, 
  CheckCircle2, 
  Send, 
  Sliders, 
  Mail, 
  Webhook, 
  Check, 
  Volume2, 
  VolumeX,
  FileWarning
} from 'lucide-react';
import { formatRupiah } from '../utils/reconciliationEngine';

interface NotificationCenterProps {
  alerts: NotificationAlert[];
  toleranceConfig: ToleranceConfig;
  onUpdateTolerance: (config: ToleranceConfig) => void;
  onMarkAllAsRead: () => void;
  onSendCustomNotification: (channel: string, recipient: string, subject: string, body: string, severity: string) => Promise<boolean>;
  selectedDiscrepancyForAlert?: DiscrepancyItem | null;
  onCloseDiscrepancyAlertModal?: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  alerts,
  toleranceConfig,
  onUpdateTolerance,
  onMarkAllAsRead,
  onSendCustomNotification,
  selectedDiscrepancyForAlert,
  onCloseDiscrepancyAlertModal,
}) => {
  const [activeTab, setActiveTab] = useState<'feed' | 'settings' | 'dispatch'>('feed');
  const [filterSeverity, setFilterSeverity] = useState<'ALL' | 'KRITIS' | 'SEDANG'>('ALL');

  // Dispatch Form State
  const [targetChannel, setTargetChannel] = useState<'EMAIL' | 'WEBHOOK'>('EMAIL');
  const [recipientInput, setRecipientInput] = useState('finance-controller@wijayabangunan.id');
  const [subjectInput, setSubjectInput] = useState(
    'PERINGATAN AUDIT: Penemuan Diskrepansi Signifikan pada Dokumen Tagihan'
  );
  const [memoBodyInput, setMemoBodyInput] = useState(
    `Kepada Yth. Bagian Keuangan / Pihak Vendor Terkait,

Berdasarkan hasil verifikasi silang otomatis sistem DocuSync, ditemukan perbedaan data yang signifikan antara dokumen yang diajukan dengan acuan verifikasi fisik:
- Kategori Temuan: Selisih Kuantitas Barang & Overbilling
- Status Tagihan: DITAHAN SEMENTARA (PAYMENT ON HOLD)
- Permintaan Tindakan: Mohon lakukan revisi Faktur Tagihan atau terbitkan Nota Debet/Kredit dalam waktu maksimal 3x24 jam kerja.

Demikian pemberitahuan ini disampaikan untuk mencegah kesalahan penyaluran dana.

Hormat kami,
Divisi Audit & Pengendalian Keuangan Internal`
  );
  const [isSending, setIsSending] = useState(false);
  const [sendSuccessMsg, setSendSuccessMsg] = useState<string | null>(null);

  const filteredAlerts = alerts.filter((a) => {
    if (filterSeverity !== 'ALL' && a.severity !== filterSeverity) return false;
    return true;
  });

  const unreadCount = alerts.filter((a) => !a.isRead).length;

  const handleDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setSendSuccessMsg(null);

    const success = await onSendCustomNotification(
      targetChannel,
      recipientInput,
      subjectInput,
      memoBodyInput,
      'KRITIS'
    );

    setIsSending(false);
    if (success) {
      setSendSuccessMsg(`Notifikasi berhasil dipancarkan ke ${recipientInput}`);
      setTimeout(() => setSendSuccessMsg(null), 5000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Notification Nav / Tab Switcher */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Bell className="w-4 h-4 text-indigo-500" />
            Pusat Peringatan &amp; Notifikasi Diskrepansi
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Monitoring perbedaan data kritis, pengaturan ambang batas toleransi, dan dispatch peringatan otomatis
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg shrink-0">
          <button
            onClick={() => setActiveTab('feed')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'feed'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Riwayat Peringatan ({alerts.length})
          </button>
          <button
            onClick={() => setActiveTab('dispatch')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'dispatch'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Kirim Memo Peringatan
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'settings'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Ambang Batas Toleransi
          </button>
        </div>
      </div>

      {/* Tab 1: Alert Feed */}
      {activeTab === 'feed' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilterSeverity('ALL')}
                className={`text-xs px-2.5 py-1 rounded-md transition-colors ${
                  filterSeverity === 'ALL'
                    ? 'bg-slate-200 dark:bg-slate-700 font-semibold text-slate-900 dark:text-white'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Semua
              </button>
              <button
                onClick={() => setFilterSeverity('KRITIS')}
                className={`text-xs px-2.5 py-1 rounded-md transition-colors ${
                  filterSeverity === 'KRITIS'
                    ? 'bg-rose-100 dark:bg-rose-950/60 font-semibold text-rose-700 dark:text-rose-300'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Hanya Kritis
              </button>
              <button
                onClick={() => setFilterSeverity('SEDANG')}
                className={`text-xs px-2.5 py-1 rounded-md transition-colors ${
                  filterSeverity === 'SEDANG'
                    ? 'bg-amber-100 dark:bg-amber-950/60 font-semibold text-amber-700 dark:text-amber-300'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Perhatian
              </button>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={onMarkAllAsRead}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
              >
                Tandai semua telah dibaca
              </button>
            )}
          </div>

          <div className="space-y-2.5">
            {filteredAlerts.length > 0 ? (
              filteredAlerts.map((alert) => {
                const isCrit = alert.severity === 'KRITIS';
                return (
                  <div
                    key={alert.id}
                    className={`p-4 rounded-lg border transition-all ${
                      alert.isRead
                        ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-80'
                        : isCrit
                        ? 'bg-white dark:bg-slate-900 border-rose-300 dark:border-rose-900/60 shadow-xs'
                        : 'bg-white dark:bg-slate-900 border-amber-300 dark:border-amber-900/60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div
                          className={`mt-0.5 p-1.5 rounded-md shrink-0 ${
                            isCrit
                              ? 'bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400'
                              : 'bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400'
                          }`}
                        >
                          <AlertTriangle className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap text-xs">
                            <span
                              className={`font-semibold ${
                                isCrit
                                  ? 'text-rose-600 dark:text-rose-400'
                                  : 'text-amber-600 dark:text-amber-400'
                              }`}
                            >
                              {isCrit ? 'PERINGATAN KRITIS' : 'PERINGATAN MODERAT'}
                            </span>
                            <span aria-hidden="true" className="text-slate-400">·</span>
                            <span className="font-mono text-slate-400 dark:text-slate-500">
                              {alert.timestamp}
                            </span>
                            {alert.docRef && (
                              <>
                                <span aria-hidden="true" className="text-slate-400">·</span>
                                <span className="text-slate-500 dark:text-slate-400 font-medium">
                                  Ref: {alert.docRef}
                                </span>
                              </>
                            )}
                          </div>

                          <h4 className="text-sm font-semibold text-slate-900 dark:text-white mt-1">
                            {alert.title}
                          </h4>

                          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed max-w-3xl">
                            {alert.message}
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSubjectInput(`PERINGATAN AUDIT: ${alert.title}`);
                            setActiveTab('dispatch');
                          }}
                          className="px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors whitespace-nowrap"
                        >
                          Tindaklanjuti
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-10 text-center text-xs text-slate-400">
                Tidak ada notifikasi peringatan pada filter ini.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Dispatch Memo Peringatan */}
      {activeTab === 'dispatch' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6">
          <div className="max-w-2xl space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Kirim Surat / Notifikasi Klarifikasi Diskrepansi
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Kirim pemberitahuan resmi instan ke Finance Controller, Vendor, atau Webhook ERP agar pembayaran ditahan sementara
              </p>
            </div>

            {sendSuccessMsg && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-md text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{sendSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleDispatch} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Kanal Pengiriman
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setTargetChannel('EMAIL')}
                      className={`flex-1 py-1.5 px-3 rounded-md border text-center transition-colors flex items-center justify-center gap-1.5 ${
                        targetChannel === 'EMAIL'
                          ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-semibold'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Email Resmi</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setTargetChannel('WEBHOOK')}
                      className={`flex-1 py-1.5 px-3 rounded-md border text-center transition-colors flex items-center justify-center gap-1.5 ${
                        targetChannel === 'WEBHOOK'
                          ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-semibold'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      <Webhook className="w-3.5 h-3.5" />
                      <span>Webhook ERP / Slack</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    {targetChannel === 'EMAIL' ? 'Alamat Email Penerima' : 'Webhook Endpoint URL'}
                  </label>
                  <input
                    type="text"
                    required
                    value={recipientInput}
                    onChange={(e) => setRecipientInput(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Subjek Peringatan
                </label>
                <input
                  type="text"
                  required
                  value={subjectInput}
                  onChange={(e) => setSubjectInput(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Isi Memo / Klarifikasi Temuan
                </label>
                <textarea
                  rows={7}
                  required
                  value={memoBodyInput}
                  onChange={(e) => setMemoBodyInput(e.target.value)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md font-mono text-xs text-slate-900 dark:text-white leading-relaxed"
                />
              </div>

              <div className="pt-2 flex items-center justify-end">
                <button
                  type="submit"
                  disabled={isSending}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md shadow-xs transition-colors disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSending ? 'Mengirim...' : 'Kirim Peringatan Sekarang'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tab 3: Tolerance Settings */}
      {activeTab === 'settings' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6">
          <div className="max-w-xl space-y-5 text-xs">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-500" />
                Konfigurasi Ambang Batas Toleransi & Peringatan
              </h3>
              <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                Tentukan batas di mana selisih data dianggap wajar atau memicu status KRITIS secara otomatis
              </p>
            </div>

            <div className="space-y-4 pt-2">
              {/* Nominal tolerance */}
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Ambang Batas Toleransi Nominal (Rupiah)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="0"
                    step="5000"
                    value={toleranceConfig.nominal}
                    onChange={(e) =>
                      onUpdateTolerance({
                        ...toleranceConfig,
                        nominal: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-48 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md font-mono text-slate-900 dark:text-white"
                  />
                  <span className="text-slate-500 dark:text-slate-400">
                    Nilai saat ini: {formatRupiah(toleranceConfig.nominal)}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Selisih nominal di atas angka ini akan langsung diklasifikasikan sebagai temuan audit.
                </p>
              </div>

              {/* Percentage tolerance */}
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Toleransi Persentase Selisih (%)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={toleranceConfig.percentage}
                    onChange={(e) =>
                      onUpdateTolerance({
                        ...toleranceConfig,
                        percentage: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-32 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md font-mono text-slate-900 dark:text-white"
                  />
                  <span className="text-slate-500 dark:text-slate-400">% selisih</span>
                </div>
              </div>

              {/* Auto Hold Toggle */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={toleranceConfig.autoHoldOnCritical}
                    onChange={(e) =>
                      onUpdateTolerance({
                        ...toleranceConfig,
                        autoHoldOnCritical: e.target.checked,
                      })
                    }
                    className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      Otomatis Kunci / Tahan Status Pembayaran (Auto-Hold)
                    </span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Bila diaktifkan, setiap kali terdeteksi selisih KRITIS (misal overbilling atau rekening beda), sistem otomatis memblokir persetujuan pembayaran di ERP.
                    </p>
                  </div>
                </label>
              </div>

              {/* Sound alert chime toggle */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={toleranceConfig.soundEnabled}
                    onChange={(e) =>
                      onUpdateTolerance({
                        ...toleranceConfig,
                        soundEnabled: e.target.checked,
                      })
                    }
                    className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div className="flex items-center gap-1.5">
                    {toleranceConfig.soundEnabled ? (
                      <Volume2 className="w-4 h-4 text-indigo-500" />
                    ) : (
                      <VolumeX className="w-4 h-4 text-slate-400" />
                    )}
                    <span className="font-semibold text-slate-900 dark:text-white">
                      Bunyikan Nada Peringatan Saat Ditemukan Selisih Kritis
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
