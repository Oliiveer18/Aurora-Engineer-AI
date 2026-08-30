import { ProjectContext, DesignRule, RuleComplianceResult } from '../types/aurora';

const RULES_STORAGE_KEY = 'AURORA_DESIGN_RULES_V2';

export const INITIAL_DESIGN_RULES: DesignRule[] = [
  {
    id: 'rule_legendary_level',
    category: 'GAMEPLAY',
    name: 'Restricción de Nivel para Criaturas Legendarias/Míticas',
    ruleText: 'Las criaturas de rareza "legendary" o "mythic" no deben tener nivel recomendado menor a 25 ni aparecer en la región inicial.',
    rationale: 'Evita romper la curva de dificultad y devalorar la experiencia de progresión.',
    severity: 'critical',
    isEnabled: true,
    targetEntities: ['creature'],
  },
  {
    id: 'rule_anchor_compliance',
    category: 'VISUAL',
    name: 'Anclaje Y Estricto para Profundidad 2.5D',
    ruleText: 'Todo sprite de criatura o NPC debe tener anchor.y entre 0.85 y 0.95.',
    rationale: 'Garantiza que el Y-Sorting de Phaser 3 ordene visualmente los objetos sin solapamientos incorrectos.',
    severity: 'critical',
    isEnabled: true,
    targetEntities: ['creature', 'npc'],
  },
  {
    id: 'rule_min_abilities',
    category: 'BALANCE',
    name: 'Cobertura Mínima de Habilidades',
    ruleText: 'Toda criatura debe poseer al menos 2 habilidades y un máximo de 4 habilidades asignadas.',
    rationale: 'Garantiza versatilidad táctica sin sobrecargar la interfaz de batalla.',
    severity: 'warning',
    isEnabled: true,
    targetEntities: ['creature'],
  },
  {
    id: 'rule_quest_npc_link',
    category: 'NARRATIVE',
    name: 'Vínculo Obligatorio de Misiones a Donantes',
    ruleText: 'Toda misión debe tener un giverNpcId asignado a un NPC existente en el proyecto.',
    rationale: 'Previene misiones huérfanas imposibles de iniciar en el mundo de juego.',
    severity: 'critical',
    isEnabled: true,
    targetEntities: ['quest'],
  },
  {
    id: 'rule_biome_diversity',
    category: 'WORLD',
    name: 'Ecosistema Poblado por Bioma',
    ruleText: 'Cada bioma debe contener al menos 2 criaturas nativas asignadas.',
    rationale: 'Evita biomas vacíos y asegura que la exploración sea gratificante.',
    severity: 'warning',
    isEnabled: true,
    targetEntities: ['biome'],
  },
  {
    id: 'rule_typescript_id_syntax',
    category: 'TECHNICAL',
    name: 'Identificadores Sanitizados en Minúsculas',
    ruleText: 'Todos los identificadores de entidades deben seguir la convención snake_case (a-z, 0-9, _).',
    rationale: 'Previene incompatibilidades al generar código TypeScript estático.',
    severity: 'critical',
    isEnabled: true,
  },
];

