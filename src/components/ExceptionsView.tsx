import React, { useState } from 'react';
import {
  ShieldAlert,
  ArrowRight,
  FileQuestion,
  Scale,
  FileWarning,
  Calculator,
  Layers,
  BookOpen,
  ClipboardCopy,
  Check,
  FileText,
  DollarSign,
  FileCheck2,
  Compass,
  AlertTriangle,
} from 'lucide-react';
import { ExceptionRecord } from '../types';
import { StatusBadge } from './TechnicalVerificationView';

interface ExceptionsViewProps {
  exceptions: ExceptionRecord[];
}

export const ExceptionsView: React.FC<ExceptionsViewProps> = ({ exceptions }) => {
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyGuide = (exc: ExceptionRecord) => {
    let guideText = `[TEMUAN AUDIT - ${exc.exception_id}]\n`;
    guideText += `Item/Pekerjaan: ${exc.change_id}\n`;
    guideText += `Temuan: ${exc.finding}\n`;
    if (exc.error_detail) guideText += `Kajian Bedah Kesalahan: ${exc.error_detail}\n`;
    if (exc.substantiation_gap) guideText += `Kekurangan Berkas: ${exc.substantiation_gap}\n`;
    guideText += `Expected: ${exc.expected}\n`;
    guideText += `Actual: ${exc.actual}\n`;
    guideText += `Dampak: ${exc.impact}\n`;
    guideText += `Rekomendasi: ${exc.recommended_action}\n`;

    if (exc.how_to_incorporate) {
      guideText += `\n--- PANDUAN CARA MEMASUKKAN KE JUSTEK & JUSFIN ---\n`;
      guideText += `1. Justifikasi Teknis (JusTek):\n${exc.how_to_incorporate.justek_clause_guide}\n\n`;
      guideText += `2. RAB Revisi & JusFin:\n${exc.how_to_incorporate.jusfin_rab_guide}\n\n`;
      guideText += `3. Dokumen Pendukung Wajib:\n${exc.how_to_incorporate.required_supporting_docs.map((d) => `- ${d}`).join('\n')}\n\n`;
      guideText += `4. Klausul Addendum Kontrak:\n${exc.how_to_incorporate.contract_amendment_clause}\n`;
    }

    navigator.clipboard.writeText(guideText);
    setCopiedId(exc.exception_id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Classification function for rigorous audit categorization
  const classifyExceptionCategory = (e: ExceptionRecord): 'UNACCOMMODATED' | 'DISCREPANCY' | 'UNJUSTIFIED' | 'INSUFFICIENT' | 'CALCULATION' => {
    if (e.category_type === 'BELUM_MASUK_JUSTEK_JUSFIN') return 'UNACCOMMODATED';
    if (e.category_type === 'DEVIASI_ANGKA_VOLUME') return 'DISCREPANCY';
    if (e.category_type === 'OUTPUT_FORMAL_TANPA_BUKTI') return 'UNJUSTIFIED';
    if (e.category_type === 'BUKTI_KURANG_LENGKAP') return 'INSUFFICIENT';
    if (e.category_type === 'KESALAHAN_ARITMETIKA' || e.category_type === 'KETIDAKSINKRONAN_REKAP') return 'CALCULATION';

    const s = `${e.source} ${e.finding}`.toLowerCase();
    if (s.includes('belum diakomodir') || s.includes('field-unaccommodated') || s.includes('audit kolom 1 ➔')) {
      return 'UNACCOMMODATED';
    }
    if (s.includes('deviasi') || s.includes('ketidaksesuaian angka') || s.includes('beda volume')) {
      return 'DISCREPANCY';
    }
    if (s.includes('tanpa bukti') || s.includes('tidak ditemukan buktinya') || s.includes('tidak memiliki dokumen pembuktian')) {
      return 'UNJUSTIFIED';
    }
    if (s.includes('kurang') || s.includes('ahs') || s.includes('rincian')) {
      return 'INSUFFICIENT';
    }
    return 'CALCULATION';
  };

  const countUnaccommodated = exceptions.filter((e) => classifyExceptionCategory(e) === 'UNACCOMMODATED').length;
  const countDiscrepancy = exceptions.filter((e) => classifyExceptionCategory(e) === 'DISCREPANCY').length;
  const countUnjustified = exceptions.filter((e) => classifyExceptionCategory(e) === 'UNJUSTIFIED').length;
  const countInsufficient = exceptions.filter((e) => classifyExceptionCategory(e) === 'INSUFFICIENT').length;
  const countCalculation = exceptions.filter((e) => classifyExceptionCategory(e) === 'CALCULATION').length;

  const filtered = exceptions.filter((e) => {
    const cat = classifyExceptionCategory(e);
    const matchesCategory = filterCategory === 'ALL' || filterCategory === cat;
    const matchesSearch =
      !search.trim() ||
      e.change_id.toLowerCase().includes(search.toLowerCase()) ||
      e.finding.toLowerCase().includes(search.toLowerCase()) ||
      (e.error_detail && e.error_detail.toLowerCase().includes(search.toLowerCase())) ||
      (e.recommended_action && e.recommended_action.toLowerCase().includes(search.toLowerCase())) ||
      (e.expected && e.expected.toLowerCase().includes(search.toLowerCase())) ||
      (e.actual && e.actual.toLowerCase().includes(search.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header & Reconciliation Framework */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-600" />
              Audit Exceptions &amp; Bedah Temuan Mendalam
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Pemeriksaan silang 2-arah: <strong>Dokumen Kolom 1 (BAPL, FAT, Volume)</strong> ⟷ <strong>Output Formal (JusTek &amp; JusFin / RAB Revisi)</strong>.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Search Bar for Exceptions Section */}
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari temuan audit / kode item..."
                className="w-full pl-8 pr-7 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00aded]"
              />
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">🔍</span>
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 5 Interactive Triangulation Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
          {/* Card 1: Kolom 1 Belum Masuk JusTek/JusFin */}
          <button
            type="button"
            onClick={() => setFilterCategory(filterCategory === 'UNACCOMMODATED' ? 'ALL' : 'UNACCOMMODATED')}
            className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
              filterCategory === 'UNACCOMMODATED'
                ? 'bg-amber-500/10 border-amber-500 ring-2 ring-amber-500/20 shadow-xs'
                : 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/60 hover:bg-amber-50 dark:hover:bg-amber-950/30'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                <FileQuestion className="w-4 h-4 text-amber-600 shrink-0" />
                Belum Masuk JusTek/JusFin
              </span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200">
                {countUnaccommodated}
              </span>
            </div>
            <p className="text-[10px] text-amber-950 dark:text-amber-300 mt-1 leading-snug">
              Ada di Kolom 1 tapi belum diakomodir di output formal + panduan memasukkannya.
            </p>
          </button>

          {/* Card 2: Deviasi / Salah Input Angka */}
          <button
            type="button"
            onClick={() => setFilterCategory(filterCategory === 'DISCREPANCY' ? 'ALL' : 'DISCREPANCY')}
            className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
              filterCategory === 'DISCREPANCY'
                ? 'bg-rose-500/10 border-rose-500 ring-2 ring-rose-500/20 shadow-xs'
                : 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/60 hover:bg-rose-50 dark:hover:bg-rose-950/30'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-rose-900 dark:text-rose-200 flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-rose-600 shrink-0" />
                Deviasi Volume / Angka
              </span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-rose-200 dark:bg-rose-900 text-rose-900 dark:text-rose-200">
                {countDiscrepancy}
              </span>
            </div>
            <p className="text-[10px] text-rose-950 dark:text-rose-300 mt-1 leading-snug">
              Volume lapangan berbeda atau angka usulan tidak ada di data ukur Kolom 1.
            </p>
          </button>

          {/* Card 3: Klaim Formal Tanpa Bukti Kolom 1 */}
          <button
            type="button"
            onClick={() => setFilterCategory(filterCategory === 'UNJUSTIFIED' ? 'ALL' : 'UNJUSTIFIED')}
            className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
              filterCategory === 'UNJUSTIFIED'
                ? 'bg-purple-500/10 border-purple-500 ring-2 ring-purple-500/20 shadow-xs'
                : 'bg-purple-50/50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800/60 hover:bg-purple-50 dark:hover:bg-purple-950/30'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-purple-900 dark:text-purple-200 flex items-center gap-1.5">
                <FileWarning className="w-4 h-4 text-purple-600 shrink-0" />
                Klaim Formal Tanpa Bukti
              </span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-purple-200 dark:bg-purple-900 text-purple-900 dark:text-purple-200">
                {countUnjustified}
              </span>
            </div>
            <p className="text-[10px] text-purple-950 dark:text-purple-300 mt-1 leading-snug">
              Poin perubahan dicantumkan di JusTek/JusFin namun nihil bukti BAPL di Kolom 1.
            </p>
          </button>

          {/* Card 4: Bukti Kurang Lengkap */}
          <button
            type="button"
            onClick={() => setFilterCategory(filterCategory === 'INSUFFICIENT' ? 'ALL' : 'INSUFFICIENT')}
            className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
              filterCategory === 'INSUFFICIENT'
                ? 'bg-orange-500/10 border-orange-500 ring-2 ring-orange-500/20 shadow-xs'
                : 'bg-orange-50/50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800/60 hover:bg-orange-50 dark:hover:bg-orange-950/30'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-orange-900 dark:text-orange-200 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-orange-600 shrink-0" />
                Bukti Kurang Lengkap
              </span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-orange-200 dark:bg-orange-900 text-orange-900 dark:text-orange-200">
                {countInsufficient}
              </span>
            </div>
            <p className="text-[10px] text-orange-950 dark:text-orange-300 mt-1 leading-snug">
              Dokumen menyebutkan perubahan namun kurang rincian AHS / back up volume pendukung.
            </p>
          </button>

          {/* Card 5: Deviasi Aritmetika & Rekap */}
          <button
            type="button"
            onClick={() => setFilterCategory(filterCategory === 'CALCULATION' ? 'ALL' : 'CALCULATION')}
            className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
              filterCategory === 'CALCULATION'
                ? 'bg-blue-500/10 border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                : 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800/60 hover:bg-blue-50 dark:hover:bg-blue-950/30'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                <Calculator className="w-4 h-4 text-blue-600 shrink-0" />
                Aritmetika &amp; Rekap
              </span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-blue-200 dark:bg-blue-900 text-blue-900 dark:text-blue-200">
                {countCalculation}
              </span>
            </div>
            <p className="text-[10px] text-blue-950 dark:text-blue-300 mt-1 leading-snug">
              Kesalahan perkalian volume x harga atau selisih rekapitulasi total RAB.
            </p>
          </button>
        </div>

        {filterCategory !== 'ALL' && (
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Menampilkan kategori: <strong className="text-slate-800 dark:text-white">{filterCategory}</strong> ({filtered.length} temuan)
            </span>
            <button
              type="button"
              onClick={() => setFilterCategory('ALL')}
              className="text-xs text-blue-600 dark:text-[#00aded] hover:underline font-semibold cursor-pointer"
            >
              Reset ke Semua Temuan
            </button>
          </div>
        )}
      </div>

      {/* Exception Cards */}
      <div className="space-y-5">
        {filtered.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center text-slate-500 dark:text-slate-400">
            <p className="text-sm font-semibold">Tidak ada temuan audit untuk filter ini.</p>
          </div>
        ) : (
          filtered.map((exc, idx) => {
            const cat = classifyExceptionCategory(exc);
            let catBadge = {
              label: 'Kalkulasi & Rekap RAB',
              className: 'bg-blue-100 dark:bg-blue-950/60 text-blue-900 dark:text-blue-200 border-blue-300 dark:border-blue-700',
            };
            if (cat === 'UNACCOMMODATED') {
              catBadge = {
                label: 'Kolom 1 Belum Masuk JusTek/JusFin',
                className: 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-700 font-bold',
              };
            } else if (cat === 'DISCREPANCY') {
              catBadge = {
                label: 'Deviasi Angka & Volume',
                className: 'bg-rose-100 dark:bg-rose-950/60 text-rose-900 dark:text-rose-200 border-rose-300 dark:border-rose-700 font-bold',
              };
            } else if (cat === 'UNJUSTIFIED') {
              catBadge = {
                label: 'Klaim Formal Tanpa Bukti Kolom 1',
                className: 'bg-purple-100 dark:bg-purple-950/60 text-purple-900 dark:text-purple-200 border-purple-300 dark:border-purple-700 font-bold',
              };
            } else if (cat === 'INSUFFICIENT') {
              catBadge = {
                label: 'Bukti Kolom 1 Kurang Lengkap',
                className: 'bg-orange-100 dark:bg-orange-950/60 text-orange-900 dark:text-orange-200 border-orange-300 dark:border-orange-700 font-bold',
              };
            }

            return (
              <div
                key={`${exc.exception_id}_${idx}`}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs transition-colors space-y-4"
              >
                {/* Card Top Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded text-[11px] border ${catBadge.className}`}>
                      {catBadge.label}
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                      {exc.exception_id}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">• Ref: {exc.change_id}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">• Sumber: {exc.source}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopyGuide(exc)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                      title="Salin rincian temuan & panduan teknis ke clipboard"
                    >
                      {copiedId === exc.exception_id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span className="text-emerald-700 dark:text-emerald-400">Tersalin</span>
                        </>
                      ) : (
                        <>
                          <ClipboardCopy className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                          <span>Salin Format Rekomendasi</span>
                        </>
                      )}
                    </button>
                    <StatusBadge status={exc.status} />
                  </div>
                </div>

                {/* Finding Title */}
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block font-semibold text-xs">Pernyataan Temuan Audit (Finding):</span>
                  <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 leading-relaxed">
                    {exc.finding}
                  </p>
                </div>

                {/* Deep Diagnostic Breakdown */}
                {exc.error_detail && (
                  <div className="bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/50 rounded-xl p-3.5 space-y-1">
                    <div className="flex items-center gap-1.5 text-rose-900 dark:text-rose-300 font-bold text-xs">
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>Kajian &amp; Bedah Kesalahan Mendalam (Diagnostic Breakdown):</span>
                    </div>
                    <p className="text-xs text-rose-950 dark:text-rose-200 leading-relaxed pl-5.5 font-medium">
                      {exc.error_detail}
                    </p>
                  </div>
                )}

                {/* Substantiation Gap */}
                {exc.substantiation_gap && (
                  <div className="bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50 rounded-xl p-3.5 space-y-1">
                    <div className="flex items-center gap-1.5 text-amber-900 dark:text-amber-300 font-bold text-xs">
                      <Layers className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Kekurangan Bukti / Dokumen Pendukung Lapangan (Substantiation Gap):</span>
                    </div>
                    <p className="text-xs text-amber-950 dark:text-amber-200 leading-relaxed pl-5.5 font-medium">
                      {exc.substantiation_gap}
                    </p>
                  </div>
                )}

                {/* Expected vs Actual Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl text-xs">
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block font-semibold text-[11px]">Kondisi Yang Diharapkan (Expected):</span>
                    <span className="text-slate-800 dark:text-slate-100 font-medium mt-0.5 block leading-relaxed">
                      {exc.expected}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block font-semibold text-[11px]">Kondisi Aktual (Actual):</span>
                    <span className="text-slate-800 dark:text-slate-100 font-medium mt-0.5 block leading-relaxed">
                      {exc.actual}
                    </span>
                  </div>
                </div>

                {/* Side-by-Side Value Comparison: BAPL OCR vs Justek/Jusfin */}
                {exc.comparison_values && (
                  <div className="bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-blue-500/10 dark:from-amber-950/30 dark:via-rose-950/30 dark:to-blue-950/30 border border-amber-300 dark:border-amber-800 rounded-xl p-4 space-y-3">
                    <div className="flex items-center gap-2 text-amber-900 dark:text-amber-300 font-bold text-xs">
                      <Scale className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0" />
                      <span>Deteksi Otomatis Perbandingan Nilai: Data BAPL OCR (Coretan Tangan) vs Justek &amp; JusFin</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="bg-white/90 dark:bg-slate-800/90 border border-amber-200 dark:border-amber-800/70 rounded-lg p-3 space-y-1">
                        <span className="font-bold text-amber-950 dark:text-amber-200 flex items-center gap-1">
                          📋 Nilai BA MC0 (OCR &amp; Coretan Tangan)
                        </span>
                        <p className="text-xs font-mono font-semibold text-slate-800 dark:text-slate-100 bg-amber-50 dark:bg-amber-950/50 p-2 rounded border border-amber-200 dark:border-amber-900">
                          {exc.comparison_values.bapl_ocr_value}
                        </p>
                      </div>

                      <div className="bg-white/90 dark:bg-slate-800/90 border border-blue-200 dark:border-blue-800/70 rounded-lg p-3 space-y-1">
                        <span className="font-bold text-blue-950 dark:text-blue-200 flex items-center gap-1">
                          📑 Nilai Justek &amp; JusFin (Pengajuan Amandemen)
                        </span>
                        <p className="text-xs font-mono font-semibold text-slate-800 dark:text-slate-100 bg-blue-50 dark:bg-blue-950/50 p-2 rounded border border-blue-200 dark:border-blue-900">
                          {exc.comparison_values.justek_jusfin_value}
                        </p>
                      </div>
                    </div>

                    <p className="text-[11.5px] text-slate-700 dark:text-slate-300 font-medium italic">
                      💡 <strong>Catatan Auditor:</strong> {exc.comparison_values.difference_note}
                    </p>
                  </div>
                )}

                {/* Risk Impact */}
                <div>
                  <span className="text-rose-700 dark:text-rose-400 font-bold block text-xs">Dampak Risiko Regulasi &amp; Kontraktual (Impact):</span>
                  <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5 leading-relaxed">{exc.impact}</p>
                </div>

                {/* Actionable How-To Guide to Incorporate into JusTek & JusFin */}
                {exc.how_to_incorporate && (
                  <div className="bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-xl p-4 space-y-3">
                    <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-300 font-bold text-xs">
                      <Compass className="w-4 h-4 text-emerald-700 shrink-0" />
                      <span>Panduan Langkah Teknis: Cara Memasukkan &amp; Memperbaiki di JusTek &amp; JusFin</span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 text-xs">
                      {/* Step 1: JusTek */}
                      <div className="bg-white/90 dark:bg-slate-800/90 border border-emerald-200/80 dark:border-emerald-800/50 rounded-lg p-3 space-y-1">
                        <span className="font-bold text-emerald-950 dark:text-emerald-200 flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          1. Formulasi Naskah Justifikasi Teknis (JusTek)
                        </span>
                        <p className="text-[11.5px] text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                          {exc.how_to_incorporate.justek_clause_guide}
                        </p>
                      </div>

                      {/* Step 2: JusFin & RAB */}
                      <div className="bg-white/90 dark:bg-slate-800/90 border border-emerald-200/80 dark:border-emerald-800/50 rounded-lg p-3 space-y-1">
                        <span className="font-bold text-emerald-950 dark:text-emerald-200 flex items-center gap-1.5">
                          <DollarSign className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          2. Formulasi RAB Revisi &amp; Justifikasi Finansial (JusFin)
                        </span>
                        <p className="text-[11.5px] text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                          {exc.how_to_incorporate.jusfin_rab_guide}
                        </p>
                      </div>
                    </div>

                    {/* Step 3: Required Supporting Documents */}
                    {exc.how_to_incorporate.required_supporting_docs && exc.how_to_incorporate.required_supporting_docs.length > 0 && (
                      <div className="bg-white/90 dark:bg-slate-800/90 border border-emerald-200/80 dark:border-emerald-800/50 rounded-lg p-3 space-y-1 text-xs">
                        <span className="font-bold text-emerald-950 dark:text-emerald-200 flex items-center gap-1.5">
                          <FileCheck2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          3. Dokumen Lampiran Pendukung Wajib (Kolom 1):
                        </span>
                        <ul className="list-disc list-inside space-y-0.5 text-[11.5px] text-slate-700 dark:text-slate-300 pl-1">
                          {exc.how_to_incorporate.required_supporting_docs.map((doc, docIdx) => (
                            <li key={docIdx}>{doc}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Step 4: Contract Amendment Clause */}
                    {exc.how_to_incorporate.contract_amendment_clause && (
                      <div className="bg-white/90 dark:bg-slate-800/90 border border-emerald-200/80 dark:border-emerald-800/50 rounded-lg p-3 space-y-1 text-xs">
                        <span className="font-bold text-emerald-950 dark:text-emerald-200 flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          4. Draf Klausul Amandemen / Addendum Kontrak:
                        </span>
                        <p className="text-[11.5px] text-slate-700 dark:text-slate-300 italic bg-slate-50 dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-slate-700">
                          &ldquo;{exc.how_to_incorporate.contract_amendment_clause}&rdquo;
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Recommendation */}
                <div className="bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 rounded-xl p-3 flex items-start gap-2.5">
                  <ArrowRight className="w-4 h-4 text-blue-600 dark:text-[#00aded] shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <span className="font-bold text-blue-900 dark:text-blue-300 block">Tindakan Rekomendasi PMO:</span>
                    <p className="text-blue-950 dark:text-blue-200 mt-0.5 leading-relaxed">{exc.recommended_action}</p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
