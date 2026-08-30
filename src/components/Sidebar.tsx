import React, { useState } from 'react';
import { useAurora } from '../context/AuroraContext';
import {
  LayoutDashboard,
  Sparkles,
  GitMerge,
  Layers,
  Edit3,
  Activity,
  ShieldCheck,
  Download,
  Settings,
  Compass,
  FileCode,
  ShieldAlert,
  FolderInput,
  History,
  ActivitySquare,
  Globe2,
  Palette,
  BookOpen,
  GitPullRequest,
  BrainCircuit,
  Brain,
  Scale,
  Swords,
  Trees,
  FlaskConical,
  Map,
  Boxes,
  Network,
  Code,
  Gauge,
  Zap,
  HardDrive,
  RefreshCw,
} from 'lucide-react';
import { ImportAuroraProjectModal } from './ImportAuroraProjectModal';
import { VersionHistoryDrawer } from './VersionHistoryDrawer';

export const Sidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    validationReport,
    visualQAReport,
    projectContext,
    setActiveModal,
    versionHistory,
    syncStatus,
  } = useAurora();

  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const totalEntities =
    projectContext.creatures.length +
    projectContext.npcs.length +
    projectContext.quests.length +
    projectContext.biomes.length +
    projectContext.items.length +
    projectContext.abilities.length;

  const totalVisualAssets = projectContext.visualAssets?.length || 0;

  const navSections = [
    {
      title: 'CORE STUDIO 2.3 (PROFILING & VERIFIED OPTIMIZE)',
      items: [
        { id: 'dashboard', label: 'Panel de Control', icon: LayoutDashboard },
        {
          id: 'live_profiler',
          label: 'Live Profiler 2.3',
          icon: Activity,
          highlight: true,
          badge: 'REAL METRICS',
          badgeColor: 'bg-emerald-500/20 text-emerald-300',
        },
        {
          id: 'verified_optimizer',
          label: 'Verified Optimizer',
          icon: Zap,
          highlight: true,
          badge: 'VISUAL LOCK',
          badgeColor: 'bg-purple-500/20 text-purple-300',
        },
        {
          id: 'self_audit',
          label: 'Self-Audit Engine',
          icon: ShieldCheck,
          badge: '0€ AUDIT',
          badgeColor: 'bg-indigo-500/20 text-indigo-300',
        },
        {
          id: 'auto_optimize',
          label: 'Auto-Optimize 2.2',
          icon: Zap,
          badge: 'SAFE',
          badgeColor: 'bg-purple-500/20 text-purple-300',
        },
        {
          id: 'system_maintenance',
          label: 'System Maintenance',
          icon: HardDrive,
          badge: 'CLEAN',
          badgeColor: 'bg-teal-500/20 text-teal-300',
        },
        {
          id: 'free_ai_center',
          label: 'Free-First AI Center',
          icon: ShieldCheck,
          badge: '0€ FREE',
          badgeColor: 'bg-emerald-500/20 text-emerald-300',
        },
        {
          id: 'ai_builder',
          label: 'AI Game Builder 2.0',
          icon: BrainCircuit,
          badge: 'PIPELINE',
          badgeColor: 'bg-indigo-500/20 text-indigo-300',
        },
        {
          id: 'ai_tasks',
          label: 'AI Task Agent',
          icon: Zap,
          badge: 'AGENT',
          badgeColor: 'bg-cyan-500/20 text-cyan-300',
        },
        {
          id: 'project_memory',
          label: 'Project Memory',
          icon: Brain,
          badge: 'MEM',
          badgeColor: 'bg-purple-500/20 text-purple-300',
        },
        {
          id: 'design_rules',
          label: 'Design Rules Engine',
          icon: Scale,
          badge: 'RULES',
          badgeColor: 'bg-amber-500/20 text-amber-300',
        },
        {
          id: 'gameplay_simulator',
          label: 'Simulador 2.0 (Combat)',
          icon: Swords,
          badge: 'SIM',
          badgeColor: 'bg-rose-500/20 text-rose-300',
        },
      ],
    },
    {
      title: 'WORLD & ECOSYSTEM',
      items: [
        {
          id: 'world_expansion',
          label: 'World Expansion (POIs)',
          icon: Globe2,
          badge: 'SEAMLESS',
          badgeColor: 'bg-teal-500/20 text-teal-300',
        },
        {
          id: 'ecosystem_studio',
          label: 'Ecosistema & Trófica',
          icon: Trees,
          badge: 'TROPHIC',
          badgeColor: 'bg-emerald-500/20 text-emerald-300',
        },
        {
          id: 'production_packs',
          label: 'Production Packs',
          icon: Boxes,
          badge: '1-CLICK',
          badgeColor: 'bg-orange-500/20 text-orange-300',
        },
        {
          id: 'ab_design_lab',
          label: 'A/B Design Lab',
          icon: FlaskConical,
          badge: 'LAB',
          badgeColor: 'bg-pink-500/20 text-pink-300',
        },
        {
          id: 'ai_roadmap',
          label: 'AI Roadmap & Matrix',
          icon: Map,
          badge: 'NOW/NEXT',
          badgeColor: 'bg-blue-500/20 text-blue-300',
        },
        {
          id: 'impact_graph',
          label: 'Change Impact Graph',
          icon: Network,
          badge: 'GRAPH',
          badgeColor: 'bg-violet-500/20 text-violet-300',
        },
      ],
    },
    {
      title: 'DEV & CURSOR SUITE',
      items: [
        {
          id: 'cursor_integration',
          label: 'Puente Cursor',
          icon: GitPullRequest,
          highlight: true,
          badge: syncStatus === 'SYNCED' ? 'SYNC' : 'PATCH',
          badgeColor:
            syncStatus === 'SYNCED'
              ? 'bg-emerald-500/20 text-emerald-300'
              : 'bg-cyan-500/20 text-cyan-300',
        },
        {
          id: 'developer_tools',
          label: 'AI Dev Tools & Debugger',
          icon: Code,
          badge: 'TESTS',
          badgeColor: 'bg-cyan-500/20 text-cyan-300',
        },
        {
          id: 'performance_ux',
          label: 'Performance & Radar UX',
          icon: Gauge,
          badge: '60FPS',
          badgeColor: 'bg-indigo-500/20 text-indigo-300',
        },
        {
          id: 'director',
          label: 'AI Director',
          icon: Compass,
          highlight: true,
          badge: 'DIRECTOR',
          badgeColor: 'bg-indigo-500/20 text-indigo-300',
        },
        {
          id: 'system_status',
          label: 'System Status & Audit',
          icon: ActivitySquare,
          badge: 'AUDIT',
          badgeColor: 'bg-emerald-500/20 text-emerald-300',
        },
      ],
    },
    {
      title: 'VISUAL 2.5D & ASSETS',
      items: [
        {
          id: 'visual_creator',
          label: 'Visual Studio (IA)',
          icon: Palette,
          highlight: true,
          badge: totalVisualAssets,
          badgeColor: 'bg-cyan-500/20 text-cyan-300',
        },
        { id: 'style_bible', label: 'Visual Style Bible', icon: BookOpen },
        {
          id: 'visual_qa',
          label: 'Visual QA & 2.5D',
          icon: visualQAReport.criticalCount > 0 ? ShieldAlert : ShieldCheck,
          badge:
            visualQAReport.criticalCount > 0
              ? `${visualQAReport.criticalCount} Err`
              : `${visualQAReport.healthScore}%`,
          badgeColor:
            visualQAReport.criticalCount > 0
              ? 'bg-rose-500/20 text-rose-300'
              : 'bg-emerald-500/20 text-emerald-300',
        },
      ],
    },
    {
      title: 'CONTENT & ENGINE',
      items: [
        { id: 'ai_creator', label: 'Creador de Entidades', icon: Sparkles },
        { id: 'chain_generator', label: 'Generación en Cadena', icon: GitMerge },
        { id: 'world_intelligence', label: 'World Intelligence', icon: Globe2 },
        { id: 'library', label: 'Biblioteca de Contenido', icon: Layers, badge: totalEntities },
        { id: 'editor', label: 'Inspector & 2.5D', icon: Edit3 },
        { id: 'analyzer', label: 'Analizador de Juego', icon: Activity },
        {
          id: 'validator',
          label: 'Validador de Integridad',
          icon: validationReport.errorCount > 0 ? ShieldAlert : ShieldCheck,
          badge: validationReport.errorCount,
          badgeColor:
            validationReport.errorCount > 0
              ? 'bg-rose-500/20 text-rose-300'
              : 'bg-slate-800 text-slate-400',
        },
        { id: 'export', label: 'Exportación Phaser 3', icon: Download },
      ],
    },
  ];

  return (
    <>
      <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col justify-between shrink-0 select-none overflow-y-auto">
        {/* Brand Header */}
        <div>
          <div className="p-4 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-950/95 backdrop-blur z-20">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 border border-amber-400/40">
                <Compass className="w-5 h-5 text-slate-950 font-bold" />
              </div>
              <div>
                <div className="text-sm font-extrabold tracking-wider text-slate-100 flex items-center gap-1.5">
                  <span>AURORA 2.0</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-mono border border-indigo-500/30">
                    STUDIO
                  </span>
                </div>
                <p className="text-[10px] font-mono text-slate-500">Phaser 3 · Cursor Studio</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="p-3 grid grid-cols-2 gap-2 border-b border-slate-800/80">
            <button
              id="import-aurora-project-btn"
              onClick={() => setIsImportOpen(true)}
              className="flex items-center justify-center gap-1.5 px-2.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition"
              title="Importar archivos de AURORA desde Cursor"
            >
              <FolderInput className="w-3.5 h-3.5 text-cyan-400" />
              <span>Importar</span>
            </button>

            <button
              id="version-history-btn"
              onClick={() => setIsHistoryOpen(true)}
              className="flex items-center justify-center gap-1.5 px-2.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition"
              title="Historial de versiones y Snapshots de seguridad"
            >
              <History className="w-3.5 h-3.5 text-amber-400" />
              <span>Snapshots ({versionHistory.length})</span>
            </button>
          </div>

          {/* Navigation Sections */}
          <nav className="p-3 space-y-4">
            {navSections.map((section, sIdx) => (
              <div key={sIdx} className="space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3">
                  {section.title}
                </span>
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;

                  return (
                    <button
                      key={item.id}
                      id={`nav-${item.id}`}
                      onClick={() => setActiveTab(item.id as any)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
                        isActive
                          ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 shadow-sm'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon
                          className={`w-4 h-4 ${
                            isActive
                              ? 'text-indigo-400'
                              : item.highlight
                              ? 'text-cyan-400'
                              : 'text-slate-500'
                          }`}
                        />
                        <span className="truncate">{item.label}</span>
                      </div>

                      {item.badge !== undefined && (
                        <span
                          className={`px-1.5 py-0.2 rounded-md text-[9px] font-mono font-bold shrink-0 ${
                            item.badgeColor || 'bg-slate-900 text-slate-400'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        {/* Bottom Footer & Settings */}
        <div className="p-4 border-t border-slate-800 space-y-2 sticky bottom-0 bg-slate-950/95 backdrop-blur z-20">
          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <div className="flex justify-between items-center text-slate-300 font-mono text-[10px]">
              <span>PHASER 3 + TS</span>
              <span className="text-emerald-400 font-bold">2.5D STUDIO 2.0</span>
            </div>
            <p className="text-[10px] text-slate-500">
              {validationReport.errorCount === 0
                ? '✓ Sistema Verificado'
                : `⚠ ${validationReport.errorCount} errores de schema`}
            </p>
          </div>

          <button
            onClick={() => setActiveModal('settings')}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition"
          >
            <Settings className="w-4 h-4 text-slate-500" />
            <span>Ajustes & Proyecto JSON</span>
          </button>
        </div>
      </aside>

      {/* Modals */}
      <ImportAuroraProjectModal isOpen={isImportOpen} onClose={() => setIsImportOpen(false)} />
      <VersionHistoryDrawer isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} />
    </>
  );
};
