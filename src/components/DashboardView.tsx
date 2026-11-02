import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Clock,
  XCircle,
  TrendingDown,
  Building2,
  FileSpreadsheet,
  Download,
  AlertOctagon,
  ArrowUpRight,
  ShieldCheck,
  Trash2,
  Layers,
  Sparkles,
  RefreshCw,
  FileText,
  Scale,
  Calculator,
  FileCheck,
  ArrowRight,
} from 'lucide-react';
import { VerificationResult } from '../types';
import { formatRupiah, formatPercentage, formatQuantity } from '../services/normalizer';
import { downloadVerificationExcel } from '../services/excelGenerator';
import { downloadVerificationPdf } from '../services/pdfReportGenerator';

interface DashboardViewProps {
  result: VerificationResult;
  onSelectTab: (tabId: string) => void;
  onDeleteCurrentPackage?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  result,
  onSelectTab,
  onDeleteCurrentPackage,
}) => {
  const { project, summary, total_rab, exceptions, technical_summary } = result;
  const [dashboardItemFilter, setDashboardItemFilter] = useState<'all' | 'changed'>('all');

  return (
    <div className="space-y-6">
      {/* Project Identity & Executive Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs transition-colors">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide bg-slate-900 dark:bg-slate-800 text-white font-mono border border-slate-700">
                {project.projectCode}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  project.identityMatchStatus === 'MATCH'
                    ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                    : 'bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                }`}
              >
                Identitas: {project.identityMatchStatus}
              </span>
              <span className="text-xs text-slate-400">• Rev: {project.revision}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {project.projectName}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-0.5">{project.subproject}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onSelectTab('traceability')}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
            >
              <span>Lihat Rantai Traceability</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            </button>
            <button
              type="button"
              onClick={() => downloadVerificationPdf(result)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800 shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              <span>Unduh Laporan PDF</span>
            </button>
            <button
              type="button"
              onClick={() => downloadVerificationExcel(result)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download Excel (9 Sheets)</span>
            </button>
            {onDeleteCurrentPackage && (
              <button
                id="btn-delete-package-dashboard"
                type="button"
                onClick={onDeleteCurrentPackage}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800 transition-colors cursor-pointer"
                title="Hapus paket dokumen ini dari daftar"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                <span>Hapus Paket</span>
              </button>
            )}
          </div>
        </div>

        {/* Project Metadata Details */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 text-xs">
          <div>
            <span className="text-slate-500 dark:text-slate-400 block font-medium">Nomor BAPL</span>
            <span className="font-semibold text-slate-800 dark:text-slate-100 font-mono truncate block" title={project.baplNumber}>
              {project.baplNumber}
            </span>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400 block font-medium">Nomor PO / Kontrak</span>
            <span className="font-semibold text-slate-800 dark:text-slate-100 font-mono truncate block" title={project.poNumber}>
              {project.poNumber}
            </span>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400 block font-medium">Kontraktor Pelaksana</span>
            <span className="font-semibold text-slate-800 dark:text-slate-100 truncate block" title={project.contractor}>
              {project.contractor}
            </span>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400 block font-medium">Tanggal Pemeriksaan</span>
            <span className="font-semibold text-slate-800 dark:text-slate-100 block">{project.date}</span>
          </div>
        </div>

        {/* Program Domain & Cross-Domain Boundary Protection Banner */}
        {result.program_profile && (
          <div className="mt-4 p-3.5 rounded-xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-xs">
                    Profil Program: {result.program_profile.name}
                  </span>
                  {result.program_profile.autoDetected && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                      Auto-Adaptive ({Math.round(result.program_profile.confidence * 100)}%)
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  Proteksi Batasan Disiplin Aktif: Pencarian klausa substansi terisolasi dari domain asing (e.g. data uji Ohm/listrik tidak mencemari tiang/pipa mekanis).
                </p>
              </div>
            </div>
            {result.program_profile.matchedKeywords.length > 0 && (
              <div className="flex flex-wrap items-center gap-1 text-[10px]">
                <span className="text-slate-400 font-mono">Kata Kunci:</span>
                {result.program_profile.matchedKeywords.slice(0, 4).map((kw, kIdx) => (
                  <span key={kIdx} className="px-2 py-0.5 rounded bg-slate-800 text-teal-300 border border-slate-700">
                    {kw}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Multi-Document & Sheet Selection Audit Trail */}
        {((result.selected_sheets && Object.keys(result.selected_sheets).length > 0) ||
          result.multi_bapl_summary ||
          (result.audit_notes && result.audit_notes.length > 0)) && (
          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/40 -mx-6 -mb-6 p-5 rounded-b-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-cyan-300">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wide">
                    Hasil Seleksi Otomatis: Sheet Excel &amp; Berkas BAPL Versi Terbaru
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Sistem mendeteksi dan menggunakan lembar/berkas yang paling mutakhir (revisi terbaru) serta memperbarui poin pekerjaan lama secara otomatis.
                  </p>
                </div>
              </div>
              {result.multi_bapl_summary && result.multi_bapl_summary.superseded_count > 0 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700 w-fit">
                  <RefreshCw className="w-3 h-3 text-amber-700 dark:text-amber-400" />
                  <span>{result.multi_bapl_summary.superseded_count} Poin Diperbarui Dokumen Terbaru</span>
                </span>
              )}
            </div>

            {/* Selected Sheets breakdown */}
            {result.selected_sheets && Object.keys(result.selected_sheets).length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                {result.selected_sheets.jusFin && (
                  <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs shadow-2xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">
                      Sheet Justifikasi Finansial Terpilih
                    </span>
                    <span className="font-bold text-emerald-800 dark:text-emerald-400 font-mono text-sm block">
                      {result.selected_sheets.jusFin.sheetName}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-1">
                      Alasan: {result.selected_sheets.jusFin.reason}
                    </span>
                    {result.selected_sheets.jusFin.allCandidates.length > 1 && (
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 italic block mt-0.5">
                        Kandidat lain: {result.selected_sheets.jusFin.allCandidates.filter((s) => s !== result.selected_sheets?.jusFin?.sheetName).join(', ')}
                      </span>
                    )}
                  </div>
                )}
                {result.selected_sheets.rab && (
                  <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs shadow-2xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">
                      Sheet RAB Revisi Terpilih
                    </span>
                    <span className="font-bold text-emerald-800 dark:text-emerald-400 font-mono text-sm block">
                      {result.selected_sheets.rab.sheetName}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-1">
                      Alasan: {result.selected_sheets.rab.reason}
                    </span>
                  </div>
                )}
                {result.selected_sheets.jusTek && (
                  <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs shadow-2xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">
                      Sheet Justifikasi Teknis Terpilih
                    </span>
                    <span className="font-bold text-emerald-800 dark:text-emerald-400 font-mono text-sm block">
                      {result.selected_sheets.jusTek.sheetName}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-1">
                      Alasan: {result.selected_sheets.jusTek.reason}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Audit Notes and Document Sequences */}
            {result.audit_notes && result.audit_notes.length > 0 && (
              <div className="space-y-1.5 mt-2">
                {result.audit_notes.map((note, nIdx) => (
                  <div
                    key={nIdx}
                    className="flex items-start gap-2 text-[11px] text-slate-700 dark:text-slate-200 bg-white/80 dark:bg-slate-800/80 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-[#00aded] shrink-0 mt-0.5" />
                    <span>{note}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Supporting Documents (MC-0, Test Report, DED) Integration Banner */}
            {result.supporting_documents && result.supporting_documents.length > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-purple-900 dark:text-purple-300 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    Dokumen Pendukung Terintegrasi Pintar ({result.supporting_documents.length} Berkas)
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                    Otomatis Validasi Traceability &amp; MCO
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {result.supporting_documents.map((doc, dIdx) => (
                    <div key={dIdx} className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-purple-200 dark:border-purple-800/60 text-xs">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="font-bold text-slate-900 dark:text-white truncate" title={doc.fileName}>{doc.fileName}</span>
                        <span className="font-mono text-[9px] px-1.5 py-0.5 rounded font-bold bg-purple-50 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 shrink-0">
                          {doc.fileType}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-600 dark:text-slate-300 flex items-center justify-between">
                        <span>No: <strong className="text-purple-900 dark:text-purple-300 font-mono">{doc.docNumber || '-'}</strong></span>
                        <span className="font-semibold text-emerald-700 dark:text-emerald-400">{doc.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* DUAL-TRACK EXECUTIVE APPROVAL STATUS: JusTek vs JusFin */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Track 1: Approval Justifikasi Teknis (JusTek) */}
        <div
          onClick={() => onSelectTab('technical')}
          className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-blue-200 dark:border-blue-900/60 hover:border-blue-300 dark:hover:border-blue-700 p-5 shadow-xs cursor-pointer transition-all hover:translate-y-[-1px] space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-cyan-300">
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-blue-700 dark:text-cyan-400 uppercase tracking-wider block">
                  Pilar Verifikasi 1
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Approval Justifikasi Teknis (JusTek)
                </h3>
              </div>
            </div>
            <span
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                summary.mismatch === 0 && summary.review === 0
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                  : summary.mismatch > 0
                  ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800'
                  : 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800'
              }`}
            >
              {summary.mismatch === 0 && summary.review === 0
                ? 'TEKNIS DISETUJUI'
                : summary.mismatch > 0
                ? 'ADA DEVIASI TEKNIS'
                : 'PERLU KLARIFIKASI'}
            </span>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Fokus: Membuktikan kesesuaian fisik lapangan (BAPL &amp; DED) terhadap klausul usulan teknis (spesifikasi, material, dimensi).
          </p>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-center font-mono text-xs">
            <div className="bg-slate-50 dark:bg-slate-800/70 p-2 rounded-lg">
              <span className="text-[10px] text-slate-400 dark:text-slate-400 font-sans block">Terverifikasi</span>
              <span className="font-bold text-emerald-700 dark:text-emerald-400">{summary.verified} Item</span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/70 p-2 rounded-lg">
              <span className="text-[10px] text-slate-400 dark:text-slate-400 font-sans block">Butuh Bukti</span>
              <span className="font-bold text-blue-700 dark:text-cyan-400">{summary.need_support} Item</span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/70 p-2 rounded-lg">
              <span className="text-[10px] text-slate-400 dark:text-slate-400 font-sans block">Mismatch Fisik</span>
              <span className="font-bold text-rose-700 dark:text-rose-400">{summary.mismatch} Item</span>
            </div>
          </div>
        </div>

        {/* Track 2: Approval Justifikasi Finansial (JusFin) */}
        <div
          onClick={() => onSelectTab('financial')}
          className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-emerald-200 dark:border-emerald-900/60 hover:border-emerald-300 dark:hover:border-emerald-700 p-5 shadow-xs cursor-pointer transition-all hover:translate-y-[-1px] space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">
                  Pilar Verifikasi 2
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Approval Justifikasi Finansial (JusFin)
                </h3>
              </div>
            </div>
            <span
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                total_rab.delta_match && !total_rab.proposal_modification_required
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                  : 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800'
              }`}
            >
              {total_rab.delta_match && !total_rab.proposal_modification_required
                ? 'FINANSIAL OK (<= 10%)'
                : !total_rab.delta_match
                ? 'SELISIH ANGKA JUSFIN'
                : 'PLAFON > 10% (CCO)'}
            </span>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Fokus: Membuktikan kebenaran matematis RAB Awal vs Revisi, kesesuaian angka klaim dokumen JusFin, dan batas toleransi amandemen kontrak 10%.
          </p>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-center font-mono text-xs">
            <div className="bg-slate-50 dark:bg-slate-800/70 p-2 rounded-lg">
              <span className="text-[10px] text-slate-400 dark:text-slate-400 font-sans block">Delta Biaya</span>
              <span className="font-bold text-slate-900 dark:text-slate-100">{formatRupiah(total_rab.system_calculated_delta)}</span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/70 p-2 rounded-lg">
              <span className="text-[10px] text-slate-400 dark:text-slate-400 font-sans block">Deviasi (%)</span>
              <span className="font-bold text-emerald-700 dark:text-emerald-400">{formatPercentage(total_rab.system_calculated_percentage)}</span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/70 p-2 rounded-lg">
              <span className="text-[10px] text-slate-400 dark:text-slate-400 font-sans block">Plafon 10%</span>
              <span className="font-bold text-emerald-800 dark:text-emerald-300">
                {!total_rab.proposal_modification_required ? 'TERPENUHI' : 'MELEBIHI'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* AI ENGINE ARCHITECTURE & HIERARCHY: Paling Bagus ke Paling Efisien */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-xs border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Sparkles className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold tracking-tight text-white">
                  Hierarki Mesin AI Dashboard: Prioritas dari yang Paling Bagus ke Cadangan Efisien
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  Auto-Cascade Active
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Sistem secara otomatis mengeksekusi AI dari model penalaran tercanggih (Tier 1 Flagship Pro), dan secara cerdas berpindah ke model cadangan hanya jika terjadi batas kuota API.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 shrink-0 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-[11px] text-emerald-300 font-semibold">Semua Engine Siap</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Tier 1 */}
          <div className="bg-slate-800/80 rounded-xl p-3.5 border border-emerald-500/40 flex flex-col justify-between space-y-2 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-emerald-500 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded-bl-lg uppercase tracking-wider">
              Prioritas 1 (Paling Bagus)
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-emerald-300 font-mono">gemini-3.1-pro-preview</span>
              </div>
              <span className="text-[11px] font-semibold text-slate-200 block">Flagship Pro Reasoning</span>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Model penalaran tertinggi untuk audit kompleks STEM, verifikasi rumus aritmatika Excel, dan rekonsiliasi tabel finansial bertingkat secara mendalam.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-[10px]">
              <span className="text-slate-400">Status Eksekusi:</span>
              <span className="font-bold text-emerald-400 font-mono">AKTIF UTAMA</span>
            </div>
          </div>

          {/* Tier 2 */}
          <div className="bg-slate-800/80 rounded-xl p-3.5 border border-blue-500/30 flex flex-col justify-between space-y-2 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-blue-500/30 text-blue-300 font-bold text-[9px] px-2 py-0.5 rounded-bl-lg uppercase tracking-wider">
              Prioritas 2 (Cepat & Cerdas)
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-blue-300 font-mono">gemini-3.8-flash</span>
              </div>
              <span className="text-[11px] font-semibold text-slate-200 block">Flagship Flash Intelligence</span>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Pemrosesan multimodal kecepatan tinggi untuk ekstraksi PDF BAPL, OCR visual dokumen lapangan, dan penelaahan klausa Justek.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-[10px]">
              <span className="text-slate-400">Status Eksekusi:</span>
              <span className="font-bold text-blue-300 font-mono">STANDBY TINGGI</span>
            </div>
          </div>

          {/* Tier 3 */}
          <div className="bg-slate-800/80 rounded-xl p-3.5 border border-purple-500/30 flex flex-col justify-between space-y-2 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-purple-500/30 text-purple-300 font-bold text-[9px] px-2 py-0.5 rounded-bl-lg uppercase tracking-wider">
              Prioritas 3 (Cadangan Efisien)
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-purple-300 font-mono">gemini-3.1-flash-lite</span>
              </div>
              <span className="text-[11px] font-semibold text-slate-200 block">Flash-Lite High Throughput</span>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Model cadangan latensi rendah dengan kuota terpisah, menjamin sistem verifikasi dashboard tidak pernah terhenti saat kuota padat.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-[10px]">
              <span className="text-slate-400">Status Eksekusi:</span>
              <span className="font-bold text-purple-300 font-mono">FAILOVER SIAP</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards: The 5 Standard Verification Statuses */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Total Changes */}
        <div
          onClick={() => onSelectTab('technical')}
          className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs cursor-pointer transition-all hover:translate-y-[-2px]"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Perubahan</span>
            <FileSpreadsheet className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">{summary.total_items}</div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">Item Pekerjaan Terdaftar</span>
        </div>

        {/* Verified */}
        <div
          onClick={() => onSelectTab('technical')}
          className="bg-emerald-50/70 dark:bg-emerald-950/30 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800/60 hover:border-emerald-300 dark:hover:border-emerald-700 shadow-2xs cursor-pointer transition-all hover:translate-y-[-2px]"
        >
          <div className="flex items-center justify-between text-emerald-800 dark:text-emerald-300 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">VERIFIED</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-900 dark:text-emerald-200">{summary.verified}</div>
          <span className="text-[11px] text-emerald-700 dark:text-emerald-300 mt-1 block">Tervalidasi Konsisten</span>
        </div>

        {/* Mismatch */}
        <div
          onClick={() => onSelectTab('financial')}
          className="bg-rose-50/70 dark:bg-rose-950/30 p-4 rounded-xl border border-rose-200 dark:border-rose-800/60 hover:border-rose-300 dark:hover:border-rose-700 shadow-2xs cursor-pointer transition-all hover:translate-y-[-2px]"
        >
          <div className="flex items-center justify-between text-rose-800 dark:text-rose-300 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">MISMATCH</span>
            <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
          </div>
          <div className="text-2xl font-black text-rose-900 dark:text-rose-200">{summary.mismatch}</div>
          <span className="text-[11px] text-rose-700 dark:text-rose-300 mt-1 block">Deviasi Perhitungan / Data</span>
        </div>

        {/* Need Support */}
        <div
          onClick={() => onSelectTab('technical')}
          className="bg-blue-50/70 dark:bg-blue-950/30 p-4 rounded-xl border border-blue-200 dark:border-blue-800/60 hover:border-blue-300 dark:hover:border-blue-700 shadow-2xs cursor-pointer transition-all hover:translate-y-[-2px]"
        >
          <div className="flex items-center justify-between text-blue-800 dark:text-cyan-300 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">NEED SUPPORT</span>
            <HelpCircle className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-blue-900 dark:text-cyan-200">{summary.need_support}</div>
          <span className="text-[11px] text-blue-700 dark:text-cyan-300 mt-1 block">Butuh Bukti Tambahan (MCO)</span>
        </div>

        {/* Review */}
        <div
          onClick={() => onSelectTab('exceptions')}
          className="bg-purple-50/70 dark:bg-purple-950/30 p-4 rounded-xl border border-purple-200 dark:border-purple-800/60 hover:border-purple-300 dark:hover:border-purple-700 shadow-2xs cursor-pointer transition-all hover:translate-y-[-2px]"
        >
          <div className="flex items-center justify-between text-purple-800 dark:text-purple-300 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">REVIEW</span>
            <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="text-2xl font-black text-purple-900 dark:text-purple-200">{summary.review}</div>
          <span className="text-[11px] text-purple-700 dark:text-purple-300 mt-1 block">Audit Auditor Diperlukan</span>
        </div>
      </div>

      {/* Financial Comparison & Impact Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Financial Totals & Discrepancy Callout */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-5 transition-colors">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Verifikasi Total Nilai RAB &amp; Dampak Finansial
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">Kalkulasi Ulang Sistem vs JusFin</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 border border-slate-100 dark:border-slate-700">
              <span className="text-slate-500 dark:text-slate-400 text-xs font-medium block">RAB Awal (Baseline)</span>
              <span className="text-lg font-black text-slate-900 dark:text-white block mt-1">
                {formatRupiah(total_rab.rab_initial)}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">Total nilai DED kontrak</span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 border border-slate-100 dark:border-slate-700">
              <span className="text-slate-500 dark:text-slate-400 text-xs font-medium block">RAB Revisi (Actual)</span>
              <span className="text-lg font-black text-slate-900 dark:text-white block mt-1">
                {formatRupiah(total_rab.rab_revised)}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">Hasil penyesuaian lapangan</span>
            </div>

            <div className="bg-emerald-50 dark:bg-emerald-950/40 rounded-xl p-4 border border-emerald-100 dark:border-emerald-800/60">
              <span className="text-emerald-700 dark:text-emerald-400 text-xs font-medium block">Financial Delta (Hitung)</span>
              <span className="text-lg font-black text-emerald-900 dark:text-emerald-200 block mt-1">
                {formatRupiah(total_rab.system_calculated_delta)}
              </span>
              <span className="text-[11px] text-emerald-700 dark:text-emerald-300 font-semibold block">
                {formatPercentage(total_rab.system_calculated_percentage)}
              </span>
            </div>
          </div>

          {/* CRITICAL FINDING: Stated JusFin Discrepancy Callout (Section 15) */}
          {!total_rab.delta_match && (
            <div className="bg-rose-50 dark:bg-rose-950/40 border-2 border-rose-300 dark:border-rose-800 rounded-xl p-4 flex items-start gap-3.5">
              <div className="p-2 bg-rose-100 dark:bg-rose-900/60 rounded-lg text-rose-700 dark:text-rose-300 shrink-0 mt-0.5">
                <AlertOctagon className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-rose-600 text-white">
                    CRITICAL FINANCIAL MISMATCH
                  </span>
                  <span className="text-xs font-bold text-rose-900 dark:text-rose-200">
                    Discrepancy Angka JusFin vs Kalkulasi RAB
                  </span>
                </div>
                <p className="text-xs text-rose-800 dark:text-rose-300 leading-relaxed">
                  {total_rab.explanation}
                </p>
                <div className="pt-2 flex flex-wrap gap-4 text-xs font-mono">
                  <div>
                    <span className="text-rose-600 dark:text-rose-400 block text-[10px]">Tertulis pada Dokumen JusFin:</span>
                    <span className="font-bold text-rose-900 dark:text-rose-200">{formatRupiah(total_rab.stated_jusfin_delta)}</span>
                  </div>
                  <div>
                    <span className="text-rose-600 dark:text-rose-400 block text-[10px]">Perhitungan Sistem (Revisi - Awal):</span>
                    <span className="font-bold text-emerald-900 dark:text-emerald-300">{formatRupiah(total_rab.system_calculated_delta)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Threshold Rule Check (Section 21) */}
          <div className="bg-slate-50 dark:bg-slate-800/80 rounded-xl p-4 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <span className="font-bold text-slate-800 dark:text-slate-100 block">
                Threshold Approval Amandemen: {total_rab.threshold_percentage * 100}%
              </span>
              <span className="text-slate-500 dark:text-slate-400">
                ABS(Delta %) = {Math.abs(total_rab.system_calculated_percentage * 100).toFixed(4)}% &lt;= 10%
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-500 dark:text-slate-400">Proposal Modification:</span>
              <span
                className={`font-bold px-2.5 py-1 rounded text-xs ${
                  total_rab.proposal_modification_required
                    ? 'bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                    : 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                }`}
              >
                {total_rab.proposal_modification_required ? 'REQUIRED' : 'NOT REQUIRED'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Col: Technical Categories Breakdown */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col justify-between transition-colors">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600 dark:text-[#00aded]" />
              Kategori Perubahan Teknis
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-300 font-medium">Material Changes</span>
                <span className="font-bold text-slate-900 dark:text-slate-100 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                  {technical_summary.material_changes}
                </span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-300 font-medium">Dimension Changes</span>
                <span className="font-bold text-slate-900 dark:text-slate-100 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                  {technical_summary.dimension_changes}
                </span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-300 font-medium">Quantity Changes</span>
                <span className="font-bold text-slate-900 dark:text-slate-100 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                  {technical_summary.quantity_changes}
                </span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-300 font-medium">Scope Changes</span>
                <span className="font-bold text-slate-900 dark:text-slate-100 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                  {technical_summary.scope_changes}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-300 font-medium">Method Changes</span>
                <span className="font-bold text-slate-900 dark:text-slate-100 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                  {technical_summary.method_changes}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
            <button
              type="button"
              onClick={() => onSelectTab('technical')}
              className="text-xs text-blue-700 dark:text-[#00aded] hover:text-blue-900 dark:hover:text-cyan-300 font-bold hover:underline cursor-pointer"
            >
              Buka Matriks Detail Teknis &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* Kajian Komprehensif Perubahan: Deskripsi Pekerjaan, Quantity, & Harga */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Scale className="w-4 h-4 text-blue-600 dark:text-[#00aded]" />
                Kajian 3 Pilar Perubahan Kontrak: Deskripsi Pekerjaan, Kuantitas &amp; Harga
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                Audit Menyeluruh Excel
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Telaah menyeluruh atas perubahan lingkup pekerjaan serta sub-spesifikasi yang tertulis di baris bawahnya, pergeseran volume fisik (quantity), dan komparasi harga satuan serta total anggaran.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setDashboardItemFilter('all')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  dashboardItemFilter === 'all'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-bold shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Seluruh Baris Data ({result.financial_items.length})
              </button>
              <button
                type="button"
                onClick={() => setDashboardItemFilter('changed')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  dashboardItemFilter === 'changed'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-bold shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Hanya Item Berubah ({result.financial_items.filter((f) => f.delta_qty !== 0 || f.delta_unit_price !== 0 || f.delta_value !== 0).length})
              </button>
            </div>
            <button
              type="button"
              onClick={() => onSelectTab('financial')}
              className="text-xs text-blue-700 dark:text-[#00aded] hover:text-blue-900 dark:hover:text-cyan-300 font-bold hover:underline inline-flex items-center gap-1 px-2.5 py-1.5 cursor-pointer"
            >
              Buka Matriks Finansial &rarr;
            </button>
          </div>
        </div>

        {/* Changed Items Kajian List */}
        <div className="space-y-3">
          {result.financial_items
            .filter((f) => {
              if (dashboardItemFilter === 'all') return true;
              return (
                f.delta_qty !== 0 ||
                f.delta_unit_price !== 0 ||
                f.delta_value !== 0 ||
                (f.sub_specs_differences && f.sub_specs_differences.length > 0)
              );
            })
            .map((f, idx) => {
              const linkedTech = result.changes.find(
                (c) => c.change_id.trim().toUpperCase() === f.change_id.trim().toUpperCase()
              );
              const subDiffs =
                (f.sub_specs_differences && f.sub_specs_differences.length > 0)
                  ? f.sub_specs_differences
                  : (linkedTech?.sub_specs_differences || []);

              return (
                <div
                  key={`${f.change_id}_${idx}`}
                  className="bg-slate-50/70 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/80 p-4 space-y-3 hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
                >
                  <div className="flex items-center justify-between gap-3 border-b border-slate-200/70 dark:border-slate-700/70 pb-2 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-xs bg-slate-900 dark:bg-slate-800 text-white px-2 py-0.5 rounded border border-slate-700">
                        {f.change_id}
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white text-xs">{f.item}</span>
                      {f.traceability_ref_id && f.has_valid_ba_ref && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-blue-50 dark:bg-blue-950/70 text-blue-800 dark:text-cyan-300 border border-blue-200 dark:border-blue-800">
                          REF: {f.traceability_ref_id}
                        </span>
                      )}
                      {f.ba_anomaly_type === 'ANOMALI_ANGKA_TANPA_REFERENSI_BA' && (
                        <span className="px-1.5 py-0.5 rounded text-[8.5px] font-bold bg-rose-600 text-white animate-pulse">
                          ⚠️ ANOMALI: TANPA REF BA
                        </span>
                      )}
                      {f.ba_anomaly_type === 'ANOMALI_DEVIASI_NILAI_BA' && (
                        <span className="px-1.5 py-0.5 rounded text-[8.5px] font-bold bg-amber-600 text-white">
                          ⚠️ DEVIASI ANGKA BA
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-mono">
                      <span
                        className={`px-2 py-0.5 rounded font-bold ${
                          f.calculation_status === 'VERIFIED'
                            ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                            : 'bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                        }`}
                      >
                        ARITMATIKA: {f.calculation_status}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold">
                        {f.financial_status}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    {/* Pilar 1: Deskripsi Pekerjaan & Sub-Spesifikasi */}
                    <div className="bg-white dark:bg-slate-800/90 p-3 rounded-lg border border-slate-200 dark:border-slate-700 space-y-1.5 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1">
                          <FileCheck className="w-3.5 h-3.5 text-blue-600 dark:text-[#00aded]" />
                          1. Deskripsi &amp; Sub-Spesifikasi
                        </span>
                        <p className="text-[11px] text-slate-700 dark:text-slate-200 leading-relaxed font-sans mt-1">
                          {f.justification}
                        </p>

                        {subDiffs.length > 0 && (
                          <div className="mt-2 pt-1.5 border-t border-slate-100 dark:border-slate-700 space-y-1">
                            <span className="text-[9.5px] font-bold text-indigo-800 dark:text-indigo-300 uppercase tracking-wider block">
                              Sub-Spesifikasi Tertulis di Bawahnya:
                            </span>
                            <div className="space-y-0.5 font-mono text-[10px]">
                              {subDiffs.map((d, dIdx) => (
                                <div
                                  key={dIdx}
                                  className="bg-indigo-50/80 dark:bg-indigo-950/60 px-2 py-0.5 rounded text-indigo-950 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-800"
                                >
                                  {d}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      {linkedTech && (
                        <div className="text-[10px] text-slate-400 dark:text-slate-400 border-t border-slate-100 dark:border-slate-700 pt-1 mt-1">
                          BAPL Fisik: <strong className="text-slate-700 dark:text-slate-200 font-medium">{linkedTech.actual_bapl}</strong>
                        </div>
                      )}
                    </div>

                    {/* Pilar 2: Quantity (Volume & Satuan) */}
                    <div className="bg-white dark:bg-slate-800/90 p-3 rounded-lg border border-slate-200 dark:border-slate-700 space-y-1.5 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1">
                          <Layers className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                          2. Kuantitas (Volume &amp; Satuan)
                        </span>
                        <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                          <div className="bg-slate-50 dark:bg-slate-900 p-2 rounded border border-slate-100 dark:border-slate-700">
                            <span className="text-[9px] text-slate-400 dark:text-slate-400 block font-sans">Semula:</span>
                            <span className="font-bold text-slate-800 dark:text-slate-100">
                              {formatQuantity(f.qty_initial)} {f.unit}
                            </span>
                          </div>
                          <div className="bg-slate-50 dark:bg-slate-900 p-2 rounded border border-slate-100 dark:border-slate-700">
                            <span className="text-[9px] text-slate-400 dark:text-slate-400 block font-sans">Menjadi:</span>
                            <span className="font-bold text-slate-900 dark:text-white">
                              {formatQuantity(f.qty_revised)} {f.unit}
                            </span>
                          </div>
                        </div>
                        <div className="mt-1.5 flex items-center justify-between p-1.5 bg-slate-50 dark:bg-slate-900 rounded border border-slate-100 dark:border-slate-700 text-[11px]">
                          <span className="text-slate-500 dark:text-slate-400 font-sans">Delta Volume:</span>
                          <span
                            className={`font-mono font-bold ${
                              f.delta_qty > 0
                                ? 'text-rose-700 dark:text-rose-400'
                                : f.delta_qty < 0
                                ? 'text-emerald-700 dark:text-emerald-400'
                                : 'text-slate-500 dark:text-slate-400'
                            }`}
                          >
                            {f.delta_qty > 0 ? '+' : ''}
                            {formatQuantity(f.delta_qty)} {f.unit}
                          </span>
                        </div>
                      </div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-400 border-t border-slate-100 dark:border-slate-700 pt-1 mt-1 font-sans">
                        {f.delta_qty === 0 ? 'Volume fisik tetap sesuai kontrak awal.' : 'Penyesuaian volume kebutuhan fisik.'}
                      </div>
                    </div>

                    {/* Pilar 3: Harga (Harga Satuan & Total Biaya) */}
                    <div className="bg-white dark:bg-slate-800/90 p-3 rounded-lg border border-slate-200 dark:border-slate-700 space-y-1.5 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1">
                          <Calculator className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          3. Harga Satuan &amp; Total Biaya
                        </span>
                        <div className="space-y-1 pt-1 font-mono text-[11px]">
                          <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900 p-1.5 rounded border border-slate-100 dark:border-slate-700">
                            <span className="text-slate-500 dark:text-slate-400 font-sans text-[10px]">Harga Satuan:</span>
                            <span className="font-bold text-slate-900 dark:text-white">{formatRupiah(f.unit_price_revised)}</span>
                          </div>
                          {f.delta_unit_price !== 0 && (
                            <div className="text-[9.5px] text-slate-400 dark:text-slate-400 text-right font-sans">
                              Awal: {formatRupiah(f.unit_price_initial)} (Delta: {f.delta_unit_price > 0 ? '+' : ''}{formatRupiah(f.delta_unit_price)})
                            </div>
                          )}
                          <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900 p-1.5 rounded border border-slate-100 dark:border-slate-700">
                            <span className="text-slate-500 dark:text-slate-400 font-sans text-[10px]">Total Revisi:</span>
                            <span className="font-bold text-slate-900 dark:text-white">{formatRupiah(f.calculated_revised)}</span>
                          </div>
                          <div className="flex justify-between items-center p-1.5 bg-slate-50 dark:bg-slate-900 rounded border border-slate-100 dark:border-slate-700 font-bold">
                            <span className="text-slate-700 dark:text-slate-300 font-sans text-[10px]">Delta Total:</span>
                            <span className={f.delta_value > 0 ? 'text-rose-700 dark:text-rose-400' : f.delta_value < 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400'}>
                              {f.delta_value > 0 ? '+' : ''}{formatRupiah(f.delta_value)} ({formatPercentage(f.delta_percentage)})
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-400 border-t border-slate-100 dark:border-slate-700 pt-1 mt-1 font-sans">
                        Nilai Semula: {formatRupiah(f.calculated_initial)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Critical Findings List (Master Prompt Section 26) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs transition-colors">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Temuan Kritis &amp; Rekomendasi Audit PMO
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Daftar anomali dan tindak lanjut sebelum persetujuan amandemen kontrak
            </p>
          </div>
          <button
            type="button"
            onClick={() => onSelectTab('exceptions')}
            className="text-xs text-blue-700 dark:text-[#00aded] hover:underline font-semibold cursor-pointer"
          >
            Lihat semua temuan ({exceptions.length})
          </button>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {exceptions.map((exc, idx) => (
            <div key={`${exc.exception_id}_${idx}`} className="py-3 flex items-start justify-between gap-4 text-xs">
              <div className="flex items-start gap-3">
                <span className="font-mono text-[10px] font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 shrink-0 mt-0.5">
                  {exc.change_id}
                </span>
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">{exc.finding}</span>
                  <p className="text-slate-600 dark:text-slate-300 mt-0.5 text-[11px]">
                    <span className="font-semibold text-slate-700 dark:text-slate-200">Rekomendasi: </span>
                    {exc.recommended_action}
                  </p>
                </div>
              </div>
              <span
                className={`px-2 py-0.5 rounded text-[11px] font-semibold shrink-0 ${
                  exc.status === 'MISMATCH'
                    ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                    : exc.status === 'NEED SUPPORT'
                    ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-cyan-300 border border-blue-200 dark:border-blue-800'
                    : 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                }`}
              >
                {exc.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
