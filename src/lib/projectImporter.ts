import {
  ProjectContext,
  Creature,
  NPC,
  Quest,
  Biome,
  Item,
  Ability,
  Dungeon,
  Faction,
  Shop,
  Region,
} from '../types/aurora';
import { validateAuroraProject } from './auroraValidator';

export interface ImportParsedResult {
  success: boolean;
  importedContext: ProjectContext;
  summary: {
    regions: number;
    biomes: number;
    creatures: number;
    npcs: number;
    items: number;
    abilities: number;
    quests: number;
    dungeons: number;
    factions: number;
    shops: number;
    totalEntities: number;
    warnings: number;
    errors: number;
  };
  detectedFiles: string[];
  logMessages: string[];
  validationErrors: string[];
}

/**
 * Intelligent parser that extracts JavaScript/TypeScript object literals or standard JSON
 */
export function parseTypeScriptOrJSONContent(rawContent: string, fileName?: string): any {
  const trimmed = rawContent.trim();

  // 1. Direct JSON parse
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      return JSON.parse(trimmed);
    } catch {
      // Continue to regex / TS extraction
    }
  }

  // 2. Remove TS comments
  const cleanContent = trimmed
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*/g, '');

  // 3. Look for "export const NAME = [ ... ] as const;" or "export default [ ... ]"
  // Match array or object assignments
  const exportArrayMatch = cleanContent.match(/export\s+(?:const|let|var)\s+\w+(?:\s*:\s*[\w<>\[\]\s]+)?\s*=\s*(\[[\s\S]*?\])(?:\s+as\s+const)?;/);
  if (exportArrayMatch && exportArrayMatch[1]) {
    try {
      // Convert relaxed JS object syntax to JSON
      const relaxed = exportArrayMatch[1]
        .replace(/([a-zA-Z0-9_$]+)\s*:/g, '"$1":') // quote unquoted keys
        .replace(/,\s*([\]}])/g, '$1') // remove trailing commas
        .replace(/'([^']*)'/g, '"$1"'); // replace single quotes with double
      return JSON.parse(relaxed);
    } catch {
      // Try loose JS eval if safe
      try {
        const fn = new Function(`return ${exportArrayMatch[1]}`);
        return fn();
      } catch (e) {
        console.warn(`Loose TS array parse fallback failed for ${fileName}:`, e);
      }
    }
  }

  const exportObjectMatch = cleanContent.match(/export\s+(?:const|let|var)\s+\w+(?:\s*:\s*[\w<>\[\]\s]+)?\s*=\s*(\{[\s\S]*?\})(?:\s+as\s+const)?;/);
  if (exportObjectMatch && exportObjectMatch[1]) {
    try {
      const relaxed = exportObjectMatch[1]
        .replace(/([a-zA-Z0-9_$]+)\s*:/g, '"$1":')
        .replace(/,\s*([\]}])/g, '$1')
        .replace(/'([^']*)'/g, '"$1"');
      return JSON.parse(relaxed);
    } catch {
      try {
        const fn = new Function(`return ${exportObjectMatch[1]}`);
        return fn();
      } catch (e) {
        console.warn(`Loose TS object parse fallback failed for ${fileName}:`, e);
      }
    }
  }

  // 4. Look for raw array or object inside code
  const firstBracket = trimmed.indexOf('[');
  const lastBracket = trimmed.lastIndexOf(']');
  if (firstBracket !== -1 && lastBracket > firstBracket) {
    const arraySlice = trimmed.substring(firstBracket, lastBracket + 1);
    try {
      const fn = new Function(`return ${arraySlice}`);
      return fn();
    } catch {}
  }

  const firstBrace = trimmed.indexOf('{');
  const lastBrace = trimmed.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    const objectSlice = trimmed.substring(firstBrace, lastBrace + 1);
    try {
      const fn = new Function(`return ${objectSlice}`);
      return fn();
    } catch {}
  }

  throw new Error(`No se pudo interpretar el archivo como JSON o constante TypeScript exportada.`);
}

export interface RawFileInput {
  name: string;
  content: string;
}

/**
 * Builds a complete ProjectContext by parsing an array of raw files (JSON, TypeScript, etc.)
 */
