import {
  WellId,
  WellStaticData,
  TelemetryData,
  DynacardData,
  DynacardPoint,
  AnomalyAlert,
  AIOptimizationRecommendation,
  ForecastDataPoint,
  WhatIfScenarioInput
} from '../types/wellTwin';

// Static field specifications for Baghewala Heavy Oil Field (Jodhpur Sandstone)
export const WELL_CONFIGS: Record<WellId, WellStaticData> = {
  'BW-01': {
    id: 'BW-01',
    name: 'Baghewala-01 (Optimized Production)',
    field: 'Baghewala Field',
    basin: 'Bikaner-Nagaur Basin, Rajasthan',
    operator: 'Oil India Limited (OIL)',
    reservoir: 'Jodhpur Sandstone (Pay Zone A)',
    depthMeters: 1018,
    casingDiameterInches: 7.0,
    tubingDiameterInches: 3.5,
    pumpDepthMeters: 975,
    rodStringConfig: {
      section1: { size: '1"', lengthMeters: 350, grade: 'API Grade D' },
      section2: { size: '7/8"', lengthMeters: 350, grade: 'API Grade D' },
      section3: { size: '3/4"', lengthMeters: 275, grade: 'API Grade KD' }
    },
    crudeAPI: 17.6,
    staticViscosityCp: 13800,
    staticResTempC: 38.5,
    initialResPressureBar: 76.2,
    currentCycle: 3
  },
  'BW-04': {
    id: 'BW-04',
    name: 'Baghewala-04 (Late Production - Rod Float Alert)',
    field: 'Baghewala Field',
    basin: 'Bikaner-Nagaur Basin, Rajasthan',
    operator: 'Oil India Limited (OIL)',
    reservoir: 'Jodhpur Sandstone (Pay Zone B)',
    depthMeters: 1042,
    casingDiameterInches: 7.0,
    tubingDiameterInches: 3.5,
    pumpDepthMeters: 995,
    rodStringConfig: {
      section1: { size: '1"', lengthMeters: 360, grade: 'API Grade D' },
      section2: { size: '7/8"', lengthMeters: 360, grade: 'API Grade D' },
      section3: { size: '3/4"', lengthMeters: 275, grade: 'API Grade D' }
    },
    crudeAPI: 16.8,
    staticViscosityCp: 16200,
    staticResTempC: 38.0,
    initialResPressureBar: 74.0,
    currentCycle: 2
  },
  'BW-07': {
    id: 'BW-07',
    name: 'Baghewala-07 (Thermal Soaking Phase)',
    field: 'Baghewala Field',
    basin: 'Bikaner-Nagaur Basin, Rajasthan',
    operator: 'Oil India Limited (OIL)',
    reservoir: 'Jodhpur Sandstone (Pay Zone A)',
    depthMeters: 995,
    casingDiameterInches: 7.0,
    tubingDiameterInches: 3.5,
    pumpDepthMeters: 955,
    rodStringConfig: {
      section1: { size: '1"', lengthMeters: 330, grade: 'API Grade D' },
      section2: { size: '7/8"', lengthMeters: 330, grade: 'API Grade D' },
      section3: { size: '3/4"', lengthMeters: 295, grade: 'API Grade KD' }
    },
    crudeAPI: 18.0,
    staticViscosityCp: 12500,
    staticResTempC: 39.0,
    initialResPressureBar: 78.5,
    currentCycle: 4
  },
  'BW-12': {
    id: 'BW-12',
    name: 'Baghewala-12 (Steam Injection Stage)',
    field: 'Baghewala Field',
    basin: 'Bikaner-Nagaur Basin, Rajasthan',
    operator: 'Oil India Limited (OIL)',
    reservoir: 'Jodhpur Sandstone (North Flank)',
    depthMeters: 1065,
    casingDiameterInches: 7.0,
    tubingDiameterInches: 3.5,
    pumpDepthMeters: 1010,
    rodStringConfig: {
      section1: { size: '1"', lengthMeters: 370, grade: 'API Grade D' },
      section2: { size: '7/8"', lengthMeters: 370, grade: 'API Grade D' },
      section3: { size: '3/4"', lengthMeters: 270, grade: 'API Grade KD' }
    },
    crudeAPI: 17.1,
    staticViscosityCp: 15100,
    staticResTempC: 37.8,
    initialResPressureBar: 75.0,
    currentCycle: 1
  }
};

