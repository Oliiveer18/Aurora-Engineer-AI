import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  ProjectContext,
  AuroraEntityType,
  Creature,
  NPC,
  Quest,
  Biome,
  Item,
  Ability,
  Dungeon,
  Faction,
  Shop,
  Region,
  ValidationReport,
  ProjectAnalysis,
  ValidationError,
  ProjectVersionSnapshot,
  StagedPackage,
  StagedEntityChange,
  VisualAsset,
  VisualAssetType,
  VisualOrientation,
  VariantType,
  VisualStyleBible,
  VisualQAReport,
  VisualQAIssue,
  DirectorHealthScores,
  GameDesignEvaluation,
  WorldCoherenceAnalysis,
  EcosystemAnalysis,
  ProgressionAnalysis,
  QuestDirectorAnalysis,
  NarrativeAnalysis,
  DirectorRecommendation,
  DirectorDecisionLogEntry,
  GameDesignReport,
  ProjectManifest,
  AuroraChangePackage,
  SyncStatus,
  SyncConflict,
  ProjectVerificationReport,
  ConnectorState,
} from '../types/aurora';
import { INITIAL_AURORA_PROJECT } from '../data/mockAuroraProject';
import { validateAuroraProject, applyAutoFix } from '../lib/auroraValidator';
import { analyzeAuroraProject } from '../lib/auroraAnalyzer';
import { buildProjectKnowledgeBase, buildGroundingContext, ProjectKnowledgeBase } from '../lib/projectKnowledgeBase';
import { importAuroraProjectFiles, RawFileInput, ImportParsedResult } from '../lib/projectImporter';
import { exportAsJSON } from '../lib/exportFormatter';
import {
  generateProjectManifest,
  detectSyncConflicts,
  resolveSyncConflict,
  runProjectVerification,
} from '../lib/projectConnector';
import {
  generateChangePackage,
  buildSurgicalPatchesForChange,
  evaluateRiskAnalysis,
  runIntegrationCheck,
  buildIntegrationTask,
} from '../lib/patchGenerator';
import {
  runVisualQA,
  applyVisualQAFix,
  createGeneratedVisualAsset,
  createAssetVariant,
  buildVisualContext,
} from '../lib/visualGeneratorEngine';
import {
  calculateDirectorHealth,
  evaluateGameDesign,
  analyzeWorldCoherence,
  analyzeEcosystem,
  analyzeProgressionAndDifficulty,
  analyzeQuestEcosystem,
  analyzeNarrativeWeb,
  generateDirectorRecommendations,
  generateComprehensiveDesignReport,
  buildAutoBalancePackage,
  buildLocalContentPack,
} from '../lib/auroraDirectorEngine';
import {
  computeSystemHealthReport,
  generateFinalProjectHealthReport,
} from '../lib/systemAuditor';
import {
  isOnboardingCompleted,
  setOnboardingCompleted,
} from '../lib/workspaceMigration';

interface AuroraContextType {
  projectContext: ProjectContext;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedEntity: { type: AuroraEntityType; data: any } | null;
  setSelectedEntity: (entity: { type: AuroraEntityType; data: any } | null) => void;
  selectedVisualAsset: VisualAsset | null;
  setSelectedVisualAsset: (asset: VisualAsset | null) => void;
  validationReport: ValidationReport;
  projectAnalysis: ProjectAnalysis;
  knowledgeBase: ProjectKnowledgeBase;
  visualQAReport: VisualQAReport;
  directorHealth: DirectorHealthScores;
  gameDesignEvaluations: GameDesignEvaluation[];
  worldCoherence: WorldCoherenceAnalysis;
  ecosystemAnalysis: EcosystemAnalysis;
  progressionAnalysis: ProgressionAnalysis;
  questDirectorAnalysis: QuestDirectorAnalysis;
  narrativeAnalysis: NarrativeAnalysis;
  directorRecommendations: DirectorRecommendation[];
  decisionLog: DirectorDecisionLogEntry[];
  isGenerating: boolean;
  setIsGenerating: (v: boolean) => void;
  activeModal: string | null;
  setActiveModal: (m: string | null) => void;
  toastMessage: { text: string; type: 'success' | 'error' | 'info' } | null;
  showToast: (text: string, type?: 'success' | 'error' | 'info') => void;

  // Staging & Diff Preview
  stagedPackage: StagedPackage | null;
  setStagedPackage: (pkg: StagedPackage | null) => void;
  approveStagedChanges: () => void;
  rejectStagedChanges: () => void;

  // Phase 5: Cursor Integration & Packages
  manifest: ProjectManifest;
  syncStatus: SyncStatus;
  setSyncStatus: (s: SyncStatus) => void;
  activeChangePackage: AuroraChangePackage | null;
  setActiveChangePackage: (pkg: AuroraChangePackage | null) => void;
  changePackageHistory: AuroraChangePackage[];
  syncConflicts: SyncConflict[];
  verificationReport: ProjectVerificationReport | null;
  generatePackageFromStaged: (stagedPkg?: StagedPackage) => AuroraChangePackage;
  commitChangePackageToProject: (pkg: AuroraChangePackage) => void;
  createSafetySnapshot: (title: string, description: string) => string;
  resolveConflict: (conflictId: string, resolution: 'keep_project' | 'keep_staged' | 'merged') => void;
  runProjectVerificationCheck: () => ProjectVerificationReport;
  refreshManifest: (files?: RawFileInput[]) => ProjectManifest;
  markPackageExported: (pkgId: string) => void;
  markPackageApplied: (pkgId: string) => void;
  stageDirectChangePackage: (pkg: AuroraChangePackage) => void;

  // Versioning, History & Safety Rollback
  versionHistory: ProjectVersionSnapshot[];
  rollbackToVersion: (versionId: string) => void;
  undoLastChange: () => void;
  createManualSnapshot: (title: string, description: string) => void;

  // CRUD Operations
  addEntity: (type: AuroraEntityType, entity: any, skipSnapshot?: boolean) => void;
  updateEntity: (type: AuroraEntityType, entity: any, skipSnapshot?: boolean) => void;
  deleteEntity: (type: AuroraEntityType, id: string, skipSnapshot?: boolean) => void;
  duplicateEntity: (type: AuroraEntityType, id: string) => void;
  applyValidationAutoFix: (error: ValidationError) => void;
  applyAllAutoFixes: () => void;
  resetToInitialProject: () => void;
  importProjectJSON: (jsonStr: string) => boolean;
  importProjectFiles: (files: RawFileInput[], mode: 'replace' | 'merge') => ImportParsedResult;

