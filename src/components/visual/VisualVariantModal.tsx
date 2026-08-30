import React, { useState } from 'react';
import { VisualAsset, VariantType, ElementType } from '../../types/aurora';
import { useAurora } from '../../context/AuroraContext';
import { Sparkles, X, Flame, Snowflake, Moon, Zap, Shield, Sun, Feather, RefreshCw } from 'lucide-react';

interface Props {
  asset: VisualAsset;
  onClose: () => void;
}

export const VisualVariantModal: React.FC<Props> = ({ asset, onClose }) => {
  const { stageVisualVariantGeneration, isGenerating, showToast } = useAurora();
  const [variantType, setVariantType] = useState<VariantType>('shiny');
  const [targetElement, setTargetElement] = useState<ElementType>('ice');
  const [seasonName, setSeasonName] = useState<string>('Otoño');
  const [variantNotes, setVariantNotes] = useState<string>('');

  const variantOptions: { type: VariantType; label: string; desc: string; icon: any; color: string }[] = [
    {
      type: 'shiny',
      label: '★ Variante Shiny (Radiante)',
      desc: 'Versión mística ultra-rara con partículas doradas y saturación elevada.',
      icon: Sparkles,
      color: 'border-amber-500/50 bg-amber-950/20 text-amber-300',
    },
    {
      type: 'elemental',
      label: 'Mutación Elemental',
      desc: 'Adapta la paleta y características secundarias a un elemento distinto.',
      icon: Flame,
      color: 'border-orange-500/50 bg-orange-950/20 text-orange-300',
    },
    {
      type: 'seasonal',
      label: 'Adaptación Estacional',
      desc: 'Variación por estación del año (hojas otoñales, escarcha invernal, etc.).',
      icon: Sun,
      color: 'border-emerald-500/50 bg-emerald-950/20 text-emerald-300',
    },
    {
      type: 'rare',
      label: 'Espécimen Ancestral (Apex)',
      desc: 'Versión dominante con tonalidades púrpuras y auras de aether concentrado.',
      icon: Shield,
      color: 'border-indigo-500/50 bg-indigo-950/20 text-indigo-300',
    },
    {
      type: 'damaged',
      label: 'Corrupto / Herido en Batalla',
      desc: 'Añade textura de aether oscuro, grietas luminosas y desgaste de batalla.',
      icon: Moon,
      color: 'border-rose-500/50 bg-rose-950/20 text-rose-300',
    },
    {
      type: 'outfit',
      label: 'Atuendo / Skin Alternativa',
      desc: 'Para NPCs o compañeros: vestimenta ceremonial, armadura de viaje o capa.',
      icon: Feather,
      color: 'border-cyan-500/50 bg-cyan-950/20 text-cyan-300',
    },
  ];

  const handleGenerate = async () => {
    try {
      await stageVisualVariantGeneration(asset, variantType, {
        targetElement: variantType === 'elemental' ? targetElement : undefined,
        seasonName: variantType === 'seasonal' ? seasonName : undefined,
        descriptionNotes: variantNotes,
      });
      showToast('Variante visual generada y lista en Staging Area.', 'success');
      onClose();
    } catch (e: any) {
      showToast('Error generando variante: ' + e.message, 'error');
    }
  };

  return (
    <div id="visual-variant-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Generar Variante Visual 2.5D</h3>
              <p className="text-xs text-slate-400">
                Preserva la silueta y anclaje de <span className="text-amber-300 font-semibold">{asset.name}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Base Asset Summary */}
          <div className="flex items-center gap-4 p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
            <img
              src={asset.imageUrl}
              alt={asset.name}
              referrerPolicy="no-referrer"
              className="w-16 h-16 rounded-lg object-cover border border-slate-700 shadow"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-white truncate">{asset.name}</h4>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 uppercase">
                  {asset.type}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 line-clamp-1">{asset.prompt}</p>
              <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-400">
                <span>Resolución: {asset.resolution.width}x{asset.resolution.height}px</span>
                <span>Anchor Y: {asset.anchor.y}</span>
                <span>Y-Sort: +{asset.ySortOffset}px</span>
              </div>
            </div>
          </div>

          {/* Variant Type Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-300 tracking-wider mb-2">
              Tipo de Variante
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {variantOptions.map((opt) => {
                const Icon = opt.icon;
                const isSelected = variantType === opt.type;
                return (
                  <button
                    key={opt.type}
                    type="button"
                    onClick={() => setVariantType(opt.type)}
                    className={`text-left p-3 rounded-xl border transition-all flex items-start gap-2.5 ${
                      isSelected
                        ? opt.color + ' ring-2 ring-cyan-400/50 shadow-md'
                        : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <Icon className="w-5 h-5 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold">{opt.label}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5 leading-snug">{opt.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Contextual Options based on variant */}
          {variantType === 'elemental' && (
            <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Elemento Destino de la Mutación
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['ice', 'fire', 'shadow', 'electric'] as ElementType[]).map((el) => (
                  <button
                    key={el}
                    type="button"
                    onClick={() => setTargetElement(el)}
                    className={`py-2 px-3 rounded-lg text-xs font-bold capitalize border transition ${
                      targetElement === el
                        ? 'bg-cyan-600 border-cyan-400 text-white shadow'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {el}
                  </button>
                ))}
              </div>
            </div>
          )}

          {variantType === 'seasonal' && (
            <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Estación Climática
              </label>
              <div className="grid grid-cols-4 gap-2">
                {['Primavera', 'Verano', 'Otoño', 'Invierno'].map((season) => (
                  <button
                    key={season}
                    type="button"
                    onClick={() => setSeasonName(season)}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border transition ${
                      seasonName === season
                        ? 'bg-emerald-600 border-emerald-400 text-white shadow'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {season}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Custom Notes */}
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-300 tracking-wider mb-1.5">
              Instrucciones Específicas para la Variante (Opcional)
            </label>
            <textarea
              value={variantNotes}
              onChange={(e) => setVariantNotes(e.target.value)}
              placeholder="Ej: Añadir espinas de hielo traslúcidas a lo largo de la columna vertebral y brillo cian en los ojos..."
              rows={2}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/80">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-900/30 transition disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Generando en Staging...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generar Variante & Enviar a Staging</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
