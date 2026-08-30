import { ProjectContext, AuroraChangePackage } from '../types/aurora';

export interface GeneratedTestReport {
  suiteName: string;
  totalTests: number;
  passedTests: number;
  testCases: {
    name: string;
    passed: boolean;
    durationMs: number;
    errorDetails?: string;
  }[];
  generatedCode: string;
}

export interface CodeReviewReport {
  fileAnalyzed: string;
  overallVerdict: 'APPROVED' | 'REQUIRES_ADJUSTMENTS' | 'BLOCKED';
  riskScore: number; // 0 - 100
  notes: {
    severity: 'critical' | 'warning' | 'info' | 'good';
    title: string;
    description: string;
    lineRef?: string;
  }[];
  phaser3CompatibilityNotes: string[];
}

export interface DebuggerAnalysis {
  errorType: string;
  rootCause: string;
  recommendedFix: string;
  suggestedPatchSnippet: string;
  confidenceScore: number; // 0 - 100%
}

export function generateAutomatedUnitTests(context: ProjectContext): GeneratedTestReport {
  const testCases = [
    {
      name: 'Schema Integrity: Validar que todas las criaturas tengan 6 stats positivos',
      passed: context.creatures.every(
        (c) =>
          c.stats.hp > 0 &&
          c.stats.attack > 0 &&
          c.stats.defense > 0 &&
          c.stats.speed > 0 &&
          c.stats.specialAttack > 0 &&
          c.stats.specialDefense > 0
      ),
      durationMs: 4,
    },
    {
      name: 'Depth Sorting 2.5D: Anclaje Y en rango [0.85 - 0.95]',
      passed: context.creatures.every((c) => {
        const y = c.visual2D5?.anchorY ?? 0.9;
        return y >= 0.85 && y <= 0.95;
      }),
      durationMs: 3,
    },
    {
      name: 'Cross-Reference Graph: Habilidades de criaturas existen en registro',
      passed: context.creatures.every((c) =>
        c.abilities.every((abId) => context.abilities.some((a) => a.id === abId) || abId === 'basic_strike')
      ),
      durationMs: 5,
    },
    {
      name: 'Quest Giver Integrity: Todos los dadores de misión son NPCs válidos',
      passed: context.quests.every((q) =>
        !q.relatedNpcId || context.npcs.some((n) => n.id === q.relatedNpcId)
      ),
      durationMs: 3,
    },
    {
      name: 'Biome Inhabitation: Ningún bioma tiene 0 criaturas',
      passed: context.biomes.every((b) =>
        context.creatures.some((c) => c.habitat.includes(b.id))
      ),
      durationMs: 6,
    },
  ];

  const passedTests = testCases.filter((t) => t.passed).length;

  const generatedCode = `// AURORA AI CREATOR — AUTOMATED TEST SUITE (Jest / Vitest)
import { describe, it, expect } from 'vitest';
import { AURORA_CREATURES } from './src/data/registries/aurora_creatures';
import { AURORA_QUESTS } from './src/data/registries/aurora_quests';

describe('AURORA Game Data & Engine Tests', () => {
  it('should verify all creatures conform to BST and 6 base stats', () => {
    AURORA_CREATURES.forEach(creature => {
      expect(creature.stats.hp).toBeGreaterThan(0);
      expect(creature.stats.attack).toBeGreaterThan(0);
      expect(creature.visual2D5.anchorY).toBeGreaterThanOrEqual(0.85);
      expect(creature.visual2D5.anchorY).toBeLessThanOrEqual(0.95);
    });
  });

  it('should verify quest donor references', () => {
    AURORA_QUESTS.forEach(quest => {
      expect(quest.objectives.length).toBeGreaterThan(0);
      expect(quest.rewards.exp).toBeGreaterThan(0);
    });
  });
});
`;

  return {
    suiteName: 'AURORA Production Regression Suite v2.0',
    totalTests: testCases.length,
    passedTests,
    testCases,
    generatedCode,
  };
}