  // Visual Assets & Style Bible Actions (Phase 3)
  addVisualAsset: (asset: VisualAsset, skipSnapshot?: boolean) => void;
  updateVisualAsset: (asset: VisualAsset, skipSnapshot?: boolean) => void;
  deleteVisualAsset: (id: string, skipSnapshot?: boolean) => void;
  updateStyleBible: (bible: VisualStyleBible) => void;
  stageVisualAssetGeneration: (params: {
    name: string;
    category: VisualAssetType;
    prompt: string;
    regionId?: string;
    biomeId?: string;
    relatedEntityId?: string;
    referenceAssetId?: string;
    variantType?: VariantType;
    variantNotes?: string;
    orientation?: VisualOrientation;
  }) => Promise<StagedPackage>;
  stageVisualVariantGeneration: (
    originalAsset: VisualAsset,
    variantType: VariantType,
    options: any
  ) => Promise<StagedPackage>;
  applyVisualFix: (issue: VisualQAIssue) => void;
  applyAllVisualFixes: () => void;
  linkVisualAssetToEntity: (visualAssetId: string, entityType: AuroraEntityType, entityId: string) => void;

  // AI Actions (Grounded & Staged)
  generateContent: (category: AuroraEntityType, prompt: string, targetLocationId?: string) => Promise<any>;
  stageEntityGeneration: (category: AuroraEntityType, prompt: string, targetLocationId?: string) => Promise<StagedPackage>;
  stageChainGeneration: (regionName: string, theme: string) => Promise<StagedPackage>;
  stageSmartAction: (actionType: string, entity: any, options?: any) => Promise<StagedPackage>;
  executeWorldFix: (gapOrIssue: any) => Promise<void>;

  // AI Director Actions (Phase 4)
  stageDirectorPack: (config: { regionId?: string; theme?: string }) => Promise<void>;
  stageAutoBalance: () => void;
  logDirectorDecision: (title: string, summary: string, category: string, count: number) => void;
  generateDesignReport: () => GameDesignReport;

  // Phase 6: System Health, Auditing, Onboarding & Production Readiness
  systemHealthReport: import('../types/aurora').SystemHealthReport;
  finalProjectHealthReport: import('../types/aurora').FinalProjectHealthReport;
  isOnboardingOpen: boolean;
  setIsOnboardingOpen: (open: boolean) => void;
  completeOnboarding: () => void;
  runFullSystemHealthCheck: () => import('../types/aurora').SystemHealthReport;
}

const AuroraContext = createContext<AuroraContextType | undefined>(undefined);

const STORAGE_KEY = 'AURORA_AI_CREATOR_WORKSPACE_V2';
const HISTORY_KEY = 'AURORA_AI_CREATOR_HISTORY_V2';

