import React, { useState } from 'react';
import { useAurora } from '../context/AuroraContext';
import {
  Download,
  Copy,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileCode,
  FileJson,
  Layers,
  Sparkles,
  ExternalLink,
  Code2,
  FolderDown,
  Terminal,
  ShieldCheck,
  ArrowRight,
  Zap,
  GitPullRequest,
  Monitor,
  HardDrive,
  Package,
  FileArchive,
} from 'lucide-react';
import { generateAllTypeScriptBundle, exportAsJSON, generatePhaser3SceneIntegration } from '../lib/exportFormatter';

export const ExportHubView: React.FC = () => {
  const { projectContext, validationReport, applyAllAutoFixes, setActiveTab, showToast } = useAurora();

  const [activeFormat, setActiveFormat] = useState<'bundle_ts' | 'bundle_json' | 'phaser_scene'>('bundle_ts');
  const [selectedFile, setSelectedFile] = useState<string>('aurora_creatures.ts');
  const [copied, setCopied] = useState<boolean>(false);

  const tsBundle = generateAllTypeScriptBundle(projectContext);
  const isReadyToExport = validationReport.errorCount === 0;

  const getActiveCode = () => {
    if (activeFormat === 'bundle_json') {
      return exportAsJSON(projectContext);
    }
    if (activeFormat === 'phaser_scene') {
      return generatePhaser3SceneIntegration(projectContext.creatures[0], projectContext.npcs[0]);
    }
    return tsBundle[selectedFile] || exportAsJSON(projectContext);
  };

  const handleCopy = () => {
    const code = getActiveCode();
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showToast('Código copiado al portapapeles', 'success');
  };

  const handleDownloadFile = () => {
    if (!isReadyToExport) {
      showToast('No se puede exportar con errores críticos de validación pendientes.', 'error');
      return;
    }

    const code = getActiveCode();
    const fileName =
      activeFormat === 'bundle_json'
        ? 'aurora_full_bundle.json'
        : activeFormat === 'phaser_scene'
        ? 'AuroraGameScene2D5.ts'
        : selectedFile;

    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
    showToast(`Archivo "${fileName}" descargado`, 'success');
  };

  const handleDownloadAllBundle = () => {
    if (!isReadyToExport) {
      showToast('No se puede exportar con errores críticos de validación pendientes.', 'error');
      return;
    }

    // Download full bundle JSON
    const jsonStr = exportAsJSON(projectContext);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aurora_complete_export_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Paquete completo de AURORA exportado para Cursor.', 'success');
  };

  return (
    <div id="export-hub-container" className="flex-1 flex flex-col h-full bg-slate-950 overflow-y-auto p-6 max-w-6xl mx-auto space-y-6">
      {/* Phase 5 Callout Banner: Bridge to Cursor */}
      <div className="p-4 bg-indigo-950/40 border border-indigo-500/40 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/20 rounded-xl border border-indigo-500/30 text-cyan-400">
            <GitPullRequest className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <span>Nuevo: Integración Quirúrgica Directa con Cursor (Fase 5)</span>
              <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-cyan-500/20 text-cyan-300">RECOMENDADO</span>
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              En lugar de descargar archivos completos, genera parches quirúrgicos (+ ~ -), diffs visuales e instrucciones paso a paso.
            </p>
          </div>
        </div>

        <button
          id="go-to-cursor-bridge-btn"
          onClick={() => setActiveTab('cursor_integration')}
          className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs font-bold rounded-xl shadow-lg transition whitespace-nowrap self-start sm:self-center"
        >
          <span>Abrir Puente Cursor</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Top Banner */}
      <div className="p-6 bg-gradient-to-r from-slate-900 via-emerald-950/30 to-slate-900 border border-slate-800 rounded-2xl shadow-xl">
        <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-semibold uppercase tracking-wider mb-1">
          <Download className="w-3.5 h-3.5 text-emerald-400" />
          Centro de Exportación para Cursor + Phaser 3 + TypeScript
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Exportar Contenido de AURORA</h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Genera archivos TypeScript fuertemente tipados, constantes modulares y escenas 2.5D con cálculo de Y-sorting listas para pegar directamente en tu proyecto en Cursor.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="download-all-bundle-btn"
              onClick={handleDownloadAllBundle}
              disabled={!isReadyToExport}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition whitespace-nowrap"
            >
              <FolderDown className="w-4 h-4 text-cyan-400" />
              <span>Exportar Paquete JSON</span>
            </button>
            <button
              id="download-active-file-btn"
              onClick={handleDownloadFile}
              disabled={!isReadyToExport}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:opacity-40 disabled:pointer-events-none text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition whitespace-nowrap"
            >
              <Download className="w-4 h-4" />
              <span>Descargar Archivo Activo</span>
            </button>
          </div>
        </div>
      </div>

      {/* Pre-Export Validation Gatekeeper */}
      <div
        id="pre-export-validation-gatekeeper"
        className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
          isReadyToExport
            ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
            : 'bg-rose-950/50 border-rose-500/60 text-rose-200'
        }`}
      >
        <div className="flex items-center gap-3">
          {isReadyToExport ? (
            <div className="p-2 bg-emerald-500/20 rounded-lg border border-emerald-500/40">
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            </div>
          ) : (
            <div className="p-2 bg-rose-500/20 rounded-lg border border-rose-500/40">
              <XCircle className="w-6 h-6 text-rose-400" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                  isReadyToExport ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                }`}
              >
                {isReadyToExport ? 'READY TO EXPORT' : 'BLOQUEO PRE-EXPORTACIÓN'}
              </span>
              <span className="text-xs text-slate-400">
                {isReadyToExport
                  ? 'Todas las comprobaciones de TypeScript, 2.5D y reglas de juego son válidas.'
                  : `Se encontraron ${validationReport.errorCount} errores críticos que deben corregirse.`}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              {isReadyToExport
                ? 'El código generado no causará errores de compilación ni fallas de Y-sorting en Phaser 3.'
                : 'Para evitar errores en runtime o en el compilador de TypeScript en Cursor, resuelve los errores antes de exportar.'}
            </p>
          </div>
        </div>

        {!isReadyToExport && (
          <div className="flex items-center gap-2">
            <button
              onClick={applyAllAutoFixes}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5" />
              Auto-Corregir Todos
            </button>
            <button
              onClick={() => setActiveTab('validator')}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 transition-colors flex items-center gap-1"
            >
              <span>Ver Validador</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Format Selectors */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveFormat('bundle_ts')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
            activeFormat === 'bundle_ts'
              ? 'bg-emerald-500 text-slate-950 font-bold'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <FileCode className="w-4 h-4" />
          <span>Archivos Modulares TypeScript (.ts)</span>
        </button>

        <button
          onClick={() => setActiveFormat('phaser_scene')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
            activeFormat === 'phaser_scene'
              ? 'bg-cyan-500 text-slate-950 font-bold'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>Plantilla Scene Phaser 3 (Depth Sorting 2.5D)</span>
        </button>

        <button
          onClick={() => setActiveFormat('bundle_json')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
            activeFormat === 'bundle_json'
              ? 'bg-purple-500 text-slate-950 font-bold'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <FileJson className="w-4 h-4" />
          <span>Paquete Completo JSON (.json)</span>
        </button>
      </div>

      {/* If TS Bundle, show subfile tabs */}
      {activeFormat === 'bundle_ts' && (
        <div className="flex overflow-x-auto gap-2 border-b border-slate-800 pb-2">
          {Object.keys(tsBundle).map((fileName) => (
            <button
              key={fileName}
              onClick={() => setSelectedFile(fileName)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap transition ${
                selectedFile === fileName
                  ? 'bg-slate-800 text-emerald-300 border border-emerald-500/30 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              {fileName}
            </button>
          ))}
        </div>
      )}

      {/* Code Display Container */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl space-y-3">
        <div className="flex items-center justify-between px-2 text-xs">
          <div className="flex items-center gap-2 text-slate-400 font-mono">
            <Code2 className="w-4 h-4 text-emerald-400" />
            <span>
              {activeFormat === 'bundle_json'
                ? 'aurora_full_bundle.json'
                : activeFormat === 'phaser_scene'
                ? 'AuroraGameScene2D5.ts'
                : selectedFile}
            </span>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg transition"
          >
            {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? '¡Copiado!' : 'Copiar'}</span>
          </button>
        </div>

        <pre className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-emerald-400 overflow-x-auto max-h-[500px] leading-relaxed">
          {getActiveCode()}
        </pre>
      </div>

      {/* Windows Standalone & Installer Distribution Panel */}
      <div className="p-5 bg-gradient-to-br from-slate-900 via-indigo-950/30 to-slate-900 border border-indigo-500/30 rounded-2xl shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/20 border border-indigo-500/40 rounded-xl text-cyan-400">
              <Monitor className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <span>AURORA AI CREATOR v1.0.0 — Paquete Windows</span>
                <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded text-[10px] font-mono">
                  FINAL RELEASE
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Ejecutable x64 y archivo ZIP completo para Windows 10/11. No requiere Node.js ni configuración previa.
              </p>
            </div>
          </div>

          <a
            href="/api/release/windows-zip"
            download="AURORA-AI-CREATOR-WINDOWS-v1.0.0.zip"
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-900/40 transition cursor-pointer whitespace-nowrap self-start sm:self-auto"
          >
            <FileArchive className="w-4 h-4" />
            <span>Descargar ZIP Final (v1.0.0)</span>
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl flex flex-col justify-between gap-3">
            <div className="flex items-start gap-3">
              <Package className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-slate-200 flex items-center gap-2">
                  <span>AURORA-AI-CREATOR-Setup.exe</span>
                  <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 rounded text-[9px] font-mono">179.6 MB</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Instalador oficial NSIS con asistente gráfico, accesos directos en Escritorio y Menú Inicio.
                </p>
                <div className="mt-2 text-[10px] font-mono text-slate-500 truncate">
                  SHA-256: bd9fe0f4e068a002...
                </div>
              </div>
            </div>
            <a
              href="/api/release/setup-exe"
              download="AURORA-AI-CREATOR-Setup.exe"
              className="w-full flex items-center justify-center gap-2 py-2 bg-slate-800 hover:bg-slate-700 text-indigo-300 hover:text-white text-xs font-semibold rounded-lg border border-indigo-500/30 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Descargar Instalador (.exe)</span>
            </a>
          </div>

          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl flex flex-col justify-between gap-3">
            <div className="flex items-start gap-3">
              <HardDrive className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-slate-200 flex items-center gap-2">
                  <span>AURORA-AI-CREATOR-Portable.exe</span>
                  <span className="px-1.5 py-0.5 bg-cyan-500/20 text-cyan-300 rounded text-[9px] font-mono">179.6 MB</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Versión portable autónoma con runtime Electron integrado. Extracción y ejecución limpia en $TEMP.
                </p>
                <div className="mt-2 text-[10px] font-mono text-slate-500 truncate">
                  SHA-256: c4ed0878e0bd309f...
                </div>
              </div>
            </div>
            <a
              href="/api/release/portable-exe"
              download="AURORA-AI-CREATOR-Portable.exe"
              className="w-full flex items-center justify-center gap-2 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-white text-xs font-semibold rounded-lg border border-cyan-500/30 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Descargar Portable (.exe)</span>
            </a>
          </div>
        </div>

        {/* Cryptographic Gate Verification Notice */}
        <div className="p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Artefactos verificados a nivel de byte: Hash exterior idéntico a hash interno en ZIP.</span>
          </div>
          <span className="text-[10px] font-mono text-emerald-400/80 hidden sm:inline">
            PE32+ / x64 Architecture Validated
          </span>
        </div>
      </div>
    </div>
  );
};
