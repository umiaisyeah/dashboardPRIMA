import React from 'react';
import {
  FileSpreadsheet,
  Download,
  UploadCloud,
  Sliders,
  Sparkles,
  ShieldCheck,
  RotateCcw,
  Cloud,
  FileText,
  Home,
  Sun,
  Moon,
} from 'lucide-react';
import { VerificationResult, DocumentPackage } from '../types';
import { downloadVerificationExcel } from '../services/excelGenerator';
import { downloadSampleProjectExcel } from '../services/templateGenerator';
import { downloadVerificationPdf } from '../services/pdfReportGenerator';
import { CompanyLogo } from './CompanyLogo';
import { PrimaLogo } from './PrimaLogo';
import { RealtimeClock } from './RealtimeClock';

interface HeaderProps {
  result: VerificationResult | null;
  activePackage?: DocumentPackage | null;
  onOpenUpload: () => void;
  onOpenConfig: () => void;
  onOpenReview: () => void;
  onOpenReset: () => void;
  onOpenWelcome?: () => void;
  onOpenGoogleDrive?: () => void;
  googleUser?: { displayName?: string | null; email?: string | null; photoURL?: string | null } | null;
  isProcessing: boolean;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  result,
  activePackage,
  onOpenUpload,
  onOpenConfig,
  onOpenReview,
  onOpenReset,
  onOpenWelcome,
  onOpenGoogleDrive,
  googleUser,
  isProcessing,
  darkMode,
  onToggleDarkMode,
}) => {
  const handleDownloadPdf = () => {
    if (result) {
      downloadVerificationPdf(result, activePackage);
    }
  };

  return (
    <header
      id="app-header"
      className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-blue-100 dark:border-slate-800 sticky top-0 z-30 shadow-xs transition-colors relative overflow-hidden"
    >
      {/* Jakarta Clean Water & Gold Gradient Top Accent Bar */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#003b73] via-[#00aded] to-[#f59e0b]" />

      <div className="max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-2 sm:py-2.5 gap-2 sm:gap-4">
          {/* Logo & System Title on Top Left */}
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            {/* Air Bersih Jakarta & PRIMA Logo Lockup */}
            <div className="flex items-center gap-2 shrink-0">
              <CompanyLogo className="h-6 sm:h-8 w-auto" />
              <div className="h-5 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block"></div>
              <button
                type="button"
                onClick={onOpenWelcome}
                className="flex items-center gap-2 hover:opacity-90 transition-opacity cursor-pointer group text-left"
                title="Buka Laman Selamat Datang PRIMA"
              >
                <PrimaLogo size="sm" animated={true} />
                <div className="flex flex-col justify-center">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm sm:text-base font-black tracking-wider bg-gradient-to-r from-[#003b73] via-[#00aded] to-[#f59e0b] bg-clip-text text-transparent font-mono leading-none">
                      PRIMA
                    </span>
                    <span className="hidden sm:inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-50 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 shrink-0">
                      Vision AI
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium hidden md:block whitespace-nowrap leading-tight mt-0.5">
                    Project Records, Intelligence, Monitoring &amp; Assurance
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Center Realtime Clock */}
          <div className="hidden xl:flex items-center justify-center">
            <RealtimeClock compact={false} />
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
            {/* Realtime Clock Compact for smaller screens */}
            <div className="xl:hidden hidden sm:flex items-center">
              <RealtimeClock compact={true} />
            </div>

            {/* Back to Welcome Page Button */}
            {onOpenWelcome && (
              <button
                type="button"
                onClick={onOpenWelcome}
                title="Kembali ke Laman Selamat Datang PRIMA"
                className="hidden md:inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors"
              >
                <Home className="w-3.5 h-3.5 text-[#0054a6] dark:text-[#38bdf8]" />
                <span className="font-semibold hidden lg:inline">PRIMA Home</span>
              </button>
            )}

            {/* Upload Files Button */}
            <button
              id="btn-upload-files"
              type="button"
              onClick={onOpenUpload}
              disabled={isProcessing}
              className="inline-flex items-center space-x-1 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#003b73] via-[#0054a6] to-[#00aded] hover:opacity-95 shadow-xs transition-all"
            >
              <UploadCloud className="w-3.5 h-3.5 text-cyan-200 shrink-0" />
              <span>Upload</span>
            </button>

            {/* Download PDF Verification Report */}
            {result && (
              <button
                id="btn-download-pdf-primary"
                type="button"
                onClick={handleDownloadPdf}
                title="Unduh Laporan Hasil Audit Dokumen Format PDF"
                className="inline-flex items-center space-x-1 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
                <span className="hidden sm:inline">PDF</span>
              </button>
            )}

            {/* Download Excel 9 Sheets */}
            {result && (
              <button
                id="btn-download-excel-primary"
                type="button"
                onClick={() => downloadVerificationExcel(result)}
                title="Unduh Rekapitulasi Audit Format Excel 9 Sheets"
                className="hidden lg:inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 transition-colors"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Excel</span>
              </button>
            )}

            {/* Google Drive Integration Button */}
            {onOpenGoogleDrive && (
              <button
                id="btn-open-google-drive"
                type="button"
                onClick={onOpenGoogleDrive}
                title={googleUser ? `Google Drive Terhubung: ${googleUser.email}` : "Hubungkan Google Drive"}
                className={`hidden xl:inline-flex items-center space-x-1 px-2 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                  googleUser
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                }`}
              >
                <Cloud className={`w-3.5 h-3.5 ${googleUser ? 'text-emerald-600' : 'text-blue-600'}`} />
                <span>Drive</span>
              </button>
            )}

            {/* Threshold Config */}
            <button
              id="btn-config-threshold"
              type="button"
              onClick={onOpenConfig}
              title="Pengaturan Threshold Finansial & Toleransi"
              className="p-1.5 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-colors"
            >
              <Sliders className="w-4 h-4" />
            </button>

            {/* Reset / Riset System Button */}
            <button
              id="btn-reset-system"
              type="button"
              onClick={onOpenReset}
              disabled={isProcessing}
              title="Riset / Reset Sistem & Pasangan Dokumen"
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-xs font-semibold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/50 border border-rose-200 dark:border-rose-900 transition-colors disabled:opacity-50 inline-flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Reset</span>
            </button>

            {/* Dark Mode / Light Mode Toggle */}
            <button
              type="button"
              onClick={onToggleDarkMode}
              className="p-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
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
      </div>
    </header>
  );
};
