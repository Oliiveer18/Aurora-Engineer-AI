import React, { useState } from 'react';
import { VisualStyleBible, VisualPalette } from '../../types/aurora';
import { useAurora } from '../../context/AuroraContext';
import {
  BookOpen,
  Save,
  Plus,
  Trash2,
  Palette,
  Layers,
  Box,
  Sun,
  Shield,
  RotateCcw,
  Sparkles,
  Info,
} from 'lucide-react';

export const VisualStyleBibleEditor: React.FC = () => {
  const { projectContext, updateStyleBible, showToast } = useAurora();
  const initialBible = projectContext.styleBible;

  const [bible, setBible] = useState<VisualStyleBible>(
    initialBible ? JSON.parse(JSON.stringify(initialBible)) : {
      version: '1.2.0',
      lastUpdated: new Date().toISOString(),
      artStyle: {
        name: 'Pixel Art Dimétrico Estilizado RPG',
        description: 'Pixel art refinado 2.5D con cámara dimétrica 2:1.',
        perspective: '2.5D Dimetric (2:1)',
        cameraAngle: '26.565_dimetric',
        proportionsArchetype: 'heroic_rpg',
      },
      palettes: [],
      scaleStandards: {
        smallCreature: '32x32',
        mediumCreature: '64x64',
        largeBoss: '96x96 a 128x128',
        npcHeight: '48x64',
        propItem: '32x32',
        building: '128x128 a 256x256',
      },
      materials: [],
      lightingRules: {
        keyLightDirection: 'Superior-Izquierda (-45°)',
        ambientColor: '#1e1b4b',
        rimLightEnabled: true,
        shadowColor: '#090d16',
      },
      shapesAndSilhouettes: {
        creatures: 'Siluetas legibles a escala 1x.',
        npcs: 'Proporción 4 cabezas de altura.',
        environment: 'Bordes limpios con proyección 2:1.',
        readabilityRequirement: 'Puntuación mínima de 85% de contraste en bordes.',
      },
    }
  );

  const [activeSection, setActiveSection] = useState<'general' | 'palettes' | 'scales' | 'lighting' | 'materials'>('palettes');

  const handleSave = () => {
    updateStyleBible({
      ...bible,
      lastUpdated: new Date().toISOString(),
    });
    showToast('Visual Style Bible guardada y sincronizada.', 'success');
  };

  const handleAddPalette = () => {
    const newPal: VisualPalette = {
      id: `pal_${Date.now()}`,
      name: 'Nueva Paleta de Bioma',
      biomeIds: [],
      dominantHex: ['#22c55e', '#15803d', '#166534'],
      accentHex: ['#38bdf8', '#fbbf24'],
      shadowHex: '#090d16',
      highlightHex: '#ffffff',
      description: 'Paleta armonizada para la región.',
    };
    setBible({
      ...bible,
      palettes: [...bible.palettes, newPal],
    });
  };

  const handleDeletePalette = (id: string) => {
    setBible({
      ...bible,
      palettes: bible.palettes.filter((p) => p.id !== id),
    });
  };

  return (
    <div id="visual-style-bible-editor" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-slate-900/80 border border-slate-800 rounded-2xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-white tracking-tight">Visual Style Bible</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-indigo-950 text-indigo-300 border border-indigo-800">
                v{bible.version}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Guía maestra de estilo, proporciones 2.5D y paletas que gobierna todas las generaciones de IA en AURORA.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-950/60 transition"
          >
            <Save className="w-4 h-4" />
            <span>Guardar & Sincronizar con IA</span>
          </button>
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-2">
        {[
          { id: 'palettes', label: 'Paletas de Color Maestras', icon: Palette },
          { id: 'scales', label: 'Estándares de Escala & Anclaje', icon: Box },
          { id: 'lighting', label: 'Iluminación & Sombras 2.5D', icon: Sun },
          { id: 'materials', label: 'Materiales & Shaders', icon: Sparkles },
          { id: 'general', label: 'Directrices Generales', icon: Layers },
        ].map((sec) => {
          const Icon = sec.icon;
          const isActive = activeSection === sec.id;
          return (
            <button
              key={sec.id}
              onClick={() => setActiveSection(sec.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{sec.label}</span>
            </button>
          );
        })}
      </div>

      {/* Section: Palettes */}
      {activeSection === 'palettes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
              Paletas Cromáticas por Región / Bioma ({bible.palettes.length})
            </h3>
            <button
              onClick={handleAddPalette}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Añadir Paleta</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bible.palettes.map((pal, idx) => (
              <div key={pal.id} className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <input
                    type="text"
                    value={pal.name}
                    onChange={(e) => {
                      const updated = [...bible.palettes];
                      updated[idx].name = e.target.value;
                      setBible({ ...bible, palettes: updated });
                    }}
                    className="bg-transparent font-bold text-sm text-white focus:outline-none focus:border-b border-indigo-500"
                  />
                  <button
                    onClick={() => handleDeletePalette(pal.id)}
                    className="text-slate-500 hover:text-rose-400 p-1 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-slate-400">{pal.description}</p>

                {/* Color swatches */}
                <div>
                  <div className="text-[11px] font-semibold text-slate-400 uppercase mb-1">Colores Dominantes</div>
                  <div className="flex items-center gap-2">
                    {pal.dominantHex.map((hex, i) => (
                      <div key={i} className="flex items-center gap-1.5 bg-slate-950 px-2 py-1 rounded-md border border-slate-800">
                        <div className="w-4 h-4 rounded-sm border border-slate-700" style={{ backgroundColor: hex }} />
                        <span className="text-[10px] font-mono text-slate-300">{hex}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-[11px] font-semibold text-slate-400 uppercase mb-1">Acentos & Sombra</div>
                  <div className="flex items-center gap-2">
                    {pal.accentHex.map((hex, i) => (
                      <div key={i} className="flex items-center gap-1.5 bg-slate-950 px-2 py-1 rounded-md border border-slate-800">
                        <div className="w-4 h-4 rounded-sm border border-slate-700" style={{ backgroundColor: hex }} />
                        <span className="text-[10px] font-mono text-amber-300">{hex}</span>
                      </div>
                    ))}
                    <div className="flex items-center gap-1.5 bg-slate-950 px-2 py-1 rounded-md border border-slate-800">
                      <div className="w-4 h-4 rounded-sm border border-slate-700" style={{ backgroundColor: pal.shadowHex }} />
                      <span className="text-[10px] font-mono text-slate-400">Sombra</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section: Scales */}
      {activeSection === 'scales' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
                Estándares de Escala & Tamaño de Frame
              </h3>
              <p className="text-xs text-slate-400">
                Garantiza que todas las criaturas, NPCs y props mantengan proporciones armónicas en Phaser 3.
              </p>
            </div>
            <span className="text-xs font-mono bg-slate-950 px-2.5 py-1 rounded border border-slate-800 text-indigo-300">
              Tile Base: 32x32px
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(bible.scaleStandards).map(([key, val]) => (
              <div key={key} className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                <input
                  type="text"
                  value={val}
                  onChange={(e) => {
                    setBible({
                      ...bible,
                      scaleStandards: { ...bible.scaleStandards, [key]: e.target.value },
                    });
                  }}
                  className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-indigo-300 font-mono text-right w-36 focus:outline-none focus:border-indigo-500"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section: Lighting */}
      {activeSection === 'lighting' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 border-b border-slate-800 pb-3">
            Reglas de Iluminación Dimétrica & Proyección de Sombras
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                Dirección de Luz Principal (Key Light)
              </label>
              <input
                type="text"
                value={bible.lightingRules.keyLightDirection}
                onChange={(e) =>
                  setBible({
                    ...bible,
                    lightingRules: { ...bible.lightingRules, keyLightDirection: e.target.value },
                  })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                Color de Luz Ambiental
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={bible.lightingRules.ambientColor}
                  onChange={(e) =>
                    setBible({
                      ...bible,
                      lightingRules: { ...bible.lightingRules, ambientColor: e.target.value },
                    })
                  }
                  className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
                />
                <input
                  type="text"
                  value={bible.lightingRules.ambientColor}
                  onChange={(e) =>
                    setBible({
                      ...bible,
                      lightingRules: { ...bible.lightingRules, ambientColor: e.target.value },
                    })
                  }
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white font-mono"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Section: Materials */}
      {activeSection === 'materials' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 border-b border-slate-800 pb-3">
            Materiales Místicos & Shaders Sugeridos
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {bible.materials.map((mat, i) => (
              <div key={i} className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{mat.name}</span>
                  {mat.shaderEffect && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                      {mat.shaderEffect}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400">{mat.renderingRule}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section: General */}
      {activeSection === 'general' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 border-b border-slate-800 pb-3">
            Directrices de Silueta & Legibilidad
          </h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                Regla para Criaturas
              </label>
              <textarea
                value={bible.shapesAndSilhouettes.creatures}
                onChange={(e) =>
                  setBible({
                    ...bible,
                    shapesAndSilhouettes: { ...bible.shapesAndSilhouettes, creatures: e.target.value },
                  })
                }
                rows={2}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                Regla para NPCs
              </label>
              <textarea
                value={bible.shapesAndSilhouettes.npcs}
                onChange={(e) =>
                  setBible({
                    ...bible,
                    shapesAndSilhouettes: { ...bible.shapesAndSilhouettes, npcs: e.target.value },
                  })
                }
                rows={2}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
