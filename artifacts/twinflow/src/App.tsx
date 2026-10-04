import React, { useState, useEffect, useRef } from 'react';
import {
  WellId,
  WellPhase,
  TelemetryData,
  DynacardData,
  AnomalyAlert,
  AIOptimizationRecommendation
} from './types/wellTwin';
import {
  WELL_CONFIGS,
  getInitialTelemetry,
  generateDynacard,
  getActiveAlerts,
  getAIRecommendations,
  calculateViscosity,
  calculateRodFloating
} from './services/simulationEngine';
import { Navbar } from './components/Navbar';
import { TelemetryTicker } from './components/TelemetryTicker';
import { DashboardView } from './views/DashboardView';
import { DigitalTwinView } from './views/DigitalTwinView';
import { CSSOptimizationView } from './views/CSSOptimizationView';
import { SRPOptimizationView } from './views/SRPOptimizationView';
import { PredictionsView } from './views/PredictionsView';
import { AlertsView } from './views/AlertsView';
import { ReportsView } from './views/ReportsView';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedWell, setSelectedWell] = useState<WellId>('BW-01');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [simSpeed, setSimSpeed] = useState<number>(1);
  const [cyclePhase, setCyclePhase] = useState<number>(0);

  // Well dynamic state
  const [telemetry, setTelemetry] = useState<TelemetryData>(() => getInitialTelemetry('BW-01'));
  const [dynacard, setDynacard] = useState<DynacardData>(() =>
    generateDynacard('BW-01', 120, 4.8, 115, 0.72)
  );
  const [alerts, setAlerts] = useState<AnomalyAlert[]>(() =>
    getActiveAlerts('BW-01', getInitialTelemetry('BW-01'))
  );
  const [recommendations, setRecommendations] = useState<AIOptimizationRecommendation[]>(() =>
    getAIRecommendations('BW-01', getInitialTelemetry('BW-01'))
  );

  // Telemetry trend buffer for live strip chart
  const [historyData, setHistoryData] = useState<
    Array<{
      time: string;
      oilRate: number;
      bht: number;
      pprl: number;
      viscosity: number;
    }>
  >([]);

  // Keep a reference to current telemetry for the animation loop
  const telemetryRef = useRef<TelemetryData>(telemetry);
  telemetryRef.current = telemetry;

  // Handle well switching
  const handleSelectWell = (wellId: WellId) => {
    setSelectedWell(wellId);
    const newTelem = getInitialTelemetry(wellId);
    setTelemetry(newTelem);
    const newDynacard = generateDynacard(
      wellId,
      newTelem.strokeLengthInches,
      newTelem.spm,
      newTelem.nearWellboreViscosityCp,
      newTelem.downstrokeRatio
    );
    setDynacard(newDynacard);
    setAlerts(getActiveAlerts(wellId, newTelem));
    setRecommendations(getAIRecommendations(wellId, newTelem));
    setHistoryData([]); // reset trend for new well
  };

  // Synchronous physics re-evaluation when parameters change
  const handleUpdateParams = (newParams: Partial<TelemetryData>) => {
    setTelemetry((prev) => {
      const updated = { ...prev, ...newParams };
      
      // Re-evaluate viscosity if temperature changed
      if (newParams.bottomHoleTempC !== undefined) {
        updated.nearWellboreViscosityCp = calculateViscosity(
          updated.bottomHoleTempC,
          WELL_CONFIGS[selectedWell].staticViscosityCp
        );
      }

      // Re-evaluate rod floating
      const { rodFloatingIndex, isFloating } = calculateRodFloating(
        updated.spm,
        updated.strokeLengthInches,
        updated.nearWellboreViscosityCp,
        updated.downstrokeRatio
      );
      updated.rodFloatingIndex = rodFloatingIndex;

      // Re-calculate dynacard
      const newCard = generateDynacard(
        selectedWell,
        updated.strokeLengthInches,
        updated.spm,
        updated.nearWellboreViscosityCp,
        updated.downstrokeRatio
      );
      setDynacard(newCard);

      // Re-evaluate alerts
      setAlerts(getActiveAlerts(selectedWell, updated));

      return updated;
    });
  };

  // 1-Click Mitigation Action
  const handleMitigateAlert = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, mitigated: true } : a))
    );

    // Apply specific physical fix
    if (alertId.includes('RF')) {
      // Rod floating fix: Slow down downstroke with VFD retardation & reduce overall SPM slightly
      handleUpdateParams({
        downstrokeRatio: 0.62,
        spm: 4.6
      });
    } else if (alertId.includes('TQ')) {
      // Torque fix
      handleUpdateParams({
        strokeLengthInches: 100,
        gearboxTorquePct: 68
      });
    } else if (alertId.includes('TH')) {
      // Schedule next steam cycle
      handleUpdateParams({
        cssPhase: 'INJECTION',
        daysInCurrentPhase: 1,
        bottomHoleTempC: 280,
        oilRateBopd: 0,
        spm: 0
      });
    }
  };

  // Apply AI Recommendation Action
  const handleApplyRecommendation = (recId: string) => {
    setRecommendations((prev) =>
      prev.map((r) => (r.id === recId ? { ...r, applied: true } : r))
    );

    if (recId.includes('VFD')) {
      handleUpdateParams({
        downstrokeRatio: 0.62,
        spm: 5.2
      });
    } else if (recId.includes('CSS')) {
      handleUpdateParams({
        targetSteamVolumeTons: 2550,
        steamQualityPct: 88
      });
    } else if (recId.includes('SOAK')) {
      handleUpdateParams({
        targetSoakDays: 6
      });
    }
  };

  // Demo Anomaly Injection Trigger
  const handleTriggerAnomaly = (type: 'ROD_FLOAT' | 'FLUID_POUND' | 'HIGH_HEAT' | 'NORMAL') => {
    switch (type) {
      case 'ROD_FLOAT':
        handleUpdateParams({
          bottomHoleTempC: 48,
          spm: 7.2,
          downstrokeRatio: 1.0 // Symmetric VFD causes heavy float
        });
        break;
      case 'FLUID_POUND':
        handleUpdateParams({
          pumpFillagePct: 58,
          fluidPoundingRisk: 0.85
        });
        break;
      case 'HIGH_HEAT':
        handleUpdateParams({
          bottomHoleTempC: 165,
          oilRateBopd: 185
        });
        break;
      case 'NORMAL':
        handleSelectWell(selectedWell);
        break;
    }
  };

  // Phase transition handler
  const handleTransitionPhase = (newPhase: WellPhase) => {
    if (newPhase === 'INJECTION') {
      handleUpdateParams({
        cssPhase: 'INJECTION',
        spm: 0,
        oilRateBopd: 0,
        daysInCurrentPhase: 1,
        bottomHoleTempC: 285
      });
    } else if (newPhase === 'SOAKING') {
      handleUpdateParams({
        cssPhase: 'SOAKING',
        spm: 0,
        oilRateBopd: 0,
        daysInCurrentPhase: 1,
        soakDaysElapsed: 1,
        bottomHoleTempC: 260
      });
    } else if (newPhase === 'PRODUCTION') {
      handleUpdateParams({
        cssPhase: 'PRODUCTION',
        spm: 4.8,
        oilRateBopd: 140,
        daysInCurrentPhase: 1,
        bottomHoleTempC: 145
      });
    } else {
      handleUpdateParams({
        cssPhase: 'SHUT_IN',
        spm: 0,
        oilRateBopd: 0
      });
    }
  };

  // Emergency Shut-in
  const handleEmergencyStop = () => {
    setIsPlaying(false);
    handleUpdateParams({
      spm: 0,
      oilRateBopd: 0,
      cssPhase: 'SHUT_IN'
    });
  };

  // Reset to default
  const handleReset = () => {
    handleSelectWell(selectedWell);
    setIsPlaying(true);
    setSimSpeed(1);
  };

  // Real-time animation & physics ticker loop
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const deltaSec = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      if (isPlaying) {
        const curTelem = telemetryRef.current;
        const currentSpm = curTelem.spm;

        if (currentSpm > 0 && curTelem.cssPhase === 'PRODUCTION') {
          // Advance pump cycle phase (cycles per second = SPM / 60)
          const phaseInc = (currentSpm / 60) * deltaSec * simSpeed;
          setCyclePhase((prev) => (prev + phaseInc) % 1.0);
        }
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPlaying, simSpeed]);

  // Periodic Telemetry Tele-recorder (every 1.5 seconds) for strip chart
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isPlaying) return;

      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now
        .getMinutes()
        .toString()
        .padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

      setTelemetry((prev) => {
        // Small realistic micro-fluctuations
        const noise = (Math.random() - 0.5) * 0.4;
        const newOilRate = prev.oilRateBopd > 0 ? Math.max(5, prev.oilRateBopd + noise) : 0;

        const newPoint = {
          time: timeStr,
          oilRate: Number(newOilRate.toFixed(1)),
          bht: Number(prev.bottomHoleTempC.toFixed(1)),
          pprl: Math.round(prev.peakPolishedRodLoadLbs / 100),
          viscosity: prev.nearWellboreViscosityCp
        };

        setHistoryData((prevHistory) => {
          const updated = [...prevHistory, newPoint];
          return updated.slice(-25); // keep last 25 points
        });

        return {
          ...prev,
          oilRateBopd: newOilRate
        };
      });
    }, 1500 / simSpeed);

    return () => clearInterval(interval);
  }, [isPlaying, simSpeed]);

  const criticalAlertsCount = alerts.filter((a) => a.severity === 'CRITICAL' && !a.mitigated).length;

  return (
    <div className="min-h-screen bg-[#060b13] text-slate-100 flex flex-col font-sans">
      {/* SCADA Global Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedWell={selectedWell}
        setSelectedWell={handleSelectWell}
        cssPhase={telemetry.cssPhase}
        isPlaying={isPlaying}
        setIsPlaying={setIsPlaying}
        simSpeed={simSpeed}
        setSimSpeed={setSimSpeed}
        criticalAlertsCount={criticalAlertsCount}
        onEmergencyStop={handleEmergencyStop}
        onReset={handleReset}
      />

      {/* Real-time Telemetry Strip Ticker */}
      <TelemetryTicker telemetry={telemetry} />

      {/* Main View Port */}
      <main className="flex-1 p-4 max-w-[1720px] w-full mx-auto">
        {activeTab === 'dashboard' && (
          <DashboardView
            wellData={WELL_CONFIGS[selectedWell]}
            telemetry={telemetry}
            dynacard={dynacard}
            alerts={alerts}
            recommendations={recommendations}
            cyclePhase={cyclePhase}
            onApplyRecommendation={handleApplyRecommendation}
            onMitigateAlert={handleMitigateAlert}
            onNavigateTab={setActiveTab}
            historyData={historyData}
          />
        )}

        {activeTab === 'digital-twin' && (
          <DigitalTwinView
            wellData={WELL_CONFIGS[selectedWell]}
            telemetry={telemetry}
            dynacard={dynacard}
            cyclePhase={cyclePhase}
            onUpdateParams={handleUpdateParams}
            onTriggerAnomaly={handleTriggerAnomaly}
          />
        )}

        {activeTab === 'css-opt' && (
          <CSSOptimizationView
            wellData={WELL_CONFIGS[selectedWell]}
            telemetry={telemetry}
            onUpdateParams={handleUpdateParams}
            onTransitionPhase={handleTransitionPhase}
          />
        )}

        {activeTab === 'srp-opt' && (
          <SRPOptimizationView
            wellData={WELL_CONFIGS[selectedWell]}
            telemetry={telemetry}
            dynacard={dynacard}
            cyclePhase={cyclePhase}
            onUpdateParams={handleUpdateParams}
            onApplyVfdOptimization={() =>
              handleUpdateParams({
                downstrokeRatio: 0.62,
                spm: 4.8
              })
            }
          />
        )}

        {activeTab === 'predictions' && (
          <PredictionsView
            wellData={WELL_CONFIGS[selectedWell]}
            telemetry={telemetry}
          />
        )}

        {activeTab === 'alerts' && (
          <AlertsView
            wellData={WELL_CONFIGS[selectedWell]}
            telemetry={telemetry}
            alerts={alerts}
            onMitigateAlert={handleMitigateAlert}
          />
        )}

        {activeTab === 'reports' && (
          <ReportsView
            wellData={WELL_CONFIGS[selectedWell]}
            telemetry={telemetry}
          />
        )}
      </main>

      {/* Industrial Footer */}
      <footer className="border-t border-slate-800/80 bg-[#070e1b] py-2 px-4 text-center text-xs text-slate-500 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span className="font-mono text-slate-400">
            PS 26120 Digital Twin Server • Connected to Baghewala Field SCADA Node
          </span>
        </div>
        <div className="text-slate-400 font-mono text-[11px]">
          Oil India Limited (OIL) • Jodhpur Sandstone Thermal Heavy Oil Reservoir • Rajasthan, India
        </div>
      </footer>
    </div>
  );
};

export default App;
