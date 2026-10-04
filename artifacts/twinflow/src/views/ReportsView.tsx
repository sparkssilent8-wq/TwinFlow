import React, { useState } from 'react';
import { TelemetryData, WellStaticData } from '../types/wellTwin';
import { WELL_CONFIGS } from '../services/simulationEngine';
import {
  FileSpreadsheet,
  Download,
  Printer,
  CheckCircle2,
  TrendingUp,
  Flame,
  Droplets,
  Zap,
  ShieldCheck,
  Calendar,
  Building
} from 'lucide-react';

interface ReportsViewProps {
  wellData: WellStaticData;
  telemetry: TelemetryData;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ wellData, telemetry }) => {
  const [reportDate, setReportDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  const fleetWells = Object.values(WELL_CONFIGS).map((w) => {
    let status = 'Production';
    let oil = '148.5 BOPD';
    let sor = '3.38';
    let health = '96%';
    let risk = 'Low';

    if (w.id === 'BW-04') {
      status = 'Rod Float Alert';
      oil = '46.2 BOPD';
      sor = '4.92';
      health = '58%';
      risk = 'Severe (Floating)';
    } else if (w.id === 'BW-07') {
      status = 'Thermal Soaking';
      oil = '0.0 (Soak)';
      sor = '3.10';
      health = '94%';
      risk = 'None';
    } else if (w.id === 'BW-12') {
      status = 'Steam Injection';
      oil = '0.0 (Inj)';
      sor = '4.25';
      health = '92%';
      risk = 'Low';
    }

    return {
      ...w,
      status,
      oil,
      sor,
      health,
      risk
    };
  });

  const handleDownloadCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Well_ID,Field,Reservoir,Depth_m,Cycle,Status,Oil_BOPD,SOR,Viscosity_cP,Rod_Float_Risk\n' +
      fleetWells
        .map(
          (w) =>
            `${w.id},Baghewala,Jodhpur Sandstone,${w.depthMeters},${w.currentCycle},${w.status},${w.oil},${w.sor},${w.staticViscosityCp},${w.risk}`
        )
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Baghewala_Digital_Twin_Report_${reportDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="p-4 rounded-xl scada-panel flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-cyan-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Baghewala Field Operational & ESG Analytics Report
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Official operational twin briefing for Oil India Limited (OIL) • Bikaner-Nagaur Basin, Rajasthan.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadCSV}
            className="px-3 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow"
          >
            {downloadSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Exported!
              </>
            ) : (
              <>
                <Download className="w-4 h-4" /> Export CSV Data
              </>
            )}
          </button>
          <button
            onClick={handlePrint}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" /> Print Report
          </button>
        </div>
      </div>

      {/* Field Overview Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl scada-panel">
          <span className="text-xs uppercase text-slate-400 font-medium">Cumulative Heavy Oil (Field)</span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-cyan-300">63,750</span>
            <span className="text-xs text-slate-400">Bbls</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">~9,850 Metric Tons Clean Crude</span>
        </div>

        <div className="p-4 rounded-xl scada-panel">
          <span className="text-xs uppercase text-slate-400 font-medium">Total Steam Injected (OTSG)</span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-orange-400">8,700</span>
            <span className="text-xs text-slate-400">Tons CWE</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Weighted Avg Quality: 84.5%</span>
        </div>

        <div className="p-4 rounded-xl scada-panel">
          <span className="text-xs uppercase text-slate-400 font-medium">Field Average Cumulative SOR</span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-emerald-400">3.41</span>
            <span className="text-xs text-slate-400">m³/m³</span>
          </div>
          <span className="text-[11px] text-emerald-400 font-semibold mt-1 block">-18% vs Unoptimized Historic</span>
        </div>

        <div className="p-4 rounded-xl scada-panel">
          <span className="text-xs uppercase text-slate-400 font-medium">Rod String MTBF Improvement</span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-cyan-300">+280%</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Due to VFD Anti-Float Retardation</span>
        </div>
      </div>

      {/* Fleet Overview Comparison Table */}
      <div className="p-4 rounded-xl scada-panel">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Baghewala Active Well Fleet Status
            </h3>
            <p className="text-xs text-slate-400">
              Real-time synchronization with digital twin simulation nodes
            </p>
          </div>
          <span className="text-[10px] font-mono text-slate-400">4 Wells Monitored</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px]">
                <th className="pb-2">Well ID</th>
                <th className="pb-2">Reservoir Layer</th>
                <th className="pb-2">Depth (m)</th>
                <th className="pb-2">Cycle #</th>
                <th className="pb-2">Current Phase</th>
                <th className="pb-2">Oil Rate</th>
                <th className="pb-2">Cum SOR</th>
                <th className="pb-2">Rod Float Risk</th>
                <th className="pb-2 text-right">Health Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {fleetWells.map((w) => (
                <tr key={w.id} className="hover:bg-slate-800/30 transition">
                  <td className="py-2.5 font-bold text-cyan-300">{w.id}</td>
                  <td className="py-2.5 text-slate-300 font-sans">{w.reservoir}</td>
                  <td className="py-2.5 text-slate-400">{w.depthMeters} m</td>
                  <td className="py-2.5 text-slate-300">Cycle {w.currentCycle}</td>
                  <td className="py-2.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        w.status.includes('Rod Float')
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                          : w.status.includes('Soak')
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : w.status.includes('Steam')
                          ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      }`}
                    >
                      {w.status}
                    </span>
                  </td>
                  <td className="py-2.5 font-bold text-white font-mono">{w.oil}</td>
                  <td className="py-2.5 text-amber-300">{w.sor}</td>
                  <td className="py-2.5">
                    <span className={w.risk.includes('Severe') ? 'text-rose-400 font-bold' : 'text-slate-400'}>
                      {w.risk}
                    </span>
                  </td>
                  <td className="py-2.5 text-right font-bold text-cyan-400">{w.health}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Field ESG & Power Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl scada-panel space-y-2">
          <span className="text-xs font-bold text-white uppercase tracking-wider block border-b border-slate-800 pb-2">
            Artificial Lift Energy Performance
          </span>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Total Lift Power Draw:</span>
              <span className="font-mono font-bold text-cyan-300">84.2 kW</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Electrical Lifting Intensity:</span>
              <span className="font-mono font-bold text-white">13.6 kWh / Bbl Crude</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">VFD Regeneration Savings:</span>
              <span className="font-mono font-bold text-emerald-400">-18.4% (Dynamic braking energy recovery)</span>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl scada-panel space-y-2">
          <span className="text-xs font-bold text-white uppercase tracking-wider block border-b border-slate-800 pb-2">
            OTSG Steam Boiler Thermal Compliance
          </span>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Thermal Heat Generation:</span>
              <span className="font-mono font-bold text-orange-400">22.8 MWth (OTSG Once-Through Unit)</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Direct Scope 1 GHG Emissions:</span>
              <span className="font-mono font-bold text-white">28.4 Tons CO₂e / Day</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">DGMS Safety Inspection Status:</span>
              <span className="font-mono font-bold text-emerald-400">COMPLIANT (Next Due: Nov 2026)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
