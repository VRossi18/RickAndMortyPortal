import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { POINT_POOL_MAX } from './characterCreationMath';
import { useCharacterCreation } from './useCharacterCreation';

describe('useCharacterCreation', () => {
   it('starts at base scores with first race and full pool', () => {
      const { result } = renderHook(() => useCharacterCreation());
      expect(result.current.spent).toBe(0);
      expect(result.current.remaining).toBe(POINT_POOL_MAX);
      expect(result.current.scores.str).toBe(8);
   });

   it('caps single ability at 15 before racial', () => {
      const { result } = renderHook(() => useCharacterCreation());
      act(() => {
         for (let i = 0; i < 20; i++) {
            result.current.incrementAbility('str');
         }
      });
      expect(result.current.scores.str).toBe(15);
      expect(result.current.spent).toBe(7);
   });

   it('does not spend beyond pool across stats', () => {
      const { result } = renderHook(() => useCharacterCreation());
      act(() => {
         for (let i = 0; i < 50; i++) {
            result.current.incrementAbility('str');
            result.current.incrementAbility('dex');
            result.current.incrementAbility('con');
            result.current.incrementAbility('int');
            result.current.incrementAbility('cha');
         }
      });
      expect(result.current.spent).toBeLessThanOrEqual(POINT_POOL_MAX);
   });

   it('does not reset scores when race changes', () => {
      const { result } = renderHook(() => useCharacterCreation());
      act(() => {
         result.current.incrementAbility('str');
         result.current.incrementAbility('str');
      });
      const strBefore = result.current.scores.str;
      act(() => {
         result.current.setRace('parasites');
      });
      expect(result.current.scores.str).toBe(strBefore);
      expect(result.current.selectedRaceId).toBe('parasites');
   });

   it('Ciancãs +2 INT: INT 15 after buy yields total INT 17', () => {
      const { result } = renderHook(() => useCharacterCreation());
      act(() => {
         result.current.setRace('ciancans');
         for (let i = 0; i < 7; i++) {
            result.current.incrementAbility('int');
         }
      });
      expect(result.current.scores.int).toBe(15);
      expect(result.current.totals.int).toBe(17);
   });

   it('Humans: +1 on two chosen attributes applies to racial bonus and totals', () => {
      const { result } = renderHook(() => useCharacterCreation());
      act(() => {
         result.current.setRace('humans');
         result.current.setHumanBonusSlot(0, 'int');
         result.current.setHumanBonusSlot(1, 'cha');
      });
      expect(result.current.racialBonus.int).toBe(1);
      expect(result.current.racialBonus.cha).toBe(1);
      expect(result.current.racialBonus.str).toBe(0);
      expect(result.current.totals.int).toBe(9);
      expect(result.current.totals.cha).toBe(9);
   });

   it('Humans: setHumanBonusSlot ignores picking the same attribute as the other slot', () => {
      const { result } = renderHook(() => useCharacterCreation());
      act(() => {
         result.current.setRace('humans');
         result.current.setHumanBonusSlot(0, 'int');
         result.current.setHumanBonusSlot(1, 'cha');
         result.current.setHumanBonusSlot(1, 'int');
      });
      expect(result.current.humanBonusChoices).toEqual(['int', 'cha']);
   });

   it('recalculates totals when race changes', () => {
      const { result } = renderHook(() => useCharacterCreation());
      act(() => {
         result.current.setRace('cronenbergs');
         result.current.incrementAbility('str');
         result.current.incrementAbility('str');
      });
      expect(result.current.scores.str).toBe(10);
      expect(result.current.totals.str).toBe(12);
      act(() => {
         result.current.setRace('ciancans');
      });
      expect(result.current.scores.str).toBe(10);
      expect(result.current.totals.str).toBe(10);
      expect(result.current.totals.int).toBe(10);
   });

   it('decrement respects floor', () => {
      const { result } = renderHook(() => useCharacterCreation());
      act(() => {
         result.current.decrementAbility('con');
      });
      expect(result.current.scores.con).toBe(8);
   });
});
