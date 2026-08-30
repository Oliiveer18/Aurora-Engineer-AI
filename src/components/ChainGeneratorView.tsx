import React, { useState } from 'react';
import { useAurora } from '../context/AuroraContext';
import {
  Sparkles,
  GitMerge,
  ArrowDown,
  ArrowRight,
  CheckCircle2,
  Layers,
  Compass,
  Zap,
  RefreshCw,
  FolderPlus,
  Shield,
  Box,
  MessageSquare,
  Scroll,
} from 'lucide-react';

export const ChainGeneratorView: React.FC = () => {
  const { executeChainGenerate, addEntity, setActiveTab, showToast } = useAurora();

  const [regionName, setRegionName] = useState<string>('Tierras Flotantes de Zephyr');
  const [regionTheme, setRegionTheme] = useState<string>(
    'Archipiélago de islas suspendidas en el cielo con corrientes de viento Aether y criaturas voladoras'
  );
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [chainResult, setChainResult] = useState<any | null>(null);
  const [imported, setImported] = useState<boolean>(false);

  const predefinedThemes = [
    {
      name: 'Tierras Flotantes de Zephyr',
      theme: 'Archipiélago de islas suspendidas en el cielo con corrientes de viento Aether y criaturas voladoras',
    },
    {
      name: 'Abismo de Basalto',
      theme: 'Cañón volcánico con ríos de lava subterránea, geodas ígneas y criaturas blindadas resistentes al calor',
    },
    {
      name: 'Bosque de Niebla Sombría',
      theme: 'Ecosistema crepuscular donde hongos bioluminiscentes guían a los viajeros y criaturas sigilosas acechan',
    },
    {
      name: 'Ruinas Submarinas de Coral',
      theme: 'Estructuras sumergidas con flora marina fluorescente, corrientes rápidas y espíritus del agua',
    },
  ];

  const handleStartChain = async () => {
    setIsGenerating(true);
    setChainResult(null);
    setImported(false);
    try {
      const data = await executeChainGenerate(regionName, regionTheme);
      setChainResult(data);
      showToast('¡Ecosistema completo generado en cadena!', 'success');
    } catch (e: any) {
      showToast(`Error al generar cadena: ${e.message}`, 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImportAll = () => {
    if (!chainResult) return;

    let count = 0;
    if (chainResult.region) {
      addEntity('region', chainResult.region);
      count++;
    }
    if (chainResult.biome) {
      addEntity('biome', chainResult.biome);
      count++;
    }
    if (chainResult.creatures && Array.isArray(chainResult.creatures)) {
      chainResult.creatures.forEach((c: any) => {
        addEntity('creature', c);
        count++;
      });
    }
    if (chainResult.npc) {
      addEntity('npc', chainResult.npc);
      count++;
    }
    if (chainResult.quest) {
      addEntity('quest', chainResult.quest);
      count++;
    }
    if (chainResult.items && Array.isArray(chainResult.items)) {
      chainResult.items.forEach((i: any) => {
        addEntity('item', i);
        count++;
      });
    }
    if (chainResult.abilities && Array.isArray(chainResult.abilities)) {
      chainResult.abilities.forEach((a: any) => {
        addEntity('ability', a);
        count++;
      });
    }

    setImported(true);
    showToast(`Se han añadido ${count} elementos al proyecto AURORA.`, 'success');
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-y-auto p-6 max-w-6xl mx-auto space-y-6">
      {/* Banner */}
      <div className="p-6 bg-gradient-to-r from-slate-900 via-purple-950/30 to-slate-900 border border-slate-800 rounded-2xl shadow-xl">
        <div className="flex items-center gap-2 text-xs font-mono text-purple-400 font-semibold uppercase tracking-wider mb-1">
          <GitMerge className="w-3.5 h-3.5 text-purple-400" />
          Pipeline de Creación Encadenada
        </div>
        <h1 className="text-2xl font-bold text-slate-100">Generador en Cadena para AURORA</h1>
        <p className="text-sm text-slate-400 mt-1 max-w-3xl">
          Con una sola instrucción, el motor de IA orquesta y crea un ecosistema interconectado completo: 
          <strong> Región → Bioma → Criaturas → NPCs → Misiones → Objetos → Habilidades</strong>, asegurando que todos los IDs, referencias y compatibilidad 2.5D coincidan a la perfección.
        </p>
      </div>

      {/* Inputs & Configuration */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Nombre de la Región / Zona</label>
            <input
              type="text"
              value={regionName}
              onChange={(e) => setRegionName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Tema / Atmósfera / Bioma Central</label>
            <input
              type="text"
              value={regionTheme}
              onChange={(e) => setRegionTheme(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        {/* Quick Presets */}
        <div>
          <span className="text-[11px] text-slate-500 font-mono uppercase tracking-wider block mb-2">
            Plantillas de Regiones Recomendadas:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {predefinedThemes.map((item, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setRegionName(item.name);
                  setRegionTheme(item.theme);
                }}
                className="text-left p-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-purple-500/40 rounded-xl transition group"
              >
                <div className="text-xs font-semibold text-slate-200 group-hover:text-purple-300">{item.name}</div>
                <div className="text-[11px] text-slate-500 truncate mt-0.5">{item.theme}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={handleStartChain}
            disabled={isGenerating || !regionName.trim()}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-purple-900/40 transition disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Generando Ecosistema Interconectado...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Ejecutar Generación en Cadena</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Visual Pipeline Flow / Chain Output */}
      {chainResult && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-2xl">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span className="text-sm font-semibold text-slate-200">
                Ecosistema Generado: <strong>{chainResult.region?.name}</strong>
              </span>
            </div>

            <button
              onClick={handleImportAll}
              disabled={imported}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition ${
                imported
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/30'
              }`}
            >
              <FolderPlus className="w-4 h-4" />
              <span>{imported ? '¡Todo Añadido al Proyecto!' : 'Importar Todo al Proyecto'}</span>
            </button>
          </div>

          {/* Node Hierarchy Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* 1. Region & Biome */}
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-cyan-400">
                <Compass className="w-4 h-4" />
                <span>1. Región & Bioma</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs">
                <div className="font-bold text-slate-100">{chainResult.region?.name}</div>
                <p className="text-slate-400 mt-1 line-clamp-2">{chainResult.region?.description}</p>
                <div className="mt-2 pt-2 border-t border-slate-900 flex justify-between text-slate-500">
                  <span>Bioma: {chainResult.biome?.name}</span>
                  <span className="font-mono text-cyan-400">{chainResult.biome?.temperature}</span>
                </div>
              </div>
            </div>

            {/* 2. Creatures */}
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                <Layers className="w-4 h-4" />
                <span>2. Criaturas Autóctonas ({chainResult.creatures?.length || 0})</span>
              </div>
              <div className="space-y-2">
                {(chainResult.creatures || []).map((c: any) => (
                  <div key={c.id} className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-100">{c.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                        {c.type}
                      </span>
                    </div>
                    <p className="text-slate-400 mt-1 text-[11px] line-clamp-1">{c.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. NPC & Quest */}
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-purple-400">
                <Scroll className="w-4 h-4" />
                <span>3. NPC & Misión Vinculada</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-2">
                <div>
                  <span className="text-purple-300 font-bold">{chainResult.npc?.name}</span>
                  <span className="text-slate-500 text-[10px] block font-mono">{chainResult.npc?.title}</span>
                </div>
                <div className="pt-2 border-t border-slate-900">
                  <div className="text-slate-200 font-semibold">{chainResult.quest?.title}</div>
                  <p className="text-slate-400 mt-0.5 text-[11px] line-clamp-2">{chainResult.quest?.description}</p>
                </div>
              </div>
            </div>

            {/* 4. Items & Resources */}
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                <Box className="w-4 h-4" />
                <span>4. Recursos & Objetos</span>
              </div>
              <div className="space-y-2">
                {(chainResult.items || []).map((itm: any) => (
                  <div key={itm.id} className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-xs flex justify-between items-center">
                    <div>
                      <span className="font-bold text-slate-100">{itm.name}</span>
                      <span className="text-slate-500 text-[10px] block font-mono">{itm.type}</span>
                    </div>
                    <span className="text-amber-400 font-mono font-bold text-xs">{itm.value} oro</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 5. Abilities */}
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-sky-400">
                <Zap className="w-4 h-4" />
                <span>5. Habilidades Elementales 2.5D</span>
              </div>
              <div className="space-y-2">
                {(chainResult.abilities || []).map((ab: any) => (
                  <div key={ab.id} className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-100">{ab.name}</span>
                      <span className="text-[10px] text-sky-400 font-mono">{ab.power} Potencia</span>
                    </div>
                    <p className="text-slate-400 mt-1 text-[11px] line-clamp-1">{ab.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
