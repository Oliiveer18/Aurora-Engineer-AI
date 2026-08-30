import React, { useState } from 'react';
import { VisualAsset, AuroraEntityType } from '../../types/aurora';
import { useAurora } from '../../context/AuroraContext';
import {
  X,
  Save,
  Trash2,
  Sparkles,
  Link,
  Copy,
  Layers,
  Box,
  Compass,
  CheckCircle2,
  AlertTriangle,
  Move,
  Code,
} from 'lucide-react';

interface Props {
  asset: VisualAsset;
  onClose: () => void;
  onOpenVariantModal: (asset: VisualAsset) => void;
}

export const VisualAssetInspector: React.FC<Props> = ({ asset, onClose, onOpenVariantModal }) => {
  const {
    projectContext,
    updateVisualAsset,
    deleteVisualAsset,
    linkVisualAssetToEntity,
    showToast,
  } = useAurora();

  const [form, setForm] = useState<VisualAsset>(JSON.parse(JSON.stringify(asset)));
  const [showGridOverlay, setShowGridOverlay] = useState(true);
  const [activeTab, setActiveTab] = useState<'specs' | 'linking' | 'phaser'>('specs');

  // Handle number input changes
  const handleAnchorChange = (field: 'x' | 'y', val: number) => {
    setForm((prev) => ({
      ...prev,
      anchor: { ...prev.anchor, [field]: val },
    }));
  };

  const handleFootPointChange = (field: 'x' | 'y', val: number) => {
    setForm((prev) => ({
      ...prev,
      footPoint: { ...prev.footPoint, [field]: val },
    }));
  };

  const handleCollisionChange = (field: 'width' | 'height' | 'offsetX' | 'offsetY', val: number) => {
    setForm((prev) => ({
      ...prev,
      collisionBox: { ...prev.collisionBox, [field]: val },
    }));
  };

  const handleShadowChange = (field: string, val: any) => {
    setForm((prev) => ({
      ...prev,
      shadow: { ...prev.shadow, [field]: val },
    }));
  };

  const handleSave = () => {
    updateVisualAsset(form);
    showToast(`Asset "${form.name}" actualizado exitosamente.`, 'success');
  };

  const handleDelete = () => {
    if (confirm(`¿Estás seguro de eliminar el asset visual "${asset.name}"?`)) {
      deleteVisualAsset(asset.id);
      onClose();
    }
  };

  // Find linked entity
  const linkedCreature = projectContext.creatures.find((c) => c.id === form.relatedEntityId);
  const linkedNpc = projectContext.npcs.find((n) => n.id === form.relatedEntityId);
  const linkedItem = projectContext.items.find((i) => i.id === form.relatedEntityId);

  const phaserCodeSnippet = `// Phaser 3 GameObject Creation for ${form.name}
const sprite = scene.add.sprite(spawnX, spawnY, '${form.id}');
sprite.setOrigin(${form.anchor.x}, ${form.anchor.y});
sprite.setScale(${form.scale});
sprite.setDepth(spawnY + ${form.ySortOffset}); // 2.5D Dimetric Depth Sorting
scene.physics.world.enable(sprite);
sprite.body.setSize(${form.collisionBox.width}, ${form.collisionBox.height});
sprite.body.setOffset(${form.collisionBox.offsetX}, ${form.collisionBox.offsetY});`;

  return (
    <div id="visual-asset-inspector" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Box className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">{form.name}</h3>
                <span className="px-2 py-0.5 rounded text-[10px] uppercase font-semibold bg-cyan-950/80 border border-cyan-800 text-cyan-300">
                  {form.type}
                </span>
                {form.variantType && form.variantType !== 'original' && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 border border-amber-700 text-amber-300 uppercase">
                    ★ {form.variantType}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 font-mono">ID: {form.id}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenVariantModal(asset)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-semibold transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Crear Variante</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Visual Stage with Dimetric 2.5D Overlay */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="relative aspect-square w-full bg-slate-950 rounded-xl border border-slate-800 overflow-hidden flex items-center justify-center group shadow-inner">
              {/* Dimetric Ground Grid Overlay */}
              {showGridOverlay && (
                <div
                  className="absolute inset-0 opacity-20 pointer-events-none"
                  style={{
                    backgroundImage: `radial-gradient(#38bdf8 1px, transparent 1px)`,
                    backgroundSize: '24px 12px', // 2:1 dimetric ratio aspect
                  }}
                />
              )}

              {/* Main Sprite Image */}
              <img
                src={form.imageUrl}
                alt={form.name}
                referrerPolicy="no-referrer"
                className="max-h-[80%] max-w-[80%] object-contain drop-shadow-2xl transition-transform"
                style={{
                  transformOrigin: `${form.anchor.x * 100}% ${form.anchor.y * 100}%`,
                }}
              />

              {/* Elliptical Shadow Simulation in 2.5D */}
              {form.shadow?.enabled && (
                <div
                  className="absolute pointer-events-none rounded-full bg-black/60 blur-[1px] border border-cyan-400/20"
                  style={{
                    width: `${form.shadow.radiusX * 2}px`,
                    height: `${form.shadow.radiusY * 2}px`,
                    opacity: form.shadow.opacity,
                    bottom: `${100 - form.anchor.y * 100 - (form.shadow.offsetY || 0)}%`,
                    left: `calc(50% - ${form.shadow.radiusX}px)`,
                  }}
                />
              )}

              {/* Anchor & Foot Point Marker */}
              {showGridOverlay && (
                <div
                  className="absolute pointer-events-none flex items-center justify-center"
                  style={{
                    left: `${form.anchor.x * 100}%`,
                    top: `${form.anchor.y * 100}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-rose-500 bg-rose-500/30 animate-pulse" />
                  <span className="absolute -top-4 text-[9px] font-mono text-rose-400 bg-slate-950/80 px-1 rounded border border-rose-800/60 whitespace-nowrap">
                    Anchor [{form.anchor.x}, {form.anchor.y}]
                  </span>
                </div>
              )}

              {/* Top Bar inside Viewport */}
              <div className="absolute top-2 left-2 flex items-center gap-1.5">
                <button
                  onClick={() => setShowGridOverlay(!showGridOverlay)}
                  className={`px-2 py-1 text-[10px] font-semibold rounded-md border backdrop-blur-sm transition ${
                    showGridOverlay
                      ? 'bg-cyan-950/80 border-cyan-700 text-cyan-300'
                      : 'bg-slate-900/80 border-slate-700 text-slate-400'
                  }`}
                >
                  {showGridOverlay ? 'Calibración 2.5D: Activa' : 'Calibración: Oculta'}
                </button>
              </div>

              <div className="absolute bottom-2 right-2 px-2 py-1 bg-slate-950/80 border border-slate-800 text-[10px] font-mono text-slate-400 rounded-md">
                {form.resolution.width}x{form.resolution.height}px
              </div>
            </div>

            {/* Silhouette & Palette summary */}
            <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl flex items-center justify-between">
              <div>
                <div className="text-[11px] text-slate-400 uppercase font-semibold">Legibilidad de Silueta</div>
                <div className="text-sm font-bold text-emerald-400 flex items-center gap-1.5 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{form.metadata.silhouetteScore || 94}% (Óptima Phaser 3)</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[11px] text-slate-400 uppercase font-semibold mb-1">Paleta Extraída</div>
                <div className="flex items-center gap-1">
                  {form.metadata.colorPalette?.map((hex, idx) => (
                    <div
                      key={idx}
                      className="w-4 h-4 rounded-sm border border-slate-700"
                      style={{ backgroundColor: hex }}
                      title={hex}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Tabbed Inspector Controls */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {/* Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
              <button
                onClick={() => setActiveTab('specs')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  activeTab === 'specs'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Calibración 2.5D & Física</span>
              </button>
              <button
                onClick={() => setActiveTab('linking')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  activeTab === 'linking'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Link className="w-3.5 h-3.5" />
                <span>Vinculación de Entidad</span>
              </button>
              <button
                onClick={() => setActiveTab('phaser')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  activeTab === 'phaser'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Code className="w-3.5 h-3.5" />
                <span>Código Phaser 3</span>
              </button>
            </div>

            {/* Tab: Specs */}
            {activeTab === 'specs' && (
              <div className="space-y-4">
                {/* Basic info */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                      Nombre del Asset
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                      Escala en Escena
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.2"
                      max="3.0"
                      value={form.scale}
                      onChange={(e) => setForm({ ...form, scale: parseFloat(e.target.value) || 1.0 })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                    />
                  </div>
                </div>

                {/* 2.5D Anchor & Y-Sorting */}
                <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                    <span className="flex items-center gap-1.5 text-cyan-400">
                      <Move className="w-3.5 h-3.5" />
                      Anclaje Dimétrico & Profundidad Y-Sorting
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">depth = y + ySortOffset</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1">Anchor X (0 a 1)</label>
                      <input
                        type="number"
                        step="0.05"
                        min="0"
                        max="1"
                        value={form.anchor.x}
                        onChange={(e) => handleAnchorChange('x', parseFloat(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-cyan-300 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1">Anchor Y (0.85 a 0.95)</label>
                      <input
                        type="number"
                        step="0.05"
                        min="0"
                        max="1"
                        value={form.anchor.y}
                        onChange={(e) => handleAnchorChange('y', parseFloat(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-cyan-300 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1">ySortOffset (px)</label>
                      <input
                        type="number"
                        value={form.ySortOffset}
                        onChange={(e) => setForm({ ...form, ySortOffset: parseInt(e.target.value) || 0 })}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-cyan-300 font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Collision Box */}
                <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl space-y-3">
                  <div className="text-xs font-bold text-slate-300">Caja de Colisión Base (Phaser Arcade)</div>
                  <div className="grid grid-cols-4 gap-2">
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1">Ancho (px)</label>
                      <input
                        type="number"
                        value={form.collisionBox.width}
                        onChange={(e) => handleCollisionChange('width', parseInt(e.target.value) || 0)}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1">Alto (px)</label>
                      <input
                        type="number"
                        value={form.collisionBox.height}
                        onChange={(e) => handleCollisionChange('height', parseInt(e.target.value) || 0)}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1">Offset X</label>
                      <input
                        type="number"
                        value={form.collisionBox.offsetX}
                        onChange={(e) => handleCollisionChange('offsetX', parseInt(e.target.value) || 0)}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1">Offset Y</label>
                      <input
                        type="number"
                        value={form.collisionBox.offsetY}
                        onChange={(e) => handleCollisionChange('offsetY', parseInt(e.target.value) || 0)}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Sombra Elíptica 2.5D */}
                <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                    <span>Sombra Elíptica Dimétrica (Proyección 2:1)</span>
                    <input
                      type="checkbox"
                      checked={form.shadow.enabled}
                      onChange={(e) => handleShadowChange('enabled', e.target.checked)}
                      className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0"
                    />
                  </div>
                  {form.shadow.enabled && (
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-1">Radio X (px)</label>
                        <input
                          type="number"
                          value={form.shadow.radiusX}
                          onChange={(e) => handleShadowChange('radiusX', parseInt(e.target.value) || 0)}
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-1">Radio Y (2:1)</label>
                        <input
                          type="number"
                          value={form.shadow.radiusY}
                          onChange={(e) => handleShadowChange('radiusY', parseInt(e.target.value) || 0)}
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-1">Opacidad (0 a 1)</label>
                        <input
                          type="number"
                          step="0.05"
                          min="0"
                          max="1"
                          value={form.shadow.opacity}
                          onChange={(e) => handleShadowChange('opacity', parseFloat(e.target.value) || 0.5)}
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 font-mono"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab: Linking */}
            {activeTab === 'linking' && (
              <div className="space-y-4">
                <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-1">
                    Vínculo DATA ENTITY ↔ VISUAL ASSET
                  </h4>
                  <p className="text-xs text-slate-400 mb-3">
                    Asocia este asset gráfico directamente a una criatura o NPC en el proyecto AURORA para que el motor de juego lo reconozca automáticamente.
                  </p>

                  {/* Current link status */}
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between mb-4">
                    <div>
                      <span className="text-[11px] text-slate-400">Entidad Vinculada Actualmente:</span>
                      <div className="text-xs font-bold text-white mt-0.5">
                        {linkedCreature?.name || linkedNpc?.name || linkedItem?.name || 'Ninguna entidad vinculada'}
                      </div>
                      {form.relatedEntityId && (
                        <span className="text-[10px] font-mono text-slate-500">{form.relatedEntityId}</span>
                      )}
                    </div>
                    {form.relatedEntityId && (
                      <button
                        onClick={() => {
                          setForm({ ...form, relatedEntityId: undefined });
                          showToast('Vínculo deshecho.', 'info');
                        }}
                        className="text-xs text-rose-400 hover:underline"
                      >
                        Desvincular
                      </button>
                    )}
                  </div>

                  {/* Link Picker */}
                  <label className="block text-xs font-semibold text-slate-300 mb-2">
                    Seleccionar Criatura o NPC del Proyecto:
                  </label>
                  <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                    {projectContext.creatures.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          linkVisualAssetToEntity(form.id, 'creature', c.id);
                          setForm({ ...form, relatedEntityId: c.id });
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between border transition ${
                          form.relatedEntityId === c.id
                            ? 'bg-cyan-950/80 border-cyan-600 text-cyan-300 font-bold'
                            : 'bg-slate-900/70 border-slate-800 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-400" />
                          <span>{c.name}</span>
                          <span className="text-[10px] text-slate-500 font-mono">({c.id})</span>
                        </div>
                        <span className="text-[10px] uppercase text-slate-400 font-semibold">{c.rarity}</span>
                      </button>
                    ))}
                    {projectContext.npcs.map((n) => (
                      <button
                        key={n.id}
                        type="button"
                        onClick={() => {
                          linkVisualAssetToEntity(form.id, 'npc', n.id);
                          setForm({ ...form, relatedEntityId: n.id });
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between border transition ${
                          form.relatedEntityId === n.id
                            ? 'bg-cyan-950/80 border-cyan-600 text-cyan-300 font-bold'
                            : 'bg-slate-900/70 border-slate-800 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-indigo-400" />
                          <span>{n.name}</span>
                          <span className="text-[10px] text-slate-500 font-mono">({n.id})</span>
                        </div>
                        <span className="text-[10px] uppercase text-slate-400 font-semibold">{n.role}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Phaser */}
            {activeTab === 'phaser' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300">
                    Snippet de instanciación TypeScript para Phaser 3
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(phaserCodeSnippet);
                      showToast('Código Phaser 3 copiado al portapapeles.', 'success');
                    }}
                    className="flex items-center gap-1 text-xs text-cyan-400 hover:underline"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Snippet</span>
                  </button>
                </div>
                <pre className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs text-cyan-300 font-mono overflow-x-auto leading-relaxed">
                  {phaserCodeSnippet}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/80">
          <button
            onClick={handleDelete}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 border border-rose-900/50 rounded-xl transition"
          >
            <Trash2 className="w-4 h-4" />
            <span>Eliminar Asset</span>
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
            >
              Cerrar
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-cyan-950/50 transition"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Calibración</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
