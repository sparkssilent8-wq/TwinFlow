import React from 'react';
import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  unit?: string;
  subtext?: string;
  icon: LucideIcon;
  status?: 'optimal' | 'warning' | 'danger' | 'neutral';
  trend?: 'up' | 'down' | 'flat';
  trendValue?: string;
  progressPct?: number;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  unit,
  subtext,
  icon: Icon,
  status = 'neutral',
  trend,
  trendValue,
  progressPct
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'optimal':
        return {
          border: 'border-emerald-500/30',
          bg: 'from-emerald-950/30 to-slate-900/80',
          iconBg: 'bg-emerald-500/10 text-emerald-400',
          valueColor: 'text-emerald-300',
          progressColor: 'bg-emerald-500'
        };
      case 'warning':
        return {
          border: 'border-amber-500/30',
          bg: 'from-amber-950/30 to-slate-900/80',
          iconBg: 'bg-amber-500/10 text-amber-400',
          valueColor: 'text-amber-300',
          progressColor: 'bg-amber-500'
        };
      case 'danger':
        return {
          border: 'border-rose-500/40 shadow-rose-950/30 shadow-lg',
          bg: 'from-rose-950/40 to-slate-900/80',
          iconBg: 'bg-rose-500/20 text-rose-400',
          valueColor: 'text-rose-300',
          progressColor: 'bg-rose-500'
        };
      default:
        return {
          border: 'border-cyan-500/20',
          bg: 'from-cyan-950/20 to-slate-900/80',
          iconBg: 'bg-cyan-500/10 text-cyan-400',
          valueColor: 'text-white',
          progressColor: 'bg-cyan-500'
        };
    }
  };

  const colors = getStatusColor();

  return (
    <div
      className={`relative p-4 rounded-xl border bg-gradient-to-br ${colors.bg} ${colors.border} transition-all duration-200 hover:border-cyan-400/40`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="text-xs font-medium text-slate-400 tracking-wide uppercase">{title}</span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className={`text-2xl font-extrabold font-mono tracking-tight ${colors.valueColor}`}>
              {value}
            </span>
            {unit && <span className="text-xs font-semibold text-slate-400">{unit}</span>}
          </div>
        </div>
        <div className={`p-2.5 rounded-lg ${colors.iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {(subtext || trendValue) && (
        <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 pt-2">
          <span>{subtext}</span>
          {trendValue && (
            <span
              className={`font-semibold font-mono ${
                trend === 'up'
                  ? 'text-emerald-400'
                  : trend === 'down'
                  ? 'text-rose-400'
                  : 'text-slate-400'
              }`}
            >
              {trend === 'up' ? '▲ ' : trend === 'down' ? '▼ ' : '• '}
              {trendValue}
            </span>
          )}
        </div>
      )}

      {progressPct !== undefined && (
        <div className="mt-2 w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
          <div
            className={`h-full ${colors.progressColor} rounded-full transition-all duration-500`}
            style={{ width: `${Math.min(100, Math.max(0, progressPct))}%` }}
          />
        </div>
      )}
    </div>
  );
};
