import React, { useState } from 'react';
import { TelemetryData, WellStaticData, DynacardData } from '../types/wellTwin';
import { DynacardCanvas } from '../components/DynacardCanvas';
import { calculateRodFloating, generateDynacard } from '../services/simulationEngine';
import {
  Sliders,
  Zap,
  Gauge,
  Activity,
  AlertTriangle,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  TrendingDown,
  Info
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';

interface SRPOptimizationViewProps {
  wellData: WellStaticData;
  telemetry: TelemetryData;
  dynacard: DynacardData;
  cyclePhase: number;
  onUpdateParams: (newParams: Partial<TelemetryData>) => void;
  onApplyVfdOptimization: () => void;
}

export const SRPOptimizationView: React.FC<SRPOptimizationViewProps> = ({
  wellData,
  telemetry,
  dynacard,
  cyclePhase,
  onUpdateParams,
  onApplyVfdOptimization
}) => {
  const [selectedFailureMode, setSelectedFailureMode] = useState<DynacardData['diagnosis']>(dynacard.diagnosis);

  const { rodFloatingIndex, viscousDragLbs, terminalDescentSpeedInSec, isFloating } = calculateRodFloating(
    telemetry.spm,
    telemetry.strokeLengthInches,
    telemetry.nearWellboreViscosityCp,
    telemetry.downstrokeRatio
  );

  // Velocity comparison data along stroke
  const strokeKinematics = Array.from({ length: 40 }, (_, i) => {
    const frac = i / 39;
    const isUp = frac <= 0.5;
    const strokePos = Math.sin(frac * Math.PI) * telemetry.strokeLengthInches;
    
    // Surface downward speed
    const surfaceSpeed = isUp
      ? Math.cos((frac / 0.5) * Math.PI) * telemetry.spm * 3.8
      : -Math.cos(((frac - 0.5) / 0.5) * Math.PI) * telemetry.spm * 3.8 * telemetry.downstrokeRatio;

    return {
      point: `${Math.round(frac * 100)}%`,
      strokePos: Number(strokePos.toFixed(1)),
      surfaceSpeed: Math.abs(Number(surfaceSpeed.toFixed(1))),
      terminalSpeed: terminalDescentSpeedInSec
    };
  });

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="p-4 rounded-xl scada-panel flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-cyan-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              {wellData.name} • Sucker Rod Pump (SRP) & Dynacard Diagnostic Studio
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time Gibbs wave equation solver, heavy-oil viscous skin friction modeling, and VFD dual-speed anti-float optimization.
          </p>
        </div>

        {isFloating ? (
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5 animate-pulse">
              <AlertTriangle className="w-4 h-4" /> Rod Floating Active!
            </span>
            <button
              onClick={onApplyVfdOptimization}
              className="px-3.5 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-lg shadow-sm transition flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" /> Auto-Tune VFD Speed
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
            <ShieldCheck className="w-4 h-4" /> Rod Motion Synchronized (No Floating)
          </div>
        )}
      </div>

      {/* Main Grid: Dynacard Visualizer & Diagnostic Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left (7 cols): Large High-Res Dynacard & Diagnostic Mode Picker */}
        <div className="lg:col-span-7 space-y-4">
          <DynacardCanvas
            cardData={generateDynacard(
              wellData.id,
              telemetry.strokeLengthInches,
              telemetry.spm,
              telemetry.nearWellboreViscosityCp,
              telemetry.downstrokeRatio,
              selectedFailureMode
            )}
            height={360}
            width={600}
            showIdeal={true}
            showDownhole={true}
            liveCyclePhase={cyclePhase}
          />

          {/* Failure Pattern Selector (for interactive demonstrations) */}
          <div className="p-4 rounded-xl scada-panel">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Diagnose / Simulate Pump Failure Signature
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Pattern Library</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                'Normal Full Pump',
                'Severe Rod Floating',
                'Fluid Pounding',
                'Gas Interference',
                'Traveling Valve Leak',
                'Standing Valve Leak'
              ].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setSelectedFailureMode(mode as any)}
                  className={`p-2 rounded-lg text-xs font-semibold border transition text-left ${
                    selectedFailureMode === mode
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm'
                      : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  <span className="block text-[11px] font-bold">{mode}</span>
                  <span className="text-[9px] text-slate-400">
                    {mode === 'Severe Rod Floating'
                      ? 'Heavy oil drag on downstroke'
                      : mode === 'Fluid Pounding'
                      ? 'Liquid impact shock'
                      : mode === 'Normal Full Pump'
                      ? 'Optimal box-shape card'
                      : 'Valve/Seal degradation'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right (5 cols): Heavy Oil Drag Physics & VFD Kinematics */}
        <div className="lg:col-span-5 space-y-4">
          {/* Heavy Oil Rod Float Physics Model Box */}
          <div className={`p-4 rounded-xl scada-panel ${isFloating ? 'border-rose-500/40 scada-glow-red' : ''}`}>
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <AlertTriangle className={`w-4 h-4 ${isFloating ? 'text-rose-400 animate-bounce' : 'text-amber-400'}`} />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Heavy Oil Viscous Drag & Float Model
                </span>
              </div>
              <span className="text-[10px] font-mono text-cyan-400">Baghewala Calibration</span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Annular Viscous Drag</span>
                  <span className="text-sm font-bold font-mono text-cyan-300">
                    {viscousDragLbs.toLocaleString()} lbs
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block uppercase">Gravity Settling Limit</span>
                  <span className="text-sm font-bold font-mono text-white">12,400 lbs</span>
                </div>
              </div>

              {/* Float Risk Meter */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 font-medium">Rod Floating Index:</span>
                  <span className={`font-mono font-bold ${isFloating ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {(rodFloatingIndex * 100).toFixed(0)}% ({isFloating ? 'FLOATING / UNSEATED' : 'STABLE'})
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden p-0.5">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isFloating ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, rodFloatingIndex * 100)}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Threshold: When Drag + Buoyancy ≥ 88% Rod Weight, carrier bar disconnects on downstroke.
                </span>
              </div>
            </div>
          </div>

          {/* VFD Dual-Speed Motion Controller */}
          <div className="p-4 rounded-xl scada-panel">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Gauge className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  VFD Dual-Speed Kinematics
                </span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 font-mono font-bold">
                Asymmetric Cycle
              </span>
            </div>

            <div className="space-y-4">
              {/* Upstroke SPM */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">Upstroke Speed (Lifting Stroke):</span>
                  <span className="font-mono font-bold text-cyan-300">{telemetry.spm.toFixed(1)} SPM</span>
                </div>
                <input
                  type="range"
                  min="2.0"
                  max="9.0"
                  step="0.2"
                  value={telemetry.spm}
                  onChange={(e) => onUpdateParams({ spm: parseFloat(e.target.value) })}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              {/* Downstroke SPM Retardation */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">Downstroke Speed (Retardation):</span>
                  <span className={`font-mono font-bold ${telemetry.downstrokeRatio < 0.8 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {(telemetry.spm * telemetry.downstrokeRatio).toFixed(1)} SPM ({Math.round(telemetry.downstrokeRatio * 100)}% speed)
                  </span>
                </div>
                <input
                  type="range"
                  min="0.45"
                  max="1.0"
                  step="0.05"
                  value={telemetry.downstrokeRatio}
                  onChange={(e) => onUpdateParams({ downstrokeRatio: parseFloat(e.target.value) })}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
                <span className="text-[10px] text-slate-400">
                  Reducing downstroke speed allows viscous crude to pass through traveling valve safely.
                </span>
              </div>

              {/* Stroke Length */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">Plunger Gross Stroke Length:</span>
                  <span className="font-mono font-bold text-white">{telemetry.strokeLengthInches}"</span>
                </div>
                <input
                  type="range"
                  min="80"
                  max="144"
                  step="4"
                  value={telemetry.strokeLengthInches}
                  onChange={(e) => onUpdateParams({ strokeLengthInches: parseInt(e.target.value) })}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Kinematics Comparison Chart */}
          <div className="p-4 rounded-xl scada-panel">
            <span className="text-xs font-bold text-white uppercase tracking-wider block mb-2">
              Downstroke Surface Speed vs Terminal Settling Speed
            </span>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={strokeKinematics} margin={{ top: 5, right: 15, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#162842" />
                  <XAxis dataKey="point" stroke="#64748b" tick={{ fontSize: 9 }} />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 9 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#070f1e', borderColor: '#1e3a5f', borderRadius: '8px' }} />
                  <Legend wrapperStyle={{ fontSize: '10px' }} />
                  <Line
                    type="monotone"
                    dataKey="surfaceSpeed"
                    name="Surface Descent Speed (in/s)"
                    stroke="#00d2ff"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="terminalSpeed"
                    name="Terminal Gravity Limit (in/s)"
                    stroke="#f43f5e"
                    strokeDasharray="4 4"
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
