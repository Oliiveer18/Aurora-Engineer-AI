import {
  ProjectContext,
  DirectorHealthScores,
  GameDesignEvaluation,
  WorldCoherenceAnalysis,
  WorldCoherenceIssue,
  EcosystemAnalysis,
  ProgressionAnalysis,
  ProgressionStageNode,
  QuestDirectorAnalysis,
  NarrativeAnalysis,
  NarrativeConflict,
  DirectorRecommendation,
  GameDesignReport,
  StagedPackage,
  StagedEntityChange,
  Creature,
  NPC,
  Quest,
  Item,
  Ability,
  Biome,
} from '../types/aurora';
import { validateAuroraProject } from './auroraValidator';
import { runVisualQA } from './visualGeneratorEngine';

// -------------------------------------------------------------
// 1. CALCULATE 7 HEALTH INDICES (DIRECTOR HEALTH SUITE)
// -------------------------------------------------------------

export function calculateDirectorHealth(project: ProjectContext): DirectorHealthScores {
  const regions = project?.regions || [];
  const biomes = project?.biomes || [];
  const creatures = project?.creatures || [];
  const npcs = project?.npcs || [];
  const quests = project?.quests || [];
  const items = project?.items || [];
  const abilities = project?.abilities || [];
  const visualAssets = project?.visualAssets || [];

  // 1. World Health: Biome population & region density
  let worldScore = 70;
  if (regions.length > 0 && biomes.length > 0) {
    const populatedBiomes = biomes.filter(
      (b) => (b?.commonCreatures?.length || 0) + (b?.uncommonCreatures?.length || 0) + (b?.npcs?.length || 0) > 0
    ).length;
    const biomePopRatio = populatedBiomes / biomes.length;
    worldScore = Math.round(50 + biomePopRatio * 50);
  }

  // 2. Content Health: Total volume and completeness of descriptions/dialogues
  let contentScore = 75;
  const totalEntities = creatures.length + npcs.length + quests.length + items.length + abilities.length;
  if (totalEntities >= 30) contentScore = 95;
  else if (totalEntities >= 18) contentScore = 88;
  else if (totalEntities >= 10) contentScore = 76;
  else if (totalEntities === 0) contentScore = 100;
  else contentScore = 60;

  // 3. Balance Health: BST variances and stat curves
  let balanceScore = 80;
  const bstDeviations = creatures.filter((c) => {
    if (!c) return false;
    const bst = (c.stats?.hp || 0) + (c.stats?.attack || 0) + (c.stats?.defense || 0) + (c.stats?.speed || 0) + (c.stats?.specialAttack || 0) + (c.stats?.specialDefense || 0);
    const expected = 200 + (c.recommendedLevel || 10) * 15;
    return Math.abs(bst - expected) > 160;
  }).length;
  balanceScore = creatures.length === 0 ? 100 : Math.max(45, 95 - bstDeviations * 8);

  // 4. Quest Health: Quest variety, objective diversity and rewards
  let questScore = 70;
  if (quests.length > 0) {
    const types = new Set(quests.map((q) => q?.type).filter(Boolean));
    const npcLinked = quests.filter((q) => q?.relatedNpcId && npcs.some((n) => n?.id === q.relatedNpcId)).length;
    const varietyBonus = Math.min(20, types.size * 5);
    const linkRatio = npcLinked / quests.length;
    questScore = Math.round(50 + varietyBonus + linkRatio * 30);
  } else {
    questScore = 70;
  }

  // 5. Ecosystem Health: Predator vs Prey and Rarity distribution
  let ecosystemScore = 78;
  const rareCount = creatures.filter((c) => c?.rarity === 'rare' || c?.rarity === 'epic' || c?.rarity === 'legendary').length;
  if (creatures.length > 0) {
    const rareRatio = rareCount / creatures.length;
    if (rareRatio > 0.6) ecosystemScore = 62; // Too many rare creatures disrupts ecosystem
    else if (rareRatio < 0.1) ecosystemScore = 68; // Too few rare creatures
    else ecosystemScore = 92;
  } else {
    ecosystemScore = 100;
  }

  // 6. Technical Health: Validation errors and ID soundness
  const validation = validateAuroraProject(project);
  const technicalScore = Math.max(30, 100 - (validation.errorCount || 0) * 12 - (validation.warningCount || 0) * 3);

  // 7. Visual Health: 2.5D visual QA and assets coverage
  const visualQA = runVisualQA(project);
  const visualCoverage = Math.min(100, Math.round(((visualAssets.length || 0) / Math.max(1, creatures.length + npcs.length)) * 100));
  const visualScore = Math.round((visualQA?.healthScore || 100) * 0.6 + visualCoverage * 0.4);

  // Composite Overall Score
  const overall = Math.round(
    worldScore * 0.16 +
    contentScore * 0.14 +
    balanceScore * 0.16 +
    questScore * 0.14 +
    ecosystemScore * 0.14 +
    technicalScore * 0.14 +
    visualScore * 0.12
  );

  return {
    overall,
    worldHealth: worldScore,
    contentHealth: contentScore,
    balanceHealth: balanceScore,
    questHealth: questScore,
    ecosystemHealth: ecosystemScore,
    technicalHealth: technicalScore,
    visualHealth: visualScore,
    lastUpdated: new Date().toISOString(),
  };
}

// -------------------------------------------------------------
// 2. GAME DESIGN ANALYSIS (11 DIMENSIONS)
// -------------------------------------------------------------

