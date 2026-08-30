import {
  ProjectContext,
  ValidationReport,
  ValidationError,
  Creature,
  NPC,
  Quest,
  Biome,
  Item,
  Ability,
  Dungeon,
  Faction,
  Shop,
} from '../types/aurora';

export function validateAuroraProject(context: ProjectContext): ValidationReport {
  const errors: ValidationError[] = [];

  const creatures = context?.creatures || [];
  const npcs = context?.npcs || [];
  const quests = context?.quests || [];
  const biomes = context?.biomes || [];
  const regions = context?.regions || [];
  const items = context?.items || [];
  const abilities = context?.abilities || [];
  const factions = context?.factions || [];
  const dungeons = context?.dungeons || [];
  const shops = context?.shops || [];

  const creatureIds = new Set(creatures.map((c) => c.id).filter(Boolean));
  const npcIds = new Set(npcs.map((n) => n.id).filter(Boolean));
  const questIds = new Set(quests.map((q) => q.id).filter(Boolean));
  const biomeIds = new Set(biomes.map((b) => b.id).filter(Boolean));
  const regionIds = new Set(regions.map((r) => r.id).filter(Boolean));
  const itemIds = new Set(items.map((i) => i.id).filter(Boolean));
  const abilityIds = new Set(abilities.map((a) => a.id).filter(Boolean));
  const factionIds = new Set(factions.map((f) => f.id).filter(Boolean));

  // Check Duplicate IDs across all entities
  const allIds = new Map<string, string>();
  const checkDuplicateId = (id: string, name: string, entityType: any) => {
    if (!id || id.trim() === '') {
      errors.push({
        id: `err_empty_id_${Math.random()}`,
        entityType,
        entityId: id || 'unknown',
        entityName: name || 'Sin Nombre',
        field: 'id',
        severity: 'error',
        message: `La entidad "${name || 'Desconocida'}" tiene un ID vacío.`,
        suggestedFix: 'Asigna un identificador único en formato snake_case.',
      });
      return;
    }
    if (allIds.has(id)) {
      errors.push({
        id: `err_dup_${id}`,
        entityType,
        entityId: id,
        entityName: name || id,
        field: 'id',
        severity: 'error',
        message: `ID duplicado detectado: "${id}" ya está en uso por ${allIds.get(id)}.`,
        suggestedFix: `Renombra el ID a "${id}_${Math.floor(Math.random() * 1000)}" para garantizar unicidad.`,
        autoFixAction: {
          type: 'replace_field',
          field: 'id',
          newValue: `${id}_v2`,
        },
      });
    } else {
      allIds.set(id, `${entityType} (${name || id})`);
    }
  };

  // 1. Validate Creatures
  creatures.forEach((c) => {
    if (!c) return;
    checkDuplicateId(c.id, c.name, 'creature');

    // Required fields
    if (!c.name || c.name.length < 2) {
      errors.push({
        id: `err_creature_name_${c.id}`,
        entityType: 'creature',
        entityId: c.id,
        entityName: c.name || 'Sin Nombre',
        field: 'name',
        severity: 'error',
        message: `La criatura "${c.id}" no tiene un nombre válido.`,
        suggestedFix: 'Asigna un nombre distintivo para la criatura.',
      });
    }

    // Stats bounds check
    const statSum = (c.stats?.hp || 0) + (c.stats?.attack || 0) + (c.stats?.defense || 0) + (c.stats?.speed || 0);
    if (statSum <= 0) {
      errors.push({
        id: `err_creature_stats_${c.id}`,
        entityType: 'creature',
        entityId: c.id,
        entityName: c.name,
        field: 'stats',
        severity: 'error',
        message: `Las estadísticas de "${c.name}" están vacías o son inválidas (suma: ${statSum}).`,
        suggestedFix: 'Genera una distribución de estadísticas estándar (HP: 70, ATK: 60, DEF: 50, SPD: 60).',
        autoFixAction: {
          type: 'replace_field',
          field: 'stats',
          newValue: { hp: 80, attack: 65, defense: 60, speed: 65, specialAttack: 65, specialDefense: 60 },
        },
      });
    } else if (c.stats.hp > 1200 || c.stats.attack > 600) {
      errors.push({
        id: `warn_creature_stats_high_${c.id}`,
        entityType: 'creature',
        entityId: c.id,
        entityName: c.name,
        field: 'stats',
        severity: 'warning',
        message: `Las estadísticas de "${c.name}" son extremadamente altas (HP: ${c.stats.hp}, ATK: ${c.stats.attack}). Podría romper el equilibrio 2.5D.`,
        suggestedFix: 'Ajusta las estadísticas acordes a su rareza y nivel recomendado.',
      });
    }

    // Habitat / Biomes existence
    if (!c.habitat || c.habitat.length === 0) {
      errors.push({
        id: `warn_creature_nohabitat_${c.id}`,
        entityType: 'creature',
        entityId: c.id,
        entityName: c.name,
        field: 'habitat',
        severity: 'warning',
        message: `"${c.name}" no tiene ningún bioma asignado como hábitat.`,
        suggestedFix: 'Asigna al menos un bioma existente.',
        autoFixAction: {
          type: 'replace_field',
          field: 'habitat',
          newValue: [context.biomes[0]?.id || 'biome_whispering_woods'],
        },
      });
    } else {
      c.habitat.forEach((bId) => {
        if (!biomeIds.has(bId)) {
          errors.push({
            id: `err_creature_bad_biome_${c.id}_${bId}`,
            entityType: 'creature',
            entityId: c.id,
            entityName: c.name,
            field: 'habitat',
            severity: 'error',
            message: `"${c.name}" referencia el bioma inexistente "${bId}".`,
            suggestedFix: `Reemplaza con un bioma existente o crea el bioma "${bId}".`,
            autoFixAction: {
              type: 'replace_field',
              field: 'habitat',
              newValue: c.habitat.map((h) => (h === bId ? context.biomes[0]?.id || 'biome_whispering_woods' : h)),
            },
          });
        }
      });
    }

    // Evolution references
    if (c.evolution && c.evolution.length > 0) {
      c.evolution.forEach((evoId) => {
        if (evoId === c.id) {
          errors.push({
            id: `err_self_evolution_${c.id}`,
            entityType: 'creature',
            entityId: c.id,
            entityName: c.name,
            field: 'evolution',
            severity: 'error',
            message: `"${c.name}" se referencia a sí misma como evolución (bucle infinito).`,
            suggestedFix: 'Elimina el ID propio de la lista de evoluciones.',
            autoFixAction: {
              type: 'replace_field',
              field: 'evolution',
              newValue: c.evolution.filter((e) => e !== c.id),
            },
          });
        } else if (!creatureIds.has(evoId)) {
          errors.push({
            id: `warn_missing_evolution_${c.id}_${evoId}`,
            entityType: 'creature',
            entityId: c.id,
            entityName: c.name,
            field: 'evolution',
            severity: 'warning',
            message: `"${c.name}" evoluciona a "${evoId}", pero esa criatura aún no existe en el proyecto.`,
            suggestedFix: `Genera la criatura "${evoId}" con IA o remueve la referencia.`,
          });
        }
      });
    }

    // 2.5D visual & Y-sorting checks
    if (!c.visual2D5) {
      errors.push({
        id: `err_creature_no_visual2d5_${c.id}`,
        entityType: 'creature',
        entityId: c.id,
        entityName: c.name,
        field: 'visual2D5',
        severity: 'error',
        message: `Faltan las propiedades visuales 2.5D en "${c.name}". Incompatible con Phaser 3 Depth Sorting.`,
        suggestedFix: 'Inicializa las especificaciones 2.5D estándar con anchorX: 0.5, anchorY: 0.9 y collisionBox.',
        autoFixAction: {
          type: 'replace_field',
          field: 'visual2D5',
          newValue: {
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
          },
        },
      });
    } else {
      if (c.visual2D5.anchorY < 0.5 || c.visual2D5.anchorY > 1.0) {
        errors.push({
          id: `warn_anchory_${c.id}`,
          entityType: 'creature',
          entityId: c.id,
          entityName: c.name,
          field: 'visual2D5.anchorY',
          severity: 'warning',
          message: `El anchorY de 2.5D (${c.visual2D5.anchorY}) para "${c.name}" debería estar entre 0.85 y 0.95 para un Y-sorting óptimo en Phaser 3.`,
          suggestedFix: 'Ajusta anchorY a 0.90.',
          autoFixAction: {
            type: 'replace_field',
            field: 'visual2D5.anchorY',
            newValue: 0.9,
          },
        });
      }
    }
  });

  // 2. Validate NPCs
  npcs.forEach((n) => {
    if (!n) return;
    checkDuplicateId(n.id, n.name, 'npc');

    if (!n.dialogues || n.dialogues.length === 0) {
      errors.push({
        id: `warn_npc_no_dialogue_${n.id}`,
        entityType: 'npc',
        entityId: n.id,
        entityName: n.name || n.id,
        field: 'dialogues',
        severity: 'warning',
        message: `El NPC "${n.name || n.id}" no tiene ningún nodo de diálogo configurado.`,
        suggestedFix: 'Agrega al menos un saludo inicial.',
      });
    }

    if (n.location && !biomeIds.has(n.location) && !regionIds.has(n.location)) {
      errors.push({
        id: `err_npc_bad_location_${n.id}`,
        entityType: 'npc',
        entityId: n.id,
        entityName: n.name || n.id,
        field: 'location',
        severity: 'error',
        message: `El NPC "${n.name || n.id}" está ubicado en "${n.location}", que no corresponde a ningún Bioma o Región registrado.`,
        suggestedFix: 'Reubica al NPC en un bioma o región existente.',
      });
    }
  });

  // 3. Validate Quests
  quests.forEach((q) => {
    if (!q) return;
    checkDuplicateId(q.id, q.title, 'quest');

    if (q.relatedNpcId && !npcIds.has(q.relatedNpcId)) {
      errors.push({
        id: `err_quest_bad_npc_${q.id}`,
        entityType: 'quest',
        entityId: q.id,
        entityName: q.title || q.id,
        field: 'relatedNpcId',
        severity: 'error',
        message: `La misión "${q.title || q.id}" referencia al NPC inexistente "${q.relatedNpcId}".`,
        suggestedFix: `Vincula la misión a un NPC existente como "${npcs[0]?.id || 'npc_default'}".`,
        autoFixAction: {
          type: 'replace_field',
          field: 'relatedNpcId',
          newValue: npcs[0]?.id || 'npc_elder_thorne',
        },
      });
    }

    if (!q.objectives || q.objectives.length === 0) {
      errors.push({
        id: `err_quest_no_objectives_${q.id}`,
        entityType: 'quest',
        entityId: q.id,
        entityName: q.title || q.id,
        field: 'objectives',
        severity: 'error',
        message: `La misión "${q.title || q.id}" no tiene objetivos asignados.`,
        suggestedFix: 'Crea al menos un objetivo de exploración, combate o recolección.',
      });
    }

    // Check reward items
    if (q.rewards?.items) {
      q.rewards.items.forEach((itemReward) => {
        if (!itemIds.has(itemReward.itemId)) {
          errors.push({
            id: `warn_quest_bad_reward_item_${q.id}_${itemReward.itemId}`,
            entityType: 'quest',
            entityId: q.id,
            entityName: q.title || q.id,
            field: 'rewards.items',
            severity: 'warning',
            message: `La recompensa de "${q.title || q.id}" incluye el ítem desconocido "${itemReward.itemId}".`,
            suggestedFix: 'Crea el ítem en la base de datos o sustitúyelo por uno existente.',
          });
        }
      });
    }
  });

  // 4. Validate Biomes
  biomes.forEach((b) => {
    if (!b) return;
    checkDuplicateId(b.id, b.name, 'biome');

    if (b.regionId && !regionIds.has(b.regionId)) {
      errors.push({
        id: `err_biome_bad_region_${b.id}`,
        entityType: 'biome',
        entityId: b.id,
        entityName: b.name || b.id,
        field: 'regionId',
        severity: 'error',
        message: `El bioma "${b.name || b.id}" está asignado a la región inexistente "${b.regionId}".`,
        suggestedFix: `Reasigna a una región existente como "${regions[0]?.id || 'region_default'}".`,
        autoFixAction: {
          type: 'replace_field',
          field: 'regionId',
          newValue: regions[0]?.id || 'region_whispering_forest',
        },
      });
    }

    // Check encounter table creatures
    b.encounterTable?.forEach((enc) => {
      if (!creatureIds.has(enc.creatureId)) {
        errors.push({
          id: `err_biome_enc_creature_${b.id}_${enc.creatureId}`,
          entityType: 'biome',
          entityId: b.id,
          entityName: b.name || b.id,
          field: 'encounterTable',
          severity: 'error',
          message: `La tabla de encuentros de "${b.name || b.id}" contiene la criatura no registrada "${enc.creatureId}".`,
          suggestedFix: `Genera la criatura "${enc.creatureId}" o elimínala de la tabla de encuentros.`,
        });
      }
    });
  });

  // 5. Validate Items
  items.forEach((i) => {
    if (!i) return;
    checkDuplicateId(i.id, i.name, 'item');
    if (i.value !== undefined && i.value < 0) {
      errors.push({
        id: `err_item_negative_val_${i.id}`,
        entityType: 'item',
        entityId: i.id,
        entityName: i.name || i.id,
        field: 'value',
        severity: 'error',
        message: `El valor de "${i.name || i.id}" es negativo (${i.value} oro).`,
        suggestedFix: 'Ajusta el valor a 0 o mayor.',
        autoFixAction: {
          type: 'replace_field',
          field: 'value',
          newValue: 10,
        },
      });
    }
  });

  const errorCount = errors.filter((e) => e.severity === 'error').length;
  const warningCount = errors.filter((e) => e.severity === 'warning').length;
  const infoCount = errors.filter((e) => e.severity === 'info').length;
  const totalEntities =
    creatures.length +
    npcs.length +
    quests.length +
    biomes.length +
    items.length +
    abilities.length +
    regions.length;

  const totalChecks = Math.max(1, totalEntities * 4 + 10);
  const healthScore = totalEntities === 0 
    ? 100 
    : Math.max(0, Math.min(100, Math.round(100 - (errorCount * 15 + warningCount * 5))));

  return {
    timestamp: new Date().toISOString(),
    totalEntities,
    errorCount,
    warningCount,
    infoCount,
    healthScore,
    summary: {
      criticalErrors: errorCount,
      warnings: warningCount,
      info: infoCount,
      totalChecks,
    },
    errors,
  };
}

