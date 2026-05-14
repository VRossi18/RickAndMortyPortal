import { describe, expect, it } from 'vitest';
import {
   CHARACTER_SHEET_EXPORT_SCHEMA_VERSION,
   buildCharacterSheetExport,
} from '../../../components/rpg/buildCharacterSheetExport';
import {
   computeSpent,
   remainingPoints,
   computeTotals,
   totalExceedsWarning,
   POINT_POOL_MAX,
} from '../../../components/rpg/characterCreationMath';
import {
   drawbackModifierMap,
   getRaceById,
   mergeAbilityDeltas,
   racialBonusMap,
} from '../../../components/rpg/races';
import type { AbilityScores } from '../../../components/rpg/types';
import { ABILITY_IDS } from '../../../components/rpg/types';

function mockT(key: string): string {
   if (key === 'rpg.subtitle') {
      return 'RULES_SUMMARY';
   }
   if (key === 'rpg.llmInstructions') {
      return 'LLM_HINT';
   }
   const df = key.match(
      /^rpg\.derivedFormulas\.(hitPoints|physicalAttack|magicalAttack|socialPool|dexSpeed|stealth)$/,
   );
   if (df) {
      return `FORMULA_${df[1]}`;
   }
   if (key === 'rpg.human.playstyleTitle') {
      return 'HUMAN_PLAY_TITLE';
   }
   if (key === 'rpg.human.playstyleSummary') {
      return 'HUMAN_PLAY_SUMMARY';
   }
   const m = key.match(/^rpg\.abilities\.(str|dex|con|int|cha)$/);
   if (m) {
      return `ABILITY_${m[1]!.toUpperCase()}`;
   }
   const skillKey = key.match(
      /^rpg\.races\.(ciancans|cronenbergs|birdPeople|chuds|cromulons|parasites|gearPeople|gromflomites|humans)\.skills\.(attack1|attack2|support|item)\.(name|summary|outOfCombat)$/,
   );
   if (skillKey) {
      return `SKILL_${skillKey[1]}_${skillKey[2]}_${skillKey[3]}`;
   }
   const raceMatch = key.match(
      /^rpg\.races\.(ciancans|cronenbergs|birdPeople|chuds|cromulons|parasites|gearPeople|gromflomites|humans)\.(name|visualDescription|drawbackDescription)$/,
   );
   if (raceMatch) {
      return `RACE_${raceMatch[1]}_${raceMatch[2]}`;
   }
   return key;
}

function stateForBirdPeople(scores: AbilityScores) {
   const selectedRaceId = 'birdPeople' as const;
   const selectedRace = getRaceById(selectedRaceId);
   const humanBonusChoices = ['str', 'dex'] as const;
   const sheetRacialBonus = racialBonusMap(selectedRace);
   const sheetDrawback = drawbackModifierMap(selectedRace);
   const racialBonus = mergeAbilityDeltas(sheetRacialBonus, sheetDrawback);
   const spent = computeSpent(scores);
   const remaining = remainingPoints(scores);
   const totals = computeTotals(scores, racialBonus);
   const highTotalFlags = totalExceedsWarning(totals);
   return {
      selectedRaceId,
      selectedRace,
      scores,
      sheetRacialBonus,
      sheetDrawback,
      spent,
      remaining,
      totals,
      highTotalFlags,
      humanBonusChoices,
   };
}

function stateForHumans(
   scores: AbilityScores,
   humanBonusChoices: ['int', 'cha'] | ['str', 'dex'],
) {
   const selectedRaceId = 'humans' as const;
   const selectedRace = getRaceById(selectedRaceId);
   let sheetRacialBonus = racialBonusMap(selectedRace);
   const [a, b] = humanBonusChoices;
   sheetRacialBonus = {
      ...sheetRacialBonus,
      [a]: sheetRacialBonus[a] + 1,
      [b]: sheetRacialBonus[b] + 1,
   };
   const sheetDrawback = drawbackModifierMap(selectedRace);
   const racialBonus = mergeAbilityDeltas(sheetRacialBonus, sheetDrawback);
   const spent = computeSpent(scores);
   const remaining = remainingPoints(scores);
   const totals = computeTotals(scores, racialBonus);
   const highTotalFlags = totalExceedsWarning(totals);
   return {
      selectedRaceId,
      selectedRace,
      scores,
      sheetRacialBonus,
      sheetDrawback,
      spent,
      remaining,
      totals,
      highTotalFlags,
      humanBonusChoices,
   };
}