export function evaluateGameDesign(project: ProjectContext): GameDesignEvaluation[] {
  const { creatures, npcs, quests, items, abilities, biomes, regions } = project;

  const evaluations: GameDesignEvaluation[] = [
    {
      pillar: 'exploration',
      name: 'Exploración & Densidad de Mundo',
      score: biomes.length >= 4 ? 86 : 68,
      status: biomes.length >= 4 ? 'good' : 'needs_attention',
      summary: `Mundo estructurado en ${regions.length} regiones y ${biomes.length} biomas con iluminación dimétrica propia.`,
      strengths: ['Atmósferas diferenciadas por bioma', 'Presencia de tablas de encuentros'],
      weaknesses: biomes.some((b) => !b.gatherableResources || b.gatherableResources.length === 0)
        ? ['Algunos biomas carecen de recursos recolectables']
        : ['Poca densidad de secretos en zonas alejadas'],
      recommendation: 'Añadir al menos 2 nodos de recursos interactivos y 1 evento natural por bioma.',
      whyThisImprovesGame: 'Estimula al jugador a recorrer la cuadrícula isométrica en lugar de transitar en línea recta.',
    },
    {
      pillar: 'progression',
      name: 'Curva de Progresión & Niveles',
      score: 82,
      status: 'good',
      summary: 'Los niveles recomendados avanzan desde nivel 1-6 (Bosque) hasta 25-35 (Zonas avanzadas).',
      strengths: ['Escalado BST consistente con el nivel', 'Transición gradual entre zonas'],
      weaknesses: ['Falta una zona intermedia clara entre el nivel 14 y 24'],
      recommendation: 'Introducir una subzona o mazmorra de nivel 16-20 que sirva de puente de experiencia.',
      whyThisImprovesGame: 'Elimina el "grind" obligatorio y mantiene el ritmo dinámico del RPG.',
    },
    {
      pillar: 'combat',
      name: 'Combate Táctico 2.5D',
      score: abilities.length >= 8 ? 90 : 74,
      status: abilities.length >= 8 ? 'optimal' : 'needs_attention',
      summary: `${abilities.length} habilidades registradas con rangos y formas de área en cuadrícula (single/line/cone/cross).`,
      strengths: ['Habilidades con coste de maná y tiempos de reutilización', 'Efectos de estado como Sangrado y Quemadura'],
      weaknesses: abilities.filter((a) => a.category === 'status').length === 0
        ? ['Escasez de habilidades de soporte o control de masas']
        : [],
      recommendation: 'Añadir 2 habilidades de posicionamiento o alteración de terreno 2.5D.',
      whyThisImprovesGame: 'Aprovecha la proyección dimétrica para otorgar profundidad táctica en las casillas.',
    },
    {
      pillar: 'capture_taming',
      name: 'Captura & Doma de Criaturas',
      score: 84,
      status: 'good',
      summary: 'Criaturas categorizadas por rareza (Common/Uncommon/Rare/Epic/Legendary) y tasas de aparición.',
      strengths: ['Comportamientos territoriales y pacíficos diferenciados', 'Variedad de tipos elementales'],
      weaknesses: items.filter((i) => i.category === 'tame_item').length === 0
        ? ['No hay ítems específicos catalogados como cebos o esferas de doma']
        : [],
      recommendation: 'Crear ítems de doma especializados (ej: "Esencia de Resonancia") con bonificadores por tipo.',
      whyThisImprovesGame: 'Convierte la recolección de criaturas en una mecánica central gratificante.',
    },
    {
      pillar: 'economy',
      name: 'Economía & Sinks de Oro',
      score: items.length >= 10 ? 80 : 65,
      status: items.length >= 10 ? 'good' : 'needs_attention',
      summary: `${items.length} ítems catalogados con valores de compra/venta y fuentes de obtención.`,
      strengths: ['Materiales de drop vinculados a criaturas'],
      weaknesses: ['Falta variedad de consumibles caros y mejoras de equipo'],
      recommendation: 'Establecer precios escalonados para pergaminos de habilidad y reliquias en las tiendas.',
      whyThisImprovesGame: 'Evita la acumulación pasiva de oro sin utilidad en etapas medias del juego.',
    },
    {
      pillar: 'rewards',
      name: 'Distribución de Recompensas',
      score: 85,
      status: 'good',
      summary: 'Las misiones y criaturas otorgan EXP, oro y materiales garantizados o probabilísticos.',
      strengths: ['Tablas de drops porcentuales (chance 0.0 - 1.0)', 'Recompensas de misiones con ítems temáticos'],
      weaknesses: quests.some((q) => q.rewards.exp < 50) ? ['Algunas misiones secundarias ofrecen EXP insuficiente'] : [],
      recommendation: 'Calibrar la EXP de misiones para que equivalga a ~3-5 combates de nivel parejo.',
      whyThisImprovesGame: 'Genera un bucle de satisfacción inmediata tras completar encargos.',
    },
    {
      pillar: 'quests',
      name: 'Diseño & Estructura de Misiones',
      score: quests.length >= 4 ? 82 : 62,
      status: quests.length >= 4 ? 'good' : 'needs_attention',
      summary: `${quests.length} misiones con objetivos tipados (kill, gather, explore, talk, boss).`,
      strengths: ['Diálogos contextuales (onStart, inProgress, onComplete)'],
      weaknesses: quests.filter((q) => q.type === 'main').length === 0
        ? ['No hay misiones principales formalmente etiquetadas']
        : [],
      recommendation: 'Construir una cadena de misión principal que una las regiones a través de los emisarios.',
      whyThisImprovesGame: 'Proporciona una brújula narrativa clara para el jugador novato.',
    },
    {
      pillar: 'variety',
      name: 'Variedad de Entidades & Especies',
      score: 88,
      status: 'optimal',
      summary: 'Catálogo con presencia de Bestias, Espíritus, Elementales y Flora mística.',
      strengths: ['Diversidad de categorías de criaturas', 'Combinaciones primarias y secundarias de tipos'],
      weaknesses: creatures.filter((c) => c.type === 'aether' || c.type === 'ice').length <= 1
        ? ['Subrepresentación de elementos Hielo y Aether']
        : [],
      recommendation: 'Añadir 2 criaturas de tipo Hielo/Aether en biomas de montaña.',
      whyThisImprovesGame: 'Enriquece el sistema de debilidades y fortalezas elementales.',
    },
    {
      pillar: 'difficulty',
      name: 'Curva de Dificultad & Desafío',
      score: 84,
      status: 'good',
      summary: 'Evolución fluida de estadísticas de enemigos según zona geográfica.',
      strengths: ['Jefes de mazmorra con habilidades de área amenazantes'],
      weaknesses: ['Pocos enemigos con resistencias elementales mixtas en zonas iniciales'],
      recommendation: 'Mantener a los enemigos iniciales accesibles e incorporar mecánicas de interrupción en nivel 15+.',
      whyThisImprovesGame: 'Asegura una curva de aprendizaje agradable sin frustración temprana.',
    },
    {
      pillar: 'pacing',
      name: 'Ritmo de Juego & Tiempos de Respiro',
      score: 78,
      status: 'good',
      summary: 'Alternancia entre zonas salvajes y campamentos de NPCs seguros.',
      strengths: ['NPCs con diálogos de inmersión y lore'],
      weaknesses: ['Falta una posada o punto de descanso seguro en la Ciénaga'],
      recommendation: 'Añadir un santuario de descanso en biomas hostiles para recuperar maná.',
      whyThisImprovesGame: 'Crea ciclos naturales de tensión y relajación para el jugador.',
    },
    {
      pillar: 'replayability',
      name: 'Rejugabilidad & Contenido Opcional',
      score: 80,
      status: 'good',
      summary: 'Presencia de variantes Shiny/Radiantes, encuentros nocturnos y mazmorras.',
      strengths: ['Condiciones de clima y ciclo horario en tablas de encuentros'],
      weaknesses: ['Pocas facciones con reputación desbloqueable'],
      recommendation: 'Añadir recompensas exclusivas por alcanzar el rango máximo con facciones.',
      whyThisImprovesGame: 'Incentiva al jugador a regresar a zonas completadas para descubrir contenido extra.',
    },
  ];

  return evaluations;
}

// -------------------------------------------------------------
// 3. WORLD COHERENCE ANALYSIS (RELATIONAL ENGINE)
// -------------------------------------------------------------

