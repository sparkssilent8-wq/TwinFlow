import React, { useState } from 'react';
import { TelemetryData, WellStaticData, WhatIfScenarioInput } from '../types/wellTwin';
import { simulateWhatIf } from '../services/simulationEngine';
import {
  Cpu,
  TrendingUp,
  DollarSign,
  Flame,
  Droplets,
  Sliders,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Layers,
  ArrowUpRight
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
  Legend
} from 'recharts';

interface PredictionsViewProps {
  wellData: WellStaticData;
  telemetry: TelemetryData;
}

export const PredictionsView: React.FC<PredictionsViewProps> = ({ wellData, telemetry }) => {
  const [scenarioInput, setScenarioInput] = useState<WhatIfScenarioInput>({
    steamVolumeTons: 2500,
    steamQualityPct: 86,
    soakDays: 6,
    srpStrokeLength: 120,
    srpSpm: 5.2,
    vfdDownstrokeSlowdownPct: 35,
    diluentInjectionRateBpd: 12
  });

  const simResult = simulateWhatIf(scenarioInput);

  const handleApplyPresetOptimal = () => {
    setScenarioInput({
      steamVolumeTons: 2600,
      steamQualityPct: 88,
      soakDays: 6,
      srpStrokeLength: 120,
      srpSpm: 5.6,
      vfdDownstrokeSlowdownPct: 38,
      diluentInjectionRateBpd: 10
    });
  };

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="p-4 rounded-xl scada-panel flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-cyan-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              {wellData.name} • AI Hybrid PINN Production Prediction & What-If Studio
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Physics-Informed Neural Network (PINN) coupled with reservoir thermodynamic decline and SRP lifting mechanics.
          </p>
        </div>

        <button
          onClick={handleApplyPresetOptimal}
          className="px-3 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs rounded-lg shadow transition flex items-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5" /> AI Recommended Optimum Scenario
        </button>
      </div>

      {/* Economic & Recovery Summary KPI Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl scada-panel border-cyan-500/30">
          <div className="flex justify-between items-start">
            <span className="text-xs uppercase text-slate-400 font-medium">90-Day Oil Recovery</span>
            <span className="p-1.5 rounded bg-cyan-500/10 text-cyan-300">
              <Droplets className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-cyan-200">
              {simResult.totalOptOilBbl.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400">Bbls</span>
          </div>
          <div className="mt-1 text-[11px] text-emerald-400 flex items-center gap-1 font-mono font-semibold">
            <ArrowUpRight className="w-3 h-3" /> +{simResult.netGainBbl.toLocaleString()} Bbls (+{simResult.gainPct}%)
          </div>
        </div>

        <div className="p-3.5 rounded-xl scada-panel border-emerald-500/30">
          <div className="flex justify-between items-start">
            <span className="text-xs uppercase text-slate-400 font-medium">Net Field Operating Margin</span>
            <span className="p-1.5 rounded bg-emerald-500/10 text-emerald-300">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-emerald-300">
              ${(simResult.netProfit / 1000).toFixed(1)}k
            </span>
            <span className="text-xs text-slate-400">USD</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-400 font-mono">
            Rev: ${(simResult.grossRevenue / 1000).toFixed(0)}k | Steam: ${(simResult.steamCost / 1000).toFixed(0)}k
          </div>
        </div>

        <div className="p-3.5 rounded-xl scada-panel border-amber-500/30">
          <div className="flex justify-between items-start">
            <span className="text-xs uppercase text-slate-400 font-medium">Predicted Cumulative SOR</span>
            <span className="p-1.5 rounded bg-amber-500/10 text-amber-300">
              <Flame className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-amber-300">
              {simResult.cumulativeSor}
            </span>
            <span className="text-xs text-slate-400">m³/m³</span>
          </div>
          <div className="mt-1 text-[11px] text-emerald-400 font-mono">
            Target Economic &lt; 3.8
          </div>
        </div>

        <div className={`p-3.5 rounded-xl scada-panel ${simResult.isRodFloating ? 'border-rose-500/50 scada-glow-red' : 'border-emerald-500/30'}`}>
          <div className="flex justify-between items-start">
            <span className="text-xs uppercase text-slate-400 font-medium">Rod Floating Risk</span>
            <span className={`p-1.5 rounded ${simResult.isRodFloating ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/10 text-emerald-300'}`}>
              <ShieldCheck className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className={`text-2xl font-bold font-mono ${simResult.isRodFloating ? 'text-rose-400' : 'text-emerald-300'}`}>
              {(simResult.rodFloatingRisk * 100).toFixed(0)}%
            </span>
            <span className="text-xs text-slate-400">{simResult.isRodFloating ? 'RISK HIGH' : 'SAFE'}</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            {simResult.isRodFloating ? 'Slow down downstroke!' : 'VFD downstroke damping optimal'}
          </div>
        </div>
      </div>

      {/* Main Grid: What-If Parameter Controls vs Forecast Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column (5 cols): What-If Sliders */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-4 rounded-xl scada-panel">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-cyan-400" />
                What-If Scenario Sliders
              </span>
              <button
                onClick={() =>
                  setScenarioInput({
                    steamVolumeTons: 2000,
                    steamQualityPct: 80,
                    soakDays: 8,
                    srpStrokeLength: 120,
                    srpSpm: 6.5,
                    vfdDownstrokeSlowdownPct: 0,
                    diluentInjectionRateBpd: 0
                  })
                }
                className="text-[11px] text-slate-400 hover:text-cyan-300 transition"
              >
                Reset to Baseline
              </button>
            </div>

            <div className="space-y-3.5">
              {/* Steam Volume */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">Steam Volume:</span>
                  <span className="font-mono font-bold text-orange-400">{scenarioInput.steamVolumeTons.toLocaleString()} Tons</span>
                </div>
                <input
                  type="range"
                  min="1200"
                  max="3500"
                  step="50"
                  value={scenarioInput.steamVolumeTons}
                  onChange={(e) => setScenarioInput({ ...scenarioInput, steamVolumeTons: parseInt(e.target.value) })}
                  className="w-full accent-orange-400 cursor-pointer"
                />
              </div>

              {/* Steam Quality */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">Steam Quality:</span>
                  <span className="font-mono font-bold text-cyan-300">{scenarioInput.steamQualityPct}%</span>
                </div>
                <input
                  type="range"
                  min="70"
                  max="95"
                  step="1"
                  value={scenarioInput.steamQualityPct}
                  onChange={(e) => setScenarioInput({ ...scenarioInput, steamQualityPct: parseInt(e.target.value) })}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              {/* Soak Days */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">Thermal Soak Duration:</span>
                  <span className="font-mono font-bold text-amber-300">{scenarioInput.soakDays} Days</span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="14"
                  step="1"
                  value={scenarioInput.soakDays}
                  onChange={(e) => setScenarioInput({ ...scenarioInput, soakDays: parseInt(e.target.value) })}
                  className="w-full accent-amber-400 cursor-pointer"
                />
              </div>

              {/* SRP SPM */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">Sucker Rod Pump Speed:</span>
                  <span className="font-mono font-bold text-white">{scenarioInput.srpSpm.toFixed(1)} SPM</span>
                </div>
                <input
                  type="range"
                  min="2.0"
                  max="8.5"
                  step="0.2"
                  value={scenarioInput.srpSpm}
                  onChange={(e) => setScenarioInput({ ...scenarioInput, srpSpm: parseFloat(e.target.value) })}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              {/* VFD Downstroke Slowdown */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">VFD Downstroke Slowdown:</span>
                  <span className="font-mono font-bold text-emerald-400">-{scenarioInput.vfdDownstrokeSlowdownPct}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="55"
                  step="5"
                  value={scenarioInput.vfdDownstrokeSlowdownPct}
                  onChange={(e) => setScenarioInput({ ...scenarioInput, vfdDownstrokeSlowdownPct: parseInt(e.target.value) })}
                  className="w-full accent-emerald-400 cursor-pointer"
                />
              </div>

              {/* Diluent Solvent Co-Injection */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">Diluent / Solvent Co-Injection:</span>
                  <span className="font-mono font-bold text-blue-300">{scenarioInput.diluentInjectionRateBpd} BPD</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="35"
                  step="2"
                  value={scenarioInput.diluentInjectionRateBpd}
                  onChange={(e) => setScenarioInput({ ...scenarioInput, diluentInjectionRateBpd: parseInt(e.target.value) })}
                  className="w-full accent-blue-400 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* PINN Model Physics Architecture Card */}
          <div className="p-4 rounded-xl scada-panel">
            <div className="flex items-center gap-2 pb-2 mb-2 border-b border-slate-800">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                PINN Hybrid Loss Formulation
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Unlike generic black-box ML, the Baghewala PINN integrates loss penalty functions enforcing:
            </p>
            <ul className="mt-2 space-y-1 text-[11px] text-slate-400 list-disc list-inside">
              <li><strong className="text-slate-200">First Law of Thermodynamics:</strong> Enthalpy conservation in porous sandstone matrix.</li>
              <li><strong className="text-slate-200">Couette-Poiseuille Flow:</strong> Non-Newtonian viscous drag on tapered rod strings.</li>
              <li><strong className="text-slate-200">Gibbs Wave Equation:</strong> Dynamic wave propagation along 1,000m steel rods.</li>
            </ul>
          </div>
        </div>

        {/* Right Column (7 cols): 90-Day Production & Thermal Forecast Charts */}
        <div className="lg:col-span-7 space-y-4">
          {/* Production Forecast Chart: Baseline vs AI Optimized */}
          <div className="p-4 rounded-xl scada-panel">
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  90-Day Production Forecast (Baseline vs AI Optimized)
                </span>
                <p className="text-[11px] text-slate-400">
                  Oil rate decline showing thermal dissipation and rod float mitigation
                </p>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                +{simResult.gainPct}% Total Bbl
              </span>
            </div>

            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={simResult.forecast} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
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
                    dataKey="optimizedOilBopd"
                    name="AI Optimized Oil Rate (BOPD)"
                    stroke="#00d2ff"
                    fill="rgba(0, 210, 255, 0.2)"
                    strokeWidth={2.5}
                  />
                  <Area
                    type="monotone"
                    dataKey="baselineOilBopd"
                    name="Baseline Oil Rate (BOPD)"
                    stroke="#64748b"
                    fill="rgba(100, 116, 139, 0.1)"
                    strokeWidth={1.5}
                    strokeDasharray="4 2"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Thermal Decay & Viscosity Progression Chart */}
          <div className="p-4 rounded-xl scada-panel">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Reservoir Temperature & Viscosity Progression
              </span>
              <span className="text-[10px] font-mono text-amber-300">
                Walther-Andrade Correlation
              </span>
            </div>

            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={simResult.forecast} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#162842" />
                  <XAxis dataKey="day" stroke="#64748b" tick={{ fontSize: 10 }} />
                  <YAxis yAxisId="temp" stroke="#f97316" tick={{ fontSize: 10 }} />
                  <YAxis yAxisId="visc" orientation="right" stroke="#ef4444" tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#070f1e', borderColor: '#1e3a5f', borderRadius: '8px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Line
                    yAxisId="temp"
                    type="monotone"
                    dataKey="bottomHoleTempC"
                    name="Bottomhole Temp (°C)"
                    stroke="#f97316"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    yAxisId="visc"
                    type="monotone"
                    dataKey="viscosityCp"
                    name="Viscosity (cP)"
                    stroke="#ef4444"
                    strokeDasharray="3 3"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
