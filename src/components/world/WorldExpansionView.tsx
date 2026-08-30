import React, { useState } from 'react';
import { useAurora } from '../../context/AuroraContext';
import { WorldExpansionProposal } from '../../types/aurora';
import { analyzeWorldExpansionNeeds } from '../../lib/worldExpansion';
import {
  Compass,
  MapPin,
  Sparkles,
  Key,
  ShieldAlert,
  Send,
  Eye,
  Layers,
  CheckCircle,
} from 'lucide-react';

export const WorldExpansionView: React.FC = () => {
  const { projectContext, showToast, setStagedPackage } = useAurora();
  const [selectedRegionId, setSelectedRegionId] = useState<string>(
    projectContext.regions[0]?.id || 'region_whispering_woods'
  );
  const [proposals, setProposals] = useState<WorldExpansionProposal[]>(() =>
    analyzeWorldExpansionNeeds(projectContext)
  );

  const currentProposal =
    proposals.find((p) => p.regionId === selectedRegionId) || proposals[0];

  const handleStageExpansion = (prop: WorldExpansionProposal) => {
    setStagedPackage({
      id: `pkg_exp_${prop.regionId}_${Date.now()}`,
      title: `Expansión de POIs y Secretos: ${prop.regionName}`,
      description: prop.theme,
      source: 'ai_creator',
      items: [
        ...prop.pois.map((poi) => ({
          type: 'location' as const,
          action: 'create' as const,
          entityId: poi.id,
          entityName: poi.name,
          data: poi,
        })),
      ],
      createdAt: new Date().toISOString(),
    });
    showToast(`Propuesta de expansión para ${prop.regionName} enviada a Staging`, 'success');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                World & Map Expansion Intelligence
                <span className="text-xs px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-mono border border-teal-500/30">
                  SEAMLESS EXTENSION
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Añade puntos de interés, secretos descubribles, puzzles y rutas de exploración sin reconstruir el mapa de Phaser 3.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {currentProposal && (
            <button
              onClick={() => handleStageExpansion(currentProposal)}
              className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-teal-600/20 transition"
            >
              <Sparkles className="w-4 h-4" />
              <span>Enviar Expansión a Staging</span>
            </button>
          )}
        </div>
      </div>

      {/* Region Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {projectContext.regions.map((reg) => (
          <button
            key={reg.id}
            onClick={() => setSelectedRegionId(reg.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              selectedRegionId === reg.id
                ? 'bg-teal-500/20 border border-teal-500/40 text-teal-300'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {reg.name}
          </button>
        ))}
      </div>

      {currentProposal && (
        <div className="space-y-6">
          {/* Explainability Block */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
            <h2 className="text-xs font-bold text-teal-400 uppercase tracking-wider">
              Diagnóstico Territorial IA
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-indigo-400">MOTIVO (WHY)</span>
                <p className="text-slate-300">{currentProposal.explainability.why}</p>
              </div>
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-cyan-400">CONTEXTO TÉCNICO</span>
                <p className="text-slate-300">{currentProposal.explainability.context}</p>
              </div>
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-emerald-400">IMPACTO EN JUEGO</span>
                <p className="text-slate-300">{currentProposal.explainability.impact}</p>
              </div>
            </div>
          </div>

          {/* Points of Interest (POIs) Grid */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <MapPin className="w-4 h-4 text-teal-400" />
              Nuevos Puntos de Interés Dinámicos ({currentProposal.pois.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {currentProposal.pois.map((poi) => (
                <div
                  key={poi.id}
                  className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-500/10 text-teal-300 font-semibold uppercase">
                      {poi.type}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      Nivel {poi.recommendedLevel}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-100">{poi.name}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{poi.loreNotes}</p>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                    <span>
                      Coord: ({poi.coordinates2D5.x}, {poi.coordinates2D5.y})
                    </span>
                    <span>Elevación: Z{poi.coordinates2D5.elevation}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Discoverable Secrets & Puzzles */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Key className="w-4 h-4 text-amber-400" />
              Secretos y Recompensas Ocultas ({currentProposal.secrets.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentProposal.secrets.map((sec) => (
                <div
                  key={sec.id}
                  className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-100">{sec.title}</h4>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold">
                      {sec.secretType}
                    </span>
                  </div>

                  <div className="text-xs text-slate-400 space-y-1">
                    <p>
                      <strong>Condición:</strong> {sec.triggerCondition}
                    </p>
                    <p className="text-emerald-400/90">
                      <strong>Recompensa:</strong> {sec.rewardDescription}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