// Baghewala Viscosity-Temperature correlation: Walther/Andrade heavy-oil model
export function calculateViscosity(tempC: number, staticViscosityCp: number): number {
  if (tempC >= 250) return 6.5;
  if (tempC <= 38) return staticViscosityCp;
  // Non-linear exponential thermal thinning
  const tNorm = (tempC - 38) / (250 - 38);
  const decayRate = 5.2; // heavy crude exponential factor
  const visc = 12 + (staticViscosityCp - 12) * Math.exp(-decayRate * tNorm);
  return Math.max(8, Math.round(visc));
}

// Initial state generator for each well
export function getInitialTelemetry(wellId: WellId): TelemetryData {
  const staticData = WELL_CONFIGS[wellId];
  
  switch (wellId) {
    case 'BW-01': {
      const tempC = 124;
      const visc = calculateViscosity(tempC, staticData.staticViscosityCp);
      return {
        timestamp: Date.now(),
        oilRateBopd: 148.5,
        waterCutPct: 41.2,
        grossLiquidBpd: 252.5,
        cumulativeOilBbl: 18450,
        cumulativeSteamTons: 2200,
        tubingHeadPressureBar: 4.8,
        casingHeadPressureBar: 6.2,
        bottomHolePressureBar: 38.5,
        wellheadTempC: 88.4,
        bottomHoleTempC: tempC,
        nearWellboreViscosityCp: visc,
        strokeLengthInches: 120,
        spm: 4.8,
        downstrokeRatio: 0.72, // VFD downstroke retardation applied
        vfdFrequencyHz: 42.5,
        motorCurrentAmps: 34.2,
        motorPowerKw: 22.8,
        gearboxTorquePct: 68.4,
        peakPolishedRodLoadLbs: 19850,
        minPolishedRodLoadLbs: 7200,
        polishedRodStressPct: 62.5,
        pumpFillagePct: 91.5,
        pumpEfficiencyPct: 88.0,
        rodFloatingIndex: 0.28, // Safe
        fluidPoundingRisk: 0.12,
        cssPhase: 'PRODUCTION',
        daysInCurrentPhase: 24,
        targetSteamVolumeTons: 2400,
        currentSteamDeliveredTons: 2400,
        steamInjectionPressureBar: 88.0,
        steamInjectionTempC: 285.0,
        steamQualityPct: 84.0,
        soakDaysElapsed: 8,
        targetSoakDays: 8,
        instantaneousSOR: 3.12,
        cumulativeSOR: 3.38,
        netEnergyRatio: 3.82,
        co2EmissionsTonsPerDay: 4.1
      };
    }

    case 'BW-04': {
      // Cooled down well with heavy viscosity causing severe rod float
      const tempC = 54.0;
      const visc = calculateViscosity(tempC, staticData.staticViscosityCp);
      return {
        timestamp: Date.now(),
        oilRateBopd: 46.2,
        waterCutPct: 68.5,
        grossLiquidBpd: 146.7,
        cumulativeOilBbl: 12100,
        cumulativeSteamTons: 2150,
        tubingHeadPressureBar: 2.9,
        casingHeadPressureBar: 3.8,
        bottomHolePressureBar: 49.0,
        wellheadTempC: 44.2,
        bottomHoleTempC: tempC,
        nearWellboreViscosityCp: visc, // ~5200 cP
        strokeLengthInches: 120,
        spm: 6.8, // Too fast for 5200 cP oil!
        downstrokeRatio: 1.0, // Standard VFD (equal speed up & down)
        vfdFrequencyHz: 50.0,
        motorCurrentAmps: 48.6,
        motorPowerKw: 31.4,
        gearboxTorquePct: 92.5,
        peakPolishedRodLoadLbs: 24200,
        minPolishedRodLoadLbs: 950, // Drops near zero during rod float!
        polishedRodStressPct: 88.4,
        pumpFillagePct: 64.0,
        pumpEfficiencyPct: 56.5,
        rodFloatingIndex: 0.94, // SEVERE ROD FLOATING
        fluidPoundingRisk: 0.68,
        cssPhase: 'PRODUCTION',
        daysInCurrentPhase: 52,
        targetSteamVolumeTons: 2200,
        currentSteamDeliveredTons: 2200,
        steamInjectionPressureBar: 85.0,
        steamInjectionTempC: 280.0,
        steamQualityPct: 82.0,
        soakDaysElapsed: 7,
        targetSoakDays: 7,
        instantaneousSOR: 6.45,
        cumulativeSOR: 4.92,
        netEnergyRatio: 2.14,
        co2EmissionsTonsPerDay: 5.8
      };
    }

    case 'BW-07': {
      // In Thermal Soaking Phase
      const tempC = 215.0;
      const visc = calculateViscosity(tempC, staticData.staticViscosityCp);
      return {
        timestamp: Date.now(),
        oilRateBopd: 0.0,
        waterCutPct: 0.0,
        grossLiquidBpd: 0.0,
        cumulativeOilBbl: 24300,
        cumulativeSteamTons: 2600,
        tubingHeadPressureBar: 52.0,
        casingHeadPressureBar: 54.5,
        bottomHolePressureBar: 84.0,
        wellheadTempC: 178.0,
        bottomHoleTempC: tempC,
        nearWellboreViscosityCp: visc,
        strokeLengthInches: 120,
        spm: 0.0, // Pump stopped during soak
        downstrokeRatio: 0.8,
        vfdFrequencyHz: 0.0,
        motorCurrentAmps: 0.0,
        motorPowerKw: 0.0,
        gearboxTorquePct: 0.0,
        peakPolishedRodLoadLbs: 0,
        minPolishedRodLoadLbs: 0,
        polishedRodStressPct: 0,
        pumpFillagePct: 0,
        pumpEfficiencyPct: 0,
        rodFloatingIndex: 0.0,
        fluidPoundingRisk: 0.0,
        cssPhase: 'SOAKING',
        daysInCurrentPhase: 6,
        targetSteamVolumeTons: 2600,
        currentSteamDeliveredTons: 2600,
        steamInjectionPressureBar: 96.0,
        steamInjectionTempC: 298.0,
        steamQualityPct: 86.0,
        soakDaysElapsed: 6,
        targetSoakDays: 8,
        instantaneousSOR: 0.0,
        cumulativeSOR: 3.10,
        netEnergyRatio: 4.10,
        co2EmissionsTonsPerDay: 0.4
      };
    }

    case 'BW-12': {
      // In Steam Injection Phase
      const tempC = 282.0;
      const visc = calculateViscosity(tempC, staticData.staticViscosityCp);
      return {
        timestamp: Date.now(),
        oilRateBopd: 0.0,
        waterCutPct: 0.0,
        grossLiquidBpd: 0.0,
        cumulativeOilBbl: 8900,
        cumulativeSteamTons: 1750,
        tubingHeadPressureBar: 89.4,
        casingHeadPressureBar: 12.0,
        bottomHolePressureBar: 98.2,
        wellheadTempC: 264.0,
        bottomHoleTempC: tempC,
        nearWellboreViscosityCp: visc,
        strokeLengthInches: 120,
        spm: 0.0,
        downstrokeRatio: 0.8,
        vfdFrequencyHz: 0.0,
        motorCurrentAmps: 0.0,
        motorPowerKw: 0.0,
        gearboxTorquePct: 0.0,
        peakPolishedRodLoadLbs: 0,
        minPolishedRodLoadLbs: 0,
        polishedRodStressPct: 0,
        pumpFillagePct: 0,
        pumpEfficiencyPct: 0,
        rodFloatingIndex: 0.0,
        fluidPoundingRisk: 0.0,
        cssPhase: 'INJECTION',
        daysInCurrentPhase: 11,
        targetSteamVolumeTons: 2200,
        currentSteamDeliveredTons: 1750,
        steamInjectionPressureBar: 92.5,
        steamInjectionTempC: 288.0,
        steamQualityPct: 83.5,
        soakDaysElapsed: 0,
        targetSoakDays: 7,
        instantaneousSOR: 0.0,
        cumulativeSOR: 4.25,
        netEnergyRatio: 3.05,
        co2EmissionsTonsPerDay: 18.2 // Boiler burn emissions
      };
    }
  }
}