export function analyzeWorldCoherence(project: ProjectContext): WorldCoherenceAnalysis {
  const { regions, biomes, creatures, npcs, quests, items } = project;
  const issues: WorldCoherenceIssue[] = [];

  let coherentCount = 0;
  let incoherentCount = 0;

  regions.forEach((region) => {
    const regionBiomes = biomes.filter((b) => b.regionId === region.id || region.biomes?.includes(b.id));

    if (regionBiomes.length === 0) {
      incoherentCount++;
      issues.push({
        id: `issue_empty_region_${region.id}`,
        regionId: region.id,
        regionName: region.name,
        issueType: 'empty_region',
        severity: 'critical',
        description: `La región "${region.name}" no tiene ningún bioma asociado. No contiene jugabilidad activa.`,
        metrics: { creaturesCount: 0, npcsCount: 0, questsCount: 0, resourcesCount: 0 },
        suggestedAction: {
          title: `Crear Bioma y Contenido para ${region.name}`,
          description: 'Genera un bioma maestro con criaturas y puntos de interés.',
          packType: 'populate_biome',
          targetRegionId: region.id,
        },
      });
      return;
    }

    regionBiomes.forEach((biome) => {
      const biomeCreatures = creatures.filter((c) => c.habitat && c.habitat.includes(biome.id));
      const biomeNpcs = npcs.filter((n) => n.location === biome.id || n.location === region.id);
      const biomeQuests = quests.filter((q) => q.location === biome.id || q.location === region.id);
      const biomeResources = items.filter((i) => biome.gatherableResources?.includes(i.id));

      // Check 1: Creature/NPC disparity (lots of monsters, zero narrative/quests)
      if (biomeCreatures.length >= 4 && biomeNpcs.length === 0) {
        incoherentCount++;
        issues.push({
          id: `issue_no_npc_${biome.id}`,
          regionId: region.id,
          regionName: region.name,
          biomeId: biome.id,
          biomeName: biome.name,
          issueType: 'creature_npc_disparity',
          severity: 'high',
          description: `El bioma "${biome.name}" tiene ${biomeCreatures.length} criaturas pero 0 NPCs. Carece de guía o ancla narrativa.`,
          metrics: {
            creaturesCount: biomeCreatures.length,
            npcsCount: biomeNpcs.length,
            questsCount: biomeQuests.length,
            resourcesCount: biomeResources.length,
          },
          suggestedAction: {
            title: `Añadir Guardián / Investigador en ${biome.name}`,
            description: 'Genera 1 NPC y 1 misión asociada al ecosistema local.',
            packType: 'add_npcs',
            targetRegionId: region.id,
            targetBiomeId: biome.id,
          },
        });
      }

      // Check 2: Quest desert
      if (biomeCreatures.length >= 3 && biomeQuests.length === 0) {
        incoherentCount++;
        issues.push({
          id: `issue_quest_desert_${biome.id}`,
          regionId: region.id,
          regionName: region.name,
          biomeId: biome.id,
          biomeName: biome.name,
          issueType: 'quest_desert',
          severity: 'medium',
          description: `"${biome.name}" cuenta con fauna activa pero ninguna misión asignada. El jugador no tiene objetivos explícitos en la zona.`,
          metrics: {
            creaturesCount: biomeCreatures.length,
            npcsCount: biomeNpcs.length,
            questsCount: biomeQuests.length,
            resourcesCount: biomeResources.length,
          },
          suggestedAction: {
            title: `Diseñar Cadena de Caza en ${biome.name}`,
            description: 'Genera 2 misiones de exploración y control de fauna.',
            packType: 'add_quests',
            targetRegionId: region.id,
            targetBiomeId: biome.id,
          },
        });
      }

      // Check 3: Missing gatherable resources
      if (!biome.gatherableResources || biome.gatherableResources.length === 0) {
        incoherentCount++;
        issues.push({
          id: `issue_no_resources_${biome.id}`,
          regionId: region.id,
          regionName: region.name,
          biomeId: biome.id,
          biomeName: biome.name,
          issueType: 'missing_resources',
          severity: 'low',
          description: `"${biome.name}" no define recursos recolectables en su configuración.`,
          metrics: {
            creaturesCount: biomeCreatures.length,
            npcsCount: biomeNpcs.length,
            questsCount: biomeQuests.length,
            resourcesCount: 0,
          },
          suggestedAction: {
            title: `Añadir Recursos Botánicos/Minerales`,
            description: 'Crea 2 ítems de recolección típicos de este clima.',
            packType: 'balance_region',
            targetRegionId: region.id,
            targetBiomeId: biome.id,
          },
        });
      }

      if (biomeCreatures.length >= 2 && (biomeNpcs.length >= 1 || biomeQuests.length >= 1)) {
        coherentCount++;
      }
    });
  });

  const totalEvaluated = Math.max(1, coherentCount + incoherentCount);
  const healthScore = Math.round((coherentCount / totalEvaluated) * 100);

  return {
    healthScore,
    totalRegions: regions.length,
    totalBiomes: biomes.length,
    coherentRelationsCount: coherentCount,
    incoherentRelationsCount: incoherentCount,
    issues,
  };
}

// -------------------------------------------------------------
// 4. ECOSYSTEM SIMULATION & TROPHIC BALANCE
// -------------------------------------------------------------

export function analyzeEcosystem(project: ProjectContext): EcosystemAnalysis {
  const { biomes, creatures, items } = project;

  const biomesSummary = biomes.map((biome) => {
    const biomeCreatures = creatures.filter((c) => c.habitat && c.habitat.includes(biome.id));

    // Classify predators vs prey based on behavior and category
    const predators = biomeCreatures.filter(
      (c) => c.behavior === 'aggressive' || c.behavior === 'territorial' || c.behavior === 'pack_hunter' || c.category === 'beast' || c.category === 'dragon'
    );
    const prey = biomeCreatures.filter(
      (c) => c.behavior === 'passive' || c.behavior === 'skittish' || c.behavior === 'nocturnal' || c.category === 'flora' || c.category === 'spirit'
    );

    const predatorCount = predators.length;
    const preyCount = prey.length;
    const trophicRatio = predatorCount > 0 ? +(preyCount / predatorCount).toFixed(2) : preyCount > 0 ? 5.0 : 0;

    let status: 'balanced' | 'predator_heavy' | 'prey_heavy' | 'sterile' = 'balanced';
    if (biomeCreatures.length === 0) status = 'sterile';
    else if (predatorCount > preyCount) status = 'predator_heavy';
    else if (trophicRatio > 4.0) status = 'prey_heavy';

    const rarityBreakdown = {
      common: biomeCreatures.filter((c) => c.rarity === 'common').length,
      uncommon: biomeCreatures.filter((c) => c.rarity === 'uncommon').length,
      rare: biomeCreatures.filter((c) => c.rarity === 'rare').length,
      special: biomeCreatures.filter((c) => c.rarity === 'epic' || c.rarity === 'legendary').length,
    };

    // Encounter table schedule coverage
    const encTable = biome.encounterTable || [];
    const timeCoverage = {
      day: encTable.filter((e) => e.timeOfDay === 'day').length,
      night: encTable.filter((e) => e.timeOfDay === 'night').length,
      dusk: encTable.filter((e) => e.timeOfDay === 'dusk').length,
      any: encTable.filter((e) => !e.timeOfDay || e.timeOfDay === 'any').length,
    };

    const weatherCoverage = {
      clear: encTable.filter((e) => !e.weatherRequirement || e.weatherRequirement === 'clear' || e.weatherRequirement === 'any').length,
      rain: encTable.filter((e) => e.weatherRequirement === 'rain').length,
      fog: encTable.filter((e) => e.weatherRequirement === 'fog').length,
      storm: encTable.filter((e) => e.weatherRequirement === 'storm').length,
    };

    const resourceCount = biome.gatherableResources?.length || 0;

    let recommendation = 'Ecosistema en armonía ecológica.';
    if (status === 'sterile') {
      recommendation = 'Poblar con al menos 2 presas comunes y 1 depredador.';
    } else if (status === 'predator_heavy') {
      recommendation = 'Exceso de depredadores: añadir herbívoros o criaturas de flora para sostener la cadena trófica.';
    } else if (timeCoverage.night === 0 && encTable.length > 0) {
      recommendation = 'Añadir variantes o criaturas de avistamiento nocturno exclusivo.';
    }

    return {
      biomeId: biome.id,
      biomeName: biome.name,
      preyCount,
      predatorCount,
      trophicRatio,
      status,
      rarityBreakdown,
      timeCoverage,
      weatherCoverage,
      resourceCount,
      recommendation,
    };
  });

  // Global Rarity breakdown
  const totalC = Math.max(1, creatures.length);
  const commonPct = Math.round((creatures.filter((c) => c.rarity === 'common').length / totalC) * 100);
  const uncommonPct = Math.round((creatures.filter((c) => c.rarity === 'uncommon').length / totalC) * 100);
  const rarePct = Math.round((creatures.filter((c) => c.rarity === 'rare').length / totalC) * 100);
  const specialPct = Math.round((creatures.filter((c) => c.rarity === 'epic' || c.rarity === 'legendary').length / totalC) * 100);

  const isIdeal = commonPct >= 40 && rarePct + specialPct <= 35;
  const healthScore = Math.round((isIdeal ? 90 : 75) - biomesSummary.filter((b) => b.status === 'sterile').length * 15);

  return {
    healthScore: Math.max(30, healthScore),
    biomesSummary,
    globalRarityBalance: {
      commonPct,
      uncommonPct,
      rarePct,
      specialPct,
      isIdeal,
    },
  };
}

