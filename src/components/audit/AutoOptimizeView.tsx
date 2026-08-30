import React, { useState, useEffect } from 'react';
import {
  Zap,
  Lock,
  Unlock,
  ShieldCheck,
  ShieldAlert,
  Layers,
  ArrowRight,
  TrendingUp,
  Cpu,
  Activity,
  Gauge,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  ChevronRight,
  Sliders,
  FileCode,
} from 'lucide-react';
import { useAurora } from '../../context/AuroraContext';
import {
  OptimizationProposal,
  SystemBenchmarkMetrics,
  RegressionCheckResult,
  SafetySnapshot,
} from '../../types/aurora';
import {
  scanOptimizationProposals,
  measureSystemBenchmark,
  runRegressionGuard,
  executeOneClickSafeOptimization,
  loadSafetySnapshots,
} from '../../lib/autoOptimizerEngine';

export const AutoOptimizeView: React.FC = () => {
  const { projectContext, addStagedPackage, setActiveTab } = useAurora();
  const [visualLock, setVisualLock] = useState<boolean>(true);
  const [proposals, setProposals] = useState<OptimizationProposal[]>([]);
  const [benchmarkBefore, setBenchmarkBefore] = useState<SystemBenchmarkMetrics | null>(null);
  const [benchmarkAfter, setBenchmarkAfter] = useState<SystemBenchmarkMetrics | null>(null);
  const [regressionResult, setRegressionResult] = useState<RegressionCheckResult | null>(null);
  const [snapshots, setSnapshots] = useState<SafetySnapshot[]>([]);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const bm = measureSystemBenchmark(projectContext);
    setBenchmarkBefore(bm);
    const props = scanOptimizationProposals(projectContext, visualLock);
    setProposals(props);
    const reg = runRegressionGuard(projectContext);
    setRegressionResult(reg);
    const snaps = loadSafetySnapshots();
    setSnapshots(snaps);
  }, [projectContext, visualLock]);

  const handleToggleVisualLock = () => {
    const next = !visualLock;
    setVisualLock(next);
    const props = scanOptimizationProposals(projectContext, next);
    setProposals(props);
    showToast(`Visual Lock ${next ? 'ACTIVADO' : 'DESACTIVADO'}.`);
  };

  const handleOptimizeAurora = () => {
    setIsOptimizing(true);
    setTimeout(() => {
      const result = executeOneClickSafeOptimization(projectContext, visualLock);
      setBenchmarkAfter(result.afterBenchmark);
      setRegressionResult(result.regressionGuard);
      setSnapshots(loadSafetySnapshots());

      // Add patch package to Staging
      addStagedPackage(result.stagedPackage);

      setIsOptimizing(false);
      showToast(result.message);
    }, 450);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  const safeCount = proposals.filter((p) => p.category === 'SAFE').length;
  const advancedCount = proposals.filter((p) => p.category === 'ADVANCED').length;
  const blockedCount = proposals.filter((p) => p.status === 'BLOCKED_BY_VISUAL_LOCK').length;

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 overflow-y-auto p-6 space-y-6">
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-emerald-950/90 border border-emerald-500/40 text-emerald-200 px-4 py-3 rounded-lg shadow-xl flex items-center gap-3 z-50 animate-fade-in text-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950/30 to-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-500/10 border border-purple-500/30 rounded-lg text-purple-400">
              <Zap className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  Autonomous Auto-Optimizer 2.2
                </h1>
                <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300">
                  SAFE / ADVANCED PIPELINE
                </span>
              </div>
              <p className="text-slate-400 text-sm">
                Optimización determinista sin coste: Detección de trabajo redundante, asignaciones y
                fugas.
              </p>
            </div>
          </div>
        </div>

        {/* Visual Lock Switch & Optimize Button */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Visual Lock Toggle */}
          <button
            onClick={handleToggleVisualLock}
            className={`flex items-center gap-2.5 px-3.5 py-2 rounded-lg border text-xs font-semibold transition cursor-pointer ${
              visualLock
                ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                : 'bg-amber-950/60 border-amber-500/50 text-amber-300'
            }`}
          >
            {visualLock ? (
              <Lock className="w-4 h-4 text-emerald-400" />
            ) : (
              <Unlock className="w-4 h-4 text-amber-400" />
            )}
            <span>VISUAL LOCK: {visualLock ? 'ON (BLINDADO)' : 'OFF (PERMISIVO)'}</span>
          </button>

          {/* Primary Action Button */}
          <button
            onClick={handleOptimizeAurora}
            disabled={isOptimizing}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold px-5 py-2.5 rounded-lg transition shadow-lg shadow-purple-900/30 disabled:opacity-50 cursor-pointer"
          >
            <Sparkles className={`w-4 h-4 ${isOptimizing ? 'animate-spin' : ''}`} />
            {isOptimizing ? 'Optimizando...' : 'OPTIMIZE AURORA (SAFE)'}
          </button>
        </div>
      </div>

      {/* Visual Lock Status Card */}
      <div
        className={`rounded-xl border p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
          visualLock
            ? 'bg-emerald-950/20 border-emerald-500/30'
            : 'bg-amber-950/20 border-amber-500/30'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-lg ${
              visualLock
                ? 'bg-emerald-500/10 text-emerald-400'
                : 'bg-amber-500/10 text-amber-400'
            }`}
          >
            {visualLock ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-200">
              {visualLock
                ? 'Protección Visual Activa — Calidad Gráfica y 2.5D Bloqueados al 100%'
                : 'Visual Lock Desactivado — Optimizaciones destructivas permitidas (Cuidado)'}
            </div>
            <div className="text-xs text-slate-400">
              {visualLock
                ? 'Se prohíbe reducir resolución de sprites, simplificar partículas, eliminar assets o alterar anclajes Y-Sort.'
                : 'Las propuestas avanzadas pueden alterar la nitidez o densidad de partículas del juego.'}
            </div>
          </div>
        </div>
        <div className="text-xs font-semibold px-3 py-1 rounded bg-slate-900/80 border border-slate-800 text-slate-300">
          {blockedCount} Optimizaciones Bloqueadas
        </div>
      </div>

      {/* Before / After Benchmark Real Measurements */}
      {benchmarkBefore && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Gauge className="w-4 h-4 text-indigo-400" />
              Telemetría y Benchmarking (Mediciones Reales)
            </h2>
            {benchmarkAfter && (
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded">
                DELTA VERIFICADO POST-OPTIMIZACIÓN
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {/* FPS */}
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-3">
              <div className="text-xs text-slate-400">Framerate</div>
              <div className="text-lg font-bold text-slate-200 mt-1">
                {benchmarkBefore.fps} FPS
              </div>
              {benchmarkAfter && (
                <div className="text-xs font-semibold text-emerald-400 mt-0.5">
                  → {benchmarkAfter.fps} FPS (+{(benchmarkAfter.fps - benchmarkBefore.fps).toFixed(1)})
                </div>
              )}
            </div>

            {/* Frame Time */}
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-3">
              <div className="text-xs text-slate-400">Frame Time</div>
              <div className="text-lg font-bold text-slate-200 mt-1">
                {benchmarkBefore.frameTimeMs} ms
              </div>
              {benchmarkAfter && (
                <div className="text-xs font-semibold text-emerald-400 mt-0.5">
                  → {benchmarkAfter.frameTimeMs} ms (-
                  {(benchmarkBefore.frameTimeMs - benchmarkAfter.frameTimeMs).toFixed(1)} ms)
                </div>
              )}
            </div>

            {/* Memory */}
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-3">
              <div className="text-xs text-slate-400">Memoria RAM</div>
              <div className="text-lg font-bold text-slate-200 mt-1">
                {benchmarkBefore.memoryMB} MB
              </div>
              {benchmarkAfter && (
                <div className="text-xs font-semibold text-emerald-400 mt-0.5">
                  → {benchmarkAfter.memoryMB} MB (-
                  {(benchmarkBefore.memoryMB - benchmarkAfter.memoryMB).toFixed(1)} MB)
                </div>
              )}
            </div>

            {/* CPU */}
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-3">
              <div className="text-xs text-slate-400">Uso de CPU</div>
              <div className="text-lg font-bold text-slate-200 mt-1">
                {benchmarkBefore.cpuUsagePct}%
              </div>
              {benchmarkAfter && (
                <div className="text-xs font-semibold text-emerald-400 mt-0.5">
                  → {benchmarkAfter.cpuUsagePct}% (-
                  {(benchmarkBefore.cpuUsagePct - benchmarkAfter.cpuUsagePct).toFixed(1)}%)
                </div>
              )}
            </div>

            {/* GPU Draw Calls */}
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-3">
              <div className="text-xs text-slate-400">GPU Draw Calls</div>
              <div className="text-lg font-bold text-slate-200 mt-1">
                {benchmarkBefore.gpuDrawCalls}
              </div>
              {benchmarkAfter && (
                <div className="text-xs font-semibold text-emerald-400 mt-0.5">
                  → {benchmarkAfter.gpuDrawCalls} (-
                  {benchmarkBefore.gpuDrawCalls - benchmarkAfter.gpuDrawCalls})
                </div>
              )}
            </div>

            {/* Load Time */}
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-3">
              <div className="text-xs text-slate-400">Carga Inicial</div>
              <div className="text-lg font-bold text-slate-200 mt-1">
                {benchmarkBefore.loadTimeMs} ms
              </div>
              {benchmarkAfter && (
                <div className="text-xs font-semibold text-emerald-400 mt-0.5">
                  → {benchmarkAfter.loadTimeMs} ms (-
                  {benchmarkBefore.loadTimeMs - benchmarkAfter.loadTimeMs} ms)
                </div>
              )}
            </div>

            {/* Bundle */}
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-3">
              <div className="text-xs text-slate-400">Bundle Size</div>
              <div className="text-lg font-bold text-slate-200 mt-1">
                {benchmarkBefore.bundleSizeKB} KB
              </div>
              {benchmarkAfter && (
                <div className="text-xs font-semibold text-emerald-400 mt-0.5">
                  → {benchmarkAfter.bundleSizeKB} KB
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Regression Guard Checklist */}
      {regressionResult && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Regression Guard (Verificación Previa y Posterior)
            </h3>
            <span
              className={`text-xs font-bold px-2.5 py-0.5 rounded ${
                regressionResult.passed
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
              }`}
            >
              {regressionResult.passed ? '100% REGRESSION-FREE' : 'ALERTAS DE REGRESIÓN'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
            {Object.entries(regressionResult.checks).map(([key, val]) => (
              <div
                key={key}
                className={`p-2.5 rounded-lg border flex items-center justify-between ${
                  val
                    ? 'bg-slate-950/40 border-slate-800/80 text-slate-300'
                    : 'bg-rose-950/20 border-rose-500/30 text-rose-300'
                }`}
              >
                <span className="capitalize">{key}</span>
                {val ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Optimization Proposals (Plan Detail) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
            Plan de Optimización Propuesto ({proposals.length} Items Detectados)
          </h2>
          <div className="flex items-center gap-2 text-xs">
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 font-medium">
              {safeCount} SAFE
            </span>
            <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 font-medium">
              {advancedCount} ADVANCED
            </span>
          </div>
        </div>

        <div className="space-y-3">
          {proposals.map((prop) => (
            <div
              key={prop.id}
              className={`border rounded-xl p-5 transition space-y-4 ${
                prop.status === 'BLOCKED_BY_VISUAL_LOCK'
                  ? 'bg-slate-900/40 border-slate-800/60 opacity-70'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span
                    className={`px-2.5 py-0.5 text-xs font-bold rounded-md ${
                      prop.category === 'SAFE'
                        ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                        : 'bg-purple-500/10 border border-purple-500/30 text-purple-400'
                    }`}
                  >
                    {prop.category}
                  </span>

                  {prop.status === 'BLOCKED_BY_VISUAL_LOCK' && (
                    <span className="px-2.5 py-0.5 text-xs font-bold rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      BLOCKED BY VISUAL LOCK
                    </span>
                  )}

                  <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                    {prop.type.replace('_', ' ')}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
                  <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                    Impacto Visual: {prop.visualImpact}
                  </span>
                  <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                    Riesgo: {prop.risk}
                  </span>
                </div>
              </div>

              {/* Title & Structured Plan (Problem, Cause, Solution, Files, Benefit) */}
              <div className="space-y-3">
                <h3 className="text-base font-semibold text-slate-100">{prop.title}</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="bg-slate-950/70 border border-slate-900 rounded-lg p-3 space-y-1">
                    <span className="text-rose-400 font-semibold uppercase tracking-wider">
                      Problema & Causa
                    </span>
                    <p className="text-slate-300">{prop.problem}</p>
                    <p className="text-slate-500 italic">{prop.cause}</p>
                  </div>

                  <div className="bg-slate-950/70 border border-slate-900 rounded-lg p-3 space-y-1">
                    <span className="text-emerald-400 font-semibold uppercase tracking-wider">
                      Solución Quirúrgica
                    </span>
                    <p className="text-emerald-200/90">{prop.solution}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {prop.files.map((f) => (
                        <span
                          key={f}
                          className="font-mono text-[10px] bg-slate-900 text-slate-400 px-1.5 py-0.5 rounded"
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-950/70 border border-slate-900 rounded-lg p-3 space-y-1">
                    <span className="text-indigo-400 font-semibold uppercase tracking-wider">
                      Ganancia Esperada & Deltas
                    </span>
                    <p className="text-indigo-200/90">{prop.expectedBenefit}</p>
                    <div className="grid grid-cols-2 gap-1 text-[11px] font-mono text-emerald-400 pt-1">
                      <span>FPS: {prop.metricsDelta.fps}</span>
                      <span>RAM: {prop.metricsDelta.memory}</span>
                      <span>CPU: {prop.metricsDelta.cpu}</span>
                      <span>Carga: {prop.metricsDelta.loadTime}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
