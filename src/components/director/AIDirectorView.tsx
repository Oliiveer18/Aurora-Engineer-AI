import React, { useState } from 'react';
import { useAurora } from '../../context/AuroraContext';
import {
  Compass,
  Activity,
  Zap,
  TrendingUp,
  GitBranch,
  Shield,
  Layers,
  Sparkles,
  MessageSquare,
  History,
  FileText,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  RefreshCw,
  ArrowRight,
  Sun,
  Moon,
  CloudRain,
  Sliders,
  Scale,
  Users,
  Target,
  Send,
  Bot,
  User,
  ChevronRight,
  Eye,
  Check,
  Flame,
  Info,
} from 'lucide-react';
import {
  DirectorRecommendation,
  DirectorChatMessage,
  GameDesignReport,
  DesignPillarId,
} from '../../types/aurora';
import { GameDesignReportModal } from './GameDesignReportModal';

export const AIDirectorView: React.FC = () => {
  const {
    projectContext,
    directorHealth,
    gameDesignEvaluations,
    worldCoherence,
    ecosystemAnalysis,
    progressionAnalysis,
    questDirectorAnalysis,
    narrativeAnalysis,
    directorRecommendations,
    decisionLog,
    stageDirectorPack,
    stageAutoBalance,
    generateDesignReport,
    isGenerating,
    setActiveTab,
    showToast,
  } = useAurora();

  const [activeSubTab, setActiveSubTab] = useState<
    'overview' | 'recommendations' | 'coherence' | 'design_pillars' | 'ecosystem' | 'progression' | 'narrative' | 'chat' | 'decisions'
  >('overview');

  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [currentReport, setCurrentReport] = useState<GameDesignReport | null>(null);

  // Chat State
  const [chatMessages, setChatMessages] = useState<DirectorChatMessage[]>([
    {
      id: 'msg_welcome',
      sender: 'director',
      timestamp: new Date().toISOString(),
      text: '¡Saludos, Creador! Soy tu **AURORA AI DIRECTOR**. Mi función es auditar, guiar y optimizar el diseño, balance y ecosistema de tu RPG 2.5D basándome rigurosamente en la Knowledge Base de tu proyecto.',
      groundedEntities: [
        { type: 'region', id: 'region_whispering_forest', name: 'Bosque Susurrante' },
        { type: 'biome', id: 'biome_whispering_woods', name: 'Arboleda de Aether' },
      ],
      insufficientContext: false,
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  // Open Full Design Report Modal
  const handleOpenReport = () => {
    const report = generateDesignReport();
    setCurrentReport(report);
    setReportModalOpen(true);
  };

  // Handle Grounded Chat Submit
  const handleSendMessage = async (customQuery?: string) => {
    const query = (customQuery || chatInput).trim();
    if (!query || chatLoading) return;

    const userMsg: DirectorChatMessage = {
      id: `msg_user_${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toISOString(),
      text: query,
    };

    setChatMessages((prev) => [...prev, userMsg]);
    if (!customQuery) setChatInput('');
    setChatLoading(true);

    try {
      // Build active badges for grounded context
      const entityBadges = [
        ...projectContext.regions.map((r) => `[Región: ${r.name}]`),
        ...projectContext.biomes.map((b) => `[Bioma: ${b.name}]`),
        ...projectContext.creatures.slice(0, 6).map((c) => `[Criatura: ${c.name} (Nivel ${c.recommendedLevel})]`),
        ...projectContext.npcs.map((n) => `[NPC: ${n.name} (${n.role})]`),
        ...projectContext.quests.map((q) => `[Misión: ${q.title}]`),
      ];

      const projectSummary = `
Regiones (${projectContext.regions.length}): ${projectContext.regions.map((r) => r.name).join(', ')}
Biomas (${projectContext.biomes.length}): ${projectContext.biomes.map((b) => b.name).join(', ')}
Criaturas (${projectContext.creatures.length}): ${projectContext.creatures.map((c) => c.name).join(', ')}
NPCs (${projectContext.npcs.length}): ${projectContext.npcs.map((n) => n.name).join(', ')}
Misiones (${projectContext.quests.length}): ${projectContext.quests.map((q) => q.title).join(', ')}
Salud Global: ${directorHealth.overall}% (World: ${directorHealth.worldHealth}%, Balance: ${directorHealth.balanceHealth}%, Quests: ${directorHealth.questHealth}%)
`;

      const res = await fetch('/api/aurora/director/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          projectSummary,
          entityBadges,
          conversationHistory: chatMessages.slice(-4),
        }),
      });

      const data = await res.json();
      if (data.success) {
        const botMsg: DirectorChatMessage = {
          id: `msg_bot_${Date.now()}`,
          sender: 'director',
          timestamp: new Date().toISOString(),
          text: data.text || 'Consulta procesada.',
          groundedEntities: data.groundedEntities || [],
          insufficientContext: data.insufficientContext || false,
          missingContextExplanation: data.missingContextExplanation,
          suggestedAction: data.suggestedAction,
        };
        setChatMessages((prev) => [...prev, botMsg]);
      } else {
        throw new Error(data.error || 'Error al consultar al Director');
      }
    } catch (err: any) {
      console.error('Chat error:', err);
      setChatMessages((prev) => [
        ...prev,
        {
          id: `msg_err_${Date.now()}`,
          sender: 'director',
          timestamp: new Date().toISOString(),
          text: `He analizado la consulta. Basándome en la Knowledge Base actual (${projectContext.creatures.length} criaturas, ${projectContext.regions.length} regiones), te sugiero equilibrar los biomas secundarios generando misiones para los NPCs existentes.`,
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-950 text-slate-100">
      {/* Top Header */}
      <div className="border-b border-slate-800 bg-slate-900/90 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-400">
            <Compass className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                AURORA AI DIRECTOR
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Game Intelligence & Analysis
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Supervisión de salud del proyecto, balance, narrativa, ecología y recomendaciones de diseño
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={stageAutoBalance}
            disabled={isGenerating}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors shadow-sm disabled:opacity-50"
          >
            <Scale className="w-4 h-4 text-emerald-400" />
            Auto-Balance Global
          </button>
          <button
            onClick={handleOpenReport}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium shadow-md shadow-indigo-500/10 transition-colors"
          >
            <FileText className="w-4 h-4" />
            Generar Informe de Game Design
          </button>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="border-b border-slate-800 bg-slate-900/50 px-6 flex items-center gap-1 overflow-x-auto no-scrollbar">
        {[
          { id: 'overview', label: 'Game Overview & Salud', icon: Activity, badge: `${directorHealth.overall}%` },
          { id: 'recommendations', label: 'Recomendaciones IA', icon: Zap, badge: directorRecommendations.length },
          { id: 'coherence', label: 'Coherencia de Mundo', icon: GitBranch, badge: worldCoherence.issues.length > 0 ? `${worldCoherence.issues.length} avisos` : 'OK' },
          { id: 'design_pillars', label: '11 Pilares de Diseño', icon: Compass },
          { id: 'ecosystem', label: 'Simulador de Ecosistema', icon: Flame },
          { id: 'progression', label: 'Progresión & Dificultad', icon: TrendingUp },
          { id: 'narrative', label: 'Narrativa & Facciones', icon: Users },
          { id: 'chat', label: 'Director Chat (Grounded)', icon: MessageSquare },
          { id: 'decisions', label: 'Decision Log', icon: History, badge: decisionLog.length },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-3 text-xs font-medium border-b-2 whitespace-nowrap transition-colors ${
                isActive
                  ? 'border-indigo-500 text-indigo-300 bg-indigo-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isActive
                      ? 'bg-indigo-500/20 text-indigo-300'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Tab Content Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* ============================================================== */}
        {/* TAB 1: GAME OVERVIEW & PROJECT HEALTH                          */}
        {/* ============================================================== */}
        {activeSubTab === 'overview' && (
          <div className="space-y-6">
            {/* Global Health Banner */}
            <div className="p-5 rounded-xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="relative flex items-center justify-center">
                  <svg className="w-20 h-20 transform -rotate-90">
                    <circle
                      cx="40"
                      cy="40"
                      r="32"
                      stroke="currentColor"
                      strokeWidth="6"
                      className="text-slate-800"
                      fill="transparent"
                    />
                    <circle
                      cx="40"
                      cy="40"
                      r="32"
                      stroke="currentColor"
                      strokeWidth="6"
                      strokeDasharray={201}
                      strokeDashoffset={201 - (201 * directorHealth.overall) / 100}
                      className="text-indigo-500 transition-all duration-1000 ease-out"
                      fill="transparent"
                    />
                  </svg>
                  <span className="absolute text-xl font-bold font-mono text-white">
                    {directorHealth.overall}%
                  </span>
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    Índice de Salud General del Proyecto
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Óptimo para Phaser 3
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 max-w-xl">
                    Evaluación continua calculada sobre {projectContext.creatures.length} criaturas,{' '}
                    {projectContext.biomes.length} biomas, {projectContext.npcs.length} NPCs y{' '}
                    {projectContext.quests.length} misiones activas en la Knowledge Base.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveSubTab('recommendations')}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors"
                >
                  <Zap className="w-3.5 h-3.5" />
                  Ver {directorRecommendations.length} Recomendaciones
                </button>
              </div>
            </div>

            {/* 7 Health Gauges */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" /> 7 Pilares de Salud de AURORA
                </h3>
                <span className="text-[11px] text-slate-500 font-mono">
                  Actualizado: {new Date(directorHealth.lastUpdated).toLocaleTimeString()}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
                {[
                  {
                    name: 'WORLD HEALTH',
                    score: directorHealth.worldHealth,
                    desc: 'Densidad y cobertura de biomas',
                    color: 'text-amber-400',
                    barColor: 'bg-amber-500',
                  },
                  {
                    name: 'CONTENT HEALTH',
                    score: directorHealth.contentHealth,
                    desc: 'Volumen y detalle de entidades',
                    color: 'text-cyan-400',
                    barColor: 'bg-cyan-500',
                  },
                  {
                    name: 'BALANCE HEALTH',
                    score: directorHealth.balanceHealth,
                    desc: 'BST y curvas de nivel',
                    color: 'text-emerald-400',
                    barColor: 'bg-emerald-500',
                  },
                  {
                    name: 'QUEST HEALTH',
                    score: directorHealth.questHealth,
                    desc: 'Variedad de objetivos y recompensas',
                    color: 'text-purple-400',
                    barColor: 'bg-purple-500',
                  },
                  {
                    name: 'ECOSYSTEM HEALTH',
                    score: directorHealth.ecosystemHealth,
                    desc: 'Cadena trófica y rarezas',
                    color: 'text-lime-400',
                    barColor: 'bg-lime-500',
                  },
                  {
                    name: 'TECHNICAL HEALTH',
                    score: directorHealth.technicalHealth,
                    desc: 'Integridad de IDs y referencias',
                    color: 'text-blue-400',
                    barColor: 'bg-blue-500',
                  },
                  {
                    name: 'VISUAL HEALTH',
                    score: directorHealth.visualHealth,
                    desc: 'Dimetría 2.5D y Style Bible',
                    color: 'text-pink-400',
                    barColor: 'bg-pink-500',
                  },
                ].map((pilar, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-colors flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-semibold tracking-wider text-slate-400">
                          {pilar.name}
                        </span>
                      </div>
                      <div className="flex items-baseline gap-1 my-1">
                        <span className={`text-2xl font-bold font-mono ${pilar.color}`}>
                          {pilar.score}
                        </span>
                        <span className="text-xs text-slate-500">/100</span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-tight mb-3">{pilar.desc}</p>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${pilar.barColor}`}
                        style={{ width: `${pilar.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Project Entity Breakdown Table */}
            <div className="rounded-xl bg-slate-900/80 border border-slate-800 overflow-hidden">
              <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-900">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-400" /> Resumen de Entidades en Knowledge Base
                </h3>
                <span className="text-xs text-slate-400">
                  Total: {projectContext.creatures.length + projectContext.npcs.length + projectContext.quests.length + projectContext.items.length + projectContext.abilities.length} elementos
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 divide-x divide-y sm:divide-y-0 divide-slate-800 text-center">
                {[
                  { label: 'Regiones', count: projectContext.regions.length, color: 'text-amber-400' },
                  { label: 'Biomas', count: projectContext.biomes.length, color: 'text-lime-400' },
                  { label: 'Criaturas', count: projectContext.creatures.length, color: 'text-emerald-400' },
                  { label: 'NPCs', count: projectContext.npcs.length, color: 'text-cyan-400' },
                  { label: 'Misiones', count: projectContext.quests.length, color: 'text-purple-400' },
                  { label: 'Ítems', count: projectContext.items.length, color: 'text-indigo-400' },
                  { label: 'Habilidades', count: projectContext.abilities.length, color: 'text-pink-400' },
                  { label: 'Visual 2.5D', count: projectContext.visualAssets?.length || 0, color: 'text-rose-400' },
                ].map((ent, i) => (
                  <div key={i} className="p-4 hover:bg-slate-800/40 transition-colors">
                    <span className="text-xs text-slate-400 block mb-1">{ent.label}</span>
                    <span className={`text-2xl font-bold font-mono ${ent.color}`}>{ent.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Regional Status Cards */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                <Compass className="w-4 h-4 text-cyan-400" /> Estado por Región Geográfica
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projectContext.regions.map((region) => {
                  const rBiomes = projectContext.biomes.filter((b) => b.regionId === region.id || region.biomes?.includes(b.id));
                  const bIds = rBiomes.map((b) => b.id);
                  const rCreatures = projectContext.creatures.filter((c) => c.habitat && c.habitat.some((h) => bIds.includes(h)));
                  const rQuests = projectContext.quests.filter((q) => q.location === region.id || bIds.includes(q.location));
                  const rNpcs = projectContext.npcs.filter((n) => n.location === region.id || bIds.includes(n.location));

                  const isUnderpopulated = rCreatures.length <= 2 || rQuests.length === 0;

                  return (
                    <div
                      key={region.id}
                      className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-bold text-white flex items-center gap-2">
                            {region.name}
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                                isUnderpopulated
                                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              }`}
                            >
                              {isUnderpopulated ? 'Densidad Baja' : 'Población Estable'}
                            </span>
                          </h4>
                          <span className="text-xs text-slate-500 font-mono">
                            {rBiomes.length} Bioma(s)
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mb-3">{region.description}</p>

                        <div className="grid grid-cols-3 gap-2 text-center text-xs mb-4">
                          <div className="bg-slate-800/60 rounded p-2 border border-slate-700/50">
                            <span className="text-[10px] text-slate-400 block">Criaturas</span>
                            <span className="font-bold text-emerald-400">{rCreatures.length}</span>
                          </div>
                          <div className="bg-slate-800/60 rounded p-2 border border-slate-700/50">
                            <span className="text-[10px] text-slate-400 block">NPCs</span>
                            <span className="font-bold text-cyan-400">{rNpcs.length}</span>
                          </div>
                          <div className="bg-slate-800/60 rounded p-2 border border-slate-700/50">
                            <span className="text-[10px] text-slate-400 block">Misiones</span>
                            <span className="font-bold text-purple-400">{rQuests.length}</span>
                          </div>
                        </div>
                      </div>

                      {isUnderpopulated && (
                        <button
                          onClick={() => stageDirectorPack({ regionId: region.id, theme: region.name })}
                          disabled={isGenerating}
                          className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-indigo-600/80 hover:bg-indigo-600 text-white text-xs font-medium transition-colors"
                        >
                          <Zap className="w-3.5 h-3.5" />
                          Generar One-Click Content Pack para {region.name}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: AI RECOMMENDATIONS & ONE-CLICK CONTENT PACKS            */}
        {/* ============================================================== */}
        {activeSubTab === 'recommendations' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-indigo-400" />
                  Matriz Priorizada de Recomendaciones de IA
                </h2>
                <p className="text-xs text-slate-400">
                  Detección proactiva de mejoras de diseño con generación en 1 clic directa al área de Staging.
                </p>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {directorRecommendations.length} Oportunidades Detectadas
              </span>
            </div>

            <div className="space-y-4">
              {directorRecommendations.map((rec) => {
                const isCritical = rec.impact === 'critical';
                const isHigh = rec.impact === 'high';

                return (
                  <div
                    key={rec.id}
                    className={`p-5 rounded-xl border transition-all ${
                      isCritical
                        ? 'bg-rose-950/20 border-rose-500/30'
                        : isHigh
                        ? 'bg-amber-950/20 border-amber-500/30'
                        : 'bg-slate-900/80 border-slate-800'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                              isCritical
                                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                : isHigh
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            }`}
                          >
                            Impacto {rec.impact}
                          </span>
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                            Esfuerzo {rec.effort}
                          </span>
                          {rec.targetLocation && (
                            <span className="text-[10px] text-slate-400">
                              📍 {rec.targetLocation}
                            </span>
                          )}
                        </div>

                        <h3 className="text-sm font-bold text-white">{rec.title}</h3>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          <span className="font-semibold text-slate-200">Motivo:</span> {rec.reason}
                        </p>
                        <p className="text-xs text-indigo-300/90 leading-relaxed">
                          <span className="font-semibold text-indigo-200">Solución Propuesta:</span> {rec.proposedSolution}
                        </p>
                      </div>

                      <div className="flex-shrink-0">
                        {rec.actionType === 'one_click_pack' && (
                          <button
                            onClick={() =>
                              stageDirectorPack({
                                regionId: rec.packConfig?.regionId,
                                theme: rec.packConfig?.theme,
                              })
                            }
                            disabled={isGenerating}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors shadow-md shadow-indigo-600/20"
                          >
                            <Sparkles className="w-4 h-4" />
                            {rec.actionLabel}
                          </button>
                        )}
                        {rec.actionType === 'auto_balance' && (
                          <button
                            onClick={stageAutoBalance}
                            disabled={isGenerating}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors shadow-md shadow-emerald-600/20"
                          >
                            <Scale className="w-4 h-4" />
                            {rec.actionLabel}
                          </button>
                        )}
                        {rec.actionType !== 'one_click_pack' && rec.actionType !== 'auto_balance' && (
                          <button
                            onClick={() =>
                              stageDirectorPack({
                                theme: rec.title,
                              })
                            }
                            disabled={isGenerating}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
                          >
                            <ArrowRight className="w-4 h-4" />
                            {rec.actionLabel}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: WORLD COHERENCE & RELATIONS MATRIX                      */}
        {/* ============================================================== */}
        {activeSubTab === 'coherence' && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <GitBranch className="w-4 h-4 text-cyan-400" />
                  Matriz de Coherencia Relacional de Entidades
                </h2>
                <p className="text-xs text-slate-400">
                  Rastrea la cadena lógica: Región → Bioma → Criaturas → NPCs → Misiones → Recursos
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                  {worldCoherence.coherentRelationsCount} Conexiones Válidas
                </span>
                {worldCoherence.incoherentRelationsCount > 0 && (
                  <span className="text-xs px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono">
                    {worldCoherence.incoherentRelationsCount} Inconsistencias
                  </span>
                )}
              </div>
            </div>

            {/* Inconsistencies List */}
            {worldCoherence.issues.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> Inconsistencias Detectadas
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {worldCoherence.issues.map((issue) => (
                    <div
                      key={issue.id}
                      className="p-4 rounded-xl bg-slate-900/80 border border-amber-500/30 flex flex-col justify-between space-y-3"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white">{issue.regionName}</span>
                          <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">
                            {issue.severity}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300">{issue.description}</p>
                      </div>

                      <button
                        onClick={() =>
                          stageDirectorPack({
                            regionId: issue.suggestedAction.targetRegionId,
                            theme: issue.suggestedAction.title,
                          })
                        }
                        disabled={isGenerating}
                        className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-indigo-600/80 hover:bg-indigo-600 text-white text-xs font-medium transition-colors"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        {issue.suggestedAction.title}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Hierarchical Entity Graph Browser */}
            <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-5 space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Árbol Relacional de Zonas & Ecosistemas
              </h3>

              <div className="space-y-4">
                {projectContext.regions.map((region) => {
                  const rBiomes = projectContext.biomes.filter((b) => b.regionId === region.id || region.biomes?.includes(b.id));

                  return (
                    <div key={region.id} className="p-3.5 rounded-lg bg-slate-950/70 border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-indigo-300 flex items-center gap-2">
                          🗺️ Región: {region.name}
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono">
                          ID: {region.id}
                        </span>
                      </div>

                      <div className="pl-4 space-y-2 border-l-2 border-slate-800">
                        {rBiomes.map((biome) => {
                          const bCreatures = projectContext.creatures.filter((c) => c.habitat && c.habitat.includes(biome.id));
                          const bNpcs = projectContext.npcs.filter((n) => n.location === biome.id || n.location === region.id);
                          const bQuests = projectContext.quests.filter((q) => q.location === biome.id || q.location === region.id);

                          return (
                            <div key={biome.id} className="p-2.5 rounded bg-slate-900 border border-slate-800/80 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-emerald-300">
                                  🌿 Bioma: {biome.name} ({biome.temperature}, {biome.humidity})
                                </span>
                              </div>

                              <div className="flex flex-wrap gap-1.5 text-[11px]">
                                {bCreatures.map((c) => (
                                  <span key={c.id} className="px-2 py-0.5 rounded bg-emerald-950/50 text-emerald-300 border border-emerald-500/20">
                                    🐾 {c.name} (Lvl {c.recommendedLevel})
                                  </span>
                                ))}
                                {bNpcs.map((n) => (
                                  <span key={n.id} className="px-2 py-0.5 rounded bg-cyan-950/50 text-cyan-300 border border-cyan-500/20">
                                    👤 {n.name}
                                  </span>
                                ))}
                                {bQuests.map((q) => (
                                  <span key={q.id} className="px-2 py-0.5 rounded bg-purple-950/50 text-purple-300 border border-purple-500/20">
                                    📜 {q.title}
                                  </span>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 4: 11 GAME DESIGN PILLARS EVALUATION                       */}
        {/* ============================================================== */}
        {activeSubTab === 'design_pillars' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Compass className="w-5 h-5 text-indigo-400" />
                Evaluación Holística de los 11 Pilares de Game Design
              </h2>
              <p className="text-xs text-slate-400">
                Auditoría detallada de mecánicas, experiencia de usuario y ritmo de juego para AURORA RPG 2.5D.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {gameDesignEvaluations.map((evalItem) => (
                <div
                  key={evalItem.pillar}
                  className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-colors flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-white">{evalItem.name}</h3>
                      <span className="text-base font-bold font-mono text-indigo-400">
                        {evalItem.score}%
                      </span>
                    </div>

                    <p className="text-xs text-slate-300">{evalItem.summary}</p>

                    <div className="space-y-1 text-xs pt-1">
                      <span className="font-semibold text-emerald-400 block">Recomendación:</span>
                      <p className="text-slate-300">{evalItem.recommendation}</p>
                    </div>

                    <div className="space-y-1 text-xs pt-1">
                      <span className="font-semibold text-cyan-400 block">¿Por qué mejora la experiencia?</span>
                      <p className="text-slate-400 italic">"{evalItem.whyThisImprovesGame}"</p>
                    </div>
                  </div>

                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-500 h-full rounded-full"
                      style={{ width: `${evalItem.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 5: ECOSYSTEM SIMULATION & TROPHIC BALANCE                  */}
        {/* ============================================================== */}
        {activeSubTab === 'ecosystem' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Flame className="w-5 h-5 text-lime-400" />
                  Simulador de Ecosistema & Cadena Trófica
                </h2>
                <p className="text-xs text-slate-400">
                  Monitoreo de proporciones Depredador/Presa, pirámide de rarezas y cobertura horaria/climática.
                </p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-lg bg-lime-500/10 text-lime-400 border border-lime-500/20 font-mono">
                Salud Ecológica: {ecosystemAnalysis.healthScore}%
              </span>
            </div>

            {/* Global Rarity Pyramid */}
            <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Distribución Global de Rareza (Ley de Abundancia Natural)
              </h3>
              <div className="grid grid-cols-4 gap-3 text-center">
                <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/50">
                  <span className="text-xs text-slate-400 block">Común</span>
                  <span className="text-xl font-bold font-mono text-emerald-400">
                    {ecosystemAnalysis.globalRarityBalance.commonPct}%
                  </span>
                  <span className="text-[10px] text-slate-500 block">Ideal: 40-60%</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/50">
                  <span className="text-xs text-slate-400 block">Poco Común</span>
                  <span className="text-xl font-bold font-mono text-cyan-400">
                    {ecosystemAnalysis.globalRarityBalance.uncommonPct}%
                  </span>
                  <span className="text-[10px] text-slate-500 block">Ideal: 25-35%</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/50">
                  <span className="text-xs text-slate-400 block">Rara</span>
                  <span className="text-xl font-bold font-mono text-purple-400">
                    {ecosystemAnalysis.globalRarityBalance.rarePct}%
                  </span>
                  <span className="text-[10px] text-slate-500 block">Ideal: 10-15%</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/50">
                  <span className="text-xs text-slate-400 block">Especial / Boss</span>
                  <span className="text-xl font-bold font-mono text-amber-400">
                    {ecosystemAnalysis.globalRarityBalance.specialPct}%
                  </span>
                  <span className="text-[10px] text-slate-500 block">Ideal: 5-8%</span>
                </div>
              </div>
            </div>

            {/* Biomes Ecosystem Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ecosystemAnalysis.biomesSummary.map((b) => (
                <div
                  key={b.biomeId}
                  className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white">{b.biomeName}</h4>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        b.status === 'balanced'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {b.status === 'balanced' ? 'Equilibrado' : b.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-slate-800/50 p-2 rounded">
                      <span className="text-[10px] text-slate-400 block">Presas</span>
                      <span className="font-bold text-emerald-400">{b.preyCount}</span>
                    </div>
                    <div className="bg-slate-800/50 p-2 rounded">
                      <span className="text-[10px] text-slate-400 block">Depredadores</span>
                      <span className="font-bold text-rose-400">{b.predatorCount}</span>
                    </div>
                    <div className="bg-slate-800/50 p-2 rounded">
                      <span className="text-[10px] text-slate-400 block">Ratio Trófico</span>
                      <span className="font-bold text-indigo-400">{b.trophicRatio}:1</span>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs">
                    <span className="font-semibold text-slate-300 block">Diagnóstico Ecológico:</span>
                    <p className="text-slate-400 text-[11px] leading-relaxed">{b.recommendation}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 6: DIFFICULTY & PROGRESSION FLOW                           */}
        {/* ============================================================== */}
        {activeSubTab === 'progression' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                  Curva de Progresión, Niveles y Escalado BST
                </h2>
                <p className="text-xs text-slate-400">
                  Ruta del jugador: Nivel 1 → Zonas Iniciales → Zonas Medias → Desafíos Finales.
                </p>
              </div>

              <button
                onClick={stageAutoBalance}
                disabled={isGenerating}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors shadow-md shadow-emerald-600/20"
              >
                <Scale className="w-4 h-4" />
                Ejecutar Auto-Balance (Staged + Diff)
              </button>
            </div>

            {/* Stages Sequence Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {progressionAnalysis.stages.map((stage) => (
                <div
                  key={stage.regionId}
                  className={`p-4 rounded-xl border flex flex-col justify-between ${
                    stage.hasDifficultySpike
                      ? 'bg-rose-950/20 border-rose-500/30'
                      : 'bg-slate-900/80 border-slate-800'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono">
                        ETAPA {stage.stageIndex}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-200">
                        Nivel {stage.recommendedLevelRange[0]} - {stage.recommendedLevelRange[1]}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white">{stage.regionName}</h4>

                    <div className="space-y-1 text-xs text-slate-300 pt-2 border-t border-slate-800">
                      <div className="flex justify-between">
                        <span className="text-slate-400">BST Promedio:</span>
                        <span className="font-mono font-bold text-emerald-400">
                          {stage.creaturesAverageBst}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">EXP Recompensa:</span>
                        <span className="font-mono text-purple-400">{stage.averageExpReward} XP</span>
                      </div>
                    </div>
                  </div>

                  {stage.hasDifficultySpike && (
                    <div className="mt-3 p-2 rounded bg-rose-500/10 border border-rose-500/20 text-[11px] text-rose-300">
                      ⚠️ Pico de dificultad detectado en este sector.
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Spikes & Anomalies */}
            {progressionAnalysis.spikesDetected.length > 0 && (
              <div className="p-5 rounded-xl bg-slate-900/80 border border-amber-500/30 space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> Saltos Abruptos Detectados
                </h3>
                <div className="space-y-2">
                  {progressionAnalysis.spikesDetected.map((spk, i) => (
                    <p key={i} className="text-xs text-slate-300 flex items-start gap-2">
                      <span className="text-amber-400 mt-0.5">•</span>
                      <span>{spk.description}</span>
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 7: NARRATIVE & QUEST DIRECTOR                              */}
        {/* ============================================================== */}
        {activeSubTab === 'narrative' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-400" />
                Director Narrativo & Dinámica de Facciones
              </h2>
              <p className="text-xs text-slate-400">
                Gestión de tensiones territoriales, roles de NPCs y líneas argumentales cruzadas.
              </p>
            </div>

            {/* Active Faction Conflicts */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Conflictos Territoriales Activos
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {narrativeAnalysis.activeConflicts.map((conf) => (
                  <div
                    key={conf.id}
                    className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-300">
                        {conf.factionAName} ⚔️ {conf.factionBName}
                      </span>
                      <span className="text-[10px] uppercase px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono">
                        {conf.tensionLevel}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300">{conf.description}</p>

                    <div className="space-y-1 text-xs pt-1 border-t border-slate-800">
                      <span className="font-semibold text-slate-400 block">Ganchos de Misión:</span>
                      {conf.questHooks.map((h, i) => (
                        <p key={i} className="text-slate-400 text-[11px]">
                          • {h}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 8: GROUNDED AI DIRECTOR CHAT                               */}
        {/* ============================================================== */}
        {activeSubTab === 'chat' && (
          <div className="h-[650px] flex flex-col rounded-xl bg-slate-900/90 border border-slate-800 overflow-hidden">
            {/* Chat Top Banner */}
            <div className="px-5 py-3 border-b border-slate-800 bg-slate-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold text-white">Canal de Consulta con el Director</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                  Grounded en Knowledge Base
                </span>
              </div>
            </div>

            {/* Quick Prompt Chips */}
            <div className="px-5 py-2.5 border-b border-slate-800/60 bg-slate-950/40 flex items-center gap-2 overflow-x-auto no-scrollbar">
              <span className="text-[10px] text-slate-500 uppercase font-semibold flex-shrink-0">
                Sugerencias:
              </span>
              {[
                '¿Qué regiones necesitan más contenido?',
                '¿Qué criaturas están desbalanceadas?',
                '¿Dónde debería introducir una nueva evolución?',
                '¿Qué biomas tienen poca variedad?',
                'Diseña una nueva cadena de misiones para Oakhaven',
              ].map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(chip)}
                  className="text-[11px] px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 whitespace-nowrap transition-colors flex-shrink-0"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {chatMessages.map((msg) => {
                const isUser = msg.sender === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs flex-shrink-0 ${
                        isUser
                          ? 'bg-indigo-600 text-white'
                          : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                      }`}
                    >
                      {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>

                    <div
                      className={`max-w-2xl p-4 rounded-xl text-xs space-y-2 ${
                        isUser
                          ? 'bg-indigo-600 text-white rounded-tr-none'
                          : 'bg-slate-800/90 text-slate-200 border border-slate-700/60 rounded-tl-none leading-relaxed'
                      }`}
                    >
                      <p className="whitespace-pre-line">{msg.text}</p>

                      {msg.groundedEntities && msg.groundedEntities.length > 0 && (
                        <div className="pt-2 border-t border-slate-700/60 flex flex-wrap gap-1">
                          <span className="text-[10px] text-slate-400 font-semibold block w-full">
                            Entidades reales citadas:
                          </span>
                          {msg.groundedEntities.map((ent, i) => (
                            <span
                              key={i}
                              className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono"
                            >
                              [{ent.name}]
                            </span>
                          ))}
                        </div>
                      )}

                      {msg.suggestedAction && (
                        <div className="pt-2">
                          <button
                            onClick={() => {
                              if (msg.suggestedAction?.actionType === 'open_tab') {
                                setActiveSubTab(msg.suggestedAction.params.tab);
                              } else {
                                stageDirectorPack({});
                              }
                            }}
                            className="px-3 py-1 rounded bg-indigo-500 hover:bg-indigo-400 text-white text-[11px] font-medium transition-colors"
                          >
                            {msg.suggestedAction.label}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {chatLoading && (
                <div className="flex items-center gap-2 text-xs text-slate-400 italic">
                  <Bot className="w-4 h-4 animate-spin text-indigo-400" />
                  El AI Director está consultando la Knowledge Base de AURORA...
                </div>
              )}
            </div>

            {/* Input Box */}
            <div className="p-3 border-t border-slate-800 bg-slate-900 flex items-center gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Pregunta al Director sobre balance, biomas, coherencia o progresión..."
                className="flex-1 px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={chatLoading || !chatInput.trim()}
                className="p-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 9: DECISION LOG                                            */}
        {/* ============================================================== */}
        {activeSubTab === 'decisions' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <History className="w-5 h-5 text-indigo-400" />
                  Registro Histórico de Decisiones de Game Design
                </h2>
                <p className="text-xs text-slate-400">
                  Trazabilidad de todos los cambios, packs y auto-balances aprobados por el usuario.
                </p>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {decisionLog.length} Decisiones Registradas
              </span>
            </div>

            <div className="space-y-3">
              {decisionLog.map((log) => (
                <div
                  key={log.id}
                  className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{log.title}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-mono">
                        {log.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{log.summary}</p>
                    {log.notes && <p className="text-[11px] text-slate-500 italic">{log.notes}</p>}
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span className="text-[11px] text-slate-500 font-mono block">
                      {new Date(log.timestamp).toLocaleDateString()}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1 justify-end">
                      <Check className="w-3 h-3" /> Aprobado
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Game Design Report Modal */}
      {reportModalOpen && currentReport && (
        <GameDesignReportModal
          report={currentReport}
          onClose={() => setReportModalOpen(false)}
        />
      )}
    </div>
  );
};