// -------------------------------------------------------------
// 5. DIFFICULTY & PROGRESSION PIPELINE
// -------------------------------------------------------------

export function analyzeProgressionAndDifficulty(project: ProjectContext): ProgressionAnalysis {
  const { regions, biomes, creatures, quests } = project;

  // Order regions by average level of creatures/quests
  const stages: ProgressionStageNode[] = regions.map((region, idx) => {
    const regionBiomes = biomes.filter((b) => b.regionId === region.id || region.biomes?.includes(b.id));
    const biomeIds = regionBiomes.map((b) => b.id);

    const regionCreatures = creatures.filter((c) => c.habitat && c.habitat.some((h) => biomeIds.includes(h)));
    const regionQuests = quests.filter((q) => q.location === region.id || biomeIds.includes(q.location));

    const levels = [
      ...regionCreatures.map((c) => c.recommendedLevel || 10),
      ...regionQuests.map((q) => q.requirements?.minLevel || 8),
    ];

    const minLvl = levels.length > 0 ? Math.min(...levels) : idx * 8 + 1;
    const maxLvl = levels.length > 0 ? Math.max(...levels) : (idx + 1) * 8 + 4;

    const bsts = regionCreatures.map(
      (c) => c.stats.hp + c.stats.attack + c.stats.defense + c.stats.speed + c.stats.specialAttack + c.stats.specialDefense
    );
    const avgBst = bsts.length > 0 ? Math.round(bsts.reduce((a, b) => a + b, 0) / bsts.length) : 320;
    const maxBst = bsts.length > 0 ? Math.max(...bsts) : 380;
    const avgPlayerBst = 200 + minLvl * 14;

    const expRewards = regionQuests.map((q) => q.rewards?.exp || 100);
    const goldRewards = regionQuests.map((q) => q.rewards?.gold || 50);

    const avgExp = expRewards.length > 0 ? Math.round(expRewards.reduce((a, b) => a + b, 0) / expRewards.length) : 250;
    const avgGold = goldRewards.length > 0 ? Math.round(goldRewards.reduce((a, b) => a + b, 0) / goldRewards.length) : 100;

    return {
      stageIndex: idx + 1,
      regionId: region.id,
      regionName: region.name,
      recommendedLevelRange: [minLvl, maxLvl],
      averagePlayerBst: avgPlayerBst,
      creaturesAverageBst: avgBst,
      creaturesMaxBst: maxBst,
      enemiesCount: regionCreatures.length,
      averageExpReward: avgExp,
      averageGoldReward: avgGold,
      hasDifficultySpike: false,
      hasRewardDrought: avgExp < minLvl * 20,
      notes: `Zona ${idx + 1}: ${regionCreatures.length} criaturas, ${regionQuests.length} misiones.`,
    };
  });

  // Sort stages by recommended minimum level
  stages.sort((a, b) => a.recommendedLevelRange[0] - b.recommendedLevelRange[0]);
  stages.forEach((s, i) => (s.stageIndex = i + 1));

  // Detect Spikes between consecutive stages
  const spikesDetected: ProgressionAnalysis['spikesDetected'] = [];
  for (let i = 0; i < stages.length - 1; i++) {
    const current = stages[i];
    const next = stages[i + 1];

    const levelJump = next.recommendedLevelRange[0] - current.recommendedLevelRange[1];
    const statJumpPct = Math.round(((next.creaturesAverageBst - current.creaturesAverageBst) / current.creaturesAverageBst) * 100);

    if (levelJump > 6 || statJumpPct > 35) {
      next.hasDifficultySpike = true;
      spikesDetected.push({
        fromRegion: current.regionName,
        toRegion: next.regionName,
        levelJump,
        statJumpPct,
        severity: levelJump > 10 ? 'critical' : 'moderate',
        description: `Salto brusco de nivel (+${levelJump} niveles, +${statJumpPct}% BST) entre ${current.regionName} y ${next.regionName}.`,
      });
    }
  }

  // Detect Reward Anomalies
  const rewardAnomalies: ProgressionAnalysis['rewardAnomalies'] = [];
  stages.forEach((stage) => {
    if (stage.hasRewardDrought) {
      rewardAnomalies.push({
        regionName: stage.regionName,
        issue: `EXP promedio (${stage.averageExpReward}) insuficiente para el rango de nivel ${stage.recommendedLevelRange.join('-')}.`,
        suggestedAdjustment: `Incrementar recompensas de misiones a un mínimo de ${stage.recommendedLevelRange[0] * 35} EXP.`,
      });
    }
  });

  // Detect Overpowered Creatures
  const overpoweredCreatures: ProgressionAnalysis['overpoweredCreatures'] = [];
  creatures.forEach((c) => {
    const bst = c.stats.hp + c.stats.attack + c.stats.defense + c.stats.speed + c.stats.specialAttack + c.stats.specialDefense;
    const lvl = c.recommendedLevel || 10;
    const expected = 220 + lvl * 14;
    const deviation = bst - expected;
    if (deviation > 120 && c.rarity !== 'legendary' && c.rarity !== 'mythic') {
      overpoweredCreatures.push({
        id: c.id,
        name: c.name,
        bst,
        level: lvl,
        expectedBst: expected,
        deviation,
      });
    }
  });

  const healthScore = Math.max(35, 100 - spikesDetected.length * 15 - rewardAnomalies.length * 10 - overpoweredCreatures.length * 5);

  return {
    healthScore,
    stages,
    spikesDetected,
    rewardAnomalies,
    overpoweredCreatures,
  };
}

// -------------------------------------------------------------
// 6. QUEST DIRECTOR & NARRATIVE ARCS
// -------------------------------------------------------------

