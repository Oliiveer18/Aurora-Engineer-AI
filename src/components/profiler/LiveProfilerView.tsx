import React, { useState, useEffect, useRef } from 'react';
import { useAurora } from '../../context/AuroraContext';
import {
  LiveProfilerSnapshot,
  PerformanceScenario,
  PerformanceScenarioId,
  PerformanceBaseline,
  BaselineComparison,
  StressTestConfig,
  StressTestResult,
} from '../../types/aurora';
import {
  sampleLivePerformance,
  AURORA_SCENARIOS,
  saveBaseline,
  loadBaselines,
  compareWithBaseline,
  runStressTest,
  measureYSorting,
  YSortBenchmarkResult,
} from '../../lib/liveProfilerEngine';
import {
  Activity,
  Zap,
  ShieldCheck,
  Play,
  RotateCcw,
  Gauge,
  Cpu,
  Layers,
  Sparkles,
  Flame,
  AlertTriangle,
  CheckCircle2,
  HardDrive,
  Eye,
  Sliders,
  Maximize2,
  ArrowRight,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';

export const LiveProfilerView: React.FC = () => {
  const { projectContext, showToast, setActiveTab } = useAurora();

  const [snapshot, setSnapshot] = useState<LiveProfilerSnapshot | null>(null);
  const [isProfiling, setIsProfiling] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<PerformanceScenario>(AURORA_SCENARIOS[0]);
  const [baselines, setBaselines] = useState<PerformanceBaseline[]>([]);
  const [activeBaseline, setActiveBaseline] = useState<PerformanceBaseline | null>(null);
  const [comparison, setComparison] = useState<BaselineComparison | null>(null);

  // Y-Sort Lab
  const [ySortCount, setYSortCount] = useState<number>(64);
  const [ySortBench, setYSortBench] = useState<YSortBenchmarkResult | null>(null);

  // Stress Test
  const [stressConfig, setStressConfig] = useState<StressTestConfig>({
    tier: 250,
    type: 'entity_flood',
    durationSec: 2,
    targetFps: 60,
  });
  const [isStressRunning, setIsStressRunning] = useState(false);
  const [stressResult, setStressResult] = useState<StressTestResult | null>(null);

  // Continuous live loop
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    const loadedBaselines = loadBaselines();
    setBaselines(loadedBaselines);
    if (loadedBaselines.length > 0) {
      setActiveBaseline(loadedBaselines[0]);
    }

    // Initial Live Sampling
    runLiveSample(selectedScenario);
    setYSortBench(measureYSorting(ySortCount));

    return () => {
      isMounted.current = false;
    };
  }, []);

  const runLiveSample = async (scenario?: PerformanceScenario) => {
    setIsProfiling(true);
    try {
      const snap = await sampleLivePerformance(600, scenario, projectContext);
      if (isMounted.current) {
        setSnapshot(snap);
        if (activeBaseline) {
          setComparison(compareWithBaseline(activeBaseline, snap));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      if (isMounted.current) setIsProfiling(false);
    }
  };

  const handleSaveAsBaseline = () => {
    if (!snapshot) return;
    const b = saveBaseline(snapshot);
    setBaselines(loadBaselines());
    setActiveBaseline(b);
    setComparison(compareWithBaseline(b, snapshot));
    showToast(`Baseline guardado para escenario: "${snapshot.sceneName}"`, 'success');
  };

  const handleRunStress = async () => {
    setIsStressRunning(true);
    try {
      const res = await runStressTest(stressConfig);
      if (isMounted.current) {
        setStressResult(res);
        showToast(
          `Stress Test completado: ${res.avgFps} FPS medio (${res.passed ? 'PASADO' : 'CUELLOS DETECTADOS'})`,
          res.passed ? 'success' : 'warning'
        );
      }
    } finally {
      if (isMounted.current) setIsStressRunning(false);
    }
  };

  const handleYSortChange = (count: number) => {
    setYSortCount(count);
    setYSortBench(measureYSorting(count));
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden backdrop-blur-md">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/30">
                <Activity className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-slate-100 font-mono tracking-tight">
                    AURORA LIVE PROFILER 2.3
                  </h1>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold border border-emerald-500/30">
                    REAL MEASUREMENTS (0€)
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-mono font-bold border border-purple-500/30">
                    VISUAL LOCK ON
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Telemetría en tiempo real, análisis de Y-Sorting 2.5D, 12 escenarios reproducibles y tests de estrés sin coste API.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => runLiveSample(selectedScenario)}
              disabled={isProfiling}
              className={`flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition shadow-lg shadow-indigo-900/30 cursor-pointer ${
                isProfiling ? 'opacity-50' : ''
              }`}
            >
              <RotateCcw className={`w-4 h-4 ${isProfiling ? 'animate-spin' : ''}`} />
              <span>{isProfiling ? 'Midiendo...' : 'Re-Perfilar en Vivo'}</span>
            </button>

            <button
              onClick={handleSaveAsBaseline}
              disabled={!snapshot}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold rounded-xl transition cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Fijar como Baseline</span>
            </button>

            <button
              onClick={() => setActiveTab('auto_optimize')}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-900/40 transition cursor-pointer"
            >
              <Zap className="w-4 h-4" />
              <span>Ir a Verified Optimizer</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Environment Tags */}
        {snapshot && (
          <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap items-center gap-3 text-[11px] text-slate-400 font-mono">
            <span className="text-slate-500">Hardware & Runtime:</span>
            <span className="px-2 py-0.5 bg-slate-950/80 border border-slate-800 rounded text-slate-300">
              {snapshot.hardware.renderer}
            </span>
            <span className="px-2 py-0.5 bg-slate-950/80 border border-slate-800 rounded text-slate-300">
              {snapshot.hardware.logicalCores} Cores CPU
            </span>
            <span className="px-2 py-0.5 bg-slate-950/80 border border-slate-800 rounded text-slate-300">
              DPR: {snapshot.hardware.devicePixelRatio}x
            </span>
            <span className="px-2 py-0.5 bg-slate-950/80 border border-slate-800 rounded text-indigo-300">
              Modo: {snapshot.connectionMode}
            </span>
          </div>
        )}
      </div>

      {/* Main Grid: Core Gauges */}
      {snapshot && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {/* FPS Gauge */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5 text-emerald-400" />
                FPS
              </span>
              <span className="text-[9px] font-mono px-1 rounded bg-emerald-500/20 text-emerald-300">
                {snapshot.fps.reliability}
              </span>
            </div>
            <div className="my-2">
              <div className="text-2xl font-bold font-mono text-emerald-400">
                {snapshot.fps.value}
              </div>
              <div className="text-[10px] text-slate-500">Objetivo: 60 FPS</div>
            </div>
            <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full"
                style={{ width: `${Math.min(100, (snapshot.fps.value / 60) * 100)}%` }}
              />
            </div>
          </div>

          {/* Frame Time */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-indigo-400" />
                Frame Time
              </span>
              <span className="text-[9px] font-mono px-1 rounded bg-emerald-500/20 text-emerald-300">
                {snapshot.frameTimeMs.reliability}
              </span>
            </div>
            <div className="my-2">
              <div
                className={`text-2xl font-bold font-mono ${
                  snapshot.frameTimeMs.value <= 16.6 ? 'text-indigo-400' : 'text-amber-400'
                }`}
              >
                {snapshot.frameTimeMs.value} <span className="text-xs font-normal">ms</span>
              </div>
              <div className="text-[10px] text-slate-500">Presupuesto: 16.6 ms</div>
            </div>
            <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  snapshot.frameTimeMs.value <= 16.6 ? 'bg-indigo-500' : 'bg-amber-500'
                }`}
                style={{ width: `${Math.min(100, (snapshot.frameTimeMs.value / 25) * 100)}%` }}
              />
            </div>
          </div>

          {/* CPU Workload */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                CPU Time
              </span>
              <span className="text-[9px] font-mono px-1 rounded bg-emerald-500/20 text-emerald-300">
                {snapshot.cpuTimeMs.reliability}
              </span>
            </div>
            <div className="my-2">
              <div className="text-2xl font-bold font-mono text-cyan-400">
                {snapshot.cpuTimeMs.value} <span className="text-xs font-normal">ms</span>
              </div>
              <div className="text-[10px] text-slate-500">JS Loop Sync</div>
            </div>
            <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-cyan-500 rounded-full"
                style={{ width: `${Math.min(100, (snapshot.cpuTimeMs.value / 16.6) * 100)}%` }}
              />
            </div>
          </div>

          {/* JS Heap Memory */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-teal-400" />
                JS Memory
              </span>
              <span
                className={`text-[9px] font-mono px-1 rounded ${
                  snapshot.memoryMB.reliability === 'VERIFIED'
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'bg-amber-500/20 text-amber-300'
                }`}
              >
                {snapshot.memoryMB.reliability}
              </span>
            </div>
            <div className="my-2">
              <div className="text-2xl font-bold font-mono text-teal-400">
                {snapshot.memoryMB.value} <span className="text-xs font-normal">MB</span>
              </div>
              <div className="text-[10px] text-slate-500">Límite seguro: 80 MB</div>
            </div>
            <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-teal-500 rounded-full"
                style={{ width: `${Math.min(100, (snapshot.memoryMB.value / 150) * 100)}%` }}
              />
            </div>
          </div>

          {/* 2.5D Y-Sorting Workload */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-purple-400" />
                Y-Sort Depth
              </span>
              <span className="text-[9px] font-mono px-1 rounded bg-emerald-500/20 text-emerald-300">
                {snapshot.ySortingWorkloadMs.reliability}
              </span>
            </div>
            <div className="my-2">
              <div className="text-2xl font-bold font-mono text-purple-400">
                {snapshot.ySortingWorkloadMs.value} <span className="text-xs font-normal">ms</span>
              </div>
              <div className="text-[10px] text-slate-500">
                {snapshot.ySortingEntities.value} entidades 2.5D
              </div>
            </div>
            <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-500 rounded-full"
                style={{ width: `${Math.min(100, (snapshot.ySortingWorkloadMs.value / 3.0) * 100)}%` }}
              />
            </div>
          </div>

          {/* Draw Calls (Estimated) */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-pink-400" />
                Draw Calls
              </span>
              <span className="text-[9px] font-mono px-1 rounded bg-amber-500/20 text-amber-300">
                {snapshot.drawCalls.reliability}
              </span>
            </div>
            <div className="my-2">
              <div className="text-2xl font-bold font-mono text-pink-400">
                {snapshot.drawCalls.value} <span className="text-xs font-normal">calls</span>
              </div>
              <div className="text-[10px] text-slate-500">2.5D Layer Batches</div>
            </div>
            <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-pink-500 rounded-full"
                style={{ width: `${Math.min(100, (snapshot.drawCalls.value / 80) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Baseline Comparison Card (if exists) */}
      {comparison && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <div>
                <h2 className="text-sm font-bold text-slate-100 font-mono">
                  COMPARATIVA DE BASELINE (BASELINE vs CURRENT)
                </h2>
                <p className="text-xs text-slate-400">
                  Escenario fijado: <strong className="text-slate-200">{comparison.baseline.sceneName}</strong> — Registrado el {new Date(comparison.baseline.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>

            {comparison.regressionDetected ? (
              <span className="flex items-center gap-1.5 px-3 py-1 bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold rounded-lg">
                <AlertTriangle className="w-4 h-4" />
                REGRESIÓN DETECTADA
              </span>
            ) : (
              <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold rounded-lg">
                <CheckCircle2 className="w-4 h-4" />
                RENDIMIENTO ESTABLE / MEJORADO
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
              <div className="text-slate-400">Delta FPS</div>
              <div
                className={`text-lg font-bold mt-1 flex items-center gap-1 ${
                  comparison.deltaFps >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {comparison.deltaFps >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {comparison.deltaFps >= 0 ? `+${comparison.deltaFps}` : comparison.deltaFps} FPS ({comparison.deltaFpsPct}%)
              </div>
            </div>

            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
              <div className="text-slate-400">Delta Frame Time</div>
              <div
                className={`text-lg font-bold mt-1 flex items-center gap-1 ${
                  comparison.deltaFrameTimeMs <= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {comparison.deltaFrameTimeMs <= 0 ? (
                  <TrendingDown className="w-4 h-4" />
                ) : (
                  <TrendingUp className="w-4 h-4" />
                )}
                {comparison.deltaFrameTimeMs > 0 ? `+${comparison.deltaFrameTimeMs}` : comparison.deltaFrameTimeMs} ms ({comparison.deltaFrameTimePct}%)
              </div>
            </div>

            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
              <div className="text-slate-400">Delta Memoria JS</div>
              <div
                className={`text-lg font-bold mt-1 ${
                  comparison.deltaMemoryMB <= 0 ? 'text-emerald-400' : 'text-amber-400'
                }`}
              >
                {comparison.deltaMemoryMB > 0 ? `+${comparison.deltaMemoryMB}` : comparison.deltaMemoryMB} MB
              </div>
            </div>

            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
              <div className="text-slate-400">Delta Draw Calls</div>
              <div
                className={`text-lg font-bold mt-1 ${
                  comparison.deltaDrawCalls <= 0 ? 'text-emerald-400' : 'text-amber-400'
                }`}
              >
                {comparison.deltaDrawCalls > 0 ? `+${comparison.deltaDrawCalls}` : comparison.deltaDrawCalls} calls
              </div>
            </div>
          </div>

          {comparison.regressionReasons.length > 0 && (
            <div className="mt-3 p-2.5 bg-rose-950/40 border border-rose-900/60 rounded-lg text-rose-300 text-xs">
              <ul className="list-disc pl-4 space-y-1">
                {comparison.regressionReasons.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* 12 Performance Scenarios Selector & Runner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <Sliders className="w-5 h-5 text-indigo-400" />
            <div>
              <h2 className="text-sm font-bold text-slate-100 font-mono">
                12 ESCENARIOS DE RENDIMIENTO REPRODUCIBLES
              </h2>
              <p className="text-xs text-slate-400">
                Ejecuta benchmarks sintéticos idénticos para comparar perfiles antes y después de cada cambio.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {AURORA_SCENARIOS.map((sc) => {
            const isSelected = selectedScenario.id === sc.id;
            return (
              <div
                key={sc.id}
                onClick={() => {
                  setSelectedScenario(sc);
                  runLiveSample(sc);
                }}
                className={`p-3.5 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-indigo-950/40 border-indigo-500/60 ring-1 ring-indigo-500/40'
                    : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/40'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-200">{sc.name}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-indigo-300">
                      {sc.simulatedEntities} ents
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{sc.description}</p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                  <span>Partículas: {sc.particleCount}</span>
                  <span className="text-emerald-400 font-semibold">{sc.targetFps} FPS Target</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Columns: Y-Sort 2.5D Deep Dive & Stress Test Studio */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Y-Sorting 2.5D Architecture Lab */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-purple-400" />
                <h2 className="text-sm font-bold text-slate-100 font-mono">
                  2.5D Y-SORTING PERFORMANCE LAB
                </h2>
              </div>
              <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 text-[10px] font-mono rounded border border-purple-500/30">
                DIMETRIC Y-AXIS
              </span>
            </div>

            <p className="text-xs text-slate-400 mb-4">
              Mide el coste del recálculo de profundidad Y-Sort sobre entidades dinámicas y estáticas.
            </p>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs text-slate-300 font-mono mb-1">
                  <span>Densidad de Entidades en Escena:</span>
                  <strong className="text-purple-400">{ySortCount} Entidades</strong>
                </div>
                <input
                  type="range"
                  min="16"
                  max="400"
                  step="16"
                  value={ySortCount}
                  onChange={(e) => handleYSortChange(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
              </div>

              {ySortBench && (
                <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                  <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-500 text-[10px]">Tiempo de Sorting</span>
                    <div className="text-base font-bold text-purple-400 mt-0.5">
                      {ySortBench.executionTimeMs} ms
                    </div>
                  </div>

                  <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-500 text-[10px]">Comparaciones O(N log N)</span>
                    <div className="text-base font-bold text-slate-200 mt-0.5">
                      {ySortBench.sortingOperationsCount} ops
                    </div>
                  </div>

                  <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-500 text-[10px]">Re-evaluaciones Innecesarias</span>
                    <div className="text-base font-bold text-amber-400 mt-0.5">
                      {ySortBench.unnecessaryChangesCount} estáticas
                    </div>
                  </div>

                  <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-500 text-[10px]">Entidades Fuera de Cámara</span>
                    <div className="text-base font-bold text-cyan-400 mt-0.5">
                      {ySortBench.offscreenEntitiesCount} culled
                    </div>
                  </div>
                </div>
              )}

              <div className="p-3 bg-purple-950/30 border border-purple-900/50 rounded-xl text-xs text-purple-200 space-y-1">
                <div className="font-semibold text-purple-300">Técnicas 2.5D Validadas (Visual Idéntico):</div>
                <div className="text-[11px] text-slate-400 flex flex-wrap gap-2 pt-1">
                  <span className="px-2 py-0.5 bg-slate-900 rounded border border-purple-500/30">Dirty Flags</span>
                  <span className="px-2 py-0.5 bg-slate-900 rounded border border-purple-500/30">Spatial Grid 64x64</span>
                  <span className="px-2 py-0.5 bg-slate-900 rounded border border-purple-500/30">Camera Frustum Culling</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stress Test Studio */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-rose-400" />
                <h2 className="text-sm font-bold text-slate-100 font-mono">
                  STRESS TEST STUDIO (ZERO POLLUTION)
                </h2>
              </div>
              <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 text-[10px] font-mono rounded border border-rose-500/30">
                EPHEMERAL HARNESS
              </span>
            </div>

            <p className="text-xs text-slate-400 mb-4">
              Prueba la resiliencia bajo 100, 250, 500 o 1000 entidades sin persistir datos en tu proyecto.
            </p>

            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-2">
                {[100, 250, 500, 1000].map((tier) => (
                  <button
                    key={tier}
                    onClick={() => setStressConfig({ ...stressConfig, tier: tier as any })}
                    className={`py-2 text-xs font-mono font-bold rounded-lg border transition cursor-pointer ${
                      stressConfig.tier === tier
                        ? 'bg-rose-600 text-white border-rose-500'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-900'
                    }`}
                  >
                    {tier} Ents
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => setStressConfig({ ...stressConfig, type: 'entity_flood' })}
                  className={`p-2 rounded-lg border text-left font-mono transition cursor-pointer ${
                    stressConfig.type === 'entity_flood'
                      ? 'bg-slate-800 text-slate-100 border-rose-500/60'
                      : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  <div className="font-bold">Entity Flood</div>
                  <div className="text-[10px] text-slate-500">Movimiento & AI simultánea</div>
                </button>

                <button
                  onClick={() => setStressConfig({ ...stressConfig, type: 'particle_heavy' })}
                  className={`p-2 rounded-lg border text-left font-mono transition cursor-pointer ${
                    stressConfig.type === 'particle_heavy'
                      ? 'bg-slate-800 text-slate-100 border-rose-500/60'
                      : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  <div className="font-bold">Particle Heavy</div>
                  <div className="text-[10px] text-slate-500">400+ partículas activas</div>
                </button>
              </div>

              {stressResult && (
                <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-xs font-mono space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Resultado Stress ({stressResult.config.tier} ents):</span>
                    <span
                      className={`font-bold ${
                        stressResult.passed ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {stressResult.passed ? 'SUPERADO' : 'CUELLO DETECTADO'}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center pt-1 border-t border-slate-900">
                    <div>
                      <div className="text-[10px] text-slate-500">FPS Mínimo</div>
                      <div className="font-bold text-rose-400">{stressResult.minFps}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500">FPS Medio</div>
                      <div className="font-bold text-slate-200">{stressResult.avgFps}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500">Frame Time Máx</div>
                      <div className="font-bold text-amber-400">{stressResult.maxFrameTimeMs} ms</div>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={handleRunStress}
                disabled={isStressRunning}
                className="w-full py-2.5 bg-rose-600/90 hover:bg-rose-500 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-rose-900/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Play className="w-4 h-4" />
                <span>{isStressRunning ? 'Ejecutando Test de Estrés...' : `Lanzar Stress Test (${stressConfig.tier} Entidades)`}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
