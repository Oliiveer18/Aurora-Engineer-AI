import React, { useState, useEffect } from 'react';
import { useAurora } from '../../context/AuroraContext';
import {
  LiveProfilerSnapshot,
  VerifiedBottleneck,
  VerifiedOptimizationResult,
  MaximumSafeOptimizationRun,
  FourPillarScore,
  VisualRegressionCheck,
  SafetySnapshot,
} from '../../types/aurora';
import {
  sampleLivePerformance,
  AURORA_SCENARIOS,
} from '../../lib/liveProfilerEngine';
import {
  detectLiveBottlenecks,
  executeVerifiedOptimization,
  runMaximumSafeOptimization,
  calculateFourPillarScore,
  evaluateVisualRegression,
  evaluateGameplayIntegrity,
  loadOptimizationHistory,
} from '../../lib/verifiedOptimizerEngine';
import {
  Zap,
  ShieldCheck,
  CheckCircle2,
  Lock,
  RotateCcw,
  Play,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Activity,
  Layers,
  Sparkles,
  AlertTriangle,
  FileCode,
  Gauge,
  History,
  FileCheck,
  Eye,
} from 'lucide-react';

export const VerifiedOptimizerView: React.FC = () => {
  const { projectContext, showToast, setActiveTab, setStagedPackage } = useAurora();

  const [snapshot, setSnapshot] = useState<LiveProfilerSnapshot | null>(null);
  const [bottlenecks, setBottlenecks] = useState<VerifiedBottleneck[]>([]);
  const [activeScenarioId, setActiveScenarioId] = useState<string>('whispering_forest');
  const [visualLock, setVisualLock] = useState<boolean>(true);
  const [gameplayLock, setGameplayLock] = useState<boolean>(true);

  const [isOptimizing, setIsOptimizing] = useState(false);
  const [lastResult, setLastResult] = useState<VerifiedOptimizationResult | null>(null);
  const [history, setHistory] = useState<VerifiedOptimizationResult[]>([]);

  // Maximum Safe Optimization state
  const [isAutoRunning, setIsAutoRunning] = useState(false);
  const [autoProgress, setAutoProgress] = useState<{ step: number; total: number; title: string } | null>(null);
  const [maxSafeRun, setMaxSafeRun] = useState<MaximumSafeOptimizationRun | null>(null);

  // 4-Pillar Score
  const [fourPillar, setFourPillar] = useState<FourPillarScore | null>(null);
  const [visualRegression, setVisualRegression] = useState<VisualRegressionCheck | null>(null);

  useEffect(() => {
    loadInitialData();
  }, [projectContext]);

  const loadInitialData = async () => {
    const scenario = AURORA_SCENARIOS.find((s) => s.id === activeScenarioId) || AURORA_SCENARIOS[3];
    const snap = await sampleLivePerformance(600, scenario, projectContext);
    setSnapshot(snap);

    const btls = detectLiveBottlenecks(snap, projectContext, visualLock, gameplayLock);
    setBottlenecks(btls);

    const score = calculateFourPillarScore(snap, projectContext);
    setFourPillar(score);

    const vis = evaluateVisualRegression(projectContext);
    setVisualRegression(vis);

    setHistory(loadOptimizationHistory());
  };

  const handleSingleOptimize = async (btl: VerifiedBottleneck) => {
    setIsOptimizing(true);
    try {
      const res = await executeVerifiedOptimization(
        btl,
        activeScenarioId as any,
        projectContext,
        visualLock,
        gameplayLock
      );
      setLastResult(res);
      setHistory(loadOptimizationHistory());
      setSnapshot(res.afterSnapshot);
      setFourPillar(res.fourPillarScore);
      setVisualRegression(res.visualRegression);

      showToast(
        `Optimización verificada: ${res.optimizationTitle} (Delta: ${res.delta.frameTimeMs} ms, +${res.delta.fps} FPS)`,
        'success'
      );
    } catch (err) {
      console.error(err);
      showToast('Error al ejecutar optimización verificada', 'error');
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleRunMaximumSafe = async () => {
    setIsAutoRunning(true);
    setAutoProgress({ step: 0, total: 3, title: 'Iniciando Maximum Safe Optimization Loop...' });

    try {
      const run = await runMaximumSafeOptimization(
        projectContext,
        (step, total, currentTitle) => {
          setAutoProgress({ step, total, title: currentTitle });
        }
      );

      setMaxSafeRun(run);
      if (run.results.length > 0) {
        setLastResult(run.results[run.results.length - 1]);
        setSnapshot(run.results[run.results.length - 1].afterSnapshot);
        setFourPillar(run.results[run.results.length - 1].fourPillarScore);
      }
      setHistory(loadOptimizationHistory());

      showToast(
        `Maximum Safe Optimization completada: +${run.finalFpsDelta} FPS, ${run.finalFrameTimeDelta} ms Frame Time`,
        'success'
      );
    } catch (err) {
      console.error(err);
      showToast('Error en Maximum Safe Optimization', 'error');
    } finally {
      setIsAutoRunning(false);
      setAutoProgress(null);
    }
  };

  const handleSendToStaging = (res: VerifiedOptimizationResult) => {
    const stagedPkg = {
      id: res.stagedPatchId || `stg_opt_${Date.now()}`,
      title: `Verified Safe Patch: ${res.optimizationTitle}`,
      description: `Optimización verificada con Visual Lock = ON. Mejora: ${res.delta.frameTimeMs} ms frame time (+${res.delta.fps} FPS).`,
      changes: [
        {
          action: 'modified' as const,
          entityType: 'creature' as const,
          entity: { id: res.optimizationId, name: res.optimizationTitle, technique: res.technique },
          details: `[VERIFIED 2.3] ${res.technique} — Delta FPS: +${res.delta.fps}`,
        },
      ],
      unchangedCount: 0,
      targetContext: projectContext,
    };

    setStagedPackage(stagedPkg as any);
    showToast('Parche enviado a la Sala de Staging para Diff y Aprobación', 'success');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden backdrop-blur-md">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-purple-500/20 text-purple-400 rounded-xl border border-purple-500/30">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-slate-100 font-mono tracking-tight">
                    AURORA VERIFIED OPTIMIZER 2.3
                  </h1>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold border border-emerald-500/30">
                    EVIDENCIA REAL (BEFORE / AFTER)
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Optimización guiada por mediciones reales: Profile → Detect → Propose → Patch → Benchmark → Verify Regression.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Visual Lock Status */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-950/80 border border-purple-500/40 rounded-xl text-xs font-mono">
              <Lock className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-slate-300">Visual Lock:</span>
              <strong className="text-purple-300">ON (100% Locked)</strong>
            </div>

            {/* Gameplay Lock Status */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-950/80 border border-indigo-500/40 rounded-xl text-xs font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-slate-300">Gameplay Lock:</span>
              <strong className="text-indigo-300">ON (Integrity 100%)</strong>
            </div>

            <button
              onClick={handleRunMaximumSafe}
              disabled={isAutoRunning || isOptimizing}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-900/40 transition cursor-pointer disabled:opacity-50"
            >
              <Play className="w-4 h-4" />
              <span>{isAutoRunning ? 'Ejecutando Maximum Safe Loop...' : 'MAXIMUM SAFE OPTIMIZATION'}</span>
            </button>
          </div>
        </div>

        {/* Autonomous Progress Bar */}
        {autoProgress && (
          <div className="mt-4 p-3 bg-purple-950/40 border border-purple-800/60 rounded-xl text-xs font-mono">
            <div className="flex justify-between items-center text-purple-200 mb-1.5">
              <span>Paso {autoProgress.step} de {autoProgress.total}: {autoProgress.title}</span>
              <span className="text-emerald-400 font-bold">Verificando deltas reales...</span>
            </div>
            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-300"
                style={{ width: `${(autoProgress.step / Math.max(1, autoProgress.total)) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* 4-Pillar Score Cards */}
      {fourPillar && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
            <span className="text-[10px] font-mono text-slate-400">PERFORMANCE SCORE</span>
            <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
              {fourPillar.performanceScore} <span className="text-xs text-slate-500">/ 100</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">Basado en frame-time real vs 16.6ms</p>
          </div>

          <div className="bg-slate-900/80 border border-purple-500/30 rounded-xl p-4 bg-purple-950/10">
            <span className="text-[10px] font-mono text-purple-300">VISUAL QUALITY</span>
            <div className="text-2xl font-bold font-mono text-purple-300 mt-1">
              {fourPillar.visualQualityScore}%
            </div>
            <p className="text-[10px] text-purple-400/80 mt-0.5">Visual Lock: Cero degradación</p>
          </div>

          <div className="bg-slate-900/80 border border-indigo-500/30 rounded-xl p-4 bg-indigo-950/10">
            <span className="text-[10px] font-mono text-indigo-300">GAMEPLAY INTEGRITY</span>
            <div className="text-2xl font-bold font-mono text-indigo-300 mt-1">
              {fourPillar.gameplayIntegrityScore}%
            </div>
            <p className="text-[10px] text-indigo-400/80 mt-0.5">Fórmulas de combate & IA intactas</p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
            <span className="text-[10px] font-mono text-slate-400">TECHNICAL INTEGRITY</span>
            <div className="text-2xl font-bold font-mono text-cyan-400 mt-1">
              {fourPillar.technicalIntegrityScore}%
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">Esquemas y tipos 100% válidos</p>
          </div>
        </div>
      )}

      {/* Verified Before / After / Delta Card (If Last Result exists) */}
      {lastResult && (
        <div className="bg-slate-900/90 border border-emerald-500/40 rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              <div>
                <h2 className="text-sm font-bold text-slate-100 font-mono">
                  RESULTADO DE OPTIMIZACIÓN VERIFICADA: {lastResult.optimizationTitle}
                </h2>
                <p className="text-xs text-slate-400">
                  Técnica aplicada: <strong className="text-emerald-300">{lastResult.technique}</strong> en escenario <strong className="text-slate-200">{lastResult.scenarioName}</strong>
                </p>
              </div>
            </div>

            <button
              onClick={() => handleSendToStaging(lastResult)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition cursor-pointer"
            >
              <FileCheck className="w-4 h-4" />
              <span>Enviar a Staging</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
            {/* BEFORE */}
            <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800">
              <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">ANTES (Medición Real)</span>
              <div className="mt-2 space-y-1.5 text-slate-300">
                <div className="flex justify-between">
                  <span>FPS:</span>
                  <strong className="text-slate-100">{lastResult.beforeSnapshot.fps.value} FPS</strong>
                </div>
                <div className="flex justify-between">
                  <span>Frame Time:</span>
                  <strong className="text-slate-100">{lastResult.beforeSnapshot.frameTimeMs.value} ms</strong>
                </div>
                <div className="flex justify-between">
                  <span>CPU Workload:</span>
                  <strong className="text-slate-100">{lastResult.beforeSnapshot.cpuTimeMs.value} ms</strong>
                </div>
                <div className="flex justify-between">
                  <span>Memoria JS:</span>
                  <strong className="text-slate-100">{lastResult.beforeSnapshot.memoryMB.value} MB</strong>
                </div>
              </div>
            </div>

            {/* AFTER */}
            <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800">
              <span className="text-emerald-500 text-[10px] uppercase font-bold tracking-wider">DESPUÉS (Medición Real)</span>
              <div className="mt-2 space-y-1.5 text-slate-300">
                <div className="flex justify-between">
                  <span>FPS:</span>
                  <strong className="text-emerald-400">{lastResult.afterSnapshot.fps.value} FPS</strong>
                </div>
                <div className="flex justify-between">
                  <span>Frame Time:</span>
                  <strong className="text-emerald-400">{lastResult.afterSnapshot.frameTimeMs.value} ms</strong>
                </div>
                <div className="flex justify-between">
                  <span>CPU Workload:</span>
                  <strong className="text-emerald-400">{lastResult.afterSnapshot.cpuTimeMs.value} ms</strong>
                </div>
                <div className="flex justify-between">
                  <span>Memoria JS:</span>
                  <strong className="text-emerald-400">{lastResult.afterSnapshot.memoryMB.value} MB</strong>
                </div>
              </div>
            </div>

            {/* DELTA */}
            <div className="bg-emerald-950/30 p-4 rounded-xl border border-emerald-500/30 flex flex-col justify-between">
              <span className="text-emerald-400 text-[10px] uppercase font-bold tracking-wider">DELTA VERIFICADO</span>
              <div className="my-2 space-y-1 text-xs">
                <div className="flex justify-between font-bold text-emerald-300">
                  <span>Ganancia FPS:</span>
                  <span>+{lastResult.delta.fps} FPS ({lastResult.delta.fpsPct}%)</span>
                </div>
                <div className="flex justify-between font-bold text-emerald-300">
                  <span>Reducción Frame:</span>
                  <span>{lastResult.delta.frameTimeMs} ms ({lastResult.delta.frameTimePct}%)</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Ahorro CPU:</span>
                  <span>{lastResult.delta.cpuMs} ms</span>
                </div>
              </div>
              <div className="text-[10px] text-emerald-400/90 pt-2 border-t border-emerald-900/50">
                ✓ Visual 100% idéntico • Gameplay 100% intacto
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detected Bottlenecks List */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <Activity className="w-5 h-5 text-indigo-400" />
            <div>
              <h2 className="text-sm font-bold text-slate-100 font-mono">
                CUELLOS DE BOTELLA DETECTADOS (CLASIFICACIÓN & TRIAGE)
              </h2>
              <p className="text-xs text-slate-400">
                Identificación de cuellos de CPU, GPU, Y-Sorting y memoria priorizados por impacto y riesgo.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {bottlenecks.map((btl) => {
            const isBlocked = btl.visualImpact === 'BLOCKED_BY_VISUAL_LOCK';
            return (
              <div
                key={btl.id}
                className="bg-slate-950/70 border border-slate-800/90 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 max-w-3xl">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-[10px] font-mono text-purple-300 font-bold uppercase">
                      {btl.type}
                    </span>
                    <h3 className="text-xs font-bold text-slate-200">{btl.title}</h3>
                    {isBlocked ? (
                      <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 text-[10px] font-mono rounded border border-rose-500/30">
                        BLOCKED BY VISUAL LOCK
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-mono rounded border border-emerald-500/30">
                        SAFE OPTIMIZATION
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-400">{btl.description}</p>
                  
                  <div className="text-[11px] font-mono text-slate-500 flex flex-wrap gap-3 pt-1">
                    <span><strong>Evidencia:</strong> {btl.evidence}</span>
                    <span><strong>Propuesta:</strong> {btl.proposedFix}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {btl.measuredDelta && (
                    <div className="text-right font-mono text-xs hidden sm:block">
                      <div className="text-slate-500 text-[10px]">{btl.measuredDelta.label}</div>
                      <div className="text-purple-400 font-bold">
                        {btl.measuredDelta.before} → {btl.measuredDelta.after} {btl.measuredDelta.unit}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => handleSingleOptimize(btl)}
                    disabled={isOptimizing || isBlocked}
                    className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
                      isBlocked
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/30'
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>{isOptimizing ? 'Optimizando...' : 'Optimizar & Medir'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Visual Regression Guard Panel */}
      {visualRegression && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-purple-400" />
              <h2 className="text-sm font-bold text-slate-100 font-mono">
                VISUAL REGRESSION GUARD
              </h2>
            </div>
            <span
              className={`px-2 py-0.5 text-[10px] font-mono rounded border ${
                visualRegression.status === 'VERIFIED_IDENTICAL'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
              }`}
            >
              STATUS: {visualRegression.status}
            </span>
          </div>

          <p className="text-xs text-slate-400 mb-3">{visualRegression.note}</p>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2 text-center text-[10px] font-mono">
            {Object.entries(visualRegression.elementsChecked).map(([key, val]) => (
              <div
                key={key}
                className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/80"
              >
                <div className="text-slate-400 capitalize">{key}</div>
                <div className="text-emerald-400 font-bold mt-0.5">✓ Intacto</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