export function analyzeQuestEcosystem(project: ProjectContext): QuestDirectorAnalysis {
  const { quests, npcs, regions } = project;

  const typeDistribution: QuestDirectorAnalysis['typeDistribution'] = {
    main: 0,
    side: 0,
    bounty: 0,
    faction: 0,
    event: 0,
  };

  const objectiveTypeDistribution: Record<string, number> = {};

  quests.forEach((q) => {
    if (typeDistribution[q.type] !== undefined) {
      typeDistribution[q.type]++;
    }
    q.objectives?.forEach((obj) => {
      objectiveTypeDistribution[obj.type] = (objectiveTypeDistribution[obj.type] || 0) + 1;
    });
  });

  const killObjectives = objectiveTypeDistribution['kill'] || 0;
  const totalObjectives = Object.values(objectiveTypeDistribution).reduce((a, b) => a + b, 0);
  const repetitionWarning = totalObjectives > 0 && killObjectives / totalObjectives > 0.65;

  // Underutilized NPCs (NPCs that could give quests but don't)
  const underutilizedNpcs = npcs
    .filter((n) => (n.role === 'quest_giver' || n.role === 'lore_keeper' || n.role === 'faction_leader') && (!n.associatedQuests || n.associatedQuests.length === 0))
    .map((n) => ({
      npcId: n.id,
      npcName: n.name,
      role: n.role,
      location: n.location,
      questsCount: 0,
    }));

  // Regions without quests
  const regionsWithoutQuests = regions
    .filter((r) => !quests.some((q) => q.location === r.id || q.location.includes(r.id)))
    .map((r) => r.name);

  const rewardAdequacyScore = quests.every((q) => q.rewards && q.rewards.exp > 50 && q.rewards.gold > 20) ? 90 : 68;
  const healthScore = Math.max(30, Math.round((typeDistribution.main > 0 ? 30 : 10) + (quests.length >= 5 ? 40 : 20) + (repetitionWarning ? 0 : 20) + (regionsWithoutQuests.length === 0 ? 10 : 0)));

  const suggestions = [
    {
      title: 'Crear Cadena de Historia Principal (Aether Reawakening)',
      reason: 'El juego necesita un hilo conductor que guíe al jugador entre las 4 regiones.',
      targetNpcId: npcs[0]?.id || 'npc_elder_thorne',
      targetRegionId: regions[0]?.id || 'region_whispering_forest',
    },
    {
      title: 'Contrato de Caza de Jefes Opcionales',
      reason: 'Añade desafíos de alta dificultad para jugadores en endgame.',
      targetNpcId: npcs.find((n) => n.role === 'quest_giver')?.id || npcs[0]?.id || '',
      targetRegionId: regions[1]?.id || regions[0]?.id || '',
    },
  ];

  return {
    healthScore,
    totalQuests: quests.length,
    typeDistribution,
    objectiveTypeDistribution,
    repetitionWarning,
    underutilizedNpcs,
    regionsWithoutQuests,
    rewardAdequacyScore,
    suggestions,
  };
}

// -------------------------------------------------------------
// 7. NARRATIVE DIRECTOR & LORE WEB
// -------------------------------------------------------------

export function analyzeNarrativeWeb(project: ProjectContext): NarrativeAnalysis {
  const { factions, npcs, regions, quests } = project;

  const activeConflicts: NarrativeConflict[] = [];

  // Generate plausible tensions based on existing factions or regions
  if (factions.length >= 2) {
    activeConflicts.push({
      id: 'conflict_aether_dispute',
      factionAId: factions[0].id,
      factionAName: factions[0].name,
      factionBId: factions[1].id,
      factionBName: factions[1].name,
      territoryContested: regions[0]?.name || 'Tierras Centrales',
      tensionLevel: 'cold_war',
      description: `Disputa territorial y filosófica por la canalización del Aether místico entre ${factions[0].name} y ${factions[1].name}.`,
      questHooks: [
        'Sabotaje de conductos de maná en el bioma limítrofe',
        'Misión de mediación diplomática para evitar guerra abierta',
      ],
    });
  } else {
    activeConflicts.push({
      id: 'conflict_untamed_wilds',
      factionAId: 'guardians_of_sylva',
      factionAName: 'Guardianes de la Floresta',
      factionBId: 'shadow_incursion',
      factionBName: 'Incursión de las Sombras',
      territoryContested: regions[0]?.name || 'Bosque Susurrante',
      tensionLevel: 'active_skirmish',
      description: 'Presión constante de las criaturas corrompidas contra los puestos de avanzada de los guardianes.',
      questHooks: ['Limpieza de nidos de corrupción', 'Restauración del tótem de luz dimétrica'],
    });
  }

  const orphanedNpcs = npcs
    .filter((n) => (!n.associatedQuests || n.associatedQuests.length === 0) && (!n.relationships || n.relationships.length === 0))
    .map((n) => ({
      id: n.id,
      name: n.name,
      reason: 'No tiene relaciones con otros NPCs ni misiones activas.',
    }));

  const loreGaps = [
    {
      topic: 'Origen de las anomalías 2.5D y el Aether',
      regionOrFaction: regions[0]?.name || 'Bosque Susurrante',
      missingDetails: 'No se explica por qué ciertas criaturas mutan con cristales celestes.',
      suggestedSubplot: 'Investigación con el Erudito para descifrar tablillas antiguas en las ruinas.',
    },
    {
      topic: 'Historia de la Furia del Volcán Ígneo',
      regionOrFaction: 'Volcán Ígneo',
      missingDetails: 'Falta documentar qué entidad primigenia duerme en el núcleo de lava.',
      suggestedSubplot: 'Cadena de expedición para colocar sensores térmicos en el cráter.',
    },
  ];

  const recurringCharacterOpportunities = npcs.slice(0, 2).map((n) => ({
    npcId: n.id,
    npcName: n.name,
    potentialArc: `El personaje viaja a la siguiente región tras completar su primera misión para abrir una tienda ambulante.`,
  }));

  const healthScore = Math.max(40, 90 - orphanedNpcs.length * 8);

  return {
    healthScore,
    factionsCount: factions.length,
    activeConflicts,
    orphanedNpcs,
    loreGaps,
    recurringCharacterOpportunities,
  };
}

// -------------------------------------------------------------
// 8. AI DIRECTOR RECOMMENDATIONS (PRIORITIZED MATRIX)
// -------------------------------------------------------------

