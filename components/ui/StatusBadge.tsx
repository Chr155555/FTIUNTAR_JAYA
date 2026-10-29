export function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; dot: string; label: string }> = {
    'Selesai': {
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/70',
      dot: 'bg-emerald-500',
      label: 'Selesai'
    },
    'On-Process': {
      bg: 'bg-yellow-100 text-slate-900 border-yellow-300 font-semibold',
      dot: 'bg-amber-500 animate-pulse',
      label: 'Sedang Dikerjakan'
    },
    'Ditolak': {
      bg: 'bg-rose-50 text-rose-700 border-rose-200/70',
      dot: 'bg-rose-400',
      label: 'Ditolak'
    },
    'Menunggu': {
      bg: 'bg-slate-100/90 text-slate-700 border-slate-200/80',
      dot: 'bg-slate-400',
      label: 'Menunggu'
    },
  };

  const item = config[status] || config['Menunggu'];

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${item.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${item.dot}`} />
      <span>{item.label}</span>
    </span>
  );
}
