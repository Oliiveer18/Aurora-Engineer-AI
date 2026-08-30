import React, { useState, useRef } from 'react';
import {
  Upload,
  FileCode,
  FolderOpen,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  X,
  Layers,
  ArrowRight,
  ShieldCheck,
  Code2,
  RefreshCw,
} from 'lucide-react';
import { useAurora } from '../context/AuroraContext';
import { RawFileInput, ImportParsedResult } from '../lib/projectImporter';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const ImportAuroraProjectModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { importProjectFiles } = useAurora();
  const [importMode, setImportMode] = useState<'replace' | 'merge'>('replace');
  const [activeTab, setActiveTab] = useState<'files' | 'paste'>('files');
  const [rawPastedCode, setRawPastedCode] = useState<string>('');
  const [pastedFileName, setPastedFileName] = useState<string>('aurora_custom.ts');
  const [loadedFiles, setLoadedFiles] = useState<RawFileInput[]>([]);
  const [parsedResult, setParsedResult] = useState<ImportParsedResult | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFilesSelected = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsProcessing(true);

    const fileList: RawFileInput[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const text = await file.text();
        fileList.push({ name: file.name, content: text });
      } catch (err) {
        console.error(`Error reading ${file.name}:`, err);
      }
    }

    setLoadedFiles(fileList);

    // Dry-run parse
    try {
      const result = importProjectFiles(fileList, importMode);
      setParsedResult(result);
    } catch (e: any) {
      console.error('Parse error:', e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePastedCodeParse = () => {
    if (!rawPastedCode.trim()) return;
    setIsProcessing(true);
    const fileList: RawFileInput[] = [{ name: pastedFileName, content: rawPastedCode }];
    setLoadedFiles(fileList);

    try {
      const result = importProjectFiles(fileList, importMode);
      setParsedResult(result);
    } catch (e: any) {
      console.error('Parse error:', e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCommitImport = () => {
    if (!parsedResult || !parsedResult.success) return;
    // importProjectFiles already committed it in context!
    onClose();
  };

  return (
    <div id="import-aurora-project-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <FolderOpen className="w-4 h-4" />
              Importador de Proyecto Real
            </div>
            <h2 className="text-xl font-bold text-slate-100 mt-1">IMPORT AURORA PROJECT</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Carga tus archivos reales de Cursor (JSON, constantes TypeScript .ts, interfaces o configuraciones).
            </p>
          </div>

          <button
            id="close-import-modal-btn"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector & Sub-Tabs */}
        <div className="bg-slate-950 px-6 py-3 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-semibold">Modo de Ingesta:</span>
            <button
              onClick={() => setImportMode('replace')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                importMode === 'replace'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Reemplazar Proyecto
            </button>
            <button
              onClick={() => setImportMode('merge')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                importMode === 'merge'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Fusionar / Actualizar
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('files')}
              className={`px-3 py-1 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'files' ? 'bg-slate-700 text-slate-100' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              Subir Archivos
            </button>
            <button
              onClick={() => setActiveTab('paste')}
              className={`px-3 py-1 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'paste' ? 'bg-slate-700 text-slate-100' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              Pegar Código TS/JSON
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {activeTab === 'files' ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-700 hover:border-amber-500/80 bg-slate-950/40 hover:bg-slate-950/80 rounded-2xl p-8 text-center cursor-pointer transition-all space-y-3"
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".ts,.tsx,.json,.js"
                className="hidden"
                onChange={(e) => handleFilesSelected(e.target.files)}
              />
              <div className="w-14 h-14 bg-amber-500/10 text-amber-400 rounded-2xl mx-auto flex items-center justify-center border border-amber-500/20 shadow-inner">
                <Upload className="w-7 h-7" />
              </div>
              <div>
                <p className="text-base font-bold text-slate-200">
                  Haz clic o arrastra tus archivos de AURORA (.ts, .json)
                </p>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                  Soporta paquetes completos (aurora_full_bundle.json) o colecciones modulares (aurora_creatures.ts, npcs.ts, biomes.ts, quests.ts).
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 font-mono">
                <span>.ts</span> • <span>.json</span> • <span>export const</span> • <span>Múltiples archivos a la vez</span>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <label className="text-slate-400 font-medium">Nombre de Archivo Origen:</label>
                <input
                  type="text"
                  value={pastedFileName}
                  onChange={(e) => setPastedFileName(e.target.value)}
                  className="px-2 py-1 bg-slate-950 border border-slate-800 rounded text-slate-200 text-xs font-mono w-48"
                />
              </div>
              <textarea
                value={rawPastedCode}
                onChange={(e) => setRawPastedCode(e.target.value)}
                placeholder={`// Pega aquí tu export de TypeScript o JSON de AURORA, por ejemplo:\nexport const AURORA_CREATURES = [\n  {\n    id: "sylvyn",\n    name: "Sylvyn",\n    type: "nature",\n    rarity: "common",\n    stats: { hp: 95, attack: 68, defense: 62, speed: 75, specialAttack: 70, specialDefense: 65 },\n    visual2D5: { anchorX: 0.5, anchorY: 0.9, ySortOffset: 8, collisionBox: { width: 36, height: 24, offsetX: 14, offsetY: 36 } }\n  }\n];`}
                rows={10}
                className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500"
              />
              <button
                id="parse-pasted-code-btn"
                onClick={handlePastedCodeParse}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold transition-colors flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Analizar y Procesar Código Pegado
              </button>
            </div>
          )}

          {/* Analysis Summary Report */}
          {parsedResult && (
            <div id="import-summary-report" className="bg-slate-950/80 rounded-xl p-5 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span className="text-sm font-bold text-slate-100 uppercase tracking-wide">
                    REPORTE DE INGESTA: AURORA PROJECT
                  </span>
                </div>
                <span className="text-xs font-mono text-slate-400">
                  {parsedResult.detectedFiles.length} archivo(s) analizado(s)
                </span>
              </div>

              {/* Summary Numbers Grid */}
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 text-xs">
                <div className="p-3 bg-slate-900 rounded-lg text-center border border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase">Regiones</span>
                  <span className="text-lg font-bold text-slate-100">{parsedResult.summary.regions}</span>
                </div>
                <div className="p-3 bg-slate-900 rounded-lg text-center border border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase">Biomas</span>
                  <span className="text-lg font-bold text-slate-100">{parsedResult.summary.biomes}</span>
                </div>
                <div className="p-3 bg-slate-900 rounded-lg text-center border border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase">Criaturas</span>
                  <span className="text-lg font-bold text-emerald-400">{parsedResult.summary.creatures}</span>
                </div>
                <div className="p-3 bg-slate-900 rounded-lg text-center border border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase">NPCs</span>
                  <span className="text-lg font-bold text-cyan-400">{parsedResult.summary.npcs}</span>
                </div>
                <div className="p-3 bg-slate-900 rounded-lg text-center border border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase">Misiones</span>
                  <span className="text-lg font-bold text-purple-400">{parsedResult.summary.quests}</span>
                </div>
                <div className="p-3 bg-slate-900 rounded-lg text-center border border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase">Objetos</span>
                  <span className="text-lg font-bold text-amber-400">{parsedResult.summary.items}</span>
                </div>
                <div className="p-3 bg-slate-900 rounded-lg text-center border border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase">Habilidades</span>
                  <span className="text-lg font-bold text-rose-400">{parsedResult.summary.abilities}</span>
                </div>
                <div className="p-3 bg-slate-900 rounded-lg text-center border border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase">Dungeons</span>
                  <span className="text-lg font-bold text-slate-300">{parsedResult.summary.dungeons}</span>
                </div>
                <div className="p-3 bg-slate-900 rounded-lg text-center border border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase">Avisos</span>
                  <span className="text-lg font-bold text-amber-400">{parsedResult.summary.warnings}</span>
                </div>
                <div className="p-3 bg-slate-900 rounded-lg text-center border border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase">Errores</span>
                  <span
                    className={`text-lg font-bold ${
                      parsedResult.summary.errors > 0 ? 'text-rose-400' : 'text-emerald-400'
                    }`}
                  >
                    {parsedResult.summary.errors}
                  </span>
                </div>
              </div>

              {/* Logs & Warnings */}
              {parsedResult.logMessages.length > 0 && (
                <div className="space-y-1 text-xs">
                  <span className="text-slate-400 font-semibold">Registro de Ingesta:</span>
                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 font-mono text-slate-300 space-y-1 max-h-32 overflow-y-auto">
                    {parsedResult.logMessages.map((msg, i) => (
                      <div key={i} className="text-[11px]">
                        • {msg}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Se creará automáticamente un punto de restauración antes de aplicar la importación.
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition-colors"
            >
              Cancelar
            </button>
            <button
              id="confirm-import-btn"
              disabled={!parsedResult || !parsedResult.success}
              onClick={handleCommitImport}
              className="px-6 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:pointer-events-none text-slate-950 rounded-lg text-xs font-bold transition-all shadow-lg shadow-amber-950/50 flex items-center gap-2"
            >
              <span>Confirmar Carga de Datos</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