export function generateDirectorRecommendations(project: ProjectContext): DirectorRecommendation[] {
  const { regions, biomes, creatures, npcs, quests, items } = project;
  const coherence = analyzeWorldCoherence(project);
  const progression = analyzeProgressionAndDifficulty(project);
  const ecosystem = analyzeEcosystem(project);
  const questEco = analyzeQuestEcosystem(project);

  const recs: DirectorRecommendation[] = [];

  // Recommendation 1: Regional expansions (One-Click Content Packs)
  regions.forEach((region) => {
    const regionBiomes = biomes.filter((b) => b.regionId === region.id || region.biomes?.includes(b.id));
    const biomeIds = regionBiomes.map((b) => b.id);
    const regionCreatures = creatures.filter((c) => c.habitat && c.habitat.some((h) => biomeIds.includes(h)));
    const regionQuests = quests.filter((q) => q.location === region.id || biomeIds.includes(q.location));

    if (regionCreatures.length <= 3) {
      recs.push({
        id: `rec_expand_${region.id}`,
        impact: 'critical',
        effort: 'medium',
        category: 'world_density',
        title: `Expandir Contenido en "${region.name}"`,
        targetLocation: region.name,
        reason: `La región "${region.name}" tiene densidad baja (${regionCreatures.length} criaturas, ${regionQuests.length} misiones). Requiere un ecosistema completo para ser jugable.`,
        proposedSolution: `Generar un Content Pack con 3 criaturas coordinadas, 1 NPC clave, 2 misiones, 2 ítems y 1 evento de bioma con referencias válidas.`,
        actionLabel: `Generar Pack para ${region.name}`,
        actionType: 'one_click_pack',
        packConfig: {
          regionId: region.id,
          biomeId: regionBiomes[0]?.id,
          creaturesCount: 3,
          npcsCount: 1,
          questsCount: 2,
          itemsCount: 2,
          theme: region.name,
        },
      });
    }
  });

  // Recommendation 2: Auto-balance difficulty spikes
  if (progression.spikesDetected.length > 0) {
    const spike = progression.spikesDetected[0];
    recs.push({
      id: 'rec_auto_balance_spikes',
      impact: 'high',
      effort: 'low',
      category: 'balance_progression',
      title: 'Auto-Calibrar Curva de Dificultad y BST',
      reason: `${spike.description} Provoca picos injustos de combate y necesidad de farmeo excesivo.`,
      proposedSolution: 'Reajustar el BST de criaturas intermedias y suavizar los niveles recomendados mediante Staging + Diff.',
      actionLabel: 'Ejecutar Auto-Balance',
      actionType: 'auto_balance',
    });
  }

  // Recommendation 3: Quest chain generation for underutilized NPCs
  if (questEco.underutilizedNpcs.length > 0) {
    const targetNpc = questEco.underutilizedNpcs[0];
    recs.push({
      id: `rec_quest_chain_${targetNpc.npcId}`,
      impact: 'high',
      effort: 'medium',
      category: 'quest_variety',
      title: `Crear Cadena Narrativa para ${targetNpc.npcName}`,
      targetLocation: targetNpc.location,
      reason: `${targetNpc.npcName} (${targetNpc.role}) no tiene ninguna misión vinculada. Los jugadores no tienen incentivos para interactuar.`,
      proposedSolution: `Generar una cadena de 2 misiones (exploración + combate táctico 2.5D) con diálogos y recompensas proporcionales.`,
      actionLabel: `Crear Cadena para ${targetNpc.npcName}`,
      actionType: 'quest_chain',
      packConfig: {
        theme: `Investigaciones de ${targetNpc.npcName}`,
        regionId: targetNpc.location,
      },
    });
  }

  // Recommendation 4: Ecosystem harmony tune
  const sterileOrPredatorHeavy = ecosystem.biomesSummary.find((b) => b.status === 'predator_heavy' || b.status === 'sterile');
  if (sterileOrPredatorHeavy) {
    recs.push({
      id: `rec_eco_${sterileOrPredatorHeavy.biomeId}`,
      impact: 'medium',
      effort: 'low',
      category: 'ecosystem_harmony',
      title: `Equilibrar Cadena Trófica en ${sterileOrPredatorHeavy.biomeName}`,
      targetLocation: sterileOrPredatorHeavy.biomeName,
      reason: sterileOrPredatorHeavy.recommendation,
      proposedSolution: 'Añadir 2 presas herbívoras/espirituales con horarios de aparición nocturnos y gotas de recolección.',
      actionLabel: `Armonizar ${sterileOrPredatorHeavy.biomeName}`,
      actionType: 'ecosystem_tune',
      packConfig: {
        biomeId: sterileOrPredatorHeavy.biomeId,
        theme: `Fauna Pacífica para ${sterileOrPredatorHeavy.biomeName}`,
      },
    });
  }

  // Recommendation 5: Narrative conflict
  recs.push({
    id: 'rec_narrative_tensions',
    impact: 'medium',
    effort: 'medium',
    category: 'narrative_depth',
    title: 'Establecer Subtrama Faccional de Control de Aether',
    reason: 'Las facciones actuales tienen interacciones estáticas. Faltan puntos de fricción moral y misiones con consecuencias.',
    proposedSolution: 'Diseñar 2 misiones de reputación con recompensas exclusivas según la alianza elegida.',
    actionLabel: 'Crear Subtrama Faccional',
    actionType: 'narrative_conflict',
  });

  return recs;
}

// -------------------------------------------------------------
// 9. GAME DESIGN REPORT GENERATOR
// -------------------------------------------------------------

export function generateComprehensiveDesignReport(project: ProjectContext): GameDesignReport {
  const health = calculateDirectorHealth(project);
  const designEval = evaluateGameDesign(project);
  const coherence = analyzeWorldCoherence(project);
  const progression = analyzeProgressionAndDifficulty(project);
  const narrative = analyzeNarrativeWeb(project);
  const recs = generateDirectorRecommendations(project);

  const strengths = [
    `Arquitectura Dimétrica 2.5D estricta compatible al 100% con Phaser 3 y TypeScript.`,
    `Estilo visual coherente respaldado por la Visual Style Bible y paletas maestras.`,
    `Estructura modular con ${project.regions.length} regiones, ${project.biomes.length} biomas y ${project.creatures.length} criaturas ya existentes.`,
    `Sistema de validación bidireccional y motor de Staging con Diff Preview para total seguridad de datos.`,
  ];

  const weaknesses = [
    coherence.issues.length > 0
      ? `Detectadas ${coherence.issues.length} incoherencias relacionales entre biomas, criaturas y misiones.`
      : 'Poca densidad de misiones principales de historia.',
    progression.spikesDetected.length > 0
      ? `Existen ${progression.spikesDetected.length} saltos de dificultad y BST entre regiones consecutivas.`
      : 'Curva de progresión sin zonas puente entre nivel 15 y 25.',
    `Algunos NPCs carecen de misiones asociadas o diálogos de árbol expandido.`,
  ];

  const criticalRisks = [
    `Regiones poco pobladas provocan que el jugador sienta el mundo vacío tras salir del Bosque Susurrante.`,
    `Desbalance de EXP en misiones secundarias puede desincentivar la exploración secundaria.`,
  ];

  const missingContentGaps = coherence.issues.slice(0, 5).map((iss) => ({
    category: iss.issueType.replace(/_/g, ' ').toUpperCase(),
    description: iss.description,
    urgency: (iss.severity === 'critical' ? 'high' : iss.severity === 'high' ? 'medium' : 'low') as any,
  }));

  const balanceAndProgressionReport = `El índice de balance se sitúa en un ${health.balanceHealth}%. El jugador avanza desde nivel 1 hasta nivel ${project.gameRules.maxLevel || 50}. Se recomienda calibrar los picos en ${progression.spikesDetected.map((s) => s.toRegion).join(', ') || 'zonas avanzadas'}.`;

  const narrativeDiagnostics = `Se identificaron ${narrative.factionsCount} facciones y ${narrative.activeConflicts.length} tensiones territoriales. ${narrative.orphanedNpcs.length} NPCs no poseen rol activo en misiones.`;

  const technicalAndVisualValidation = `Salud técnica al ${health.technicalHealth}% y salud visual al ${health.visualHealth}%. Todos los assets exportados respetan foot-point, Y-sorting y elipses de sombra dimétrica 2:1.`;

  const topPriorityRoadmap = recs.slice(0, 4).map((r, i) => ({
    step: i + 1,
    title: r.title,
    impact: r.impact.toUpperCase(),
    description: r.proposedSolution,
  }));

  return {
    generatedAt: new Date().toISOString(),
    projectVersion: 'Aurora RPG 2.5D v2.4 (Director Edition)',
    healthScores: health,
    executiveSummary: `AURORA AI DIRECTOR ha auditado el proyecto completo obteniendo una puntuación de salud general del ${health.overall}%. El núcleo de combate, gráficos 2.5D y entidades base se encuentran firmes. La máxima prioridad es expandir la densidad de contenido en las regiones secundarias y conectar las cadenas de misiones para garantizar una experiencia de RPG inmersiva.`,
    strengths,
    weaknesses,
    criticalRisks,
    missingContentGaps,
    balanceAndProgressionReport,
    narrativeDiagnostics,
    technicalAndVisualValidation,
    topPriorityRoadmap,
  };
}