// Rod Floating Physics Evaluator
export function calculateRodFloating(
  spm: number,
  strokeLengthInches: number,
  viscosityCp: number,
  downstrokeRatio: number // < 1.0 means downstroke moves slower
): {
  rodFloatingIndex: number;
  viscousDragLbs: number;
  terminalDescentSpeedInSec: number;
  isFloating: boolean;
} {
  if (spm <= 0) {
    return { rodFloatingIndex: 0, viscousDragLbs: 0, terminalDescentSpeedInSec: 40, isFloating: false };
  }

  // Downward peak surface speed (in/s)
  // For standard harmonic motion: v_max = pi * S * (SPM / 60)
  // Modified by downstroke ratio (if ratio = 0.6, downstroke takes 62.5% of cycle time, speed is lower)
  const effectiveDownstrokeFactor = downstrokeRatio > 0.1 ? downstrokeRatio : 1.0;
  const downstrokeSpeedInSec = (Math.PI * strokeLengthInches * (spm / 60)) * effectiveDownstrokeFactor;

  // Heavy oil buoyant rod weight in 17° API fluid (~1000m tapered string): ~14,200 lbs submerged
  const submergedRodWeightLbs = 14200;

  // Heavy oil annular viscous drag model (Couette-Poiseuille flow along tapered rod string)
  // Drag proportional to (viscosity * downstroke speed)
  const dragCoefficient = 0.0165; // lbs / (cP * in/s)
  const viscousDragLbs = dragCoefficient * viscosityCp * downstrokeSpeedInSec;

  // Terminal gravity-limited falling velocity
  const terminalDescentSpeedInSec = submergedRodWeightLbs / Math.max(1, dragCoefficient * viscosityCp);

  // Rod floating occurs when viscous drag approaches or exceeds submerged rod weight
  const rodFloatingIndex = Math.min(1.0, Math.max(0.05, viscousDragLbs / (submergedRodWeightLbs * 0.88)));
  const isFloating = rodFloatingIndex >= 0.78;

  return {
    rodFloatingIndex: Number(rodFloatingIndex.toFixed(2)),
    viscousDragLbs: Math.round(viscousDragLbs),
    terminalDescentSpeedInSec: Number(terminalDescentSpeedInSec.toFixed(1)),
    isFloating
  };
}

