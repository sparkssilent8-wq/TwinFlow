import React, { useState } from 'react';
import { TelemetryData, WellStaticData, AnomalyAlert } from '../types/wellTwin';
import {
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  Activity,
  ArrowRight,
  Zap,
  Flame,
  FileText
} from 'lucide-react';

interface AlertsViewProps {
  wellData: WellStaticData;
  telemetry: TelemetryData;
  alerts: AnomalyAlert[];
  onMitigateAlert: (alertId: string) => void;
}

export const AlertsView: React.FC<AlertsViewProps> = ({
  wellData,
  telemetry,
  alerts,
  onMitigateAlert
}) => {
  const [selectedAlertId, setSelectedAlertId] = useState<string>(alerts[0]?.id || '');
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');

  const selectedAlert = alerts.find((a) => a.id === selectedAlertId) || alerts[0];

  const filteredAlerts = alerts.filter((a) => {
    if (filterSeverity === 'ALL') return true;
    return a.severity === filterSeverity;
  });

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="p-4 rounded-xl scada-panel flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              {wellData.name} • Anomaly Detection, Diagnostics & Runbooks
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time mechanical stress diagnostics, heavy-oil rod floating classification, and autonomous mitigation runbooks.
          </p>
        </div>

        {/* Severity filter badges */}
        <div className="flex items-center gap-1.5 bg-[#091322] p-1 rounded-lg border border-slate-800 text-xs">
          {['ALL', 'CRITICAL', 'WARNING', 'ADVISORY'].map((sev) => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-2.5 py-1 rounded font-semibold transition ${
                filterSeverity === sev
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Alerts List on Left, Comprehensive Runbook on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left (5 cols): Active Alerts List */}
        <div className="lg:col-span-5 space-y-3">
          {filteredAlerts.length === 0 ? (
            <div className="p-8 text-center scada-panel">
              <ShieldCheck className="w-10 h-10 text-emerald-400 mx-auto mb-2 opacity-80" />
              <h3 className="text-sm font-bold text-white">No Active Alerts</h3>
              <p className="text-xs text-slate-400 mt-1">All monitored parameters are within safe operating envelopes.</p>
            </div>
          ) : (
            filteredAlerts.map((alert) => {
              const isSelected = alert.id === selectedAlert?.id;
              return (
                <div
                  key={alert.id}
                  onClick={() => setSelectedAlertId(alert.id)}
                  className={`p-3.5 rounded-xl border transition cursor-pointer ${
                    isSelected
                      ? 'bg-[#0f1d33] border-cyan-400 shadow-md shadow-cyan-950/40'
                      : alert.severity === 'CRITICAL'
                      ? 'bg-rose-950/20 border-rose-500/30 hover:border-rose-400/50'
                      : 'bg-[#0a1424] border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          alert.severity === 'CRITICAL'
                            ? 'bg-rose-500 animate-ping'
                            : alert.severity === 'WARNING'
                            ? 'bg-amber-400'
                            : 'bg-cyan-400'
                        }`}
                      />
                      <span className="text-xs font-bold text-white">{alert.title}</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 shrink-0">{alert.timestamp}</span>
                  </div>

                  <p className="mt-1 text-xs text-slate-300 line-clamp-2">{alert.description}</p>

                  <div className="mt-2.5 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 font-mono text-[10px]">ID: {alert.id}</span>
                    {alert.mitigated ? (
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Mitigated
                      </span>
                    ) : (
                      <span className="text-cyan-300 font-bold hover:underline flex items-center gap-1">
                        View Runbook <ArrowRight className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right (7 cols): Selected Alert Deep-Dive Runbook */}
        <div className="lg:col-span-7">
          {selectedAlert ? (
            <div className="p-5 rounded-xl scada-panel space-y-4">
              <div className="flex items-start justify-between pb-3 border-b border-slate-800 gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        selectedAlert.severity === 'CRITICAL'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : selectedAlert.severity === 'WARNING'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      }`}
                    >
                      {selectedAlert.severity} PRIORITY
                    </span>
                    <span className="text-xs font-mono text-slate-400">Category: {selectedAlert.category}</span>
                  </div>
                  <h3 className="text-base font-extrabold text-white mt-1.5">{selectedAlert.title}</h3>
                </div>

                <button
                  onClick={() => onMitigateAlert(selectedAlert.id)}
                  disabled={selectedAlert.mitigated}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow ${
                    selectedAlert.mitigated
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-default'
                      : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold'
                  }`}
                >
                  {selectedAlert.mitigated ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" /> Mitigated
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" /> 1-Click Auto-Mitigate
                    </>
                  )}
                </button>
              </div>

              {/* Physics Root Cause */}
              <div className="p-3.5 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" /> Physics Root Cause
                </span>
                <p className="text-xs text-slate-200 leading-relaxed">{selectedAlert.physicsRootCause}</p>
              </div>

              {/* Operational Impact */}
              <div className="p-3.5 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" /> Equipment & Asset Risk Impact
                </span>
                <p className="text-xs text-slate-200 leading-relaxed">{selectedAlert.impact}</p>
              </div>

              {/* Actionable Engineering Recommendation */}
              <div className="p-3.5 rounded-lg bg-cyan-950/20 border border-cyan-500/30 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" /> AI Recommended Runbook Protocol
                </span>
                <p className="text-xs text-slate-200 leading-relaxed">{selectedAlert.recommendation}</p>
              </div>

              {/* Mitigation Action Details */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Triggered Action:</span>
                <span className="font-mono font-bold text-cyan-300">{selectedAlert.mitigationAction}</span>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center scada-panel text-slate-400 text-xs">Select an alert to view its engineering runbook.</div>
          )}
        </div>
      </div>
    </div>
  );
};
