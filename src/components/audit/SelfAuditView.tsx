import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Info,
  CheckCircle2,
  RefreshCw,
  Zap,
  Lock,
  Layers,
  FileCode2,
  Cpu,
  Database,
  Search,
  ArrowRight,
  GitBranch,
  Shield,
  Eye,
} from 'lucide-react';
import { useAurora } from '../../context/AuroraContext';
import { AuditCategory, AuditSeverity, AuditFinding, AuditRunResult } from '../../types/aurora';
import { runFullSelfAudit, loadLastAuditResult } from '../../lib/selfAuditEngine';
import { generateSelfHealingFix } from '../../lib/maintenanceEngine';

export const SelfAuditView: React.FC = () => {
  const { projectContext, addStagedPackage, setActiveTab } = useAurora();
  const [auditResult, setAuditResult] = useState<AuditRunResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [healedFindings, setHealedFindings] = useState<Set<string>>(new Set());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const cached = loadLastAuditResult();
    if (cached) {
      setAuditResult(cached);
    } else {
      const res = runFullSelfAudit(projectContext);
      setAuditResult(res);
    }
  }, [projectContext]);

  const handleRunAudit = () => {
    setIsRunning(true);
    setTimeout(() => {
      const res = runFullSelfAudit(projectContext);
      setAuditResult(res);
      setIsRunning(false);
      showToast('Auditoría determinista completada con éxito. 0 € API Calls utilizadas.');
    }, 350);
  };

  const handleGenerateFix = (finding: AuditFinding) => {
    const fixPkg = generateSelfHealingFix(finding, projectContext);
    addStagedPackage(fixPkg);
    setHealedFindings((prev) => new Set([...prev, finding.id]));
    showToast(`Fix para "${finding.title}" enviado al área de Staging para revisión.`);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const categories: { id: AuditCategory; label: string; icon: any }[] = [
    { id: 'code', label: 'Código & Tipos', icon: FileCode2 },
    { id: 'data', label: 'Integridad de Datos', icon: Database },
    { id: 'knowledge_base', label: 'Knowledge Base', icon: Layers },
    { id: 'project_connector', label: 'Conector Cursor', icon: GitBranch },
    { id: 'ui', label: 'UI & Accesibilidad', icon: Eye },
    { id: 'performance_engine', label: 'Performance 60FPS', icon: Cpu },
    { id: 'ai_router', label: 'AI Router & Cost', icon: Zap },
    { id: 'cache', label: 'Cache & Memoria', icon: RefreshCw },
    { id: 'electron', label: 'Electron Sandbox', icon: Shield },
    { id: 'storage', label: 'Almacenamiento', icon: Database },
    { id: 'security', label: 'Seguridad & Secretos', icon: Lock },
    { id: 'integration', label: '2.5D Y-Sort & Phaser', icon: Layers },
  ];

  const filteredFindings = (auditResult?.findings || []).filter((f) => {
    const matchesSeverity = selectedSeverity === 'ALL' || f.severity === selectedSeverity;
    const matchesCategory = selectedCategory === 'ALL' || f.category === selectedCategory;
    const matchesSearch =
      f.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.problem.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.solution.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSeverity && matchesCategory && matchesSearch;
  });

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
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/30 rounded-lg text-indigo-400">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  Aurora Self-Audit Engine 2.2
                </h1>
                <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  ZERO-COST DETERMINISTIC
                </span>
              </div>
              <p className="text-slate-400 text-sm">
                Auditoría autónoma multi-capa: Código, Datos, Seguridad, Performance, Cache y 2.5D.
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls & Zero-Cost KPI */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs text-slate-400 uppercase tracking-wider font-medium">
                API Calls Usadas
              </div>
              <div className="text-xl font-bold text-emerald-400">0</div>
            </div>
            <div className="h-8 w-px bg-slate-800" />
            <div className="text-right">
              <div className="text-xs text-slate-400 uppercase tracking-wider font-medium">
                Health Score
              </div>
              <div className="text-xl font-bold text-indigo-400">
                {auditResult ? `${auditResult.score}%` : '--'}
              </div>
            </div>
          </div>

          <button
            onClick={handleRunAudit}
            disabled={isRunning}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2.5 rounded-lg transition shadow-lg shadow-indigo-900/20 disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} />
            {isRunning ? 'Auditoría en Curso...' : 'Ejecutar Self-Audit (0€)'}
          </button>
        </div>
      </div>

      {/* Metrics Summary Strip */}
      {auditResult && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3">
            <div className="text-xs text-slate-400">Total Chequeos</div>
            <div className="text-lg font-bold text-slate-200 mt-1">
              {auditResult.totalChecks}
            </div>
          </div>
          <div className="bg-slate-900/80 border border-rose-900/30 rounded-lg p-3">
            <div className="text-xs text-rose-400 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5" />
              CRITICAL
            </div>
            <div className="text-lg font-bold text-rose-400 mt-1">
              {auditResult.summary.critical}
            </div>
          </div>
          <div className="bg-slate-900/80 border border-orange-900/30 rounded-lg p-3">
            <div className="text-xs text-orange-400 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              HIGH
            </div>
            <div className="text-lg font-bold text-orange-400 mt-1">
              {auditResult.summary.high}
            </div>
          </div>
          <div className="bg-slate-900/80 border border-amber-900/30 rounded-lg p-3">
            <div className="text-xs text-amber-400 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              MEDIUM
            </div>
            <div className="text-lg font-bold text-amber-400 mt-1">
              {auditResult.summary.medium}
            </div>
          </div>
          <div className="bg-slate-900/80 border border-blue-900/30 rounded-lg p-3">
            <div className="text-xs text-blue-400 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5" />
              LOW
            </div>
            <div className="text-lg font-bold text-blue-400 mt-1">
              {auditResult.summary.low}
            </div>
          </div>
          <div className="bg-slate-900/80 border border-emerald-900/30 rounded-lg p-3">
            <div className="text-xs text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Duración Local
            </div>
            <div className="text-lg font-bold text-emerald-400 mt-1">
              {auditResult.durationMs} ms
            </div>
          </div>
        </div>
      )}

      {/* Category Scores Grid */}
      {auditResult && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
            Desglose de Salud por Subsistema (12 Áreas)
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {categories.map((cat) => {
              const score = auditResult.categoryScores[cat.id] ?? 100;
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(selectedCategory === cat.id ? 'ALL' : cat.id)}
                  className={`p-3 rounded-lg border text-left transition flex items-center justify-between cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-indigo-950/40 border-indigo-500/50'
                      : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="text-xs font-medium text-slate-300">{cat.label}</span>
                  </div>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded ${
                      score === 100
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : score >= 80
                        ? 'bg-amber-500/10 text-amber-400'
                        : 'bg-rose-500/10 text-rose-400'
                    }`}
                  >
                    {score}%
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-900/40 border border-slate-800/80 rounded-lg p-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-400 font-medium mr-1">Severidad:</span>
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((sev) => (
            <button
              key={sev}
              onClick={() => setSelectedSeverity(sev)}
              className={`px-3 py-1 text-xs rounded-md font-medium transition cursor-pointer ${
                selectedSeverity === sev
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar problemas, soluciones..."
            className="w-full bg-slate-950 border border-slate-800 rounded-md pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Findings List */}
      <div className="space-y-3">
        {filteredFindings.length === 0 ? (
          <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-10 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <h3 className="text-lg font-semibold text-slate-200">
              No se detectaron problemas en los filtros seleccionados
            </h3>
            <p className="text-sm text-slate-400 max-w-md mx-auto">
              Todos los esquemas, enlaces de datos, reglas de seguridad y balance 2.5D cumplen con
              la especificación Aurora 2.2.
            </p>
          </div>
        ) : (
          filteredFindings.map((finding) => {
            const isHealed = healedFindings.has(finding.id);
            return (
              <div
                key={finding.id}
                className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-xl p-5 transition space-y-4"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2.5 py-0.5 text-xs font-bold rounded-md ${
                        finding.severity === 'CRITICAL'
                          ? 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
                          : finding.severity === 'HIGH'
                          ? 'bg-orange-500/10 border border-orange-500/30 text-orange-400'
                          : finding.severity === 'MEDIUM'
                          ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400'
                          : 'bg-blue-500/10 border border-blue-500/30 text-blue-400'
                      }`}
                    >
                      {finding.severity}
                    </span>
                    <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                      {finding.category.replace('_', ' ')}
                    </span>
                    {finding.fileTarget && (
                      <span className="text-xs font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                        {finding.fileTarget}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {finding.autoFixable && (
                      <button
                        onClick={() => handleGenerateFix(finding)}
                        disabled={isHealed}
                        className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition cursor-pointer ${
                          isHealed
                            ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300 cursor-default'
                            : 'bg-indigo-600/20 border-indigo-500/40 hover:bg-indigo-600/30 text-indigo-300'
                        }`}
                      >
                        <Zap className="w-3.5 h-3.5 text-indigo-400" />
                        {isHealed ? 'Enviado a Staging' : 'Generar Fix Quirúrgico'}
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-base font-semibold text-slate-100">{finding.title}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="bg-slate-950/70 border border-slate-900 rounded-lg p-3 space-y-1">
                      <span className="text-slate-400 font-semibold uppercase tracking-wider">
                        Problema & Causa
                      </span>
                      <p className="text-slate-300">{finding.problem}</p>
                      <p className="text-slate-400 italic mt-1">{finding.cause}</p>
                    </div>
                    <div className="bg-slate-950/70 border border-slate-900 rounded-lg p-3 space-y-1">
                      <span className="text-emerald-400 font-semibold uppercase tracking-wider">
                        Solución Propuesta
                      </span>
                      <p className="text-emerald-200/90">{finding.solution}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
