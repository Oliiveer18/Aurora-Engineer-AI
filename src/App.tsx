import React from 'react';
import { AuroraProvider, useAurora } from './context/AuroraContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { SystemStatusView } from './components/SystemStatusView';
import { WorldIntelligenceView } from './components/WorldIntelligenceView';
import { AICreatorView } from './components/AICreatorView';
import { ChainGeneratorView } from './components/ChainGeneratorView';
import { ContentLibraryView } from './components/ContentLibraryView';
import { VisualEntityEditor } from './components/VisualEntityEditor';
import { ProjectAnalyzerView } from './components/ProjectAnalyzerView';
import { ProjectValidatorView } from './components/ProjectValidatorView';
import { ExportHubView } from './components/ExportHubView';
import { VisualCreatorView } from './components/visual/VisualCreatorView';
import { VisualStyleBibleEditor } from './components/visual/VisualStyleBibleEditor';
import { VisualQAView } from './components/visual/VisualQAView';
import { AIDirectorView } from './components/director/AIDirectorView';
import { CursorIntegrationView } from './components/cursor/CursorIntegrationView';

// Studio 2.0, 2.1, 2.2 & 2.3 Components
import { LiveProfilerView } from './components/profiler/LiveProfilerView';
import { VerifiedOptimizerView } from './components/profiler/VerifiedOptimizerView';
import { SelfAuditView } from './components/audit/SelfAuditView';
import { AutoOptimizeView } from './components/audit/AutoOptimizeView';
import { SystemMaintenanceView } from './components/audit/SystemMaintenanceView';
import { FreeAICenterView } from './components/ai/FreeAICenterView';
import { AIGameBuilderView } from './components/gamebuilder/AIGameBuilderView';
import { AITaskAgentView } from './components/tasks/AITaskAgentView';
import { ProjectMemoryView } from './components/memory/ProjectMemoryView';
import { DesignRulesEngineView } from './components/rules/DesignRulesEngineView';
import { GameplaySimulatorView } from './components/simulator/GameplaySimulatorView';
import { WorldExpansionView } from './components/world/WorldExpansionView';
import { EcosystemStudioView } from './components/ecosystem/EcosystemStudioView';
import { ProductionPackView } from './components/production/ProductionPackView';
import { ABDesignLabView } from './components/ablab/ABDesignLabView';
import { AIRoadmapView } from './components/roadmap/AIRoadmapView';
import { ChangeImpactGraphView } from './components/impact/ChangeImpactGraphView';
import { DeveloperToolsView } from './components/developer/DeveloperToolsView';
import { PerformanceAndUXView } from './components/analytics/PerformanceAndUXView';

// Modals
import { DiffPreviewModal } from './components/DiffPreviewModal';
import { ProjectSettingsModal } from './components/ProjectSettingsModal';
import { OnboardingModal } from './components/OnboardingModal';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

const AppContent: React.FC = () => {
  const { activeTab, toastMessage } = useAurora();

  return (
    <div className="flex h-screen w-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">
      {/* Navigation Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto flex flex-col relative p-6">
          {/* Studio 2.0, 2.1, 2.2 & 2.3 Core Modules */}
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'live_profiler' && <LiveProfilerView />}
          {activeTab === 'verified_optimizer' && <VerifiedOptimizerView />}
          {activeTab === 'self_audit' && <SelfAuditView />}
          {activeTab === 'auto_optimize' && <AutoOptimizeView />}
          {activeTab === 'system_maintenance' && <SystemMaintenanceView />}
          {activeTab === 'free_ai_center' && <FreeAICenterView />}
          {activeTab === 'ai_builder' && <AIGameBuilderView />}
          {activeTab === 'ai_tasks' && <AITaskAgentView />}
          {activeTab === 'project_memory' && <ProjectMemoryView />}
          {activeTab === 'design_rules' && <DesignRulesEngineView />}
          {activeTab === 'gameplay_simulator' && <GameplaySimulatorView />}

          {/* World, Ecosystem & Balance */}
          {activeTab === 'world_expansion' && <WorldExpansionView />}
          {activeTab === 'ecosystem_studio' && <EcosystemStudioView />}
          {activeTab === 'production_packs' && <ProductionPackView />}
          {activeTab === 'ab_design_lab' && <ABDesignLabView />}
          {activeTab === 'ai_roadmap' && <AIRoadmapView />}
          {activeTab === 'impact_graph' && <ChangeImpactGraphView />}

          {/* Dev, Cursor & Systems */}
          {activeTab === 'cursor_integration' && <CursorIntegrationView />}
          {activeTab === 'developer_tools' && <DeveloperToolsView />}
          {activeTab === 'performance_ux' && <PerformanceAndUXView />}
          {activeTab === 'director' && <AIDirectorView />}
          {activeTab === 'system_status' && <SystemStatusView />}

          {/* Visual Studio & 2.5D */}
          {activeTab === 'visual_creator' && <VisualCreatorView />}
          {activeTab === 'style_bible' && <VisualStyleBibleEditor />}
          {activeTab === 'visual_qa' && <VisualQAView />}

          {/* Content & Engine */}
          {activeTab === 'world_intelligence' && <WorldIntelligenceView />}
          {activeTab === 'ai_creator' && <AICreatorView />}
          {activeTab === 'chain_generator' && <ChainGeneratorView />}
          {activeTab === 'library' && <ContentLibraryView />}
          {activeTab === 'editor' && <VisualEntityEditor />}
          {activeTab === 'analyzer' && <ProjectAnalyzerView />}
          {activeTab === 'validator' && <ProjectValidatorView />}
          {activeTab === 'export' && <ExportHubView />}
        </main>
      </div>

      {/* Global Diff Preview Modal (Staging Area) */}
      <DiffPreviewModal />

      {/* Settings Modal */}
      <ProjectSettingsModal />

      {/* Onboarding Flow Modal */}
      <OnboardingModal />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-slate-900 border border-slate-700 text-slate-100 text-xs font-medium rounded-xl shadow-2xl animate-in slide-in-from-bottom duration-200">
          {toastMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
          {toastMessage.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400" />}
          {toastMessage.type === 'info' && <Info className="w-4 h-4 text-cyan-400" />}
          <span>{toastMessage.text}</span>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AuroraProvider>
      <AppContent />
    </AuroraProvider>
  );
}
