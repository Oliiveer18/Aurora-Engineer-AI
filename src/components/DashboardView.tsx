import React from 'react';
import { useAurora } from '../context/AuroraContext';
import {
  Sparkles,
  GitMerge,
  Layers,
  Activity,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  Plus,
  Compass,
  FileCode,
  CheckCircle2,
  TrendingUp,
  Zap,
  Box,
  Scroll,
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const { projectContext, validationReport, projectAnalysis, setActiveTab, setSelectedEntity } = useAurora();

  const handleOpenEntity = (type: any, item: any) => {
    setSelectedEntity({ type, data: item });
    setActiveTab('editor');
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-y-auto p-6 max-w-6xl mx-auto space-y-6">
      {/* Hero Welcome Banner */}
      <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-2xl shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 font-semibold uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Estudio de Creación con IA para Videojuego RPG 2.5D
            </div>
            <h1 className="text-2xl font-bold text-slate-100">AURORA AI CREATOR</h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Herramienta externa de producción de contenido para el universo de AURORA (Phaser 3 + TypeScript). Genera, analiza, calibra en 2.5D y exporta entidades listas para producción.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab('live_profiler')}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-900/40 transition cursor-pointer"
            >
              <Activity className="w-4 h-4" />
              <span>Live Profiler 2.3</span>
            </button>

            <button
              onClick={() => setActiveTab('verified_optimizer')}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-900/30 transition cursor-pointer"
            >
              <Zap className="w-4 h-4" />
              <span>Verified Optimizer (Lock ON)</span>
            </button>

            <button
              onClick={() => setActiveTab('self_audit')}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Self-Audit 0€</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div
          onClick={() => setActiveTab('library')}
          className="p-4 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-2xl cursor-pointer transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Total Entidades</span>
            <Layers className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition" />
          </div>
          <div className="text-2xl font-bold font-mono text-cyan-400 mt-2">
            {projectContext.creatures.length +
              projectContext.npcs.length +
              projectContext.quests.length +
              projectContext.biomes.length +
              projectContext.items.length +
              projectContext.abilities.length}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {projectContext.creatures.length} Criaturas · {projectContext.npcs.length} NPCs
          </span>
        </div>

        <div
          onClick={() => setActiveTab('validator')}
          className="p-4 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-2xl cursor-pointer transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Salud del Esquema</span>
            {validationReport.healthScore >= 90 ? (
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            ) : (
              <ShieldAlert className="w-4 h-4 text-amber-400" />
            )}
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-2">
            {validationReport.healthScore}%
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {validationReport.summary.criticalErrors} errores · {validationReport.summary.warnings} avisos
          </span>
        </div>

        <div
          onClick={() => setActiveTab('analyzer')}
          className="p-4 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-2xl cursor-pointer transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Lagunas de Contenido</span>
            <Activity className="w-4 h-4 text-purple-400 group-hover:scale-110 transition" />
          </div>
          <div className="text-2xl font-bold font-mono text-purple-400 mt-2">
            {projectAnalysis.missingContentGaps.length}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Sugerencias IA disponibles</span>
        </div>

        <div
          onClick={() => setActiveTab('export')}
          className="p-4 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-2xl cursor-pointer transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Exportación Phaser 3</span>
            <FileCode className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-200 mt-2">Listo</div>
          <span className="text-[11px] text-slate-500 mt-1 block">TypeScript & 2.5D Scenes</span>
        </div>
      </div>

      {/* Quick Generator Studio Cards */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          Creación Rápida por Categoría
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              title: 'Criatura 2.5D',
              desc: 'Bestias y espíritus con estadísticas, evoluciones y Y-sorting.',
              icon: '🐾',
              type: 'creature',
              color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30',
            },
            {
              title: 'NPC & Diálogos',
              desc: 'Comerciantes, líderes y exploradores con árboles de diálogo.',
              icon: '🧙',
              type: 'npc',
              color: 'from-purple-500/20 to-indigo-500/10 border-purple-500/30',
            },
            {
              title: 'Misión / Contrato',
              desc: 'Misiones principales, secundarias y contratos de caza.',
              icon: '📜',
              type: 'quest',
              color: 'from-amber-500/20 to-orange-500/10 border-amber-500/30',
            },
            {
              title: 'Bioma & Ecosistema',
              desc: 'Clima, iluminación dimétrica y tablas de encuentros.',
              icon: '🌲',
              type: 'biome',
              color: 'from-cyan-500/20 to-blue-500/10 border-cyan-500/30',
            },
          ].map((card) => (
            <div
              key={card.type}
              onClick={() => setActiveTab('ai_creator')}
              className={`p-4 bg-gradient-to-b ${card.color} bg-slate-900 border rounded-2xl cursor-pointer hover:scale-[1.02] transition shadow-lg flex flex-col justify-between`}
            >
              <div>
                <span className="text-2xl mb-2 block">{card.icon}</span>
                <h3 className="text-sm font-bold text-slate-100">{card.title}</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{card.desc}</p>
              </div>
              <div className="flex items-center gap-1 text-xs font-semibold text-cyan-400 mt-4">
                <span>Generar con IA</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two Columns: Recent Creatures & Biome Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Entities */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              Criaturas Registradas ({projectContext.creatures.length})
            </h3>
            <button
              onClick={() => setActiveTab('library')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
            >
              Ver todas →
            </button>
          </div>

          <div className="space-y-2">
            {projectContext.creatures.slice(0, 4).map((c) => (
              <div
                key={c.id}
                onClick={() => handleOpenEntity('creature', c)}
                className="p-3 bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-cyan-500/40 rounded-xl cursor-pointer transition flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: c.visual2D5?.tintColor || '#22c55e' }}
                  />
                  <div>
                    <div className="text-xs font-bold text-slate-200">{c.name}</div>
                    <span className="text-[10px] font-mono text-slate-500">ID: {c.id}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-purple-300 border border-slate-800">
                    {c.rarity}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                    {c.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Biomes Status */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Compass className="w-4 h-4 text-emerald-400" />
              Biomas & Ecosistemas ({projectContext.biomes.length})
            </h3>
          </div>

          <div className="space-y-2">
            {projectContext.biomes.map((b) => (
              <div
                key={b.id}
                onClick={() => handleOpenEntity('biome', b)}
                className="p-3 bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500/40 rounded-xl cursor-pointer transition flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-slate-200">{b.name}</div>
                  <span className="text-[10px] text-slate-500">
                    {b.temperature} · {b.atmosphere}
                  </span>
                </div>
                <div className="text-[11px] font-mono text-emerald-400 font-semibold">
                  {b.commonCreatures.length + b.uncommonCreatures.length + b.rareCreatures.length} criaturas
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
