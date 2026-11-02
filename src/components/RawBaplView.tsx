import React, { useState, useMemo, useEffect } from 'react';
import {
  FileText,
  Copy,
  Check,
  Download,
  Search,
  ShieldCheck,
  Layers,
} from 'lucide-react';
import { RawBaplPage } from '../types';

interface RawBaplViewProps {
  pages: RawBaplPage[];
  initialPage?: number;
}

export const RawBaplView: React.FC<RawBaplViewProps> = ({ pages, initialPage = 1 }) => {
  const [selectedPageKey, setSelectedPageKey] = useState<string>('');
  const [selectedSource, setSelectedSource] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  // Group pages by source document
  const sources = useMemo(() => {
    return Array.from(new Set(pages.map((p) => p.source || 'BAPL Utama')));
  }, [pages]);

  const filteredPages = useMemo(() => {
    let result = pages;
    if (selectedSource !== 'ALL') {
      result = result.filter((p) => (p.source || 'BAPL Utama') === selectedSource);
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter((p) => p.extracted_text.toLowerCase().includes(q));
    }
    return result;
  }, [pages, selectedSource, searchTerm]);

  // Generate unique page identifier key
  const getPageKey = (p: RawBaplPage, idx: number) => `${p.source || 'BAPL'}_p${p.page}_idx${idx}`;

  useEffect(() => {
    if (filteredPages.length > 0) {
      if (initialPage) {
        const foundIdx = filteredPages.findIndex((p) => p.page === initialPage);
        if (foundIdx >= 0) {
          setSelectedPageKey(getPageKey(filteredPages[foundIdx], foundIdx));
          return;
        }
      }
      setSelectedPageKey(getPageKey(filteredPages[0], 0));
    }
  }, [initialPage, filteredPages]);

  const activePageIdx = useMemo(() => {
    const idx = filteredPages.findIndex((p, i) => getPageKey(p, i) === selectedPageKey);
    return idx >= 0 ? idx : 0;
  }, [filteredPages, selectedPageKey]);

  const activePage = filteredPages[activePageIdx] || pages[0];

  const handleCopy = () => {
    if (activePage) {
      navigator.clipboard.writeText(activePage.extracted_text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadAll = () => {
    const fullTranscript = pages
      .map(
        (p) =>
          `========================================================================\n` +
          `DOKUMEN: ${p.source} | HALAMAN: ${p.page} | OCR CONFIDENCE: ${Math.round(
            p.ocr_confidence * 100
          )}%\n` +
          `========================================================================\n\n` +
          `${p.extracted_text}\n\n`
      )
      .join('\n');

    const blob = new Blob([fullTranscript], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Transkrip_Lengkap_OCR_BAPL_${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Helper to render text with search term highlights
  const renderHighlightedText = (text: string, query: string) => {
    if (!query.trim()) return text;
    const parts = text.split(new RegExp(`(${query.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark
          key={i}
          className="bg-yellow-300 dark:bg-yellow-500 text-slate-950 px-1 py-0.5 rounded font-bold"
        >
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls Toolbar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs transition-colors">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-950/80 text-[#0054a6] dark:text-[#38bdf8] border border-blue-200 dark:border-blue-800">
                <ShieldCheck className="w-3.5 h-3.5 text-[#0054a6] dark:text-[#38bdf8]" />
                Multimodal OCR Vision Engine
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                Total {pages.length} Halaman Terpindai
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2 mt-1.5">
              <FileText className="w-5 h-5 text-[#0054a6] dark:text-[#38bdf8]" />
              Hasil Ekstraksi OCR &amp; Raw BAPL
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Transkrip hasil pembacaan teks fisik, tabel pekerjaan, nomor berita acara, dan catatan lapangan Berita Acara Pemeriksaan Lapangan (BAPL).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors"
              title="Salin teks halaman yang aktif"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-emerald-700 dark:text-emerald-300">Tersalin ke Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                  <span>Salin Teks Halaman</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDownloadAll}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors shadow-xs"
              title="Unduh seluruh transkrip OCR ke file TXT"
            >
              <Download className="w-3.5 h-3.5 text-[#0054a6] dark:text-[#38bdf8]" />
              <span>Unduh TXT Lengkap</span>
            </button>
          </div>
        </div>

        {/* Search Bar & Source Filter */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari kata kunci di seluruh transkrip OCR..."
              className="w-full pl-10 pr-8 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00aded] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Filter Dokumen:</span>
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00aded]"
            >
              <option value="ALL">Semua Berkas ({pages.length} Halaman)</option>
              {sources.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Page Selector Strip */}
        <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {filteredPages.map((p, idx) => {
            const key = getPageKey(p, idx);
            const isSelected = key === selectedPageKey;
            const pct = Math.round(p.ocr_confidence * 100);

            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedPageKey(key)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all border flex items-center gap-2 ${
                  isSelected
                    ? 'border-[#0054a6] dark:border-cyan-400 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/70 dark:to-cyan-950/70 text-[#004690] dark:text-cyan-200 shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                <span>Hal. {p.page}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-mono">
                  {pct}%
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-400 max-w-[110px] truncate">
                  {p.source || 'BAPL'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* OCR Content Card */}
      {activePage ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col transition-colors">
          {/* Top Info Banner */}
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-[#0054a6] dark:text-[#38bdf8]" />
                Dokumen: {activePage.source || 'BAPL Utama'}
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500">·</span>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 font-mono">
                Halaman {activePage.page}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                <span>Skor Akurasi OCR:</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {Math.round(activePage.ocr_confidence * 100)}%
                </span>
              </div>
            </div>
          </div>

          {/* Search Result Counter */}
          {searchTerm && (
            <div className="px-6 py-2.5 bg-yellow-50 dark:bg-yellow-950/40 border-b border-yellow-200 dark:border-yellow-900/60 text-xs text-yellow-900 dark:text-yellow-200 flex items-center justify-between">
              <span>
                Menampilkan hasil pencarian untuk: <strong>"{searchTerm}"</strong>
              </span>
              <span className="font-mono font-bold">
                {(activePage.extracted_text.match(new RegExp(searchTerm, 'gi')) || []).length} kecocokan pada halaman ini
              </span>
            </div>
          )}

          {/* Preformatted OCR Text Content */}
          <div className="p-6 sm:p-8 bg-slate-50/40 dark:bg-slate-950/80 overflow-auto max-h-[750px]">
            <div className="p-5 sm:p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-xs sm:text-sm text-slate-800 dark:text-slate-100 leading-relaxed whitespace-pre-wrap select-text shadow-xs">
              {renderHighlightedText(activePage.extracted_text, searchTerm)}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Tidak ada halaman yang cocok dengan filter pencarian "{searchTerm}".
          </p>
        </div>
      )}
    </div>
  );
};
