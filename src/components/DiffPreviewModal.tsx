import React, { useState } from 'react';
import {
  Check,
  X,
  Sparkles,
  Layers,
  PlusCircle,
  Edit3,
  ShieldCheck,
  FileCode,
  ChevronDown,
  ChevronRight,
  Info,
  Compass,
  Zap,
  GitPullRequest,
} from 'lucide-react';
import { useAurora } from '../context/AuroraContext';

export const DiffPreviewModal: React.FC = () => {
  const {
    stagedPackage,
    approveStagedChanges,
    rejectStagedChanges,
    setActiveTab,
    generatePackageFromStaged,
  } = useAurora();
  const [selectedChangeIdx, setSelectedChangeIdx] = useState<number>(0);
  const [showContextDetails, setShowContextDetails] = useState<boolean>(false);

  if (!stagedPackage) return null;

  const newChanges = stagedPackage.changes.filter((c) => c.action === 'new');
  const modChanges = stagedPackage.changes.filter((c) => c.action === 'modified');
  const activeChange = stagedPackage.changes[selectedChangeIdx] || stagedPackage.changes[0];

  const handleOpenInCursorBridge = () => {
    generatePackageFromStaged(stagedPackage);
    setActiveTab('cursor_integration');
  };

  return (
    <div id="diff-preview-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in">
      <div
        id="diff-preview-modal"
        className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-800 bg-slate-950/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                STAGING AREA & DIFF PREVIEW
              </span>
              <span className="text-xs text-slate-500 font-mono">ID: {stagedPackage.id}</span>
            </div>
            <h2 className="text-xl font-bold text-slate-100 mt-1">{stagedPackage.title}</h2>
            <p className="text-xs text-slate-400 mt-0.5">{stagedPackage.description}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              id="open-cursor-bridge-btn"
              onClick={handleOpenInCursorBridge}
              className="px-3.5 py-2 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/40 rounded-lg text-xs font-semibold transition flex items-center gap-1.5"
              title="Ver parches quirúrgicos e instrucciones para Cursor"
            >
              <GitPullRequest className="w-3.5 h-3.5 text-cyan-400" />
              <span>Ver en Puente Cursor</span>
            </button>

            <button
              id="reject-diff-btn"
              onClick={rejectStagedChanges}
              className="px-3.5 py-2 bg-slate-800 hover:bg-rose-950/50 text-slate-300 hover:text-rose-300 border border-slate-700 hover:border-rose-700/50 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <X className="w-4 h-4" />
              Descartar
            </button>
            <button
              id="approve-diff-btn"
              onClick={approveStagedChanges}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-lg shadow-emerald-950/50 transition-all flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              Aprobar e Integrar
            </button>
          </div>
        </div>

        {/* Change Statistics Bar */}
        <div className="bg-slate-950 px-6 py-2.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 font-semibold text-emerald-400">
              <PlusCircle className="w-4 h-4" />
              NUEVAS ({newChanges.length})
            </span>
            <span className="flex items-center gap-1.5 font-semibold text-amber-400">
              <Edit3 className="w-4 h-4" />
              MODIFICADAS ({modChanges.length})
            </span>
            <span className="flex items-center gap-1.5 font-semibold text-slate-400">
              <ShieldCheck className="w-4 h-4" />
              SIN CAMBIOS ({stagedPackage.unchangedCount})
            </span>
          </div>

          {stagedPackage.contextUsed && (
            <button
              id="toggle-context-used-btn"
              onClick={() => setShowContextDetails(!showContextDetails)}
              className="flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Ver Contexto de Proyecto Utilizado</span>
              {showContextDetails ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>

        {/* Context Used Drawer (Collapsible) */}
        {showContextDetails && stagedPackage.contextUsed && (
          <div className="bg-slate-950/90 border-b border-slate-800 p-5 text-xs space-y-3 animate-fade-in">
            <div className="flex items-center gap-2 font-bold text-cyan-300">
              <Info className="w-4 h-4" />
              CONTEXTO DEL PROYECTO AURORA ANALIZADO ANTES DE GENERAR:
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                <span className="text-slate-500 font-semibold block mb-1">Anclaje Geográfico:</span>
                <p className="text-slate-200">{stagedPackage.contextUsed.targetLocationName || 'Cualquier bioma del mapa'}</p>
              </div>
              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                <span className="text-slate-500 font-semibold block mb-1">IDs Protegidos contra Colisión:</span>
                <p className="text-slate-200">{stagedPackage.contextUsed.occupiedIdsCount} IDs existentes verificados</p>
              </div>
              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                <span className="text-slate-500 font-semibold block mb-1">Elementos Sugeridos:</span>
                <p className="text-amber-300">{stagedPackage.contextUsed.suggestedElementTypes?.join(', ') || 'Equilibrado'}</p>
              </div>
            </div>
            {stagedPackage.contextUsed.existingEntitiesInLocation?.length > 0 && (
              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                <span className="text-slate-500 font-semibold block mb-1">Entidades existentes en el área (no sobreescritas):</span>
                <p className="text-slate-300">{stagedPackage.contextUsed.existingEntitiesInLocation.join(' • ')}</p>
              </div>
            )}
          </div>
        )}

        {/* Main Diff Content Area */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 min-h-0 overflow-hidden divide-y md:divide-y-0 md:divide-x divide-slate-800">
          {/* Left: Change List */}
          <div className="p-4 overflow-y-auto space-y-2 bg-slate-900/50">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Entidades en este Paquete:</div>
            {stagedPackage.changes.map((ch, idx) => {
              const isSelected = selectedChangeIdx === idx;
              const isNew = ch.action === 'new';
              return (
                <div
                  key={idx}
                  onClick={() => setSelectedChangeIdx(idx)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? isNew
                        ? 'bg-emerald-950/40 border-emerald-500/80 ring-1 ring-emerald-500/40'
                        : 'bg-amber-950/40 border-amber-500/80 ring-1 ring-amber-500/40'
                      : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-200 truncate">
                      {ch.entity.name || ch.entity.title || ch.entity.id}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        isNew ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {ch.action === 'new' ? '+ NUEVO' : '~ MODIFICADO'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="uppercase">{ch.entityType}</span>
                    <span className="font-mono text-slate-500">{ch.entity.id}</span>
                  </div>
                  {ch.details && <p className="text-[10px] text-slate-400 mt-1 italic">{ch.details}</p>}
                </div>
              );
            })}
          </div>

          {/* Right: Detailed Entity Preview / Diff */}
          <div className="md:col-span-2 p-6 overflow-y-auto bg-slate-950/60 space-y-4">
            {activeChange ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase text-amber-400">{activeChange.entityType}</span>
                      <span className="text-xs text-slate-500 font-mono">{activeChange.entity.id}</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-100 mt-0.5">
                      {activeChange.entity.name || activeChange.entity.title || activeChange.entity.id}
                    </h3>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                      activeChange.action === 'new'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {activeChange.action === 'new' ? 'Nueva Entidad a Insertar' : 'Entidad Existente a Actualizar'}
                  </span>
                </div>

                {/* Key Attributes Overview */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  {activeChange.entity.type && (
                    <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                      <span className="text-slate-500 block text-[10px]">Elemento:</span>
                      <span className="font-bold text-amber-400 capitalize">{activeChange.entity.type}</span>
                    </div>
                  )}
                  {activeChange.entity.rarity && (
                    <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                      <span className="text-slate-500 block text-[10px]">Rareza:</span>
                      <span className="font-bold text-cyan-400 capitalize">{activeChange.entity.rarity}</span>
                    </div>
                  )}
                  {activeChange.entity.visual2D5 && (
                    <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                      <span className="text-slate-500 block text-[10px]">Y-Sort 2.5D:</span>
                      <span className="font-mono text-emerald-400">Offset: {activeChange.entity.visual2D5.ySortOffset}px</span>
                    </div>
                  )}
                  {activeChange.entity.stats && (
                    <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                      <span className="text-slate-500 block text-[10px]">BST Total:</span>
                      <span className="font-bold text-purple-400">
                        {(activeChange.entity.stats.hp || 0) +
                          (activeChange.entity.stats.attack || 0) +
                          (activeChange.entity.stats.defense || 0) +
                          (activeChange.entity.stats.speed || 0)}
                      </span>
                    </div>
                  )}
                </div>

                {/* JSON Code Inspector */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1.5 font-semibold">
                      <FileCode className="w-3.5 h-3.5 text-cyan-400" />
                      Estructura JSON Completa para Phaser 3:
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">Compatible con TypeScript</span>
                  </div>
                  <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-slate-300 overflow-x-auto max-h-72 leading-relaxed">
                    {JSON.stringify(activeChange.entity, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500 text-sm">Selecciona una entidad para ver los cambios</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
