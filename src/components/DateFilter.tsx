import { useState, useMemo } from 'react';
import { Calendar } from 'lucide-react';

type Preset = 'today' | 'week' | 'month' | 'quarter' | 'year' | 'all' | 'custom';

interface DateFilterProps {
  onChange: (start: string | null, end: string | null) => void;
}

export function DateFilter({ onChange }: DateFilterProps) {
  const [preset, setPreset] = useState<Preset>('all');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const presets: { value: Preset; label: string }[] = [
    { value: 'all', label: 'Todas' },
    { value: 'today', label: 'Hoje' },
    { value: 'week', label: 'Semana' },
    { value: 'month', label: 'Mês' },
    { value: 'quarter', label: 'Trimestre' },
    { value: 'year', label: 'Ano' },
    { value: 'custom', label: 'Personalizado' },
  ];

  const dates = useMemo(() => {
    if (preset === 'all') return { start: null, end: null };
    if (preset === 'custom') return { start: customStart || null, end: customEnd || null };

    const now = new Date();
    let start: Date;
    let end: Date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    switch (preset) {
      case 'today':
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week': {
        const d = new Date(now);
        d.setDate(d.getDate() - d.getDay());
        start = new Date(d.getFullYear(), d.getMonth(), d.getDate());
        break;
      }
      case 'month':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'quarter': {
        const q = Math.floor(now.getMonth() / 3) * 3;
        start = new Date(now.getFullYear(), q, 1);
        break;
      }
      case 'year':
        start = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        start = new Date(0);
    }
    return { start: start.toISOString(), end: end.toISOString() };
  }, [preset, customStart, customEnd]);

  const handlePresetChange = (value: Preset) => {
    setPreset(value);
    if (value !== 'custom') {
      const d = value === 'all' ? { start: null, end: null } : dates;
      onChange(d.start, d.end);
    }
  };

  const handleCustomApply = () => {
    onChange(customStart ? new Date(customStart).toISOString() : null,
            customEnd ? new Date(customEnd + 'T23:59:59').toISOString() : null);
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Calendar className="h-4 w-4 text-slate-400" />
      <div className="flex gap-1 flex-wrap">
        {presets.map(p => (
          <button
            key={p.value}
            onClick={() => handlePresetChange(p.value)}
            className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer ${
              preset === p.value
                ? 'bg-primary text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
      {preset === 'custom' && (
        <div className="flex items-center gap-1">
          <input
            type="date"
            value={customStart}
            onChange={e => setCustomStart(e.target.value)}
            className="text-[11px] border border-slate-200 dark:border-slate-700 rounded px-1.5 py-1 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
          />
          <span className="text-[11px] text-slate-400">a</span>
          <input
            type="date"
            value={customEnd}
            onChange={e => setCustomEnd(e.target.value)}
            className="text-[11px] border border-slate-200 dark:border-slate-700 rounded px-1.5 py-1 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
          />
          <button
            onClick={handleCustomApply}
            className="px-2 py-1 text-[11px] font-semibold bg-primary text-white rounded-lg cursor-pointer"
          >
            OK
          </button>
        </div>
      )}
    </div>
  );
}
