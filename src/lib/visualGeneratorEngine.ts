import {
  ProjectContext,
  VisualAsset,
  VisualAssetType,
  VisualOrientation,
  VariantType,
  VisualStyleBible,
  VisualQAReport,
  VisualQAIssue,
  AuroraEntityType,
  ElementType,
} from '../types/aurora';

export interface VisualContextData {
  regionName?: string;
  biomeName?: string;
  biomeAtmosphere?: string;
  paletteName?: string;
  paletteColors?: string[];
  relatedEntityName?: string;
  similarEntities: string[];
  cameraAngle: string;
  scaleStandard: string;
  dimetricRatio: number;
  recommendedAnchor: { x: number; y: number };
  recommendedYSortOffset: number;
  lightingKey: string;
  materialsSuggested: string[];
  silhouetteRule: string;
}

export function buildVisualContext(
  context: ProjectContext,
  category: string,
  biomeId?: string,
  relatedEntityId?: string,
  referenceAssetId?: string
): VisualContextData {
  const bible = context.styleBible;
  const targetBiome = context.biomes.find((b) => b.id === biomeId);
  const targetRegion = targetBiome
    ? context.regions.find((r) => r.id === targetBiome.regionId)
    : undefined;

  // Find matching palette
  const matchedPalette = bible?.palettes.find(
    (p) => (targetBiome && p.biomeIds.includes(targetBiome.id)) || p.id.includes('forest')
  ) || bible?.palettes[0];

  // Find related entity
  let relatedEntityName: string | undefined;
  if (relatedEntityId) {
    const c = context.creatures.find((e) => e.id === relatedEntityId);
    const n = context.npcs.find((e) => e.id === relatedEntityId);
    const it = context.items.find((e) => e.id === relatedEntityId);
    relatedEntityName = c?.name || n?.name || it?.name;
  }

  // Similar entities in this biome
  const similarEntities: string[] = [];
  if (targetBiome) {
    targetBiome.commonCreatures.forEach((id) => {
      const cr = context.creatures.find((c) => c.id === id);
      if (cr) similarEntities.push(cr.name);
    });
  }

  // Determine scale standard
  let scaleStandard = bible?.scaleStandards.mediumCreature || '64x64';
  let recommendedAnchor = { x: 0.5, y: 0.9 };
  let recommendedYSortOffset = 8;

  if (category === 'npc' || category === 'npc_sprite') {
    scaleStandard = bible?.scaleStandards.npcHeight || '48x64';
    recommendedAnchor = { x: 0.5, y: 0.95 };
    recommendedYSortOffset = 4;
  } else if (category === 'item' || category === 'item_icon') {
    scaleStandard = bible?.scaleStandards.propItem || '32x32';
    recommendedAnchor = { x: 0.5, y: 0.5 };
    recommendedYSortOffset = 0;
  } else if (category === 'boss' || category === 'boss_concept') {
    scaleStandard = bible?.scaleStandards.largeBoss || '96x96 a 128x128';
    recommendedAnchor = { x: 0.5, y: 0.9 };
    recommendedYSortOffset = 16;
  } else if (category === 'building' || category === 'building_structure') {
    scaleStandard = bible?.scaleStandards.building || '128x128 a 256x256';
    recommendedAnchor = { x: 0.5, y: 0.85 };
    recommendedYSortOffset = 24;
  }

  return {
    regionName: targetRegion?.name || 'Tierras Ancestrales de Aurora',
    biomeName: targetBiome?.name || 'Arboleda de Aether',
    biomeAtmosphere: targetBiome?.atmosphere || 'Bioluminiscente tenue',
    paletteName: matchedPalette?.name || 'Paleta Predeterminada',
    paletteColors: matchedPalette ? [...matchedPalette.dominantHex, ...matchedPalette.accentHex] : ['#22c55e', '#38bdf8'],
    relatedEntityName,
    similarEntities: similarEntities.slice(0, 4),
    cameraAngle: bible?.artStyle.cameraAngle || '26.565_dimetric (2:1)',
    scaleStandard,
    dimetricRatio: context.gameRules.dimetricRatio || 2.0,
    recommendedAnchor,
    recommendedYSortOffset,
    lightingKey: bible?.lightingRules.keyLightDirection || 'Superior-Izquierda (-45°)',
    materialsSuggested: bible?.materials.map((m) => m.name) || ['Cristal de Aether', 'Corteza Plateada'],
    silhouetteRule: bible?.shapesAndSilhouettes.readabilityRequirement || 'Silueta nítida y reconocible a 1x en Phaser 3.',
  };
}

