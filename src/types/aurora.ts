export type AuroraEntityType =
  | 'creature'
  | 'npc'
  | 'quest'
  | 'biome'
  | 'item'
  | 'ability'
  | 'dungeon'
  | 'faction'
  | 'shop'
  | 'region';

export type ElementType =
  | 'nature'
  | 'fire'
  | 'water'
  | 'electric'
  | 'ice'
  | 'shadow'
  | 'light'
  | 'earth'
  | 'wind'
  | 'neutral'
  | 'aether';

export type RarityType =
  | 'common'
  | 'uncommon'
  | 'rare'
  | 'epic'
  | 'legendary'
  | 'mythic';

export type CreatureCategory =
  | 'beast'
  | 'flora'
  | 'spirit'
  | 'elemental'
  | 'construct'
  | 'dragon'
  | 'undead'
  | 'aquatic'
  | 'avian';

export interface Visual2D5Specs {
  spriteWidth: number;
  spriteHeight: number;
  anchorX: number; // 0 to 1 (usually 0.5 for center)
  anchorY: number; // 0 to 1 (usually 0.85-0.95 for feet / Y-sort base)
  ySortOffset: number; // Pixels from bottom for depth calculation in Phaser (depth = y + offset)
  collisionBox: {
    width: number;
    height: number;
    offsetX: number;
    offsetY: number;
  };
  shadow: {
    enabled: boolean;
    radiusX: number;
    radiusY: number;
    opacity: number;
    offsetY: number;
  };
  dimetricAngleDeg: number; // Standard 26.565 or 30 deg for dimetric projection
  elevationZ: number; // Flying/ground height
  facingDirections: 4 | 8; // 4-directional or 8-directional isometric animations
  spriteSheetFrames?: {
    idle: number;
    walk: number;
    attack: number;
    hit: number;
  };
  tintColor?: string;
  particleEffect?: string;
}

export interface CreatureStats {
  hp: number;
  attack: number;
  defense: number;
  speed: number;
  specialAttack: number;
  specialDefense: number;
}

export interface EvolutionData {
  targetCreatureId: string;
  triggerLevel?: number;
  itemRequired?: string;
  specialCondition?: string;
}

export interface LootDrop {
  itemId: string;
  chance: number; // 0.0 - 1.0 (e.g. 0.35 = 35%)
  minQty: number;
  maxQty: number;
}

export interface Creature {
  id: string;
  name: string;
  description: string;
  type: ElementType;
  secondaryType?: ElementType;
  category: CreatureCategory;
  rarity: RarityType;
  habitat: string[]; // Biome IDs
  behavior: 'passive' | 'territorial' | 'aggressive' | 'skittish' | 'nocturnal' | 'pack_hunter';
  stats: CreatureStats;
  abilities: string[]; // Ability IDs
  weaknesses: ElementType[];
  resistances: ElementType[];
  evolution: string[]; // IDs of evolutions
  evolutionConditions?: EvolutionData[];
  spawnRate: number; // 0-100% relative weight in biome
  recommendedLevel: number;
  rewards: {
    exp: number;
    goldMin: number;
    goldMax: number;
    drops: LootDrop[];
  };
  visual2D5: Visual2D5Specs;
  implementationNotes2D5: string;
  visualAssetId?: string; // Link to VisualAsset
  tags?: string[];
  version?: number;
}

export interface DialogueNode {
  id: string;
  speaker: string;
  text: string;
  conditions?: string;
  responses?: {
    text: string;
    nextDialogueId?: string;
    questTriggerId?: string;
    action?: string;
  }[];
}

export interface NPC {
  id: string;
  name: string;
  title: string;
  role: 'merchant' | 'quest_giver' | 'lore_keeper' | 'trainer' | 'guard' | 'innkeeper' | 'villager' | 'faction_leader';
  personality: string;
  appearance: string;
  location: string; // Region or Biome ID
  coordinates?: { x: number; y: number; z?: number };
  backstory: string;
  dialogues: DialogueNode[];
  relationships: {
    targetNpcId: string;
    relationType: 'friend' | 'rival' | 'family' | 'mentor' | 'enemy' | 'neutral';
    notes: string;
  }[];
  associatedQuests: string[]; // Quest IDs
  eventReactions: {
    eventTrigger: string;
    reactionText: string;
  }[];
  worldFunction: string;
  visual2D5: Visual2D5Specs;
  tags?: string[];
}

export interface QuestObjective {
  id: string;
  type: 'kill' | 'gather' | 'talk' | 'explore' | 'escort' | 'interact' | 'boss';
  description: string;
  targetId?: string; // Creature ID, Item ID, or NPC ID
  amountRequired?: number;
  currentCount?: number;
  locationId?: string;
}

export interface Quest {
  id: string;
  title: string;
  type: 'main' | 'side' | 'bounty' | 'faction' | 'event';
  description: string;
  objectives: QuestObjective[];
  relatedNpcId: string;
  location: string; // Region or Biome ID
  requirements: {
    minLevel: number;
    prerequisiteQuestIds?: string[];
    factionRequirement?: { factionId: string; minReputation: number };
  };
  enemies: string[]; // Creature/Enemy IDs encountered
  events: string[];
  rewards: {
    exp: number;
    gold: number;
    items: { itemId: string; quantity: number }[];
    reputation?: { factionId: string; points: number };
  };
  dialogues: {
    onStart: string;
    inProgress: string;
    onComplete: string;
  };
  completionConditions: string;
  tags?: string[];
}

export interface EncounterEntry {
  creatureId: string;
  rarityCategory: 'common' | 'uncommon' | 'rare' | 'special' | 'boss';
  weight: number; // 1-100
  timeOfDay?: 'day' | 'night' | 'dusk' | 'any';
  weatherRequirement?: 'clear' | 'rain' | 'fog' | 'storm' | 'snow' | 'any';
  minLevel: number;
  maxLevel: number;
}

export interface Biome {
  id: string;
  name: string;
  regionId: string;
  description: string;
  temperature: 'freezing' | 'cold' | 'temperate' | 'warm' | 'scorching';
  humidity: 'arid' | 'dry' | 'moderate' | 'humid' | 'swampy';
  atmosphere: string;
  ambientLighting: {
    color: string;
    intensity: number;
    shadowColor: string;
  };
  commonCreatures: string[]; // Creature IDs
  uncommonCreatures: string[];
  rareCreatures: string[];
  specialCreatures: string[];
  gatherableResources: string[]; // Item IDs
  npcs: string[]; // NPC IDs
  naturalEvents: string[];
  enemies: string[];
  encounterTable: EncounterEntry[];
  depthProperties2D5: {
    baseTileHeight: number;
    elevationLayers: number;
    hasWaterReflection: boolean;
    weatherOverlay?: string;
  };
}

export interface Item {
  id: string;
  name: string;
  type: 'consumable' | 'material' | 'equipment' | 'key_item' | 'relic';
  category: 'potion' | 'herb' | 'ore' | 'weapon' | 'armor' | 'accessory' | 'tame_item' | 'quest';
  rarity: RarityType;
  description: string;
  value: number; // Gold
  statsModifier?: Partial<CreatureStats>;
  effects?: string[];
  dropSources?: string[]; // Creature IDs or Biome IDs
  recipeIngredients?: { itemId: string; quantity: number }[];
  visual2D5: {
    iconKey: string;
    dropSpriteKey?: string;
    scale: number;
  };
}

export interface Ability {
  id: string;
  name: string;
  type: ElementType;
  category: 'physical' | 'special' | 'status' | 'support';
  power: number;
  accuracy: number; // 0-100%
  manaCost: number;
  cooldownTurns: number;
  range: number; // 2.5D grid distance
  aoe2D5: {
    shape: 'single' | 'cross' | 'square' | 'line' | 'cone' | 'all';
    radius: number;
  };
  statusEffects?: {
    type: 'poison' | 'burn' | 'freeze' | 'paralyze' | 'sleep' | 'bleed' | 'boost';
    chance: number;
    duration: number;
  }[];
  visualFx: {
    animationKey: string;
    particleTint: string;
    soundEffect: string;
  };
  description: string;
}

