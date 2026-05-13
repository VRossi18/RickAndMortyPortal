import { useCallback, useMemo, useState } from 'react';
import {
   computeSpent,
   computeTotals,
   defaultScores,
   remainingPoints,
   totalExceedsWarning,
   MAX_SCORE_BEFORE_RACE,
   MIN_SCORE_BEFORE_RACE,
   POINT_POOL_MAX,
} from './characterCreationMath';
import { defaultRaceId, getRaceById, racialBonusMap } from './races';
import type { AbilityId, AbilityScores, RaceId } from './types';

/**
 * Point-buy + race: `scores` are capped at 15 before race (`incrementAbility` /
 * `decrementAbility`); `totals` add the active race’s modifiers on top. Example:
 * Ciancãs grants +2 INT — if `scores.int` is 15, `totals.int` is 17.
 */
export function useCharacterCreation() {
   const [selectedRaceId, setSelectedRaceId] = useState<RaceId>(() => defaultRaceId());
   const [scores, setScores] = useState<AbilityScores>(() => defaultScores());
   const [humanBonusChoices, setHumanBonusChoices] = useState<[AbilityId, AbilityId]>([
      'str',
      'dex',
   ]);

   const selectedRace = useMemo(() => getRaceById(selectedRaceId), [selectedRaceId]);
   const racialBonus = useMemo(() => {
      const base = racialBonusMap(selectedRace);
      if (selectedRaceId !== 'humans') {
         return base;
      }
      const [a, b] = humanBonusChoices;
      return {
         ...base,
         [a]: base[a] + 1,
         [b]: base[b] + 1,
      };
   }, [selectedRace, selectedRaceId, humanBonusChoices]);
   const spent = useMemo(() => computeSpent(scores), [scores]);
   const remaining = useMemo(() => remainingPoints(scores), [scores]);
   const totals = useMemo(() => computeTotals(scores, racialBonus), [scores, racialBonus]);
   const highTotalFlags = useMemo(() => totalExceedsWarning(totals), [totals]);

   const setRace = useCallback((id: RaceId) => {
      setSelectedRaceId(id);
   }, []);

   const setHumanBonusSlot = useCallback((slot: 0 | 1, ability: AbilityId) => {
      setHumanBonusChoices(([first, second]) => {
         const other = slot === 0 ? second : first;
         if (ability === other) {
            return [first, second];
         }
         return slot === 0 ? [ability, second] : [first, ability];
      });
   }, []);

   const incrementAbility = useCallback((id: AbilityId) => {
      setScores((prev) => {
         const current = prev[id];
         if (current >= MAX_SCORE_BEFORE_RACE) {
            return prev;
         }
         const next = { ...prev, [id]: current + 1 };
         if (computeSpent(next) > POINT_POOL_MAX) {
            return prev;
         }
         return next;
      });
   }, []);

   const decrementAbility = useCallback((id: AbilityId) => {
      setScores((prev) => {
         const current = prev[id];
         if (current <= MIN_SCORE_BEFORE_RACE) {
            return prev;
         }
         return { ...prev, [id]: current - 1 };
      });
   }, []);

   return {
      selectedRaceId,
      selectedRace,
      scores,
      racialBonus,
      spent,
      remaining,
      totals,
      highTotalFlags,
      setRace,
      incrementAbility,
      decrementAbility,
      humanBonusChoices,
      setHumanBonusSlot,
   };
}
