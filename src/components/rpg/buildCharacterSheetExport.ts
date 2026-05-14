import {
   BASE_SCORE,
   FINAL_SCORE_WARNING_THRESHOLD,
   MAX_SCORE_BEFORE_RACE,
   MIN_SCORE_BEFORE_RACE,
   POINT_POOL_MAX,
} from './characterCreationMath';
import { ABILITY_IDS } from './types';
import type { AbilityId, AbilityScores, RaceDefinition, RaceId } from './types';

export type CharacterSheetExportTranslate = (key: string) => string;

export interface CharacterSheetExportInput {
   exportedAt: string;
   locale: string;
   characterName: string;
   generator?: string;
   schemaVersion?: number;
   selectedRaceId: RaceId;
   selectedRace: RaceDefinition;
   scores: AbilityScores;
   sheetRacialBonus: Record<AbilityId, number>;
   sheetDrawback: Record<AbilityId, number>;
   totals: AbilityScores;
   highTotalFlags: Record<AbilityId, boolean>;
   spent: number;
   remaining: number;
   humanBonusChoices: readonly [AbilityId, AbilityId];
}

export interface CharacterSheetExportMeta {
   schemaVersion: number;
   exportedAt: string;
   locale: string;
   app: string;
   generator?: string;
   llmInstructions: string;
}

export interface CharacterSheetExportRules {
   summary: string;
   baseScore: number;
   minScoreBeforeRace: number;
   maxScoreBeforeRace: number;
   pointPoolMax: number;
   finalScoreWarningThreshold: number;
}

export interface CharacterSheetExportPointPool {
   max: number;
   spent: number;
   remaining: number;
}

export interface CharacterSheetExportRace {
   id: RaceId;
   name: string;
   primarySkill: string;
   secondarySkill: string;
   visualDescription: string;
   drawbackDescription: string;
   portraitUrl: string;
   racialModifiers: Record<AbilityId, number>;
   drawbackModifiers: Record<AbilityId, number>;
}

export interface CharacterSheetExportHumanSlot {
   abilityId: AbilityId;
   abilityName: string;
}

export interface CharacterSheetExportHuman {
   bonusSlots: [CharacterSheetExportHumanSlot, CharacterSheetExportHumanSlot];
}

export interface CharacterSheetExportAbilityRow {
   id: AbilityId;
   name: string;
   base: number;
   pointsInvested: number;
   racialBonus: number;
   drawback: number;
   total: number;
   highTotalWarning: boolean;
   d20Modifier: number;
}

export interface CharacterSheetExportCharacter {
   name: string;
}

export interface CharacterSheetExportV1 {
   meta: CharacterSheetExportMeta;
   character: CharacterSheetExportCharacter;
   rules: CharacterSheetExportRules;
   pointPool: CharacterSheetExportPointPool;
   race: CharacterSheetExportRace;
   human?: CharacterSheetExportHuman;
   abilities: CharacterSheetExportAbilityRow[];
}

function fullAbilityRecord(
   partial: Partial<Record<AbilityId, number>> | undefined,
): Record<AbilityId, number> {
   const out: Record<AbilityId, number> = { str: 0, dex: 0, con: 0, int: 0, cha: 0 };
   if (!partial) {
      return out;
   }
   for (const id of ABILITY_IDS) {
      const v = partial[id];
      if (typeof v === 'number') {
         out[id] = v;
      }
   }
   return out;
}

function d20Modifier(total: number): number {
   return Math.floor((total - 10) / 2);
}

export function buildCharacterSheetExport(
   t: CharacterSheetExportTranslate,
   input: CharacterSheetExportInput,
): CharacterSheetExportV1 {
   const schemaVersion = input.schemaVersion ?? 1;
   const raceId = input.selectedRace.id;
   const trimmedName = input.characterName.trim();

   const race: CharacterSheetExportRace = {
      id: raceId,
      name: t(`rpg.races.${raceId}.name`),
      primarySkill: t(`rpg.races.${raceId}.skill`),
      secondarySkill: t(`rpg.races.${raceId}.secondarySkill`),
      visualDescription: t(`rpg.races.${raceId}.visualDescription`),
      drawbackDescription: t(`rpg.races.${raceId}.drawbackDescription`),
      portraitUrl: input.selectedRace.portraitUrl,
      racialModifiers: fullAbilityRecord(input.selectedRace.modifiers),
      drawbackModifiers: fullAbilityRecord(input.selectedRace.drawbackModifiers),
   };

   const abilities: CharacterSheetExportAbilityRow[] = ABILITY_IDS.map((id) => ({
      id,
      name: t(`rpg.abilities.${id}`),
      base: input.scores[id],
      pointsInvested: input.scores[id] - BASE_SCORE,
      racialBonus: input.sheetRacialBonus[id],
      drawback: input.sheetDrawback[id],
      total: input.totals[id],
      highTotalWarning: input.highTotalFlags[id],
      d20Modifier: d20Modifier(input.totals[id]),
   }));

   const out: CharacterSheetExportV1 = {
      meta: {
         schemaVersion,
         exportedAt: input.exportedAt,
         locale: input.locale,
         app: 'rick-morty-portal',
         ...(input.generator ? { generator: input.generator } : {}),
         llmInstructions: t('rpg.llmInstructions'),
      },
      character: {
         name: trimmedName,
      },
      rules: {
         summary: t('rpg.subtitle'),
         baseScore: BASE_SCORE,
         minScoreBeforeRace: MIN_SCORE_BEFORE_RACE,
         maxScoreBeforeRace: MAX_SCORE_BEFORE_RACE,
         pointPoolMax: POINT_POOL_MAX,
         finalScoreWarningThreshold: FINAL_SCORE_WARNING_THRESHOLD,
      },
      pointPool: {
         max: POINT_POOL_MAX,
         spent: input.spent,
         remaining: input.remaining,
      },
      race,
      abilities,
   };

   if (input.selectedRaceId === 'humans') {
      const [a, b] = input.humanBonusChoices;
      out.human = {
         bonusSlots: [
            { abilityId: a, abilityName: t(`rpg.abilities.${a}`) },
            { abilityId: b, abilityName: t(`rpg.abilities.${b}`) },
         ],
      };
   }

   return out;
}