// Dynamometer Card Generator (Surface & Downhole Pump Card with Gibbs Wave Equation effects)
export function generateDynacard(
  wellId: WellId,
  strokeLengthInches: number,
  spm: number,
  viscosityCp: number,
  downstrokeRatio: number,
  customDiagnosis?: DynacardData['diagnosis']
): DynacardData {
  const points: DynacardPoint[] = [];
  const numPoints = 80;
  
  const { rodFloatingIndex, isFloating } = calculateRodFloating(spm, strokeLengthInches, viscosityCp, downstrokeRatio);

  let diagnosis: DynacardData['diagnosis'] = 'Normal Full Pump';
  if (customDiagnosis) {
    diagnosis = customDiagnosis;
  } else if (isFloating || rodFloatingIndex > 0.75) {
    diagnosis = 'Severe Rod Floating';
  } else if (viscosityCp > 6000 && spm > 6) {
    diagnosis = 'Fluid Pounding';
  } else if (viscosityCp < 50 && spm > 7.5) {
    diagnosis = 'Gas Interference';
  }

  // Base parameters
  const rodWeightLbs = 16800;
  const fluidWeightLbs = 6200;
  const pprlBase = rodWeightLbs + fluidWeightLbs;
  const mprlBase = rodWeightLbs * 0.42;

  let pprl = pprlBase;
  let mprl = mprlBase;

  // Build card loop (upstroke: position 0 -> strokeLength; downstroke: strokeLength -> 0)
  for (let i = 0; i < numPoints; i++) {
    const fraction = i / (numPoints - 1);
    let pos = 0;
    let surfaceLoad = 0;
    let downholeLoad = 0;
    let idealLoad = 0;

    if (fraction <= 0.5) {
      // UPSTROKE (plunger lifts fluid column, valves: TV closed, SV open)
      const uFrac = fraction / 0.5;
      pos = strokeLengthInches * Math.sin((uFrac * Math.PI) / 2);

      // Ideal Card: Constant fluid load + rod weight
      idealLoad = pprlBase;

      // Surface Card Dynamics: Inertia + harmonic stress waves
      const dynamicWave = Math.sin(uFrac * Math.PI * 3.5) * 800 * (spm / 5.0);
      const viscousUpDrag = (viscosityCp / 500) * 80;
      surfaceLoad = rodWeightLbs + fluidWeightLbs + dynamicWave + viscousUpDrag;

      // Downhole Plunger Card
      if (uFrac < 0.12) {
        // Plunger pick-up elongation
        downholeLoad = rodWeightLbs * 0.4 + (fluidWeightLbs * (uFrac / 0.12));
      } else {
        downholeLoad = fluidWeightLbs + 800 + Math.sin(uFrac * Math.PI) * 200;
      }

      // Special Anomaly Adjustments
      if (diagnosis === 'Traveling Valve Leak') {
        surfaceLoad -= (1 - uFrac) * 1800;
        downholeLoad -= (1 - uFrac) * 1500;
      }
    } else {
      // DOWNSTROKE (plunger falls through fluid column, valves: TV open, SV closed)
      const dFrac = (fraction - 0.5) / 0.5;
      pos = strokeLengthInches * (1 - Math.sin((dFrac * Math.PI) / 2));

      // Ideal Card
      idealLoad = mprlBase;

      // Downhole Plunger Card
      if (dFrac < 0.12) {
        // Fluid load transfer to standing valve
        downholeLoad = fluidWeightLbs * (1 - dFrac / 0.12);
      } else {
        downholeLoad = 250; // Plunger friction only
      }

      // Surface Load during Downstroke
      if (diagnosis === 'Severe Rod Floating') {
        // In severe rod floating:
        // Rod descent is retarded by thick heavy oil; load cell drops sharply, bottom of card is squeezed
        // Then when beam reaches bottom, rods crash onto carrier bar -> high impact rebound spike!
        if (dFrac < 0.6) {
          surfaceLoad = 1200 + Math.random() * 300; // Almost zero load! Floating on oil!
        } else if (dFrac < 0.85) {
          surfaceLoad = 800;
        } else {
          // Hammer impact load spike at stroke reversal
          surfaceLoad = 14500 + (dFrac - 0.85) * 35000;
        }
        mprl = 950;
        pprl = 24500;
      } else if (diagnosis === 'Fluid Pounding') {
        // Sharp step decompression when plunger hits liquid surface mid-downstroke
        if (dFrac < 0.45) {
          surfaceLoad = mprlBase + 1500; // Traveling through vapor/gas space
        } else if (dFrac < 0.55) {
          surfaceLoad = mprlBase - 3200; // Liquid pound shock!
        } else {
          surfaceLoad = mprlBase + 200;
        }
      } else if (diagnosis === 'Gas Interference') {
        // Slow rounded decompression curve
        surfaceLoad = mprlBase + fluidWeightLbs * Math.exp(-dFrac * 2.5);
        downholeLoad = fluidWeightLbs * Math.exp(-dFrac * 3.0);
      } else {
        // Normal downstroke with dampening
        const dampingWave = Math.sin(dFrac * Math.PI * 3.5) * 450 * (spm / 5.0);
        const viscousDownDrag = (viscosityCp / 800) * 120 * (1 - downstrokeRatio * 0.4);
        surfaceLoad = mprlBase - viscousDownDrag + dampingWave;
      }
    }

    points.push({
      positionInches: Number(pos.toFixed(1)),
      surfaceLoadLbs: Math.round(surfaceLoad),
      downholeLoadLbs: Math.round(Math.max(0, downholeLoad)),
      idealLoadLbs: Math.round(idealLoad)
    });
  }

  return {
    wellId,
    strokeLengthInches,
    spm,
    timestamp: new Date().toLocaleTimeString(),
    fillagePct: diagnosis === 'Fluid Pounding' ? 62 : diagnosis === 'Severe Rod Floating' ? 68 : 92,
    diagnosis,
    confidence: diagnosis === 'Normal Full Pump' ? 98.2 : 94.7,
    points,
    pprl: Math.round(pprl),
    mprl: Math.round(mprl),
    fluidLoadLbs: fluidWeightLbs
  };
}

