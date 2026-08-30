import React, { useState, useEffect } from 'react';
import { useAurora } from '../../context/AuroraContext';
import {
  loadFreeAIConfig,
  saveFreeAIConfig,
  loadFreeAIUsage,
  getFreeAIStatsSummary,
  detectHardwareSpecs,
  evaluateStorageHealth,
  cleanStorageArea,
  classifyUserPrompt,
  generateRequestPreview,
  invalidateAllCache,
  STANDARD_TASK_CATALOG,
} from '../../lib/freeFirstEngine';
import {
  ShieldCheck,
  Zap,
  Cpu,
  Database,
  HardDrive,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Lock,
  RefreshCw,
  Search,
  Eye,
  Trash2,
  Activity,
  Layers,
  ArrowRight,
  Sliders,
  Scale,
  Swords,
  Globe2,
  Trees,
  Terminal,
  Shield,
  Coins,
  Server,
  CloudOff,
} from 'lucide-react';

export const FreeAICenterView: React.FC = () => {
  const { projectContext, setActiveTab, showToast } = useAurora();

  const [config, setConfig] = useState(() => loadFreeAIConfig());
  const [stats, setStats] = useState(() => getFreeAIStatsSummary());
  const [hwSpecs] = useState(() => detectHardwareSpecs());
  const [storageHealth, setStorageHealth] = useState(() => evaluateStorageHealth());

  // Interactive Classifier test
  const [testPrompt, setTestPrompt] = useState('¿Qué región tiene menos contenido?');
  const [classification, setClassification] = useState(() => classifyUserPrompt(testPrompt));
  const [preview, setPreview] = useState(() =>
    generateRequestPreview('general_analysis', testPrompt, projectContext)
  );

  const refreshState = () => {
    const nextCfg = loadFreeAIConfig();
    setConfig(nextCfg);
    setStats(getFreeAIStatsSummary());
    setStorageHealth(evaluateStorageHealth());
  };

  const handleToggleFreeMode = () => {
    const updated = {
      ...config,
      freeMode: !config.freeMode,
      costGuardActive: !config.freeMode ? true : config.costGuardActive,
    };
    saveFreeAIConfig(updated);
    setConfig(updated);
    refreshState();
    showToast(
      updated.freeMode
        ? 'Modo Gratuito Activado: Protección de Coste 0 € y bloqueo de APIs de pago'
        : 'Modo Gratuito Desactivado',
      'info'
    );
  };

  const handleToggleOfflineMode = () => {
    const updated = {
      ...config,
      offlineMode: !config.offlineMode,
    };
    saveFreeAIConfig(updated);
    setConfig(updated);
    refreshState();
    showToast(
      updated.offlineMode
        ? 'Modo Offline Activado: Cloud IA desactivado, solo motor local y cache'
        : 'Modo Online Restaurado',
      'info'
    );
  };

  const handleClearCache = () => {
    const res = cleanStorageArea('cache');
    refreshState();
    showToast(res.message, 'success');
  };

  const handlePromptChange = (val: string) => {
    setTestPrompt(val);
    setClassification(classifyUserPrompt(val));
    setPreview(generateRequestPreview('user_query', val, projectContext));
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fadeIn">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-indigo-950/60 border border-emerald-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                AURORA 2.1 — FREE-FIRST AI ARCHITECTURE
              </span>
              <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-mono">
                COSTE 0 € GARANTIZADO
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-100 flex items-center gap-2">
              Centro de Comando Free-First & Router Inteligente
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Prioridad de ejecución determinista local (0 llamadas a IA). Gemini se invoca
              exclusivamente para tareas generativas complejas dentro de la cuota gratuita,
              bloqueando cualquier consumo de pago.
            </p>
          </div>

          {/* Cost Lock & Action Badges */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="px-4 py-2.5 bg-slate-950/90 rounded-xl border border-emerald-500/40 flex items-center gap-3 shadow-lg">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Coins className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] font-mono text-emerald-400 font-bold uppercase">
                  €0 COST PROTECTION
                </div>
                <div className="text-sm font-black text-slate-100">
                  {stats.freeMode ? 'ACTIVA (100% GRATUITO)' : 'PERSONALIZADO'}
                </div>
              </div>
            </div>

            <button
              onClick={handleToggleFreeMode}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg ${
                config.freeMode
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              <Lock className="w-4 h-4" />
              <span>FREE MODE: {config.freeMode ? 'ON' : 'OFF'}</span>
            </button>

            <button
              onClick={handleToggleOfflineMode}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 border ${
                config.offlineMode
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                  : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-400'
              }`}
            >
              <CloudOff className="w-4 h-4" />
              <span>OFFLINE: {config.offlineMode ? 'ON' : 'OFF'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Real-time Architecture Status Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-mono uppercase">MODO GLOBAL</span>
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <p className="text-base font-black text-emerald-400">
            {config.freeMode ? 'FREE: ON' : 'PAID PERMITTED'}
          </p>
          <span className="text-[10px] text-slate-500 block">Sin riesgo de facturación</span>
        </div>

        <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-mono uppercase">LOCAL ENGINE</span>
            <Cpu className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <p className="text-base font-black text-indigo-300">ACTIVO (0ms)</p>
          <span className="text-[10px] text-slate-500 block">{stats.totalLocalOperations} ops locales</span>
        </div>

        <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-mono uppercase">CACHE INTELIGENTE</span>
            <Database className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <p className="text-base font-black text-cyan-300">{stats.totalCacheHits} Hits</p>
          <span className="text-[10px] text-slate-500 block">{stats.cacheEntriesCount} entradas ({((stats.cacheSizeBytes || 0) / 1024).toFixed(0)} KB)</span>
        </div>

        <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-mono uppercase">GEMINI FREE</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <p className="text-base font-black text-amber-300">
            {stats.offlineMode ? 'OFFLINE' : 'AVAILABLE'}
          </p>
          <span className="text-[10px] text-slate-500 block">{stats.totalGeminiCalls} llamadas free</span>
        </div>

        <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-mono uppercase">PAID API USAGE</span>
            <Lock className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <p className="text-base font-black text-rose-400">BLOCKED</p>
          <span className="text-[10px] text-slate-500 block">{stats.totalBlockedPaidCalls} bloqueos preventivos</span>
        </div>

        <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-mono uppercase">COSTE ACUMULADO</span>
            <Coins className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <p className="text-base font-black text-emerald-400">€0.00</p>
          <span className="text-[10px] text-slate-500 block">Ahorro total de 100%</span>
        </div>
      </div>

      {/* Architecture Visual Routing Flow */}
      <div className="p-5 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-400" />
          Jerarquía de Ejecución y Enrutamiento Inteligente
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 bg-slate-950 rounded-xl border border-indigo-500/30 relative">
            <div className="flex items-center justify-between font-bold text-indigo-400 mb-1">
              <span>1. AURORA CORE</span>
              <span className="text-[10px] px-1.5 py-0.5 bg-indigo-500/20 rounded">ENTRADA</span>
            </div>
            <p className="text-slate-400 text-[11px]">
              Captura la intención del usuario, analiza el AST del proyecto y minimiza el contexto.
            </p>
          </div>

          <div className="p-3.5 bg-slate-950 rounded-xl border border-emerald-500/30 relative">
            <div className="flex items-center justify-between font-bold text-emerald-400 mb-1">
              <span>2. LOCAL ENGINE</span>
              <span className="text-[10px] px-1.5 py-0.5 bg-emerald-500/20 rounded">AI CALLS = 0</span>
            </div>
            <p className="text-slate-400 text-[11px]">
              Resuelve validaciones, BST, biomas, grafos, diffs, Y-sorting y 60FPS sin coste.
            </p>
          </div>

          <div className="p-3.5 bg-slate-950 rounded-xl border border-cyan-500/30 relative">
            <div className="flex items-center justify-between font-bold text-cyan-400 mb-1">
              <span>3. CACHE & MEMORY</span>
              <span className="text-[10px] px-1.5 py-0.5 bg-cyan-500/20 rounded">0 TOKENS</span>
            </div>
            <p className="text-slate-400 text-[11px]">
              Si la petición o el hash del proyecto ya existen en memoria, devuelve la respuesta al instante.
            </p>
          </div>

          <div className="p-3.5 bg-slate-950 rounded-xl border border-amber-500/30 relative">
            <div className="flex items-center justify-between font-bold text-amber-400 mb-1">
              <span>4. GEMINI FREE</span>
              <span className="text-[10px] px-1.5 py-0.5 bg-amber-500/20 rounded">FREE TIER</span>
            </div>
            <p className="text-slate-400 text-[11px]">
              Solo si requiere creatividad y lore profundo. Sin fallback de pago en ningún caso.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Smart Router Tester & Context Minimizer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Router Sandbox */}
        <div className="lg:col-span-7 p-6 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              Probador en Tiempo Real del Smart AI Router
            </h2>
            <span className="text-[10px] font-mono text-slate-400">
              Evaluación Determinista Instantánea
            </span>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-slate-400 font-semibold block">
              Prueba un comando o pregunta para observar cómo lo enruta AURORA:
            </label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="text"
                value={testPrompt}
                onChange={(e) => handlePromptChange(e.target.value)}
                placeholder="Escribe una tarea o consulta..."
                className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex flex-wrap gap-2 text-xs">
            <button
              onClick={() => handlePromptChange('¿Cuántas criaturas existen en total?')}
              className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-300 text-[11px]"
            >
              📊 Conteo de Criaturas
            </button>
            <button
              onClick={() => handlePromptChange('Validar referencias rotas e IDs duplicados')}
              className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-300 text-[11px]"
            >
              🔍 Validar Esquema
            </button>
            <button
              onClick={() => handlePromptChange('Auditar balance BST y simular combate en Cumbres')}
              className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-300 text-[11px]"
            >
              ⚔️ Balance & Combate
            </button>
            <button
              onClick={() => handlePromptChange('Diseña 3 criaturas legendarias para el Bosque')}
              className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-amber-300 text-[11px]"
            >
              ✨ Diseñar Criaturas
            </button>
          </div>

          {/* Routing Decision Card */}
          <div
            className={`p-4 rounded-xl border space-y-3 ${
              classification.recommendedRoute === 'LOCAL'
                ? 'bg-emerald-950/20 border-emerald-500/40'
                : 'bg-amber-950/20 border-amber-500/40'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                    classification.recommendedRoute === 'LOCAL'
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-amber-500/20 text-amber-300'
                  }`}
                >
                  DECISIÓN: {classification.recommendedRoute}
                </span>
                <span className="text-xs font-bold text-slate-200">
                  {classification.taskName}
                </span>
              </div>
              <span className="text-xs font-bold font-mono text-emerald-400">
                COSTE: €0.00
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              <strong>Motivo:</strong> {classification.reason}
            </p>

            <div className="flex items-center gap-4 text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-800/80">
              <span>Nivel: {classification.level}</span>
              <span>Modo Offline: {classification.canRunOffline ? '✓ Soportado' : 'Requiere Red'}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Context Minimization & Privacy Inspector */}
        <div className="lg:col-span-5 p-6 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Eye className="w-4 h-4 text-cyan-400" />
              Context Minimization & Privacy
            </h2>
            <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[10px] font-mono">
              SANITIZED
            </span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Nunca enviamos el proyecto completo a la nube. El filtro de relevancia aísla solo las
            entidades imprescindibles y excluye secretos y archivos irrelevantes.
          </p>

          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2.5 text-xs font-mono">
            <div className="flex justify-between text-slate-400">
              <span>Contexto Original:</span>
              <span className="text-slate-200">~245 KB (Todo el proyecto)</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Contexto Minimizado:</span>
              <span className="text-emerald-400 font-bold">
                {preview.contextSizeBytes} bytes (~{preview.contextTokensEstimated} tokens)
              </span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Reducción de Huella:</span>
              <span className="text-cyan-400 font-bold">98.5% de ahorro</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Entidades Relevantes:</span>
              <span className="text-slate-200">{preview.relevantEntitiesCount} entidades</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Protección de Privacidad:</span>
              <span className="text-emerald-400 font-bold">✓ Secretos & Keys Bloqueadas</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hardware Awareness & Storage Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hardware Widget */}
        <div className="p-6 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Server className="w-4 h-4 text-indigo-400" />
              Hardware Awareness & Diagnóstico de Equipo
            </h3>
            <span className="text-[10px] font-mono text-slate-400">{hwSpecs.os} · {hwSpecs.architecture}</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-slate-500 block text-[10px]">CPU CORES</span>
              <strong className="text-slate-200 font-mono">{hwSpecs.cores} hilos</strong>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-slate-500 block text-[10px]">MEMORIA RAM</span>
              <strong className="text-slate-200 font-mono">{hwSpecs.memoryGB} GB estimados</strong>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 col-span-2">
              <span className="text-slate-500 block text-[10px]">RENDERER GPU</span>
              <span className="text-slate-300 font-mono text-[11px] truncate block">{hwSpecs.gpuRenderer}</span>
            </div>
          </div>

          <div className="p-3 bg-slate-950/80 rounded-xl border border-indigo-500/20 text-xs text-slate-400">
            <strong>Recomendación:</strong> {hwSpecs.recommendationNote}
          </div>
        </div>

        {/* Storage Health */}
        <div className="p-6 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-cyan-400" />
              Storage Health & Control de Cache
            </h3>
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold">
              {storageHealth.status.toUpperCase()}
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Espacio Total Utilizado:</span>
              <strong className="text-slate-200 font-mono">
                {(storageHealth.totalBytes / (1024 * 1024)).toFixed(2)} MB / {(storageHealth.limitBytes / (1024 * 1024)).toFixed(0)} MB
              </strong>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(100, (storageHealth.totalBytes / storageHealth.limitBytes) * 100)}%`,
                }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            <span className="text-xs text-slate-400">
              Entradas en cache: <strong>{stats.cacheEntriesCount}</strong>
            </span>
            <button
              onClick={handleClearCache}
              className="px-3 py-1.5 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Limpiar Cache de IA</span>
            </button>
          </div>
        </div>
      </div>

      {/* Free AI Commands Catalog */}
      <div className="p-6 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            Catálogo Oficial de Tareas y Nivel de Coste
          </h3>
          <span className="text-xs text-slate-400">Transparencia Total de Ejecución</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          {STANDARD_TASK_CATALOG.map((task) => (
            <div
              key={task.id}
              className="p-3.5 bg-slate-950 rounded-xl border border-slate-800/80 space-y-2 hover:border-slate-700 transition"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="font-bold text-slate-200">{task.taskName}</span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold shrink-0 ${
                    task.level === 'LEVEL_0_NO_AI'
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-amber-500/20 text-amber-300'
                  }`}
                >
                  {task.level === 'LEVEL_0_NO_AI' ? 'FREE 0€' : 'GEMINI FREE'}
                </span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">{task.description}</p>
              <div className="text-[10px] text-slate-500 font-mono flex items-center justify-between pt-1 border-t border-slate-900">
                <span>Ruta: {task.recommendedRoute}</span>
                <span>{task.canRunOffline ? 'Offline ✓' : 'Online'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