export interface Dungeon {
  id: string;
  name: string;
  regionId: string;
  theme: string;
  recommendedLevel: number;
  floorsCount: number;
  bossCreatureId: string;
  regularEnemies: string[];
  puzzleMechanics: string[];
  lootPool: { itemId: string; chance: number }[];
  depthLayers2D5: {
    floorElevation: number;
    ambientOcclusion: boolean;
    fogOfWar: boolean;
  };
  description: string;
}

export interface Faction {
  id: string;
  name: string;
  description: string;
  territory: string[]; // Region IDs
  beliefs: string;
  leaderNpcId?: string;
  reputationTiers: {
    tier: string;
    pointsRequired: number;
    perks: string;
  }[];
  allies: string[]; // Faction IDs
  enemies: string[]; // Faction IDs
}

export interface Shop {
  id: string;
  name: string;
  merchantNpcId: string;
  location: string;
  inventory: {
    itemId: string;
    stock: number | 'infinite';
    customPrice?: number;
  }[];
  priceModifier: number; // 1.0 = normal, 1.2 = 20% markup
  specialUnlockCondition?: string;
}

export interface Region {
  id: string;
  name: string;
  description: string;
  biomes: string[]; // Biome IDs
  coordinates: { minX: number; maxX: number; minY: number; maxY: number };
  elevationRange: [number, number];
  loreSummary: string;
}

// Visual Content Types & Style Bible for AURORA (Phase 3)
export type VisualAssetType =
  | 'creature_sprite'
  | 'creature_concept'
  | 'npc_sprite'
  | 'npc_concept'
  | 'enemy_sprite'
  | 'boss_concept'
  | 'item_icon'
  | 'resource_prop'
  | 'foliage_plant'
  | 'decoration_prop'
  | 'building_structure'
  | 'environment_tile';

export type VisualOrientation =
  | 'south' // Front
  | 'north' // Back
  | 'west'  // Left
  | 'east'  // Right
  | 'south_east'
  | 'south_west'
  | 'north_east'
  | 'north_west'
  | 'isometric_front';

export type VariantType =
  | 'original'
  | 'shiny'
  | 'elemental'
  | 'seasonal'
  | 'rare'
  | 'damaged'
  | 'outfit';

export interface VisualAsset {
  id: string;
  name: string;
  type: VisualAssetType;
  targetCategory: AuroraEntityType | 'foliage' | 'decoration' | 'building' | 'environment';
  relatedEntityId?: string; // Links e.g. Creature "sylvyn" -> "asset_sylvyn_sprite"
  regionId?: string;
  biomeId?: string;
  imageUrl: string;
  thumbnailUrl?: string;
  prompt: string;
  referenceAssetId?: string;
  variantType: VariantType;
  variantParentId?: string;
  variantNotes?: string;
  resolution: { width: number; height: number };
  scale: number;
  anchor: { x: number; y: number }; // 0.5, 0.9 for standard 2.5D
  footPoint: { x: number; y: number }; // Ground alignment point
  ySortOffset: number; // For Phaser depth sorting: depth = y + ySortOffset
  orientation: VisualOrientation;
  availableDirections: VisualOrientation[];
  collisionBox: { width: number; height: number; offsetX: number; offsetY: number };
  shadow: { enabled: boolean; radiusX: number; radiusY: number; opacity: number; offsetY: number };
  tags: string[];
  approvalStatus: 'draft' | 'staged' | 'approved' | 'rejected';
  metadata: {
    element?: ElementType;
    rarity?: RarityType;
    stylePreset?: string;
    silhouetteScore?: number; // 0-100%
    contrastRatio?: number;
    colorPalette?: string[];
    notes?: string;
    createdAt: string;
    updatedAt?: string;
  };
}

export interface VisualPalette {
  id: string;
  name: string;
  biomeIds: string[];
  dominantHex: string[];
  accentHex: string[];
  shadowHex: string;
  highlightHex: string;
  description: string;
}

export interface VisualStyleBible {
  version: string;
  artStyle: {
    name: string;
    description: string;
    renderingTechnique: string;
    outlineWeight: 'none' | '1px_clean' | '2px_bold' | 'soft_shaded';
    shadingType: 'cel_shaded' | 'painterly' | 'faceted_crystal' | 'pixel_dither';
    cameraAngle: '26.565_dimetric' | '30_isometric' | '45_topdown';
  };
  palettes: VisualPalette[];
  proportions: {
    creatureStyle: 'stylized_organic' | 'chibi_cute' | 'heroic_beast';
    npcHeadToBodyRatio: string;
    bossScaleMultiplier: number;
  };
  levelOfDetail: 'pixel_clean' | 'detailed_texture' | 'minimal_lowpoly';
  shapesAndSilhouettes: {
    natureSilhouettes: string;
    magicalSilhouettes: string;
    corruptedSilhouettes: string;
    readabilityRequirement: string;
  };
  materials: {
    name: string;
    visualProperties: string;
    specularity: string;
    colorRange: string[];
  }[];
  lightingRules: {
    keyLightDirection: string;
    ambientColorMultiplier: number;
    dropShadowShape: 'dimetric_ellipse' | 'circular_soft' | 'directional_cast';
    dropShadowDefaultOpacity: number;
  };
  scaleStandards: {
    tileDimension: string;
    smallCreature: string;
    mediumCreature: string;
    largeBoss: string;
    npcHeight: string;
    propItem: string;
    building: string;
  };
  rulesByEntity: {
    creatures: string[];
    npcs: string[];
    environments: string[];
    bosses: string[];
    items: string[];
  };
}

export interface VisualQAIssue {
  id: string;
  assetId: string;
  assetName: string;
  issueType:
    | 'scale_mismatch'
    | 'invalid_anchor'
    | 'missing_footpoint'
    | 'depth_sort_conflict'
    | 'missing_directions'
    | 'poor_silhouette'
    | 'palette_deviation'
    | 'broken_data_link'
    | 'invalid_resolution';
  severity: 'critical' | 'warning' | 'suggestion';
  description: string;
  autoFixAvailable: boolean;
  fixAction?: {
    type: 'clamp_anchor' | 'adjust_ysort' | 'link_entity' | 'fix_resolution' | 'apply_shadow' | 'sync_palette';
    field: string;
    recommendedValue: any;
  };
}

export interface VisualQAReport {
  timestamp: string;
  totalAssetsChecked: number;
  passedCount: number;
  warningCount: number;
  criticalCount: number;
  healthScore: number; // 0 - 100%
  issues: VisualQAIssue[];
}

// Project Workspace State
export interface ProjectContext {
  regions: Region[];
  biomes: Biome[];
  creatures: Creature[];
  npcs: NPC[];
  quests: Quest[];
  items: Item[];
  abilities: Ability[];
  dungeons: Dungeon[];
  factions: Faction[];
  shops: Shop[];
  visualAssets?: VisualAsset[];
  styleBible?: VisualStyleBible;
  decisionLog?: DirectorDecisionLogEntry[];
  gameRules: {
    maxLevel: number;
    statScaleFactor: number;
    dimetricRatio: number; // 2:1 projection
    depthSortingRule: string;
  };
}

// -------------------------------------------------------------
// FASE 4: AURORA AI DIRECTOR TYPES & INTERFACES
// -------------------------------------------------------------

export interface DirectorHealthScores {
  overall: number; // 0 - 100
  worldHealth: number;
  contentHealth: number;
  balanceHealth: number;
  questHealth: number;
  ecosystemHealth: number;
  technicalHealth: number;
  visualHealth: number;
  lastUpdated: string;
}

export type DesignPillarId =
  | 'exploration'
  | 'progression'
  | 'combat'
  | 'capture_taming'
  | 'economy'
  | 'rewards'
  | 'quests'
  | 'variety'
  | 'difficulty'
  | 'pacing'
  | 'replayability';