// Active Anomaly Alerts Generator
export function getActiveAlerts(wellId: WellId, telemetry: TelemetryData): AnomalyAlert[] {
  const alerts: AnomalyAlert[] = [];

  if (telemetry.rodFloatingIndex >= 0.78) {
    alerts.push({
      id: `ALT-RF-${wellId}`,
      wellId,
      timestamp: '2 min ago',
      title: 'CRITICAL: Severe Sucker Rod Floating Detected',
      severity: 'CRITICAL',
      category: 'ROD_FLOATING',
      description: `Downward viscous skin friction (${calculateViscosity(telemetry.bottomHoleTempC, 15000)} cP) exceeds gravity settling velocity of tapered rod string at ${telemetry.spm} SPM.`,
      physicsRootCause: 'Annular Couette shear stress between 1" & 7/8" sucker rods and cold heavy oil column in 3.5" tubing during fast downstroke. Polished rod unseating from carrier bar with hammer blow risk.',
      impact: 'Immediate rod string compressive buckling hazard, premature fatigue break at 3/4" rod coupling, and excessive tubing wall gouging.',
      recommendation: 'Engage VFD downstroke retardation mode (reduce downstroke speed to 3.2 SPM while retaining 5.5 SPM upstroke) and inject 15 bbl light aromatic diluent.',
      mitigationAction: 'Engage VFD Downstroke Retardation (0.65 ratio) & Reduce SPM',
      mitigated: false
    });
  }

  if (telemetry.bottomHoleTempC < 60 && telemetry.cssPhase === 'PRODUCTION') {
    alerts.push({
      id: `ALT-TH-${wellId}`,
      wellId,
      timestamp: '15 min ago',
      title: 'HIGH: Formation Heat Exhaustion & Thermal Decay',
      severity: 'WARNING',
      category: 'THERMAL_DECAY',
      description: `Bottomhole temperature decayed to ${telemetry.bottomHoleTempC.toFixed(1)}°C. Crude viscosity escalated above 4,500 cP.`,
      physicsRootCause: 'Depletion of injected steam sensible heat into Jodhpur sandstone reservoir; heat radius collapsed to < 8.2 meters.',
      impact: 'Rapid inflow drop, soaring lifting power consumption (+38%), and premature pump stall.',
      recommendation: 'Initiate CSS Cycle planning: Schedule OTSG boiler hookup for 2,400 ton steam injection.',
      mitigationAction: 'Schedule Next Steam Cycle (Cycle 3)',
      mitigated: false
    });
  }

  if (telemetry.gearboxTorquePct > 85) {
    alerts.push({
      id: `ALT-TQ-${wellId}`,
      wellId,
      timestamp: '28 min ago',
      title: 'WARNING: Surface Pumping Unit Peak Torque Exceeded',
      severity: 'WARNING',
      category: 'OVER_TORQUE',
      description: `Beam pump gearbox peak torque reaching ${telemetry.gearboxTorquePct.toFixed(1)}% of 456,000 in-lb API rating.`,
      physicsRootCause: 'Counterbalance weights under-compensated for heavy viscous fluid column lifting resistance.',
      impact: 'Gear reducer tooth pitting and accelerated electric motor thermal tripping.',
      recommendation: 'Adjust crank counterbalance weights outwards by 4.2 inches or reduce stroke length to 100".',
      mitigationAction: 'Rebalance Counterweights & Optimize Stroke',
      mitigated: false
    });
  }

  if (telemetry.instantaneousSOR > 5.5 && telemetry.cssPhase === 'PRODUCTION') {
    alerts.push({
      id: `ALT-SOR-${wellId}`,
      wellId,
      timestamp: '1 hour ago',
      title: 'ADVISORY: Elevated Steam-to-Oil Ratio (SOR)',
      severity: 'ADVISORY',
      category: 'HIGH_SOR',
      description: `Current SOR is ${telemetry.instantaneousSOR.toFixed(2)} m³/m³, exceeding field economic threshold of 4.2.`,
      physicsRootCause: 'Steam condensation bypass into high-permeability thief streak in lower Jodhpur sandstone layer.',
      impact: 'Reduced net thermal efficiency and increased fuel gas consumption per barrel.',
      recommendation: 'Deploy high-temperature foam diverter or adjust soak time for improved matrix penetration.',
      mitigationAction: 'Activate AI Matrix Steam Diverter Protocol',
      mitigated: false
    });
  }

  return alerts;
}

