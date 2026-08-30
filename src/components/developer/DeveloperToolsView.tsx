import React, { useState } from 'react';
import { useAurora } from '../../context/AuroraContext';
import {
  generateAutomatedUnitTests,
  performCodeReview,
  analyzeDebugError,
  GeneratedTestReport,
  CodeReviewReport,
  DebuggerAnalysis,
} from '../../lib/aiDeveloperTools';
import {
  Code,
  FileCode,
  Bug,
  CheckCircle2,
  AlertTriangle,
  Play,
  Copy,
  Terminal,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export const DeveloperToolsView: React.FC = () => {
  const { projectContext, activeChangePackage, showToast } = useAurora();

  const [activeSubTab, setActiveSubTab] = useState<'tests' | 'review' | 'debugger'>('tests');

  // Test Gen State
  const [testReport, setTestReport] = useState<GeneratedTestReport>(() =>
    generateAutomatedUnitTests(projectContext)
  );

  // Code Review State
  const [reviewReport, setReviewReport] = useState<CodeReviewReport>(() =>
    performCodeReview(activeChangePackage)
  );

  // Debugger State
  const [errorMessage, setErrorMessage] = useState(
    'Error: sprite texture Y-sorting inverted. AnchorY outside dimetric baseline range.'
  );
  const [stackTrace, setStackTrace] = useState(
    'at DepthPlugin.sort (Phaser.js:1402)\nat CreatureManager.spawn (creature_manager.ts:45)'
  );
  const [debugAnalysis, setDebugAnalysis] = useState<DebuggerAnalysis | null>(() =>
    analyzeDebugError(
      'Error: sprite texture Y-sorting inverted. AnchorY outside dimetric baseline range.',
      'at DepthPlugin.sort (Phaser.js:1402)'
    )
  );

  const handleRunTests = () => {
    const report = generateAutomatedUnitTests(projectContext);
    setTestReport(report);
    showToast(`Suite de pruebas ejecutada: ${report.passedTests}/${report.totalTests} superadas`, 'success');
  };

  const handleAnalyzeError = () => {
    const analysis = analyzeDebugError(errorMessage, stackTrace);
    setDebugAnalysis(analysis);
    showToast('Diagnóstico de error completado con ' + analysis.confidenceScore + '% de confianza', 'info');
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    showToast('Código copiado al portapapeles', 'info');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Code className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                AI Developer Tools & Debugger
                <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono border border-cyan-500/30">
                  DEVELOPER EXPERIENCE
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Generador de pruebas Jest/Vitest, revisión automatizada de código para Cursor y depuración guiada de errores en Phaser 3.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveSubTab('tests')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 ${
            activeSubTab === 'tests'
              ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-300'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileCode className="w-4 h-4" />
          <span>Generador de Pruebas Unitarias</span>
        </button>

        <button
          onClick={() => setActiveSubTab('review')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 ${
            activeSubTab === 'review'
              ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-300'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Aurora Code Review AI</span>
        </button>

        <button
          onClick={() => setActiveSubTab('debugger')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 ${
            activeSubTab === 'debugger'
              ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-300'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Bug className="w-4 h-4" />
          <span>AI Debugger & Error Solver</span>
        </button>
      </div>

      {/* 1. Automated Test Suite Generator */}
      {activeSubTab === 'tests' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-sm font-bold text-slate-100">{testReport.suiteName}</h2>
              <p className="text-xs text-slate-400">
                {testReport.passedTests} de {testReport.totalTests} casos de prueba superados.
              </p>
            </div>
            <button
              onClick={handleRunTests}
              className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-xl transition shadow-lg shadow-cyan-600/20"
            >
              <Play className="w-4 h-4" />
              <span>Ejecutar Tests</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Casos de Prueba Ejecutados
              </h3>
              <div className="space-y-2">
                {testReport.testCases.map((tc, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2 text-slate-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>{tc.name}</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">
                      {tc.durationMs}ms
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Código TypeScript Generado para Exportar
                </h3>
                <button
                  onClick={() => handleCopyCode(testReport.generatedCode)}
                  className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 font-mono"
                >
                  <Copy className="w-3.5 h-3.5" /> Copiar
                </button>
              </div>
              <pre className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto max-h-80">
                {testReport.generatedCode}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* 2. Aurora Code Review AI */}
      {activeSubTab === 'review' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <span className="text-[10px] font-mono text-slate-400">ARCHIVOS AUDITADOS</span>
              <h3 className="text-sm font-bold text-slate-100">{reviewReport.fileAnalyzed}</h3>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400 font-mono">
                Risk Score: <strong>{reviewReport.riskScore}/100</strong>
              </span>
              <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                {reviewReport.overallVerdict}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Observaciones y Buenas Prácticas
            </h4>
            <div className="space-y-2">
              {reviewReport.notes.map((n, i) => (
                <div
                  key={i}
                  className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200">{n.title}</span>
                    <span className="text-[10px] font-mono uppercase text-cyan-400">
                      {n.severity}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{n.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. AI Debugger & Error Solver */}
      {activeSubTab === 'debugger' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              <h3 className="text-xs font-bold text-slate-200">
                Entrada de Error o Fallo en Phaser 3
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Mensaje de Error
                  </label>
                  <input
                    type="text"
                    value={errorMessage}
                    onChange={(e) => setErrorMessage(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Stack Trace (Opcional)
                  </label>
                  <textarea
                    rows={3}
                    value={stackTrace}
                    onChange={(e) => setStackTrace(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
                <button
                  onClick={handleAnalyzeError}
                  className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-xl transition"
                >
                  Diagnosticar Causa Raíz con IA
                </button>
              </div>
            </div>

            {/* Diagnostic Output */}
            {debugAnalysis && (
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="text-xs font-bold text-cyan-400">
                    {debugAnalysis.errorType}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold">
                    {debugAnalysis.confidenceScore}% Confianza
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="font-bold text-slate-400">Causa Raíz:</span>
                    <p className="text-slate-300 mt-0.5">{debugAnalysis.rootCause}</p>
                  </div>

                  <div>
                    <span className="font-bold text-emerald-400">Solución Recomendada:</span>
                    <p className="text-slate-300 mt-0.5">{debugAnalysis.recommendedFix}</p>
                  </div>

                  <div>
                    <span className="font-bold text-indigo-400">Snippet de Corrección:</span>
                    <pre className="mt-1 p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[11px] text-cyan-300">
                      {debugAnalysis.suggestedPatchSnippet}
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
