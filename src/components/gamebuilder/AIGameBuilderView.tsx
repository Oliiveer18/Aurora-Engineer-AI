import React, { useState } from 'react';
import { useAurora } from '../../context/AuroraContext';
import { AIGameBuilderPlan, BuilderStagePlan } from '../../types/aurora';
import { createGameBuilderPlan } from '../../lib/aiGameBuilder';
import {
  Sparkles,
  Rocket,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Shield,
  Zap,
  Play,
  FileCheck,
  BrainCircuit,
  Terminal,
} from 'lucide-react';

export const AIGameBuilderView: React.FC = () => {
  const { projectContext, setStagedPackage, showToast, isGenerating, setIsGenerating } = useAurora();

  const [customGoal, setCustomGoal] = useState('');
  const [selectedRegionId, setSelectedRegionId] = useState(
    projectContext.regions[0]?.id || 'region_whispering_woods'
  );
  const [activePlan, setActivePlan] = useState<AIGameBuilderPlan | null>(() =>
    createGameBuilderPlan('Amplía Bosque Susurrante con 20 minutos de contenido equilibrado.', projectContext)
  );
  const [activeStageIndex, setActiveStageIndex] = useState(0);

  const presetGoals = [
    'Amplía Bosque Susurrante con 20 minutos de contenido.',
    'Crea una nueva cadena de misiones para Oakhaven.',
    'Añade una criatura legendaria y todo el contenido relacionado.',
    'Haz que Cumbres de Cristal tenga una progresión más interesante.',
  ];

  const handleGeneratePlan = (goalText: string) => {
    setIsGenerating(true);
    setTimeout(() => {
      const plan = createGameBuilderPlan(goalText, projectContext, selectedRegionId);
      setActivePlan(plan);
      setActiveStageIndex(0);
      setIsGenerating(false);
      showToast('Plan de Producción generado exitosamente', 'success');
    }, 600);
  };

  const handleSendToStaging = () => {
    if (!activePlan) return;
    const pkg = activePlan.generatedContent.changePackage;
    if (pkg) {
      setStagedPackage({
        id: pkg.id,
        title: pkg.title,
        description: pkg.description,
        source: 'ai_creator',
        items: [
          ...activePlan.generatedContent.creatures.map((c) => ({
            type: 'creature' as const,
            action: 'create' as const,
            entityId: c.id,
            entityName: c.name,
            data: c,
          })),
          ...activePlan.generatedContent.npcs.map((n) => ({
            type: 'npc' as const,
            action: 'create' as const,
            entityId: n.id,
            entityName: n.name,
            data: n,
          })),
          ...activePlan.generatedContent.quests.map((q) => ({
            type: 'quest' as const,
            action: 'create' as const,
            entityId: q.id,
            entityName: q.title,
            data: q,
          })),
          ...activePlan.generatedContent.abilities.map((a) => ({
            type: 'ability' as const,
            action: 'create' as const,
            entityId: a.id,
            entityName: a.name,
            data: a,
          })),
          ...activePlan.generatedContent.items.map((i) => ({
            type: 'item' as const,
            action: 'create' as const,
            entityId: i.id,
            entityName: i.name,
            data: i,
          })),
        ],
        createdAt: new Date().toISOString(),
      });
      showToast('Paquete de Producción enviado a Staging para Diff Preview', 'success');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                <BrainCircuit className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                  AI Game Builder 2.0
                  <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono border border-indigo-500/30">
                    STUDIO PIPELINE
                  </span>
                </h1>
                <p className="text-xs text-slate-400">
                  Transforma objetivos de alto nivel en un plan de producción coherente por etapas listo para Staging.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleGeneratePlan(customGoal || presetGoals[0])}
              disabled={isGenerating}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-xl shadow-lg shadow-indigo-600/25 transition disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isGenerating ? 'Analizando Proyecto...' : 'Generar Plan de Producción'}</span>
            </button>
          </div>
        </div>

        {/* Preset Goals Pills */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5 mr-2">
            <Zap className="w-3.5 h-3.5 text-amber-400" /> Metas Rápidas:
          </span>
          {presetGoals.map((goal, idx) => (
            <button
              key={idx}
              onClick={() => {
                setCustomGoal(goal);
                handleGeneratePlan(goal);
              }}
              className="text-xs px-3 py-1.5 rounded-lg bg-slate-950/80 hover:bg-indigo-950/60 border border-slate-800 hover:border-indigo-500/40 text-slate-300 transition"
            >
              {goal}
            </button>
          ))}
        </div>
      </div>

      {/* Goal Input & Region Selector */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-3">
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Definir Objetivo de Desarrollo (Prompt Natural)
          </label>
          <div className="relative">
            <input
              type="text"
              value={customGoal}
              onChange={(e) => setCustomGoal(e.target.value)}
              placeholder="Ej: Añadir un jefe de hielo en Cumbres de Cristal con misión de forja y 2 habilidades..."
              className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Región Objetivo
          </label>
          <select
            value={selectedRegionId}
            onChange={(e) => setSelectedRegionId(e.target.value)}
            className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition"
          >
            {projectContext.regions.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {activePlan && (
        <>
          {/* Explainability Matrix (WHY, CONTEXT, IMPACT, EFFORT, RISK) */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-400" />
                Matriz de Justificación y Diagnóstico IA
              </h2>
              <span className="text-[11px] font-mono text-slate-400">
                Plan ID: {activePlan.id}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-indigo-400 tracking-wider">¿POR QUÉ? (WHY)</span>
                <p className="text-slate-300">{activePlan.explainability.why}</p>
              </div>

              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-cyan-400 tracking-wider">CONTEXTO DE BASE DE DATOS</span>
                <p className="text-slate-300">{activePlan.explainability.context}</p>
              </div>

              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-emerald-400 tracking-wider">IMPACTO ESTIMADO</span>
                <p className="text-slate-300">{activePlan.explainability.impact}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-800/80">
              <div className="flex items-center gap-4 text-xs">
                <span className="text-slate-400">
                  Esfuerzo:{' '}
                  <strong className="text-amber-400 font-mono">{activePlan.explainability.effort}</strong>
                </span>
                <span className="text-slate-400">
                  Riesgo:{' '}
                  <strong className="text-emerald-400 font-mono">{activePlan.explainability.risk}</strong>
                </span>
                <span className="text-slate-400">
                  Cambios atómicos:{' '}
                  <strong className="text-cyan-400 font-mono">
                    +{activePlan.explainability.changesCount} entidades
                  </strong>
                </span>
              </div>

              <button
                onClick={handleSendToStaging}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-emerald-600/20 transition"
              >
                <Rocket className="w-4 h-4" />
                <span>Enviar Plan Completo a Staging</span>
              </button>
            </div>
          </div>

          {/* 8-Stage Pipeline Navigation & Inspector */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Stage Selector List */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-2">
                Pipeline de Producción (8 Fases)
              </h3>
              {activePlan.stages.map((stg, idx) => {
                const isActive = activeStageIndex === idx;
                return (
                  <button
                    key={stg.stage}
                    onClick={() => setActiveStageIndex(idx)}
                    className={`w-full text-left p-3 rounded-xl border transition flex items-center justify-between ${
                      isActive
                        ? 'bg-indigo-950/40 border-indigo-500/60 text-slate-100 shadow-md'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-400'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="text-xs font-semibold flex items-center gap-2">
                        {stg.status === 'completed' && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        )}
                        {stg.status === 'in_progress' && (
                          <Play className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                        )}
                        {stg.status === 'pending' && (
                          <div className="w-3.5 h-3.5 rounded-full border border-slate-600" />
                        )}
                        <span>{stg.title}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 truncate max-w-[200px]">
                        {stg.summary}
                      </p>
                    </div>
                    <ArrowRight
                      className={`w-4 h-4 transition ${
                        isActive ? 'text-indigo-400 translate-x-1' : 'text-slate-600'
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            {/* Active Stage Details & Deliverables */}
            <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
              {(() => {
                const currentStage = activePlan.stages[activeStageIndex];
                if (!currentStage) return null;
                return (
                  <>
                    <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                      <div>
                        <span className="text-[10px] font-mono font-bold text-indigo-400 tracking-wider">
                          FASE {activeStageIndex + 1} DE 8
                        </span>
                        <h2 className="text-base font-bold text-slate-100">
                          {currentStage.title}
                        </h2>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {currentStage.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-xs font-semibold text-slate-300">
                        Resumen Ejecutivo de la Fase
                      </h4>
                      <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
                        {currentStage.summary}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-xs font-semibold text-slate-300">
                        Actividades de Verificación & Pipeline
                      </h4>
                      <div className="space-y-1.5">
                        {currentStage.details.map((d, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-2 text-xs text-slate-400"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>{d}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-xs font-semibold text-slate-300">
                        Entregables Generados para esta Fase
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {currentStage.deliverables.map((del, i) => (
                          <div
                            key={i}
                            className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center justify-between"
                          >
                            <div>
                              <p className="text-xs font-semibold text-slate-200">{del.name}</p>
                              <span className="text-[10px] font-mono text-slate-500">{del.type}</span>
                            </div>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                              LISTO
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Preview of Staged Entities */}
                    <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                      <div className="text-xs text-slate-400">
                        Entidades en memoria:{' '}
                        <strong className="text-slate-200">
                          {activePlan.generatedContent.creatures.length} Criatura,{' '}
                          {activePlan.generatedContent.quests.length} Misión,{' '}
                          {activePlan.generatedContent.npcs.length} NPC
                        </strong>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setActiveStageIndex(Math.max(0, activeStageIndex - 1))}
                          disabled={activeStageIndex === 0}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 disabled:opacity-30"
                        >
                          Anterior
                        </button>
                        <button
                          onClick={() =>
                            setActiveStageIndex(
                              Math.min(activePlan.stages.length - 1, activeStageIndex + 1)
                            )
                          }
                          disabled={activeStageIndex === activePlan.stages.length - 1}
                          className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-medium text-white disabled:opacity-30"
                        >
                          Siguiente Fase
                        </button>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