export interface GameDesignEvaluation {
  pillar: DesignPillarId;
  name: string;
  score: number; // 0 - 100
  status: 'optimal' | 'good' | 'needs_attention' | 'critical';
  summary: string;
  strengths: string[];
  weaknesses: string[];
  recommendation: string;
  whyThisImprovesGame: string;
}

export interface WorldCoherenceIssue {
  id: string;
  regionId: string;
  regionName: string;
  biomeId?: string;
  biomeName?: string;
  issueType:
    | 'empty_region'
    | 'underpopulated_biome'
    | 'creature_npc_disparity'
    | 'quest_desert'
    | 'missing_resources'
    | 'disconnected_enemy'
    | 'orphan_events';
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  metrics: {
    creaturesCount: number;
    npcsCount: number;
    questsCount: number;
    resourcesCount: number;
  };
  suggestedAction: {
    title: string;
    description: string;
    packType: 'balance_region' | 'add_quests' | 'populate_biome' | 'add_npcs';
    targetRegionId: string;
    targetBiomeId?: string;
  };
}

export interface WorldCoherenceAnalysis {
  healthScore: number;
  totalRegions: number;
  totalBiomes: number;
  coherentRelationsCount: number;
  incoherentRelationsCount: number;
  issues: WorldCoherenceIssue[];
}

export interface EcosystemAnalysis {
  healthScore: number;
  biomesSummary: {
    biomeId: string;
    biomeName: string;
    preyCount: number;
    predatorCount: number;
    trophicRatio: number; // ideal ~2.5 - 3.5 prey per predator
    status: 'balanced' | 'predator_heavy' | 'prey_heavy' | 'sterile';
    rarityBreakdown: {
      common: number;
      uncommon: number;
      rare: number;
      special: number;
    };
    timeCoverage: {
      day: number;
      night: number;
      dusk: number;
      any: number;
    };
    weatherCoverage: {
      clear: number;
      rain: number;
      fog: number;
      storm: number;
    };
    resourceCount: number;
    recommendation: string;
  }[];
  globalRarityBalance: {
    commonPct: number;
    uncommonPct: number;
    rarePct: number;
    specialPct: number;
    isIdeal: boolean;
  };
}

export interface ProgressionStageNode {
  stageIndex: number;
  regionId: string;
  regionName: string;
  recommendedLevelRange: [number, number];
  averagePlayerBst: number;
  creaturesAverageBst: number;
  creaturesMaxBst: number;
  enemiesCount: number;
  averageExpReward: number;
  averageGoldReward: number;
  hasDifficultySpike: boolean;
  hasRewardDrought: boolean;
  notes: string;
}

export interface ProgressionAnalysis {
  healthScore: number;
  stages: ProgressionStageNode[];
  spikesDetected: {
    fromRegion: string;
    toRegion: string;
    levelJump: number;
    statJumpPct: number;
    severity: 'critical' | 'moderate' | 'mild';
    description: string;
  }[];
  rewardAnomalies: {
    regionName: string;
    issue: string;
    suggestedAdjustment: string;
  }[];
  overpoweredCreatures: {
    id: string;
    name: string;
    bst: number;
    level: number;
    expectedBst: number;
    deviation: number;
  }[];
}

export interface QuestDirectorAnalysis {
  healthScore: number;
  totalQuests: number;
  typeDistribution: Record<'main' | 'side' | 'bounty' | 'faction' | 'event', number>;
  objectiveTypeDistribution: Record<string, number>;
  repetitionWarning: boolean;
  underutilizedNpcs: {
    npcId: string;
    npcName: string;
    role: string;
    location: string;
    questsCount: number;
  }[];
  regionsWithoutQuests: string[];
  rewardAdequacyScore: number;
  suggestions: {
    title: string;
    reason: string;
    targetNpcId: string;
    targetRegionId: string;
  }[];
}

export interface NarrativeConflict {
  id: string;
  factionAId: string;
  factionAName: string;
  factionBId: string;
  factionBName: string;
  territoryContested: string;
  tensionLevel: 'cold_war' | 'active_skirmish' | 'ideological' | 'alliance_threat';
  description: string;
  questHooks: string[];
}

export interface NarrativeAnalysis {
  healthScore: number;
  factionsCount: number;
  activeConflicts: NarrativeConflict[];
  orphanedNpcs: { id: string; name: string; reason: string }[];
  loreGaps: {
    topic: string;
    regionOrFaction: string;
    missingDetails: string;
    suggestedSubplot: string;
  }[];
  recurringCharacterOpportunities: {
    npcId: string;
    npcName: string;
    potentialArc: string;
  }[];
}

export type RecommendationImpact = 'critical' | 'high' | 'medium' | 'low';
export type RecommendationEffort = 'low' | 'medium' | 'high';

export interface DirectorRecommendation {
  id: string;
  impact: RecommendationImpact;
  effort: RecommendationEffort;
  category:
    | 'world_density'
    | 'balance_progression'
    | 'quest_variety'
    | 'ecosystem_harmony'
    | 'narrative_depth'
    | 'visual_coverage'
    | 'economy_tuning';
  title: string;
  targetLocation?: string;
  reason: string;
  proposedSolution: string;
  actionLabel: string;
  actionType:
    | 'one_click_pack'
    | 'auto_balance'
    | 'quest_chain'
    | 'ecosystem_tune'
    | 'narrative_conflict'
    | 'fill_gaps';
  packConfig?: {
    regionId?: string;
    biomeId?: string;
    creaturesCount?: number;
    npcsCount?: number;
    questsCount?: number;
    itemsCount?: number;
    theme?: string;
  };
}

export interface DirectorDecisionLogEntry {
  id: string;
  timestamp: string;
  title: string;
  summary: string;
  category: string;
  entitiesAffectedCount: number;
  approvedByUser: boolean;
  notes?: string;
}

export interface GameDesignReport {
  generatedAt: string;
  projectVersion: string;
  healthScores: DirectorHealthScores;
  executiveSummary: string;
  strengths: string[];
  weaknesses: string[];
  criticalRisks: string[];
  missingContentGaps: {
    category: string;
    description: string;
    urgency: 'high' | 'medium' | 'low';
  }[];
  balanceAndProgressionReport: string;
  narrativeDiagnostics: string;
  technicalAndVisualValidation: string;
  topPriorityRoadmap: {
    step: number;
    title: string;
    impact: string;
    description: string;
  }[];
}

export interface DirectorChatMessage {
  id: string;
  sender: 'user' | 'director';
  timestamp: string;
  text: string;
  groundedEntities?: {
    type: AuroraEntityType | 'system';
    id: string;
    name: string;
  }[];
  insufficientContext?: boolean;
  missingContextExplanation?: string;
  suggestedAction?: {
    label: string;
    actionType: string;
    params: any;
  };
}

export type ValidationSeverity = 'error' | 'warning' | 'info';

export interface ValidationError {
  id: string;
  entityType: AuroraEntityType;
  entityId: string;
  entityName: string;
  field: string;
  severity: ValidationSeverity;
  message: string;
  suggestedFix?: string;
  autoFixAction?: {
    type: 'replace_field' | 'add_reference' | 'clamp_number' | 'generate_missing';
    field: string;
    newValue: any;
  };
}

export interface ValidationSummary {
  criticalErrors: number;
  warnings: number;
  info: number;
  totalChecks: number;
}

export interface ValidationReport {
  timestamp: string;
  totalEntities: number;
  errorCount: number;
  warningCount: number;
  infoCount: number;
  healthScore: number;
  summary: ValidationSummary;
  errors: ValidationError[];
}