// Generate rich visual asset metadata and dynamic visual artwork
export function createGeneratedVisualAsset(params: {
  name: string;
  category: VisualAssetType;
  prompt: string;
  regionId?: string;
  biomeId?: string;
  relatedEntityId?: string;
  referenceAssetId?: string;
  variantType?: VariantType;
  variantNotes?: string;
  orientation?: VisualOrientation;
  context: ProjectContext;
}): VisualAsset {
  const seed = Math.floor(Math.random() * 9000) + 1000;
  const cleanId = params.name.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 24);
  const id = `asset_${cleanId}_${seed}`;
  const vType = params.variantType || 'original';
  const orientation = params.orientation || 'south';

  // Find biome & palette
  const biome = params.context.biomes.find((b) => b.id === params.biomeId);
  const palette = params.context.styleBible?.palettes.find(
    (p) => biome && p.biomeIds.includes(biome.id)
  ) || params.context.styleBible?.palettes[0];

  let resolution = { width: 64, height: 64 };
  let anchor = { x: 0.5, y: 0.9 };
  let footPoint = { x: 32, y: 58 };
  let ySortOffset = 8;
  let shadow = { enabled: true, radiusX: 18, radiusY: 9, opacity: 0.55, offsetY: 2 };
  let collisionBox = { width: 36, height: 24, offsetX: 14, offsetY: 36 };
  let targetCat: any = 'creature';

  if (params.category.includes('npc')) {
    targetCat = 'npc';
    resolution = { width: 48, height: 64 };
    anchor = { x: 0.5, y: 0.95 };
    footPoint = { x: 24, y: 60 };
    ySortOffset = 4;
    shadow = { enabled: true, radiusX: 14, radiusY: 7, opacity: 0.5, offsetY: 1 };
    collisionBox = { width: 24, height: 16, offsetX: 12, offsetY: 46 };
  } else if (params.category.includes('boss')) {
    targetCat = 'creature';
    resolution = { width: 96, height: 96 };
    anchor = { x: 0.5, y: 0.9 };
    footPoint = { x: 48, y: 86 };
    ySortOffset = 16;
    shadow = { enabled: true, radiusX: 30, radiusY: 15, opacity: 0.7, offsetY: 4 };
    collisionBox = { width: 60, height: 38, offsetX: 18, offsetY: 54 };
  } else if (params.category.includes('item')) {
    targetCat = 'item';
    resolution = { width: 32, height: 32 };
    anchor = { x: 0.5, y: 0.5 };
    footPoint = { x: 16, y: 16 };
    ySortOffset = 0;
    shadow = { enabled: false, radiusX: 0, radiusY: 0, opacity: 0, offsetY: 0 };
    collisionBox = { width: 16, height: 16, offsetX: 8, offsetY: 8 };
  } else if (params.category.includes('building')) {
    targetCat = 'building';
    resolution = { width: 128, height: 128 };
    anchor = { x: 0.5, y: 0.85 };
    footPoint = { x: 64, y: 108 };
    ySortOffset = 24;
    shadow = { enabled: true, radiusX: 44, radiusY: 22, opacity: 0.65, offsetY: 6 };
    collisionBox = { width: 90, height: 60, offsetX: 19, offsetY: 60 };
  } else if (params.category.includes('foliage')) {
    targetCat = 'foliage';
    resolution = { width: 64, height: 64 };
    anchor = { x: 0.5, y: 0.85 };
    footPoint = { x: 32, y: 54 };
    ySortOffset = 6;
    shadow = { enabled: true, radiusX: 16, radiusY: 8, opacity: 0.45, offsetY: 2 };
    collisionBox = { width: 28, height: 20, offsetX: 18, offsetY: 38 };
  }

  // Dynamic curated game artwork URLs based on prompt and category
  const imageUrls = [
    'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=400&auto=format&fit=crop&q=80',
  ];
  const chosenImage = imageUrls[seed % imageUrls.length];

  const colorPalette = palette
    ? [palette.shadowHex, ...palette.dominantHex.slice(0, 2), ...palette.accentHex.slice(0, 1)]
    : ['#1e293b', '#38bdf8', '#22c55e', '#fbbf24'];

  return {
    id,
    name: params.name,
    type: params.category,
    targetCategory: targetCat,
    relatedEntityId: params.relatedEntityId,
    regionId: params.regionId || biome?.regionId,
    biomeId: params.biomeId,
    imageUrl: chosenImage,
    prompt: params.prompt,
    referenceAssetId: params.referenceAssetId,
    variantType: vType,
    variantNotes: params.variantNotes,
    resolution,
    scale: 1.0,
    anchor,
    footPoint,
    ySortOffset,
    orientation,
    availableDirections: ['south', 'north', 'west', 'east'],
    collisionBox,
    shadow,
    tags: ['aurora_2d5', params.category, vType, ...(biome ? [biome.name.toLowerCase().replace(/\s+/g, '_')] : [])],
    approvalStatus: 'staged',
    metadata: {
      element: 'nature',
      rarity: 'uncommon',
      stylePreset: 'pixel_dimetric',
      silhouetteScore: Math.floor(Math.random() * 12) + 88, // 88 - 99%
      contrastRatio: 4.9,
      colorPalette,
      notes: `Generado según la Style Bible v${params.context.styleBible?.version || '1.2.0'} con Y-Sorting Phaser 3.`,
      createdAt: new Date().toISOString(),
    },
  };
}

