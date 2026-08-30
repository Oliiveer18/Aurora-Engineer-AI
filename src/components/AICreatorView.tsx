import React, { useState } from 'react';
import { useAurora } from '../context/AuroraContext';
import { AuroraEntityType, ElementType, RarityType } from '../types/aurora';
import { Isometric2D5Canvas } from './Isometric2D5Canvas';
import {
  Sparkles,
  Send,
  CheckCircle2,
  Edit3,
  RefreshCw,
  Layers,
  Activity,
  Compass,
  Zap,
  HelpCircle,
  ArrowRight,
  Sliders,
  Shield,
  Tag,
  Wand2,
  MapPin,
  Info,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

export const AICreatorView: React.FC = () => {
  const {
    stageEntityGeneration,
    addEntity,
    setSelectedEntity,
    setActiveTab,
    projectContext,
    knowledgeBase,
    showToast,
    isGenerating,
  } = useAurora();

  const [category, setCategory] = useState<AuroraEntityType>('creature');
  const [selectedTargetLocation, setSelectedTargetLocation] = useState<string>('');
  const [prompt, setPrompt] = useState<string>(
    'Crea una criatura de naturaleza poco común para el Bosque Susurrante, con dos evoluciones y una habilidad exclusiva.'
  );
  const [generatedResult, setGeneratedResult] = useState<any | null>(null);
  const [lastContextUsed, setLastContextUsed] = useState<any | null>(null);
  const [showContextDetails, setShowContextDetails] = useState<boolean>(false);

  // Quick category prompt templates
  const categoryTemplates: Record<AuroraEntityType, string[]> = {
    creature: [
      'Crea una criatura de naturaleza poco común para el Bosque Susurrante, con dos evoluciones y una habilidad exclusiva.',
      'Crea un reptil ígneo acorazado para el Volcán de nivel 25 con ataque en área dimétrico.',
      'Crea un espíritu de hielo legendario que invoque ventiscas en la Meseta de Escarcha.',
      'Crea una criatura acuática de pantano con debilidad eléctrica y comportamiento nocturno.',
    ],
    npc: [
      'Crea un anciano alquimista ermitaño en el Bosque Susurrante que ofrezca recetas de pociones de Aether.',
      'Crea un capitán de la guardia desconfiado pero leal en las Cumbres de Cristal con una misión de caza.',
      'Crea una mercader nómada que viaje entre biomas vendiendo reliquias 2.5D raras.',
    ],
    quest: [
      'Crea una misión principal de investigación sobre la corrupción del Árbol Primordial en el Bosque.',
      'Crea un contrato de recompensa para derrotar a 5 bestias ígneas en el cráter volcánico.',
      'Crea una misión de recolección de 4 cristales de escarcha para forjar una armadura helada.',
    ],
    biome: [
      'Genera un bioma de Pantano Venenoso con niebla púrpura, iluminación ambiental tenue y criaturas anfibias.',
      'Genera una Cueva de Cristales Resonantes con reflejos prismáticos y criaturas de tipo Luz y Éter.',
    ],
    item: [
      'Crea una poción de savia pura que restaure salud y otorgue inmunidad al veneno durante 3 turnos.',
      'Crea un mineral raro de obsidiana volcánica para mejorar armas en la Forja Solar.',
    ],
    ability: [
      'Crea un ataque de área 2.5D llamado "Espinas Sísmicas" de tipo Tierra que aturde a los enemigos.',
      'Crea una habilidad de soporte de tipo Luz que disipe estados alterados y cure a los aliados cercanos.',
    ],
    dungeon: [
      'Crea una mazmorra de 3 plantas en las Raíces Huecas del bosque con puzzles de flores bioluminiscentes.',
    ],
    faction: [
      'Crea una facción de Druidas del Aether opuesta a la explotación minera de los volcanes.',
    ],
    shop: [
      'Crea una tienda de suministros de expedición cerca del campamento base de montaña.',
    ],
    region: [
      'Crea una región montañosa llamada "Cumbres de Cristal" con 2 biomas y elevaciones de 0 a 10 capas.',
    ],
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setGeneratedResult(null);

    try {
      const staged = await stageEntityGeneration(
        category,
        prompt,
        selectedTargetLocation || undefined
      );
      const newEntity = staged.changes.find((c) => c.action === 'new')?.entity;
      setGeneratedResult(newEntity);
      setLastContextUsed(staged.contextUsed);
      showToast(`¡Generación completada! Revisa el Diff Preview o el inspector.`, 'success');
    } catch (e: any) {
      console.error(e);
      showToast(`Error al generar: ${e.message}`, 'error');
    }
  };

  const handleApprove = () => {
    if (!generatedResult) return;
    addEntity(category, generatedResult);
    setSelectedEntity({ type: category, data: generatedResult });
    showToast(`Elemento guardado en el proyecto.`, 'success');
  };

  const handleApproveAndEdit = () => {
    if (!generatedResult) return;
    addEntity(category, generatedResult);
    setSelectedEntity({ type: category, data: generatedResult });
    setActiveTab('editor');
  };

  const categories: { key: AuroraEntityType; label: string; icon: string }[] = [
    { key: 'creature', label: 'Criatura', icon: '🐾' },
    { key: 'npc', label: 'NPC', icon: '🧙' },
    { key: 'quest', label: 'Misión', icon: '📜' },
    { key: 'biome', label: 'Bioma & Ecosistema', icon: '🌲' },
    { key: 'item', label: 'Objeto / Recurso', icon: '💎' },
    { key: 'ability', label: 'Habilidad', icon: '⚡' },
    { key: 'dungeon', label: 'Mazmorra', icon: '🏰' },
    { key: 'faction', label: 'Facción', icon: '🛡️' },
  ];

  return (
    <div id="ai-creator-container" className="flex-1 flex flex-col h-full bg-slate-950 overflow-y-auto p-6 max-w-6xl mx-auto space-y-6">
      {/* Top Title Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            Estudio de Creación Asistida por IA (Grounded)
          </div>
          <h1 className="text-2xl font-bold text-slate-100">Generador de Contenido AURORA AI</h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Genera contenido integrado con el mapa existente en Cursor: perspectiva 2.5D dimétrica, Y-sorting para Phaser 3, balance numérico y respeto estricto de IDs ocupados.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono bg-slate-950/80 px-3.5 py-2 rounded-xl border border-slate-800 text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>Contexto del Proyecto: Conectado</span>
        </div>
      </div>

      {/* Target Anchor & Category Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Category Tabs */}
        <div className="md:col-span-2 space-y-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Tipo de Entidad a Producir:
          </label>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => {
                  setCategory(cat.key);
                  setPrompt(categoryTemplates[cat.key]?.[0] || '');
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                  category === cat.key
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/20'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Existing Map Location Anchor */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            Anclar a Bioma / Región Existente:
          </label>
          <select
            value={selectedTargetLocation}
            onChange={(e) => setSelectedTargetLocation(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500"
          >
            <option value="">Cualquier ubicación (Sin anclaje específico)</option>
            <optgroup label="Biomas Existentes">
              {projectContext.biomes.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.regionId})
                </option>
              ))}
            </optgroup>
            <optgroup label="Regiones Existentes">
              {projectContext.regions.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </optgroup>
          </select>
          <p className="text-[11px] text-slate-500 italic">
            El mapa en Cursor es la fuente de verdad. El contenido se ancla a estos espacios.
          </p>
        </div>
      </div>

      {/* Natural Language Prompt Box */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Wand2 className="w-3.5 h-3.5 text-amber-400" />
              Describe lo que quieres generar en lenguaje natural:
            </span>
            <span className="text-slate-500 font-mono text-[11px]">
              {knowledgeBase.occupiedIds.length} IDs indexados en Knowledge Base
            </span>
          </label>
          <div className="relative">
            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ejemplo: Crea una criatura de fuego acorazada con habilidades de área para la Cresta Ígnea..."
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 leading-relaxed pr-32"
            />
            <button
              id="ai-generate-btn"
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="absolute right-3 bottom-3 flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-lg shadow-lg shadow-amber-500/30 transition disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Procesando...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generar & Stage</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick Suggestion Chips */}
        <div>
          <span className="text-[11px] text-slate-500 font-mono uppercase tracking-wider block mb-1.5">
            Plantillas rápidas para {category}:
          </span>
          <div className="flex flex-wrap gap-2">
            {(categoryTemplates[category] || []).map((t, idx) => (
              <button
                key={idx}
                onClick={() => setPrompt(t)}
                className="text-xs text-left px-3 py-1.5 bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-amber-300 border border-slate-800 rounded-lg transition"
              >
                "{t.length > 60 ? t.substring(0, 60) + '...' : t}"
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grounding Context Used Inspector Block */}
      {lastContextUsed && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 text-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-cyan-400 font-bold">
              <Info className="w-4 h-4" />
              <span>CONTEXT USED (Grounding del Proyecto Existente):</span>
            </div>
            <button
              onClick={() => setShowContextDetails(!showContextDetails)}
              className="text-slate-400 hover:text-slate-200 flex items-center gap-1 font-medium"
            >
              <span>{showContextDetails ? 'Ocultar detalles' : 'Expandir reporte de contexto'}</span>
              {showContextDetails ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
              <span className="text-slate-500 block text-[10px]">Anclaje de Ubicación:</span>
              <span className="text-slate-200 font-semibold">{lastContextUsed.targetLocationName || 'Global / Sin anclaje'}</span>
            </div>
            <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
              <span className="text-slate-500 block text-[10px]">IDs Protegidos contra Colisión:</span>
              <span className="text-emerald-400 font-semibold">{lastContextUsed.occupiedIdsCount} IDs verificados</span>
            </div>
            <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
              <span className="text-slate-500 block text-[10px]">Elementos Sugeridos:</span>
              <span className="text-amber-400 font-semibold">{lastContextUsed.suggestedElementTypes?.join(', ') || 'Equilibrado'}</span>
            </div>
          </div>

          {showContextDetails && (
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-300 whitespace-pre-wrap leading-relaxed">
              {lastContextUsed.summary}
            </div>
          )}
        </div>
      )}

      {/* Generated Content Review Section */}
      {generatedResult && (
        <div className="p-6 bg-slate-900 border border-amber-500/40 rounded-2xl shadow-2xl space-y-6 animate-in fade-in duration-300">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/30">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-amber-400">
                    {category}
                  </span>
                  <h3 className="text-lg font-bold text-slate-100">
                    {generatedResult.name || generatedResult.title || generatedResult.id}
                  </h3>
                  {generatedResult.rarity && (
                    <span className="text-xs px-2 py-0.5 rounded font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      {generatedResult.rarity}
                    </span>
                  )}
                  {generatedResult.type && (
                    <span className="text-xs px-2 py-0.5 rounded font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {generatedResult.type}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 font-mono mt-0.5">ID: {generatedResult.id}</p>
              </div>
            </div>

            {/* Approval Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg border border-slate-700 transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Regenerar</span>
              </button>

              <button
                onClick={handleApprove}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-lg shadow-emerald-900/30 transition"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Aprobar & Guardar</span>
              </button>

              <button
                onClick={handleApproveAndEdit}
                className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg shadow-lg shadow-amber-500/30 transition"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Aprobar & Abrir Editor</span>
              </button>
            </div>
          </div>

          {/* Detailed Preview Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Lore & Stats Info */}
            <div className="space-y-4">
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Descripción / Lore:</span>
                <p className="text-sm text-slate-200 mt-1 leading-relaxed bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                  {generatedResult.description || generatedResult.backstory || 'Sin descripción'}
                </p>
              </div>

              {/* Stats Preview for creatures */}
              {generatedResult.stats && (
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                    Estadísticas Base (Phaser 3 RPG):
                  </span>
                  <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                    <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                      <span className="text-slate-500 block">HP</span>
                      <span className="text-emerald-400 font-bold text-sm">{generatedResult.stats.hp}</span>
                    </div>
                    <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                      <span className="text-slate-500 block">Ataque</span>
                      <span className="text-rose-400 font-bold text-sm">{generatedResult.stats.attack}</span>
                    </div>
                    <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                      <span className="text-slate-500 block">Defensa</span>
                      <span className="text-sky-400 font-bold text-sm">{generatedResult.stats.defense}</span>
                    </div>
                    <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                      <span className="text-slate-500 block">Velocidad</span>
                      <span className="text-amber-400 font-bold text-sm">{generatedResult.stats.speed}</span>
                    </div>
                    <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                      <span className="text-slate-500 block">Sp. Atk</span>
                      <span className="text-purple-400 font-bold text-sm">{generatedResult.stats.specialAttack || 50}</span>
                    </div>
                    <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                      <span className="text-slate-500 block">Sp. Def</span>
                      <span className="text-indigo-400 font-bold text-sm">{generatedResult.stats.specialDefense || 50}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Evolutions & Abilities list */}
              {generatedResult.evolution && generatedResult.evolution.length > 0 && (
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Línea Evolutiva:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {generatedResult.evolution.map((evo: string) => (
                      <span key={evo} className="px-2.5 py-1 bg-slate-950 border border-slate-800 rounded text-xs font-mono text-cyan-300">
                        → {evo}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right: 2.5D Isometric Interactive Canvas Preview */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                Previsualización Dimétrica 2.5D en Tiempo Real:
              </span>
              <Isometric2D5Canvas
                visual={
                  generatedResult.visual2D5 || {
                    spriteWidth: 64,
                    spriteHeight: 64,
                    anchorX: 0.5,
                    anchorY: 0.9,
                    ySortOffset: 8,
                    collisionBox: { width: 36, height: 24, offsetX: 14, offsetY: 36 },
                    shadow: { enabled: true, radiusX: 18, radiusY: 9, opacity: 0.5, offsetY: 2 },
                    dimetricAngleDeg: 26.565,
                    elevationZ: 0,
                    facingDirections: 4,
                  }
                }
                entityName={generatedResult.name || generatedResult.title || generatedResult.id}
                elementType={generatedResult.type || 'nature'}
                rarity={generatedResult.rarity || 'uncommon'}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