export interface ProjectAnalysis {
  timestamp: string;
  summary: {
    totalCreatures: number;
    totalNPCs: number;
    totalQuests: number;
    totalBiomes: number;
    totalItems: number;
    totalAbilities: number;
    totalRegions: number;
  };
  elementDistribution: Record<ElementType, number>;
  rarityDistribution: Record<RarityType, number>;
  biomeCoverage: {
    biomeId: string;
    biomeName: string;
    creatureCount: number;
    npcCount: number;
    questCount: number;
    status: 'empty' | 'underpopulated' | 'balanced' | 'rich';
  }[];
  missingContentGaps: {
    category: AuroraEntityType;
    title: string;
    description: string;
    suggestedPrompt: string;
    targetRegionOrBiome?: string;
  }[];
  redundancies: {
    title: string;
    entityIds: string[];
    reason: string;
  }[];
  imbalances: {
    entityId: string;
    name: string;
    issue: string;
    recommendation: string;
  }[];
}

export interface ChainStep {
  stepId: string;
  category: AuroraEntityType;
  title: string;
  status: 'pending' | 'generating' | 'completed' | 'failed' | 'rejected' | 'approved';
  prompt: string;
  output?: any;
  dependencies?: string[]; // IDs of previous steps
}

export interface ProjectVersionSnapshot {
  id: string;
  timestamp: string;
  title: string;
  description: string;
  snapshot: ProjectContext;
  entityCount: number;
  diffSummary?: string;
}

export interface StagedEntityChange {
  action: 'new' | 'modified' | 'deleted';
  entityType: AuroraEntityType;
  entity: any;
  previousEntity?: any;
  details?: string;
}

export interface StagedPackage {
  id: string;
  title: string;
  description: string;
  contextUsed?: {
    targetLocationName?: string;
    existingEntitiesInLocation: string[];
    suggestedElementTypes: string[];
    recommendedBstRange: [number, number];
    occupiedIdsCount: number;
    summary: string;
  };
  changes: StagedEntityChange[];
  unchangedCount: number;
  targetContext: ProjectContext;
}

// -------------------------------------------------------------
// PHASE 5: AURORA ↔ CURSOR INTEGRATION TYPES
// -------------------------------------------------------------

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'BLOCKED';

export interface RiskAnalysis {
  level: RiskLevel;
  score: number; // 0 to 100 (100 = safest)
  reasons: string[];
  impactSummary: string;
  affectedSystems: string[];
  breakingChangesWarning?: string;
}

export type DiffLineType = 'add' | 'del' | 'context';

export interface DiffHunkLine {
  type: DiffLineType;
  content: string;
  oldLineNumber?: number;
  newLineNumber?: number;
}

export interface DiffHunk {
  header: string;
  oldStart: number;
  oldLines: number;
  newStart: number;
  newLines: number;
  lines: DiffHunkLine[];
}

export interface SurgicalPatch {
  id: string;
  targetFile: string;
  action: 'created' | 'modified' | 'deleted';
  entityType?: AuroraEntityType;
  entityId?: string;
  rationale: string;
  rawDiff: string;
  hunks: DiffHunk[];
  newFileContent?: string;
  affectedSymbols: string[];
  risk: RiskLevel;
}

export interface IntegrationCheckResult {
  isReadyToIntegrate: boolean;
  passedChecks: string[];
  failedChecks: string[];
  warnings: string[];
  tsCompatScore: number;
  phaser3CompatScore: number;
  dimetric2D5CompatScore: number;
  details: {
    category: string;
    status: 'pass' | 'fail' | 'warn';
    message: string;
    suggestedFix?: string;
  }[];
}

export type ChangePackageStatus = 'GENERATED' | 'STAGED' | 'EXPORTED' | 'APPLIED' | 'VERIFIED';

export interface IntegrationTaskStep {
  stepNumber: number;
  title: string;
  description: string;
  fileTarget?: string;
  codeSnippet?: string;
  command?: string;
  type: 'file_create' | 'file_update' | 'import_add' | 'validation_run' | 'build_run';
}

export interface AuroraIntegrationTask {
  taskId: string;
  title: string;
  targetEnvironment: string;
  steps: IntegrationTaskStep[];
  validationCommands: string[];
  estimatedEffort: string;
}

export interface AuroraChangePackage {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  createdFiles: { path: string; description: string; sizeBytes: number }[];
  modifiedFiles: { path: string; description: string; patchesCount: number }[];
  deletedFiles: { path: string; description: string }[];
  dependencies: { name: string; requiredFor: string }[];
  affectedEntities: { id: string; name: string; type: AuroraEntityType; action: 'add' | 'modify' | 'remove' }[];
  rationale: string;
  riskAnalysis: RiskAnalysis;
  patches: SurgicalPatch[];
  integrationCheck: IntegrationCheckResult;
  status: ChangePackageStatus;
  snapshotIdBeforeApply?: string;
  instructions: AuroraIntegrationTask;
}

export interface ProjectManifest {
  projectName: string;
  framework: string; // "Phaser 3"
  language: string; // "TypeScript"
  version: string;
  structure: {
    directories: string[];
    fileCount: number;
    detectedExtensions: string[];
  };
  scripts: Record<string, string>; // e.g. { "lint": "npm run lint", "build": "npm run build" }
  entitiesDetected: {
    regions: number;
    biomes: number;
    creatures: number;
    npcs: number;
    quests: number;
    items: number;
    abilities: number;
    dungeons: number;
    factions: number;
    shops: number;
    visualAssets: number;
    total: number;
  };
  registries: {
    name: string;
    path: string;
    count: number;
    status: 'synced' | 'out_of_date' | 'missing';
  }[];
  schemas: {
    name: string;
    path: string;
    isShared: boolean;
    consumersCount: number;
  }[];
  integrationPoints: {
    id: string;
    name: string;
    targetFile: string;
    description: string;
    type: 'registry' | 'scene' | 'data_file' | 'asset_manifest';
  }[];
  dimetricConfig: {
    ratio: string; // "Dimetric 2:1"
    depthSorting: string; // "Y-Sorting (feet anchor)"
    defaultTileSize: number;
    elevationLayers: number;
  };
  integrationStatus: 'READY' | 'WARNINGS' | 'BLOCKED' | 'INITIALIZING';
  lastAnalyzed: string;
}

export type SyncStatus = 'SYNCED' | 'CHANGES PENDING' | 'OUT OF SYNC' | 'UNKNOWN';

export interface SyncConflict {
  id: string;
  filePath: string;
  symbol: string;
  projectVersionSnippet: string;
  stagedVersionSnippet: string;
  detectedAt: string;
  status: 'unresolved' | 'resolved';
  resolution?: 'keep_project' | 'keep_staged' | 'merged';
}

export interface ProjectVerificationReport {
  verifiedAt: string;
  isRealExecution: boolean; // Indicates in-browser sandbox vs local disk
  overallStatus: 'PASS' | 'WARN' | 'FAIL';
  typeScriptCheck: { passed: boolean; message: string; simulated: boolean };
  referenceIntegrity: { passed: boolean; brokenReferencesCount: number; message: string };
  dataIntegrity: { passed: boolean; message: string };
  twoAndAHalfDCheck: { passed: boolean; message: string };
  buildInstructionsNote: string;
  recommendedCommand: string;
}

export interface ConnectorState {
  syncStatus: SyncStatus;
  lastSyncedAt?: string;
  manifest: ProjectManifest | null;
  activeChangePackage: AuroraChangePackage | null;
  changePackageHistory: AuroraChangePackage[];
  conflicts: SyncConflict[];
  verificationReport: ProjectVerificationReport | null;
}

// -------------------------------------------------------------
// PHASE 6: PRODUCTION READY, SYSTEM HEALTH & AUDIT TYPES
// -------------------------------------------------------------

export type FeatureRealStatus =
  | 'REAL'
  | 'PARTIAL'
  | 'SIMULATED'
  | 'PENDING'
  | 'UNAVAILABLE'
  | 'REQUIRES PROJECT ACCESS';

export type FeatureAuditCategory =
  | 'CREATION'
  | 'ANALYSIS'
  | 'VISUAL'
  | 'INTEGRATION'
  | 'SAFETY_STORAGE'
  | 'VALIDATION'
  | 'EXPORT';

