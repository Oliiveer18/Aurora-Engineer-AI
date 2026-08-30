import React, { useState } from 'react';
import {
  Sparkles,
  UploadCloud,
  CheckCircle2,
  Cpu,
  Database,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  X,
  Play,
  Layers,
  Zap,
  Flame,
  FileCode2,
} from 'lucide-react';
import { useAurora } from '../context/AuroraContext';
import { OnboardingStepId } from '../types/aurora';

export const OnboardingModal: React.FC = () => {
  const {
    isOnboardingOpen,
    setIsOnboardingOpen,
    completeOnboarding,
    setActiveModal,
    setActiveTab,
    knowledgeBase,
    validationReport,
    directorHealth,
    projectContext,
  } = useAurora();

  const [currentStep, setCurrentStep] = useState<OnboardingStepId>('WELCOME');

  if (!isOnboardingOpen) return null;

  const steps: { id: OnboardingStepId; title: string; subtitle: string }[] = [
    { id: 'WELCOME', title: 'Bienvenido', subtitle: 'Introducción a AURORA AI' },
    { id: 'IMPORT_PROJECT', title: 'Importar', subtitle: 'Conexión con Cursor/Phaser' },
    { id: 'ANALYZE', title: 'Analizar', subtitle: 'Auditoría de 11 Pilares' },
    { id: 'BUILD_KNOWLEDGE_BASE', title: 'Knowledge Base', subtitle: 'Indexación de Entidades' },
    { id: 'CHECK_SYSTEM', title: 'Salud del Sistema', subtitle: 'Integridad y QA 2.5D' },
    { id: 'READY', title: 'Listo para Producción', subtitle: 'Empezar a Crear' },
  ];

  const currentIdx = steps.findIndex((s) => s.id === currentStep);

  const goToNext = () => {
    if (currentIdx < steps.length - 1) {
      setCurrentStep(steps[currentIdx + 1].id);
    } else {
      completeOnboarding();
    }
  };

  const goToPrev = () => {
    if (currentIdx > 0) {
      setCurrentStep(steps[currentIdx - 1].id);
    }
  };

  return (
    <div
      id="onboarding-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in"
    >
      <div
        id="onboarding-modal-container"
        className="w-full max-w-3xl bg-slate-900 border border-indigo-500/40 rounded-2xl shadow-2xl shadow-indigo-950/60 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Top Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-xl text-white shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold tracking-wider text-cyan-400 uppercase">
                  AURORA PRODUCTION SUITE
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                  FASE 6 FINAL
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-100">Guía de Inicio y Calibración de Proyecto</h3>
            </div>
          </div>

          <button
            id="close-onboarding-btn"
            onClick={completeOnboarding}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
            title="Omitir Onboarding"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progression Bar */}
        <div className="px-6 py-3 bg-slate-900/90 border-b border-slate-800/80 flex items-center justify-between overflow-x-auto gap-2">
          {steps.map((s, idx) => {
            const isActive = s.id === currentStep;
            const isDone = idx < currentIdx;
            return (
              <button
                key={s.id}
                onClick={() => setCurrentStep(s.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${
                  isActive
                    ? 'bg-indigo-600/30 text-cyan-300 border border-indigo-500/50'
                    : isDone
                    ? 'text-emerald-400 hover:bg-slate-800/50'
                    : 'text-slate-500 hover:text-slate-400'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    isActive
                      ? 'bg-cyan-500 text-slate-950'
                      : isDone
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {isDone ? '✓' : idx + 1}
                </div>
                <span>{s.title}</span>
              </button>
            );
          })}
        </div>

        {/* Step Body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-6">
          {currentStep === 'WELCOME' && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-5 bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-950 border border-indigo-500/30 rounded-xl space-y-3">
                <h4 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <span>¡Bienvenido a AURORA AI CREATOR!</span>
                  <span className="text-xl">✨</span>
                </h4>
                <p className="text-sm text-slate-300 leading-relaxed">
                  AURORA es el estudio de producción y balance asistido por IA para juegos RPG 2.5D construidos en{' '}
                  <strong className="text-cyan-300">Phaser 3 + TypeScript</strong>.
                </p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Permite diseñar criaturas, NPCs, misiones, biomas y gráficos 2.5D, realizar auditorías de diseño holísticas,
                  generar paquetes de cambios quirúrgicos para Cursor y validar la integridad matemática de tu mundo antes de compilar.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
                  <div className="text-cyan-400 font-bold text-sm mb-1 flex items-center gap-1.5">
                    <Database className="w-4 h-4" />
                    <span>Knowledge Base</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Indexación en tiempo real para evitar IDs duplicados y alucinaciones de la IA.
                  </p>
                </div>
                <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
                  <div className="text-purple-400 font-bold text-sm mb-1 flex items-center gap-1.5">
                    <Cpu className="w-4 h-4" />
                    <span>AI Director</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Evaluación de 11 pilares de diseño, balance numérico y simulación trófica.
                  </p>
                </div>
                <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
                  <div className="text-emerald-400 font-bold text-sm mb-1 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Puente Cursor</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Parches quirúrgicos (+ ~ -), diffs visuales e instrucciones paso a paso.
                  </p>
                </div>
              </div>
            </div>
          )}

          {currentStep === 'IMPORT_PROJECT' && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
                <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <UploadCloud className="w-4 h-4 text-cyan-400" />
                  <span>Paso 1: Conecta los archivos de tu proyecto Phaser 3</span>
                </h4>
                <p className="text-xs text-slate-400">
                  Puedes importar tus archivos de datos existentes (<code className="text-cyan-300 font-mono">.ts</code> o{' '}
                  <code className="text-cyan-300 font-mono">.json</code>) de la carpeta <code className="text-slate-300 font-mono">src/data/</code>{' '}
                  para que AURORA aprenda la estructura exacta de tu juego, o continuar con la plantilla estándar de demostración.
                </p>
              </div>

              <div className="p-6 border-2 border-dashed border-indigo-500/30 rounded-xl bg-slate-950/40 text-center space-y-3">
                <div className="inline-flex p-3 bg-indigo-500/10 text-cyan-400 rounded-full">
                  <FileCode2 className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-200">
                    ¿Tienes archivos existentes en Cursor (<code className="text-cyan-300">creatureRegistry.ts</code>, etc.)?
                  </p>
                  <p className="text-xs text-slate-400">
                    Puedes importarlos ahora mismo o más tarde desde la barra de navegación superior.
                  </p>
                </div>
                <div className="flex justify-center gap-3 pt-2">
                  <button
                    id="onboarding-open-importer-btn"
                    onClick={() => {
                      completeOnboarding();
                      setActiveModal('import');
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2"
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span>Abrir Importador de Archivos</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {currentStep === 'ANALYZE' && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
                <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-purple-400" />
                  <span>Paso 2: Diagnóstico Holístico con AI Director</span>
                </h4>
                <p className="text-xs text-slate-400">
                  El motor del AI Director evalúa automáticamente 7 dimensiones clave del proyecto.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-center">
                  <span className="text-[10px] text-slate-400 font-mono uppercase">World Health</span>
                  <div className="text-lg font-bold text-cyan-400 mt-1">{directorHealth.worldHealth}/100</div>
                </div>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-center">
                  <span className="text-[10px] text-slate-400 font-mono uppercase">Balance Health</span>
                  <div className="text-lg font-bold text-emerald-400 mt-1">{directorHealth.balanceHealth}/100</div>
                </div>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-center">
                  <span className="text-[10px] text-slate-400 font-mono uppercase">Visual Health</span>
                  <div className="text-lg font-bold text-pink-400 mt-1">{directorHealth.visualHealth}/100</div>
                </div>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-center">
                  <span className="text-[10px] text-slate-400 font-mono uppercase">Technical Health</span>
                  <div className="text-lg font-bold text-indigo-400 mt-1">{directorHealth.technicalHealth}/100</div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 'BUILD_KNOWLEDGE_BASE' && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
                <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-400" />
                  <span>Paso 3: Knowledge Base & Prevención de Colisiones</span>
                </h4>
                <p className="text-xs text-slate-400">
                  Todas las entidades se indexan activamente para alimentar al motor de IA y garantizar que las nuevas creaciones respeten el lore, biomas y curvas de poder existentes.
                </p>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300">Entidades Activas Indexadas:</span>
                  <span className="font-mono font-bold text-cyan-400">{knowledgeBase.totalEntities}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300">Biomas Mapeados:</span>
                  <span className="font-mono font-bold text-emerald-400">{projectContext.biomes.length}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300">Percentil de BST Promedio:</span>
                  <span className="font-mono font-bold text-purple-400">{knowledgeBase.bstMetrics.avgBst}</span>
                </div>
              </div>
            </div>
          )}

          {currentStep === 'CHECK_SYSTEM' && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
                <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  <span>Paso 4: Auditoría de Reglas & QA Visual 2.5D</span>
                </h4>
                <p className="text-xs text-slate-400">
                  El validador de juego audita 12+ reglas de consistencia de datos, y Visual QA verifica los puntos de anclaje Y-Sorting (0.85-0.95) para Phaser 3.
                </p>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-200">Estado del Validador</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {validationReport.errorCount === 0
                      ? '✓ 0 Errores críticos detectados'
                      : `⚠️ ${validationReport.errorCount} errores detectados`}
                  </div>
                </div>
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-mono font-bold ${
                    validationReport.errorCount === 0
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-amber-500/20 text-amber-300'
                  }`}
                >
                  {validationReport.errorCount === 0 ? 'VALIDADO' : 'REQUIERE ATENCIÓN'}
                </span>
              </div>
            </div>
          )}

          {currentStep === 'READY' && (
            <div className="space-y-4 animate-fade-in text-center py-4">
              <div className="inline-flex p-4 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/30">
                <CheckCircle2 className="w-12 h-12" />
              </div>
              <div className="space-y-2">
                <h4 className="text-lg font-bold text-slate-100">¡AURORA AI CREATOR está Lista para Producción!</h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                  Tu entorno está calibrado. Puedes comenzar a generar contenido con IA, inspeccionar la salud de tu juego con AI Director o exportar parches a Cursor.
                </p>
              </div>

              <div className="flex flex-wrap justify-center gap-3 pt-2">
                <button
                  id="onboarding-go-director-btn"
                  onClick={() => {
                    completeOnboarding();
                    setActiveTab('director');
                  }}
                  className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-purple-950/50"
                >
                  <Cpu className="w-4 h-4" />
                  <span>Explorar AI Director</span>
                </button>
                <button
                  id="onboarding-go-ai-creator-btn"
                  onClick={() => {
                    completeOnboarding();
                    setActiveTab('ai_creator');
                  }}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-indigo-950/50"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Crear Contenido con IA</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <button
            id="onboarding-prev-btn"
            onClick={goToPrev}
            disabled={currentIdx === 0}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
              currentIdx === 0
                ? 'opacity-40 text-slate-600 cursor-not-allowed'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Anterior</span>
          </button>

          <div className="text-xs text-slate-500 font-mono">
            Paso {currentIdx + 1} de {steps.length}
          </div>

          <button
            id="onboarding-next-btn"
            onClick={goToNext}
            className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-indigo-950/50"
          >
            <span>{currentStep === 'READY' ? 'Comenzar Ahora' : 'Siguiente'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