describe('buildCharacterSheetExport', () => {
   it('exports birdPeople with schema 3, derived stats, race.skills, stealth, and abilities', () => {
      const scores: AbilityScores = { str: 10, dex: 15, con: 10, int: 10, cha: 10 };
      const s = stateForBirdPeople(scores);
      const json = buildCharacterSheetExport(mockT, {
         exportedAt: '2026-01-01T00:00:00.000Z',
         locale: 'en',
         generator: 'test',
         characterName: 'Test Hero',
         ...s,
      });

      expect(json.character.name).toBe('Test Hero');
      expect(json.meta.schemaVersion).toBe(CHARACTER_SHEET_EXPORT_SCHEMA_VERSION);
      expect(json.meta.exportedAt).toBe('2026-01-01T00:00:00.000Z');
      expect(json.meta.locale).toBe('en');
      expect(json.meta.generator).toBe('test');
      expect(json.meta.llmInstructions).toBe('LLM_HINT');
      expect(json.meta.app).toBe('rick-morty-portal');

      expect(json.rules.summary).toBe('RULES_SUMMARY');
      expect(json.rules.pointPoolMax).toBe(POINT_POOL_MAX);
      expect(json.rules.derivedFormulas.hitPoints).toBe('FORMULA_hitPoints');
      expect(json.rules.derivedFormulas.dexSpeed).toBe('FORMULA_dexSpeed');
      expect(json.rules.derivedFormulas.stealth).toBe('FORMULA_stealth');

      expect(json.pointPool.spent).toBe(s.spent);
      expect(json.pointPool.remaining).toBe(s.remaining);
      expect(json.pointPool.max).toBe(POINT_POOL_MAX);

      expect(json.race.id).toBe('birdPeople');
      expect(json.race.racialModifiers).toEqual({ str: 0, dex: 3, con: 0, int: 0, cha: 0 });
      expect(json.race.drawbackModifiers).toEqual({ str: -1, dex: 0, con: -1, int: 0, cha: -1 });
      expect(json.race.skills.attacks[0]!.id).toBe('attack1');
      expect(json.race.skills.attacks[0]!.name).toBe('SKILL_birdPeople_attack1_name');
      expect(json.race.skills.item.outOfCombat).toBe('SKILL_birdPeople_item_outOfCombat');
      expect(json.human).toBeUndefined();

      expect(json.derived.hitPointsMax).toBe(19);
      expect(json.derived.physicalAttackRating).toBe(9);
      expect(json.derived.magicalAttackRating).toBe(10);
      expect(json.derived.socialInfluencePool).toBe(9);
      expect(json.derived.extraStrikesBeforeEnemy).toBe(3);
      expect(json.derived.dexSpeedTier).toBe(3);
      expect(json.derived.stealthRating).toBe(20);
      expect(json.derived.stealthRacialBonus).toBe(2);

      expect(json.abilities).toHaveLength(5);
      const dexRow = json.abilities.find((a) => a.id === 'dex')!;
      expect(dexRow.base).toBe(15);
      expect(dexRow.racialBonus).toBe(3);
      expect(dexRow.drawback).toBe(0);
      expect(dexRow.total).toBe(18);
      expect(dexRow.d20Modifier).toBe(4);
      expect(dexRow.highTotalWarning).toBe(true);

      const intRow = json.abilities.find((a) => a.id === 'int')!;
      expect(intRow.racialBonus).toBe(0);
      expect(intRow.drawback).toBe(0);
      expect(intRow.total).toBe(10);
      expect(intRow.d20Modifier).toBe(0);
   });

   it('includes human bonusSlots and playstyle when race is humans', () => {
      const scores: AbilityScores = { str: 8, dex: 8, con: 8, int: 8, cha: 8 };
      const s = stateForHumans(scores, ['int', 'cha']);
      const json = buildCharacterSheetExport(mockT, {
         exportedAt: '2026-02-02T12:00:00.000Z',
         locale: 'pt',
         characterName: '  Human PC  ',
         ...s,
      });

      expect(json.character.name).toBe('Human PC');
      expect(json.human?.bonusSlots).toEqual([
         { abilityId: 'int', abilityName: 'ABILITY_INT' },
         { abilityId: 'cha', abilityName: 'ABILITY_CHA' },
      ]);
      expect(json.human?.playstyle).toEqual({
         title: 'HUMAN_PLAY_TITLE',
         summary: 'HUMAN_PLAY_SUMMARY',
      });
      const intRow = json.abilities.find((a) => a.id === 'int')!;
      expect(intRow.racialBonus).toBe(1);
      expect(intRow.total).toBe(9);
      expect(intRow.d20Modifier).toBe(-1);
      expect(json.derived.stealthRating).toBe(8);
      expect(json.derived.stealthRacialBonus).toBe(0);
   });

   it('orders abilities as ABILITY_IDS', () => {
      const scores: AbilityScores = { str: 12, dex: 8, con: 8, int: 8, cha: 8 };
      const s = stateForBirdPeople(scores);
      const json = buildCharacterSheetExport(mockT, {
         exportedAt: '2026-01-01T00:00:00.000Z',
         locale: 'en',
         characterName: 'Bird',
         ...s,
      });
      expect(json.abilities.map((a) => a.id)).toEqual([...ABILITY_IDS]);
   });
});