export interface AuditedFeature {
  id: string;
  name: string;
  category: FeatureAuditCategory;
  status: FeatureRealStatus;
  executionTarget: 'IN_BROWSER_ENGINE' | 'GEMINI_AI_API' | 'EXPORT_TO_CURSOR' | 'LOCAL_STORAGE';
  description: string;
  limitations: string;
  technicalDebt: string;
  riskAssessment: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH';
  verificationMethod: string;
  actionTab?: string;
}

export interface SystemHealthMetric {
  name: string;
  status: 'READY' | 'OPTIMAL' | 'DEGRADED' | 'LIMITED' | 'BLOCKED' | 'EMPTY';
  score: number; // 0 - 100
  details: string;
  diagnostics: string[];
}

export interface SystemHealthReport {
  timestamp: string;
  overallHealthScore: number;
  applicationHealth: 'READY' | 'DEGRADED' | 'BLOCKED';
  aiHealth: 'READY' | 'LIMITED' | 'UNAVAILABLE';
  knowledgeBaseHealth: 'READY' | 'EMPTY' | 'OUT_OF_SYNC';
  projectIntegrationHealth: 'READY' | 'LIMITED' | 'UNAVAILABLE';
  dataIntegrity: SystemHealthMetric;
  visualIntegrity: SystemHealthMetric;
  exportIntegrity: SystemHealthMetric;
  performance: SystemHealthMetric;
  criticalIssuesCount: number;
  unresolvedRisks: string[];
  features: AuditedFeature[];
  productionReadiness: {
    isProductionReady: boolean;
    regressionPassed: boolean;
    typeCheckPassed: boolean;
    zeroCriticalBugs: boolean;
    readyForCursorExport: boolean;
  };
}

export interface FinalProjectHealthReport {
  generatedAt: string;
  projectName: string;
  schemaVersion: string;
  technicalStatus: {
    typescriptErrors: number;
    warnings: number;
    deadReferences: number;
    healthScore: number;
  };
  contentStatus: {
    totalEntities: number;
    creatures: number;
    biomes: number;
    quests: number;
    npcs: number;
    items: number;
    abilities: number;
    elementalBalanceScore: number;
  };
  visualStatus: {
    totalVisualAssets: number;
    yAnchorCompliancePercent: number;
    shadowCompliancePercent: number;
    styleBibleSynced: boolean;
  };
  integrationStatus: {
    syncStatus: SyncStatus;
    pendingPatchesCount: number;
    unresolvedConflictsCount: number;
    phaser3CompatibilityPercent: number;
  };
  risksAndIssues: {
    critical: string[];
    warnings: string[];
    technicalDebtNotes: string[];
  };
  recommendations: string[];
  operationalCapabilities: {
    name: string;
    status: FeatureRealStatus;
  }[];
}

export type OnboardingStepId =
  | 'WELCOME'
  | 'IMPORT_PROJECT'
  | 'ANALYZE'
  | 'BUILD_KNOWLEDGE_BASE'
  | 'CHECK_SYSTEM'
  | 'READY';

// =============================================================
// AURORA AI CREATOR 2.0 — AI GAME DEVELOPMENT STUDIO TYPES
// =============================================================

export type AIStudioTab =
  | 'dashboard'
  | 'game_builder'
  | 'task_agent'
  | 'cursor_integration'
  | 'director'
  | 'system_status'
  | 'project_memory'
  | 'design_rules'
  | 'gameplay_simulator'
  | 'world_expansion'
  | 'ecosystem_studio'
  | 'ab_lab'
  | 'roadmap'
  | 'production_packs'
  | 'impact_graph'
  | 'developer_tools'
  | 'performance_ux'
  | 'visual_creator'
  | 'style_bible'
  | 'visual_qa'
  | 'world_intelligence'
  | 'ai_creator'
  | 'chain_generator'
  | 'library'
  | 'editor'
  | 'analyzer'
  | 'validator'
  | 'export';

// 1. AI GAME BUILDER TYPES
export type BuilderStageId =
  | 'GOAL'
  | 'ANALYSIS'
  | 'DESIGN'
  | 'CONTENT'
  | 'GAMEPLAY'
  | 'VISUAL'
  | 'IMPLEMENTATION'
  | 'STAGING';

export interface BuilderStagePlan {
  stage: BuilderStageId;
  title: string;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  summary: string;
  details: string[];
  deliverables: { name: string; type: string; status: 'ready' | 'generated' | 'staged' }[];
}

export interface AIGameBuilderPlan {
  id: string;
  userGoal: string;
  targetRegionId?: string;
  estimatedDuration: string;
  createdAt: string;
  status: 'planning' | 'generating' | 'ready_to_stage' | 'staged' | 'applied';
  explainability: {
    why: string;
    context: string;
    impact: string;
    effort: 'LOW' | 'MEDIUM' | 'HIGH' | 'MASSIVE';
    risk: 'LOW' | 'MEDIUM' | 'HIGH';
    changesCount: number;
  };
  stages: BuilderStagePlan[];
  generatedContent: {
    creatures: Creature[];
    npcs: NPC[];
    quests: Quest[];
    items: Item[];
    abilities: Ability[];
    visualAssets?: VisualAsset[];
    changePackage?: AuroraChangePackage;
  };
}

// 2. AI TASK AGENT TYPES
export type TaskState = 'pending' | 'running' | 'completed' | 'paused' | 'failed' | 'cancelled' | 'review';
export type TaskPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface AITaskStep {
  id: string;
  title: string;
  description: string;
  state: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  log: string[];
  outputSnippet?: string;
}

export interface AITask {
  id: string;
  title: string;
  description: string;
  category: 'CONTENT' | 'BALANCE' | 'VISUAL' | 'QUEST' | 'SYSTEM' | 'WORLD';
  priority: TaskPriority;
  state: TaskState;
  progressPct: number;
  steps: AITaskStep[];
  createdEntitiesSummary: string[];
  createdAt: string;
  updatedAt: string;
  stagedPackageId?: string;
}

// 3. PROJECT MEMORY TYPES
export type MemoryCategory =
  | 'WORLD_RULES'
  | 'DESIGN_DECISIONS'
  | 'TERMINOLOGY'
  | 'CHARACTERS'
  | 'REGIONS'
  | 'FACTIONS'
  | 'PROGRESSION_RULES'
  | 'VISUAL_RULES'
  | 'REJECTED_DECISIONS'
  | 'APPROVED_CONTENT'
  | 'DISCARDED_CONTENT'
  | 'TECHNICAL_CONVENTIONS';

export interface ProjectMemoryItem {
  id: string;
  category: MemoryCategory;
  title: string;
  content: string;
  tags: string[];
  active: boolean;
  importance: 'high' | 'medium' | 'low';
  createdAt: string;
  lastUsedAt?: string;
}

// 4. DESIGN RULES ENGINE TYPES
export type RuleCategory = 'GAMEPLAY' | 'VISUAL' | 'WORLD' | 'BALANCE' | 'TECHNICAL' | 'NARRATIVE';

export interface DesignRule {
  id: string;
  category: RuleCategory;
  name: string;
  ruleText: string;
  rationale: string;
  severity: 'critical' | 'warning' | 'advisory';
  isEnabled: boolean;
  targetEntities?: AuroraEntityType[];
}

export interface RuleComplianceResult {
  ruleId: string;
  ruleName: string;
  category: RuleCategory;
  passed: boolean;
  severity: 'critical' | 'warning' | 'advisory';
  violationCount: number;
  details: string[];
  fixSuggestion?: string;
}

// 5. GAMEPLAY SIMULATOR TYPES
export interface CombatSimulationRound {
  turn: number;
  attacker: string;
  defender: string;
  actionUsed: string;
  damage: number;
  remainingHpDefender: number;
  isCrit: boolean;
  statusApplied?: string;
}

export interface CombatSimulationRun {
  creatureA: string;
  creatureB: string;
  winner: string;
  totalTurns: number;
  damageDealtA: number;
  damageDealtB: number;
  rounds: CombatSimulationRound[];
}