// Auto-fix executor that applies fix actions safely
export function applyAutoFix(context: ProjectContext, error: ValidationError): ProjectContext {
  if (!error.autoFixAction) return context;

  const newContext = JSON.parse(JSON.stringify(context)) as ProjectContext;
  const { entityType, entityId } = error;
  const { field, newValue } = error.autoFixAction;

  const updateEntity = (collection: any[]) => {
    const target = collection.find((item) => item.id === entityId);
    if (target) {
      if (field.includes('.')) {
        const parts = field.split('.');
        let curr = target;
        for (let i = 0; i < parts.length - 1; i++) {
          if (!curr[parts[i]]) curr[parts[i]] = {};
          curr = curr[parts[i]];
        }
        curr[parts[parts.length - 1]] = newValue;
      } else {
        target[field] = newValue;
      }
    }
  };

  switch (entityType) {
    case 'creature':
      updateEntity(newContext.creatures);
      break;
    case 'npc':
      updateEntity(newContext.npcs);
      break;
    case 'quest':
      updateEntity(newContext.quests);
      break;
    case 'biome':
      updateEntity(newContext.biomes);
      break;
    case 'item':
      updateEntity(newContext.items);
      break;
    case 'ability':
      updateEntity(newContext.abilities);
      break;
    case 'dungeon':
      updateEntity(newContext.dungeons);
      break;
    case 'faction':
      updateEntity(newContext.factions);
      break;
    case 'shop':
      updateEntity(newContext.shops);
      break;
    case 'region':
      updateEntity(newContext.regions);
      break;
  }

  return newContext;
}