export function loadDesignRules(): DesignRule[] {
  try {
    const raw = localStorage.getItem(RULES_STORAGE_KEY);
    if (!raw) {
      saveDesignRules(INITIAL_DESIGN_RULES);
      return INITIAL_DESIGN_RULES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_DESIGN_RULES;
  } catch (err) {
    console.warn('[Design Rules] Failed to load rules:', err);
    return INITIAL_DESIGN_RULES;
  }
}

export function saveDesignRules(rules: DesignRule[]): void {
  try {
    localStorage.setItem(RULES_STORAGE_KEY, JSON.stringify(rules));
  } catch (err) {
    console.error('[Design Rules] Failed to save rules:', err);
  }
}

/**
 * Evaluates all active design rules against the current ProjectContext.
 */
export function evaluateDesignRules(
  context: ProjectContext,
  rules: DesignRule[] = loadDesignRules()
): RuleComplianceResult[] {
  const results: RuleComplianceResult[] = [];
  const activeRules = rules.filter((r) => r.isEnabled);

  for (const rule of activeRules) {
    const violations: string[] = [];

    switch (rule.id) {
      case 'rule_legendary_level': {
        context.creatures.forEach((c) => {
          if ((c.rarity === 'legendary' || c.rarity === 'mythic') && c.recommendedLevel < 25) {
            violations.push(`Criatura "${c.name}" (${c.id}) tiene rareza ${c.rarity} pero nivel ${c.recommendedLevel} (< 25).`);
          }
        });
        break;
      }
      case 'rule_anchor_compliance': {
        context.creatures.forEach((c) => {
          const y = c.visual2D5?.anchorY ?? 0.9;
          if (y < 0.85 || y > 0.95) {
            violations.push(`Criatura "${c.name}" tiene anchorY=${y} fuera del rango [0.85 - 0.95].`);
          }
        });
        context.npcs.forEach((n) => {
          const y = n.visual2D5?.anchorY ?? 0.9;
          if (y < 0.85 || y > 0.95) {
            violations.push(`NPC "${n.name}" tiene anchorY=${y} fuera del rango [0.85 - 0.95].`);
          }
        });
        break;
      }
      case 'rule_min_abilities': {
        context.creatures.forEach((c) => {
          const abCount = c.abilities?.length || 0;
          if (abCount < 2) {
            violations.push(`Criatura "${c.name}" posee solo ${abCount} habilidad(es) (mínimo 2).`);
          } else if (abCount > 4) {
            violations.push(`Criatura "${c.name}" posee ${abCount} habilidades (máximo 4 para interfaz táctica).`);
          }
        });
        break;
      }
      case 'rule_quest_npc_link': {
        const npcIds = new Set(context.npcs.map((n) => n.id));
        context.quests.forEach((q) => {
          if (!q.relatedNpcId || !npcIds.has(q.relatedNpcId)) {
            violations.push(`Misión "${q.title}" (${q.id}) donante "${q.relatedNpcId || 'N/A'}" no existe.`);
          }
        });
        break;
      }
      case 'rule_biome_diversity': {
        const creaturesPerBiome: Record<string, number> = {};
        context.biomes.forEach((b) => {
          creaturesPerBiome[b.id] = 0;
        });
        context.creatures.forEach((c) => {
          c.habitat.forEach((h) => {
            if (creaturesPerBiome[h] !== undefined) {
              creaturesPerBiome[h]++;
            }
          });
        });
        Object.entries(creaturesPerBiome).forEach(([bId, count]) => {
          if (count < 2) {
            const bName = context.biomes.find((b) => b.id === bId)?.name || bId;
            violations.push(`Bioma "${bName}" (${bId}) solo cuenta con ${count} criatura(s) nativa(s) (mínimo 2).`);
          }
        });
        break;
      }
      case 'rule_typescript_id_syntax': {
        const invalidPattern = /[^a-z0-9_]/;
        const allEntities = [
          ...context.creatures.map((c) => ({ type: 'Criatura', id: c.id })),
          ...context.npcs.map((n) => ({ type: 'NPC', id: n.id })),
          ...context.quests.map((q) => ({ type: 'Misión', id: q.id })),
          ...context.biomes.map((b) => ({ type: 'Bioma', id: b.id })),
          ...context.items.map((i) => ({ type: 'Ítem', id: i.id })),
        ];
        allEntities.forEach((ent) => {
          if (invalidPattern.test(ent.id)) {
            violations.push(`${ent.type} con ID "${ent.id}" contiene caracteres inválidos para TypeScript.`);
          }
        });
        break;
      }
      default:
        break;
    }

    results.push({
      ruleId: rule.id,
      ruleName: rule.name,
      category: rule.category,
      passed: violations.length === 0,
      severity: rule.severity,
      violationCount: violations.length,
      details: violations,
      fixSuggestion:
        violations.length > 0
          ? `Aplicar corrección automática en Staging para ajustar los ${violations.length} elemento(s) no conformes.`
          : undefined,
    });
  }

  return results;
}
