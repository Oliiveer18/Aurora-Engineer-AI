import { ProjectContext } from '../types/aurora';

export interface PerformanceTelemetry {
  estimatedBundleSizeKb: number;
  memoryFootprintMb: number;
  renderComplexityScore: number; // 0 - 100 (100 = optimal)
  totalActiveEntities: number;
  drawCallsPerScene: number;
  status: 'SAFE' | 'REVIEW' | 'RISKY';
  recommendations: string[];
}

export interface PlayerExperienceRadar {
  onboardingPacing: number; // 0 - 100
  explorationCuriosity: number;
  combatTacticsDepth: number;
  progressionSatisfaction: number;
  rhythmVariety: number;
  discoverySurprise: number;
  overallUXScore: number;
  strengths: string[];
  weaknesses: string[];
}

export function evaluatePerformanceTelemetry(context: ProjectContext): PerformanceTelemetry {
  const totalEntities =
    (context.creatures?.length || 0) +
    (context.npcs?.length || 0) +
    (context.quests?.length || 0) +
    (context.items?.length || 0) +
    (context.abilities?.length || 0);

  const estimatedBundleSizeKb = 180 + totalEntities * 1.5;
  const memoryFootprintMb = 14 + totalEntities * 0.08;
  const drawCallsPerScene = Math.min(45, 12 + Math.floor(totalEntities / 4));
  const renderComplexityScore = Math.max(75, 100 - Math.floor(drawCallsPerScene / 2));

  const status: PerformanceTelemetry['status'] =
    drawCallsPerScene < 35 ? 'SAFE' : drawCallsPerScene < 50 ? 'REVIEW' : 'RISKY';

  const recommendations: string[] = [
    'Texturas 2.5D empaquetadas en Texture Atlas en Phaser 3.',
    'Y-Sorting con optimización O(N log N) por árbol de renderizado.',
  ];

  return {
    estimatedBundleSizeKb: Math.round(estimatedBundleSizeKb),
    memoryFootprintMb: Number(memoryFootprintMb.toFixed(1)),
    renderComplexityScore,
    totalActiveEntities: totalEntities,
    drawCallsPerScene,
    status,
    recommendations,
  };
}

export function evaluatePlayerExperienceRadar(context: ProjectContext): PlayerExperienceRadar {
  const creaturesCount = context.creatures?.length || 0;
  const questsCount = context.quests?.length || 0;
  const biomesCount = context.biomes?.length || 0;

  const onboardingPacing = 85;
  const explorationCuriosity = Math.min(95, 60 + biomesCount * 8);
  const combatTacticsDepth = Math.min(92, 65 + creaturesCount * 3);
  const progressionSatisfaction = Math.min(90, 70 + questsCount * 4);
  const rhythmVariety = 84;
  const discoverySurprise = 88;

  const overallUXScore = Math.round(
    (onboardingPacing +
      explorationCuriosity +
      combatTacticsDepth +
      progressionSatisfaction +
      rhythmVariety +
      discoverySurprise) /
      6
  );

  return {
    onboardingPacing,
    explorationCuriosity,
    combatTacticsDepth,
    progressionSatisfaction,
    rhythmVariety,
    discoverySurprise,
    overallUXScore,
    strengths: [
      'Progresión clara guiada por NPCs y misiones con recompensas balanceadas.',
      'Rica variedad de afinidades elementales que estimulan el pensamiento táctico.',
    ],
    weaknesses: [
      'Se recomienda añadir más eventos aleatorios climáticos para maximizar la sorpresa.',
    ],
  };
}
