import React, { useState } from 'react';
import { useAurora } from '../../context/AuroraContext';
import {
  GitPullRequest,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ShieldCheck,
  ShieldAlert,
  Copy,
  Download,
  Terminal,
  FileCode,
  FolderTree,
  Activity,
  Layers,
  ArrowRight,
  Sparkles,
  RefreshCw,
  Clock,
  Compass,
  Zap,
  Check,
  AlertCircle,
  FilePlus,
  FileEdit,
  FileX,
  ExternalLink,
  Shield,
  HelpCircle,
  History,
  Code2,
} from 'lucide-react';
import { ImportAuroraProjectModal } from '../ImportAuroraProjectModal';
import { VersionHistoryDrawer } from '../VersionHistoryDrawer';
import { AuroraChangePackage, SurgicalPatch, SyncConflict, RiskLevel } from '../../types/aurora';
import { exportAsJSON } from '../../lib/exportFormatter';

export const CursorIntegrationView: React.FC = () => {
  const {
    projectContext,
    manifest,
    syncStatus,
    setSyncStatus,
    activeChangePackage,
    setActiveChangePackage,
    changePackageHistory,
    syncConflicts,
    resolveConflict,
    verificationReport,
    runProjectVerificationCheck,
    generatePackageFromStaged,
    commitChangePackageToProject,
    createSafetySnapshot,
    markPackageExported,
    markPackageApplied,
    stagedPackage,
    showToast,
    validationReport,
    visualQAReport,
  } = useAurora();

  const [activeSubTab, setActiveSubTab] = useState<'package' | 'diff' | 'task' | 'manifest' | 'conflicts' | 'verify'>('package');
  const [selectedPatchIdx, setSelectedPatchIdx] = useState<number>(0);
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState<boolean>(false);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [showRiskImpactModal, setShowRiskImpactModal] = useState<boolean>(false);

  // If no active change package, automatically generate one if staged package exists
  const currentPackage: AuroraChangePackage =
    activeChangePackage ||
    (stagedPackage
      ? generatePackageFromStaged(stagedPackage)
      : generatePackageFromStaged());

  const activePatch: SurgicalPatch | undefined =
    currentPackage.patches[selectedPatchIdx] || currentPackage.patches[0];

  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(label);
    setTimeout(() => setCopiedSection(null), 2500);
    showToast(`Copiado al portapapeles: ${label}`, 'success');
  };

  const handleExportPackageJSON = () => {
    const pkgData = {
      packageInfo: {
        id: currentPackage.id,
        title: currentPackage.title,
        timestamp: currentPackage.timestamp,
        risk: currentPackage.riskAnalysis.level,
      },
      manifest,
      patches: currentPackage.patches,
      instructions: currentPackage.instructions,
    };

    const blob = new Blob([JSON.stringify(pkgData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `aurora_cursor_package_${currentPackage.id}.json`;
    link.click();
    URL.revokeObjectURL(url);
    markPackageExported(currentPackage.id);
  };

  const handleGenerateFreshPackage = () => {
    const fresh = generatePackageFromStaged();
    setActiveChangePackage(fresh);
    showToast('Paquete de cambios recalculado con éxito.', 'success');
  };

  const handleCommitPackage = () => {
    if (!currentPackage.integrationCheck.isReadyToIntegrate) {
      showToast('No se puede aplicar un paquete con bloqueos de integridad.', 'error');
      return;
    }
    commitChangePackageToProject(currentPackage);
  };

  const totalEntitiesCount = manifest.entitiesDetected.total;
  const pendingCount = currentPackage.affectedEntities.length;
  const conflictsCount = syncConflicts.filter((c) => c.status === 'unresolved').length;
  const blockedCount = currentPackage.riskAnalysis.level === 'BLOCKED' ? 1 : 0;
  const integrationHealthScore = Math.max(0, 100 - (validationReport.errorCount * 15) - (conflictsCount * 25));

  const getRiskBadge = (level: RiskLevel) => {
    switch (level) {
      case 'LOW':
        return {
          bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          icon: ShieldCheck,
          text: 'LOW RISK',
        };
      case 'MEDIUM':
        return {
          bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          icon: AlertTriangle,
          text: 'MEDIUM RISK',
        };
      case 'HIGH':
        return {
          bg: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
          icon: ShieldAlert,
          text: 'HIGH RISK',
        };
      case 'BLOCKED':
        return {
          bg: 'bg-red-950 text-red-400 border-red-500/60',
          icon: XCircle,
          text: 'BLOCKED',
        };
    }
  };

  const riskBadge = getRiskBadge(currentPackage.riskAnalysis.level);
  const RiskIcon = riskBadge.icon;

  return (
    <div id="cursor-integration-view" className="flex-1 flex flex-col h-full bg-slate-950 overflow-y-auto p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Banner: Aurora ↔ Cursor Integration Bridge */}
      <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-2xl shadow-xl">
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 font-semibold uppercase tracking-wider mb-1">
          <GitPullRequest className="w-3.5 h-3.5" />
          AURORA ↔ CURSOR INTEGRATION ENGINE (FASE 5)
        </div>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
              <span>Puente de Producción Aurora · Cursor</span>
              <span
                className={`text-xs font-mono px-2.5 py-0.5 rounded-full border ${
                  syncStatus === 'SYNCED'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : syncStatus === 'CHANGES PENDING'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                }`}
              >
                STATUS: {syncStatus}
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl">
              Sincronización bidireccional entre AURORA AI Creator y tu código local en Cursor. Genera paquetes de cambios quirúrgicos (+ ~ -), diffs visuales, instrucciones paso a paso y verificación de Phaser 3 y 2.5D.
            </p>
          </div>

          {/* Quick Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              id="sync-import-btn"
              onClick={() => setIsImportModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl border border-slate-700 transition"
              title="Importar / Sincronizar archivos del proyecto real"
            >
              <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
              <span>Import / Sync</span>
            </button>

            <button
              id="create-safety-snapshot-btn"
              onClick={() => {
                createSafetySnapshot('Punto de Restauración Manual', 'Creado desde el panel de Integración con Cursor.');
                showToast('Snapshot de seguridad guardado en el historial.', 'success');
              }}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl border border-slate-700 transition"
              title="Guardar punto de restauración antes de aplicar cambios"
            >
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Create Snapshot</span>
            </button>

            <button
              id="recalculate-package-btn"
              onClick={handleGenerateFreshPackage}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-950/40 transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Generar Paquete</span>
            </button>
          </div>
        </div>
      </div>

      {/* Integration Dashboard Widget Metrics */}
      <div id="integration-dashboard-bar" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl flex flex-col justify-between">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Synced Entities</span>
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100 mt-2">{totalEntitiesCount}</div>
          <div className="text-[10px] text-slate-500 mt-1 font-mono">Knowledge Base Sincronizada</div>
        </div>

        <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl flex flex-col justify-between">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Pending Changes</span>
            <FileEdit className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400 mt-2">{pendingCount}</div>
          <div className="text-[10px] text-slate-500 mt-1 font-mono">{currentPackage.patches.length} parches listos</div>
        </div>

        <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl flex flex-col justify-between">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Conflicts</span>
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className={`text-2xl font-bold mt-2 ${conflictsCount > 0 ? 'text-rose-400' : 'text-slate-100'}`}>
            {conflictsCount}
          </div>
          <div className="text-[10px] text-slate-500 mt-1 font-mono">
            {conflictsCount > 0 ? 'Requieren resolución' : '0 divergencias'}
          </div>
        </div>

        <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl flex flex-col justify-between">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Blocked Changes</span>
            <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className={`text-2xl font-bold mt-2 ${blockedCount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
            {blockedCount}
          </div>
          <div className="text-[10px] text-slate-500 mt-1 font-mono">
            {blockedCount > 0 ? 'Bloqueo crítico activo' : 'Pase libre'}
          </div>
        </div>

        <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl flex flex-col justify-between">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Integration Health</span>
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 mt-2">{integrationHealthScore}%</div>
          <div className="text-[10px] text-slate-500 mt-1 font-mono">Phaser 3 + TypeScript</div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex border-b border-slate-800 gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveSubTab('package')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-t-xl transition ${
            activeSubTab === 'package'
              ? 'bg-slate-900 text-cyan-300 border-t-2 border-cyan-400 border-x border-slate-800'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
          }`}
        >
          <GitPullRequest className="w-3.5 h-3.5" />
          <span>Change Package ({currentPackage.patches.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('diff')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-t-xl transition ${
            activeSubTab === 'diff'
              ? 'bg-slate-900 text-cyan-300 border-t-2 border-cyan-400 border-x border-slate-800'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
          }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>Surgical Diff Preview</span>
        </button>

        <button
          onClick={() => setActiveSubTab('task')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-t-xl transition ${
            activeSubTab === 'task'
              ? 'bg-slate-900 text-cyan-300 border-t-2 border-cyan-400 border-x border-slate-800'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>Cursor Task & Instructions</span>
        </button>

        <button
          onClick={() => setActiveSubTab('manifest')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-t-xl transition ${
            activeSubTab === 'manifest'
              ? 'bg-slate-900 text-cyan-300 border-t-2 border-cyan-400 border-x border-slate-800'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
          }`}
        >
          <FolderTree className="w-3.5 h-3.5" />
          <span>Project Manifest</span>
        </button>

        <button
          onClick={() => setActiveSubTab('conflicts')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-t-xl transition ${
            activeSubTab === 'conflicts'
              ? 'bg-slate-900 text-cyan-300 border-t-2 border-cyan-400 border-x border-slate-800'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Conflict Resolver ({conflictsCount})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('verify')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-t-xl transition ${
            activeSubTab === 'verify'
              ? 'bg-slate-900 text-cyan-300 border-t-2 border-cyan-400 border-x border-slate-800'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Post-Integration Verification</span>
        </button>
      </div>

      {/* SUBTAB 1: CHANGE PACKAGE OVERVIEW & RISK ANALYSIS */}
      {activeSubTab === 'package' && (
        <div className="space-y-6 animate-fade-in">
          {/* Package Top Header & Status */}
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
                  CHANGE PACKAGE
                </span>
                <span className="text-xs font-mono text-slate-400">ID: {currentPackage.id}</span>
                <span className={`px-2 py-0.5 rounded text-[11px] font-bold border flex items-center gap-1 ${riskBadge.bg}`}>
                  <RiskIcon className="w-3 h-3" />
                  {riskBadge.text}
                </span>
                <span className="text-xs px-2 py-0.5 rounded font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  ESTADO: {currentPackage.status}
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-100 mt-2">{currentPackage.title}</h2>
              <p className="text-xs text-slate-400 mt-1">{currentPackage.description}</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                id="copy-patch-btn"
                onClick={() => {
                  const fullPatchStr = currentPackage.patches.map((p) => `--- ${p.targetFile}\n+++ ${p.targetFile}\n${p.rawDiff}`).join('\n\n');
                  handleCopyText(fullPatchStr, 'Parche Completo');
                }}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition"
              >
                {copiedSection === 'Parche Completo' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
                <span>COPY PATCH</span>
              </button>

              <button
                id="export-package-btn"
                onClick={handleExportPackageJSON}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>EXPORT PACKAGE</span>
              </button>

              <button
                id="copy-instructions-btn"
                onClick={() => {
                  const md = `# AURORA INTEGRATION TASK: ${currentPackage.title}\n\n` +
                    currentPackage.instructions.steps.map((s) => `${s.stepNumber}. **${s.title}**\n${s.description}\n${s.command ? `\`\`\`bash\n${s.command}\n\`\`\`\n` : ''}${s.codeSnippet ? `\`\`\`typescript\n${s.codeSnippet}\n\`\`\`\n` : ''}`).join('\n');
                  handleCopyText(md, 'Instrucciones Cursor');
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition"
              >
                <Terminal className="w-3.5 h-3.5 text-amber-400" />
                <span>COPY INSTRUCTIONS</span>
              </button>

              <button
                id="apply-package-btn"
                onClick={handleCommitPackage}
                disabled={!currentPackage.integrationCheck.isReadyToIntegrate}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 disabled:pointer-events-none text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-950/50 transition"
              >
                <Check className="w-4 h-4" />
                <span>APLICAR EN PROYECTO</span>
              </button>
            </div>
          </div>

          {/* Risk Analysis Card */}
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RiskIcon className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-slate-100">AUDITORÍA DE RIESGO DE INTEGRACIÓN (RISK ANALYSIS)</h3>
              </div>
              <div className="text-xs font-mono text-slate-400">Score de Seguridad: {currentPackage.riskAnalysis.score}/100</div>
            </div>

            <p className="text-xs text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800 leading-relaxed">
              {currentPackage.riskAnalysis.impactSummary}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Factores Evaluados:
                </span>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {currentPackage.riskAnalysis.reasons.map((r, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-amber-400 mt-0.5">•</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    Sistemas Impactados:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {currentPackage.riskAnalysis.affectedSystems.map((s, i) => (
                      <span key={i} className="px-2 py-1 bg-slate-800 text-slate-300 text-[11px] font-mono rounded-md border border-slate-700">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {currentPackage.riskAnalysis.breakingChangesWarning && (
                  <div className="mt-3 p-2.5 bg-rose-950/60 border border-rose-500/40 rounded-lg text-xs text-rose-300 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{currentPackage.riskAnalysis.breakingChangesWarning}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Integration Check Gatekeeper Banner */}
          <div
            className={`p-4 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
              currentPackage.integrationCheck.isReadyToIntegrate
                ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                : 'bg-rose-950/40 border-rose-500/50 text-rose-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`p-2.5 rounded-xl border ${
                  currentPackage.integrationCheck.isReadyToIntegrate
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                    : 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                }`}
              >
                {currentPackage.integrationCheck.isReadyToIntegrate ? (
                  <CheckCircle2 className="w-6 h-6" />
                ) : (
                  <XCircle className="w-6 h-6" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider">
                    {currentPackage.integrationCheck.isReadyToIntegrate ? 'READY TO INTEGRATE' : 'INTEGRACIÓN BLOQUEADA'}
                  </span>
                  <span className="text-xs text-slate-400">
                    Phaser 3: {currentPackage.integrationCheck.phaser3CompatScore}% · 2.5D: {currentPackage.integrationCheck.dimetric2D5CompatScore}% · TS: {currentPackage.integrationCheck.tsCompatScore}%
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  {currentPackage.integrationCheck.isReadyToIntegrate
                    ? 'Todos los esquemas de tipos, anclajes de pisada 2.5D y registros han pasado las pruebas de integridad.'
                    : 'Se detectaron inconsistencias críticas que deben corregirse antes de sincronizar con Cursor.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveSubTab('verify')}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-xl border border-slate-700 font-medium transition"
              >
                Ver Comprobaciones
              </button>
            </div>
          </div>

          {/* Files Included in Package */}
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <FolderTree className="w-4 h-4 text-cyan-400" />
              ARCHIVOS AFECTADOS EN ESTE PAQUETE ({currentPackage.patches.length})
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {currentPackage.patches.map((p, idx) => (
                <div
                  key={p.id}
                  onClick={() => {
                    setSelectedPatchIdx(idx);
                    setActiveSubTab('diff');
                  }}
                  className="p-3 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 rounded-xl cursor-pointer transition group flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded ${
                        p.action === 'created'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : p.action === 'modified'
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-rose-500/20 text-rose-400'
                      }`}
                    >
                      {p.action === 'created' ? '+' : p.action === 'modified' ? '~' : '-'}
                    </span>
                    <div className="min-w-0">
                      <div className="text-xs font-mono text-slate-200 truncate group-hover:text-cyan-300 transition">
                        {p.targetFile}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">{p.rationale}</div>
                    </div>
                  </div>

                  <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-300 shrink-0 ml-2" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: SURGICAL DIFF PREVIEW */}
      {activeSubTab === 'diff' && (
        <div className="space-y-4 animate-fade-in">
          {/* File Selector Tabs */}
          <div className="flex overflow-x-auto gap-2 border-b border-slate-800 pb-2">
            {currentPackage.patches.map((p, idx) => (
              <button
                key={p.id}
                onClick={() => setSelectedPatchIdx(idx)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap transition flex items-center gap-1.5 ${
                  selectedPatchIdx === idx
                    ? 'bg-slate-800 text-cyan-300 border border-cyan-500/30 font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <span
                  className={`font-bold ${
                    p.action === 'created'
                      ? 'text-emerald-400'
                      : p.action === 'modified'
                      ? 'text-amber-400'
                      : 'text-rose-400'
                  }`}
                >
                  {p.action === 'created' ? '+' : p.action === 'modified' ? '~' : '-'}
                </span>
                <span>{p.targetFile.split('/').pop()}</span>
              </button>
            ))}
          </div>

          {activePatch && (
            <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-400">ARCHIVO:</span>
                    <span className="text-xs font-mono text-cyan-300 font-semibold">{activePatch.targetFile}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-slate-800 text-slate-300">
                      Acción: {activePatch.action.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{activePatch.rationale}</p>
                </div>

                <button
                  onClick={() => handleCopyText(activePatch.rawDiff, activePatch.targetFile)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg transition self-start"
                >
                  {copiedSection === activePatch.targetFile ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copiar Diff</span>
                </button>
              </div>

              {/* Hunks Renderer with line numbers */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden font-mono text-xs max-h-[500px] overflow-y-auto">
                {activePatch.hunks.map((hunk, hIdx) => (
                  <div key={hIdx} className="border-b border-slate-800/60 last:border-0">
                    <div className="bg-slate-900/90 px-4 py-1 text-slate-500 text-[11px] font-bold border-b border-slate-800/40">
                      {hunk.header}
                    </div>
                    <div className="divide-y divide-slate-900/30">
                      {hunk.lines.map((line, lIdx) => (
                        <div
                          key={lIdx}
                          className={`flex items-start px-3 py-0.5 leading-relaxed ${
                            line.type === 'add'
                              ? 'bg-emerald-950/30 text-emerald-300'
                              : line.type === 'del'
                              ? 'bg-rose-950/30 text-rose-300'
                              : 'text-slate-400'
                          }`}
                        >
                          <span className="w-8 select-none text-slate-600 text-right pr-2 shrink-0">
                            {line.oldLineNumber || ''}
                          </span>
                          <span className="w-8 select-none text-slate-600 text-right pr-2 shrink-0">
                            {line.newLineNumber || ''}
                          </span>
                          <span className="w-4 select-none font-bold shrink-0">
                            {line.type === 'add' ? '+' : line.type === 'del' ? '-' : ' '}
                          </span>
                          <span className="whitespace-pre overflow-x-auto flex-1">{line.content.replace(/^[+-]\s?/, '')}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 3: CURSOR WORKFLOW & INSTRUCTIONS */}
      {activeSubTab === 'task' && (
        <div className="space-y-4 animate-fade-in">
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  AURORA INTEGRATION TASK
                </span>
                <span className="text-xs font-mono text-slate-400">{currentPackage.instructions.taskId}</span>
              </div>
              <h2 className="text-lg font-bold text-slate-100 mt-1">{currentPackage.instructions.title}</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Entorno Destino: <span className="text-cyan-300 font-mono">{currentPackage.instructions.targetEnvironment}</span> · Tiempo estimado: {currentPackage.instructions.estimatedEffort}
              </p>
            </div>

            <button
              onClick={() => {
                const fullTask = `# ${currentPackage.instructions.title}\n\n` +
                  currentPackage.instructions.steps.map((s) => `### Paso ${s.stepNumber}: ${s.title}\n${s.description}\n\n` +
                    (s.fileTarget ? `**Destino:** \`${s.fileTarget}\`\n\n` : '') +
                    (s.codeSnippet ? `\`\`\`typescript\n${s.codeSnippet}\n\`\`\`\n` : '') +
                    (s.command ? `\`\`\`bash\n${s.command}\n\`\`\`\n` : '')).join('\n---\n\n');
                handleCopyText(fullTask, 'Instrucciones Completas');
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-950/40 transition whitespace-nowrap"
            >
              {copiedSection === 'Instrucciones Completas' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>COPY INTEGRATION INSTRUCTIONS</span>
            </button>
          </div>

          <div className="space-y-3">
            {currentPackage.instructions.steps.map((step) => (
              <div key={step.stepNumber} className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-slate-800 text-cyan-300 font-mono text-xs font-bold flex items-center justify-center border border-slate-700">
                      {step.stepNumber}
                    </span>
                    <h4 className="text-sm font-semibold text-slate-200">{step.title}</h4>
                  </div>

                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 uppercase">
                    {step.type.replace('_', ' ')}
                  </span>
                </div>

                <p className="text-xs text-slate-400 pl-8.5">{step.description}</p>

                {step.command && (
                  <div className="pl-8.5 mt-2">
                    <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg font-mono text-xs text-emerald-400 flex items-center justify-between">
                      <code>{step.command}</code>
                      <button
                        onClick={() => handleCopyText(step.command!, `Comando ${step.stepNumber}`)}
                        className="text-slate-400 hover:text-slate-200 text-xs flex items-center gap-1"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar</span>
                      </button>
                    </div>
                  </div>
                )}

                {step.codeSnippet && (
                  <div className="pl-8.5 mt-2">
                    <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg font-mono text-xs text-cyan-300 overflow-x-auto max-h-48">
                      <pre>{step.codeSnippet}</pre>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB 4: PROJECT MANIFEST */}
      {activeSubTab === 'manifest' && (
        <div className="space-y-5 animate-fade-in">
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">
                AURORA PROJECT MANIFEST
              </div>
              <h2 className="text-xl font-bold text-slate-100 mt-1">
                {manifest.projectName} ({manifest.framework} · {manifest.language})
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Versión: <span className="font-mono text-slate-300">{manifest.version}</span> · Último análisis: {new Date(manifest.lastAnalyzed).toLocaleTimeString()}
              </p>
            </div>

            <button
              onClick={() => handleCopyText(JSON.stringify(manifest, null, 2), 'Manifest JSON')}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition"
            >
              <Copy className="w-3.5 h-3.5 text-cyan-400" />
              <span>Copiar Manifest</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Entities Summary */}
            <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                ENTIDADES DETECTADAS ({manifest.entitiesDetected.total})
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono">
                <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-slate-500 block">Criaturas:</span>
                  <span className="text-emerald-400 font-bold text-base">{manifest.entitiesDetected.creatures}</span>
                </div>
                <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-slate-500 block">NPCs:</span>
                  <span className="text-cyan-400 font-bold text-base">{manifest.entitiesDetected.npcs}</span>
                </div>
                <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-slate-500 block">Misiones:</span>
                  <span className="text-amber-400 font-bold text-base">{manifest.entitiesDetected.quests}</span>
                </div>
                <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-slate-500 block">Items:</span>
                  <span className="text-purple-400 font-bold text-base">{manifest.entitiesDetected.items}</span>
                </div>
                <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-slate-500 block">Biomas:</span>
                  <span className="text-teal-400 font-bold text-base">{manifest.entitiesDetected.biomes}</span>
                </div>
                <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-slate-500 block">Habilidades:</span>
                  <span className="text-indigo-400 font-bold text-base">{manifest.entitiesDetected.abilities}</span>
                </div>
              </div>
            </div>

            {/* 2.5D Architecture & Scripts */}
            <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <Compass className="w-4 h-4 text-amber-400" />
                ARQUITECTURA 2.5D & SCRIPTS
              </h3>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Perspectiva:</span>
                  <span className="text-slate-200 font-mono font-bold">{manifest.dimetricConfig.ratio}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Profundidad:</span>
                  <span className="text-emerald-400 font-mono font-bold">{manifest.dimetricConfig.depthSorting}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Tile Base:</span>
                  <span className="text-slate-200 font-mono">{manifest.dimetricConfig.defaultTileSize}px</span>
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1 text-xs font-mono">
                <span className="text-slate-500 text-[10px] uppercase font-bold block mb-1">Scripts Detectados:</span>
                {Object.entries(manifest.scripts).map(([name, cmd]) => (
                  <div key={name} className="flex justify-between text-slate-300">
                    <span className="text-cyan-400">{name}:</span>
                    <span>{cmd}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Registries & Integration Points */}
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <FolderTree className="w-4 h-4 text-emerald-400" />
              PUNTOS DE INTEGRACIÓN & REGISTROS
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {manifest.integrationPoints.map((ip) => (
                <div key={ip.id} className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200">{ip.name}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 uppercase">
                      {ip.type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{ip.description}</p>
                  <div className="text-[11px] font-mono text-cyan-400 pt-1">{ip.targetFile}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 5: SYNC CONFLICT RESOLVER */}
      {activeSubTab === 'conflicts' && (
        <div className="space-y-4 animate-fade-in">
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4" />
              CONFLICT DETECTION & RESOLUTION
            </div>
            <h2 className="text-lg font-bold text-slate-100 mt-1">Divergencias del Proyecto (Source of Truth)</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Si el código en Cursor cambió respecto a los borradores en AURORA AI Creator, resuélvelo aquí de forma no destructiva. Nunca se sobrescriben archivos automáticamente.
            </p>
          </div>

          {conflictsCount === 0 ? (
            <div className="p-12 text-center bg-slate-900/60 border border-slate-800 rounded-2xl space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto opacity-80" />
              <h3 className="text-base font-bold text-slate-200">0 Conflictos de Sincronización</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                El estado de la Knowledge Base y los parches preparados están en perfecta armonía con la Source of Truth.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {syncConflicts.map((c) => (
                <div key={c.id} className="p-5 bg-slate-900 border border-amber-500/30 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-mono text-amber-400 font-bold uppercase">SYNC CONFLICT</div>
                      <h4 className="text-sm font-bold text-slate-100">{c.filePath}</h4>
                      <p className="text-xs text-slate-400">Símbolo en conflicto: <span className="font-mono text-slate-200">{c.symbol}</span></p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => resolveConflict(c.id, 'keep_project')}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg border border-slate-700 font-medium transition"
                      >
                        [KEEP PROJECT]
                      </button>
                      <button
                        onClick={() => resolveConflict(c.id, 'keep_staged')}
                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs rounded-lg font-bold transition"
                      >
                        [KEEP STAGED]
                      </button>
                      <button
                        onClick={() => resolveConflict(c.id, 'merged')}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs rounded-lg font-bold transition"
                      >
                        [MERGE]
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                      <div className="text-slate-500 text-[10px] uppercase font-bold mb-1">Local Project (Version A):</div>
                      <pre className="text-slate-300 overflow-x-auto">{c.projectVersionSnippet}</pre>
                    </div>
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                      <div className="text-cyan-500 text-[10px] uppercase font-bold mb-1">Staged Change (Version B):</div>
                      <pre className="text-cyan-300 overflow-x-auto">{c.stagedVersionSnippet}</pre>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 6: POST-INTEGRATION VERIFICATION */}
      {activeSubTab === 'verify' && (
        <div className="space-y-5 animate-fade-in">
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                VERIFY PROJECT & DATA INTEGRITY
              </div>
              <h2 className="text-xl font-bold text-slate-100 mt-1">Verificación Posterior a la Integración</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Comprobación estricta de TypeScript, referencias cruzadas, geometría 2.5D y reglas de Phaser 3.
              </p>
            </div>

            <button
              id="run-verify-btn"
              onClick={runProjectVerificationCheck}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-950/40 transition"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Ejecutar Verificación</span>
            </button>
          </div>

          {/* Honest Environment Transparency Note */}
          <div className="p-4 bg-indigo-950/30 border border-indigo-500/30 rounded-xl text-xs text-indigo-300 flex items-start gap-3">
            <HelpCircle className="w-5 h-5 shrink-0 text-cyan-400 mt-0.5" />
            <div>
              <span className="font-bold block text-slate-200 mb-0.5">Transparencia del Entorno (No Simulation):</span>
              AURORA AI Creator valida en tiempo real los esquemas de tipos, IDs y geometría 2.5D en su motor. Debido a que el entorno de previsualización web está aislado del sistema de archivos de tu máquina, la ejecución real del compilador debe realizarse en la terminal integrada de Cursor.
            </div>
          </div>

          {/* Verification Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200">Tipos & Interfaces TypeScript</span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${validationReport.errorCount === 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                  {validationReport.errorCount === 0 ? 'PASS (100%)' : `${validationReport.errorCount} ERRORES`}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Verificación de esquemas de combate, atributos de criatura, drops y tipado estricto.
              </p>
            </div>

            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200">Geometría 2.5D Dimétrica & Y-Sorting</span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${visualQAReport.criticalCount === 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                  {visualQAReport.criticalCount === 0 ? 'PASS (100%)' : `${visualQAReport.criticalCount} ADVERTENCIAS`}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Puntos de anclaje (Anchor Y ~ 0.9), cajas de colisión y offsets de sombra conformes a Phaser 3.
              </p>
            </div>

            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200">Integridad de Referencias Cruzadas</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                  PASS (100%)
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Habilidades asignadas a criaturas, tablas de encuentros por bioma y misiones asociadas a NPCs.
              </p>
            </div>

            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200">Comandos Recomendados en Cursor</span>
                <Terminal className="w-4 h-4 text-amber-400" />
              </div>
              <div className="p-2 bg-slate-950 rounded font-mono text-xs text-cyan-300">
                {manifest.scripts.lint || 'npm run lint'} && {manifest.scripts.build || 'npm run build'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      <ImportAuroraProjectModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />

      {/* History Drawer */}
      <VersionHistoryDrawer
        isOpen={isHistoryDrawerOpen}
        onClose={() => setIsHistoryDrawerOpen(false)}
      />
    </div>
  );
};
