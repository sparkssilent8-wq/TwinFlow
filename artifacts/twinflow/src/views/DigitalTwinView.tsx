import React, { useState } from 'react';
import { TelemetryData, WellStaticData, DynacardData } from '../types/wellTwin';
import { WellboreSchematicCanvas } from '../components/WellboreSchematicCanvas';
import { DynacardCanvas } from '../components/DynacardCanvas';
import {
  Layers,
  Thermometer,
  Zap,
  Activity,
  Sliders,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Info,
  Maximize2
} from 'lucide-react';

interface DigitalTwinViewProps {
  wellData: WellStaticData;
  telemetry: TelemetryData;
  dynacard: DynacardData;
  cyclePhase: number;
  onUpdateParams: (newParams: Partial<TelemetryData>) => void;
  onTriggerAnomaly: (type: 'ROD_FLOAT' | 'FLUID_POUND' | 'HIGH_HEAT' | 'NORMAL') => void;
}

export const DigitalTwinView: React.FC<DigitalTwinViewProps> = ({
  wellData,
  telemetry,
  dynacard,
  cyclePhase,
  onUpdateParams,
  onTriggerAnomaly
}) => {
  const [activeSensor, setActiveSensor] = useState<string>('Downhole Pump (980m)');

  const isRodFloating = telemetry.rodFloatingIndex >= 0.78;

  // Sensor detail cards data
  const sensorDetails: Record<string, { label: string; current: string; normal: string; status: string; desc: string }> = {
    'Surface Load Cell': {
      label: 'Surface Carrier Bar Load Cell',
      current: `${telemetry.peakPolishedRodLoadLbs.toLocaleString()} lbs (Peak)`,
      normal: '18,000 - 22,000 lbs',
      status: telemetry.polishedRodStressPct > 80 ? 'Elevated' : 'Optimal',
      desc: 'Piezoelectric load cell mounted below polished rod carrier bar measuring real-time tension.'
    },
    'Tubing Head (THP)': {
      label: 'Tubing Head Pressure & Temp Gauge',
      current: `${telemetry.tubingHeadPressureBar.toFixed(1)} bar @ ${telemetry.wellheadTempC.toFixed(0)}°C`,
      normal: '3.0 - 8.0 bar',
      status: 'Normal',
      desc: 'Monitors flowline backpressure and thermal loss from 3.5" vacuum insulated tubing (VIT).'
    },
    'Rod Taper 7/8"': {
      label: 'Intermediate Tapered Rod Section (350m - 700m)',
      current: isRodFloating ? 'COMPRESSIVE BUCKLING HAZARD' : 'Tension Normal',
      normal: 'Tension > 4,500 lbs on downstroke',
      status: isRodFloating ? 'Critical Alert' : 'Normal',
      desc: 'Highest shear stress region where fluid velocity and viscous drag oppose rod weight.'
    },
    'Downhole Pump (980m)': {
      label: 'Bottomhole Pressure & Temp Sensor (BHP/BHT)',
      current: `${telemetry.bottomHoleTempC.toFixed(1)}°C | ${telemetry.nearWellboreViscosityCp.toLocaleString()} cP`,
      normal: '80 - 160°C post-CSS',
      status: telemetry.bottomHoleTempC < 60 ? 'Thermal Decay' : 'Active Heat Front',
      desc: 'Fiber-optic downhole P/T gauge situated at 980m inside the Jodhpur Sandstone pay zone.'
    }
  };

  const selectedSensorInfo = sensorDetails[activeSensor] || sensorDetails['Downhole Pump (980m)'];

  return (
    <div className="space-y-4">
      {/* Header ribbon */}
      <div className="p-4 rounded-xl scada-panel flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              {wellData.name} • High-Fidelity Well-to-Surface Physics Twin
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Full-depth multi-physics coupling: surface beam kinematics, tapered rod string finite-element stress, and Jodhpur sandstone thermal dissipation.
          </p>
        </div>

        {/* Quick Demo Anomaly Triggers */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] text-slate-400 font-medium mr-1">Demo Scenarios:</span>
          <button
            onClick={() => onTriggerAnomaly('ROD_FLOAT')}
            className={`px-2.5 py-1 rounded text-xs font-bold transition border ${
              isRodFloating
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-sm shadow-rose-500/20'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
          >
            ⚠️ Trigger Rod Float
          </button>
          <button
            onClick={() => onTriggerAnomaly('FLUID_POUND')}
            className="px-2.5 py-1 rounded text-xs font-bold bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 transition"
          >
            ⚡ Fluid Pound
          </button>
          <button
            onClick={() => onTriggerAnomaly('HIGH_HEAT')}
            className="px-2.5 py-1 rounded text-xs font-bold bg-slate-800 hover:bg-slate-700 text-orange-300 border border-slate-700 transition"
          >
            ♨ Thermal Flush
          </button>
          <button
            onClick={() => onTriggerAnomaly('NORMAL')}
            className="px-2.5 py-1 rounded text-xs font-bold bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 transition flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" /> Nominal
          </button>
        </div>
      </div>

      {/* Main Twin Layout: Interactive Canvas on Left, Diagnostics & Controls on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column (7 cols): Full Depth Interactive Canvas */}
        <div className="lg:col-span-7">
          <WellboreSchematicCanvas
            wellData={wellData}
            telemetry={telemetry}
            cyclePhase={cyclePhase}
            onSensorSelect={(sensor) => setActiveSensor(sensor)}
          />
        </div>

        {/* Right Column (5 cols): Parameter Controls & Telemetry Inspector */}
        <div className="lg:col-span-5 space-y-4">
          {/* Active Sensor Inspector Box */}
          <div className="p-4 rounded-xl scada-panel border-cyan-500/30">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Telemetry Inspector
                </span>
              </div>
              <span className="text-[10px] font-mono text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded">
                Click pin on canvas to inspect
              </span>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-bold text-cyan-200">{selectedSensorInfo.label}</h4>
              <p className="text-xs text-slate-400">{selectedSensorInfo.desc}</p>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                  <span className="text-[10px] text-slate-400 block uppercase">Current Value</span>
                  <span className="text-xs font-mono font-bold text-white">
                    {selectedSensorInfo.current}
                  </span>
                </div>
                <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                  <span className="text-[10px] text-slate-400 block uppercase">Allowable Band</span>
                  <span className="text-xs font-mono text-slate-300">
                    {selectedSensorInfo.normal}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Sucker Rod Finite-Element Stress Profile */}
          <div className="p-4 rounded-xl scada-panel">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Finite-Element Rod Stress Gradient
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">Tapered API D</span>
            </div>

            <div className="space-y-3">
              {/* Section 1: 1" Rods (0 - 350m) */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 font-medium">Top 1" Sucker Rods (0 - 350m)</span>
                  <span className="font-mono text-cyan-300">{telemetry.peakPolishedRodLoadLbs.toLocaleString()} lbs (62% Limit)</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div className="bg-cyan-500 h-full rounded-full" style={{ width: '62%' }} />
                </div>
              </div>

              {/* Section 2: 7/8" Rods (350 - 700m) */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 font-medium">Middle 7/8" Sucker Rods (350 - 700m)</span>
                  <span className={`font-mono font-bold ${isRodFloating ? 'text-rose-400' : 'text-amber-300'}`}>
                    {isRodFloating ? '100% Compressive Buckling' : '71% Tensile Load'}
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isRodFloating ? 'bg-rose-500 animate-pulse' : 'bg-amber-500'
                    }`}
                    style={{ width: isRodFloating ? '98%' : '71%' }}
                  />
                </div>
              </div>

              {/* Section 3: 3/4" Rods (700 - 980m) */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 font-medium">Bottom 3/4" Sucker Rods (700 - 980m)</span>
                  <span className={`font-mono ${isRodFloating ? 'text-rose-400' : 'text-emerald-300'}`}>
                    {isRodFloating ? 'Fluid Plunger Stalled' : '54% Working Stress'}
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${isRodFloating ? 'bg-rose-500' : 'bg-emerald-500'}`}
                    style={{ width: isRodFloating ? '88%' : '54%' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Real-time Dynamic Setpoint Controls */}
          <div className="p-4 rounded-xl scada-panel">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Twin Setpoint Controls
                </span>
              </div>
              <span className="text-[10px] font-mono text-cyan-400">Live Physics Update</span>
            </div>

            <div className="space-y-3.5">
              {/* SPM Slider */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">Pumping Speed (SPM):</span>
                  <span className="font-mono font-bold text-cyan-300">{telemetry.spm.toFixed(1)} SPM</span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="9.0"
                  step="0.2"
                  value={telemetry.spm}
                  onChange={(e) => onUpdateParams({ spm: parseFloat(e.target.value) })}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              {/* Stroke Length Slider */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">Stroke Length:</span>
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

              {/* VFD Downstroke Retardation Ratio */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">VFD Downstroke Ratio:</span>
                  <span className={`font-mono font-bold ${telemetry.downstrokeRatio < 0.8 ? 'text-emerald-400' : 'text-amber-300'}`}>
                    {telemetry.downstrokeRatio.toFixed(2)}x ({(telemetry.spm * telemetry.downstrokeRatio).toFixed(1)} SPM down)
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
                <span className="text-[10px] text-slate-400 mt-1 block">
                  💡 Lower ratio slows down downstroke, preventing rod float in cold heavy crude!
                </span>
              </div>
            </div>
          </div>

          {/* Synchronous Dynacard Widget */}
          <DynacardCanvas
            cardData={dynacard}
            height={220}
            width={440}
            showIdeal={false}
            showDownhole={true}
            liveCyclePhase={cyclePhase}
          />
        </div>
      </div>
    </div>
  );
};
