import React, { useState } from 'react';
import { useAurora } from '../context/AuroraContext';
import { AIUsageCenterModal } from './ai/AIUsageCenterModal';
import { PerformanceReportModal } from './profiler/PerformanceReportModal';
import { loadFreeAIUsage, loadFreeAIConfig } from '../lib/freeFirstEngine';
import {
  Sparkles,
  Download,
  Settings,
  Compass,
  Cpu,
  Layers,
  Search,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Brain,
  Rocket,
  ShieldCheck,
  Coins,
  FileText,
  Activity,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    setActiveTab,
    setActiveModal,
    projectContext,
    stagedPackage,
    showToast,
  } = useAurora();

  const [isUsageOpen, setIsUsageOpen] = useState(false);
  const [isPerformanceReportOpen, setIsPerformanceReportOpen] = useState(false);
  const [omnibarText, setOmnibarText] = useState('');
  const usage = loadFreeAIUsage();
  const config = loadFreeAIConfig();

  const handleOmnibarSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!omnibarText.trim()) return;

    const lower = omnibarText.toLowerCase();
    if (lower.includes('perfil') || lower.includes('profile') || lower.includes('fps') || lower.includes('telemetr')) {
      setActiveTab('live_profiler');
      showToast(`Despachando a Aurora Live Profiler 2.3 (0€): "${omnibarText}"`, 'success');
    } else if (
      lower.includes('cuello') ||
      lower.includes('bottleneck') ||
      lower.includes('maximum safe') ||
      lower.includes('sin cambiar nada visual') ||
      lower.includes('bosque susurrante') ||
      lower.includes('y-sort') ||
      lower.includes('optimi')
    ) {
      setActiveTab('verified_optimizer');
      showToast(`Iniciando Verified Optimizer (Visual Lock ON): "${omnibarText}"`, 'success');
    } else if (lower.includes('audit') || lower.includes('auditoria') || lower.includes('seguridad')) {
      setActiveTab('self_audit');
      showToast(`Despachando a Self-Audit 2.2 (0€): "${omnibarText}"`, 'success');
    } else if (lower.includes('mantenimiento') || lower.includes('clean') || lower.includes('limpieza') || lower.includes('storage')) {
      setActiveTab('system_maintenance');
      showToast(`Navegando a System Maintenance: "${omnibarText}"`, 'info');
    } else if (lower.includes('combate') || lower.includes('simul') || lower.includes('balance')) {
      setActiveTab('gameplay_simulator');
      showToast(`Despachando a Simulador 2.0 (0€): "${omnibarText}"`, 'info');
    } else if (lower.includes('regla') || lower.includes('norma')) {
      setActiveTab('design_rules');
      showToast(`Navegando a Motor de Reglas (0€): "${omnibarText}"`, 'info');
    } else if (lower.includes('free') || lower.includes('router') || lower.includes('coste')) {
      setActiveTab('free_ai_center');
      showToast(`Abriendo Centro Free-First AI: "${omnibarText}"`, 'success');
    } else if (lower.includes('memoria') || lower.includes('lore')) {
      setActiveTab('project_memory');
      showToast(`Navegando a Project Memory: "${omnibarText}"`, 'info');
    } else if (lower.includes('pack') || lower.includes('expansion')) {
      setActiveTab('production_packs');
      showToast(`Mostrando Production Packs para: "${omnibarText}"`, 'info');
    } else {
      setActiveTab('ai_builder');
      showToast(`Enviando objetivo a AI Game Builder: "${omnibarText}"`, 'success');
    }
    setOmnibarText('');
  };

  return (
    <>
      <header className="h-16 px-6 bg-slate-950/80 backdrop-blur border-b border-slate-800 flex items-center justify-between shrink-0 z-10 gap-4">
        {/* Left: Active Project Info */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-mono text-slate-300 font-semibold">
              AURORA <strong className="text-slate-100 font-bold">STUDIO 2.3</strong>
            </span>
            <span className="hidden sm:inline px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[9px] font-mono font-bold border border-purple-500/30">
              LIVE PROFILING & OPTIMIZATION
            </span>
          </div>

          <span className="text-slate-700 hidden lg:inline">|</span>

          <span className="text-xs font-mono text-slate-500 hidden xl:inline">
            {projectContext.regions.length} Regiones · {projectContext.biomes.length} Biomas · {projectContext.creatures.length} Criaturas
          </span>
        </div>

        {/* Center: Master Command / Omnibar */}
        <form
          onSubmit={handleOmnibarSubmit}
          className="flex-1 max-w-xl relative hidden md:block"
        >
          <Search className="w-3.5 h-3.5 absolute left-3.5 top-3 text-slate-500" />
          <input
            type="text"
            value={omnibarText}
            onChange={(e) => setOmnibarText(e.target.value)}
            placeholder="Comando Maestro: 'Perfila AURORA', 'Encuentra los mayores cuellos de botella', 'Optimiza Y-Sorting'..."
            className="w-full pl-9 pr-24 py-1.5 bg-slate-900/90 border border-slate-800 hover:border-slate-700 focus:border-indigo-500 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none transition shadow-inner"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1 px-2.5 py-1 bg-indigo-600/80 hover:bg-indigo-500 text-[10px] font-semibold text-white rounded-lg transition cursor-pointer"
          >
            Ejecutar
          </button>
        </form>

        {/* Right: Actions & Free AI Status */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Staging Area Pill */}
          {stagedPackage && (
            <button
              onClick={() => setActiveModal('diff_preview')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold rounded-lg animate-pulse transition cursor-pointer"
              title="Hay cambios listos para ser aprobados en Staging"
            >
              <Rocket className="w-3.5 h-3.5 text-amber-400" />
              <span>Staging ({stagedPackage.items.length})</span>
            </button>
          )}

          {/* Performance Report Quick Button */}
          <button
            onClick={() => setIsPerformanceReportOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-purple-950/60 hover:bg-purple-900/60 border border-purple-500/40 text-purple-300 text-xs font-medium rounded-lg transition cursor-pointer"
            title="Ver informe completo de rendimiento Aurora 2.3"
          >
            <FileText className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">Report 2.3</span>
          </button>

          {/* Live Profiler Quick Trigger */}
          <button
            onClick={() => setActiveTab('live_profiler')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-indigo-950/60 hover:bg-indigo-900/60 border border-indigo-500/40 text-indigo-300 text-xs font-medium rounded-lg transition cursor-pointer"
            title="Abrir Live Profiler en tiempo real"
          >
            <Activity className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Live Profiler</span>
          </button>

          {/* Free Mode Badge Button */}
          <button
            onClick={() => setActiveTab('free_ai_center')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold rounded-lg shadow-sm transition cursor-pointer"
            title="Centro Free-First AI — Coste 0 € Garantizado"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>€0.00 FREE</span>
          </button>

          {/* AI Game Builder Direct Trigger */}
          <button
            onClick={() => setActiveTab('ai_builder')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-indigo-500/20 transition cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Studio Builder</span>
          </button>

          <button
            onClick={() => setActiveTab('export')}
            className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-lg border border-slate-800 transition cursor-pointer"
            title="Exportar para Phaser 3"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={() => setActiveModal('settings')}
            className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-lg border border-slate-800 transition cursor-pointer"
            title="Ajustes del Proyecto"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* AI Usage Center Modal */}
      <AIUsageCenterModal
        isOpen={isUsageOpen}
        onClose={() => setIsUsageOpen(false)}
      />

      {/* Performance 2.3 Engineering Report Modal */}
      <PerformanceReportModal
        isOpen={isPerformanceReportOpen}
        onClose={() => setIsPerformanceReportOpen(false)}
      />
    </>
  );
};

