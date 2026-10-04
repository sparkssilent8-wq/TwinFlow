import React, { useState } from 'react';
import { TelemetryData, WellStaticData, WellPhase } from '../types/wellTwin';
import {
  Flame,
  Thermometer,
  Clock,
  Sparkles,
  TrendingDown,
  Layers,
  CheckCircle2,
  AlertCircle,
  BarChart2,
  Wind
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  BarChart,
  Bar
} from 'recharts';

interface CSSOptimizationViewProps {
  wellData: WellStaticData;
  telemetry: TelemetryData;
  onUpdateParams: (newParams: Partial<TelemetryData>) => void;
  onTransitionPhase: (newPhase: WellPhase) => void;
}

export const CSSOptimizationView: React.FC<CSSOptimizationViewProps> = ({
  wellData,
  telemetry,
  onUpdateParams,
  onTransitionPhase
}) => {
  const [steamVol, setSteamVol] = useState<number>(telemetry.targetSteamVolumeTons || 2400);
  const [steamQuality, setSteamQuality] = useState<number>(telemetry.steamQualityPct || 84);
  const [soakDays, setSoakDays] = useState<number>(telemetry.targetSoakDays || 8);
  const [injPressure, setInjPressure] = useState<number>(telemetry.steamInjectionPressureBar || 88);

  // Thermodynamic heat decay curve data based on soak days
  const heatDecayData = Array.from({ length: 15 }, (_, i) => {
    const day = i + 1;
    // Core wellbore temperature decays exponentially
    const coreTemp = Math.round(290 * Math.exp(-0.045 * day) + 38);
    // Sandstone matrix temperature peaks around day 4-6 as heat conducts outwards
    const matrixTemp = Math.round(185 * (1 - Math.exp(-0.4 * day)) * Math.exp(-0.03 * day) + 38);
    // Overburden heat loss increases with prolonged soak
    const overburdenLossPct = Math.min(38, Math.round(day * 2.4));

    return {
      day: `Day ${day}`,
      coreTemp,
      matrixTemp,
      overburdenLossPct,
      optimalWindow: day >= 5 && day <= 8
    };
  });

  // Multi-cycle historical comparison (Cycles 1 to 4)
  const cycleComparisonData = [
    { cycle: 'Cycle 1 (Initial)', steamTons: 1800, oilProducedBbl: 21500, sor: 2.85, peakRate: 185 },
    { cycle: 'Cycle 2', steamTons: 2100, oilProducedBbl: 19800, sor: 3.15, peakRate: 168 },
    { cycle: 'Cycle 3 (Current)', steamTons: steamVol, oilProducedBbl: 18450, sor: Number((steamVol / 720).toFixed(2)), peakRate: 150 },
    { cycle: 'Cycle 4 (AI Projected)', steamTons: 2550, oilProducedBbl: 20200, sor: 3.25, peakRate: 162 }
  ];

  const handleApplyAITargets = () => {
    setSteamVol(2550);
    setSteamQuality(88);
    setSoakDays(6);
    setInjPressure(92);
    onUpdateParams({
      targetSteamVolumeTons: 2550,
      steamQualityPct: 88,
      targetSoakDays: 6,
      steamInjectionPressureBar: 92
    });
  };

  return (
    <div className="space-y-4">
      {/* Header & Phase Switcher Ribbon */}
      <div className="p-4 rounded-xl scada-panel flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              {wellData.name} • Cyclic Steam Stimulation (CSS) Optimizer
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Optimize steam slug size, injection enthalpy, and soaking duration to minimize Steam-Oil Ratio (SOR) in Jodhpur Sandstone.
          </p>
        </div>

        {/* Phase transition controllers */}
        <div className="flex items-center gap-2 bg-[#091322] p-1.5 rounded-lg border border-slate-800">
          <span className="text-xs text-slate-400 font-medium px-2">Cycle Phase:</span>
          {(['INJECTION', 'SOAKING', 'PRODUCTION'] as WellPhase[]).map((phase) => {
            const isCurrent = telemetry.cssPhase === phase;
            return (
              <button
                key={phase}
                onClick={() => onTransitionPhase(phase)}
                className={`px-3 py-1.5 rounded text-xs font-bold transition flex items-center gap-1.5 ${
                  isCurrent
                    ? phase === 'INJECTION'
                      ? 'bg-orange-500 text-white shadow'
                      : phase === 'SOAKING'
                      ? 'bg-amber-500 text-slate-950 shadow'
                      : 'bg-emerald-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {phase}
              </button>
            );
          })}
        </div>
      </div>

      {/* Cycle Stage Timeline Progress Bar */}
      <div className="p-4 rounded-xl scada-panel">
        <div className="flex justify-between text-xs font-semibold text-slate-300 mb-2">
          <span>Cycle Stage Progression (Cycle #{wellData.currentCycle})</span>
          <span className="font-mono text-cyan-400">
            {telemetry.cssPhase === 'INJECTION'
              ? `Injection: ${telemetry.daysInCurrentPhase}/14 Days (${telemetry.currentSteamDeliveredTons}/${telemetry.targetSteamVolumeTons} Tons)`
              : telemetry.cssPhase === 'SOAKING'
              ? `Soaking: ${telemetry.soakDaysElapsed}/${telemetry.targetSoakDays} Days (Heat Penetrating Matrix)`
              : `Production: ${telemetry.daysInCurrentPhase}/120 Days on Artificial Lift`}
          </span>
        </div>

        <div className="w-full bg-slate-800 rounded-full h-3 flex overflow-hidden p-0.5 border border-slate-700">
          <div
            className={`h-full rounded-l-full transition-all duration-500 ${
              telemetry.cssPhase === 'INJECTION'
                ? 'bg-orange-500 animate-pulse'
                : 'bg-orange-600/70'
            }`}
            style={{ width: '25%' }}
            title="Stage 1: High Pressure Steam Injection (14 Days)"
          />
          <div
            className={`h-full transition-all duration-500 ${
              telemetry.cssPhase === 'SOAKING'
                ? 'bg-amber-400 animate-pulse'
                : telemetry.cssPhase === 'PRODUCTION'
                ? 'bg-amber-500/70'
                : 'bg-slate-700'
            }`}
            style={{ width: '15%' }}
            title="Stage 2: Thermal Soaking & Viscosity Reduction (8 Days)"
          />
          <div
            className={`h-full rounded-r-full transition-all duration-500 ${
              telemetry.cssPhase === 'PRODUCTION'
                ? 'bg-emerald-500'
                : 'bg-slate-700'
            }`}
            style={{ width: '60%' }}
            title="Stage 3: Heated Crude Production via SRP (90-120 Days)"
          />
        </div>

        <div className="flex justify-between text-[11px] text-slate-400 mt-2 font-mono">
          <span className="text-orange-400">Phase 1: Steam Injection</span>
          <span className="text-amber-400">Phase 2: Thermal Soak</span>
          <span className="text-emerald-400">Phase 3: SRP Production</span>
        </div>
      </div>

      {/* Main Grid: Parametric Controls vs Heat Dissipation Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column (5 cols): Parameter Tuning & AI Recommender */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-4 rounded-xl scada-panel">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                CSS Parametric Setpoints
              </span>
              <button
                onClick={handleApplyAITargets}
                className="px-2.5 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 rounded text-xs font-bold transition flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" /> Auto AI Calibration
              </button>
            </div>

            <div className="space-y-4">
              {/* Target Steam Volume */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">Target Steam Slug Volume:</span>
                  <span className="font-mono font-bold text-orange-400">{steamVol.toLocaleString()} Tons CWE</span>
                </div>
                <input
                  type="range"
                  min="1000"
                  max="3500"
                  step="50"
                  value={steamVol}
                  onChange={(e) => {
                    const v = parseInt(e.target.value);
                    setSteamVol(v);
                    onUpdateParams({ targetSteamVolumeTons: v });
                  }}
                  className="w-full accent-orange-400 cursor-pointer"
                />
                <span className="text-[10px] text-slate-400 flex justify-between">
                  <span>Economic Min: 1,200T</span>
                  <span>Max Safe: 3,200T</span>
                </span>
              </div>

              {/* Steam Quality */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">Steam Quality (Vapor Fraction):</span>
                  <span className="font-mono font-bold text-cyan-300">{steamQuality}% Quality</span>
                </div>
                <input
                  type="range"
                  min="70"
                  max="95"
                  step="1"
                  value={steamQuality}
                  onChange={(e) => {
                    const q = parseInt(e.target.value);
                    setSteamQuality(q);
                    onUpdateParams({ steamQualityPct: q });
                  }}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
                <span className="text-[10px] text-slate-400">
                  Enthalpy: {Math.round(2100 + steamQuality * 5.2)} kJ/kg (Latent Heat: 68%)
                </span>
              </div>

              {/* Injection Pressure */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">Injection Pressure:</span>
                  <span className="font-mono font-bold text-white">{injPressure} bar</span>
                </div>
                <input
                  type="range"
                  min="70"
                  max="120"
                  step="2"
                  value={injPressure}
                  onChange={(e) => {
                    const p = parseInt(e.target.value);
                    setInjPressure(p);
                    onUpdateParams({ steamInjectionPressureBar: p });
                  }}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
                <span className="text-[10px] text-slate-400">
                  Fracture Breakdown Pressure Limit: 115 bar (Safe Margin: {115 - injPressure} bar)
                </span>
              </div>

              {/* Soak Duration */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">Soak Period Duration:</span>
                  <span className="font-mono font-bold text-amber-300">{soakDays} Days</span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="16"
                  step="1"
                  value={soakDays}
                  onChange={(e) => {
                    const d = parseInt(e.target.value);
                    setSoakDays(d);
                    onUpdateParams({ targetSoakDays: d });
                  }}
                  className="w-full accent-amber-400 cursor-pointer"
                />
                <span className="text-[10px] text-slate-400">
                  AI Recommendation: 5.5 - 6.5 Days to prevent conductive heat loss to shale
                </span>
              </div>
            </div>
          </div>

          {/* Energy & Carbon Footprint Card */}
          <div className="p-4 rounded-xl scada-panel">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Thermal Energy & ESG Metrics
              </span>
              <span className="text-[10px] font-mono text-emerald-400">OTSG Boiler #2</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Net Energy Ratio (NER)</span>
                <span className="text-base font-bold font-mono text-cyan-300">
                  {telemetry.netEnergyRatio.toFixed(2)}:1
                </span>
              </div>
              <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Boiler Gas Consumption</span>
                <span className="text-base font-bold font-mono text-white">4,820 SCM/day</span>
              </div>
              <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                <span className="text-slate-400 block text-[10px]">CO2 Intensity</span>
                <span className="text-base font-bold font-mono text-amber-300">
                  {telemetry.co2EmissionsTonsPerDay.toFixed(1)} t/day
                </span>
              </div>
              <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Instantaneous SOR</span>
                <span className="text-base font-bold font-mono text-emerald-300">
                  {telemetry.instantaneousSOR > 0 ? telemetry.instantaneousSOR.toFixed(2) : '3.12'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (7 cols): Thermodynamic Models & Multi-Cycle Hysteresis */}
        <div className="lg:col-span-7 space-y-4">
          {/* Heat Decay & Soak Optimization Chart */}
          <div className="p-4 rounded-xl scada-panel">
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Thermodynamic Heat Dissipation vs Soak Days
                </span>
                <p className="text-[11px] text-slate-400">
                  Wellbore core vs Jodhpur sandstone matrix conduction & overburden loss
                </p>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Optimal Window: Day 5 - 7
              </span>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={heatDecayData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#162842" />
                  <XAxis dataKey="day" stroke="#64748b" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#070f1e', borderColor: '#1e3a5f', borderRadius: '8px' }}
                    labelStyle={{ color: '#94a3b8', fontSize: '11px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Area
                    type="monotone"
                    dataKey="coreTemp"
                    name="Wellbore Core Temp (°C)"
                    stroke="#ef4444"
                    fill="rgba(239, 68, 68, 0.15)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="matrixTemp"
                    name="Pay Zone Matrix Temp (°C)"
                    stroke="#f59e0b"
                    fill="rgba(245, 158, 11, 0.1)"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="overburdenLossPct"
                    name="Overburden Heat Loss (%)"
                    stroke="#38bdf8"
                    strokeDasharray="4 2"
                    strokeWidth={1.5}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Multi-Cycle Historical & Predictive Performance */}
          <div className="p-4 rounded-xl scada-panel">
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Multi-Cycle Recovery & SOR Hysteresis
                </span>
                <p className="text-[11px] text-slate-400">
                  Performance across successive cycles showing thermal chamber expansion
                </p>
              </div>
              <span className="text-[10px] font-mono text-cyan-400">Oil India Baghewala History</span>
            </div>

            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cycleComparisonData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#162842" />
                  <XAxis dataKey="cycle" stroke="#64748b" tick={{ fontSize: 10 }} />
                  <YAxis yAxisId="left" stroke="#38bdf8" tick={{ fontSize: 10 }} />
                  <YAxis yAxisId="right" orientation="right" stroke="#f59e0b" tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#070f1e', borderColor: '#1e3a5f', borderRadius: '8px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Bar
                    yAxisId="left"
                    dataKey="oilProducedBbl"
                    name="Oil Recovered (Bbl)"
                    fill="#00d2ff"
                    radius={[4, 4, 0, 0]}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="sor"
                    name="Steam-to-Oil Ratio (SOR)"
                    stroke="#f97316"
                    strokeWidth={3}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