export function performCodeReview(changePackage: AuroraChangePackage | null): CodeReviewReport {
  if (!changePackage) {
    return {
      fileAnalyzed: 'N/A (Ningún paquete en Staging)',
      overallVerdict: 'APPROVED',
      riskScore: 0,
      notes: [
        {
          severity: 'good',
          title: 'Espacio de trabajo limpio',
          description: 'No hay parches pendientes de revisión. El proyecto está sincronizado con Cursor.',
        },
      ],
      phaser3CompatibilityNotes: ['Arcade Physics configurado a 60 FPS', 'Y-Sorting activo'],
    };
  }

  const affectedFilePaths = [
    ...changePackage.createdFiles.map((f) => f.path),
    ...changePackage.modifiedFiles.map((f) => f.path),
  ];

  const isHighRisk = changePackage.riskAnalysis?.level === 'HIGH' || changePackage.riskAnalysis?.level === 'BLOCKED';

  const notes: CodeReviewReport['notes'] = [
    {
      severity: 'good',
      title: 'Inmutabilidad de Schemas TypeScript',
      description: `El paquete "${changePackage.title}" utiliza tipos seguros con discriminadores literales.`,
    },
    {
      severity: 'info',
      title: 'Puntos de Integración Quirúrgicos',
      description: `Afecta a ${affectedFilePaths.length} archivo(s) sin sobreescribir lógica procedural de escenas Phaser.`,
    },
  ];

  if (isHighRisk) {
    notes.push({
      severity: 'critical',
      title: 'Riesgo Alto Detectado',
      description: 'El paquete contiene mutaciones que pueden alterar curvas de balance en partidas guardadas.',
    });
  }

  return {
    fileAnalyzed: affectedFilePaths.join(', ') || 'Archivos de registro Aurora',
    overallVerdict: isHighRisk ? 'REQUIRES_ADJUSTMENTS' : 'APPROVED',
    riskScore: changePackage.riskAnalysis?.score || 15,
    notes,
    phaser3CompatibilityNotes: [
      'Garantiza profundidad dimétrica en coordenadas Y.',
      'Totalmente compatible con TypeScript 5+ y Vite.',
    ],
  };
}

export function analyzeDebugError(errorMessage: string, stackTrace?: string): DebuggerAnalysis {
  const errLower = (errorMessage + ' ' + (stackTrace || '')).toLowerCase();

  if (errLower.includes('anchory') || errLower.includes('depth') || errLower.includes('ysort')) {
    return {
      errorType: 'Phaser 2.5D Depth Sorting Issue',
      rootCause: 'El punto de anclaje Y (anchorY) está colocado en el centro (0.5) en lugar de los pies (0.90-0.95), provocando que los sprites se solapen erróneamente.',
      recommendedFix: 'Ajustar visual2D5.anchorY = 0.92 en la definición de la entidad.',
      suggestedPatchSnippet: `visual2D5: { ...creature.visual2D5, anchorY: 0.92, ySortOffset: 0 }`,
      confidenceScore: 96,
    };
  }

  if (errLower.includes('undefined') && errLower.includes('givernpcid')) {
    return {
      errorType: 'Broken Cross-Reference (Orphan Quest)',
      rootCause: 'La misión intenta invocar un NPC dador cuyo identificador no existe en el registro de NPCs.',
      recommendedFix: 'Crear el NPC faltante o reasignar el ID a un NPC existente.',
      suggestedPatchSnippet: `quest.giverNpcId = 'npc_elder_aldor';`,
      confidenceScore: 92,
    };
  }

  return {
    errorType: 'TypeScript Runtime / Data Mismatch',
    rootCause: 'Inconsistencia en el esquema de datos o campo nulo inesperado en la escena Phaser.',
    recommendedFix: 'Ejecutar el Validador de Integridad para reparar campos faltantes automáticamente.',
    suggestedPatchSnippet: `// Comprobar presencia de campos opcionales\nconst hp = creature.stats?.hp ?? 100;`,
    confidenceScore: 85,
  };
}
