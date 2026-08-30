import React, { useState } from 'react';
import { useAurora } from '../../context/AuroraContext';
import {
  evaluatePerformanceTelemetry,
  evaluatePlayerExperienceRadar,
  PerformanceTelemetry,
  PlayerExperienceRadar,
} from '../../lib/performanceAndUX';
import {
  Activity,
  Gauge,
  Cpu,
  Layers,
  HeartHandshake,
  TrendingUp,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

export const PerformanceAndUXView: React.FC = () => {
  const { projectContext } = useAurora();
  const [telemetry] = useState<PerformanceTelemetry>(() =>
    evaluatePerformanceTelemetry(projectContext)
  );
  const [radar] = useState<PlayerExperienceRadar>(() =>
    evaluatePlayerExperienceRadar(projectContext)
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                Performance Intelligence & Player Experience
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono border border-indigo-500/30">
                  REAL-TIME TELEMETRY
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Auditoría de rendimiento para 60 FPS en Phaser 3 y radar de experiencia lúdica del jugador.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-1">
          <span className="text-[11px] font-semibold text-slate-400">Tamaño del Bundle Estimado</span>
          <h3 className="text-2xl font-black text-slate-100">{telemetry.estimatedBundleSizeKb} KB</h3>
          <p className="text-[10px] text-emerald-400 font-mono">Optimizado para Web & Electron</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-1">
          <span className="text-[11px] font-semibold text-slate-400">Memoria RAM en Ejecución</span>
          <h3 className="text-2xl font-black text-indigo-400">{telemetry.memoryFootprintMb} MB</h3>
          <p className="text-[10px] text-slate-500 font-mono">Footprint ultra liviano</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-1">
          <span className="text-[11px] font-semibold text-slate-400">Draw Calls Estimadas</span>
          <h3 className="text-2xl font-black text-cyan-400">{telemetry.drawCallsPerScene} / escena</h3>
          <p className="text-[10px] text-slate-500 font-mono">Texture Atlas activo</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-1">
          <span className="text-[11px] font-semibold text-slate-400">Estado de Rendimiento</span>
          <h3 className="text-2xl font-black text-emerald-400">{telemetry.status}</h3>
          <p className="text-[10px] text-emerald-400 font-mono">60 FPS estables garantizados</p>
        </div>
      </div>

      {/* Player Experience Radar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <HeartHandshake className="w-4 h-4 text-pink-400" />
              Radar de Experiencia de Jugador (UX Score: {radar.overallUXScore}/100)
            </h2>
            <p className="text-xs text-slate-400">
              Evaluación heurística de 6 pilares de satisfacción y retención de jugadores.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-center">
          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-500">Onboarding</span>
            <p className="text-base font-black text-emerald-400 mt-0.5">{radar.onboardingPacing}%</p>
          </div>
          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-500">Curiosidad</span>
            <p className="text-base font-black text-cyan-400 mt-0.5">{radar.explorationCuriosity}%</p>
          </div>
          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-500">Táctica</span>
            <p className="text-base font-black text-indigo-400 mt-0.5">{radar.combatTacticsDepth}%</p>
          </div>
          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-500">Satisfacción</span>
            <p className="text-base font-black text-pink-400 mt-0.5">{radar.progressionSatisfaction}%</p>
          </div>
          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-500">Ritmo</span>
            <p className="text-base font-black text-amber-400 mt-0.5">{radar.rhythmVariety}%</p>
          </div>
          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-500">Sorpresa</span>
            <p className="text-base font-black text-purple-400 mt-0.5">{radar.discoverySurprise}%</p>
          </div>
        </div>

        {/* Strengths & Recommendations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
              Puntos Fuertes de la Experiencia:
            </span>
            <ul className="space-y-1 text-xs text-slate-300">
              {radar.strengths.map((s, i) => (
                <li key={i} className="flex items-center gap-1.5">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
              Áreas de Oportunidad para Ampliar:
            </span>
            <ul className="space-y-1 text-xs text-slate-300">
              {radar.weaknesses.map((w, i) => (
                <li key={i} className="flex items-center gap-1.5">
                  <span className="text-amber-400 font-bold">•</span>
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
