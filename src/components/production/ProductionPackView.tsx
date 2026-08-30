import React, { useState } from 'react';
import { useAurora } from '../../context/AuroraContext';
import { OneClickProductionPack } from '../../types/aurora';
import { getAvailableProductionPacks } from '../../lib/productionPacks';
import {
  Package,
  Sparkles,
  Layers,
  ArrowRight,
  Shield,
  BookOpen,
  Boxes,
  CheckCircle,
} from 'lucide-react';

export const ProductionPackView: React.FC = () => {
  const { projectContext, showToast, setStagedPackage } = useAurora();
  const [packs] = useState<OneClickProductionPack[]>(() =>
    getAvailableProductionPacks(projectContext)
  );
  const [selectedPackId, setSelectedPackId] = useState<string>(packs[0]?.id || '');

  const currentPack = packs.find((p) => p.id === selectedPackId) || packs[0];

  const handleStagePack = (pack: OneClickProductionPack) => {
    setStagedPackage({
      id: `pkg_${pack.id}_${Date.now()}`,
      title: pack.title,
      description: pack.description,
      source: 'ai_creator',
      items: [
        ...pack.entities.creatures.map((c) => ({
          type: 'creature' as const,
          action: 'create' as const,
          entityId: c.id,
          entityName: c.name,
          data: c,
        })),
        ...pack.entities.npcs.map((n) => ({
          type: 'npc' as const,
          action: 'create' as const,
          entityId: n.id,
          entityName: n.name,
          data: n,
        })),
        ...pack.entities.quests.map((q) => ({
          type: 'quest' as const,
          action: 'create' as const,
          entityId: q.id,
          entityName: q.title,
          data: q,
        })),
        ...pack.entities.items.map((i) => ({
          type: 'item' as const,
          action: 'create' as const,
          entityId: i.id,
          entityName: i.name,
          data: i,
        })),
        ...pack.entities.abilities.map((a) => ({
          type: 'ability' as const,
          action: 'create' as const,
          entityId: a.id,
          entityName: a.name,
          data: a,
        })),
      ],
      createdAt: new Date().toISOString(),
    });
    showToast(`Pack "${pack.title}" enviado a Staging con éxito`, 'success');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                One-Click Production Packs
                <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 font-mono border border-orange-500/30">
                  READY EXPANSIONS
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Expansiones integrales empaquetadas (criaturas + misiones + NPCs + ítems + habilidades) listas para un solo clic en Staging.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Packs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {packs.map((pack) => {
          const isSelected = selectedPackId === pack.id;
          return (
            <div
              key={pack.id}
              onClick={() => setSelectedPackId(pack.id)}
              className={`bg-slate-900/90 border rounded-2xl p-6 shadow-xl space-y-4 cursor-pointer transition flex flex-col justify-between ${
                isSelected
                  ? 'border-orange-500/70 ring-1 ring-orange-500/30'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded bg-orange-500/10 text-orange-300 border border-orange-500/20">
                    {pack.theme}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    {pack.targetBiomeName}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-100">{pack.title}</h3>
                <p className="text-xs text-slate-300">{pack.tagline}</p>
                <p className="text-xs text-slate-400 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                  {pack.description}
                </p>

                {/* Breakdown Pills */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
                  <div className="p-2 bg-slate-950 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-500">Criaturas</span>
                    <p className="font-bold text-orange-400">
                      {pack.contentBreakdown.creaturesCount}
                    </p>
                  </div>
                  <div className="p-2 bg-slate-950 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-500">NPCs & Quests</span>
                    <p className="font-bold text-indigo-400">
                      {pack.contentBreakdown.npcsCount + pack.contentBreakdown.questsCount}
                    </p>
                  </div>
                  <div className="p-2 bg-slate-950 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-500">Ítems & Magia</span>
                    <p className="font-bold text-emerald-400">
                      {pack.contentBreakdown.itemsCount + pack.contentBreakdown.abilitiesCount}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between mt-4">
                <span className="text-[11px] text-slate-500 font-mono">
                  Phaser 3 Ready · 2.5D
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStagePack(pack);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-orange-600/20 transition"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Enviar Pack a Staging</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