export const AuroraProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [projectContext, setProjectContext] = useState<ProjectContext>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading saved workspace:', e);
    }
    return INITIAL_AURORA_PROJECT;
  });

  const [versionHistory, setVersionHistory] = useState<ProjectVersionSnapshot[]>(() => {
    try {
      const savedHist = localStorage.getItem(HISTORY_KEY);
      if (savedHist) {
        return JSON.parse(savedHist);
      }
    } catch (e) {
      console.error('Error loading history:', e);
    }
    return [
      {
        id: 'initial_snapshot',
        timestamp: new Date().toISOString(),
        title: 'Estado Inicial del Proyecto',
        description: 'Plantilla base de AURORA RPG 2.5D cargada en el espacio de trabajo.',
        snapshot: INITIAL_AURORA_PROJECT,
        entityCount: 18,
      },
    ];
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedEntity, setSelectedEntity] = useState<{ type: AuroraEntityType; data: any } | null>(null);
  const [selectedVisualAsset, setSelectedVisualAsset] = useState<VisualAsset | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [stagedPackage, setStagedPackage] = useState<StagedPackage | null>(null);

  // Phase 5: Aurora ↔ Cursor Integration States
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('SYNCED');
  const [activeChangePackage, setActiveChangePackage] = useState<AuroraChangePackage | null>(null);
  const [changePackageHistory, setChangePackageHistory] = useState<AuroraChangePackage[]>(() => {
    try {
      const saved = localStorage.getItem('AURORA_PACKAGE_HISTORY_V1');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading package history:', e);
    }
    return [];
  });
  const [syncConflicts, setSyncConflicts] = useState<SyncConflict[]>([]);
  const [verificationReport, setVerificationReport] = useState<ProjectVerificationReport | null>(null);

  const [decisionLog, setDecisionLog] = useState<DirectorDecisionLogEntry[]>(() => {
    return projectContext.decisionLog || [
      {
        id: 'log_init',
        timestamp: new Date().toISOString(),
        title: 'Inicialización de AURORA AI DIRECTOR',
        summary: 'Auditoría inicial completada. Fuente de la verdad establecida en la Knowledge Base del proyecto.',
        category: 'Arquitectura & Sistema',
        entitiesAffectedCount: 18,
        approvedByUser: true,
        notes: 'Phaser 3 + TypeScript 2.5D baseline verificado',
      },
    ];
  });

  // Auto-save to localStorage
  useEffect(() => {
    try {
      const toSave = { ...projectContext, decisionLog };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch (e) {
      console.error('Failed to save workspace to localStorage:', e);
    }
  }, [projectContext, decisionLog]);

  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(versionHistory.slice(0, 20))); // keep latest 20 snapshots
    } catch (e) {
      console.error('Failed to save history to localStorage:', e);
    }
  }, [versionHistory]);

  useEffect(() => {
    try {
      localStorage.setItem('AURORA_PACKAGE_HISTORY_V1', JSON.stringify(changePackageHistory.slice(0, 15)));
    } catch (e) {
      console.error('Failed to save package history:', e);
    }
  }, [changePackageHistory]);

  // Derived calculations
  const validationReport = React.useMemo(() => validateAuroraProject(projectContext), [projectContext]);
  const projectAnalysis = React.useMemo(() => analyzeAuroraProject(projectContext), [projectContext]);
  const knowledgeBase = React.useMemo(() => buildProjectKnowledgeBase(projectContext), [projectContext]);
  const visualQAReport = React.useMemo(() => runVisualQA(projectContext), [projectContext]);
  const manifest = React.useMemo(() => generateProjectManifest(projectContext), [projectContext]);

  // Director Suite Derived Analytics (Phase 4)
  const directorHealth = React.useMemo(() => calculateDirectorHealth(projectContext), [projectContext]);
  const gameDesignEvaluations = React.useMemo(() => evaluateGameDesign(projectContext), [projectContext]);
  const worldCoherence = React.useMemo(() => analyzeWorldCoherence(projectContext), [projectContext]);
  const ecosystemAnalysis = React.useMemo(() => analyzeEcosystem(projectContext), [projectContext]);
  const progressionAnalysis = React.useMemo(() => analyzeProgressionAndDifficulty(projectContext), [projectContext]);
  const questDirectorAnalysis = React.useMemo(() => analyzeQuestEcosystem(projectContext), [projectContext]);
  const narrativeAnalysis = React.useMemo(() => analyzeNarrativeWeb(projectContext), [projectContext]);
  const directorRecommendations = React.useMemo(() => generateDirectorRecommendations(projectContext), [projectContext]);

  // Phase 6: System Health & Audit Calculations
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(() => {
    return !isOnboardingCompleted();
  });

  const completeOnboarding = () => {
    setOnboardingCompleted(true);
    setIsOnboardingOpen(false);
    showToast('¡Onboarding completado! AURORA está lista para producción.', 'success');
  };

  const systemHealthReport = React.useMemo(
    () => computeSystemHealthReport(projectContext, validationReport, visualQAReport, knowledgeBase, manifest),
    [projectContext, validationReport, visualQAReport, knowledgeBase, manifest]
  );

  const finalProjectHealthReport = React.useMemo(
    () => generateFinalProjectHealthReport(projectContext, validationReport, visualQAReport, knowledgeBase, manifest),
    [projectContext, validationReport, visualQAReport, knowledgeBase, manifest]
  );

  const runFullSystemHealthCheck = () => {
    const report = computeSystemHealthReport(projectContext, validationReport, visualQAReport, knowledgeBase, manifest);
    showToast(`Diagnóstico completado: Salud general del sistema al ${report.overallHealthScore}%`, 'success');
    return report;
  };

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const createSnapshot = (title: string, description: string, ctxToSave: ProjectContext = projectContext) => {
    const totalCount =
      ctxToSave.regions.length +
      ctxToSave.biomes.length +
      ctxToSave.creatures.length +
      ctxToSave.npcs.length +
      ctxToSave.items.length +
      ctxToSave.abilities.length +
      ctxToSave.quests.length +
      ctxToSave.dungeons.length +
      ctxToSave.factions.length +
      ctxToSave.shops.length;

    const newSnapshot: ProjectVersionSnapshot = {
      id: `snap_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      title,
      description,
      snapshot: JSON.parse(JSON.stringify(ctxToSave)),
      entityCount: totalCount,
    };

    setVersionHistory((prev) => [newSnapshot, ...prev].slice(0, 25));
  };

  const rollbackToVersion = (versionId: string) => {
    const target = versionHistory.find((v) => v.id === versionId);
    if (target) {
      // Save current state before rollback so rollback itself is reversible
      createSnapshot('Pre-Rollback Backup', `Copia de seguridad antes de revertir a "${target.title}"`);
      setProjectContext(JSON.parse(JSON.stringify(target.snapshot)));
      setSelectedEntity(null);
      showToast(`Proyecto revertido exitosamente a la versión: "${target.title}"`, 'success');
    }
  };

  const undoLastChange = () => {
    if (versionHistory.length > 1) {
      const prevVersion = versionHistory[1];
      rollbackToVersion(prevVersion.id);
    } else {
      showToast('No hay versiones anteriores en el historial.', 'info');
    }
  };

  const createManualSnapshot = (title: string, description: string) => {
    createSnapshot(title, description);
    showToast(`Punto de restauración guardado: "${title}"`, 'success');
  };

  // CRUD Operations
  const addEntity = (type: AuroraEntityType, entity: any, skipSnapshot: boolean = false) => {
    if (!skipSnapshot) {
      createSnapshot(`Añadida entidad: ${entity.name || entity.title || entity.id}`, `Tipo: ${type}`);
    }
    setProjectContext((prev) => {
      const next = { ...prev };
      switch (type) {
        case 'creature':
          next.creatures = [entity, ...next.creatures];
          break;
        case 'npc':
          next.npcs = [entity, ...next.npcs];
          break;
        case 'quest':
          next.quests = [entity, ...next.quests];
          break;
        case 'biome':
          next.biomes = [entity, ...next.biomes];
          break;
        case 'item':
          next.items = [entity, ...next.items];
          break;
        case 'ability':
          next.abilities = [entity, ...next.abilities];
          break;
        case 'dungeon':
          next.dungeons = [entity, ...next.dungeons];
          break;
        case 'faction':
          next.factions = [entity, ...next.factions];
          break;
        case 'shop':
          next.shops = [entity, ...next.shops];
          break;
        case 'region':
          next.regions = [entity, ...next.regions];
          break;
      }
      return next;
    });
    showToast(`Elemento "${entity.name || entity.title || entity.id}" añadido al proyecto.`, 'success');
  };

  const updateEntity = (type: AuroraEntityType, entity: any, skipSnapshot: boolean = false) => {
    if (!skipSnapshot) {
      createSnapshot(`Modificado: ${entity.name || entity.title || entity.id}`, `Tipo: ${type}`);
    }
    setProjectContext((prev) => {
      const next = { ...prev };
      const updateList = (list: any[]) => list.map((item) => (item.id === entity.id ? entity : item));
      switch (type) {
        case 'creature':
          next.creatures = updateList(next.creatures);
          break;
        case 'npc':
          next.npcs = updateList(next.npcs);
          break;
        case 'quest':
          next.quests = updateList(next.quests);
          break;
        case 'biome':
          next.biomes = updateList(next.biomes);
          break;
        case 'item':
          next.items = updateList(next.items);
          break;
        case 'ability':
          next.abilities = updateList(next.abilities);
          break;
        case 'dungeon':
          next.dungeons = updateList(next.dungeons);
          break;
        case 'faction':
          next.factions = updateList(next.factions);
          break;
        case 'shop':
          next.shops = updateList(next.shops);
          break;
        case 'region':
          next.regions = updateList(next.regions);
          break;
      }
      return next;
    });
    if (selectedEntity && selectedEntity.data.id === entity.id) {
      setSelectedEntity({ type, data: entity });
    }
    showToast(`Cambios guardados en "${entity.name || entity.title || entity.id}".`, 'success');
  };

  const deleteEntity = (type: AuroraEntityType, id: string, skipSnapshot: boolean = false) => {
    if (!skipSnapshot) {
      createSnapshot(`Eliminada entidad: ${id}`, `Tipo: ${type}`);
    }
    setProjectContext((prev) => {
      const next = { ...prev };
      const filterList = (list: any[]) => list.filter((item) => item.id !== id);
      switch (type) {
        case 'creature':
          next.creatures = filterList(next.creatures);
          break;
        case 'npc':
          next.npcs = filterList(next.npcs);
          break;
        case 'quest':
          next.quests = filterList(next.quests);
          break;
        case 'biome':
          next.biomes = filterList(next.biomes);
          break;
        case 'item':
          next.items = filterList(next.items);
          break;
        case 'ability':
          next.abilities = filterList(next.abilities);
          break;
        case 'dungeon':
          next.dungeons = filterList(next.dungeons);
          break;
        case 'faction':
          next.factions = filterList(next.factions);
          break;
        case 'shop':
          next.shops = filterList(next.shops);
          break;
        case 'region':
          next.regions = filterList(next.regions);
          break;
      }
      return next;
    });
    if (selectedEntity && selectedEntity.data.id === id) {
      setSelectedEntity(null);
    }
    showToast(`Elemento "${id}" eliminado.`, 'info');
  };

  const duplicateEntity = (type: AuroraEntityType, id: string) => {
    let source: any = null;
    switch (type) {
      case 'creature':
        source = projectContext.creatures.find((c) => c.id === id);
        break;
      case 'npc':
        source = projectContext.npcs.find((n) => n.id === id);
        break;
      case 'quest':
        source = projectContext.quests.find((q) => q.id === id);
        break;
      case 'biome':
        source = projectContext.biomes.find((b) => b.id === id);
        break;
      case 'item':
        source = projectContext.items.find((i) => i.id === id);
        break;
      case 'ability':
        source = projectContext.abilities.find((a) => a.id === id);
        break;
      default:
        break;
    }
    if (source) {
      const copy = JSON.parse(JSON.stringify(source));
      const randSuffix = Math.floor(Math.random() * 900) + 100;
      copy.id = `${copy.id}_copy_${randSuffix}`;
      if (copy.name) copy.name = `${copy.name} (Copia)`;
      if (copy.title) copy.title = `${copy.title} (Copia)`;
      addEntity(type, copy);
      setSelectedEntity({ type, data: copy });
    }
  };

  const applyValidationAutoFix = (error: ValidationError) => {
    createSnapshot(`Auto-corrección en: ${error.entityName}`, error.message);
    const fixed = applyAutoFix(projectContext, error);
    setProjectContext(fixed);
    showToast(`Corrección automática aplicada a "${error.entityName}".`, 'success');
  };

  const applyAllAutoFixes = () => {
    createSnapshot(`Auto-corrección masiva`, `Aplicadas correcciones a ${validationReport.errors.length} entidades.`);
    let current = projectContext;
    let count = 0;
    validationReport.errors.forEach((err) => {
      if (err.autoFixAction) {
        current = applyAutoFix(current, err);
        count++;
      }
    });
    setProjectContext(current);
    showToast(`Se aplicaron ${count} correcciones automáticas.`, 'success');
  };

  const resetToInitialProject = () => {
    createSnapshot('Pre-Reset Backup', 'Copia de seguridad antes de restablecer plantilla');
    setProjectContext(INITIAL_AURORA_PROJECT);
    setSelectedEntity(null);
    showToast('Proyecto reiniciado a los datos de demostración de AURORA.', 'info');
  };

  const importProjectJSON = (jsonStr: string): boolean => {
    try {
      const result = importAuroraProjectFiles([{ name: 'import_manual.json', content: jsonStr }], projectContext, 'replace');
      if (result.success) {
        createSnapshot('Importación JSON de Proyecto', `Importadas ${result.summary.totalEntities} entidades`);
        setProjectContext(result.importedContext);
        showToast(`Importadas ${result.summary.totalEntities} entidades correctamente.`, 'success');
        return true;
      }
      showToast('El JSON no contiene entidades válidas de AURORA.', 'error');
      return false;
    } catch (e: any) {
      showToast(`Error al parsear JSON: ${e.message}`, 'error');
      return false;
    }
  };

  const importProjectFiles = (files: RawFileInput[], mode: 'replace' | 'merge' = 'replace'): ImportParsedResult => {
    const result = importAuroraProjectFiles(files, projectContext, mode);
    if (result.success) {
      createSnapshot(
        `Importación de Archivos (${mode === 'merge' ? 'Fusión' : 'Reemplazo'})`,
        `Archivos: ${result.detectedFiles.join(', ')} (${result.summary.totalEntities} entidades)`
      );
      setProjectContext(result.importedContext);
      showToast(`Importación completada: ${result.summary.totalEntities} entidades procesadas.`, 'success');
    }
    return result;
  };

  // Staging & Diff Management
  const approveStagedChanges = () => {
    if (!stagedPackage) return;
    createSnapshot(stagedPackage.title, stagedPackage.description, stagedPackage.targetContext);
    setProjectContext(stagedPackage.targetContext);

    // Log decision in Director Decision Log
    const newEntry: DirectorDecisionLogEntry = {
      id: `decision_${Date.now()}`,
      timestamp: new Date().toISOString(),
      title: stagedPackage.title,
      summary: stagedPackage.description,
      category: 'Contenido Aprobado',
      entitiesAffectedCount: stagedPackage.changes?.length || 1,
      approvedByUser: true,
      notes: `Integradas ${stagedPackage.changes?.length || 0} entidades tras revisión de Diff.`,
    };
    setDecisionLog((prev) => [newEntry, ...prev]);

    showToast(`Cambios aprobados e integrados: "${stagedPackage.title}"`, 'success');
    setStagedPackage(null);
  };

  const rejectStagedChanges = () => {
    showToast('Cambios descartados sin modificar el proyecto.', 'info');
    setStagedPackage(null);
  };

  // Grounded AI Content Generator
  const generateContent = async (category: AuroraEntityType, prompt: string, targetLocationId?: string): Promise<any> => {
    setIsGenerating(true);
    try {
      const grounding = buildGroundingContext(projectContext, category, targetLocationId);

      const res = await fetch('/api/aurora/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          prompt,
          contextSummary: grounding.contextSummary,
          existingIds: grounding.existingIds,
          targetLocationId,
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        return {
          data: data.data,
          contextUsed: {
            ...grounding.groundingMetrics,
            summary: grounding.contextSummary,
          },
        };
      }
      throw new Error(data.error || 'No se pudo generar el contenido');
    } catch (e: any) {
      console.error('Generation error:', e);
      showToast(`Error de IA: ${e.message}`, 'error');
      throw e;
    } finally {
      setIsGenerating(false);
    }
  };

  // Stage a single generated entity with Diff Preview
  const stageEntityGeneration = async (
    category: AuroraEntityType,
    prompt: string,
    targetLocationId?: string
  ): Promise<StagedPackage> => {
    const result = await generateContent(category, prompt, targetLocationId);
    const newEntity = result.data;
    const contextUsed = result.contextUsed;

    const targetContext = JSON.parse(JSON.stringify(projectContext)) as ProjectContext;
    const changes: StagedEntityChange[] = [];

    // Add new entity
    changes.push({
      action: 'new',
      entityType: category,
      entity: newEntity,
      details: `Generado con IA en base a: "${prompt}"`,
    });

    switch (category) {
      case 'creature':
        targetContext.creatures = [newEntity, ...targetContext.creatures];
        // If assigned to a biome, update biome's creature list/encounter table
        if (newEntity.habitat && newEntity.habitat.length > 0) {
          newEntity.habitat.forEach((bId: string) => {
            const biome = targetContext.biomes.find((b) => b.id === bId);
            if (biome) {
              const encList = biome.encounterTable || [];
              if (!encList.some((e) => e.creatureId === newEntity.id)) {
                biome.encounterTable = [
                  ...encList,
                  {
                    creatureId: newEntity.id,
                    rarityCategory: newEntity.rarity === 'common' ? 'common' : 'uncommon',
                    weight: 35,
                    minLevel: newEntity.recommendedLevel || 5,
                    maxLevel: (newEntity.recommendedLevel || 5) + 6,
                  },
                ];
                changes.push({
                  action: 'modified',
                  entityType: 'biome',
                  entity: biome,
                  details: `Tabla de encuentros de "${biome.name}" actualizada con la nueva criatura.`,
                });
              }
            }
          });
        }
        break;
      case 'npc':
        targetContext.npcs = [newEntity, ...targetContext.npcs];
        break;
      case 'quest':
        targetContext.quests = [newEntity, ...targetContext.quests];
        // If quest has related NPC, update NPC's associatedQuests
        if (newEntity.relatedNpcId) {
          const npc = targetContext.npcs.find((n) => n.id === newEntity.relatedNpcId);
          if (npc && (!npc.associatedQuests || !npc.associatedQuests.includes(newEntity.id))) {
            npc.associatedQuests = [...(npc.associatedQuests || []), newEntity.id];
            changes.push({
              action: 'modified',
              entityType: 'npc',
              entity: npc,
              details: `NPC "${npc.name}" vinculado a la nueva misión.`,
            });
          }
        }
        break;
      case 'biome':
        targetContext.biomes = [newEntity, ...targetContext.biomes];
        break;
      case 'item':
        targetContext.items = [newEntity, ...targetContext.items];
        break;
      case 'ability':
        targetContext.abilities = [newEntity, ...targetContext.abilities];
        break;
      case 'dungeon':
        targetContext.dungeons = [newEntity, ...targetContext.dungeons];
        break;
      case 'faction':
        targetContext.factions = [newEntity, ...targetContext.factions];
        break;
      case 'shop':
        targetContext.shops = [newEntity, ...targetContext.shops];
        break;
      case 'region':
        targetContext.regions = [newEntity, ...targetContext.regions];
        break;
    }

    const totalUnchanged =
      knowledgeBase.totalEntities - (changes.filter((c) => c.action === 'modified').length);

    const staged: StagedPackage = {
      id: `staged_${Date.now()}`,
      title: `Generar ${category.toUpperCase()}: ${newEntity.name || newEntity.title || newEntity.id}`,
      description: prompt,
      contextUsed,
      changes,
      unchangedCount: totalUnchanged,
      targetContext,
    };

    setStagedPackage(staged);
    return staged;
  };

  // Stage a chain generation package with Diff Preview
  const stageChainGeneration = async (regionName: string, theme: string): Promise<StagedPackage> => {
    setIsGenerating(true);
    try {
      const grounding = buildGroundingContext(projectContext, 'region');

      const res = await fetch('/api/aurora/chain-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          regionName,
          regionTheme: theme,
          contextSummary: grounding.contextSummary,
          existingIds: grounding.existingIds,
        }),
      });

      const data = await res.json();
      if (!data.success || !data.data) {
        throw new Error(data.error || 'Fallo al generar paquete en cadena');
      }

      const chainPkg = data.data;
      const targetContext = JSON.parse(JSON.stringify(projectContext)) as ProjectContext;
      const changes: StagedEntityChange[] = [];

      if (chainPkg.region) {
        targetContext.regions = [chainPkg.region, ...targetContext.regions];
        changes.push({ action: 'new', entityType: 'region', entity: chainPkg.region });
      }
      if (chainPkg.biome) {
        targetContext.biomes = [chainPkg.biome, ...targetContext.biomes];
        changes.push({ action: 'new', entityType: 'biome', entity: chainPkg.biome });
      }
      if (Array.isArray(chainPkg.creatures)) {
        chainPkg.creatures.forEach((c: any) => {
          targetContext.creatures = [c, ...targetContext.creatures];
          changes.push({ action: 'new', entityType: 'creature', entity: c });
        });
      }
      if (chainPkg.npc) {
        targetContext.npcs = [chainPkg.npc, ...targetContext.npcs];
        changes.push({ action: 'new', entityType: 'npc', entity: chainPkg.npc });
      }
      if (chainPkg.quest) {
        targetContext.quests = [chainPkg.quest, ...targetContext.quests];
        changes.push({ action: 'new', entityType: 'quest', entity: chainPkg.quest });
      }
      if (Array.isArray(chainPkg.items)) {
        chainPkg.items.forEach((i: any) => {
          targetContext.items = [i, ...targetContext.items];
          changes.push({ action: 'new', entityType: 'item', entity: i });
        });
      }
      if (Array.isArray(chainPkg.abilities)) {
        chainPkg.abilities.forEach((a: any) => {
          targetContext.abilities = [a, ...targetContext.abilities];
          changes.push({ action: 'new', entityType: 'ability', entity: a });
        });
      }

      const staged: StagedPackage = {
        id: `chain_${Date.now()}`,
        title: `Ecosistema en Cadena: ${regionName}`,
        description: `Zona temática: "${theme}" con región, bioma, criaturas, NPC, misión y objetos interconectados.`,
        contextUsed: {
          ...grounding.groundingMetrics,
          summary: grounding.contextSummary,
        },
        changes,
        unchangedCount: knowledgeBase.totalEntities,
        targetContext,
      };

      setStagedPackage(staged);
      return staged;
    } catch (e: any) {
      showToast(`Error en generación en cadena: ${e.message}`, 'error');
      throw e;
    } finally {
      setIsGenerating(false);
    }
  };

  // Stage Smart Action (Improve, Balance, Variant, etc.)
  const stageSmartAction = async (actionType: string, entity: any, options: any = {}): Promise<StagedPackage> => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/aurora/smart-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actionType,
          entity,
          targetBiomeOrElement: options.targetBiomeOrElement,
          instructions: options.instructions,
        }),
      });

      const data = await res.json();
      if (!data.success || !data.data) {
        throw new Error(data.error || 'Error en acción inteligente');
      }

      const modifiedEntity = data.data;
      const targetContext = JSON.parse(JSON.stringify(projectContext)) as ProjectContext;
      const changes: StagedEntityChange[] = [];

      const isNewVariant = actionType === 'variant' || modifiedEntity.id !== entity.id;

      if (isNewVariant) {
        changes.push({
          action: 'new',
          entityType: options.entityType || 'creature',
          entity: modifiedEntity,
          details: `Variante creada a partir de "${entity.name || entity.id}"`,
        });
        if (options.entityType === 'creature' || !options.entityType) {
          targetContext.creatures = [modifiedEntity, ...targetContext.creatures];
        }
      } else {
        changes.push({
          action: 'modified',
          entityType: options.entityType || 'creature',
          entity: modifiedEntity,
          previousEntity: entity,
          details: `Acción inteligente: ${actionType}`,
        });
        // replace in collection
        const updateList = (list: any[]) => list.map((item) => (item.id === modifiedEntity.id ? modifiedEntity : item));
        targetContext.creatures = updateList(targetContext.creatures);
        targetContext.npcs = updateList(targetContext.npcs);
        targetContext.quests = updateList(targetContext.quests);
        targetContext.biomes = updateList(targetContext.biomes);
        targetContext.items = updateList(targetContext.items);
        targetContext.abilities = updateList(targetContext.abilities);
      }

      const staged: StagedPackage = {
        id: `smart_${Date.now()}`,
        title: `Acción Inteligente: ${actionType.toUpperCase()} sobre "${entity.name || entity.title || entity.id}"`,
        description: options.instructions || `Optimización y balance 2.5D de la entidad.`,
        changes,
        unchangedCount: knowledgeBase.totalEntities - (isNewVariant ? 0 : 1),
        targetContext,
      };

      setStagedPackage(staged);
      return staged;
    } catch (e: any) {
      showToast(`Error en acción inteligente: ${e.message}`, 'error');
      throw e;
    } finally {
      setIsGenerating(false);
    }
  };

  // World Intelligence Fixer (Auto-stages resolution for any detected gap or imbalance)
  const executeWorldFix = async (issue: any): Promise<void> => {
    if (issue.suggestedPrompt) {
      await stageEntityGeneration(issue.category || 'creature', issue.suggestedPrompt, issue.targetRegionOrBiome);
    } else if (issue.entityId) {
      // Find creature with stat imbalance and balance it
      const target = projectContext.creatures.find((c) => c.id === issue.entityId);
      if (target) {
        await stageSmartAction('balance', target, {
          entityType: 'creature',
          instructions: 'Normaliza el BST para que coincida exactamente con los parámetros esperados de su rareza.',
        });
      }
    } else {
      showToast('No hay una acción de corrección automatizada directa para este aviso.', 'info');
    }
  };

  // ----------------------------------------------------
  // VISUAL ASSETS & STYLE BIBLE METHODS (PHASE 3)
  // ----------------------------------------------------
  const addVisualAsset = (asset: VisualAsset, skipSnapshot = false) => {
    if (!skipSnapshot) {
      createSnapshot(`Añadir Asset Visual: ${asset.name}`, `Tipo: ${asset.type}`);
    }
    setProjectContext((prev) => ({
      ...prev,
      visualAssets: [asset, ...(prev.visualAssets || [])],
    }));
    setSelectedVisualAsset(asset);
    showToast(`Asset visual "${asset.name}" guardado.`, 'success');
  };

  const updateVisualAsset = (asset: VisualAsset, skipSnapshot = false) => {
    if (!skipSnapshot) {
      createSnapshot(`Actualizar Asset Visual: ${asset.name}`, `Ajustes de calibración 2.5D`);
    }
    setProjectContext((prev) => ({
      ...prev,
      visualAssets: (prev.visualAssets || []).map((a) => (a.id === asset.id ? asset : a)),
    }));
    if (selectedVisualAsset && selectedVisualAsset.id === asset.id) {
      setSelectedVisualAsset(asset);
    }
    showToast(`Asset visual "${asset.name}" actualizado.`, 'success');
  };

  const deleteVisualAsset = (id: string, skipSnapshot = false) => {
    if (!skipSnapshot) {
      createSnapshot(`Eliminar Asset Visual: ${id}`, `Eliminado de la biblioteca visual`);
    }
    setProjectContext((prev) => ({
      ...prev,
      visualAssets: (prev.visualAssets || []).filter((a) => a.id !== id),
    }));
    if (selectedVisualAsset && selectedVisualAsset.id === id) {
      setSelectedVisualAsset(null);
    }
    showToast(`Asset visual eliminado.`, 'info');
  };

  const updateStyleBible = (bible: VisualStyleBible) => {
    createSnapshot(`Actualizar Style Bible v${bible.version}`, `Reglas visuales y paletas sincronizadas.`);
    setProjectContext((prev) => ({
      ...prev,
      styleBible: bible,
    }));
    showToast('Visual Style Bible actualizada y sincronizada con el motor de IA.', 'success');
  };

  const stageVisualAssetGeneration = async (params: {
    name: string;
    category: VisualAssetType;
    prompt: string;
    regionId?: string;
    biomeId?: string;
    relatedEntityId?: string;
    referenceAssetId?: string;
    variantType?: VariantType;
    variantNotes?: string;
    orientation?: VisualOrientation;
  }): Promise<StagedPackage> => {
    setIsGenerating(true);
    try {
      const visualContext = buildVisualContext(
        projectContext,
        params.category,
        params.biomeId,
        params.relatedEntityId,
        params.referenceAssetId
      );

      // Attempt AI call to server
      let generatedMeta: any = null;
      try {
        const res = await fetch('/api/aurora/visual-generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: params.name,
            category: params.category,
            prompt: params.prompt,
            biomeName: visualContext.biomeName,
            regionName: visualContext.regionName,
            relatedEntityName: visualContext.relatedEntityName,
            styleBible: projectContext.styleBible,
          }),
        });
        const json = await res.json();
        if (json.success && json.data) {
          generatedMeta = json.data;
        }
      } catch (e) {
        console.warn('Server visual generation fallback used');
      }

      const newAsset = createGeneratedVisualAsset({
        ...params,
        context: projectContext,
      });

      if (generatedMeta) {
        if (generatedMeta.anchor) newAsset.anchor = generatedMeta.anchor;
        if (generatedMeta.ySortOffset !== undefined) newAsset.ySortOffset = generatedMeta.ySortOffset;
        if (generatedMeta.collisionBox) newAsset.collisionBox = generatedMeta.collisionBox;
        if (generatedMeta.shadow) newAsset.shadow = generatedMeta.shadow;
        if (generatedMeta.colorPalette) newAsset.metadata.colorPalette = generatedMeta.colorPalette;
      }

      const targetContext = JSON.parse(JSON.stringify(projectContext)) as ProjectContext;
      targetContext.visualAssets = [newAsset, ...(targetContext.visualAssets || [])];

      // If linked to creature/npc, also update the creature/npc's visualAssetId
      const changes: StagedEntityChange[] = [
        {
          action: 'new',
          entityType: 'creature', // generic representation in diff
          entity: newAsset,
          details: `Asset visual 2.5D (${newAsset.type}) generado con IA y Style Bible.`,
        },
      ];

      if (params.relatedEntityId) {
        const cr = targetContext.creatures.find((c) => c.id === params.relatedEntityId);
        if (cr) {
          cr.visualAssetId = newAsset.id;
          cr.visual2D5.anchorX = newAsset.anchor.x;
          cr.visual2D5.anchorY = newAsset.anchor.y;
          cr.visual2D5.ySortOffset = newAsset.ySortOffset;
          changes.push({
            action: 'modified',
            entityType: 'creature',
            entity: cr,
            details: `Criatura "${cr.name}" vinculada al nuevo asset visual (${newAsset.id}).`,
          });
        }
      }

      const staged: StagedPackage = {
        id: `visual_stage_${Date.now()}`,
        title: `Generar Asset Visual: "${newAsset.name}"`,
        description: params.prompt,
        contextUsed: {
          targetLocationName: `${visualContext.regionName} / ${visualContext.biomeName}`,
          existingEntitiesInLocation: visualContext.similarEntities,
          suggestedElementTypes: ['nature', 'aether'],
          recommendedBstRange: [250, 450],
          occupiedIdsCount: (projectContext.visualAssets || []).length,
          summary: `Paleta: ${visualContext.paletteName}. Escala: ${visualContext.scaleStandard}. Anchor: [${newAsset.anchor.x}, ${newAsset.anchor.y}]. Y-Sort Offset: ${newAsset.ySortOffset}px.`,
        },
        changes,
        unchangedCount: (projectContext.visualAssets || []).length,
        targetContext,
      };

      setStagedPackage(staged);
      return staged;
    } finally {
      setIsGenerating(false);
    }
  };

  const stageVisualVariantGeneration = async (
    originalAsset: VisualAsset,
    variantType: VariantType,
    options: any
  ): Promise<StagedPackage> => {
    setIsGenerating(true);
    try {
      const variantAsset = createAssetVariant(originalAsset, variantType, {
        ...options,
        context: projectContext,
      });

      const targetContext = JSON.parse(JSON.stringify(projectContext)) as ProjectContext;
      targetContext.visualAssets = [variantAsset, ...(targetContext.visualAssets || [])];

      const staged: StagedPackage = {
        id: `variant_stage_${Date.now()}`,
        title: `Variante Visual ${variantType.toUpperCase()}: "${variantAsset.name}"`,
        description: `Variante generada a partir de "${originalAsset.name}" preservando la silueta original.`,
        changes: [
          {
            action: 'new',
            entityType: 'creature',
            entity: variantAsset,
            details: `Variante ${variantType} con paleta ${variantAsset.metadata.element || 'personalizada'}.`,
          },
        ],
        unchangedCount: (projectContext.visualAssets || []).length,
        targetContext,
      };

      setStagedPackage(staged);
      return staged;
    } finally {
      setIsGenerating(false);
    }
  };

  const applyVisualFix = (issue: VisualQAIssue) => {
    createSnapshot(`Auto-corrección Visual QA: ${issue.assetName}`, issue.description);
    const fixedContext = applyVisualQAFix(projectContext, issue);
    setProjectContext(fixedContext);
    showToast(`Corrección visual aplicada a "${issue.assetName}".`, 'success');
  };

  const applyAllVisualFixes = () => {
    const issues = visualQAReport.issues.filter((i) => i.autoFixAvailable);
    if (issues.length === 0) {
      showToast('No hay errores automáticos pendientes en Visual QA.', 'info');
      return;
    }
    createSnapshot('Auto-corrección Masiva Visual QA', `Corregidos ${issues.length} problemas visuales 2.5D.`);
    let current = projectContext;
    issues.forEach((issue) => {
      current = applyVisualQAFix(current, issue);
    });
    setProjectContext(current);
    showToast(`Se repararon ${issues.length} incidencias visuales automáticamente.`, 'success');
  };

  const linkVisualAssetToEntity = (visualAssetId: string, entityType: AuroraEntityType, entityId: string) => {
    createSnapshot(`Vincular Visual Asset a ${entityId}`, `DATA ENTITY ↔ VISUAL ASSET`);
    setProjectContext((prev) => {
      const next = { ...prev };
      // update visual asset
      next.visualAssets = (next.visualAssets || []).map((a) =>
        a.id === visualAssetId ? { ...a, relatedEntityId: entityId } : a
      );
      // update entity
      if (entityType === 'creature') {
        next.creatures = next.creatures.map((c) =>
          c.id === entityId ? { ...c, visualAssetId } : c
        );
      } else if (entityType === 'npc') {
        next.npcs = next.npcs.map((n) =>
          n.id === entityId ? { ...n, visualAssetId } : n
        );
      }
      return next;
    });
    showToast(`Vinculación exitosa: ${entityId} ↔ ${visualAssetId}`, 'success');
  };

  // Phase 4: AI Director Actions
  const stageDirectorPack = async (config: { regionId?: string; theme?: string }) => {
    setIsGenerating(true);
    try {
      const reg = projectContext.regions.find((r) => r.id === config.regionId) || projectContext.regions[0];
      const pack = buildLocalContentPack(projectContext, reg.id, config.theme || reg.name);
      setStagedPackage(pack);
      showToast(`Pack para "${reg.name}" generado. Revisa los cambios en el Diff Preview.`, 'info');
    } catch (e: any) {
      console.error('Error staging director pack:', e);
      showToast(`Error al generar pack: ${e.message}`, 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const stageAutoBalance = () => {
    const pkg = buildAutoBalancePackage(projectContext);
    if (pkg.changes.length === 0) {
      showToast('El balance global ya está en un estado óptimo.', 'info');
      return;
    }
    setStagedPackage(pkg);
    showToast(`Se calcularon ${pkg.changes.length} reajustes de balance. Revisa el Diff Preview.`, 'info');
  };

  const logDirectorDecision = (title: string, summary: string, category: string, count: number) => {
    const entry: DirectorDecisionLogEntry = {
      id: `manual_log_${Date.now()}`,
      timestamp: new Date().toISOString(),
      title,
      summary,
      category,
      entitiesAffectedCount: count,
      approvedByUser: true,
    };
    setDecisionLog((prev) => [entry, ...prev]);
    showToast('Decisión de diseño registrada en el log.', 'success');
  };

  const generateDesignReport = (): GameDesignReport => {
    return generateComprehensiveDesignReport(projectContext);
  };

  // -------------------------------------------------------------
  // PHASE 5: AURORA ↔ CURSOR INTEGRATION HANDLERS
  // -------------------------------------------------------------

  const createSafetySnapshot = (title: string, description: string): string => {
    const snapId = `snap_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const totalCount =
      projectContext.regions.length +
      projectContext.biomes.length +
      projectContext.creatures.length +
      projectContext.npcs.length +
      projectContext.items.length +
      projectContext.abilities.length +
      projectContext.quests.length +
      projectContext.dungeons.length +
      projectContext.factions.length +
      projectContext.shops.length;

    const newSnapshot: ProjectVersionSnapshot = {
      id: snapId,
      timestamp: new Date().toISOString(),
      title,
      description,
      snapshot: JSON.parse(JSON.stringify(projectContext)),
      entityCount: totalCount,
    };

    setVersionHistory((prev) => [newSnapshot, ...prev].slice(0, 25));
    return snapId;
  };

  const generatePackageFromStaged = (pkgToConvert?: StagedPackage): AuroraChangePackage => {
    const targetPkg = pkgToConvert || stagedPackage;
    if (!targetPkg) {
      // Create empty fallback package if none exists
      const dummyStaged: StagedPackage = {
        id: `pkg_${Date.now()}`,
        title: 'Paquete de Contenido Aurora',
        description: 'Paquete consolidado de entidades del proyecto.',
        changes: [],
        unchangedCount: manifest.entitiesDetected.total,
        targetContext: projectContext,
      };
      const built = generateChangePackage(dummyStaged, projectContext, manifest);
      setActiveChangePackage(built);
      return built;
    }

    const built = generateChangePackage(targetPkg, projectContext, manifest);
    setActiveChangePackage(built);
    setChangePackageHistory((prev) => [built, ...prev.filter((p) => p.id !== built.id)].slice(0, 20));
    return built;
  };

  const commitChangePackageToProject = (pkg: AuroraChangePackage) => {
    // 1. Safety snapshot
    const snapId = createSafetySnapshot(
      `Pre-Apply Snapshot: ${pkg.title}`,
      `Punto de restauración automático antes de aplicar paquete de cambios ${pkg.id}`
    );

    // 2. Apply changes to project context if staged context exists
    if (stagedPackage && stagedPackage.targetContext) {
      setProjectContext(stagedPackage.targetContext);
      setStagedPackage(null);
    }

    // 3. Mark package as applied
    const updatedPkg: AuroraChangePackage = {
      ...pkg,
      status: 'APPLIED',
      snapshotIdBeforeApply: snapId,
    };
    setActiveChangePackage(updatedPkg);
    setChangePackageHistory((prev) => [updatedPkg, ...prev.filter((p) => p.id !== pkg.id)]);
    setSyncStatus('CHANGES PENDING');

    // 4. Log in decision log
    logDirectorDecision(
      `Integración en Cursor: ${pkg.title}`,
      `Paquete con ${pkg.patches.length} modificaciones quirúrgicas aprobado y preparado para Cursor.`,
      'Cursor Integration',
      pkg.affectedEntities.length
    );

    showToast(`Paquete "${pkg.title}" preparado. Estado: CHANGES PENDING para Cursor.`, 'success');
  };

  const resolveConflict = (
    conflictId: string,
    resolution: 'keep_project' | 'keep_staged' | 'merged'
  ) => {
    const conflict = syncConflicts.find((c) => c.id === conflictId);
    if (!conflict) return;

    // Execute resolution
    const incomingDummy: ProjectContext = INITIAL_AURORA_PROJECT; // Safe baseline or imported
    const result = resolveSyncConflict(conflict, resolution, projectContext, incomingDummy);

    setProjectContext(result.resolvedContext);
    setSyncConflicts((prev) =>
      prev.map((c) => (c.id === conflictId ? result.updatedConflict : c))
    );
    showToast(`Conflicto resuelto: "${conflict.symbol}" (${resolution}).`, 'success');
  };

  const runProjectVerificationCheck = (): ProjectVerificationReport => {
    const report = runProjectVerification(projectContext, manifest);
    setVerificationReport(report);
    if (report.overallStatus === 'PASS') {
      showToast('Verificación del Proyecto: 0 errores. Listo para compilar en Cursor.', 'success');
    } else if (report.overallStatus === 'WARN') {
      showToast('Verificación del Proyecto con advertencias menores.', 'info');
    } else {
      showToast('Verificación del Proyecto: existen errores críticos que requieren corrección.', 'error');
    }
    return report;
  };

  const refreshManifest = (files?: RawFileInput[]): ProjectManifest => {
    const updated = generateProjectManifest(projectContext, files || []);
    return updated;
  };

  const markPackageExported = (pkgId: string) => {
    setChangePackageHistory((prev) =>
      prev.map((p) => (p.id === pkgId ? { ...p, status: 'EXPORTED' as const } : p))
    );
    if (activeChangePackage && activeChangePackage.id === pkgId) {
      setActiveChangePackage({ ...activeChangePackage, status: 'EXPORTED' });
    }
    setSyncStatus('CHANGES PENDING');
    showToast('Paquete marcado como EXPORTADO. Listo para integrar en Cursor.', 'info');
  };

  const markPackageApplied = (pkgId: string) => {
    setChangePackageHistory((prev) =>
      prev.map((p) => (p.id === pkgId ? { ...p, status: 'APPLIED' as const } : p))
    );
    if (activeChangePackage && activeChangePackage.id === pkgId) {
      setActiveChangePackage({ ...activeChangePackage, status: 'APPLIED' });
    }
    setSyncStatus('SYNCED');
    showToast('Paquete marcado como APLICADO en Cursor.', 'success');
  };

  const stageDirectChangePackage = (pkg: AuroraChangePackage) => {
    setActiveChangePackage(pkg);
    setActiveTab('cursor_integration');
  };

  return (
    <AuroraContext.Provider
      value={{
        projectContext,
        activeTab,
        setActiveTab,
        selectedEntity,
        setSelectedEntity,
        selectedVisualAsset,
        setSelectedVisualAsset,
        validationReport,
        projectAnalysis,
        knowledgeBase,
        visualQAReport,
        directorHealth,
        gameDesignEvaluations,
        worldCoherence,
        ecosystemAnalysis,
        progressionAnalysis,
        questDirectorAnalysis,
        narrativeAnalysis,
        directorRecommendations,
        decisionLog,
        isGenerating,
        setIsGenerating,
        activeModal,
        setActiveModal,
        toastMessage,
        showToast,
        stagedPackage,
        setStagedPackage,
        approveStagedChanges,
        rejectStagedChanges,

        // Phase 5 Integration
        manifest,
        syncStatus,
        setSyncStatus,
        activeChangePackage,
        setActiveChangePackage,
        changePackageHistory,
        syncConflicts,
        verificationReport,
        generatePackageFromStaged,
        commitChangePackageToProject,
        createSafetySnapshot,
        resolveConflict,
        runProjectVerificationCheck,
        refreshManifest,
        markPackageExported,
        markPackageApplied,
        stageDirectChangePackage,

        versionHistory,
        rollbackToVersion,
        undoLastChange,
        createManualSnapshot,
        addEntity,
        updateEntity,
        deleteEntity,
        duplicateEntity,
        applyValidationAutoFix,
        applyAllAutoFixes,
        resetToInitialProject,
        importProjectJSON,
        importProjectFiles,
        addVisualAsset,
        updateVisualAsset,
        deleteVisualAsset,
        updateStyleBible,
        stageVisualAssetGeneration,
        stageVisualVariantGeneration,
        applyVisualFix,
        applyAllVisualFixes,
        linkVisualAssetToEntity,
        generateContent,
        stageEntityGeneration,
        stageChainGeneration,
        stageSmartAction,
        executeWorldFix,
        stageDirectorPack,
        stageAutoBalance,
        logDirectorDecision,
        generateDesignReport,

        // Phase 6
        systemHealthReport,
        finalProjectHealthReport,
        isOnboardingOpen,
        setIsOnboardingOpen,
        completeOnboarding,
        runFullSystemHealthCheck,
      }}
    >
      {children}
    </AuroraContext.Provider>
  );
};

export const useAurora = () => {
  const context = useContext(AuroraContext);
  if (!context) {
    throw new Error('useAurora must be used within an AuroraProvider');
  }
  return context;
};