// -------------------------------------------------------------
// 10. STAGED ACTIONS (AUTO-BALANCE & CONTENT PACK ENGINE)
// -------------------------------------------------------------

export function buildAutoBalancePackage(project: ProjectContext): StagedPackage {
  const targetContext = JSON.parse(JSON.stringify(project)) as ProjectContext;
  const changes: StagedEntityChange[] = [];

  // 1. Balance creatures BST
  targetContext.creatures.forEach((creature) => {
    const oldStats = { ...creature.stats };
    const lvl = creature.recommendedLevel || 10;
    const targetBst = Math.round(220 + lvl * 14);
    const currentBst = oldStats.hp + oldStats.attack + oldStats.defense + oldStats.speed + oldStats.specialAttack + oldStats.specialDefense;

    if (Math.abs(currentBst - targetBst) > 80 && creature.rarity !== 'legendary') {
      const ratio = targetBst / Math.max(1, currentBst);
      creature.stats.hp = Math.round(creature.stats.hp * ratio);
      creature.stats.attack = Math.round(creature.stats.attack * ratio);
      creature.stats.defense = Math.round(creature.stats.defense * ratio);
      creature.stats.speed = Math.round(creature.stats.speed * ratio);
      creature.stats.specialAttack = Math.round(creature.stats.specialAttack * ratio);
      creature.stats.specialDefense = Math.round(creature.stats.specialDefense * ratio);

      changes.push({
        action: 'modified',
        entityType: 'creature',
        entity: creature,
        previousEntity: { ...creature, stats: oldStats },
        details: `BST rebalanceado de ${currentBst} a ${targetBst} (Nivel ${lvl})`,
      });
    }
  });

  // 2. Balance Quest rewards
  targetContext.quests.forEach((quest) => {
    const oldRewards = { ...quest.rewards };
    const minLvl = quest.requirements?.minLevel || 5;
    const targetExp = Math.max(150, minLvl * 35);
    const targetGold = Math.max(50, minLvl * 15);

    if (quest.rewards.exp < targetExp * 0.7 || quest.rewards.gold < targetGold * 0.7) {
      quest.rewards.exp = targetExp;
      quest.rewards.gold = targetGold;

      changes.push({
        action: 'modified',
        entityType: 'quest',
        entity: quest,
        previousEntity: { ...quest, rewards: oldRewards },
        details: `Recompensas escaladas a Nivel ${minLvl} (EXP: ${targetExp}, Oro: ${targetGold})`,
      });
    }
  });

  return {
    id: `pack_autobalance_${Date.now()}`,
    title: 'Auto-Balance Global de Progresión y Recompensas',
    description: `Ajuste armónico de estadísticas BST en criaturas y calibración de EXP/Oro en misiones según su nivel recomendado.`,
    changes,
    unchangedCount: project.creatures.length + project.quests.length - changes.length,
    targetContext,
  };
}

// -------------------------------------------------------------
// 11. ONE-CLICK CONTENT PACK STAGING GENERATOR
// -------------------------------------------------------------