// AI Recommendations Generator
export function getAIRecommendations(wellId: WellId, telemetry: TelemetryData): AIOptimizationRecommendation[] {
  const recommendations: AIOptimizationRecommendation[] = [];

  if (telemetry.rodFloatingIndex > 0.6) {
    recommendations.push({
      id: `REC-VFD-${wellId}`,
      wellId,
      category: 'SRP_VFD',
      title: 'Activate Dual-Speed VFD Downstroke Retardation',
      currentValue: `Standard Symmetric SPM: ${telemetry.spm.toFixed(1)}`,
      recommendedValue: `Dual-Speed: 5.6 SPM Upstroke / 3.4 SPM Downstroke (Ratio 0.62)`,
      projectedBenefit: 'Eliminates 100% of rod floating, reduces polished rod shock impact by 74%, extends rod life by 3.2x',
      confidenceScore: 97.4,
      physicsReasoning: 'Allows heavy viscous crude in 3.5" tubing to drain through the traveling valve without exceeding terminal rod settling speed under gravity.',
      applied: false
    });
  }

  recommendations.push({
    id: `REC-CSS-${wellId}`,
    wellId,
    category: 'CSS_CYCLE',
    title: 'Optimal CSS Steam Volume & Quality Target',
    currentValue: '2,200 Tons @ 80% Quality',
    recommendedValue: '2,550 Tons @ 88% Quality (Steam Enthalpy 2,480 kJ/kg)',
    projectedBenefit: '+22.5% Heated Reservoir Volume, -14% Cumulative SOR over 90 days',
    confidenceScore: 93.8,
    physicsReasoning: 'PINN reservoir model indicates latent heat of higher quality steam penetrates 3.8m deeper into low-permeability Jodhpur sand streaks without premature liquid water breakthrough.',
    applied: false
  });

  recommendations.push({
    id: `REC-SOAK-${wellId}`,
    wellId,
    category: 'THERMAL_HEAT',
    title: 'AI Thermodynamic Soak Period Adjustment',
    currentValue: 'Fixed 7.0 Soak Days',
    recommendedValue: 'Dynamic 5.5 Soak Days',
    projectedBenefit: 'Retains 18°C higher near-wellbore enthalpy, accelerates first oil by 36 hours',
    confidenceScore: 91.2,
    physicsReasoning: 'Convective heat dissipation to upper non-pay siltstone shale accelerates after Day 5; opening early maximizes drawdown while crude remains fluid.',
    applied: false
  });

  return recommendations;
}

