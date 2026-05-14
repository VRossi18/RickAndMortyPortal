import { describe, expect, it } from 'vitest';
import {
   BASE_SCORE,
   POINT_POOL_MAX,
   computeSpent,
   computeTotals,
   defaultScores,
   remainingPoints,
   totalExceedsWarning,
} from '../../../components/rpg/characterCreationMath';
import { drawbackModifierMap, getRaceById, mergeAbilityDeltas, racialBonusMap } from '../../../components/rpg/races';
import { ABILITY_IDS } from '../../../components/rpg/types';

describe('characterCreationMath', () => {
   it('defaultScores spends zero from pool', () => {
      const s = defaultScores();
      expect(computeSpent(s)).toBe(0);
      expect(remainingPoints(s)).toBe(POINT_POOL_MAX);
   });

   it('computeSpent sums points above base', () => {
      const s = { ...defaultScores(), str: 10, dex: 9 };
      expect(computeSpent(s)).toBe(2 + 1);
      expect(remainingPoints(s)).toBe(POINT_POOL_MAX - 3);
   });

   it('computeTotals adds racial bonuses', () => {
      const scores = { ...defaultScores(), str: 12 };
      const bonus = racialBonusMap(getRaceById('cronenbergs'));
      expect(computeTotals(scores, bonus).str).toBe(15);
   });

   it('computeTotals supports negative per-ability deltas (drawbacks)', () => {
      const scores = defaultScores();
      const bonus = { str: 0, dex: 0, con: 0, int: -1, cha: 0 };
      expect(computeTotals(scores, bonus).int).toBe(BASE_SCORE - 1);
   });

   it('computeTotals uses merged racial + drawback like the character sheet', () => {
      const scores = defaultScores();
      const race = getRaceById('parasites');
      const bonus = mergeAbilityDeltas(racialBonusMap(race), drawbackModifierMap(race));
      const t = computeTotals(scores, bonus);
      for (const id of ABILITY_IDS) {
         expect(t[id]).toBe(BASE_SCORE + bonus[id]);
      }
   });

   it('totalExceedsWarning flags totals above threshold', () => {
      const totals = { str: 18, dex: 8, con: 8, int: 8, cha: 8 };
      const flags = totalExceedsWarning(totals);
      expect(flags.str).toBe(true);
      expect(flags.dex).toBe(false);
   });
});
