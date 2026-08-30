import { ProjectContext, Creature, NPC, Quest, Biome } from '../types/aurora';

export function exportAsJSON(data: any, pretty: boolean = true): string {
  return JSON.stringify(data, null, pretty ? 2 : 0);
}

export function exportAsTypeScriptData(entityName: string, data: any): string {
  const jsonStr = JSON.stringify(data, null, 2);
  return `/**
 * AURORA RPG Content Engine - Generated for Cursor / Phaser 3 + TypeScript
 * Entity: ${entityName}
 * Generated at: ${new Date().toISOString()}
 */

export const ${entityName} = ${jsonStr} as const;

export default ${entityName};
`;
}

export function generatePhaser3SceneIntegration(creature?: Creature, npc?: NPC): string {
  const cName = creature ? creature.name : 'Sylvyn';
  const cId = creature ? creature.id : 'sylvyn';
  const cVisual = creature?.visual2D5 || {
    spriteWidth: 64,
    spriteHeight: 64,
    anchorX: 0.5,
    anchorY: 0.9,
    ySortOffset: 8,
    collisionBox: { width: 36, height: 24, offsetX: 14, offsetY: 36 },
  };

  return `/**
 * AURORA 2.5D Phaser 3 Integration Helper
 * Direct drop-in for your Cursor / Phaser 3 Scene
 */

import Phaser from 'phaser';
import { Creature } from './types/aurora';
import { ${cId}Data } from './data/creatures/${cId}.data';

export class AuroraGameScene extends Phaser.Scene {
  private creaturesGroup!: Phaser.GameObjects.Group;

  constructor() {
    super({ key: 'AuroraGameScene' });
  }

  preload() {
    // 1. Load 2.5D Dimetric Sprite & Shadows
    this.load.spritesheet('${cId}', 'assets/sprites/creatures/${cId}_sheet.png', {
      frameWidth: ${cVisual.spriteWidth},
      frameHeight: ${cVisual.spriteHeight},
    });
    this.load.image('shadow_ellipse', 'assets/fx/shadow_ellipse.png');
  }

  create() {
    // 2. Initialize 2.5D Y-Sorted Creature Group
    this.creaturesGroup = this.add.group({ runChildUpdate: true });

    // 3. Spawn Dimetric Entity with Depth Sorting
    this.spawnCreature2D5(400, 300, ${cId}Data);
  }

  spawnCreature2D5(worldX: number, worldY: number, data: Creature) {
    const visual = data.visual2D5;

    // A. Create Shadow Sprite under the entity
    if (visual.shadow?.enabled) {
      const shadow = this.add.image(worldX, worldY + visual.shadow.offsetY, 'shadow_ellipse');
      shadow.setScale(visual.shadow.radiusX / 16, visual.shadow.radiusY / 8);
      shadow.setAlpha(visual.shadow.opacity);
      shadow.setDepth(worldY - 1); // Placed strictly beneath creature
    }

    // B. Create Dimetric Character Sprite
    const sprite = this.physics.add.sprite(worldX, worldY, data.id);
    sprite.setOrigin(visual.anchorX, visual.anchorY);

    // C. Set 2.5D Depth Sorting (Y-Sorting)
    // In Dimetric RPGs, depth corresponds to the feet/anchor Y coordinate
    sprite.setDepth(worldY + visual.ySortOffset);

    // D. Configure Dimetric Physics Footprint Box
    sprite.body.setSize(visual.collisionBox.width, visual.collisionBox.height);
    sprite.body.setOffset(visual.collisionBox.offsetX, visual.collisionBox.offsetY);

    // E. Add to collection
    this.creaturesGroup.add(sprite);

    // F. Attach RPG Stats Data
    sprite.setData('rpgStats', data.stats);
    sprite.setData('abilities', data.abilities);

    return sprite;
  }

  update() {
    // Continuous 2.5D Y-Sorting for moving entities
    this.creaturesGroup.getChildren().forEach((child) => {
      const sprite = child as Phaser.Physics.Arcade.Sprite;
      const yOffset = sprite.getData('ySortOffset') || 8;
      sprite.setDepth(sprite.y + yOffset);
    });
  }
}
`;
}

export function generateAllTypeScriptBundle(context: ProjectContext): Record<string, string> {
  return {
    'aurora_creatures.ts': exportAsTypeScriptData('AURORA_CREATURES', context.creatures),
    'aurora_npcs.ts': exportAsTypeScriptData('AURORA_NPCS', context.npcs),
    'aurora_quests.ts': exportAsTypeScriptData('AURORA_QUESTS', context.quests),
    'aurora_biomes.ts': exportAsTypeScriptData('AURORA_BIOMES', context.biomes),
    'aurora_items.ts': exportAsTypeScriptData('AURORA_ITEMS', context.items),
    'aurora_abilities.ts': exportAsTypeScriptData('AURORA_ABILITIES', context.abilities),
    'aurora_regions.ts': exportAsTypeScriptData('AURORA_REGIONS', context.regions),
    'aurora_full_bundle.json': exportAsJSON(context),
    'Phaser3Integration.ts': generatePhaser3SceneIntegration(context.creatures[0]),
  };
}
