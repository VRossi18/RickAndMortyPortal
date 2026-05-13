import { describe, expect, it } from 'vitest';
import {
   BASE_SCORE,
   POINT_POOL_MAX,
   computeSpent,
   computeTotals,
   defaultScores,
   remainingPoints,
   totalExceedsWarning,
} from './characterCreationMath';
import { racialBonusMap, getRaceById } from './races';

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
      expect(computeTotals(scores, bonus).str).toBe(14);
   });

   it('parasites add +1 to every ability', () => {
      const scores = defaultScores();
      const bonus = racialBonusMap(getRaceById('parasites'));
      const t = computeTotals(scores, bonus);
      expect(t.str).toBe(BASE_SCORE + 1);
      expect(t.int).toBe(BASE_SCORE + 1);
   });

   it('totalExceedsWarning flags totals above threshold', () => {
      const totals = { str: 18, dex: 8, con: 8, int: 8, cha: 8 };
      const flags = totalExceedsWarning(totals);
      expect(flags.str).toBe(true);
      expect(flags.dex).toBe(false);
   });
});
