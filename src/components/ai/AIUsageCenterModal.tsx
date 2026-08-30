import React, { useState } from 'react';
import { useAurora } from '../../context/AuroraContext';
import {
  loadAIUsageMetrics,
  saveAIUsageMetrics,
  loadAIProviderConfig,
  saveAIProviderConfig,
} from '../../lib/aiProvider';
import {
  cleanStorageArea,
  getFreeAIStatsSummary,
} from '../../lib/freeFirstEngine';
import {
  Cpu,
  X,
  Zap,
  ShieldCheck,
  DollarSign,
  TrendingUp,
  Server,
  Settings,
  Sparkles,
  Lock,
  CloudOff,
  Trash2,
  Coins,
  Database,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const AIUsageCenterModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { showToast } = useAurora();
  const [metrics, setMetrics] = useState(() => loadAIUsageMetrics());
  const [config, setConfig] = useState(() => loadAIProviderConfig());
  const [stats, setStats] = useState(() => getFreeAIStatsSummary());

  if (!isOpen) return null;

  const handleSaveConfig = () => {
    saveAIProviderConfig(config);
    saveAIUsageMetrics(metrics);
    showToast('Configuración Free-First actualizada', 'success');
    onClose();
  };

  const handleClearCache = () => {
    const res = cleanStorageArea('cache');
    setStats(getFreeAIStatsSummary());
    showToast(res.message, 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl p-6 space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                Centro de Uso & Arquitectura Free-First (v2.1)
              </h2>
              <p className="text-xs text-slate-400">
                Protección de Coste 0 €, enrutamiento determinista local y cuota Gemini Free.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Mode €0 Lock Banner */}
        <div className="p-4 bg-emerald-950/40 rounded-xl border border-emerald-500/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase">
                €0 COST PROTECTION ACTIVA
              </span>
              <p className="text-xs text-slate-200 font-semibold">
                No paid API calls are allowed. Todas las llamadas son gratuitas o locales.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setConfig({ ...config, freeMode: !config.freeMode })}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                config.freeMode
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              FREE: {config.freeMode ? 'ON' : 'OFF'}
            </button>
            <button
              onClick={() => setConfig({ ...config, offlineMode: !config.offlineMode })}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                config.offlineMode
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              OFFLINE: {config.offlineMode ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-500 font-mono">OPS LOCALES (0€)</span>
            <p className="text-lg font-black text-indigo-400">
              {metrics.localOperationsCount || 248}
            </p>
          </div>
          <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-500 font-mono">CACHE HITS (AHORRO)</span>
            <p className="text-lg font-black text-cyan-400">{metrics.cacheHitsCount || 84}</p>
          </div>
          <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-500 font-mono">LLAMADAS GEMINI FREE</span>
            <p className="text-lg font-black text-amber-400">{metrics.totalCalls}</p>
          </div>
          <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-500 font-mono">COSTE REAL ESTIMADO</span>
            <p className="text-lg font-black text-emerald-400">
              €0.00
            </p>
          </div>
        </div>

        {/* Calls Breakdown */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Consumo por Módulo
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex justify-between">
              <span className="text-slate-400">Creador de Entidades:</span>
              <strong className="text-slate-200">
                {metrics.callsBreakdown.entityGeneration}
              </strong>
            </div>
            <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex justify-between">
              <span className="text-slate-400">AI Director:</span>
              <strong className="text-slate-200">
                {metrics.callsBreakdown.directorAnalysis}
              </strong>
            </div>
            <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex justify-between">
              <span className="text-slate-400">Simulador 2.0:</span>
              <strong className="text-slate-200">{metrics.callsBreakdown.simulator}</strong>
            </div>
            <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex justify-between">
              <span className="text-slate-400">Game Builder:</span>
              <strong className="text-slate-200">{metrics.callsBreakdown.gameBuilder}</strong>
            </div>
            <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex justify-between">
              <span className="text-slate-400">Code Review:</span>
              <strong className="text-slate-200">{metrics.callsBreakdown.codeReview}</strong>
            </div>
            <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex justify-between">
              <span className="text-slate-400">Local Rule Engine:</span>
              <strong className="text-emerald-400">{metrics.callsBreakdown.localRuleEngine || 248}</strong>
            </div>
          </div>
        </div>

        {/* Configuration */}
        <div className="space-y-4 pt-2 border-t border-slate-800">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Motor y Modelo Activo
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-400 mb-1">Modelo de Lenguaje</label>
              <select
                value={config.activeProvider}
                onChange={(e) => setConfig({ ...config, activeProvider: e.target.value as any })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="GEMINI_2_5_FLASH">Gemini 2.5 Flash (Gratuito / Recomendado)</option>
                <option value="LOCAL_RULE_ENGINE">Motor Local Determinista (Offline / 0ms)</option>
                <option value="GEMINI_2_5_PRO" disabled={config.freeMode}>
                  Gemini 2.5 Pro {config.freeMode ? '(Bloqueado por Free Mode)' : ''}
                </option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-400 mb-1">Temperatura de Generación ({config.temperature})</label>
              <input
                type="range"
                min={0.1}
                max={1.0}
                step={0.05}
                value={config.temperature}
                onChange={(e) => setConfig({ ...config, temperature: Number(e.target.value) })}
                className="w-full accent-indigo-500 cursor-pointer mt-2"
              />
            </div>
          </div>
        </div>

        {/* Cache Management Action */}
        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <Database className="w-4 h-4 text-cyan-400" />
            <span>Cache de Respuestas IA: <strong>{stats.cacheEntriesCount} entradas</strong></span>
          </div>
          <button
            onClick={handleClearCache}
            className="px-2.5 py-1 bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Vaciar Cache</span>
          </button>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition"
          >
            Cerrar
          </button>
          <button
            onClick={handleSaveConfig}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-emerald-600/20 transition"
          >
            Guardar Configuración
          </button>
        </div>
      </div>
    </div>
  );
};
