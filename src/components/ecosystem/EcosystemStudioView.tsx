import React, { useState } from 'react';
import { useAurora } from '../../context/AuroraContext';
import { EcosystemWebResult, TrophicLevel } from '../../types/aurora';
import { buildEcosystemWeb } from '../../lib/ecosystemEngine';
import {
  Trees,
  ShieldAlert,
  Sparkles,
  ArrowUpRight,
  TrendingDown,
  Layers,
  Leaf,
  Bug,
  Flame,
  Crown,
} from 'lucide-react';

export const EcosystemStudioView: React.FC = () => {
  const { projectContext, showToast, setStagedPackage } = useAurora();
  const [selectedBiomeId, setSelectedBiomeId] = useState<string>(
    projectContext.biomes[0]?.id || 'biome_forest'
  );

  const ecosystemWeb = buildEcosystemWeb(projectContext, selectedBiomeId);

  const handleApplyEcosystemFix = () => {
    // Generate an automatic balance fix package
    setStagedPackage({
      id: `pkg_eco_fix_${Date.now()}`,
      title: `Estabilización Ecológica: ${ecosystemWeb.biomeName}`,
      description: 'Añade criaturas presas y recursos para estabilizar la pirámide trófica.',
      source: 'ai_creator',
      items: [
        {
          type: 'creature',
          action: 'create',
          entityId: `creature_sylvyn_${Date.now()}`,
          entityName: 'Sylvyn del Bosque',
          data: {
            id: `creature_sylvyn_${Date.now()}`,
            name: 'Sylvyn del Bosque',
            description: 'Pequeño ciervo de musgo que sirve de presa primaria en el ecosistema.',
            type: 'nature',
            category: 'beast',
            rarity: 'common',
            habitat: [selectedBiomeId],
            behavior: 'docile',
            stats: { hp: 95, attack: 35, defense: 38, speed: 55, specialAttack: 40, specialDefense: 42 },
            abilities: ['ab_leaf_blade', 'ab_quick_dodge'],
            weaknesses: ['fire', 'ice'],
            resistances: ['water'],
            evolution: [],
            spawnRate: 60,
            recommendedLevel: 6,
            rewards: { exp: 80, goldMin: 10, goldMax: 25, drops: [] },
            visual2D5: {
              spriteWidth: 48,
              spriteHeight: 48,
              anchorX: 0.5,
              anchorY: 0.92,
              ySortOffset: 0,
              collisionBox: { width: 24, height: 18, offsetX: 12, offsetY: 26 },
              shadow: { enabled: true, radiusX: 16, radiusY: 8, opacity: 0.35, offsetY: 3 },
              dimetricAngleDeg: 26.565,
              elevationZ: 0,
              facingDirections: 4,
            },
          },
        },
      ],
      createdAt: new Date().toISOString(),
    });
    showToast('Paquete de Estabilización Trófica enviado a Staging', 'success');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Trees className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                Creature Design & Ecosystem 2.0
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30">
                  TROPHIC WEB MODEL
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Modelo de cadena trófica (Productores → Herbívoros → Depredadores → Ápice) para evitar ecosistemas estériles o rotos.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleApplyEcosystemFix}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-emerald-600/20 transition"
        >
          <Sparkles className="w-4 h-4" />
          <span>Generar Auto-Fix Ecológico</span>
        </button>
      </div>

      {/* Biome Selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {projectContext.biomes.map((b) => (
          <button
            key={b.id}
            onClick={() => setSelectedBiomeId(b.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              selectedBiomeId === b.id
                ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {b.name}
          </button>
        ))}
      </div>

      {/* Trophic Pyramid Breakdown Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400">Depredadores Ápice</span>
            <Crown className="w-4 h-4 text-amber-400" />
          </div>
          <h3 className="text-2xl font-black text-amber-400">
            {ecosystemWeb.trophicPyramid.apexCount}
          </h3>
          <p className="text-[10px] text-slate-500">Legendarios / Jefes de Bioma</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400">Depredadores Secundarios</span>
            <Flame className="w-4 h-4 text-rose-400" />
          </div>
          <h3 className="text-2xl font-black text-rose-400">
            {ecosystemWeb.trophicPyramid.predatorCount}
          </h3>
          <p className="text-[10px] text-slate-500">Carnívoros territoriales</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400">Herbívoros & Presas</span>
            <Bug className="w-4 h-4 text-emerald-400" />
          </div>
          <h3 className="text-2xl font-black text-emerald-400">
            {ecosystemWeb.trophicPyramid.herbivoreCount}
          </h3>
          <p className="text-[10px] text-slate-500">Base poblacional primaria</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400">Salud Ecosistémica</span>
            <span className="text-[10px] font-mono font-bold text-emerald-400">
              {ecosystemWeb.status.toUpperCase()}
            </span>
          </div>
          <h3 className="text-2xl font-black text-slate-100">{ecosystemWeb.healthScore}%</h3>
          <p className="text-[10px] text-slate-500">Ratio Presa/Depredador: {ecosystemWeb.trophicRatio}</p>
        </div>
      </div>

      {/* Extinction Risk Warnings */}
      {ecosystemWeb.extinctionRisks.length > 0 && (
        <div className="bg-slate-900/90 border border-amber-500/40 rounded-2xl p-5 shadow-lg space-y-3">
          <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
            <ShieldAlert className="w-4 h-4" /> Riesgos de Colapso Ecológico
          </h3>
          <div className="space-y-2">
            {ecosystemWeb.extinctionRisks.map((risk, i) => (
              <div
                key={i}
                className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-300"
              >
                {risk}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Nodes in the Biome */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
          Entidades y Recursos en {ecosystemWeb.biomeName} ({ecosystemWeb.nodes.length})
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {ecosystemWeb.nodes.map((node) => (
            <div
              key={node.id}
              className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold uppercase">
                  {node.trophicLevel.replace('_', ' ')}
                </span>
                <span className="text-[10px] font-mono text-emerald-400">
                  Biomasa: {node.biomassIndex}
                </span>
              </div>

              <h4 className="text-xs font-bold text-slate-100">{node.name}</h4>
              <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800">
                <span>Rareza: {node.rarity}</span>
                <span>Horario: {node.timeOfDay}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
