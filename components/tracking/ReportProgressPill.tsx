'use client';

import { useMemo } from 'react';
import type { ReportStatus } from '@/lib/types';

interface Props {
  status: ReportStatus | string;
  size?: 'sm' | 'md';
}

export function ReportProgressPill({ status, size = 'sm' }: Props) {
  const meta = useMemo(() => {
    switch (status) {
      case 'Selesai':
        return {
          currentStep: 4,
          totalSteps: 4,
          label: 'Tahap 4/4: Tuntas & Terverifikasi',
          segmentColor: 'bg-emerald-600',
          textColor: 'text-emerald-700',
          bgLight: 'bg-emerald-50/60',
          border: 'border-emerald-200/80',
        };
      case 'On-Process':
        return {
          currentStep: 3,
          totalSteps: 4,
          label: 'Tahap 3/4: Pengerjaan Lapangan',
          segmentColor: 'bg-amber-500',
          textColor: 'text-amber-800',
          bgLight: 'bg-amber-50/70',
          border: 'border-amber-200/80',
        };
      case 'Ditolak':
        return {
          currentStep: 0,
          totalSteps: 4,
          label: 'Aduan Dihentikan (Ditolak)',
          segmentColor: 'bg-rose-500',
          textColor: 'text-rose-700',
          bgLight: 'bg-rose-50/60',
          border: 'border-rose-200/80',
        };
      case 'Menunggu':
      default:
        return {
          currentStep: 1,
          totalSteps: 4,
          label: 'Tahap 1/4: Menunggu Verifikasi',
          segmentColor: 'bg-slate-700',
          textColor: 'text-slate-700',
          bgLight: 'bg-slate-50',
          border: 'border-slate-200/80',
        };
    }
  }, [status]);

  const isRejected = status === 'Ditolak';

  return (
    <div
      className={`rounded-xl border ${meta.border} ${meta.bgLight} ${
        size === 'sm' ? 'px-3 py-1.5' : 'px-3.5 py-2'
      } space-y-1.5`}
    >
      <div className="flex items-center justify-between text-[11px]">
        <span className={`font-semibold ${meta.textColor}`}>{meta.label}</span>
        <span className="font-mono text-[10px] text-slate-500">
          {isRejected ? '0%' : `${Math.round((meta.currentStep / meta.totalSteps) * 100)}%`}
        </span>
      </div>

      {/* 4-segment slim progress bar */}
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4].map((step) => {
          const isFilled = !isRejected && step <= meta.currentStep;
          return (
            <div
              key={step}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                isRejected
                  ? 'bg-rose-200'
                  : isFilled
                  ? meta.segmentColor
                  : 'bg-slate-200/80'
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}