export interface GameplaySimulationResult {
  simulatedAt: string;
  sampleCount: number;
  playerLevel: number;
  averageTurnsToKill: number;
  playerWinRate: number; // 0.0 - 1.0
  difficultyRating: 'TRIVIAL' | 'CASUAL' | 'BALANCED' | 'CHALLENGING' | 'PUNISHING' | 'IMPOSSIBLE';
  progressionSpeed: 'TOO_FAST' | 'HEALTHY' | 'SLUGGISH';
  dominantAbilities: string[];
  underperformingAbilities: string[];
  anomaliesDetected: {
    title: string;
    severity: 'critical' | 'warning' | 'info';
    description: string;
    recommendation: string;
  }[];
  combatRuns: CombatSimulationRun[];
}

// 6. WORLD EXPANSION TYPES
export interface WorldPOI {
  id: string;
  name: string;
  type: 'ruins' | 'shrine' | 'camp' | 'cave' | 'tower' | 'grove' | 'anomaly' | 'secret_cache';
  coordinates2D5: { x: number; y: number; elevation: number };
  loreNotes: string;
  recommendedLevel: number;
  linkedEntityIds?: string[];
}

export interface WorldSecret {
  id: string;
  title: string;
  triggerCondition: string;
  rewardDescription: string;
  hintNpcId?: string;
  secretType: 'hidden_path' | 'puzzle_chest' | 'rare_spawn' | 'lore_tablet';
}

export interface WorldExpansionProposal {
  id: string;
  regionId: string;
  regionName: string;
  theme: string;
  pois: WorldPOI[];
  secrets: WorldSecret[];
  encountersCount: number;
  explainability: {
    why: string;
    context: string;
    impact: string;
    effort: 'LOW' | 'MEDIUM' | 'HIGH';
    risk: 'LOW' | 'MEDIUM' | 'HIGH';
  };
  status: 'draft' | 'staged' | 'applied';
}

// 7. ECOSYSTEM 2.0 TYPES
export type TrophicLevel =
  | 'RESOURCE'
  | 'PRIMARY_PRODUCER'
  | 'HERBIVORE_PREY'
  | 'SECONDARY_PREDATOR'
  | 'APEX_PREDATOR';

export interface EcosystemNode {
  id: string;
  name: string;
  category: CreatureCategory | 'flora' | 'resource';
  trophicLevel: TrophicLevel;
  rarity: RarityType;
  biomeId: string;
  biomassIndex: number; // 1 - 100
  eats: string[]; // IDs of prey/resources
  eatenBy: string[]; // IDs of predators
  timeOfDay: 'day' | 'night' | 'dusk' | 'any';
  weatherPreference: string;
}

export interface EcosystemWebResult {
  biomeId: string;
  biomeName: string;
  healthScore: number;
  trophicPyramid: {
    apexCount: number;
    predatorCount: number;
    herbivoreCount: number;
    resourceCount: number;
  };
  trophicRatio: number;
  status: 'balanced' | 'predator_heavy' | 'prey_heavy' | 'sterile';
  extinctionRisks: string[];
  nodes: EcosystemNode[];
  recommendations: string[];
}

// 8. A/B DESIGN LAB TYPES
export interface ABDesignVariant {
  id: string;
  name: string;
  hypothesis: string;
  approach: string;
  metrics: {
    pacingScore: number; // 0 - 100
    funFactor: number;
    combatDepth: number;
    progressionFriction: number;
    technicalRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  };
  advantages: string[];
  drawbacks: string[];
  changeSummary: string[];
}

export type ABVariant = ABDesignVariant;

export interface ABExperiment {
  id: string;
  title: string;
  targetSystem: 'COMBAT' | 'PROGRESSION' | 'LOOT' | 'ENCOUNTERS' | 'QUEST_FLOW';
  variants: ABDesignVariant[];
  selectedVariantId?: string;
  status: 'active' | 'evaluated' | 'applied';
}

// 9. AI ROADMAP TYPES
export interface AIRoadmapItem {
  id: string;
  title: string;
  domain: 'GAMEPLAY' | 'WORLD' | 'BALANCE' | 'VISUAL' | 'QUESTS' | 'TECH';
  timeframe: 'NOW' | 'NEXT' | 'LATER' | 'OPTIONAL';
  priorityScore: number; // Calculated 0 - 100
  impactScore: number; // 1 - 10
  effortScore: number; // 1 - 10
  riskScore: number; // 1 - 10
  playerValueScore: number; // 1 - 10
  dependencies: string[];
  rationale: string;
  suggestedAction: string;
  status: 'planned' | 'in_progress' | 'completed';
}

// 10. ONE-CLICK PRODUCTION PACK TYPES
export interface OneClickProductionPack {
  id: string;
  title: string;
  tagline: string;
  theme: string;
  targetRegionId: string;
  targetBiomeName: string;
  description: string;
  contentBreakdown: {
    creaturesCount: number;
    npcsCount: number;
    questsCount: number;
    itemsCount: number;
    abilitiesCount: number;
    visualSpecsCount: number;
  };
  entities: {
    creatures: Creature[];
    npcs: NPC[];
    quests: Quest[];
    items: Item[];
    abilities: Ability[];
    visualAssets?: VisualAsset[];
  };
  loreTieIn: string;
  phaserWiringNotes: string;
}

// 11. IMPACT GRAPH & DEPENDENCIES
export interface EntityDependencyNode {
  id: string;
  label: string;
  type: AuroraEntityType | 'visual' | 'region';
  group: string;
  connections: {
    targetId: string;
    label: string;
    type: 'habitat' | 'quest_giver' | 'reward' | 'ability' | 'evolution' | 'asset';
  }[];
}

// 12. AI USAGE & FREE-FIRST ARCHITECTURE (v2.1)
export type AIUsageLevel =
  | 'LEVEL_0_NO_AI'
  | 'LEVEL_1_LOCAL_CACHE'
  | 'LEVEL_2_GEMINI_FREE'
  | 'LEVEL_3_BLOCKED';

export type CostGuardStatus = 'FREE' | 'PAID' | 'BLOCKED';

export type RouterDecisionStatus =
  | 'LOCAL'
  | 'CACHE'
  | 'GEMINI'
  | 'UNAVAILABLE'
  | 'BLOCKED';

export interface AIResponseCacheEntry {
  id: string;
  promptHash: string;
  contextHash: string;
  taskType: string;
  prompt: string;
  model: string;
  projectVersion: number;
  memoryVersion: number;
  timestamp: string;
  sizeBytes: number;
  usageCount: number;
  result: any;
}

export interface HardwareSpecs {
  cores: number;
  memoryGB: number;
  gpuRenderer: string;
  os: string;
  architecture: string;
  storageEstimateGB: number;
  storageUsedGB: number;
  isHeavyLocalAiRecommended: boolean;
  recommendationNote: string;
}

export interface StorageHealth {
  workspaceBytes: number;
  cacheBytes: number;
  logsBytes: number;
  snapshotsBytes: number;
  assetsBytes: number;
  totalBytes: number;
  limitBytes: number;
  status: 'healthy' | 'warning' | 'critical';
}

export interface AIRequestPreview {
  provider: string;
  model: string;
  contextSizeBytes: number;
  contextTokensEstimated: number;
  requestType: string;
  cacheStatus: 'HIT' | 'MISS';
  costMode: 'FREE_MODE_EUR_0' | 'BLOCKED' | 'PAID';
  estimatedCostFormatted: string;
  relevantEntitiesCount: number;
  filteredKeys: string[];
  privacySanitized: boolean;
}

export interface TaskClassification {
  id: string;
  taskName: string;
  description: string;
  level: AIUsageLevel;
  recommendedRoute: RouterDecisionStatus;
  reason: string;
  canRunOffline: boolean;
  estimatedCostEur: number;
}