// 90-Day Production Prediction Forecast (PINN & Thermal Decline Model)
export function generateForecastData(
  steamVolumeTons: number,
  steamQualityPct: number,
  soakDays: number,
  spm: number,
  vfdOptimization: boolean
): ForecastDataPoint[] {
  const points: ForecastDataPoint[] = [];
  const days = 90;

  // Initial thermal conditions based on steam volume and quality
  const enthalpyBonus = (steamQualityPct - 80) * 1.5;
  const initialPeakTempC = 195 + (steamVolumeTons - 2000) * 0.035 + enthalpyBonus;
  const thermalDecayRate = 0.032 - (soakDays === 6 ? 0.003 : 0);

  for (let day = 1; day <= days; day++) {
    // Temperature decay: T(t) = T_static + (T_peak - T_static) * exp(-decay * t)
    const bht = 38.5 + (initialPeakTempC - 38.5) * Math.exp(-thermalDecayRate * day);
    const visc = calculateViscosity(bht, 14000);

    // Baseline production (unoptimized, suffers from rod float as it cools)
    const baseThermalFactor = Math.pow(1500 / Math.max(10, visc), 0.35);
    let baselineOil = Math.max(15, 210 * baseThermalFactor * Math.exp(-0.018 * day));
    if (day > 35 && !vfdOptimization) {
      // Unoptimized suffers mechanical degradation from rod float
      baselineOil *= 0.72;
    }

    // AI Optimized production with dynamic VFD speed & heat retention
    const optMultiplier = vfdOptimization ? 1.28 : 1.05;
    const optimizedOil = Math.round(baselineOil * optMultiplier * (1 + (steamQualityPct - 80) * 0.004));

    // Water cut progression (initially high due to steam condensate, then lowers, then slowly rises)
    let waterCut = 68 - Math.min(35, day * 1.2) + Math.max(0, (day - 40) * 0.55);
    waterCut = Math.min(88, Math.max(28, waterCut));

    // SOR instantaneous
    const cumSteam = steamVolumeTons;
    const sor = Number(((cumSteam * 0.95) / Math.max(1, optimizedOil * (day / 15))).toFixed(2));

    points.push({
      day,
      baselineOilBopd: Math.round(baselineOil),
      optimizedOilBopd: optimizedOil,
      bottomHoleTempC: Number(bht.toFixed(1)),
      viscosityCp: Math.round(visc),
      waterCutPct: Number(waterCut.toFixed(1)),
      sor: Math.min(8.5, Math.max(1.8, sor))
    });
  }

  return points;
}