export function importAuroraProjectFiles(
  files: RawFileInput[],
  baseContext: ProjectContext,
  mode: 'replace' | 'merge' = 'replace'
): ImportParsedResult {
  const logs: string[] = [];
  const detectedFiles: string[] = [];
  
  const targetContext: ProjectContext = mode === 'merge'
    ? JSON.parse(JSON.stringify(baseContext))
    : {
        regions: [],
        biomes: [],
        creatures: [],
        npcs: [],
        quests: [],
        items: [],
        abilities: [],
        dungeons: [],
        factions: [],
        shops: [],
        gameRules: baseContext.gameRules,
      };

  const mergeUnique = (targetList: any[], newItems: any[]) => {
    if (!Array.isArray(newItems)) return;
    newItems.forEach((item) => {
      if (item && item.id) {
        const existingIdx = targetList.findIndex((x) => x.id === item.id);
        if (existingIdx >= 0) {
          targetList[existingIdx] = item; // overwrite existing with same ID
        } else {
          targetList.push(item);
        }
      }
    });
  };

  for (const file of files) {
    try {
      const parsed = parseTypeScriptOrJSONContent(file.content, file.name);
      detectedFiles.push(file.name);

      if (!parsed) continue;

      // Case A: Full bundle object
      if (parsed.creatures || parsed.regions || parsed.biomes || parsed.npcs || parsed.quests) {
        if (parsed.regions) mergeUnique(targetContext.regions, parsed.regions);
        if (parsed.biomes) mergeUnique(targetContext.biomes, parsed.biomes);
        if (parsed.creatures) mergeUnique(targetContext.creatures, parsed.creatures);
        if (parsed.npcs) mergeUnique(targetContext.npcs, parsed.npcs);
        if (parsed.quests) mergeUnique(targetContext.quests, parsed.quests);
        if (parsed.items) mergeUnique(targetContext.items, parsed.items);
        if (parsed.abilities) mergeUnique(targetContext.abilities, parsed.abilities);
        if (parsed.dungeons) mergeUnique(targetContext.dungeons, parsed.dungeons);
        if (parsed.factions) mergeUnique(targetContext.factions, parsed.factions);
        if (parsed.shops) mergeUnique(targetContext.shops, parsed.shops);
        if (parsed.gameRules) targetContext.gameRules = parsed.gameRules;
        logs.push(`Paquete principal detectado en "${file.name}"`);
        continue;
      }

      // Case B: Array of entities (detect by structure or file name)
      if (Array.isArray(parsed)) {
        if (parsed.length === 0) continue;
        const sample = parsed[0];
        const lowerName = file.name.toLowerCase();

        if (sample.behavior !== undefined || sample.category !== undefined || lowerName.includes('creature')) {
          mergeUnique(targetContext.creatures, parsed);
          logs.push(`Detectadas ${parsed.length} criaturas en "${file.name}"`);
        } else if (sample.role !== undefined || sample.dialogues !== undefined || lowerName.includes('npc')) {
          mergeUnique(targetContext.npcs, parsed);
          logs.push(`Detectados ${parsed.length} NPCs en "${file.name}"`);
        } else if (sample.objectives !== undefined || lowerName.includes('quest')) {
          mergeUnique(targetContext.quests, parsed);
          logs.push(`Detectadas ${parsed.length} misiones en "${file.name}"`);
        } else if (sample.temperature !== undefined || sample.ambientLighting !== undefined || lowerName.includes('biome')) {
          mergeUnique(targetContext.biomes, parsed);
          logs.push(`Detectados ${parsed.length} biomas en "${file.name}"`);
        } else if (sample.power !== undefined || sample.aoe2D5 !== undefined || lowerName.includes('abilit')) {
          mergeUnique(targetContext.abilities, parsed);
          logs.push(`Detectadas ${parsed.length} habilidades en "${file.name}"`);
        } else if (sample.value !== undefined || sample.statsModifier !== undefined || lowerName.includes('item')) {
          mergeUnique(targetContext.items, parsed);
          logs.push(`Detectados ${parsed.length} objetos en "${file.name}"`);
        } else if (sample.elevationRange !== undefined || lowerName.includes('region')) {
          mergeUnique(targetContext.regions, parsed);
          logs.push(`Detectadas ${parsed.length} regiones en "${file.name}"`);
        } else {
          // generic fallback: check if items have IDs
          mergeUnique(targetContext.items, parsed);
        }
        continue;
      }

      // Case C: Single entity object
      if (typeof parsed === 'object' && parsed.id) {
        if (parsed.behavior !== undefined || parsed.stats !== undefined) {
          mergeUnique(targetContext.creatures, [parsed]);
          logs.push(`Criatura individual detectada: "${parsed.name || parsed.id}"`);
        } else if (parsed.role !== undefined || parsed.dialogues !== undefined) {
          mergeUnique(targetContext.npcs, [parsed]);
          logs.push(`NPC individual detectado: "${parsed.name || parsed.id}"`);
        } else if (parsed.objectives !== undefined) {
          mergeUnique(targetContext.quests, [parsed]);
          logs.push(`Misión individual detectada: "${parsed.title || parsed.id}"`);
        } else if (parsed.temperature !== undefined) {
          mergeUnique(targetContext.biomes, [parsed]);
          logs.push(`Bioma individual detectado: "${parsed.name || parsed.id}"`);
        } else if (parsed.power !== undefined) {
          mergeUnique(targetContext.abilities, [parsed]);
          logs.push(`Habilidad individual detectada: "${parsed.name || parsed.id}"`);
        } else if (parsed.value !== undefined) {
          mergeUnique(targetContext.items, [parsed]);
          logs.push(`Objeto individual detectado: "${parsed.name || parsed.id}"`);
        } else if (parsed.elevationRange !== undefined) {
          mergeUnique(targetContext.regions, [parsed]);
          logs.push(`Región individual detectada: "${parsed.name || parsed.id}"`);
        }
      }
    } catch (err: any) {
      logs.push(`Aviso en archivo "${file.name}": ${err.message}`);
    }
  }

  // Run validator on imported context
  const validation = validateAuroraProject(targetContext);
  const validationErrors = validation.errors.map((e) => `[${e.severity.toUpperCase()}] ${e.entityName} (${e.entityId}): ${e.message}`);

  const totalEntities =
    targetContext.regions.length +
    targetContext.biomes.length +
    targetContext.creatures.length +
    targetContext.npcs.length +
    targetContext.items.length +
    targetContext.abilities.length +
    targetContext.quests.length +
    targetContext.dungeons.length +
    targetContext.factions.length +
    targetContext.shops.length;

  return {
    success: totalEntities > 0,
    importedContext: targetContext,
    summary: {
      regions: targetContext.regions.length,
      biomes: targetContext.biomes.length,
      creatures: targetContext.creatures.length,
      npcs: targetContext.npcs.length,
      items: targetContext.items.length,
      abilities: targetContext.abilities.length,
      quests: targetContext.quests.length,
      dungeons: targetContext.dungeons.length,
      factions: targetContext.factions.length,
      shops: targetContext.shops.length,
      totalEntities,
      warnings: validation.warningCount,
      errors: validation.errorCount,
    },
    detectedFiles,
    logMessages: logs,
    validationErrors,
  };
}
