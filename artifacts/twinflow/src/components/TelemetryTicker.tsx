import React from 'react';
import { TelemetryData } from '../types/wellTwin';
import { Droplets, Flame, Gauge, Activity, AlertCircle, Zap, Thermometer, Wind } from 'lucide-react';

interface TelemetryTickerProps {
  telemetry: TelemetryData;
}

export const TelemetryTicker: React.FC<TelemetryTickerProps> = ({ telemetry }) => {
  const isRodFloating = telemetry.rodFloatingIndex >= 0.78;

  const items = [
    {
      label: 'Oil Rate',
      value: `${telemetry.oilRateBopd.toFixed(1)} BOPD`,
      icon: Droplets,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10'
    },
    {
      label: 'Water Cut',
      value: `${telemetry.waterCutPct.toFixed(1)}%`,
      icon: Droplets,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10'
    },
    {
      label: 'Bottomhole Temp',
      value: `${telemetry.bottomHoleTempC.toFixed(1)} °C`,
      icon: Thermometer,
      color: telemetry.bottomHoleTempC > 100 ? 'text-orange-400' : 'text-slate-300',
      bgColor: 'bg-orange-500/10'
    },
    {
      label: 'Heavy Oil Viscosity',
      value: `${telemetry.nearWellboreViscosityCp.toLocaleString()} cP`,
      icon: Activity,
      color: telemetry.nearWellboreViscosityCp > 3000 ? 'text-rose-400' : 'text-emerald-400',
      bgColor: 'bg-rose-500/10'
    },
    {
      label: 'SRP Speed',
      value: `${telemetry.spm.toFixed(1)} SPM`,
      icon: Gauge,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10'
    },
    {
      label: 'Peak Rod Load (PPRL)',
      value: `${telemetry.peakPolishedRodLoadLbs.toLocaleString()} lbs`,
      icon: Zap,
      color: telemetry.polishedRodStressPct > 80 ? 'text-rose-400' : 'text-slate-300',
      bgColor: 'bg-slate-700/20'
    },
    {
      label: 'Rod Float Index',
      value: `${(telemetry.rodFloatingIndex * 100).toFixed(0)}%`,
      icon: AlertCircle,
      color: isRodFloating ? 'text-rose-400 font-extrabold animate-pulse' : 'text-emerald-400',
      bgColor: isRodFloating ? 'bg-rose-500/20' : 'bg-emerald-500/10'
    },
    {
      label: 'Instantaneous SOR',
      value: `${telemetry.instantaneousSOR.toFixed(2)} m³/m³`,
      icon: Flame,
      color: telemetry.instantaneousSOR > 4.5 ? 'text-amber-400' : 'text-cyan-400',
      bgColor: 'bg-amber-500/10'
    },
    {
      label: 'Tubing Head Press',
      value: `${telemetry.tubingHeadPressureBar.toFixed(1)} bar`,
      icon: Wind,
      color: 'text-slate-300',
      bgColor: 'bg-slate-700/20'
    },
    {
      label: 'VFD Frequency',
      value: `${telemetry.vfdFrequencyHz.toFixed(1)} Hz`,
      icon: Zap,
      color: 'text-cyan-300',
      bgColor: 'bg-cyan-500/10'
    }
  ];

  return (
    <div className="bg-[#050c18] border-b border-cyan-500/15 py-1.5 px-4 overflow-hidden relative shadow-inner">
      <div className="flex items-center gap-6 overflow-x-auto scrollbar-none py-0.5">
        <div className="flex items-center gap-2 pl-1 pr-3 border-r border-slate-800 text-[10px] font-mono font-bold tracking-wider text-cyan-400 shrink-0 uppercase">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          SCADA LIVE STREAM
        </div>
        <div className="flex items-center gap-6 shrink-0">
          {items.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="flex items-center gap-2 text-xs">
                <span className={`p-1 rounded ${item.bgColor}`}>
                  <Icon className={`w-3.5 h-3.5 ${item.color}`} />
                </span>
                <span className="text-slate-400 text-[11px] font-medium">{item.label}:</span>
                <span className={`font-mono font-semibold ${item.color}`}>{item.value}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