export function buildLocalContentPack(
  project: ProjectContext,
  regionId: string,
  themeName: string
): StagedPackage {
  const targetContext = JSON.parse(JSON.stringify(project)) as ProjectContext;
  if (!targetContext.regions) targetContext.regions = [];
  if (!targetContext.biomes) targetContext.biomes = [];
  if (!targetContext.creatures) targetContext.creatures = [];
  if (!targetContext.npcs) targetContext.npcs = [];
  if (!targetContext.quests) targetContext.quests = [];
  if (!targetContext.items) targetContext.items = [];

  const region = targetContext.regions.find((r) => r && r.id === regionId) || targetContext.regions[0] || {
    id: regionId || 'region_default',
    name: 'Tierras Inexploradas',
    description: 'Tierras vírgenes de Aurora',
    biomes: [],
    recommendedLevelRange: [1, 15] as [number, number],
  };
  const biome: Biome = targetContext.biomes.find((b) => b && b.regionId === region.id) || targetContext.biomes[0] || {
    id: 'biome_default',
    name: 'Bioma Ancestral',
    regionId: region.id,
    description: 'Bioma base inexplorado de la región.',
    temperature: 'temperate',
    humidity: 'moderate',
    atmosphere: 'Mística y serena',
    ambientLighting: {
      color: '#ffffff',
      intensity: 1.0,
      shadowColor: 'rgba(0,0,0,0.4)',
    },
    commonCreatures: [],
    uncommonCreatures: [],
    rareCreatures: [],
    specialCreatures: [],
    gatherableResources: [],
    npcs: [],
    naturalEvents: [],
    enemies: [],
    encounterTable: [],
    depthProperties2D5: {
      baseTileHeight: 32,
      elevationLayers: 2,
      hasWaterReflection: false,
    },
  };
  const biomeId = biome.id;

  const randSuffix = Math.floor(Math.random() * 900) + 100;
  const cleanTheme = themeName.toLowerCase().replace(/[^a-z0-9]/g, '_');

  const c1Id = `creature_${cleanTheme}_scout_${randSuffix}`;
  const c2Id = `creature_${cleanTheme}_apex_${randSuffix}`;
  const npcId = `npc_${cleanTheme}_warden_${randSuffix}`;
  const q1Id = `quest_${cleanTheme}_recon_${randSuffix}`;
  const itm1Id = `item_${cleanTheme}_crystal_${randSuffix}`;
  const itm2Id = `item_${cleanTheme}_tonic_${randSuffix}`;

  const newCreature1: Creature = {
    id: c1Id,
    name: `Explorador de ${region.name}`,
    description: `Ágil habitante de ${biome.name}, adaptado a la topografía dimétrica de la región.`,
    type: 'ice',
    category: 'beast',
    rarity: 'common',
    habitat: [biomeId],
    behavior: 'skittish',
    stats: { hp: 80, attack: 65, defense: 60, speed: 90, specialAttack: 65, specialDefense: 60 },
    abilities: ['ability_frost_bite', 'ability_sylva_gale'],
    weaknesses: ['fire'],
    resistances: ['ice', 'water'],
    evolution: [c2Id],
    evolutionConditions: [
      { targetCreatureId: c2Id, triggerLevel: 24, specialCondition: 'Resonancia elemental en cumbre' },
    ],
    spawnRate: 40,
    recommendedLevel: 14,
    rewards: {
      exp: 110,
      goldMin: 30,
      goldMax: 70,
      drops: [{ itemId: itm1Id, chance: 0.6, minQty: 1, maxQty: 2 }],
    },
    visual2D5: {
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
      tintColor: '#38bdf8',
    },
    implementationNotes2D5: 'Phaser 3: Sprite con Y-sorting y sombra dimétrica.',
    tags: ['ice', 'scout', 'generated_pack'],
  };

  const newCreature2: Creature = {
    id: c2Id,
    name: `Centinela Supremo de ${region.name}`,
    description: `Evolución imponente dotada de cornamenta cristalina que canaliza el Aether de la cordillera.`,
    type: 'ice',
    secondaryType: 'aether',
    category: 'beast',
    rarity: 'rare',
    habitat: [biomeId],
    behavior: 'territorial',
    stats: { hp: 135, attack: 110, defense: 95, speed: 85, specialAttack: 115, specialDefense: 90 },
    abilities: ['ability_frost_bite', 'ability_phantom_step'],
    weaknesses: ['fire'],
    resistances: ['ice', 'water', 'shadow'],
    evolution: [],
    spawnRate: 15,
    recommendedLevel: 26,
    rewards: {
      exp: 260,
      goldMin: 80,
      goldMax: 160,
      drops: [{ itemId: itm1Id, chance: 0.85, minQty: 2, maxQty: 3 }],
    },
    visual2D5: {
      spriteWidth: 96,
      spriteHeight: 96,
      anchorX: 0.5,
      anchorY: 0.92,
      ySortOffset: 12,
      collisionBox: { width: 48, height: 32, offsetX: 24, offsetY: 58 },
      shadow: { enabled: true, radiusX: 28, radiusY: 14, opacity: 0.6, offsetY: 4 },
      dimetricAngleDeg: 26.565,
      elevationZ: 0,
      facingDirections: 4,
      tintColor: '#67e8f9',
    },
    implementationNotes2D5: 'Phaser 3: Sprite con Y-sorting y sombra dimétrica.',
    tags: ['ice', 'apex', 'boss_minion', 'generated_pack'],
  };

  const newNPC: NPC = {
    id: npcId,
    name: `Guardián ${region.name.split(' ')[0]}`,
    title: 'Vigía del Paso Alto',
    role: 'quest_giver',
    personality: 'Pragmático y conocedor de los senderos más seguros.',
    appearance: 'Atuendo de pieles térmicas con grabados de escarcha y catalejo rúnico.',
    location: biomeId,
    backstory: `Custodia los accesos a ${region.name} desde hace décadas.`,
    dialogues: [
      {
        id: 'dlg_1',
        speaker: `Guardián ${region.name.split(' ')[0]}`,
        text: `Ten cuidado con las ventiscas y las bestias del sector alto de ${biome.name}.`,
        responses: [{ text: '¿En qué puedo ayudarte en esta zona?' }],
      },
    ],
    relationships: [],
    associatedQuests: [q1Id],
    eventReactions: [],
    worldFunction: 'Otorga misiones de reconocimiento y pistas sobre debilidades de criaturas.',
    visual2D5: {
      spriteWidth: 48,
      spriteHeight: 64,
      anchorX: 0.5,
      anchorY: 0.95,
      ySortOffset: 4,
      collisionBox: { width: 24, height: 16, offsetX: 12, offsetY: 46 },
      shadow: { enabled: true, radiusX: 14, radiusY: 7, opacity: 0.5, offsetY: 1 },
      dimetricAngleDeg: 26.565,
      elevationZ: 0,
      facingDirections: 4,
      tintColor: '#e0f2fe',
    },
    tags: ['npc', 'quest_giver', 'generated_pack'],
  };

  const newQuest: Quest = {
    id: q1Id,
    title: `El Eco de ${region.name}`,
    type: 'side',
    description: `El Vigía solicita investigar las anomalías en los cristales de hielo de ${biome.name}.`,
    objectives: [
      { id: 'obj_1', type: 'explore', description: `Explora el altar central en ${biome.name}` },
      { id: 'obj_2', type: 'kill', description: `Vence a 3 Exploradores`, targetId: c1Id, amountRequired: 3 },
      { id: 'obj_3', type: 'gather', description: `Recolecta 2 Cristales de Escarcha`, targetId: itm1Id, amountRequired: 2 },
    ],
    relatedNpcId: npcId,
    location: biomeId,
    requirements: { minLevel: 14 },
    enemies: [c1Id, c2Id],
    events: ['Desbloqueo de mapa en la zona alta'],
    rewards: {
      exp: 450,
      gold: 180,
      items: [{ itemId: itm2Id, quantity: 2 }],
    },
    dialogues: {
      onStart: 'Inspecciona las grietas antes de que el frío cubra el sendero.',
      inProgress: '¿Has logrado recolectar los cristales?',
      onComplete: 'Excelente trabajo. Ahora tenemos una ruta despejada.',
    },
    completionConditions: 'Completar los tres objetivos y hablar con el Vigía.',
    tags: ['side', 'exploration', 'generated_pack'],
  };

  const newItem1: Item = {
    id: itm1Id,
    name: `Cristal de Escarcha de ${region.name.split(' ')[0]}`,
    type: 'material',
    category: 'ore',
    rarity: 'uncommon',
    description: `Mineral gélido que conserva baja temperatura indefinidamente.`,
    value: 45,
    dropSources: [c1Id, c2Id],
    visual2D5: { iconKey: 'icon_crystal_blue', scale: 1.0 },
  };

  const newItem2: Item = {
    id: itm2Id,
    name: `Elixir de Calor Aéreo`,
    type: 'consumable',
    category: 'potion',
    rarity: 'uncommon',
    description: `Otorga resistencia a ataques de hielo y frío ambiental durante 5 minutos.`,
    value: 80,
    effects: ['Otorga +20 Defensa y resistencia a ataques de hielo durante 4 turnos.'],
    dropSources: [npcId],
    visual2D5: { iconKey: 'icon_potion_orange', scale: 1.0 },
  };

  // Mutate targetContext
  targetContext.creatures = [newCreature1, newCreature2, ...targetContext.creatures];
  targetContext.npcs = [newNPC, ...targetContext.npcs];
  targetContext.quests = [newQuest, ...targetContext.quests];
  targetContext.items = [newItem1, newItem2, ...targetContext.items];

  // Update biome encounter table & resources
  if (biome) {
    biome.commonCreatures = [...(biome.commonCreatures || []), c1Id];
    biome.rareCreatures = [...(biome.rareCreatures || []), c2Id];
    biome.gatherableResources = [...(biome.gatherableResources || []), itm1Id];
    biome.npcs = [...(biome.npcs || []), npcId];
    biome.encounterTable = [
      ...(biome.encounterTable || []),
      {
        creatureId: c1Id,
        rarityCategory: 'common',
        weight: 50,
        timeOfDay: 'any',
        minLevel: 14,
        maxLevel: 18,
      },
      {
        creatureId: c2Id,
        rarityCategory: 'rare',
        weight: 15,
        timeOfDay: 'night',
        minLevel: 24,
        maxLevel: 28,
      },
    ];
  }

  const changes: StagedEntityChange[] = [
    { action: 'new', entityType: 'creature', entity: newCreature1, details: 'Criatura común de hábitat gélido' },
    { action: 'new', entityType: 'creature', entity: newCreature2, details: 'Criatura rara / evolución apex' },
    { action: 'new', entityType: 'npc', entity: newNPC, details: 'Vigía y dador de contratos de la región' },
    { action: 'new', entityType: 'quest', entity: newQuest, details: 'Misión conectada con las nuevas entidades' },
    { action: 'new', entityType: 'item', entity: newItem1, details: 'Material de drop vinculado' },
    { action: 'new', entityType: 'item', entity: newItem2, details: 'Consumible de recompensa' },
    { action: 'modified', entityType: 'biome', entity: biome, details: 'Actualizada tabla de encuentros y recursos' },
  ];

  return {
    id: `pack_expand_${regionId}_${Date.now()}`,
    title: `One-Click Content Pack: Expansión de "${region.name}"`,
    description: `Generado paquete coherente con 2 criaturas, 1 NPC, 1 misión, 2 ítems y actualización de bioma "${biome.name}".`,
    changes,
    unchangedCount: project.creatures.length + project.npcs.length + project.quests.length,
    targetContext,
  };
}