export interface FreeAIStats {
  freeMode: boolean;
  offlineMode: boolean;
  costGuardStatus: CostGuardStatus;
  localEngineActive: boolean;
  cacheActive: boolean;
  geminiStatus: 'AVAILABLE' | 'LIMITED' | 'UNAVAILABLE';
  totalLocalOperations: number;
  totalCacheHits: number;
  totalGeminiCalls: number;
  totalBlockedPaidCalls: number;
  savedCallsCount: number;
  estimatedCostEur: number;
  cacheEntriesCount: number;
  cacheSizeBytes: number;
  maxCacheSizeBytes: number;
}

export interface AIUsageMetrics {
  totalTokens: number;
  promptTokens: number;
  completionTokens: number;
  totalCalls: number;
  estimatedCostUsd: number;
  estimatedCostEur: number;
  dailyBudgetLimitUsd: number;
  localOperationsCount: number;
  cacheHitsCount: number;
  blockedPaidRequestsCount: number;
  savedRequestsCount: number;
  callsBreakdown: {
    entityGeneration: number;
    directorAnalysis: number;
    simulator: number;
    gameBuilder: number;
    codeReview: number;
    localRuleEngine: number;
  };
}

export interface AIProviderConfig {
  activeProvider: 'GEMINI_2_5_FLASH' | 'GEMINI_2_5_PRO' | 'LOCAL_RULE_ENGINE';
  freeMode: boolean; // default: true
  offlineMode: boolean; // default: false
  costGuardActive: boolean; // default: true (blocks all paid API)
  enableCache: boolean; // default: true
  enableSmartRouting: boolean; // default: true
  cacheLimitMB: number; // default: 500
  hasApiKey: boolean;
  temperature: number;
  maxOutputTokens: number;
  enableGroundingMemory: boolean;
  contextMinimization: boolean; // default: true
  requestDeduplication: boolean; // default: true
}

// 13. SELF AUDIT & AUTONOMOUS OPTIMIZATION (v2.2)
export type AuditCategory =
  | 'code'
  | 'data'
  | 'knowledge_base'
  | 'project_connector'
  | 'ui'
  | 'performance_engine'
  | 'ai_router'
  | 'cache'
  | 'electron'
  | 'storage'
  | 'security'
  | 'integration';

export type AuditSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';

export interface AuditFinding {
  id: string;
  category: AuditCategory;
  severity: AuditSeverity;
  title: string;
  problem: string;
  cause: string;
  solution: string;
  fileTarget?: string;
  component?: string;
  autoFixable: boolean;
  fixCategory: 'SAFE' | 'ADVANCED';
  visualImpact: boolean;
  regressionRisk: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH';
  fixed?: boolean;
}

export interface AuditRunResult {
  id: string;
  timestamp: string;
  durationMs: number;
  apiCallsUsed: 0; // Guaranteed zero-cost
  totalChecks: number;
  passedChecks: number;
  findings: AuditFinding[];
  score: number;
  categoryScores: Record<AuditCategory, number>;
  summary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
  };
}

export type OptimizationType =
  | 'unnecessary_work'
  | 'repeated_calculations'
  | 'allocations'
  | 'listeners'
  | 'timers'
  | 'renders'
  | 'unneeded_loads'
  | 'duplicates'
  | 'cache_issues'
  | 'storage_issues'
  | 'memory_leaks';

export type OptimizationCategory = 'SAFE' | 'ADVANCED';

export type OptimizationStatus =
  | 'PENDING'
  | 'BLOCKED_BY_VISUAL_LOCK'
  | 'APPLIED'
  | 'STAGED'
  | 'REJECTED';

export interface OptimizationMetricsDelta {
  fps: string; // e.g. "+3.5 FPS"
  frameTime: string; // e.g. "-1.2 ms"
  memory: string; // e.g. "-14.2 MB"
  cpu: string; // e.g. "-4.8%"
  gpu: string; // e.g. "-6 Draw Calls"
  loadTime: string; // e.g. "-180 ms"
  bundle: string; // e.g. "-42 KB"
}

export interface OptimizationProposal {
  id: string;
  title: string;
  type: OptimizationType;
  category: OptimizationCategory; // SAFE or ADVANCED
  status: OptimizationStatus;
  problem: string;
  cause: string;
  solution: string;
  files: string[];
  risk: 'LOW' | 'MEDIUM' | 'HIGH';
  expectedBenefit: string;
  visualImpact: 'NONE' | 'PERCEPTIBLE';
  gameplayImpact: 'NONE' | 'MODIFIES_LOGIC';
  metricsDelta: OptimizationMetricsDelta;
  stagedPatchId?: string;
}

export interface SystemBenchmarkMetrics {
  fps: number;
  frameTimeMs: number;
  memoryMB: number;
  cpuUsagePct: number;
  gpuDrawCalls: number;
  loadTimeMs: number;
  bundleSizeKB: number;
  timestamp: string;
}

export interface RegressionCheckResult {
  passed: boolean;
  timestamp: string;
  checks: {
    gameplay: boolean;
    data: boolean;
    visual: boolean;
    dimetric25D: boolean;
    ySorting: boolean;
    physics: boolean;
    assets: boolean;
    ui: boolean;
    exports: boolean;
  };
  issues: string[];
}

export interface SafetySnapshot {
  id: string;
  timestamp: string;
  name: string;
  description: string;
  trigger: string;
  stateChecksum: string;
  entitiesCount: number;
  rollbackReady: boolean;
  dataJson?: string;
}

export interface MaintenanceTask {
  id: string;
  name: string;
  description: string;
  category: 'cache' | 'logs' | 'references' | 'duplicates' | 'schema' | 'workspace' | 'storage';
  lastRun: string | null;
  status: 'IDLE' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  itemsCleaned: number;
  bytesFreed: number;
  notes: string;
}

export interface MaintenanceReport {
  id: string;
  timestamp: string;
  tasksRun: number;
  totalBytesFreed: number;
  issuesFixed: number;
  storageStatus: 'SAFE' | 'WARNING' | 'CRITICAL';
  notes: string[];
}

export interface AuroraSystemHealthReport {
  timestamp: string;
  overallScore: number;
  version: '2.2' | '2.3';
  freeModeActive: boolean;
  visualLockActive: boolean;
  apiCallsUsed: 0;
  auditResult: AuditRunResult;
  optimizationSummary: {
    totalProposals: number;
    safeProposals: number;
    advancedProposals: number;
    blockedByVisualLock: number;
    appliedCount: number;
  };
  benchmark: {
    before: SystemBenchmarkMetrics;
    after: SystemBenchmarkMetrics;
  };
  regressionGuard: RegressionCheckResult;
  storageHealth: {
    totalMB: number;
    limitMB: number;
    status: 'SAFE' | 'WARNING' | 'CRITICAL';
  };
  securityStatus: {
    exposedSecrets: number;
    invalidIpcRoutes: number;
    hardcodedPaths: number;
    passed: boolean;
  };
  recommendations: string[];
}

// ============================================================================
// AURORA 2.3 — LIVE PROFILING & VERIFIED OPTIMIZATION TYPES
// ============================================================================

export type MetricReliability = 'VERIFIED' | 'ESTIMATED' | 'UNAVAILABLE';

export interface LiveProfileMetric<T = number> {
  value: T;
  unit: string;
  reliability: MetricReliability;
  source: string;
  details?: string;
  target?: number;
  isOptimal?: boolean;
}

export type PerformanceScenarioId =
  | 'startup'
  | 'oakhaven'
  | 'east_route'
  | 'whispering_forest'
  | 'emerald_clearing'
  | 'crystal_peaks'
  | 'frontier_outpost'
  | 'combat'
  | 'exploration'
  | 'heavy_encounter'
  | 'particle_stress'
  | 'maximum_entity_load';

export interface PerformanceScenario {
  id: PerformanceScenarioId;
  name: string;
  description: string;
  biomeId?: string;
  simulatedEntities: number;
  particleCount: number;
  drawCallsEstimate: number;
  baseComplexityMs: number;
  targetFps: number;
  maxFrameTimeMs: number;
  tags: string[];
}

