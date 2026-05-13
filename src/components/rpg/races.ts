import { ABILITY_IDS } from './types';
import type { AbilityId, RaceDefinition, RaceId } from './types';

export const RACES: readonly RaceDefinition[] = [
   {
      id: 'ciancans',
      portraitUrl: 'https://rickandmortyapi.com/api/character/avatar/270.jpeg',
      cardClass: 'bg-gradient-to-br from-violet-600 to-indigo-900 opacity-90',
      modifiers: { int: 2 },
      drawbackModifiers: { str: -1, cha: -1 },
   },
   {
      id: 'cronenbergs',
      portraitUrl: 'https://rickandmortyapi.com/api/character/avatar/82.jpeg',
      cardClass: 'bg-gradient-to-br from-rose-600 to-red-950 opacity-90',
      modifiers: { str: 2 },
      drawbackModifiers: { int: -1, dex: -1, con: -1, cha: -1 },
   },
   {
      id: 'birdPeople',
      portraitUrl: 'https://rickandmortyapi.com/api/character/avatar/47.jpeg',
      cardClass: 'bg-gradient-to-br from-sky-500 to-blue-900 opacity-90',
      modifiers: { dex: 2 },
      drawbackModifiers: { int: -1, con: -1 },
   },
   {
      id: 'chuds',
      portraitUrl: 'https://rickandmortyapi.com/api/character/avatar/729.jpeg',
      cardClass: 'bg-gradient-to-br from-amber-600 to-stone-900 opacity-90',
      modifiers: { con: 2 },
      drawbackModifiers: { int: -1, cha: -1 },
   },
   {
      id: 'cromulons',
      portraitUrl: 'https://rickandmortyapi.com/api/character/avatar/24.jpeg',
      cardClass: 'bg-gradient-to-br from-fuchsia-500 to-purple-950 opacity-90',
      modifiers: { cha: 2 },
      drawbackModifiers: { str: -1, dex: -1 },
   },
   {
      id: 'parasites',
      portraitUrl: 'https://rickandmortyapi.com/api/character/avatar/259.jpeg',
      cardClass: 'bg-gradient-to-br from-emerald-600 to-slate-900 opacity-90',
      modifiers: { dex: 1, con: 1, int: 1, cha: 1 },
      drawbackModifiers: { str: -2 },
   },
   {
      id: 'gearPeople',
      portraitUrl: 'https://rickandmortyapi.com/api/character/avatar/282.jpeg',
      cardClass: 'bg-gradient-to-br from-amber-700 via-amber-600 to-stone-700 opacity-90',
      modifiers: { int: 2 },
      drawbackModifiers: { str: -1, dex: -1 },
   },
   {
      id: 'gromflomites',
      portraitUrl: 'https://rickandmortyapi.com/api/character/avatar/150.jpeg',
      cardClass: 'bg-gradient-to-br from-sky-600 via-blue-700 to-indigo-950 opacity-90',
      modifiers: { dex: 1, con: 1 },
      drawbackModifiers: { str: -1, int: -1 },
   },
   {
      id: 'humans',
      portraitUrl: 'https://rickandmortyapi.com/api/character/avatar/2.jpeg',
      cardClass: 'bg-gradient-to-br from-slate-600 via-slate-700 to-slate-900 opacity-90',
      modifiers: {},
      drawbackModifiers: {},
   },
] as const;

const byId = Object.fromEntries(RACES.map((r) => [r.id, r])) as Record<RaceId, RaceDefinition>;

export function getRaceById(id: RaceId): RaceDefinition {
   return byId[id];
}

export function defaultRaceId(): RaceId {
   return RACES[0]!.id;
}

/** Racial bonus per ability (0 if none). */
export function racialBonusMap(race: RaceDefinition | null): Record<AbilityId, number> {
   const base: Record<AbilityId, number> = { str: 0, dex: 0, con: 0, int: 0, cha: 0 };
   if (!race) {
      return base;
   }
   for (const k of Object.keys(race.modifiers) as AbilityId[]) {
      const v = race.modifiers[k];
      if (typeof v === 'number') {
         base[k] = v;
      }
   }
   return base;
}

/** Drawback penalties per ability (0 if none). */
export function drawbackModifierMap(race: RaceDefinition | null): Record<AbilityId, number> {
   const base: Record<AbilityId, number> = { str: 0, dex: 0, con: 0, int: 0, cha: 0 };
   if (!race?.drawbackModifiers) {
      return base;
   }
   for (const k of Object.keys(race.drawbackModifiers) as AbilityId[]) {
      const v = race.drawbackModifiers[k];
      if (typeof v === 'number') {
         base[k] = v;
      }
   }
   return base;
}

/** Sum two per-ability deltas (racial bonuses + drawbacks + other adjustments). */
export function mergeAbilityDeltas(
   a: Record<AbilityId, number>,
   b: Record<AbilityId, number>,
): Record<AbilityId, number> {
   const out: Record<AbilityId, number> = { str: 0, dex: 0, con: 0, int: 0, cha: 0 };
   for (const id of ABILITY_IDS) {
      out[id] = a[id] + b[id];
   }
   return out;
}
