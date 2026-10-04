import React from 'react';
import {
  TelemetryData,
  WellStaticData,
  DynacardData,
  AnomalyAlert,
  AIOptimizationRecommendation
} from '../types/wellTwin';
import { KPICard } from '../components/KPICard';
import { DynacardCanvas } from '../components/DynacardCanvas';
import {
  Droplets,
  Thermometer,
  Zap,
  Flame,
  AlertTriangle,
  Activity,
  ArrowRight,
  CheckCircle2,
  Cpu,
  Layers,
  Sparkles,
  ShieldCheck,
  TrendingDown
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

interface DashboardViewProps {
  wellData: WellStaticData;
  telemetry: TelemetryData;
  dynacard: DynacardData;
  alerts: AnomalyAlert[];
  recommendations: AIOptimizationRecommendation[];
  cyclePhase: number;
  onApplyRecommendation: (recId: string) => void;
  onMitigateAlert: (alertId: string) => void;
  onNavigateTab: (tabId: string) => void;
  historyData: Array<{
    time: string;
    oilRate: number;
    bht: number;
    pprl: number;
    viscosity: number;
  }>;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  wellData,
  telemetry,
  dynacard,
  alerts,
  recommendations,
  cyclePhase,
  onApplyRecommendation,
  onMitigateAlert,
  onNavigateTab,
  historyData
}) => {
  const isRodFloating = telemetry.rodFloatingIndex >= 0.78;
  const isHot = telemetry.bottomHoleTempC > 100;

  return (
    <div className="space-y-4">
      {/* Top Notification / Crisis Banner if critical alerts exist */}
      {alerts.some((a) => a.severity === 'CRITICAL' && !a.mitigated) && (
        <div className="p-3.5 rounded-xl bg-gradient-to-r from-rose-950/80 via-rose-900/40 to-slate-950 border border-rose-500/50 shadow-lg shadow-rose-950/40 flex flex-wrap items-center justify-between gap-3 animate-pulse-subtle">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400">
              <AlertTriangle className="w-5 h-5 text-rose-400 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-rose-400">
                  Critical Mechanical Anomaly
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/30 text-rose-200 font-mono">
                  {wellData.id}
                </span>
              </div>
              <p className="text-sm font-semibold text-white">
                Severe Sucker Rod Floating in Heavy Crude ({telemetry.nearWellboreViscosityCp} cP) - Compressive Buckling Imminent
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onMitigateAlert(alerts[0].id)}
              className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition shadow flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              1-Click Auto-Mitigate (VFD Retardation)
            </button>
            <button
              onClick={() => onNavigateTab('alerts')}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition"
            >
              View Diagnostic
            </button>
          </div>
        </div>
      )}

      {/* KPI Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <KPICard
          title="Heavy Oil Rate"
          value={telemetry.oilRateBopd.toFixed(1)}
          unit="BOPD"
          subtext={`Water Cut: ${telemetry.waterCutPct.toFixed(1)}%`}
          icon={Droplets}
          status={telemetry.oilRateBopd > 100 ? 'optimal' : telemetry.oilRateBopd > 30 ? 'warning' : 'danger'}
          trend={telemetry.oilRateBopd > 100 ? 'up' : 'down'}
          trendValue={telemetry.oilRateBopd > 100 ? '+14% vs Base' : '-18% vs Base'}
          progressPct={(telemetry.oilRateBopd / 200) * 100}
        />

        <KPICard
          title="Bottomhole Temp"
          value={telemetry.bottomHoleTempC.toFixed(1)}
          unit="°C"
          subtext={`Viscosity: ${telemetry.nearWellboreViscosityCp.toLocaleString()} cP`}
          icon={Thermometer}
          status={isHot ? 'optimal' : telemetry.bottomHoleTempC > 60 ? 'warning' : 'danger'}
          trend={isHot ? 'flat' : 'down'}
          trendValue={isHot ? 'Thermal Front Active' : 'Heat Depleted'}
          progressPct={((telemetry.bottomHoleTempC - 38) / 180) * 100}
        />

        <KPICard
          title="Polished Rod Peak (PPRL)"
          value={telemetry.peakPolishedRodLoadLbs.toLocaleString()}
          unit="lbs"
          subtext={`MPRL: ${telemetry.minPolishedRodLoadLbs.toLocaleString()} lbs`}
          icon={Zap}
          status={telemetry.polishedRodStressPct > 85 ? 'danger' : telemetry.polishedRodStressPct > 70 ? 'warning' : 'optimal'}
          trend="up"
          trendValue={`${telemetry.polishedRodStressPct.toFixed(0)}% API D Stress`}
          progressPct={telemetry.polishedRodStressPct}
        />

        <KPICard
          title="Instantaneous SOR"
          value={telemetry.instantaneousSOR > 0 ? telemetry.instantaneousSOR.toFixed(2) : 'N/A'}
          unit="m³/m³"
          subtext={`Cum SOR: ${telemetry.cumulativeSOR.toFixed(2)}`}
          icon={Flame}
          status={telemetry.instantaneousSOR < 3.5 ? 'optimal' : telemetry.instantaneousSOR < 5.0 ? 'warning' : 'danger'}
          trend="down"
          trendValue={`NER: ${telemetry.netEnergyRatio.toFixed(1)}`}
          progressPct={telemetry.instantaneousSOR > 0 ? (telemetry.instantaneousSOR / 6) * 100 : 0}
        />

        <KPICard
          title="Rod Floating Index"
          value={`${(telemetry.rodFloatingIndex * 100).toFixed(0)}%`}
          subtext={isRodFloating ? 'Severe Buckling Risk' : 'Normal Gravity Fall'}
          icon={AlertTriangle}
          status={isRodFloating ? 'danger' : telemetry.rodFloatingIndex > 0.5 ? 'warning' : 'optimal'}
          trend={isRodFloating ? 'up' : 'down'}
          trendValue={isRodFloating ? 'UNSEATED' : 'SEATED'}
          progressPct={telemetry.rodFloatingIndex * 100}
        />
      </div>

      {/* Main Grid: Visualizers & Telemetry Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column (8 cols): Real-time Dynacard & Telemetry Strip */}
        <div className="lg:col-span-8 space-y-4">
          {/* Dynamometer Card & Mini Wellbore Snapshot */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-7">
              <DynacardCanvas
                cardData={dynacard}
                height={300}
                width={460}
                showIdeal={true}
                showDownhole={true}
                liveCyclePhase={cyclePhase}
              />
            </div>

            {/* Quick Wellbore Health & Asset Specification */}
            <div className="md:col-span-5 flex flex-col justify-between p-4 rounded-xl scada-panel">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Well Architecture</span>
                  <span className="text-[10px] font-mono text-cyan-400">Jodhpur Sandstone</span>
                </div>

                <div className="mt-3 space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Formation Depth:</span>
                    <span className="font-mono font-semibold text-slate-200">{wellData.depthMeters} m TVD</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Pump Intake Depth:</span>
                    <span className="font-mono font-semibold text-slate-200">{wellData.pumpDepthMeters} m</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Crude Gravity:</span>
                    <span className="font-mono font-semibold text-amber-300">{wellData.crudeAPI}° API (Heavy)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">CSS Stimulation Cycle:</span>
                    <span className="font-mono font-bold text-cyan-300">Cycle #{wellData.currentCycle}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Tapered Sucker Rods:</span>
                    <span className="font-mono text-slate-200">1" / 7/8" / 3/4" API D</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Downstroke VFD Mode:</span>
                    <span className={`font-mono font-bold ${telemetry.downstrokeRatio < 0.85 ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {telemetry.downstrokeRatio < 0.85 ? `Retarded (${telemetry.downstrokeRatio}x)` : 'Symmetric 1.0x'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-800 flex gap-2">
                <button
                  onClick={() => onNavigateTab('digital-twin')}
                  className="w-full py-2 px-3 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <Layers className="w-3.5 h-3.5" />
                  Full Digital Twin View
                </button>
                <button
                  onClick={() => onNavigateTab('srp-opt')}
                  className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  Dynacard Studio
                </button>
              </div>
            </div>
          </div>

          {/* Real-Time Multi-Variable Strip Chart */}
          <div className="p-4 rounded-xl scada-panel">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Live Production & Thermal Telemetry Stream
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Rolling 60-Sec Window</span>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historyData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#162842" />
                  <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10 }} />
                  <YAxis yAxisId="left" stroke="#38bdf8" tick={{ fontSize: 10 }} />
                  <YAxis yAxisId="right" orientation="right" stroke="#f59e0b" tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#070f1e', borderColor: '#1e3a5f', borderRadius: '8px' }}
                    labelStyle={{ color: '#94a3b8', fontSize: '11px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="oilRate"
                    name="Oil Rate (BOPD)"
                    stroke="#00d2ff"
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="bht"
                    name="Bottomhole Temp (°C)"
                    stroke="#f97316"
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="pprl"
                    name="PPRL / 100 (lbs)"
                    stroke="#10b981"
                    strokeWidth={1.5}
                    strokeDasharray="4 2"
                    dot={false}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): AI Recommendations & Active Alerts */}
        <div className="lg:col-span-4 space-y-4">
          {/* AI Optimization Recommendations */}
          <div className="p-4 rounded-xl scada-panel">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  AI Twin Recommendations
                </span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 font-mono font-bold">
                PINN Hybrid
              </span>
            </div>

            <div className="space-y-3">
              {recommendations.slice(0, 3).map((rec) => (
                <div
                  key={rec.id}
                  className={`p-3 rounded-lg border transition ${
                    rec.applied
                      ? 'bg-emerald-950/20 border-emerald-500/30'
                      : 'bg-[#091322] border-slate-800 hover:border-cyan-500/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-bold text-cyan-200">{rec.title}</span>
                    <span className="text-[10px] font-mono text-cyan-400 font-bold shrink-0">
                      {rec.confidenceScore}% Conf
                    </span>
                  </div>

                  <p className="mt-1 text-[11px] text-slate-400 leading-relaxed">
                    {rec.projectedBenefit}
                  </p>

                  <div className="mt-2 text-[10px] font-mono text-slate-300 bg-slate-900/60 p-1.5 rounded">
                    <span className="text-slate-400">Rec: </span>
                    <span className="text-emerald-300">{rec.recommendedValue}</span>
                  </div>

                  <div className="mt-2.5 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 italic">
                      {rec.physicsReasoning.slice(0, 65)}...
                    </span>
                    <button
                      onClick={() => onApplyRecommendation(rec.id)}
                      disabled={rec.applied}
                      className={`px-2.5 py-1 rounded text-[11px] font-bold transition flex items-center gap-1 ${
                        rec.applied
                          ? 'bg-emerald-500/20 text-emerald-400 cursor-default'
                          : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-sm'
                      }`}
                    >
                      {rec.applied ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" />
                          Applied
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3 h-3" />
                          Apply
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => onNavigateTab('predictions')}
              className="mt-3 w-full py-1.5 text-center text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center justify-center gap-1"
            >
              Open AI What-If Scenario Matrix <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Active Diagnostic Alerts */}
          <div className="p-4 rounded-xl scada-panel">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Active Fault Diagnostics
                </span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                {alerts.length} Active
              </span>
            </div>

            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              {alerts.length === 0 ? (
                <div className="py-8 text-center text-slate-400">
                  <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
                  <p className="text-xs font-medium">All mechanical and thermal systems healthy.</p>
                </div>
              ) : (
                alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-2.5 rounded-lg border text-xs ${
                      alert.severity === 'CRITICAL'
                        ? 'bg-rose-950/30 border-rose-500/40 text-rose-200'
                        : alert.severity === 'WARNING'
                        ? 'bg-amber-950/20 border-amber-500/30 text-amber-200'
                        : 'bg-slate-900 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1.5">
                      <span className="font-bold text-[11px]">{alert.title}</span>
                      <span className="text-[9px] font-mono text-slate-400 shrink-0">{alert.timestamp}</span>
                    </div>

                    <p className="mt-1 text-[11px] text-slate-300 leading-snug">
                      {alert.description}
                    </p>

                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">
                        Impact: {alert.impact.slice(0, 40)}...
                      </span>
                      <button
                        onClick={() => onMitigateAlert(alert.id)}
                        className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 rounded text-[10px] font-bold transition"
                      >
                        Mitigate
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => onNavigateTab('alerts')}
              className="mt-3 w-full py-1.5 text-center text-xs font-semibold text-slate-400 hover:text-white flex items-center justify-center gap-1 border-t border-slate-800 pt-2"
            >
              View Full Runbook & Mitigation History <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
