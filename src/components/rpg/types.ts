export const ABILITY_IDS = ['str', 'dex', 'con', 'int', 'cha'] as const;
export type AbilityId = (typeof ABILITY_IDS)[number];

export const RACE_IDS = [
   'ciancans',
   'cronenbergs',
   'birdPeople',
   'chuds',
   'cromulons',
   'parasites',
   'gearPeople',
   'gromflomites',
   'humans',
] as const;
export type RaceId = (typeof RACE_IDS)[number];

export type AbilityScores = Record<AbilityId, number>;

export interface RaceDefinition {
   id: RaceId;
   /** Official character portrait from the Rick and Morty API (stable CDN URL). */
   portraitUrl: string;
   /** Gradient fallback when the portrait URL fails to load (Tailwind, static for purge). */
   cardClass: string;
   modifiers: Partial<Record<AbilityId, number>>;
   /** Negative ability deltas (e.g. -1 CON). Omitted when the race has no numeric drawback. */
   drawbackModifiers?: Partial<Record<AbilityId, number>>;
}
