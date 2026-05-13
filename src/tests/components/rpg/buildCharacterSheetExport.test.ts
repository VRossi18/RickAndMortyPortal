import { describe, expect, it } from 'vitest';
import { buildCharacterSheetExport } from '../../../components/rpg/buildCharacterSheetExport';
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
   const m = key.match(/^rpg\.abilities\.(str|dex|con|int|cha)$/);
   if (m) {
      return `ABILITY_${m[1]!.toUpperCase()}`;
   }
   const raceMatch = key.match(
      /^rpg\.races\.(ciancans|cronenbergs|birdPeople|chuds|cromulons|parasites|gearPeople|gromflomites|humans)\.(name|skill|secondarySkill|visualDescription|drawbackDescription)$/,
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
   it('exports birdPeople with split racial / drawback maps and abilities', () => {
      const scores: AbilityScores = { str: 10, dex: 15, con: 10, int: 10, cha: 10 };
      const s = stateForBirdPeople(scores);
      const json = buildCharacterSheetExport(mockT, {
         exportedAt: '2026-01-01T00:00:00.000Z',
         locale: 'en',
         generator: 'test',
         ...s,
      });

      expect(json.meta.schemaVersion).toBe(1);
      expect(json.meta.exportedAt).toBe('2026-01-01T00:00:00.000Z');
      expect(json.meta.locale).toBe('en');
      expect(json.meta.generator).toBe('test');
      expect(json.meta.llmInstructions).toBe('LLM_HINT');
      expect(json.meta.app).toBe('rick-morty-portal');

      expect(json.rules.summary).toBe('RULES_SUMMARY');
      expect(json.rules.pointPoolMax).toBe(POINT_POOL_MAX);

      expect(json.pointPool.spent).toBe(s.spent);
      expect(json.pointPool.remaining).toBe(s.remaining);
      expect(json.pointPool.max).toBe(POINT_POOL_MAX);

      expect(json.race.id).toBe('birdPeople');
      expect(json.race.racialModifiers).toEqual({ str: 0, dex: 2, con: 0, int: 0, cha: 0 });
      expect(json.race.drawbackModifiers).toEqual({ str: 0, dex: 0, con: -1, int: -1, cha: 0 });
      expect(json.human).toBeUndefined();

      expect(json.abilities).toHaveLength(5);
      const dexRow = json.abilities.find((a) => a.id === 'dex')!;
      expect(dexRow.base).toBe(15);
      expect(dexRow.racialBonus).toBe(2);
      expect(dexRow.drawback).toBe(0);
      expect(dexRow.total).toBe(17);
      expect(dexRow.d20Modifier).toBe(3);
      expect(dexRow.highTotalWarning).toBe(false);

      const intRow = json.abilities.find((a) => a.id === 'int')!;
      expect(intRow.racialBonus).toBe(0);
      expect(intRow.drawback).toBe(-1);
      expect(intRow.total).toBe(9);
      expect(intRow.d20Modifier).toBe(-1);
   });

   it('includes human bonusSlots when race is humans', () => {
      const scores: AbilityScores = { str: 8, dex: 8, con: 8, int: 8, cha: 8 };
      const s = stateForHumans(scores, ['int', 'cha']);
      const json = buildCharacterSheetExport(mockT, {
         exportedAt: '2026-02-02T12:00:00.000Z',
         locale: 'pt',
         ...s,
      });

      expect(json.human?.bonusSlots).toEqual([
         { abilityId: 'int', abilityName: 'ABILITY_INT' },
         { abilityId: 'cha', abilityName: 'ABILITY_CHA' },
      ]);
      const intRow = json.abilities.find((a) => a.id === 'int')!;
      expect(intRow.racialBonus).toBe(1);
      expect(intRow.total).toBe(9);
      expect(intRow.d20Modifier).toBe(-1);
   });

   it('orders abilities as ABILITY_IDS', () => {
      const scores: AbilityScores = { str: 12, dex: 8, con: 8, int: 8, cha: 8 };
      const s = stateForBirdPeople(scores);
      const json = buildCharacterSheetExport(mockT, {
         exportedAt: '2026-01-01T00:00:00.000Z',
         locale: 'en',
         ...s,
      });
      expect(json.abilities.map((a) => a.id)).toEqual([...ABILITY_IDS]);
   });
});
