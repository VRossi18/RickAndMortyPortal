import { describe, expect, it } from 'vitest';
import {
   drawbackModifierMap,
   mergeAbilityDeltas,
   racialBonusMap,
} from '../../../components/rpg/races';
import type { RaceDefinition } from '../../../components/rpg/types';

describe('races modifier helpers', () => {
   const sampleRace: RaceDefinition = {
      id: 'ciancans',
      portraitUrl: '',
      cardClass: '',
      modifiers: { int: 2 },
      drawbackModifiers: { con: -1, int: -1 },
   };

   it('drawbackModifierMap reads drawbackModifiers', () => {
      const d = drawbackModifierMap(sampleRace);
      expect(d.int).toBe(-1);
      expect(d.con).toBe(-1);
      expect(d.str).toBe(0);
   });

   it('drawbackModifierMap returns zeros when drawbackModifiers omitted', () => {
      const r: RaceDefinition = {
         id: 'humans',
         portraitUrl: '',
         cardClass: '',
         modifiers: {},
      };
      expect(drawbackModifierMap(r).cha).toBe(0);
   });

   it('mergeAbilityDeltas sums per ability', () => {
      const racial = racialBonusMap(sampleRace);
      const drawback = drawbackModifierMap(sampleRace);
      const merged = mergeAbilityDeltas(racial, drawback);
      expect(merged.int).toBe(1);
      expect(merged.con).toBe(-1);
      expect(merged.str).toBe(0);
   });
});
