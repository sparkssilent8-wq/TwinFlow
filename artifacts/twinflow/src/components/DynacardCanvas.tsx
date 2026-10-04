import React, { useRef, useEffect } from 'react';
import { DynacardData } from '../types/wellTwin';

interface DynacardCanvasProps {
  cardData: DynacardData;
  height?: number;
  width?: number;
  showIdeal?: boolean;
  showDownhole?: boolean;
  liveCyclePhase?: number; // 0.0 to 1.0 (phase angle of current pump stroke)
}

export const DynacardCanvas: React.FC<DynacardCanvasProps> = ({
  cardData,
  height = 320,
  width = 500,
  showIdeal = true,
  showDownhole = true,
  liveCyclePhase = 0
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high-DPI retina display
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Clear background
    ctx.fillStyle = '#070f1e';
    ctx.fillRect(0, 0, width, height);

    const padding = { top: 30, right: 30, bottom: 45, left: 65 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    // Determine scale limits
    const maxPos = cardData.strokeLengthInches || 120;
    const maxLoad = 30000; // lbs max
    const minLoad = 0;

    const mapX = (pos: number) => padding.left + (pos / maxPos) * chartW;
    const mapY = (load: number) => padding.top + chartH - ((load - minLoad) / (maxLoad - minLoad)) * chartH;

    // Draw Grid & Axes
    ctx.strokeStyle = '#162842';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#64748b';
    ctx.font = '10px JetBrains Mono, monospace';

    // Horizontal grid (Loads: 0, 5k, 10k, 15k, 20k, 25k, 30k)
    for (let l = 0; l <= maxLoad; l += 5000) {
      const y = mapY(l);
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + chartW, y);
      ctx.stroke();
      ctx.fillText(`${(l / 1000).toFixed(0)}k`, padding.left - 30, y + 3);
    }

    // Vertical grid (Stroke: 0, 25%, 50%, 75%, 100%)
    for (let p = 0; p <= maxPos; p += maxPos / 4) {
      const x = mapX(p);
      ctx.beginPath();
      ctx.moveTo(x, padding.top);
      ctx.lineTo(x, padding.top + chartH);
      ctx.stroke();
      ctx.fillText(`${p.toFixed(0)}"`, x - 8, padding.top + chartH + 18);
    }

    // Axis Labels
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px Inter, sans-serif';
    ctx.fillText('Polished Rod Displacement (Inches)', padding.left + chartW / 2 - 80, height - 10);
    
    ctx.save();
    ctx.translate(16, padding.top + chartH / 2 + 30);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Load (lbs)', 0, 0);
    ctx.restore();

    // 1. Draw Ideal Envelope if requested
    if (showIdeal && cardData.points.length > 0) {
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.35)';
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1.5;
      cardData.points.forEach((pt, idx) => {
        const x = mapX(pt.positionInches);
        const y = mapY(pt.idealLoadLbs);
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.closePath();
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // 2. Draw Downhole Pump Card (Gibbs wave equation solution)
    if (showDownhole && cardData.points.length > 0) {
      ctx.beginPath();
      ctx.strokeStyle = '#10b981'; // Emerald
      ctx.lineWidth = 2.5;
      cardData.points.forEach((pt, idx) => {
        const x = mapX(pt.positionInches);
        const y = mapY(pt.downholeLoadLbs);
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.closePath();
      ctx.fillStyle = 'rgba(16, 185, 129, 0.08)';
      ctx.fill();
      ctx.stroke();
    }

    // 3. Draw Surface Dynamometer Card
    if (cardData.points.length > 0) {
      ctx.beginPath();
      ctx.strokeStyle = cardData.diagnosis === 'Severe Rod Floating' ? '#f43f5e' : '#00d2ff'; // Cyan or Rose
      ctx.lineWidth = 2.8;
      cardData.points.forEach((pt, idx) => {
        const x = mapX(pt.positionInches);
        const y = mapY(pt.surfaceLoadLbs);
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.closePath();
      ctx.fillStyle = cardData.diagnosis === 'Severe Rod Floating' ? 'rgba(244, 63, 94, 0.08)' : 'rgba(0, 210, 255, 0.08)';
      ctx.fill();
      ctx.stroke();

      // 4. Live Tracking Cursor Dot
      const activeIdx = Math.floor((liveCyclePhase % 1) * (cardData.points.length - 1));
      const activePoint = cardData.points[activeIdx] || cardData.points[0];
      const curX = mapX(activePoint.positionInches);
      const curY = mapY(activePoint.surfaceLoadLbs);

      // Glowing pulse ring
      ctx.beginPath();
      ctx.arc(curX, curY, 8, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 210, 255, 0.3)';
      ctx.fill();

      // Center solid dot
      ctx.beginPath();
      ctx.arc(curX, curY, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.strokeStyle = '#00d2ff';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Legend in top right
    ctx.font = '10px Inter, sans-serif';
    let legendX = width - padding.right - 180;
    let legendY = padding.top - 12;

    // Surface
    ctx.fillStyle = cardData.diagnosis === 'Severe Rod Floating' ? '#f43f5e' : '#00d2ff';
    ctx.fillRect(legendX, legendY, 10, 3);
    ctx.fillText('Surface Dynacard', legendX + 14, legendY + 5);

    // Downhole
    if (showDownhole) {
      legendX += 100;
      ctx.fillStyle = '#10b981';
      ctx.fillRect(legendX, legendY, 10, 3);
      ctx.fillText('Downhole Pump', legendX + 14, legendY + 5);
    }

  }, [cardData, height, width, showIdeal, showDownhole, liveCyclePhase]);

  const getDiagnosisBadge = () => {
    switch (cardData.diagnosis) {
      case 'Normal Full Pump':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'Severe Rod Floating':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/50 animate-pulse';
      case 'Fluid Pounding':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      default:
        return 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30';
    }
  };

  return (
    <div className="flex flex-col bg-[#070f1e] border border-cyan-500/20 rounded-xl p-3 shadow-md">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-white uppercase tracking-wider">Dynamometer Card Analysis</span>
          <span className="text-[10px] text-slate-400 font-mono">Gibbs Wave Solver</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${getDiagnosisBadge()}`}>
            {cardData.diagnosis}
          </span>
          <span className="text-[10px] font-mono text-cyan-400">
            {cardData.confidence}% AI Match
          </span>
        </div>
      </div>

      <div className="relative w-full flex justify-center overflow-hidden">
        <canvas
          ref={canvasRef}
          style={{ width: `${width}px`, height: `${height}px`, maxWidth: '100%' }}
          className="rounded"
        />
      </div>

      {/* Card metrics summary bar */}
      <div className="grid grid-cols-4 gap-2 mt-2 pt-2 border-t border-slate-800 text-[11px] font-mono text-center">
        <div className="bg-slate-900/60 p-1.5 rounded border border-slate-800">
          <span className="text-slate-400 block text-[10px]">PPRL</span>
          <span className="text-white font-bold">{cardData.pprl.toLocaleString()} lbs</span>
        </div>
        <div className="bg-slate-900/60 p-1.5 rounded border border-slate-800">
          <span className="text-slate-400 block text-[10px]">MPRL</span>
          <span className={`${cardData.mprl < 2000 ? 'text-rose-400 font-bold' : 'text-cyan-300'}`}>
            {cardData.mprl.toLocaleString()} lbs
          </span>
        </div>
        <div className="bg-slate-900/60 p-1.5 rounded border border-slate-800">
          <span className="text-slate-400 block text-[10px]">Fluid Load</span>
          <span className="text-emerald-400 font-bold">{cardData.fluidLoadLbs.toLocaleString()} lbs</span>
        </div>
        <div className="bg-slate-900/60 p-1.5 rounded border border-slate-800">
          <span className="text-slate-400 block text-[10px]">Pump Fillage</span>
          <span className="text-amber-400 font-bold">{cardData.fillagePct}%</span>
        </div>
      </div>
    </div>
  );
};
