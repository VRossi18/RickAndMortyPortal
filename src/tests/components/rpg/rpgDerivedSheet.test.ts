import { describe, expect, it } from 'vitest';
import {
   DERIVED_HP_BASE,
   STEALTH_RACIAL_BONUS,
   buildDerivedSheet,
   extraStrikesBeforeEnemy,
   hitPointsMax,
   stealthRacialBonus,
} from '../../../components/rpg/rpgDerivedSheet';
import type { AbilityScores } from '../../../components/rpg/types';

function totals(partial: Partial<AbilityScores>): AbilityScores {
   return {
      str: 10,
      dex: 10,
      con: 10,
      int: 10,
      cha: 10,
      ...partial,
   };
}

describe('rpgDerivedSheet', () => {
   it('hitPointsMax is monotonic in CON', () => {
      expect(hitPointsMax(totals({ con: 8 }))).toBe(DERIVED_HP_BASE + 8);
      expect(hitPointsMax(totals({ con: 15 }))).toBe(DERIVED_HP_BASE + 15);
      expect(hitPointsMax(totals({ con: 10 }))).toBeLessThan(hitPointsMax(totals({ con: 11 })));
   });

   it('extraStrikesBeforeEnemy uses DEX thresholds 14 / 16 / 18', () => {
      expect(extraStrikesBeforeEnemy(13)).toBe(0);
      expect(extraStrikesBeforeEnemy(14)).toBe(1);
      expect(extraStrikesBeforeEnemy(15)).toBe(1);
      expect(extraStrikesBeforeEnemy(16)).toBe(2);
      expect(extraStrikesBeforeEnemy(17)).toBe(2);
      expect(extraStrikesBeforeEnemy(18)).toBe(3);
      expect(extraStrikesBeforeEnemy(20)).toBe(3);
   });

   it('buildDerivedSheet maps STR, INT, CHA totals to ratings / pool', () => {
      const d = buildDerivedSheet(totals({ str: 12, int: 14, cha: 9, con: 11, dex: 8 }), 'humans');
      expect(d.physicalAttackRating).toBe(12);
      expect(d.magicalAttackRating).toBe(14);
      expect(d.socialInfluencePool).toBe(9);
      expect(d.hitPointsMax).toBe(DERIVED_HP_BASE + 11);
      expect(d.extraStrikesBeforeEnemy).toBe(0);
      expect(d.dexSpeedTier).toBe(0);
      expect(d.stealthRacialBonus).toBe(0);
      expect(d.stealthRating).toBe(8);
   });

   it('buildDerivedSheet ties dex tier to extra strikes', () => {
      expect(buildDerivedSheet(totals({ dex: 16 }), 'humans').dexSpeedTier).toBe(2);
      expect(buildDerivedSheet(totals({ dex: 16 }), 'humans').extraStrikesBeforeEnemy).toBe(2);
   });

   it('stealthRacialBonus for birdPeople and parasites', () => {
      expect(stealthRacialBonus('birdPeople')).toBe(STEALTH_RACIAL_BONUS);
      expect(stealthRacialBonus('parasites')).toBe(STEALTH_RACIAL_BONUS);
      expect(stealthRacialBonus('humans')).toBe(0);
   });

   it('buildDerivedSheet adds stealth racial bonus to DEX total', () => {
      const d = buildDerivedSheet(totals({ dex: 12 }), 'birdPeople');
      expect(d.stealthRating).toBe(12 + STEALTH_RACIAL_BONUS);
      expect(d.stealthRacialBonus).toBe(STEALTH_RACIAL_BONUS);
   });
});
