import React, { useState, useRef } from 'react';
import {
  Layers,
  FileText,
  FileSpreadsheet,
  Files,
  CheckCircle2,
  AlertCircle,
  Clock,
  Trash2,
  Download,
  Plus,
  ChevronDown,
  ChevronUp,
  FolderSync,
  Pencil,
  Check,
  X,
  UploadCloud,
  ShieldCheck,
  Cloud,
  Search,
} from 'lucide-react';
import { DocumentPackage } from '../types';
import { downloadVerificationExcel } from '../services/excelGenerator';

interface DocumentPackageBarProps {
  packages: DocumentPackage[];
  activePackageId: string;
  onSelectPackage: (packageId: string) => void;
  onDeletePackage: (packageId: string) => void;
  onAddNewPackage: () => void;
  onRequestDeletePackage?: (pkg: DocumentPackage) => void;
  onRenamePackage?: (packageId: string, newTitle: string) => void;
  onExportBackup?: () => void;
  onImportBackup?: (file: File) => void;
  onOpenGoogleDrive?: () => void;
  isGoogleDriveConnected?: boolean;
}

export const DocumentPackageBar: React.FC<DocumentPackageBarProps> = ({
  packages,
  activePackageId,
  onSelectPackage,
  onDeletePackage,
  onAddNewPackage,
  onRequestDeletePackage,
  onRenamePackage,
  onExportBackup,
  onImportBackup,
  onOpenGoogleDrive,
  isGoogleDriveConnected,
}) => {
  const [expandedDetails, setExpandedDetails] = useState<boolean>(false);
  const [editingPackageId, setEditingPackageId] = useState<string | null>(null);
  const [editTitleValue, setEditTitleValue] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const importFileInputRef = useRef<HTMLInputElement>(null);

  const handleStartRename = (pkg: DocumentPackage, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingPackageId(pkg.id);
    setEditTitleValue(pkg.title);
  };

  const handleSaveRename = (pkgId: string, e?: React.MouseEvent | React.FormEvent) => {
    if (e) e.stopPropagation();
    if (editTitleValue.trim() && onRenamePackage) {
      onRenamePackage(pkgId, editTitleValue.trim());
    }
    setEditingPackageId(null);
  };

  const handleCancelRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingPackageId(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImportBackup) {
      onImportBackup(file);
    }
    e.target.value = '';
  };

  const activePackage =
    packages.find((p) => p.id === activePackageId) || packages[0];

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Filter packages based on user search
  const filteredPackages = packages.filter((pkg) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      pkg.title.toLowerCase().includes(q) ||
      (pkg.projectCode && pkg.projectCode.toLowerCase().includes(q)) ||
      (pkg.projectName && pkg.projectName.toLowerCase().includes(q)) ||
      (pkg.result?.project?.projectName && pkg.result.project.projectName.toLowerCase().includes(q)) ||
      (pkg.result?.project?.contractNumber && pkg.result.project.contractNumber.toLowerCase().includes(q))
    );
  });

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-4 sm:p-5 space-y-4 transition-colors">
      {/* Top Header Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#0054a6] to-[#00aded] text-white flex items-center justify-center shadow-xs shrink-0">
            <FolderSync className="w-4 h-4" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                Daftar Pasangan Dokumen Terverifikasi PRIMA
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/70 text-blue-800 dark:text-cyan-300 border border-blue-200 dark:border-blue-800">
                {packages.length} Pasangan Terdaftar
              </span>
              <span
                title="Semua paket dokumen yang Anda unggah tersimpan permanen di memori browser (IndexedDB)."
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
              >
                <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                <span>Penyimpanan Permanen Aktif</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Setiap pasangan dokumen tersimpan permanen di memori database browser dan siap diaudit.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Hidden File Input for JSON Backup Import */}
          <input
            type="file"
            ref={importFileInputRef}
            onChange={handleFileChange}
            accept=".json,application/json"
            className="hidden"
          />

          {onExportBackup && packages.length > 0 && (
            <button
              id="btn-export-packages-backup"
              type="button"
              onClick={onExportBackup}
              title="Cadangkan seluruh paket yang terdaftar ke file JSON"
              className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span>Cadangkan (JSON)</span>
            </button>
          )}

          {onImportBackup && (
            <button
              id="btn-import-packages-backup"
              type="button"
              onClick={() => importFileInputRef.current?.click()}
              title="Pulihkan paket dokumen dari file cadangan JSON"
              className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
            >
              <UploadCloud className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span>Pulihkan (JSON)</span>
            </button>
          )}

          {onOpenGoogleDrive && (
            <button
              id="btn-packagebar-google-drive"
              type="button"
              onClick={onOpenGoogleDrive}
              title="Kelola sinkronisasi Google Drive untuk paket dokumen"
              className={`inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                isGoogleDriveConnected
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/60'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
              }`}
            >
              <Cloud className={`w-3.5 h-3.5 ${isGoogleDriveConnected ? 'text-emerald-600 dark:text-emerald-400' : 'text-blue-600 dark:text-[#00aded]'}`} />
              <span>{isGoogleDriveConnected ? 'Google Drive Aktif' : 'Google Drive'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setExpandedDetails(!expandedDetails)}
            className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
          >
            <span>Rincian File</span>
            {expandedDetails ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>

          <button
            id="btn-add-new-package"
            type="button"
            onClick={onAddNewPackage}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#0054a6] to-[#00aded] hover:opacity-95 shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Upload Pasangan Baru</span>
          </button>
        </div>
      </div>

      {/* Search Bar Row for Document Packages */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari pasangan dokumen (nama proyek, kode)..."
            className="w-full pl-8 pr-7 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00aded] transition-colors"
          />
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              ✕
            </button>
          )}
        </div>

        {searchQuery && (
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Ditemukan <strong>{filteredPackages.length}</strong> dari {packages.length} pasangan dokumen
          </span>
        )}
      </div>

      {/* Package Cards List */}
      {filteredPackages.length === 0 ? (
        <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Tidak ditemukan pasangan dokumen dengan kata kunci &ldquo;{searchQuery}&rdquo;.
          </p>
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="text-xs font-semibold text-blue-600 dark:text-[#00aded] hover:underline mt-1 inline-block cursor-pointer"
          >
            Tampilkan Semua Dokumen
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredPackages.map((pkg, idx) => {
            const isActive = pkg.id === activePackageId;
            const deltaPct = pkg.result.total_rab.system_calculated_percentage * 100;
            const withinThreshold = !pkg.result.total_rab.threshold_exceeded;

            return (
              <div
                key={pkg.id}
                onClick={() => onSelectPackage(pkg.id)}
                className={`cursor-pointer rounded-xl border p-3.5 transition-all flex flex-col justify-between relative group ${
                  isActive
                    ? 'border-[#0054a6] dark:border-cyan-400 bg-blue-50/40 dark:bg-blue-950/40 shadow-xs ring-2 ring-blue-500/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50/60 dark:hover:bg-slate-800/80'
                }`}
              >
                <div>
                  {/* Status & Package Label */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isActive
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        Program {idx + 1}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                        {pkg.projectCode || 'PROYEK'}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      {withinThreshold ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                          <CheckCircle2 className="w-3 h-3" />
                          10% OK
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 px-1.5 py-0.5 rounded border border-rose-200 dark:border-rose-800">
                          <AlertCircle className="w-3 h-3" />
                          &gt; 10%
                        </span>
                      )}

                      {/* Delete button */}
                      <button
                        id={`btn-delete-pkg-${pkg.id}`}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onRequestDeletePackage) {
                            onRequestDeletePackage(pkg);
                          } else {
                            onDeletePackage(pkg.id);
                          }
                        }}
                        className="p-1 rounded text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                        title={`Hapus paket ${pkg.projectCode || ''}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Title & In-place Rename */}
                  {editingPackageId === pkg.id ? (
                    <div
                      className="mb-2 flex items-center gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        id={`input-rename-pkg-${pkg.id}`}
                        type="text"
                        value={editTitleValue}
                        onChange={(e) => setEditTitleValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveRename(pkg.id, e);
                          if (e.key === 'Escape') handleCancelRename(e as any);
                        }}
                        autoFocus
                        className="w-full text-xs font-semibold px-2 py-1 rounded border border-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-2xs"
                      />
                      <button
                        type="button"
                        onClick={(e) => handleSaveRename(pkg.id, e)}
                        className="p-1 rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors cursor-pointer"
                        title="Simpan Nama Paket"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelRename}
                        className="p-1 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors cursor-pointer"
                        title="Batal"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-1 mb-2 group/title">
                      <h3
                        className={`text-xs font-bold truncate flex-1 ${
                          isActive
                            ? 'text-blue-950 dark:text-cyan-200'
                            : 'text-slate-800 dark:text-slate-100'
                        }`}
                        title={pkg.title}
                      >
                        {pkg.title}
                      </h3>
                      <button
                        id={`btn-edit-title-pkg-${pkg.id}`}
                        type="button"
                        onClick={(e) => handleStartRename(pkg, e)}
                        className="opacity-0 group-hover/title:opacity-100 p-1 rounded text-slate-400 hover:text-blue-600 dark:hover:text-[#00aded] hover:bg-blue-50 dark:hover:bg-slate-800 transition-opacity cursor-pointer"
                        title="Ubah Nama / Label Paket Ini"
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  {/* Composition badges: BAPL, Excel, Pendukung */}
                  <div className="flex flex-wrap items-center gap-1.5 text-[10px] mb-3">
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-cyan-300 border border-blue-200 dark:border-blue-800 font-medium">
                      <FileText className="w-3 h-3" />
                      {pkg.baplFiles.length} BAPL
                    </span>
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-medium">
                      <FileSpreadsheet className="w-3 h-3" />
                      JusTek &amp; JusFin
                    </span>
                    {pkg.supportingFiles.length > 0 && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-purple-50 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800 font-medium">
                        <Files className="w-3 h-3" />
                        {pkg.supportingFiles.length} Pendukung
                      </span>
                    )}
                  </div>
                </div>

                {/* Bottom Row: Financial Delta & Select/Download Action */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-400 block leading-tight">
                      RAB Revisi &amp; Delta
                    </span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-100 text-[11px]">
                      {formatRupiah(pkg.result.total_rab.rab_revised)}
                      <span
                        className={`ml-1 text-[10px] font-semibold ${
                          pkg.result.total_rab.system_calculated_delta < 0
                            ? 'text-emerald-700 dark:text-emerald-400'
                            : 'text-amber-700 dark:text-amber-400'
                        }`}
                      >
                        ({deltaPct >= 0 ? `+${deltaPct.toFixed(2)}%` : `${deltaPct.toFixed(2)}%`})
                      </span>
                    </span>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      id={`btn-delete-card-action-${pkg.id}`}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onRequestDeletePackage) {
                          onRequestDeletePackage(pkg);
                        } else {
                          onDeletePackage(pkg.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 border border-transparent hover:border-rose-200 dark:hover:border-rose-800 transition-colors cursor-pointer"
                      title="Hapus paket dokumen ini"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadVerificationExcel(pkg.result);
                      }}
                      className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 border border-transparent hover:border-emerald-200 dark:hover:border-emerald-800 transition-colors cursor-pointer"
                      title="Download Excel 9 Sheets untuk paket ini"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectPackage(pkg.id);
                      }}
                      className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-2xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {isActive ? 'Aktif' : 'Buka'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Expandable Details: File Breakdown for Active Package */}
      {expandedDetails && activePackage && (
        <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3 animate-in fade-in duration-150 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
            <span className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-blue-600 dark:text-[#00aded]" />
              Rincian File dalam {activePackage.title}
            </span>
            <div className="flex items-center space-x-2.5">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                Diproses: {new Date(activePackage.createdAt).toLocaleString('id-ID')}
              </span>
              <button
                id="btn-delete-active-pkg-details"
                type="button"
                onClick={() => {
                  if (onRequestDeletePackage) {
                    onRequestDeletePackage(activePackage);
                  } else {
                    onDeletePackage(activePackage.id);
                  }
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800 transition-colors cursor-pointer"
                title="Hapus paket dokumen yang sedang aktif"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                <span>Hapus Paket Ini</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* BAPL Files */}
            <div className="bg-white dark:bg-slate-800/80 rounded-lg p-3 border border-slate-200 dark:border-slate-700/80 space-y-1.5">
              <span className="text-[11px] font-bold text-blue-800 dark:text-cyan-300 uppercase tracking-wider block">
                Dokumen BAPL ({activePackage.baplFiles.length})
              </span>
              <ul className="space-y-1 max-h-32 overflow-y-auto pr-1">
                {activePackage.baplFiles.map((f, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between text-[11px] text-slate-700 dark:text-slate-200 font-mono truncate"
                  >
                    <span className="truncate">📄 {f.name}</span>
                    <span className="text-slate-400 dark:text-slate-400 shrink-0 ml-1">
                      {(f.size / 1024).toFixed(0)} KB
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Excel / PDF Project Files */}
            <div className="bg-white dark:bg-slate-800/80 rounded-lg p-3 border border-slate-200 dark:border-slate-700/80 space-y-1.5">
              <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider block">
                Berkas JusTek, JusFin &amp; RAB ({activePackage.projectFiles?.length || (activePackage.excelFileName ? 1 : 0)})
              </span>
              {activePackage.projectFiles && activePackage.projectFiles.length > 0 ? (
                <ul className="space-y-1 max-h-32 overflow-y-auto pr-1">
                  {activePackage.projectFiles.map((f, i) => (
                    <li
                      key={i}
                      className="flex items-center justify-between text-[11px] text-slate-700 dark:text-slate-200 font-mono truncate"
                    >
                      <span className="truncate">
                        {f.type === 'PDF' || f.name.endsWith('.pdf') ? '📕' : '📊'} {f.name}
                      </span>
                      <span className="text-slate-400 dark:text-slate-400 shrink-0 ml-1">
                        {(f.size / 1024).toFixed(0)} KB
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[11px] text-slate-700 dark:text-slate-200 font-mono truncate">
                  📊 {activePackage.excelFileName || 'Ekstraksi Otomatis Dokumen BAPL'}
                </p>
              )}
              <div className="text-[10px] text-slate-500 dark:text-slate-400 space-y-0.5 pt-1 border-t border-slate-100 dark:border-slate-700">
                <p>• RAB Awal: {formatRupiah(activePackage.result.total_rab.rab_initial)}</p>
                <p>• RAB Revisi: {formatRupiah(activePackage.result.total_rab.rab_revised)}</p>
                <p>• Rekap Justifikasi Teknis &amp; Finansial terintegrasi</p>
              </div>
            </div>

            {/* Supporting Files */}
            <div className="bg-white dark:bg-slate-800/80 rounded-lg p-3 border border-slate-200 dark:border-slate-700/80 space-y-1.5">
              <span className="text-[11px] font-bold text-purple-800 dark:text-purple-300 uppercase tracking-wider block">
                Dokumen Pendukung ({activePackage.supportingFiles.length})
              </span>
              {activePackage.supportingFiles.length > 0 ? (
                <ul className="space-y-1 max-h-32 overflow-y-auto pr-1">
                  {activePackage.supportingFiles.map((f, i) => (
                    <li
                      key={i}
                      className="flex items-center justify-between text-[11px] text-slate-700 dark:text-slate-200 font-mono truncate"
                    >
                      <span className="truncate">📎 {f.name}</span>
                      <span className="text-slate-400 dark:text-slate-400 shrink-0 ml-1">
                        {(f.size / 1024).toFixed(0)} KB
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[11px] text-slate-400 dark:text-slate-400 italic">
                  Tidak ada dokumen pendukung tambahan.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
