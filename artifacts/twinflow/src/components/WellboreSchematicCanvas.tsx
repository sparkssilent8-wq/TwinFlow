import React, { useRef, useEffect, useState } from 'react';
import { TelemetryData, WellStaticData } from '../types/wellTwin';

interface WellboreSchematicCanvasProps {
  wellData: WellStaticData;
  telemetry: TelemetryData;
  cyclePhase: number; // 0.0 to 1.0 (phase angle of current pump stroke)
  onSensorSelect?: (sensorName: string) => void;
}

export const WellboreSchematicCanvas: React.FC<WellboreSchematicCanvasProps> = ({
  wellData,
  telemetry,
  cyclePhase,
  onSensorSelect
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedSensor, setSelectedSensor] = useState<string | null>('Downhole Pump');

  const isRodFloating = telemetry.rodFloatingIndex >= 0.78;
  const isPumping = telemetry.spm > 0 && telemetry.cssPhase === 'PRODUCTION';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 640;
    const height = 720;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Dark industrial gradient background
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, '#0a1424');
    bgGrad.addColorStop(0.35, '#070d18');
    bgGrad.addColorStop(0.8, '#0d0f17');
    bgGrad.addColorStop(1, '#1a120c'); // Jodhpur sandstone formation tone
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // ==========================================
    // 1. SURFACE SRP BEAM PUMP KINEMATICS
    // ==========================================
    // Beam pivot point
    const pivotX = 220;
    const pivotY = 110;
    const beamLength = 140;

    // Stroke oscillation angle (radians)
    // When isPumping is false, beam is resting
    const strokeAngle = isPumping ? Math.sin(cyclePhase * Math.PI * 2) * 0.16 : 0.05;

    // Horsehead tip (wellhead centerline)
    const wellheadX = 380;
    const horseheadTipX = wellheadX;
    // Polished rod vertical displacement
    const rodTravel = isPumping ? Math.sin(cyclePhase * Math.PI * 2) * 22 : 0;
    const horseheadTipY = pivotY - Math.sin(strokeAngle) * (wellheadX - pivotX) + 8;

    // Crank & Pitman Arm
    const crankPivotX = 130;
    const crankPivotY = 175;
    const crankRadius = 26;
    const crankAngle = cyclePhase * Math.PI * 2;
    const crankPinX = crankPivotX + Math.cos(crankAngle) * crankRadius;
    const crankPinY = crankPivotY + Math.sin(crankAngle) * crankRadius;

    const rearBeamX = pivotX - Math.cos(strokeAngle) * 90;
    const rearBeamY = pivotY + Math.sin(strokeAngle) * 90;

    // Draw Samson Post (A-frame tower)
    ctx.strokeStyle = '#38bdf8'; // Bright cyan steel
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(pivotX, pivotY);
    ctx.lineTo(pivotX - 35, 195);
    ctx.moveTo(pivotX, pivotY);
    ctx.lineTo(pivotX + 35, 195);
    ctx.stroke();

    // Base skid
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(80, 195, 340, 12);
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(80, 195, 340, 12);

    // Pitman arm connecting rear beam to crank pin
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(rearBeamX, rearBeamY);
    ctx.lineTo(crankPinX, crankPinY);
    ctx.stroke();

    // Crank & Counterweight
    ctx.save();
    ctx.translate(crankPivotX, crankPivotY);
    ctx.rotate(crankAngle);
    // Crank arm
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(-6, -10, 12, 42);
    // Counterbalance weight
    ctx.fillStyle = '#eab308'; // Amber counterweight
    ctx.beginPath();
    ctx.arc(0, 32, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    // Walking Beam (steel I-beam)
    ctx.save();
    ctx.translate(pivotX, pivotY);
    ctx.rotate(strokeAngle);
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(-95, -7, 245, 14);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.strokeRect(-95, -7, 245, 14);

    // Center pivot bearing
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(0, 0, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#38bdf8';
    ctx.stroke();

    // Horsehead curve at front tip
    ctx.fillStyle = '#0369a1';
    ctx.beginPath();
    ctx.arc(150, -4, 28, -Math.PI * 0.45, Math.PI * 0.45, false);
    ctx.lineTo(150, 15);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    // Bridle cable from horsehead to carrier bar
    const carrierBarY = 165 + rodTravel;
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(wellheadX - 6, horseheadTipY + 12);
    ctx.lineTo(wellheadX - 6, carrierBarY);
    ctx.moveTo(wellheadX + 6, horseheadTipY + 12);
    ctx.lineTo(wellheadX + 6, carrierBarY);
    ctx.stroke();

    // Carrier Bar & Polished Rod Clamp
    ctx.fillStyle = isRodFloating ? '#ef4444' : '#e2e8f0';
    ctx.fillRect(wellheadX - 18, carrierBarY, 36, 6);

    // Polished Rod passing through Stuffing Box
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(wellheadX - 3, carrierBarY, 6, 210 - carrierBarY);

    // ==========================================
    // 2. SURFACE WELLHEAD & VALVES
    // ==========================================
    const wellheadY = 205;

    // Stuffing box
    ctx.fillStyle = '#334155';
    ctx.fillRect(wellheadX - 14, wellheadY - 14, 28, 14);
    ctx.strokeStyle = '#64748b';
    ctx.strokeRect(wellheadX - 14, wellheadY - 14, 28, 14);

    // Christmas tree block
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(wellheadX - 22, wellheadY, 44, 30);
    ctx.strokeStyle = '#475569';
    ctx.strokeRect(wellheadX - 22, wellheadY, 44, 30);

    // Steam Injection Line (Left branch)
    const isInjecting = telemetry.cssPhase === 'INJECTION';
    ctx.strokeStyle = isInjecting ? '#f97316' : '#64748b';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(wellheadX - 22, wellheadY + 15);
    ctx.lineTo(wellheadX - 70, wellheadY + 15);
    ctx.stroke();

    if (isInjecting) {
      // Steam glow & label
      ctx.fillStyle = '#fb923c';
      ctx.font = '10px Inter, sans-serif';
      ctx.fillText('♨ Steam Line (92 bar, 288°C)', wellheadX - 195, wellheadY + 10);
      // Small steam puff animation
      ctx.beginPath();
      ctx.arc(wellheadX - 45, wellheadY + 15, 6, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(251, 146, 60, 0.4)';
      ctx.fill();
    }

    // Heavy Oil Production Flowline (Right branch)
    ctx.strokeStyle = isPumping ? '#854d0e' : '#475569';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(wellheadX + 22, wellheadY + 15);
    ctx.lineTo(wellheadX + 80, wellheadY + 15);
    ctx.stroke();

    if (isPumping) {
      ctx.fillStyle = '#fbbf24';
      ctx.font = '10px Inter, sans-serif';
      ctx.fillText(`🛢 Flowline (${telemetry.oilRateBopd.toFixed(0)} BOPD)`, wellheadX + 85, wellheadY + 18);
    }

    // ==========================================
    // 3. SUBSURFACE WELLBORE & CASING
    // ==========================================
    const subY = 235;
    const bottomY = height - 50;
    const wellDepthPx = bottomY - subY;

    // Ground surface line
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(20, subY);
    ctx.lineTo(width - 20, subY);
    ctx.stroke();

    // Geological layers background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(20, subY + 2, width - 40, 200); // Overburden shale
    ctx.fillStyle = '#172554';
    ctx.fillRect(20, subY + 202, width - 40, 150); // Siltstone barrier
    ctx.fillStyle = '#1c1917';
    ctx.fillRect(20, subY + 352, width - 40, wellDepthPx - 350); // Jodhpur Sandstone Pay Zone

    // Formation Labels
    ctx.fillStyle = '#64748b';
    ctx.font = '10px Inter, sans-serif';
    ctx.fillText('Overburden / Claystone', 40, subY + 40);
    ctx.fillText('Tight Siltstone Barrier', 40, subY + 230);
    ctx.fillStyle = '#d97706';
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.fillText('Jodhpur Sandstone (Pay Zone @ ~1,000m)', 40, subY + 380);

    // Depth Ruler on Left
    ctx.fillStyle = '#94a3b8';
    ctx.font = '9px JetBrains Mono, monospace';
    const depths = [
      { d: '0m', y: subY },
      { d: '300m', y: subY + wellDepthPx * 0.3 },
      { d: '600m', y: subY + wellDepthPx * 0.6 },
      { d: '950m', y: subY + wellDepthPx * 0.88 },
      { d: '1020m', y: bottomY }
    ];
    depths.forEach((item) => {
      ctx.fillText(item.d, 12, item.y + 4);
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(32, item.y);
      ctx.lineTo(wellheadX - 60, item.y);
      ctx.stroke();
    });

    // 7" Production Casing (Outer Pipe)
    const casingHalfW = 28;
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(wellheadX - casingHalfW, subY, casingHalfW * 2, wellDepthPx);
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.strokeRect(wellheadX - casingHalfW, subY, casingHalfW * 2, wellDepthPx);

    // Cement Sheath behind casing
    ctx.fillStyle = 'rgba(100, 116, 139, 0.25)';
    ctx.fillRect(wellheadX - casingHalfW - 5, subY, 5, wellDepthPx);
    ctx.fillRect(wellheadX + casingHalfW, subY, 5, wellDepthPx);

    // 3.5" Vacuum Insulated Tubing (VIT) (Inner Pipe)
    const tubingHalfW = 16;
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(wellheadX - tubingHalfW, subY, tubingHalfW * 2, wellDepthPx * 0.92);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(wellheadX - tubingHalfW, subY, tubingHalfW * 2, wellDepthPx * 0.92);

    // Annulus Thermal Packer at 920m
    const packerY = subY + wellDepthPx * 0.84;
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(wellheadX - casingHalfW + 2, packerY, casingHalfW - tubingHalfW - 2, 14);
    ctx.fillRect(wellheadX + tubingHalfW, packerY, casingHalfW - tubingHalfW - 2, 14);

    // ==========================================
    // 4. JODHPUR RESERVOIR & THERMAL PLUME
    // ==========================================
    const resY = subY + wellDepthPx * 0.88;
    const tempRatio = Math.min(1.0, Math.max(0.1, (telemetry.bottomHoleTempC - 38) / 180));
    const thermalRadius = 35 + tempRatio * 110;

    // Glowing thermal heat bubble in sandstone
    const plumeGrad = ctx.createRadialGradient(wellheadX, resY + 25, 10, wellheadX, resY + 25, thermalRadius);
    plumeGrad.addColorStop(0, `rgba(239, 68, 68, ${0.45 * tempRatio + 0.1})`);
    plumeGrad.addColorStop(0.5, `rgba(249, 115, 22, ${0.3 * tempRatio})`);
    plumeGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = plumeGrad;
    ctx.beginPath();
    ctx.arc(wellheadX, resY + 25, thermalRadius, 0, Math.PI * 2);
    ctx.fill();

    // Perforation tunnels shooting into formation
    ctx.fillStyle = '#fb923c';
    for (let py = resY; py <= resY + 50; py += 12) {
      // Left perfs
      ctx.fillRect(wellheadX - casingHalfW - 12, py, 14, 3);
      // Right perfs
      ctx.fillRect(wellheadX + casingHalfW - 2, py, 14, 3);
    }

    // Oil inflow particle arrows if pumping
    if (isPumping) {
      ctx.fillStyle = '#f59e0b';
      const flowOffset = (cyclePhase * 20) % 20;
      for (let py = resY + 10; py <= resY + 45; py += 16) {
        // Arrow heads pointing towards wellbore
        ctx.beginPath();
        ctx.arc(wellheadX - 45 + flowOffset, py, 2.5, 0, Math.PI * 2);
        ctx.arc(wellheadX + 45 - flowOffset, py, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // ==========================================
    // 5. TAPERED SUCKER ROD STRING WITH DYNAMIC FINITE-ELEMENT STRESS GRADIENT
    // ==========================================
    const pumpY = subY + wellDepthPx * 0.88;
    const rodTopY = wellheadY;
    const totalRodLen = pumpY - rodTopY;

    // Tapered sections: Section 1 (1" rods, top 35%), Section 2 (7/8", middle 35%), Section 3 (3/4", lower 30%)
    const rodSections = [
      { start: 0, end: 0.35, width: 4.5, name: '1" API D' },
      { start: 0.35, end: 0.70, width: 3.5, name: '7/8" API D' },
      { start: 0.70, end: 1.00, width: 2.8, name: '3/4" API KD' }
    ];

    rodSections.forEach((sec) => {
      const y1 = rodTopY + sec.start * totalRodLen + rodTravel;
      const y2 = rodTopY + sec.end * totalRodLen + rodTravel;

      // Color-coding based on live stress and rod-floating condition
      let strokeColor = '#38bdf8'; // Normal safe tension
      if (isRodFloating) {
        // Severe rod floating creates compressive buckling waves in the bottom/mid string!
        strokeColor = sec.start >= 0.35 ? '#f43f5e' : '#fb923c';
      } else if (telemetry.polishedRodStressPct > 80) {
        strokeColor = '#f59e0b';
      }

      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = sec.width;
      ctx.beginPath();

      if (isRodFloating && sec.start >= 0.35) {
        // Visual serpentine buckling wave when floating!
        const segments = 12;
        ctx.moveTo(wellheadX, y1);
        for (let s = 1; s <= segments; s++) {
          const sy = y1 + (s / segments) * (y2 - y1);
          const buckleX = wellheadX + Math.sin(s * 1.8 + cyclePhase * 5) * 4;
          ctx.lineTo(buckleX, sy);
        }
      } else {
        ctx.moveTo(wellheadX, y1);
        ctx.lineTo(wellheadX, y2);
      }
      ctx.stroke();

      // Coupling collar joints
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(wellheadX - sec.width - 1, y2 - 3, (sec.width + 1) * 2, 6);
    });

    // ==========================================
    // 6. DOWNHOLE SUCKER ROD PUMP (980m)
    // ==========================================
    const barrelTopY = pumpY - 20;
    const barrelH = 50;

    // Pump Barrel (fixed to tubing)
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(wellheadX - 10, barrelTopY, 20, barrelH);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fillRect(wellheadX - 9, barrelTopY, 18, barrelH);

    // Plunger (moves with rod string)
    const plungerY = barrelTopY + 12 + rodTravel;
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(wellheadX - 7, plungerY, 14, 24);

    // Traveling Valve inside Plunger
    // On upstroke: TV closed (seated). On downstroke: TV open (lifted).
    const isUpstroke = Math.cos(cyclePhase * Math.PI * 2) >= 0;
    ctx.fillStyle = isUpstroke ? '#e2e8f0' : '#38bdf8';
    const tvBallY = isUpstroke ? plungerY + 18 : plungerY + 12;
    ctx.beginPath();
    ctx.arc(wellheadX, tvBallY, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Standing Valve at bottom of barrel
    // On upstroke: SV open (fluid enters). On downstroke: SV closed.
    const svBallY = isUpstroke ? barrelTopY + barrelH - 12 : barrelTopY + barrelH - 5;
    ctx.fillStyle = isUpstroke ? '#38bdf8' : '#e2e8f0';
    ctx.beginPath();
    ctx.arc(wellheadX, svBallY, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Gas Anchor & Sand Screen at Bottom
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1;
    for (let gy = barrelTopY + barrelH; gy <= barrelTopY + barrelH + 20; gy += 4) {
      ctx.beginPath();
      ctx.moveTo(wellheadX - 6, gy);
      ctx.lineTo(wellheadX + 6, gy);
      ctx.stroke();
    }

    // ==========================================
    // 7. INTERACTIVE SENSOR CALLOUT PINS
    // ==========================================
    const sensors = [
      {
        id: 'Surface Load Cell',
        x: wellheadX + 25,
        y: carrierBarY - 5,
        val: `${telemetry.peakPolishedRodLoadLbs.toLocaleString()} lbs`,
        sub: `MPRL: ${telemetry.minPolishedRodLoadLbs.toLocaleString()}`
      },
      {
        id: 'Tubing Head (THP)',
        x: wellheadX + 50,
        y: wellheadY - 2,
        val: `${telemetry.tubingHeadPressureBar.toFixed(1)} bar`,
        sub: `${telemetry.wellheadTempC.toFixed(0)}°C`
      },
      {
        id: 'Rod Taper 7/8"',
        x: wellheadX + 22,
        y: subY + totalRodLen * 0.5,
        val: isRodFloating ? 'BUCKLING RISK' : 'NORMAL STRESS',
        sub: `${(telemetry.polishedRodStressPct).toFixed(0)}% Yield`
      },
      {
        id: 'Downhole Pump (980m)',
        x: wellheadX + 35,
        y: pumpY + 10,
        val: `${telemetry.bottomHoleTempC.toFixed(1)}°C`,
        sub: `${telemetry.nearWellboreViscosityCp} cP`
      }
    ];

    sensors.forEach((s) => {
      const isSelected = selectedSensor === s.id;
      // Connecting line
      ctx.strokeStyle = isSelected ? '#00d2ff' : '#475569';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(wellheadX, s.y);
      ctx.lineTo(s.x, s.y);
      ctx.stroke();
      ctx.setLineDash([]);

      // Pin circle
      ctx.fillStyle = isSelected ? '#00d2ff' : '#0f172a';
      ctx.beginPath();
      ctx.arc(s.x, s.y, isSelected ? 6 : 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = isSelected ? '#ffffff' : '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Label card
      const labelW = 145;
      const labelH = 34;
      ctx.fillStyle = isSelected ? 'rgba(12, 22, 38, 0.95)' : 'rgba(8, 15, 27, 0.85)';
      ctx.fillRect(s.x + 8, s.y - 17, labelW, labelH);
      ctx.strokeStyle = isSelected ? '#00d2ff' : '#1e3a5f';
      ctx.lineWidth = 1;
      ctx.strokeRect(s.x + 8, s.y - 17, labelW, labelH);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '9px Inter, sans-serif';
      ctx.fillText(s.id, s.x + 14, s.y - 5);

      ctx.fillStyle = isRodFloating && s.id.includes('Rod') ? '#f43f5e' : '#38bdf8';
      ctx.font = 'bold 10px JetBrains Mono, monospace';
      ctx.fillText(s.val, s.x + 14, s.y + 10);
    });

  }, [wellData, telemetry, cyclePhase, selectedSensor, isRodFloating, isPumping]);

  return (
    <div className="flex flex-col bg-[#070f1e] border border-cyan-500/20 rounded-xl p-3 shadow-xl">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              {wellData.name} • Well-to-Surface Digital Twin
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
              Depth: {wellData.depthMeters}m | Jodhpur Sandstone
            </span>
          </div>
          <span className="text-[11px] text-slate-400">
            Real-time finite-element rod stress, surface beam kinematics, and thermal steam plume
          </span>
        </div>

        {isRodFloating && (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-rose-500/20 text-rose-300 border border-rose-500/50 rounded-lg text-xs font-bold animate-pulse">
            <span>⚠️ ROD FLOATING / COMPRESSIVE BUCKLING</span>
          </div>
        )}
      </div>

      <div className="relative flex justify-center items-center overflow-hidden rounded-lg bg-black/40">
        <canvas
          ref={canvasRef}
          style={{ width: '640px', height: '720px', maxWidth: '100%' }}
          className="cursor-pointer"
          onClick={() => {
            // Cycle through sensors on click
            const sensorList = ['Surface Load Cell', 'Tubing Head (THP)', 'Rod Taper 7/8"', 'Downhole Pump (980m)'];
            const nextIdx = (sensorList.indexOf(selectedSensor || '') + 1) % sensorList.length;
            const nextSensor = sensorList[nextIdx];
            setSelectedSensor(nextSensor);
            if (onSensorSelect) onSensorSelect(nextSensor);
          }}
        />
      </div>

      {/* Legend & Telemetry Indicators */}
      <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        <div className="bg-slate-900/60 p-2 rounded border border-slate-800 flex items-center justify-between">
          <span className="text-slate-400">Thermal Front:</span>
          <span className="font-mono font-bold text-orange-400">
            {((telemetry.bottomHoleTempC - 38) * 0.18 + 4.2).toFixed(1)} m radius
          </span>
        </div>
        <div className="bg-slate-900/60 p-2 rounded border border-slate-800 flex items-center justify-between">
          <span className="text-slate-400">Viscous Drag:</span>
          <span className="font-mono font-bold text-cyan-300">
            {Math.round((telemetry.nearWellboreViscosityCp / 1000) * 180 + 350)} lbs
          </span>
        </div>
        <div className="bg-slate-900/60 p-2 rounded border border-slate-800 flex items-center justify-between">
          <span className="text-slate-400">Downstroke SPM:</span>
          <span className="font-mono font-bold text-white">
            {(telemetry.spm * telemetry.downstrokeRatio).toFixed(1)} SPM
          </span>
        </div>
        <div className="bg-slate-900/60 p-2 rounded border border-slate-800 flex items-center justify-between">
          <span className="text-slate-400">Plunger Stroke:</span>
          <span className="font-mono font-bold text-emerald-400">
            {(telemetry.strokeLengthInches * 0.94).toFixed(0)}" gross
          </span>
        </div>
      </div>
    </div>
  );
};
