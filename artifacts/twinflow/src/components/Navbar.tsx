import React from 'react';
import {
  Flame,
  Activity,
  Layers,
  Cpu,
  BarChart3,
  AlertTriangle,
  FileSpreadsheet,
  Play,
  Pause,
  RotateCcw,
  Zap,
  Radio,
  Sliders,
  ChevronDown
} from 'lucide-react';
import { WellId, WellPhase } from '../types/wellTwin';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedWell: WellId;
  setSelectedWell: (well: WellId) => void;
  cssPhase: WellPhase;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  simSpeed: number;
  setSimSpeed: (speed: number) => void;
  criticalAlertsCount: number;
  onEmergencyStop: () => void;
  onReset: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  selectedWell,
  setSelectedWell,
  cssPhase,
  isPlaying,
  setIsPlaying,
  simSpeed,
  setSimSpeed,
  criticalAlertsCount,
  onEmergencyStop,
  onReset
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'digital-twin', label: 'Digital Twin', icon: Layers },
    { id: 'css-opt', label: 'CSS Optimization', icon: Flame },
    { id: 'srp-opt', label: 'SRP & Dynacards', icon: Sliders },
    { id: 'predictions', label: 'AI Predictions', icon: Cpu },
    { id: 'alerts', label: 'Alerts & Runbooks', icon: AlertTriangle, badge: criticalAlertsCount },
    { id: 'reports', label: 'Field Reports', icon: FileSpreadsheet }
  ];

  const getPhaseBadge = (phase: WellPhase) => {
    switch (phase) {
      case 'PRODUCTION':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            PRODUCTION
          </span>
        );
      case 'SOAKING':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
            SOAKING
          </span>
        );
      case 'INJECTION':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-500/10 text-orange-400 border border-orange-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse"></span>
            STEAM INJECTION
          </span>
        );
      case 'SHUT_IN':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
            SHUT-IN
          </span>
        );
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#070e1b]/95 backdrop-blur-md border-b border-cyan-500/20 shadow-lg shadow-black/40">
      {/* Top Banner: Field Identity & Simulation Controls */}
      <div className="px-4 py-2 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-600 to-blue-900 border border-cyan-400/40 shadow-inner shadow-cyan-400/20">
            <Radio className="w-5 h-5 text-cyan-200 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold tracking-widest text-cyan-400 uppercase">Oil India Limited • PS 26120</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono">Bikaner-Nagaur Basin</span>
            </div>
            <h1 className="text-base font-extrabold text-white tracking-tight flex items-center gap-2">
              Baghewala Heavy-Oil Digital Twin
              <span className="text-xs font-normal text-slate-400 hidden sm:inline">| CSS + SRP AI Optimization</span>
            </h1>
          </div>
        </div>

        {/* Well Selector & Controls */}
        <div className="flex items-center gap-3">
          {/* Well Selection Dropdown */}
          <div className="flex items-center gap-2 bg-[#0c1626] border border-cyan-500/30 rounded-lg px-3 py-1.5 shadow-sm">
            <span className="text-xs font-medium text-slate-400">Well:</span>
            <div className="relative">
              <select
                value={selectedWell}
                onChange={(e) => setSelectedWell(e.target.value as WellId)}
                aria-label="Select Well"
                className="bg-transparent text-sm font-bold text-cyan-300 pr-6 cursor-pointer focus:outline-none"
              >
                <option value="BW-01" className="bg-[#0c1626] text-white">BW-01 (Prod - Stable)</option>
                <option value="BW-04" className="bg-[#0c1626] text-rose-300">BW-04 (Late Prod - Rod Float Alert!)</option>
                <option value="BW-07" className="bg-[#0c1626] text-amber-300">BW-07 (Soak - Day 6/8)</option>
                <option value="BW-12" className="bg-[#0c1626] text-orange-300">BW-12 (Steam Inj - Day 11/14)</option>
              </select>
            </div>
            {getPhaseBadge(cssPhase)}
          </div>

          {/* Simulation Play / Pause / Speed */}
          <div className="flex items-center gap-1.5 bg-[#0c1626] border border-slate-700/80 rounded-lg px-2 py-1">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              title={isPlaying ? 'Pause Simulation' : 'Resume Simulation'}
              className={`p-1.5 rounded transition ${
                isPlaying
                  ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
              }`}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <div className="flex items-center text-xs font-mono font-medium text-slate-300 pl-1 border-l border-slate-700">
              {[1, 2, 5].map((speed) => (
                <button
                  key={speed}
                  onClick={() => setSimSpeed(speed)}
                  className={`px-1.5 py-0.5 rounded transition ${
                    simSpeed === speed ? 'bg-cyan-500/30 text-cyan-300 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>
            <button
              onClick={onReset}
              title="Reset Simulation State"
              className="p-1.5 text-slate-400 hover:text-cyan-300 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Emergency Stop / Shut-In */}
          <button
            onClick={onEmergencyStop}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 border border-rose-500/40 rounded-lg text-xs font-bold transition shadow-sm"
          >
            <Zap className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden sm:inline">Emergency</span> Shut-In
          </button>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <nav className="px-4 flex items-center gap-1 overflow-x-auto scrollbar-none py-1 bg-[#091120]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
              <span>{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500 text-white animate-pulse">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </header>
  );
};
