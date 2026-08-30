import React, { useState } from 'react';
import {
  Globe2,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  PieChart,
  Layers,
  ArrowRight,
  ShieldAlert,
  Zap,
  HelpCircle,
  BarChart2,
  RefreshCw,
  Compass,
  Cpu,
} from 'lucide-react';
import { useAurora } from '../context/AuroraContext';

export const WorldIntelligenceView: React.FC = () => {
  const { projectAnalysis, knowledgeBase, executeWorldFix, isGenerating, stageSmartAction } = useAurora();
  const [activeCategory, setActiveCategory] = useState<'all' | 'biomes' | 'gaps' | 'imbalances' | 'orphans'>('all');

  const { biomeCoverage, missingContentGaps, imbalances, redundancies, elementDistribution, rarityDistribution } =
    projectAnalysis;

  const underpopulatedBiomes = biomeCoverage.filter((b) => b.status === 'underpopulated' || b.status === 'empty');

  return (
    <div id="world-intelligence-container" className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-sm font-semibold tracking-wide uppercase">
            <Globe2 className="w-4 h-4" />
            Análisis de Ecosistema y Balance
          </div>
          <h1 className="text-3xl font-bold text-slate-100 mt-1">WORLD INTELLIGENCE</h1>
          <p className="text-slate-400 text-sm mt-1 max-w-2xl">
            Diagnóstico integral de la densidad de contenido, balances estadísticos, cobertura de biomas y huecos de diseño en AURORA RPG.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-slate-400">
            Último análisis: <span className="text-emerald-400 font-bold">Tiempo Real</span>
          </div>
        </div>
      </div>

      {/* Top Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-900/70 border border-slate-800 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-400 uppercase font-semibold">
            <span>Huecos Detectados</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-bold text-slate-100 mt-2">{missingContentGaps.length}</div>
          <p className="text-xs text-slate-500 mt-1">Oportunidades de generación</p>
        </div>

        <div className="p-4 bg-slate-900/70 border border-slate-800 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-400 uppercase font-semibold">
            <span>Biomas Despoblados</span>
            <Compass className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-bold text-slate-100 mt-2">{underpopulatedBiomes.length}</div>
          <p className="text-xs text-slate-500 mt-1">Requieren fauna o misiones</p>
        </div>

        <div className="p-4 bg-slate-900/70 border border-slate-800 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-400 uppercase font-semibold">
            <span>Desbalances de Stats</span>
            <TrendingUp className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl font-bold text-slate-100 mt-2">{imbalances.length}</div>
          <p className="text-xs text-slate-500 mt-1">Curvas fuera de rango</p>
        </div>

        <div className="p-4 bg-slate-900/70 border border-slate-800 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-400 uppercase font-semibold">
            <span>Entidades Huérfanas</span>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-3xl font-bold text-slate-100 mt-2">
            {knowledgeBase.orphanedEntities.npcsWithoutQuests.length +
              knowledgeBase.orphanedEntities.abilitiesWithoutUsers.length +
              knowledgeBase.orphanedEntities.itemsWithoutSources.length}
          </div>
          <p className="text-xs text-slate-500 mt-1">Sin vínculos cruzados</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
            activeCategory === 'all' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Todo el Diagnóstico
        </button>
        <button
          onClick={() => setActiveCategory('gaps')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
            activeCategory === 'gaps' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Huecos de Contenido ({missingContentGaps.length})
        </button>
        <button
          onClick={() => setActiveCategory('biomes')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
            activeCategory === 'biomes' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Cobertura de Biomas ({biomeCoverage.length})
        </button>
        <button
          onClick={() => setActiveCategory('imbalances')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
            activeCategory === 'imbalances' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Balance Numérico ({imbalances.length})
        </button>
      </div>

      {/* Section 1: Missing Content Gaps with GENERATE FIX action */}
      {(activeCategory === 'all' || activeCategory === 'gaps') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              Huecos de Diseño & Oportunidades de Expansión
            </h2>
            <span className="text-xs text-slate-500">Pulsa "GENERATE FIX" para resolver con IA y previa de cambios</span>
          </div>

          {missingContentGaps.length === 0 ? (
            <div className="p-8 bg-slate-900/50 rounded-xl border border-slate-800 text-center text-slate-400 text-sm">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              No se detectaron huecos críticos de diseño en el mundo actual.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {missingContentGaps.map((gap, idx) => (
                <div
                  key={idx}
                  className="p-5 bg-slate-900/70 border border-slate-800 hover:border-slate-700 rounded-xl flex flex-col justify-between gap-4 transition-all"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {gap.category}
                      </span>
                      {gap.targetRegionOrBiome && (
                        <span className="text-[11px] text-slate-500 font-mono">
                          Ref: {gap.targetRegionOrBiome}
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-slate-100">{gap.title}</h3>
                    <p className="text-xs text-slate-300 leading-relaxed">{gap.description}</p>
                    <div className="p-2.5 bg-slate-950 rounded-lg text-[11px] text-slate-400 font-mono italic border border-slate-800">
                      Prompt: "{gap.suggestedPrompt}"
                    </div>
                  </div>

                  <button
                    disabled={isGenerating}
                    onClick={() => executeWorldFix(gap)}
                    className="w-full py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-lg transition-all shadow-md shadow-amber-950/50 flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>GENERATE FIX CON IA (STAGING)</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Section 2: Biome Coverage Heatmap */}
      {(activeCategory === 'all' || activeCategory === 'biomes') && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Compass className="w-5 h-5 text-cyan-400" />
            Salud Ecológica por Bioma Existente
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {biomeCoverage.map((bio) => {
              const getBadge = () => {
                switch (bio.status) {
                  case 'empty':
                    return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300">VACÍO</span>;
                  case 'underpopulated':
                    return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300">DESPOBLADO</span>;
                  case 'balanced':
                    return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">EQUILIBRADO</span>;
                  case 'rich':
                    return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300">DIVERSIFICADO</span>;
                }
              };

              return (
                <div key={bio.biomeId} className="p-5 bg-slate-900/60 border border-slate-800 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-100 text-sm">{bio.biomeName}</h3>
                    {getBadge()}
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2 bg-slate-950 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-500 block">Fauna</span>
                      <span className="font-bold text-emerald-400 text-sm">{bio.creatureCount}</span>
                    </div>
                    <div className="p-2 bg-slate-950 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-500 block">NPCs</span>
                      <span className="font-bold text-cyan-400 text-sm">{bio.npcCount}</span>
                    </div>
                    <div className="p-2 bg-slate-950 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-500 block">Misiones</span>
                      <span className="font-bold text-purple-400 text-sm">{bio.questCount}</span>
                    </div>
                  </div>

                  {bio.creatureCount < 2 && (
                    <button
                      onClick={() =>
                        executeWorldFix({
                          category: 'creature',
                          suggestedPrompt: `Genera una criatura nativa única para el bioma "${bio.biomeName}" con estadísticas 2.5D equilibradas.`,
                          targetRegionOrBiome: bio.biomeId,
                        })
                      }
                      className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg font-medium border border-slate-700 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      Poblar con Criatura Nativa
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Section 3: Stat Imbalances */}
      {(activeCategory === 'all' || activeCategory === 'imbalances') && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-400" />
            Desbalances Numéricos & Curva de BST
          </h2>

          {imbalances.length === 0 ? (
            <div className="p-8 bg-slate-900/50 rounded-xl border border-slate-800 text-center text-slate-400 text-sm">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              Todas las criaturas están perfectamente calibradas dentro de sus rangos de rareza.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {imbalances.map((imb, idx) => (
                <div key={idx} className="p-5 bg-slate-900/60 border border-slate-800 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-100">{imb.name}</span>
                    <span className="text-xs font-mono text-slate-500">{imb.entityId}</span>
                  </div>
                  <p className="text-xs text-amber-300/90">{imb.issue}</p>
                  <p className="text-xs text-slate-400 italic">{imb.recommendation}</p>
                  <button
                    onClick={() => executeWorldFix({ entityId: imb.entityId })}
                    className="px-4 py-1.5 bg-purple-950/60 hover:bg-purple-900 text-purple-300 border border-purple-700/50 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    Auto-Balancear Estadísticas 2.5D
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