export interface LiveProfilerHardwareInfo {
  userAgent: string;
  devicePixelRatio: number;
  logicalCores: number;
  memoryLimitMB?: number;
  renderer: string;
  vendor: string;
  webglSupported: boolean;
}

export interface LiveProfilerSnapshot {
  id: string;
  timestamp: string;
  durationMs: number;
  sceneId: string;
  sceneName: string;
  connectionMode: 'LIVE_BROWSER' | 'SCENARIO_RUNNER' | 'STRESS_HARNESS';
  runtime: 'BROWSER_WEBGL' | 'BROWSER_CANVAS' | 'ELECTRON_DESKTOP' | 'SANDBOX_MEASURED';
  
  // Real Core Metrics
  fps: LiveProfileMetric<number>;
  frameTimeMs: LiveProfileMetric<number>;
  cpuTimeMs: LiveProfileMetric<number>;
  gpuTimeMs: LiveProfileMetric<number>;
  memoryMB: LiveProfileMetric<number>;
  jsHeapUsedMB: LiveProfileMetric<number>;
  jsHeapTotalMB: LiveProfileMetric<number>;
  jsExecutionTimeMs: LiveProfileMetric<number>;
  drawCalls: LiveProfileMetric<number>;
  
  // Real Game Engine Metrics
  activeGameObjects: LiveProfileMetric<number>;
  activeTweens: LiveProfileMetric<number>;
  activeTimers: LiveProfileMetric<number>;
  activeParticles: LiveProfileMetric<number>;
  physicsWorkloadMs: LiveProfileMetric<number>;
  entityCount: LiveProfileMetric<number>;
  
  // Y-Sorting 2.5D Metrics
  ySortingWorkloadMs: LiveProfileMetric<number>;
  ySortingEntities: LiveProfileMetric<number>;
  ySortingOps: LiveProfileMetric<number>;
  ySortingUnnecessaryOps: LiveProfileMetric<number>;
  ySortingOffscreen: LiveProfileMetric<number>;
  
  // Loading & Memory Lifecycle
  assetLoadingMs: LiveProfileMetric<number>;
  garbageCollectionMs: LiveProfileMetric<number>;
  
  // Hardware Environment
  hardware: LiveProfilerHardwareInfo;
  rawFpsSamples: number[];
  rawFrameTimes: number[];
}

export interface PerformanceBaseline {
  id: string;
  timestamp: string;
  version: '2.3';
  scenarioId: PerformanceScenarioId | 'custom';
  sceneName: string;
  hardwareSummary: string;
  browserRuntime: string;
  fps: number;
  frameTimeMs: number;
  memoryMB: number;
  drawCalls: number;
  entityCount: number;
  cpuPct: number;
  verified: boolean;
  metricsSnapshot: LiveProfilerSnapshot;
}

export interface BaselineComparison {
  baseline: PerformanceBaseline;
  current: LiveProfilerSnapshot;
  deltaFps: number;
  deltaFpsPct: number;
  deltaFrameTimeMs: number;
  deltaFrameTimePct: number;
  deltaMemoryMB: number;
  deltaDrawCalls: number;
  deltaCpuPct: number;
  regressionDetected: boolean;
  regressionReasons: string[];
}

export type BottleneckClass =
  | 'cpu'
  | 'gpu'
  | 'memory'
  | 'loading'
  | 'rendering'
  | 'physics'
  | 'y_sorting'
  | 'allocation'
  | 'update_loop';

export interface BottleneckPriority {
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  confidence: 'VERIFIED' | 'HIGH' | 'MEDIUM';
  risk: 'LOW' | 'MEDIUM' | 'HIGH';
  effort: 'TRIVIAL' | 'MODERATE' | 'COMPLEX';
}

export interface VerifiedBottleneck {
  id: string;
  type: BottleneckClass;
  title: string;
  description: string;
  evidence: string;
  cause: string;
  proposedFix: string;
  priority: BottleneckPriority;
  visualImpact: 'NONE' | 'BLOCKED_BY_VISUAL_LOCK';
  gameplayImpact: 'NONE' | 'REQUIRES_APPROVAL';
  affectedFiles: string[];
  measuredDelta?: {
    before: number;
    after: number;
    unit: string;
    label: string;
  };
}

export type VisualRegressionStatus =
  | 'VERIFIED_IDENTICAL'
  | 'LIMITED_ENVIRONMENT'
  | 'REGRESSION_DETECTED';

export interface VisualRegressionCheck {
  passed: boolean;
  status: VisualRegressionStatus;
  elementsChecked: {
    position: boolean;
    scale: boolean;
    sprites: boolean;
    lighting: boolean;
    particles: boolean;
    depth: boolean;
    ui: boolean;
    camera: boolean;
  };
  issues: string[];
  note: string;
}

export interface FourPillarScore {
  performanceScore: number; // 0-100 based on verified frame-times vs 16.6ms budget
  visualQualityScore: number; // 100% (locked)
  gameplayIntegrityScore: number; // 100% (locked)
  technicalIntegrityScore: number; // 0-100
  overallVerifiedScore: number;
}

export interface VerifiedOptimizationResult {
  id: string;
  timestamp: string;
  scenarioId: PerformanceScenarioId;
  scenarioName: string;
  optimizationId: string;
  optimizationTitle: string;
  technique: string;
  beforeSnapshot: LiveProfilerSnapshot;
  afterSnapshot: LiveProfilerSnapshot;
  delta: {
    fps: number;
    fpsPct: number;
    frameTimeMs: number;
    frameTimePct: number;
    cpuMs: number;
    memoryMB: number;
    drawCalls: number;
    loadTimeMs: number;
  };
  fourPillarScore: FourPillarScore;
  visualRegression: VisualRegressionCheck;
  gameplayRegression: {
    passed: boolean;
    verifiedSystems: string[];
  };
  verifiedImprovement: boolean;
  stagedPatchId?: string;
}

export interface MaximumSafeOptimizationRun {
  id: string;
  timestamp: string;
  stepsExecuted: number;
  totalImprovements: number;
  stopsCondition: string;
  results: VerifiedOptimizationResult[];
  baselineFps: number;
  finalFps: number;
  finalFpsDelta: number;
  baselineFrameTimeMs: number;
  finalFrameTimeMs: number;
  finalFrameTimeDelta: number;
  visualLockEnforced: true;
  gameplayLockEnforced: true;
}

export type StressTestTier = 100 | 250 | 500 | 1000;
export type StressTestType = 'entity_flood' | 'particle_heavy' | 'combat_heavy' | 'multi_system';

export interface StressTestConfig {
  tier: StressTestTier;
  type: StressTestType;
  durationSec: number;
  targetFps: number;
}

export interface StressTestResult {
  id: string;
  timestamp: string;
  config: StressTestConfig;
  minFps: number;
  avgFps: number;
  maxFps: number;
  avgFrameTimeMs: number;
  maxFrameTimeMs: number;
  memoryPeakMB: number;
  drawCallsPeak: number;
  passed: boolean;
  bottlenecksFound: VerifiedBottleneck[];
}

export interface Aurora23PerformanceReport {
  id: string;
  timestamp: string;
  version: '2.3';
  hardware: LiveProfilerHardwareInfo;
  browserRuntime: string;
  visualLock: boolean;
  gameplayLock: boolean;
  apiCallsUsed: 0;
  estimatedCostEur: '0.00 €';
  
  baseline: PerformanceBaseline | null;
  currentLiveSnapshot: LiveProfilerSnapshot;
  scenariosBenchmarked: {
    scenarioId: PerformanceScenarioId;
    name: string;
    fps: number;
    frameTimeMs: number;
    status: 'OPTIMAL' | 'ACCEPTABLE' | 'NEEDS_WORK';
  }[];
  bottlenecksDetected: VerifiedBottleneck[];
  appliedOptimizations: VerifiedOptimizationResult[];
  maximumSafeRun: MaximumSafeOptimizationRun | null;
  fourPillarScore: FourPillarScore;
  visualRegression: VisualRegressionCheck;
  gameplayIntegrityPassed: boolean;
  recommendations: string[];
}




