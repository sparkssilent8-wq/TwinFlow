// TypeScript types for PS 26120: AI-enabled Well-to-Surface Digital Twin
// Specifically tailored to Baghewala Field, Rajasthan (Oil India Limited)

export type WellPhase = 'INJECTION' | 'SOAKING' | 'PRODUCTION' | 'SHUT_IN';

export type WellId = 'BW-01' | 'BW-04' | 'BW-07' | 'BW-12';

export interface WellStaticData {
  id: WellId;
  name: string;
  field: string;
  basin: string;
  operator: string;
  reservoir: string;
  depthMeters: number; // e.g. 1020m Jodhpur sandstone
  casingDiameterInches: number; // 7" casing
  tubingDiameterInches: number; // 3.5" or 2.875" insulated tubing
  pumpDepthMeters: number; // 980m
  rodStringConfig: {
    section1: { size: string; lengthMeters: number; grade: string }; // 1" API D
    section2: { size: string; lengthMeters: number; grade: string }; // 7/8" API D
    section3: { size: string; lengthMeters: number; grade: string }; // 3/4" API D
  };
  crudeAPI: number; // 17.2° API
  staticViscosityCp: number; // 14,500 cP at static res temp 38°C
  staticResTempC: number; // 38°C
  initialResPressureBar: number; // 78 bar
  currentCycle: number;
}

export interface TelemetryData {
  timestamp: number;
  oilRateBopd: number;
  waterCutPct: number;
  grossLiquidBpd: number;
  cumulativeOilBbl: number;
  cumulativeSteamTons: number;
  
  // Pressures & Temperatures
  tubingHeadPressureBar: number;
  casingHeadPressureBar: number;
  bottomHolePressureBar: number;
  wellheadTempC: number;
  bottomHoleTempC: number;
  nearWellboreViscosityCp: number;

  // SRP Sucker Rod Pump Telemetry
  strokeLengthInches: number;
  spm: number; // strokes per minute
  downstrokeRatio: number; // dual speed VFD ratio (0.5 to 1.0)
  vfdFrequencyHz: number;
  motorCurrentAmps: number;
  motorPowerKw: number;
  gearboxTorquePct: number;
  peakPolishedRodLoadLbs: number; // PPRL
  minPolishedRodLoadLbs: number; // MPRL
  polishedRodStressPct: number; // % of allowable tensile rating
  pumpFillagePct: number;
  pumpEfficiencyPct: number;
  rodFloatingIndex: number; // 0.0 (safe) to 1.0 (severe buckling risk)
  fluidPoundingRisk: number; // 0.0 to 1.0

  // CSS Cycle Telemetry
  cssPhase: WellPhase;
  daysInCurrentPhase: number;
  targetSteamVolumeTons: number;
  currentSteamDeliveredTons: number;
  steamInjectionPressureBar: number;
  steamInjectionTempC: number;
  steamQualityPct: number; // 80% to 92%
  soakDaysElapsed: number;
  targetSoakDays: number;
  instantaneousSOR: number; // m3 steam CWE / m3 oil
  cumulativeSOR: number;
  netEnergyRatio: number;
  co2EmissionsTonsPerDay: number;
}

export interface DynacardPoint {
  positionInches: number;
  surfaceLoadLbs: number;
  downholeLoadLbs: number;
  idealLoadLbs: number;
}

export interface DynacardData {
  wellId: WellId;
  strokeLengthInches: number;
  spm: number;
  timestamp: string;
  fillagePct: number;
  diagnosis: 'Normal Full Pump' | 'Severe Rod Floating' | 'Fluid Pounding' | 'Gas Interference' | 'Traveling Valve Leak' | 'Standing Valve Leak';
  confidence: number;
  points: DynacardPoint[];
  pprl: number;
  mprl: number;
  fluidLoadLbs: number;
}

export interface AnomalyAlert {
  id: string;
  wellId: WellId;
  timestamp: string;
  title: string;
  severity: 'CRITICAL' | 'WARNING' | 'ADVISORY' | 'HEALTHY';
  category: 'ROD_FLOATING' | 'THERMAL_DECAY' | 'FLUID_POUND' | 'HIGH_SOR' | 'PUMP_LEAK' | 'OVER_TORQUE';
  description: string;
  physicsRootCause: string;
  impact: string;
  recommendation: string;
  mitigationAction: string;
  mitigated: boolean;
}

export interface AIOptimizationRecommendation {
  id: string;
  wellId: WellId;
  category: 'SRP_VFD' | 'CSS_CYCLE' | 'THERMAL_HEAT' | 'ROD_BUCKLING';
  title: string;
  currentValue: string;
  recommendedValue: string;
  projectedBenefit: string;
  confidenceScore: number; // 0 - 100
  physicsReasoning: string;
  applied: boolean;
}

export interface ForecastDataPoint {
  day: number;
  baselineOilBopd: number;
  optimizedOilBopd: number;
  bottomHoleTempC: number;
  viscosityCp: number;
  waterCutPct: number;
  sor: number;
}

export interface WhatIfScenarioInput {
  steamVolumeTons: number;
  steamQualityPct: number;
  soakDays: number;
  srpStrokeLength: number;
  srpSpm: number;
  vfdDownstrokeSlowdownPct: number;
  diluentInjectionRateBpd: number;
}
