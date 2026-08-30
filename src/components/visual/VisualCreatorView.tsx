import React, { useState } from 'react';
import { useAurora } from '../../context/AuroraContext';
import {
  VisualAsset,
  VisualAssetType,
  VisualOrientation,
  VariantType,
} from '../../types/aurora';
import { buildVisualContext } from '../../lib/visualGeneratorEngine';
import { VisualContextCard } from './VisualContextCard';
import { VisualAssetInspector } from './VisualAssetInspector';
import { VisualVariantModal } from './VisualVariantModal';
import {
  Sparkles,
  Palette,
  Layers,
  Box,
  Compass,
  Filter,
  Plus,
  RefreshCw,
  Search,
  BookOpen,
  ShieldCheck,
  Eye,
  Sliders,
  ChevronRight,
  Flame,
} from 'lucide-react';

export const VisualCreatorView: React.FC = () => {
  const {
    projectContext,
    stageVisualAssetGeneration,
    isGenerating,
    selectedVisualAsset,
    setSelectedVisualAsset,
    setActiveTab,
    showToast,
  } = useAurora();

  // Generator form state
  const [assetName, setAssetName] = useState<string>('');
  const [category, setCategory] = useState<VisualAssetType>('creature_sprite');
  const [prompt, setPrompt] = useState<string>(
    'Genera una criatura poco común del Bosque Susurrante, relacionada con humedad y bioluminiscencia.'
  );
  const [selectedRegionId, setSelectedRegionId] = useState<string>(
    projectContext.regions[0]?.id || ''
  );
  const [selectedBiomeId, setSelectedBiomeId] = useState<string>(
    projectContext.biomes[0]?.id || ''
  );
  const [relatedEntityId, setRelatedEntityId] = useState<string>('');
  const [referenceAssetId, setReferenceAssetId] = useState<string>('');
  const [orientation, setOrientation] = useState<VisualOrientation>('south');

  // Modals state
  const [inspectingAsset, setInspectingAsset] = useState<VisualAsset | null>(null);
  const [variantTargetAsset, setVariantTargetAsset] = useState<VisualAsset | null>(null);

  // Gallery filter
  const [galleryFilter, setGalleryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Pre-calculate visual context
  const visualContextData = buildVisualContext(
    projectContext,
    category,
    selectedBiomeId,
    relatedEntityId,
    referenceAssetId
  );

  const categoryOptions: { type: VisualAssetType; label: string; icon: string }[] = [
    { type: 'creature_sprite', label: 'Criaturas', icon: '🦊' },
    { type: 'npc_sprite', label: 'NPCs & Guías', icon: '🧙' },
    { type: 'enemy_sprite', label: 'Enemigos', icon: '⚔️' },
    { type: 'boss_concept', label: 'Jefes / Bosses', icon: '👑' },
    { type: 'item_icon', label: 'Objetos & Reliquias', icon: '💎' },
    { type: 'foliage_plant', label: 'Vegetación & Recursos', icon: '🌿' },
    { type: 'building_structure', label: 'Edificios & Estructuras', icon: '🏛️' },
  ];

  const promptSuggestions = [
    {
      label: 'Criatura Bioluminiscente',
      category: 'creature_sprite' as VisualAssetType,
      text: 'Genera una criatura poco común del Bosque Susurrante, relacionada con humedad y bioluminiscencia cian.',
    },
    {
      label: 'Jefe Guardián de Aether',
      category: 'boss_concept' as VisualAssetType,
      text: 'Jefe ancestral con cornamenta de cristal plateado, cuerpo imponente y runas incandescentes en perspectiva dimétrica 2:1.',
    },
    {
      label: 'NPC Sabio Ancestro',
      category: 'npc_sprite' as VisualAssetType,
      text: 'NPC anciano druida con báculo de madera aether y vestimenta ceremonial del Bosque Susurrante.',
    },
    {
      label: 'Reliquia Mística',
      category: 'item_icon' as VisualAssetType,
      text: 'Orbe de cristal etéreo que flota suavemente y emite partículas de maná condensado.',
    },
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      showToast('Por favor introduce un prompt descriptivo.', 'error');
      return;
    }

    try {
      const generatedName = assetName.trim() || `Asset 2.5D ${category.replace('_', ' ')}`;
      await stageVisualAssetGeneration({
        name: generatedName,
        category,
        prompt,
        regionId: selectedRegionId,
        biomeId: selectedBiomeId,
        relatedEntityId: relatedEntityId || undefined,
        referenceAssetId: referenceAssetId || undefined,
        orientation,
      });
      showToast('Asset visual generado exitosamente y enviado a Staging.', 'success');
      setAssetName('');
    } catch (e: any) {
      showToast('Error generando asset visual: ' + e.message, 'error');
    }
  };

  // Filtered Assets
  const assets = projectContext.visualAssets || [];
  const filteredAssets = assets.filter((asset) => {
    if (galleryFilter !== 'all') {
      if (galleryFilter === 'variant' && (!asset.variantType || asset.variantType === 'original')) return false;
      if (galleryFilter !== 'variant' && !asset.type.includes(galleryFilter)) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        asset.name.toLowerCase().includes(q) ||
        asset.type.toLowerCase().includes(q) ||
        asset.prompt.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div id="visual-creator-view" className="space-y-8">
      {/* Top Banner & Hub Navigation */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 bg-slate-900/90 border border-slate-800 rounded-2xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <Palette className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-white tracking-tight">
                Visual Content Studio (Fase 3)
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                2.5D DIMETRIC 2:1
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Generación de arte conceptual, sprites 2.5D y calibración de profundidad conectada al contexto real de AURORA.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('style_bible')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition"
          >
            <BookOpen className="w-4 h-4 text-indigo-400" />
            <span>Visual Style Bible</span>
          </button>
          <button
            onClick={() => setActiveTab('visual_qa')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition"
          >
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>Visual QA Inspector</span>
          </button>
        </div>
      </div>

      {/* Grounded Visual Context Display */}
      <VisualContextCard contextData={visualContextData} category={category} />

      {/* Main Studio Workspace: 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Generation Controls (5 Columns) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Consola de Creación Visual con IA</span>
              </h3>
              <span className="text-[10px] text-slate-500 font-mono">Grounded Prompting</span>
            </div>

            {/* Category Selector */}
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-300 tracking-wider mb-2">
                Tipo de Entidad Visual
              </label>
              <div className="grid grid-cols-2 gap-2">
                {categoryOptions.map((opt) => (
                  <button
                    key={opt.type}
                    type="button"
                    onClick={() => setCategory(opt.type)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-semibold border transition text-left ${
                      category === opt.type
                        ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300 shadow-md ring-1 ring-cyan-500/50'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    }`}
                  >
                    <span className="text-base">{opt.icon}</span>
                    <span className="truncate">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Name Input */}
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-300 tracking-wider mb-1.5">
                Nombre de la Entidad (Opcional)
              </label>
              <input
                type="text"
                value={assetName}
                onChange={(e) => setAssetName(e.target.value)}
                placeholder="Ej: Lumivox Ancestral, Sylphira, Torre del Aether..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Location & Biome Context Selectors */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-1">
                  Región de Origen
                </label>
                <select
                  value={selectedRegionId}
                  onChange={(e) => setSelectedRegionId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  {projectContext.regions.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-1">
                  Bioma Asociado
                </label>
                <select
                  value={selectedBiomeId}
                  onChange={(e) => setSelectedBiomeId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  {projectContext.biomes.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Link to existing Entity (Optional) */}
            <div>
              <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-1">
                Vincular a Criatura / NPC Existente (DATA LINK)
              </label>
              <select
                value={relatedEntityId}
                onChange={(e) => setRelatedEntityId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="">-- Sin vincular directamente --</option>
                <optgroup label="Criaturas">
                  {projectContext.creatures.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.id})
                    </option>
                  ))}
                </optgroup>
                <optgroup label="NPCs">
                  {projectContext.npcs.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.name} ({n.id})
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            {/* Prompt Input & Quick Ideas */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase text-slate-300 tracking-wider">
                  Instrucción Artística con IA
                </label>
              </div>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={3}
                placeholder="Describe los rasgos visuales, bioluminiscencia, materiales..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 resize-none leading-relaxed"
              />

              {/* Suggestions Chips */}
              <div className="mt-2 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Ideas Rápidas:</span>
                <div className="flex flex-wrap gap-1.5">
                  {promptSuggestions.map((sug, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setCategory(sug.category);
                        setPrompt(sug.text);
                      }}
                      className="px-2 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-[11px] text-slate-300 rounded-md transition truncate max-w-[220px]"
                    >
                      {sug.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Orientation */}
            <div>
              <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-1">
                Orientación Inicial 2.5D
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'south', label: 'Sur (Frontal)' },
                  { id: 'north', label: 'Norte (Espalda)' },
                  { id: 'west', label: 'Oeste (Izquierda)' },
                  { id: 'east', label: 'Este (Derecha)' },
                ].map((dir) => (
                  <button
                    key={dir.id}
                    type="button"
                    onClick={() => setOrientation(dir.id as any)}
                    className={`py-1.5 text-[11px] font-semibold rounded-lg border transition ${
                      orientation === dir.id
                        ? 'bg-cyan-950 border-cyan-500 text-cyan-300 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {dir.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-cyan-500 to-emerald-600 hover:from-cyan-400 hover:to-emerald-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-cyan-950/60 transition disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Generando & Analizando en Staging...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generar Asset & Enviar a Staging Area</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right: Asset Gallery & Pipeline (7 Columns) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Gallery Bar */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              {[
                { id: 'all', label: 'Todos' },
                { id: 'creature', label: 'Criaturas' },
                { id: 'npc', label: 'NPCs' },
                { id: 'boss', label: 'Jefes' },
                { id: 'item', label: 'Objetos' },
                { id: 'variant', label: 'Variantes ★' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setGalleryFilter(f.id)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg shrink-0 transition ${
                    galleryFilter === f.id
                      ? 'bg-cyan-600 text-white shadow'
                      : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative min-w-[180px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Buscar assets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Asset Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filteredAssets.map((asset) => {
              const isLinked = !!asset.relatedEntityId;
              return (
                <div
                  key={asset.id}
                  className="bg-slate-900/80 border border-slate-800 hover:border-cyan-500/60 rounded-xl overflow-hidden shadow-lg transition-all group flex flex-col justify-between"
                >
                  {/* Image Viewport */}
                  <div className="relative aspect-square bg-slate-950 flex items-center justify-center p-3 overflow-hidden">
                    <img
                      src={asset.imageUrl}
                      alt={asset.name}
                      referrerPolicy="no-referrer"
                      className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-200"
                    />

                    {/* Top Badges */}
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                      <span className="px-2 py-0.5 bg-slate-950/80 backdrop-blur-sm border border-slate-800 text-[9px] uppercase font-bold text-cyan-300 rounded">
                        {asset.type.replace('_', ' ')}
                      </span>
                      {asset.variantType && asset.variantType !== 'original' && (
                        <span className="px-2 py-0.5 bg-amber-950/90 backdrop-blur-sm border border-amber-700 text-[9px] uppercase font-bold text-amber-300 rounded">
                          ★ {asset.variantType}
                        </span>
                      )}
                    </div>

                    {/* Resolution Tag */}
                    <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-slate-950/80 text-[9px] font-mono text-slate-400 rounded border border-slate-800">
                      {asset.resolution.width}x{asset.resolution.height}
                    </div>
                  </div>

                  {/* Info Card */}
                  <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white truncate">{asset.name}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">{asset.prompt}</p>
                    </div>

                    {/* 2.5D Technical Specs & Data Link */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-800 text-[10px]">
                      <div className="flex items-center justify-between text-slate-400">
                        <span>Anchor Y: <b className="text-cyan-300">{asset.anchor.y}</b></span>
                        <span>Y-Sort: <b className="text-indigo-300">+{asset.ySortOffset}px</b></span>
                      </div>

                      <div className="flex items-center justify-between text-slate-400">
                        <span>Vinculación:</span>
                        {isLinked ? (
                          <span className="text-emerald-400 font-mono truncate max-w-[110px]">
                            {asset.relatedEntityId}
                          </span>
                        ) : (
                          <span className="text-slate-500 italic">No asignado</span>
                        )}
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="flex items-center gap-1.5 pt-2 border-t border-slate-800">
                      <button
                        onClick={() => setInspectingAsset(asset)}
                        className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold rounded-lg transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspeccionar</span>
                      </button>
                      <button
                        onClick={() => setVariantTargetAsset(asset)}
                        className="p-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg transition"
                        title="Crear Variante (Shiny, Elemental...)"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredAssets.length === 0 && (
            <div className="p-12 text-center bg-slate-900/40 border border-slate-800 rounded-2xl">
              <Palette className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-slate-300">No se encontraron assets con este filtro</h4>
              <p className="text-xs text-slate-500 mt-1">
                Genera tu primer concept art o ajusta los parámetros de búsqueda.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Asset Inspector Modal */}
      {inspectingAsset && (
        <VisualAssetInspector
          asset={inspectingAsset}
          onClose={() => setInspectingAsset(null)}
          onOpenVariantModal={(a) => {
            setInspectingAsset(null);
            setVariantTargetAsset(a);
          }}
        />
      )}

      {/* Variant Generation Modal */}
      {variantTargetAsset && (
        <VisualVariantModal
          asset={variantTargetAsset}
          onClose={() => setVariantTargetAsset(null)}
        />
      )}
    </div>
  );
};
