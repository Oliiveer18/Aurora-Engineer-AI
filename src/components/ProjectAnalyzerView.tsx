import React from 'react';
import { useAurora } from '../context/AuroraContext';
import {
  Activity,
  AlertTriangle,
  Sparkles,
  BarChart3,
  CheckCircle2,
  TrendingUp,
  Compass,
  Layers,
  ArrowRight,
  ShieldAlert,
  HelpCircle,
} from 'lucide-react';

export const ProjectAnalyzerView: React.FC = () => {
  const { projectAnalysis, projectContext, setActiveTab, setSelectedEntity, generateContent, showToast } = useAurora();

  const handleQuickGenerateGap = async (gap: any) => {
    try {
      showToast(`Generando solución para: ${gap.title}...`, 'info');
      setActiveTab('ai_creator');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-y-auto p-6 max-w-6xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="p-6 bg-gradient-to-r from-slate-900 via-sky-950/30 to-slate-900 border border-slate-800 rounded-2xl shadow-xl">
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 font-semibold uppercase tracking-wider mb-1">
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          Motor de Análisis & Diagnóstico de Juego
        </div>
        <h1 className="text-2xl font-bold text-slate-100">Analizador de Balance y Cobertura AURORA</h1>
        <p className="text-sm text-slate-400 mt-1 max-w-3xl">
          Supervisa el equilibrio elemental, la distribución de rarezas, la cobertura de biomas y detecta lagunas de contenido o redundancias en tu videojuego 2.5D.
        </p>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
          <span className="text-xs text-slate-400">Total Criaturas</span>
          <div className="text-2xl font-bold font-mono text-cyan-400 mt-1">
            {projectAnalysis.totalEntities.creatures}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">En {projectAnalysis.totalEntities.biomes} biomas</span>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
          <span className="text-xs text-slate-400">Misiones Activas</span>
          <div className="text-2xl font-bold font-mono text-purple-400 mt-1">
            {projectAnalysis.totalEntities.quests}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Para {projectAnalysis.totalEntities.npcs} NPCs</span>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
          <span className="text-xs text-slate-400">Lagunas Detectadas</span>
          <div className="text-2xl font-bold font-mono text-amber-400 mt-1">
            {projectAnalysis.missingContentGaps.length}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Oportunidades de IA</span>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
          <span className="text-xs text-slate-400">Nivel Promedio</span>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
            Nv. {projectAnalysis.averageLevel}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Curva RPG balanceada</span>
        </div>
      </div>

      {/* Missing Content Gaps (Actionable IA Suggestions) */}
      <div className="p-6 bg-slate-900 border border-amber-500/30 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Lagunas de Contenido Detectadas ({projectAnalysis.missingContentGaps.length})
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              La IA ha detectado biomas despoblados, elementos sin representación o misiones pendientes.
            </p>
          </div>
        </div>

        {projectAnalysis.missingContentGaps.length === 0 ? (
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>¡Excelente! Tu universo AURORA tiene una cobertura de contenido completa y balanceada.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {projectAnalysis.missingContentGaps.map((gap) => (
              <div
                key={gap.id}
                className="p-4 bg-slate-950 border border-slate-800 hover:border-amber-500/40 rounded-xl flex flex-col justify-between space-y-3 transition"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                      {gap.category}
                    </span>
                    <span className="text-xs font-mono text-slate-500">Prioridad {gap.severity}</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-200 mt-2">{gap.title}</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{gap.description}</p>
                </div>

                <div className="pt-2 border-t border-slate-900 flex justify-between items-center">
                  <span className="text-[11px] text-slate-500">Sugerencia IA lista</span>
                  <button
                    onClick={() => handleQuickGenerateGap(gap)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-semibold transition"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Generar Solución</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Element & Rarity Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Element Distribution */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-cyan-400" />
            Distribución por Tipo Elemental
          </h3>
          <div className="space-y-2">
            {Object.entries(projectAnalysis.elementDistribution).map(([elem, count]) => {
              const pct = Math.round(((count as number) / (projectAnalysis.totalEntities.creatures || 1)) * 100);
              return (
                <div key={elem} className="text-xs space-y-1">
                  <div className="flex justify-between text-slate-300">
                    <span className="font-mono uppercase font-semibold">{elem}</span>
                    <span className="text-slate-400 font-mono">
                      {count} criaturas ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${Math.max(4, pct)}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Biome Population Heatmap */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Compass className="w-4 h-4 text-emerald-400" />
            Población por Bioma
          </h3>
          <div className="space-y-3">
            {projectAnalysis.biomeCoverage.map((b) => (
              <div key={b.biomeId} className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-200">{b.biomeName}</span>
                  <span
                    className={`font-mono px-2 py-0.5 rounded text-[10px] ${
                      b.creatureCount >= 3
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : b.creatureCount > 0
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-rose-500/20 text-rose-300'
                    }`}
                  >
                    {b.creatureCount} Criaturas
                  </span>
                </div>
                <div className="flex justify-between items-center text-[11px] text-slate-500 mt-2">
                  <span>{b.npcCount} NPCs presentes</span>
                  <span>{b.questCount} Misiones activas</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
