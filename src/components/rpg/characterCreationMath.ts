import type { AbilityId, AbilityScores } from './types';
import { ABILITY_IDS } from './types';

/**
 * Point-buy for ability scores:
 * - Each ability starts at `BASE_SCORE` (8).
 * - The player may spend up to `POINT_POOL_MAX` (27) total; `computeSpent` sums
 *   (score − 8) across abilities, so each +1 to a score costs one point from the pool.
 * - No ability may exceed `MAX_SCORE_BEFORE_RACE` (15) before racial bonuses.
 * - Racial bonuses are applied afterward in `computeTotals` (e.g. Ciancãs +2 INT:
 *   bought INT 15 → total INT 17).
 */
export const BASE_SCORE = 8;
export const MIN_SCORE_BEFORE_RACE = 8;
export const MAX_SCORE_BEFORE_RACE = 15;
export const POINT_POOL_MAX = 27;
export const FINAL_SCORE_WARNING_THRESHOLD = 17;

export function computeSpent(scores: AbilityScores): number {
   let spent = 0;
   for (const id of ABILITY_IDS) {
      spent += scores[id] - BASE_SCORE;
   }
   return spent;
}

export function remainingPoints(scores: AbilityScores): number {
   return POINT_POOL_MAX - computeSpent(scores);
}

export function defaultScores(): AbilityScores {
   return { str: BASE_SCORE, dex: BASE_SCORE, con: BASE_SCORE, int: BASE_SCORE, cha: BASE_SCORE };
}

export function computeTotals(
   scores: AbilityScores,
   bonusByAbility: Record<AbilityId, number>,
): AbilityScores {
   const out = { ...scores };
   for (const id of ABILITY_IDS) {
      out[id] = scores[id] + bonusByAbility[id];
   }
   return out;
}

export function totalExceedsWarning(total: AbilityScores): Record<AbilityId, boolean> {
   const out: Record<AbilityId, boolean> = {
      str: false,
      dex: false,
      con: false,
      int: false,
      cha: false,
   };
   for (const id of ABILITY_IDS) {
      out[id] = total[id] > FINAL_SCORE_WARNING_THRESHOLD;
   }
   return out;
}