// What-If Scenario Physics Simulator
export function simulateWhatIf(input: WhatIfScenarioInput) {
  const { steamVolumeTons, steamQualityPct, soakDays, srpSpm, vfdDownstrokeSlowdownPct, diluentInjectionRateBpd } = input;
  
  // Forecast
  const forecast = generateForecastData(
    steamVolumeTons,
    steamQualityPct,
    soakDays,
    srpSpm,
    vfdDownstrokeSlowdownPct > 20
  );

  // Totals over 90 days
  const totalBaseOilBbl = forecast.reduce((acc, p) => acc + p.baselineOilBopd, 0);
  const totalOptOilBbl = forecast.reduce((acc, p) => acc + p.optimizedOilBopd, 0);
  const netGainBbl = totalOptOilBbl - totalBaseOilBbl;

  // Economics (Crude at $72/bbl, Steam generation at $28/ton, Diluent at $58/bbl)
  const crudePrice = 72;
  const steamCost = steamVolumeTons * 28;
  const diluentCost = diluentInjectionRateBpd * 90 * 58;
  const grossRevenue = totalOptOilBbl * crudePrice;
  const netProfit = grossRevenue - steamCost - diluentCost;
  const cumulativeSor = Number((steamVolumeTons / (totalOptOilBbl * 0.159)).toFixed(2));

  // Rod floating risk
  const midLifeVisc = forecast[45].viscosityCp;
  const downstrokeRatio = 1.0 - (vfdDownstrokeSlowdownPct / 100);
  const rodCheck = calculateRodFloating(srpSpm, 120, midLifeVisc, downstrokeRatio);

  return {
    forecast,
    totalBaseOilBbl,
    totalOptOilBbl,
    netGainBbl,
    gainPct: Number(((netGainBbl / totalBaseOilBbl) * 100).toFixed(1)),
    grossRevenue,
    steamCost,
    diluentCost,
    netProfit,
    cumulativeSor,
    rodFloatingRisk: rodCheck.rodFloatingIndex,
    isRodFloating: rodCheck.isFloating
  };
}
