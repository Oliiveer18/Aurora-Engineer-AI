import React, { useState } from 'react';
import { useAurora } from '../context/AuroraContext';
import { AuroraEntityType, ElementType, RarityType, Creature, NPC, Quest, Biome, Item, Ability } from '../types/aurora';
import { Isometric2D5Canvas } from './Isometric2D5Canvas';
import {
  Save,
  Trash2,
  Copy,
  Sparkles,
  Layers,
  Activity,
  MessageSquare,
  GitBranch,
  Code2,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Shield,
  Zap,
  Flame,
  Droplets,
  Wind,
  Compass,
  X,
  FileCode,
} from 'lucide-react';
import { exportAsTypeScriptData, generatePhaser3SceneIntegration } from '../lib/exportFormatter';

export const VisualEntityEditor: React.FC = () => {
  const { selectedEntity, setSelectedEntity, updateEntity, deleteEntity, duplicateEntity, projectContext, executeSmartAction, showToast } =
    useAurora();

  const [activeTab, setActiveTab] = useState<'general' | 'stats' | 'visual2d5' | 'relations' | 'dialogue' | 'code'>('general');
  const [smartActionLoading, setSmartActionLoading] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  if (!selectedEntity) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500">
        <Compass className="w-12 h-12 mb-3 text-slate-600 animate-pulse" />
        <h3 className="text-lg font-semibold text-slate-300">Ningún elemento seleccionado</h3>
        <p className="text-sm max-w-md mt-1">
          Selecciona un elemento desde la Biblioteca de Contenido o genera una nueva entidad con IA para editarla en tiempo real.
        </p>
      </div>
    );
  }

  const { type, data } = selectedEntity;
  const isCreature = type === 'creature';
  const isNPC = type === 'npc';
  const isQuest = type === 'quest';
  const isBiome = type === 'biome';

  const handleFieldChange = (field: string, value: any) => {
    const updated = { ...data, [field]: value };
    setSelectedEntity({ type, data: updated });
    updateEntity(type, updated);
  };

  const handleNestedChange = (parent: string, field: string, value: any) => {
    const updated = {
      ...data,
      [parent]: {
        ...(data[parent] || {}),
        [field]: value,
      },
    };
    setSelectedEntity({ type, data: updated });
    updateEntity(type, updated);
  };

  // Smart AI Quick Actions
  const runSmartAction = async (actionType: string, options: any = {}) => {
    setSmartActionLoading(true);
    try {
      const result = await executeSmartAction(actionType, data, options);
      if (result) {
        setSelectedEntity({ type, data: result });
        updateEntity(type, result);
        showToast(`Acción "${actionType}" aplicada con éxito.`, 'success');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSmartActionLoading(false);
    }
  };

  const elementOptions: ElementType[] = [
    'nature',
    'fire',
    'water',
    'electric',
    'ice',
    'shadow',
    'light',
    'earth',
    'wind',
    'neutral',
    'aether',
  ];

  const rarityOptions: RarityType[] = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'];

  // Stat summary calculation
  const totalStats = isCreature && data.stats
    ? (data.stats.hp || 0) +
      (data.stats.attack || 0) +
      (data.stats.defense || 0) +
      (data.stats.speed || 0) +
      (data.stats.specialAttack || 0) +
      (data.stats.specialDefense || 0)
    : 0;

  const typeColorMap: Record<string, string> = {
    nature: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    fire: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
    water: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
    electric: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
    ice: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    shadow: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
    light: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-y-auto">
      {/* Editor Header Bar */}
      <div className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 px-6 py-4 bg-slate-900/90 backdrop-blur border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-800 rounded-lg border border-slate-700">
            <Compass className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                {type}
              </span>
              <h2 className="text-lg font-bold text-slate-100">{data.name || data.title || data.id}</h2>
              {data.rarity && (
                <span className="text-xs px-2 py-0.5 rounded font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {data.rarity}
                </span>
              )}
              {data.type && (
                <span className={`text-xs px-2 py-0.5 rounded font-mono border ${typeColorMap[data.type] || 'bg-slate-800 text-slate-300'}`}>
                  {data.type}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">ID: {data.id}</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Smart AI Actions Dropdown / Trigger */}
          <div className="relative group">
            <button
              disabled={smartActionLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-lg shadow-lg shadow-purple-900/30 transition disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {smartActionLoading ? 'IA Procesando...' : 'Acciones Inteligentes'}
            </button>
            <div className="absolute right-0 mt-1 w-52 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-1 hidden group-hover:block z-30">
              <button
                onClick={() => runSmartAction('improve')}
                className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 flex items-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>Mejorar y Pulir Lore</span>
              </button>
              {isCreature && (
                <button
                  onClick={() => runSmartAction('balance')}
                  className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 flex items-center gap-2"
                >
                  <Activity className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Auto-Balancear Stats</span>
                </button>
              )}
              <button
                onClick={() => runSmartAction('variant', { targetBiomeOrElement: 'shadow' })}
                className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 flex items-center gap-2"
              >
                <GitBranch className="w-3.5 h-3.5 text-indigo-400" />
                <span>Crear Variante de Sombra</span>
              </button>
              <button
                onClick={() => runSmartAction('variant', { targetBiomeOrElement: 'ice' })}
                className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 flex items-center gap-2"
              >
                <Zap className="w-3.5 h-3.5 text-sky-400" />
                <span>Crear Variante de Hielo</span>
              </button>
              <button
                onClick={() => runSmartAction('complete_missing')}
                className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 flex items-center gap-2 border-t border-slate-800"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Completar Datos Faltantes</span>
              </button>
            </div>
          </div>

          <button
            onClick={() => duplicateEntity(type, data.id)}
            className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg border border-slate-700 transition"
            title="Duplicar entidad"
          >
            <Copy className="w-3.5 h-3.5 text-slate-400" />
            <span>Duplicar</span>
          </button>

          <button
            onClick={() => deleteEntity(type, data.id)}
            className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg border border-rose-500/20 transition"
            title="Eliminar entidad"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <button
            onClick={() => setSelectedEntity(null)}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 rounded-lg transition"
            title="Cerrar editor"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Editor Sub-Tabs Navigation */}
      <div className="flex border-b border-slate-800 px-6 bg-slate-900/40">
        <button
          onClick={() => setActiveTab('general')}
          className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition ${
            activeTab === 'general' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          General & Lore
        </button>

        {isCreature && (
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition ${
              activeTab === 'stats' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            Estadísticas ({totalStats} BST)
          </button>
        )}

        {(isCreature || isNPC || data.visual2D5) && (
          <button
            onClick={() => setActiveTab('visual2d5')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition ${
              activeTab === 'visual2d5' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Visor 2.5D & Y-Sorting
          </button>
        )}

        {isNPC && (
          <button
            onClick={() => setActiveTab('dialogue')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition ${
              activeTab === 'dialogue' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Árbol de Diálogos ({data.dialogues?.length || 0})
          </button>
        )}

        {isCreature && (
          <button
            onClick={() => setActiveTab('relations')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition ${
              activeTab === 'relations' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            Evoluciones & Hábitats
          </button>
        )}

        <button
          onClick={() => setActiveTab('code')}
          className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition ${
            activeTab === 'code' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          JSON & Phaser 3 TypeScript
        </button>
      </div>

      {/* Tab Contents */}
      <div className="p-6 max-w-5xl">
        {/* TAB 1: GENERAL & LORE */}
        {activeTab === 'general' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Nombre de la Entidad</label>
                <input
                  type="text"
                  value={data.name || data.title || ''}
                  onChange={(e) => handleFieldChange(data.name !== undefined ? 'name' : 'title', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">ID Único (Snake Case)</label>
                <input
                  type="text"
                  value={data.id || ''}
                  onChange={(e) => handleFieldChange('id', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Descripción & Lore</label>
              <textarea
                rows={4}
                value={data.description || data.backstory || ''}
                onChange={(e) => handleFieldChange(data.description !== undefined ? 'description' : 'backstory', e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-cyan-500 leading-relaxed"
                placeholder="Escribe la historia o comportamiento de la entidad..."
              />
            </div>

            {/* Categorization Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-900">
              {data.type && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Tipo Elemental Principal</label>
                  <select
                    value={data.type}
                    onChange={(e) => handleFieldChange('type', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    {elementOptions.map((elem) => (
                      <option key={elem} value={elem}>
                        {elem.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {data.rarity && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Rareza</label>
                  <select
                    value={data.rarity}
                    onChange={(e) => handleFieldChange('rarity', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    {rarityOptions.map((r) => (
                      <option key={r} value={r}>
                        {r.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {isCreature && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Comportamiento IA</label>
                  <select
                    value={data.behavior || 'passive'}
                    onChange={(e) => handleFieldChange('behavior', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="passive">Pasivo</option>
                    <option value="skittish">Eskittish / Huida</option>
                    <option value="territorial">Territorial</option>
                    <option value="aggressive">Agresivo</option>
                    <option value="pack_hunter">Cazador en Manada</option>
                    <option value="nocturnal">Nocturno</option>
                  </select>
                </div>
              )}

              {isNPC && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Rol en el Mundo</label>
                  <select
                    value={data.role || 'villager'}
                    onChange={(e) => handleFieldChange('role', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="quest_giver">Dador de Misiones</option>
                    <option value="merchant">Comerciante</option>
                    <option value="lore_keeper">Custodio de Lore</option>
                    <option value="trainer">Entrenador</option>
                    <option value="guard">Guardia</option>
                    <option value="faction_leader">Líder de Facción</option>
                    <option value="villager">Aldeano</option>
                  </select>
                </div>
              )}
            </div>

            {/* 2.5D Implementation Notes */}
            {data.implementationNotes2D5 && (
              <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
                <label className="block text-xs font-semibold text-cyan-400 mb-1 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  Notas de Implementación en Phaser 3 (2.5D)
                </label>
                <textarea
                  rows={2}
                  value={data.implementationNotes2D5}
                  onChange={(e) => handleFieldChange('implementationNotes2D5', e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-slate-300 font-mono"
                />
              </div>
            )}
          </div>
        )}

        {/* TAB 2: STATS & RPG BALANCE (For Creatures) */}
        {activeTab === 'stats' && isCreature && data.stats && (
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-xl">
              <div>
                <span className="text-xs text-slate-400">Total de Estadísticas Base (BST)</span>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-2xl font-bold text-cyan-400 font-mono">{totalStats}</span>
                  <span className="text-xs text-slate-400">
                    Rango recomendado para {data.rarity}:{' '}
                    <strong className="text-slate-200">
                      {data.rarity === 'common'
                        ? '280-350'
                        : data.rarity === 'uncommon'
                        ? '340-420'
                        : data.rarity === 'rare'
                        ? '420-520'
                        : data.rarity === 'epic'
                        ? '520-620'
                        : '620+'}
                    </strong>
                  </span>
                </div>
              </div>

              <button
                onClick={() => runSmartAction('balance')}
                className="flex items-center gap-1.5 px-3 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-lg text-xs font-semibold transition"
              >
                <Activity className="w-3.5 h-3.5" />
                Balancear con IA
              </button>
            </div>

            {/* Stat Sliders Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { key: 'hp', label: 'Puntos de Salud (HP)', color: 'accent-emerald-500', barColor: 'bg-emerald-500' },
                { key: 'attack', label: 'Ataque Físico', color: 'accent-rose-500', barColor: 'bg-rose-500' },
                { key: 'defense', label: 'Defensa Física', color: 'accent-blue-500', barColor: 'bg-blue-500' },
                { key: 'speed', label: 'Velocidad 2.5D', color: 'accent-amber-500', barColor: 'bg-amber-500' },
                { key: 'specialAttack', label: 'Ataque Especial', color: 'accent-purple-500', barColor: 'bg-purple-500' },
                { key: 'specialDefense', label: 'Defensa Especial', color: 'accent-indigo-500', barColor: 'bg-indigo-500' },
              ].map((stat) => (
                <div key={stat.key} className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl">
                  <div className="flex justify-between items-center text-xs mb-2">
                    <span className="font-medium text-slate-300">{stat.label}</span>
                    <span className="font-mono font-bold text-slate-100 text-sm">{data.stats[stat.key] || 0}</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="220"
                    value={data.stats[stat.key] || 50}
                    onChange={(e) => handleNestedChange('stats', stat.key, parseInt(e.target.value))}
                    className={`w-full ${stat.color}`}
                  />
                  <div className="w-full bg-slate-950 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div
                      className={`h-full ${stat.barColor}`}
                      style={{ width: `${Math.min(100, ((data.stats[stat.key] || 0) / 200) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Level & Spawn Rate */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-900">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Nivel Recomendado</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={data.recommendedLevel || 1}
                  onChange={(e) => handleFieldChange('recommendedLevel', parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Probabilidad de Aparición (%)</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={data.spawnRate || 25}
                  onChange={(e) => handleFieldChange('spawnRate', parseInt(e.target.value) || 25)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-100 font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: 2.5D DIMETRIC VISOR & DEPTH SORTING */}
        {activeTab === 'visual2d5' && data.visual2D5 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  Calibrador de Profundidad Dimétrica 2.5D
                </h3>
                <p className="text-xs text-slate-400">
                  Ajusta el ancla de pies, desfase Y-Sort y colisión para integración perfecta con el motor Phaser 3 de AURORA.
                </p>
              </div>
            </div>

            <Isometric2D5Canvas
              visual={data.visual2D5}
              entityName={data.name || data.title || data.id}
              elementType={data.type || 'nature'}
              rarity={data.rarity || 'uncommon'}
              onChangeVisual={(updated) => handleFieldChange('visual2D5', updated)}
            />

            {/* Collision Specs Detail */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-900 border border-slate-800 rounded-xl text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Ancho Sprite (px)</label>
                <input
                  type="number"
                  value={data.visual2D5.spriteWidth || 64}
                  onChange={(e) => handleNestedChange('visual2D5', 'spriteWidth', parseInt(e.target.value))}
                  className="w-full px-2 py-1.5 bg-slate-950 border border-slate-800 rounded font-mono text-slate-100"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Alto Sprite (px)</label>
                <input
                  type="number"
                  value={data.visual2D5.spriteHeight || 64}
                  onChange={(e) => handleNestedChange('visual2D5', 'spriteHeight', parseInt(e.target.value))}
                  className="w-full px-2 py-1.5 bg-slate-950 border border-slate-800 rounded font-mono text-slate-100"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Direcciones Animación</label>
                <select
                  value={data.visual2D5.facingDirections || 4}
                  onChange={(e) => handleNestedChange('visual2D5', 'facingDirections', parseInt(e.target.value))}
                  className="w-full px-2 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-100"
                >
                  <option value={4}>4 Direcciones (Isométrico estándar)</option>
                  <option value={8}>8 Direcciones (Completo 2.5D)</option>
                </select>
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Color Tinte Aura</label>
                <input
                  type="color"
                  value={data.visual2D5.tintColor || '#22c55e'}
                  onChange={(e) => handleNestedChange('visual2D5', 'tintColor', e.target.value)}
                  className="w-full h-8 bg-slate-950 border border-slate-800 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: EVOLUTIONS & RELATIONS (Creatures) */}
        {activeTab === 'relations' && isCreature && (
          <div className="space-y-6">
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
              <h3 className="text-sm font-semibold text-slate-200 mb-2 flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-cyan-400" />
                Línea Evolutiva
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Criaturas a las que evoluciona "{data.name}" dentro de la jerarquía de AURORA.
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <div className="px-4 py-2 bg-slate-950 border border-cyan-500/40 rounded-lg text-xs font-mono text-cyan-300">
                  {data.name} (Base)
                </div>
                {data.evolution && data.evolution.length > 0 ? (
                  data.evolution.map((evoId: string, idx: number) => {
                    const target = projectContext.creatures.find((c) => c.id === evoId);
                    return (
                      <React.Fragment key={evoId}>
                        <ArrowRight className="w-4 h-4 text-slate-600" />
                        <div
                          onClick={() => target && setSelectedEntity({ type: 'creature', data: target })}
                          className={`px-4 py-2 rounded-lg text-xs font-mono border cursor-pointer transition ${
                            target
                              ? 'bg-slate-950 border-emerald-500/40 text-emerald-300 hover:bg-emerald-950/40'
                              : 'bg-slate-950 border-amber-500/40 text-amber-300'
                          }`}
                        >
                          {target ? target.name : `${evoId} (No creada)`}
                        </div>
                      </React.Fragment>
                    );
                  })
                ) : (
                  <span className="text-xs text-slate-500 italic">No tiene evoluciones posteriores (Forma final o única).</span>
                )}
              </div>
            </div>

            {/* Habitats / Biomes selection */}
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
              <h3 className="text-sm font-semibold text-slate-200 mb-2 flex items-center gap-2">
                <Compass className="w-4 h-4 text-emerald-400" />
                Biomas Donde Habita
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3">
                {projectContext.biomes.map((biome) => {
                  const isChecked = (data.habitat || []).includes(biome.id);
                  return (
                    <label
                      key={biome.id}
                      className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs cursor-pointer transition ${
                        isChecked
                          ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-300 font-medium'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          const current = data.habitat || [];
                          const updated = e.target.checked
                            ? [...current, biome.id]
                            : current.filter((id: string) => id !== biome.id);
                          handleFieldChange('habitat', updated);
                        }}
                        className="accent-cyan-500"
                      />
                      <span>{biome.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: DIALOGUE TREE (For NPCs) */}
        {activeTab === 'dialogue' && isNPC && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-cyan-400" />
                Nodos de Diálogo de {data.name}
              </h3>
            </div>

            {(data.dialogues || []).map((dlg: any, idx: number) => (
              <div key={dlg.id || idx} className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-mono text-cyan-400 font-bold">Nodo: {dlg.id}</span>
                  <span className="text-slate-400">Interlocutor: {dlg.speaker || data.name}</span>
                </div>
                <textarea
                  rows={2}
                  value={dlg.text || ''}
                  onChange={(e) => {
                    const nextDialogues = [...(data.dialogues || [])];
                    nextDialogues[idx] = { ...dlg, text: e.target.value };
                    handleFieldChange('dialogues', nextDialogues);
                  }}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-slate-200"
                />
              </div>
            ))}
          </div>
        )}

        {/* TAB 6: JSON & PHASER 3 CODE VIEW */}
        {activeTab === 'code' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400">Exportable para Phaser 3 + TypeScript</span>
              <button
                onClick={() => {
                  const code = isCreature
                    ? generatePhaser3SceneIntegration(data)
                    : exportAsTypeScriptData(data.name || data.id, data);
                  navigator.clipboard.writeText(code);
                  setCopiedCode(true);
                  setTimeout(() => setCopiedCode(false), 2500);
                  showToast('Código copiado al portapapeles', 'success');
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg transition"
              >
                {copiedCode ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? '¡Copiado!' : 'Copiar Código'}</span>
              </button>
            </div>

            <pre className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-cyan-300 overflow-x-auto max-h-[480px]">
              {isCreature
                ? generatePhaser3SceneIntegration(data)
                : exportAsTypeScriptData(data.name || data.id, data)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
