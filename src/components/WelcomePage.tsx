import React from 'react';
import { LayoutDashboard, ArrowRight, Sun, Moon } from 'lucide-react';
import { PrimaLogo } from './PrimaLogo';
import { CompanyLogo } from './CompanyLogo';
import { RealtimeClock } from './RealtimeClock';

interface WelcomePageProps {
  onEnterDashboard: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export const WelcomePage: React.FC<WelcomePageProps> = ({
  onEnterDashboard,
  darkMode,
  onToggleDarkMode,
}) => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between selection:bg-[#00aded]/20 transition-colors duration-200">
      {/* Decorative Atmospheric Background Gradients */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-gradient-to-br from-[#0054a6]/15 via-[#00aded]/20 to-transparent blur-3xl" />
        <div className="absolute top-1/3 -right-32 w-[30rem] h-[30rem] rounded-full bg-gradient-to-bl from-[#f59e0b]/15 via-[#fbbf24]/10 to-transparent blur-3xl" />
        <div className="absolute -bottom-32 left-1/3 w-[26rem] h-[26rem] rounded-full bg-gradient-to-tr from-[#004690]/15 via-[#38bdf8]/15 to-transparent blur-3xl" />
      </div>

      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-4 sm:px-8 py-3 transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <CompanyLogo className="h-8 sm:h-9 w-auto" />
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block" />
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                Air Bersih Jakarta
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 font-semibold font-mono">
                PMO
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <RealtimeClock compact={false} />

            <button
              type="button"
              onClick={onToggleDarkMode}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
              title={darkMode ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
            >
              {darkMode ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Clean Welcome Viewport */}
      <main className="relative z-10 max-w-4xl mx-auto px-6 py-12 flex-1 flex flex-col justify-center items-center text-center my-auto">
        {/* 1. Animated Logo */}
        <div className="relative group p-6 sm:p-8 rounded-3xl bg-white/90 dark:bg-slate-900/90 border border-blue-100 dark:border-blue-900/60 shadow-2xl shadow-blue-500/10 backdrop-blur-xl mb-8 transition-all duration-500 hover:shadow-cyan-500/20 hover:border-cyan-300/60 dark:hover:border-cyan-700/60">
          <PrimaLogo size="hero" animated={true} />
        </div>

        {/* 2. Nama Dashboard */}
        <h1 className="text-5xl sm:text-7xl font-black tracking-tight mb-3">
          <span className="bg-gradient-to-r from-[#004690] via-[#0054a6] to-[#00aded] bg-clip-text text-transparent">
            PRIMA
          </span>
        </h1>

        {/* 3. Akronim Dashboard */}
        <p className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight mb-4">
          <span className="text-[#0054a6] dark:text-[#38bdf8]">P</span>roject{' '}
          <span className="text-[#0054a6] dark:text-[#38bdf8]">R</span>ecords,{' '}
          <span className="text-[#00aded] dark:text-[#7dd3fc]">I</span>ntelligence,{' '}
          <span className="text-[#f59e0b] dark:text-[#fbbf24]">M</span>onitoring and{' '}
          <span className="text-[#d97706] dark:text-[#fde047]">A</span>ssurance
        </p>

        {/* 4. Penjelasan Singkat */}
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed mb-8">
          Sistem intelijen verifikasi dan validasi dokumen proyek Air Bersih Jakarta yang mengotomatisasi pencocokan Berita Acara Pemeriksaan Lapangan (BAPL), Justifikasi Teknis (JusTek), Justifikasi Finansial (JusFin), RAB, serta dokumen persetujuan lapangan secara presisi.
        </p>

        {/* CTA ke Dashboard */}
        <div>
          <button
            type="button"
            onClick={onEnterDashboard}
            className="px-8 py-4 rounded-2xl text-sm sm:text-base font-bold text-white bg-gradient-to-r from-[#004690] via-[#0054a6] to-[#00aded] hover:opacity-95 shadow-xl shadow-blue-500/25 transition-all hover:scale-[1.02] flex items-center gap-3 cursor-pointer"
          >
            <LayoutDashboard className="w-5 h-5 text-cyan-200" />
            <span>Masuk ke Dashboard PRIMA</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </main>

      {/* Footer Bar */}
      <footer className="relative z-10 border-t border-slate-200/80 dark:border-slate-800/80 py-4 px-4 sm:px-8 text-center text-xs text-slate-500 dark:text-slate-400 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300">PRIMA</span>
            <span>· Air Bersih Jakarta</span>
            <span>· PAM JAYA</span>
          </div>
          <div>
            <span>Sistem Otomatisasi Verifikasi BAPL, Justifikasi Teknis &amp; Finansial © 2026</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
