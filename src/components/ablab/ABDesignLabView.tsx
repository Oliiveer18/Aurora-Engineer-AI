import React, { useState } from 'react';
import { useAurora } from '../../context/AuroraContext';
import { ABExperiment, ABVariant } from '../../types/aurora';
import { getInitialABExperiments } from '../../lib/abDesignLab';
import {
  FlaskConical,
  Check,
  Zap,
  TrendingUp,
  Shield,
  Layers,
  ArrowRight,
} from 'lucide-react';

export const ABDesignLabView: React.FC = () => {
  const { showToast, setStagedPackage } = useAurora();
  const [experiments, setExperiments] = useState<ABExperiment[]>(() =>
    getInitialABExperiments()
  );
  const [activeExpId, setActiveExpId] = useState<string>(experiments[0]?.id || '');

  const currentExp = experiments.find((e) => e.id === activeExpId) || experiments[0];

  const handleSelectVariant = (expId: string, variantId: string) => {
    const updated = experiments.map((e) =>
      e.id === expId ? { ...e, selectedVariantId: variantId } : e
    );
    setExperiments(updated);
    showToast('Variante A/B seleccionada como preferencia activa', 'info');
  };

  const handleApplyVariantToStaging = (variant: ABVariant) => {
    setStagedPackage({
      id: `pkg_ab_${variant.id}_${Date.now()}`,
      title: `Aplicar Balance A/B: ${variant.name}`,
      description: variant.hypothesis,
      source: 'ai_creator',
      items: [
        {
          type: 'system_config' as any,
          action: 'update' as any,
          entityId: variant.id,
          entityName: variant.name,
          data: { changes: variant.changeSummary },
        },
      ],
      createdAt: new Date().toISOString(),
    });
    showToast(`Variante "${variant.name}" enviada a Staging`, 'success');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-pink-400">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                A/B Design Lab
                <span className="text-xs px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 font-mono border border-pink-500/30">
                  EXPERIMENTAL COMPARATOR
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Compara side-by-side variaciones de balance, curvas de experiencia y ritmo de combate antes de exportar a Cursor.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Experiment Selector Tabs */}
      <div className="flex gap-2">
        {experiments.map((exp) => (
          <button
            key={exp.id}
            onClick={() => setActiveExpId(exp.id)}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition flex items-center gap-2 ${
              activeExpId === exp.id
                ? 'bg-pink-500/20 border border-pink-500/40 text-pink-300'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>{exp.title}</span>
          </button>
        ))}
      </div>

      {currentExp && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {currentExp.variants.map((variant) => {
              const isSelected = currentExp.selectedVariantId === variant.id;
              return (
                <div
                  key={variant.id}
                  className={`bg-slate-900/90 border rounded-2xl p-6 shadow-xl space-y-5 transition relative flex flex-col justify-between ${
                    isSelected
                      ? 'border-pink-500/70 ring-1 ring-pink-500/40'
                      : 'border-slate-800'
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                        {variant.name}
                      </h3>
                      {isSelected && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 font-bold border border-pink-500/30">
                          ACTIVA
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                      {variant.hypothesis}
                    </p>

                    {/* Metrics Radar */}
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800/80">
                        <span className="text-[10px] text-slate-400">Pacing Score</span>
                        <p className="text-base font-black text-pink-400 mt-0.5">
                          {variant.metrics.pacingScore}/100
                        </p>
                      </div>
                      <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800/80">
                        <span className="text-[10px] text-slate-400">Profundidad Táctica</span>
                        <p className="text-base font-black text-indigo-400 mt-0.5">
                          {variant.metrics.combatDepth}/100
                        </p>
                      </div>
                      <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800/80">
                        <span className="text-[10px] text-slate-400">Fun Factor Estimado</span>
                        <p className="text-base font-black text-emerald-400 mt-0.5">
                          {variant.metrics.funFactor}/100
                        </p>
                      </div>
                      <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800/80">
                        <span className="text-[10px] text-slate-400">Riesgo Técnico</span>
                        <p className="text-base font-black text-cyan-400 mt-0.5">
                          {variant.metrics.technicalRisk}
                        </p>
                      </div>
                    </div>

                    {/* Advantages */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                        Ventajas:
                      </span>
                      {variant.advantages.map((adv, i) => (
                        <div key={i} className="text-xs text-slate-300 flex items-center gap-1.5">
                          <span className="text-emerald-400 font-bold">+</span>
                          <span>{adv}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-2 mt-4">
                    <button
                      onClick={() => handleSelectVariant(currentExp.id, variant.id)}
                      className={`px-3 py-2 text-xs font-semibold rounded-xl border transition ${
                        isSelected
                          ? 'bg-slate-800 text-slate-400 border-slate-700'
                          : 'bg-slate-950 hover:bg-slate-800 text-slate-200 border-slate-800'
                      }`}
                    >
                      {isSelected ? 'Seleccionada' : 'Elegir como Activa'}
                    </button>

                    <button
                      onClick={() => handleApplyVariantToStaging(variant)}
                      className="px-4 py-2 bg-pink-600 hover:bg-pink-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-pink-600/20 transition"
                    >
                      Aplicar a Staging
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
