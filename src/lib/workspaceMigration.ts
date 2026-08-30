import { ProjectContext } from '../types/aurora';
import { INITIAL_AURORA_PROJECT } from '../data/mockAuroraProject';

export const CURRENT_WORKSPACE_VERSION = '1.0.0';
export const CURRENT_SCHEMA_VERSION = '1.0.0';
export const CURRENT_MANIFEST_VERSION = '1.4.2';

const STORAGE_KEYS = {
  PROJECT_CONTEXT: 'AURORA_WORKSPACE_PROJECT_V1',
  SCHEMA_VERSION: 'AURORA_SCHEMA_VERSION',
  WORKSPACE_VERSION: 'AURORA_WORKSPACE_VERSION',
  HISTORY: 'AURORA_PROJECT_HISTORY_V1',
  PACKAGE_HISTORY: 'AURORA_PACKAGE_HISTORY_V1',
  ONBOARDING_DONE: 'AURORA_ONBOARDING_COMPLETED_V1',
  STYLE_BIBLE: 'AURORA_VISUAL_STYLE_BIBLE_CUSTOM',
};

/**
 * Sanitizes an ID string to prevent code injection, syntax errors, and invalid identifiers.
 */
export function sanitizeIdentifier(input: string): string {
  if (!input) return 'id_' + Math.floor(Math.random() * 10000);
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^_+|_+$/g, '');
}

/**
 * Sanitizes user-entered text by stripping harmful HTML/script tags.
 */
export function sanitizeText(input: string): string {
  if (!input) return '';
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .trim();
}

/**
 * Ensures an imported or loaded ProjectContext conforms to the current schema v1.0.0,
 * filling missing arrays and properties with defensive defaults.
 */
export function migrateProjectContextToV1(rawContext: any): ProjectContext {
  if (!rawContext || typeof rawContext !== 'object') {
    return JSON.parse(JSON.stringify(INITIAL_AURORA_PROJECT));
  }

  const baseline = JSON.parse(JSON.stringify(INITIAL_AURORA_PROJECT));

  return {
    regions: Array.isArray(rawContext.regions) ? rawContext.regions : baseline.regions,
    biomes: Array.isArray(rawContext.biomes) ? rawContext.biomes : baseline.biomes,
    creatures: Array.isArray(rawContext.creatures) ? rawContext.creatures : baseline.creatures,
    npcs: Array.isArray(rawContext.npcs) ? rawContext.npcs : baseline.npcs,
    quests: Array.isArray(rawContext.quests) ? rawContext.quests : baseline.quests,
    items: Array.isArray(rawContext.items) ? rawContext.items : baseline.items,
    abilities: Array.isArray(rawContext.abilities) ? rawContext.abilities : baseline.abilities,
    dungeons: Array.isArray(rawContext.dungeons) ? rawContext.dungeons : baseline.dungeons,
    factions: Array.isArray(rawContext.factions) ? rawContext.factions : baseline.factions,
    shops: Array.isArray(rawContext.shops) ? rawContext.shops : baseline.shops,
    visualAssets: Array.isArray(rawContext.visualAssets) ? rawContext.visualAssets : baseline.visualAssets || [],
    styleBible: rawContext.styleBible || baseline.styleBible,
    decisionLog: Array.isArray(rawContext.decisionLog) ? rawContext.decisionLog : baseline.decisionLog || [],
    gameRules: rawContext.gameRules || baseline.gameRules,
  };
}

/**
 * Safely saves project context to browser storage with version tagging.
 */
export function persistProjectContext(context: ProjectContext): boolean {
  try {
    const payload = JSON.stringify(context);
    localStorage.setItem(STORAGE_KEYS.PROJECT_CONTEXT, payload);
    localStorage.setItem(STORAGE_KEYS.SCHEMA_VERSION, CURRENT_SCHEMA_VERSION);
    localStorage.setItem(STORAGE_KEYS.WORKSPACE_VERSION, CURRENT_WORKSPACE_VERSION);
    return true;
  } catch (err) {
    console.warn('[Aurora Security & Storage] Failed to persist context to localStorage:', err);
    return false;
  }
}

/**
 * Safely loads project context from browser storage, running migration if necessary.
 */
export function loadProjectContext(): ProjectContext {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.PROJECT_CONTEXT);
    if (!stored) {
      return JSON.parse(JSON.stringify(INITIAL_AURORA_PROJECT));
    }
    const parsed = JSON.parse(stored);
    return migrateProjectContextToV1(parsed);
  } catch (err) {
    console.warn('[Aurora Storage] Failed to parse stored workspace, falling back to clean baseline:', err);
    return JSON.parse(JSON.stringify(INITIAL_AURORA_PROJECT));
  }
}

/**
 * Checks if onboarding has been completed.
 */
export function isOnboardingCompleted(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEYS.ONBOARDING_DONE) === 'true';
  } catch {
    return false;
  }
}

/**
 * Marks onboarding as completed or resets it.
 */
export function setOnboardingCompleted(completed: boolean): void {
  try {
    if (completed) {
      localStorage.setItem(STORAGE_KEYS.ONBOARDING_DONE, 'true');
    } else {
      localStorage.removeItem(STORAGE_KEYS.ONBOARDING_DONE);
    }
  } catch (e) {
    console.error('Failed to update onboarding flag:', e);
  }
}

/**
 * Calculates current estimated memory/storage footprint in bytes.
 */
export function calculateStorageFootprint(): number {
  try {
    let total = 0;
    for (let x in localStorage) {
      if (localStorage.hasOwnProperty(x)) {
        total += (localStorage[x].length + x.length) * 2;
      }
    }
    return total;
  } catch {
    return 0;
  }
}
