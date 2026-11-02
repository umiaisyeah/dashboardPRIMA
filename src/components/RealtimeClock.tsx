import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface RealtimeClockProps {
  className?: string;
  showDate?: boolean;
  compact?: boolean;
}

export const RealtimeClock: React.FC<RealtimeClockProps> = ({
  className = '',
  showDate = true,
  compact = false,
}) => {
  const [time, setTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const daysIndo = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const monthsIndo = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
  ];

  const dayName = daysIndo[time.getDay()];
  const dateNum = time.getDate();
  const monthName = monthsIndo[time.getMonth()];
  const yearNum = time.getFullYear();

  const hours = String(time.getHours()).padStart(2, '0');
  const minutes = String(time.getMinutes()).padStart(2, '0');
  const seconds = String(time.getSeconds()).padStart(2, '0');

  return (
    <div
      className={`inline-flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-blue-200/60 dark:border-blue-900/60 bg-gradient-to-r from-blue-50/80 via-white/80 to-amber-50/80 dark:from-slate-900/90 dark:via-blue-950/40 dark:to-slate-900/90 backdrop-blur-md shadow-xs select-none ${className}`}
      title="Waktu Real-Time Sistem PRIMA (WIB)"
    >
      <div className="relative flex items-center justify-center">
        <Clock className="w-3.5 h-3.5 text-[#0054a6] dark:text-[#38bdf8]" />
        <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
        <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-500" />
      </div>

      <div className="flex items-center gap-1.5 text-xs">
        {showDate && !compact && (
          <span className="hidden md:inline font-medium text-slate-600 dark:text-slate-300">
            {dayName}, {dateNum} {monthName} {yearNum}
          </span>
        )}

        {showDate && !compact && (
          <span className="hidden md:inline text-slate-300 dark:text-slate-700">·</span>
        )}

        <div className="font-mono font-bold tracking-tight text-slate-900 dark:text-white tabular-nums flex items-center">
          <span>{hours}</span>
          <span className="animate-pulse text-[#00aded]">:</span>
          <span>{minutes}</span>
          <span className="animate-pulse text-[#00aded]">:</span>
          <span className="text-[#0054a6] dark:text-[#38bdf8]">{seconds}</span>
          <span className="ml-1 text-[10px] font-semibold text-amber-600 dark:text-amber-400">
            WIB
          </span>
        </div>
      </div>
    </div>
  );
};