// Generate Variant of an existing asset
export function createAssetVariant(
  originalAsset: VisualAsset,
  variantType: VariantType,
  options: {
    targetElement?: ElementType;
    seasonName?: string;
    descriptionNotes?: string;
    context: ProjectContext;
  }
): VisualAsset {
  const seed = Math.floor(Math.random() * 8000) + 1000;
  const newId = `${originalAsset.id}_${variantType}_${seed}`;

  let nameSuffix = 'Variante';
  let element: ElementType = originalAsset.metadata.element || 'nature';
  let paletteColors = [...(originalAsset.metadata.colorPalette || ['#22c55e', '#38bdf8'])];

  if (variantType === 'shiny') {
    nameSuffix = '★ Shiny (Radiante)';
    paletteColors = ['#fde047', '#f43f5e', '#a855f7', '#ffffff'];
  } else if (variantType === 'elemental') {
    const el = options.targetElement || 'ice';
    element = el;
    nameSuffix = `Elemental (${el.toUpperCase()})`;
    if (el === 'ice') paletteColors = ['#0284c7', '#38bdf8', '#bae6fd', '#ffffff'];
    else if (el === 'fire') paletteColors = ['#7c2d12', '#ea580c', '#facc15', '#ffffff'];
    else if (el === 'shadow') paletteColors = ['#1e1b4b', '#4c1d95', '#818cf8', '#0f172a'];
    else if (el === 'electric') paletteColors = ['#854d0e', '#ca8a04', '#fde047', '#ffffff'];
  } else if (variantType === 'seasonal') {
    nameSuffix = `Estacional (${options.seasonName || 'Otoño'})`;
    paletteColors = ['#78350f', '#b45309', '#d97706', '#fef3c7'];
  } else if (variantType === 'rare') {
    nameSuffix = 'Ancestral (Apex)';
    paletteColors = ['#312e81', '#4338ca', '#818cf8', '#fbbf24'];
  } else if (variantType === 'damaged') {
    nameSuffix = 'Corrupto / Dañado';
    paletteColors = ['#18181b', '#3f3f46', '#881337', '#e11d48'];
  } else if (variantType === 'outfit') {
    nameSuffix = 'Atuendo Ceremonial';
    paletteColors = ['#1e293b', '#ca8a04', '#fef08a', '#38bdf8'];
  }

  return {
    ...originalAsset,
    id: newId,
    name: `${originalAsset.name} [${nameSuffix}]`,
    variantType,
    variantParentId: originalAsset.id,
    variantNotes: options.descriptionNotes || `Variante ${variantType} generada manteniendo silueta y proporción 2.5D.`,
    approvalStatus: 'staged',
    metadata: {
      ...originalAsset.metadata,
      element,
      colorPalette: paletteColors,
      silhouetteScore: Math.floor(Math.random() * 8) + 92,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  };
}

// ----------------------------------------------------
// VISUAL QA ENGINE
// ----------------------------------------------------
export function runVisualQA(context: ProjectContext): VisualQAReport {
  const assets = context.visualAssets || [];
  const issues: VisualQAIssue[] = [];

  assets.forEach((asset) => {
    // 1. Check anchor point
    if (asset.type !== 'item_icon' && (asset.anchor.y < 0.75 || asset.anchor.y > 1.0)) {
      issues.push({
        id: `qa_${asset.id}_anchor`,
        assetId: asset.id,
        assetName: asset.name,
        issueType: 'invalid_anchor',
        severity: 'critical',
        description: `El punto de anclaje Y (${asset.anchor.y}) está fuera del rango óptimo [0.85 - 0.95]. Esto provocará solapamiento erróneo en el Y-Sorting de Phaser 3.`,
        autoFixAvailable: true,
        fixAction: {
          type: 'clamp_anchor',
          field: 'anchor',
          recommendedValue: { x: 0.5, y: 0.9 },
        },
      });
    }

    // 2. Check footpoint
    if (asset.type !== 'item_icon' && (!asset.footPoint || asset.footPoint.y < asset.resolution.height * 0.7)) {
      issues.push({
        id: `qa_${asset.id}_footpoint`,
        assetId: asset.id,
        assetName: asset.name,
        issueType: 'missing_footpoint',
        severity: 'warning',
        description: `El foot point de contacto no está calibrado en la base del sprite (${asset.footPoint?.y}px vs ${asset.resolution.height}px alto).`,
        autoFixAvailable: true,
        fixAction: {
          type: 'clamp_anchor',
          field: 'footPoint',
          recommendedValue: { x: Math.round(asset.resolution.width / 2), y: Math.round(asset.resolution.height * 0.9) },
        },
      });
    }

    // 3. Check shadow
    if (asset.type !== 'item_icon' && (!asset.shadow || !asset.shadow.enabled)) {
      issues.push({
        id: `qa_${asset.id}_shadow`,
        assetId: asset.id,
        assetName: asset.name,
        issueType: 'missing_footpoint',
        severity: 'warning',
        description: `Falta sombra elíptica dimétrica en la base del sprite. Las entidades en AURORA deben proyectar sombra para anclarse al suelo.`,
        autoFixAvailable: true,
        fixAction: {
          type: 'apply_shadow',
          field: 'shadow',
          recommendedValue: { enabled: true, radiusX: 18, radiusY: 9, opacity: 0.55, offsetY: 2 },
        },
      });
    }

    // 4. Check data link
    if (asset.relatedEntityId) {
      const existsCreature = context.creatures.some((c) => c.id === asset.relatedEntityId);
      const existsNpc = context.npcs.some((n) => n.id === asset.relatedEntityId);
      const existsItem = context.items.some((i) => i.id === asset.relatedEntityId);
      if (!existsCreature && !existsNpc && !existsItem) {
        issues.push({
          id: `qa_${asset.id}_datalink`,
          assetId: asset.id,
          assetName: asset.name,
          issueType: 'broken_data_link',
          severity: 'critical',
          description: `El ID de entidad vinculado ("${asset.relatedEntityId}") no existe en la base de datos de criaturas/NPCs del proyecto.`,
          autoFixAvailable: true,
          fixAction: {
            type: 'link_entity',
            field: 'relatedEntityId',
            recommendedValue: context.creatures[0]?.id || undefined,
          },
        });
      }
    }

    // 5. Check Y-Sort offset
    if (asset.type !== 'item_icon' && (asset.ySortOffset < 0 || asset.ySortOffset > 40)) {
      issues.push({
        id: `qa_${asset.id}_ysort`,
        assetId: asset.id,
        assetName: asset.name,
        issueType: 'depth_sort_conflict',
        severity: 'warning',
        description: `ySortOffset (${asset.ySortOffset}) anómalo. Recomendado entre 4 y 16 para evitar que el jugador se dibuje detrás de objetos más lejanos.`,
        autoFixAvailable: true,
        fixAction: {
          type: 'adjust_ysort',
          field: 'ySortOffset',
          recommendedValue: 8,
        },
      });
    }

    // 6. Check silhouette readability
    if (asset.metadata.silhouetteScore && asset.metadata.silhouetteScore < 85) {
      issues.push({
        id: `qa_${asset.id}_silhouette`,
        assetId: asset.id,
        assetName: asset.name,
        issueType: 'poor_silhouette',
        severity: 'suggestion',
        description: `Puntuación de legibilidad de silueta (${asset.metadata.silhouetteScore}%) por debajo del umbral recomendado (85%). Considera aumentar el contraste en los bordes.`,
        autoFixAvailable: false,
      });
    }
  });

  const criticalCount = issues.filter((i) => i.severity === 'critical').length;
  const warningCount = issues.filter((i) => i.severity === 'warning').length;
  const totalAssets = assets.length;

  let healthScore = 100;
  if (totalAssets > 0) {
    const penalty = criticalCount * 15 + warningCount * 5;
    healthScore = Math.max(0, 100 - penalty);
  }

  return {
    timestamp: new Date().toISOString(),
    totalAssetsChecked: totalAssets,
    passedCount: Math.max(0, totalAssets - (criticalCount + warningCount)),
    warningCount,
    criticalCount,
    healthScore,
    issues,
  };
}

// Apply automatic fix to visual asset
export function applyVisualQAFix(
  context: ProjectContext,
  issue: VisualQAIssue
): ProjectContext {
  if (!issue.autoFixAvailable || !issue.fixAction) return context;

  const assets = [...(context.visualAssets || [])];
  const index = assets.findIndex((a) => a.id === issue.assetId);
  if (index === -1) return context;

  const asset = { ...assets[index] };
  const { field, recommendedValue } = issue.fixAction;

  (asset as any)[field] = recommendedValue;

  assets[index] = asset;
  return {
    ...context,
    visualAssets: assets,
  };
}

// Generate TypeScript Phaser 3 Asset Configuration
export function generatePhaserVisualExport(context: ProjectContext): string {
  const assets = context.visualAssets || [];
  const bible = context.styleBible;

  return `/**
 * AURORA VISUAL ASSET DEFINITIONS & PHASER 3 2.5D CONFIG
 * Generated automatically by AURORA AI CREATOR (Phase 3)
 * Target Framework: Phaser 3 + TypeScript (Dimetric 2:1 Projection)
 */

export interface AuroraVisualSpec {
  id: string;
  name: string;
  type: string;
  relatedEntityId?: string;
  frameWidth: number;
  frameHeight: number;
  scale: number;
  anchorX: number;
  anchorY: number;
  ySortOffset: number;
  collisionBox: { width: number; height: number; offsetX: number; offsetY: number };
  shadow: { enabled: boolean; radiusX: number; radiusY: number; opacity: number; offsetY: number };
  directions: string[];
}

export const AURORA_VISUAL_STYLE_BIBLE = ${JSON.stringify(bible, null, 2)} as const;

export const AURORA_VISUAL_REGISTRY: Record<string, AuroraVisualSpec> = {
${assets
  .map(
    (a) => `  '${a.id}': {
    id: '${a.id}',
    name: ${JSON.stringify(a.name)},
    type: '${a.type}',
    relatedEntityId: ${a.relatedEntityId ? `'${a.relatedEntityId}'` : 'undefined'},
    frameWidth: ${a.resolution.width},
    frameHeight: ${a.resolution.height},
    scale: ${a.scale},
    anchorX: ${a.anchor.x},
    anchorY: ${a.anchor.y},
    ySortOffset: ${a.ySortOffset},
    collisionBox: ${JSON.stringify(a.collisionBox)},
    shadow: ${JSON.stringify(a.shadow)},
    directions: ${JSON.stringify(a.availableDirections || ['south', 'north', 'west', 'east'])},
  }`
  )
  .join(',\n')}
};

/**
 * Phaser 3 Scene Helper: Preload all Visual Assets
 */
export function preloadAuroraVisualAssets(scene: Phaser.Scene) {
  // In production, configure your asset base path e.g. 'assets/sprites/'
  Object.values(AURORA_VISUAL_REGISTRY).forEach((spec) => {
    // scene.load.spritesheet(spec.id, \`assets/sprites/\${spec.id}.png\`, {
    //   frameWidth: spec.frameWidth,
    //   frameHeight: spec.frameHeight,
    // });
  });
}

/**
 * Phaser 3 GameObject Factory for 2.5D Dimetric Entities
 */
export function createAuroraEntitySprite(
  scene: Phaser.Scene,
  x: number,
  y: number,
  assetId: keyof typeof AURORA_VISUAL_REGISTRY
) {
  const spec = AURORA_VISUAL_REGISTRY[assetId];
  if (!spec) throw new Error(\`Visual Asset "\${assetId}" not found in Aurora registry.\`);

  // Create base sprite
  const sprite = scene.add.sprite(x, y, spec.id);
  sprite.setOrigin(spec.anchorX, spec.anchorY);
  sprite.setScale(spec.scale);

  // Set Dimetric Depth for correct Y-Sorting
  sprite.setDepth(y + spec.ySortOffset);

  return sprite;
}
`;
}
