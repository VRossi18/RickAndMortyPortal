import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
   buildCharacterSheetExport,
   type CharacterSheetExportTranslate,
} from '../src/components/rpg/buildCharacterSheetExport.ts';
import {
   computeSpent,
   remainingPoints,
   computeTotals,
   totalExceedsWarning,
} from '../src/components/rpg/characterCreationMath.ts';
import {
   drawbackModifierMap,
   getRaceById,
   mergeAbilityDeltas,
   racialBonusMap,
} from '../src/components/rpg/races.ts';
import type { AbilityId, AbilityScores, RaceId } from '../src/components/rpg/types.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

function makeTranslator(): CharacterSheetExportTranslate {
   const raw = JSON.parse(
      readFileSync(join(root, 'src/locales/en/common.json'), 'utf8'),
   ) as Record<string, unknown>;
   return (key: string) => {
      const parts = key.split('.');
      let cur: unknown = raw;
      for (const p of parts) {
         if (cur && typeof cur === 'object' && p in (cur as object)) {
            cur = (cur as Record<string, unknown>)[p];
         } else {
            return key;
         }
      }
      return typeof cur === 'string' ? cur : key;
   };
}

/** Canonical sample: Bird-Person, moderate point-buy (matches UI math). */
const selectedRaceId: RaceId = 'birdPeople';
const selectedRace = getRaceById(selectedRaceId);
const scores: AbilityScores = { str: 10, dex: 15, con: 10, int: 10, cha: 10 };
const humanBonusChoices: [AbilityId, AbilityId] = ['str', 'dex'];

const sheetRacialBonus = racialBonusMap(selectedRace);
const sheetDrawback = drawbackModifierMap(selectedRace);
const racialBonus = mergeAbilityDeltas(sheetRacialBonus, sheetDrawback);
const spent = computeSpent(scores);
const remaining = remainingPoints(scores);
const totals = computeTotals(scores, racialBonus);
const highTotalFlags = totalExceedsWarning(totals);

const t = makeTranslator();
const payload = buildCharacterSheetExport(t, {
   exportedAt: new Date().toISOString(),
   locale: 'en',
   generator: 'github-actions-fixture',
   characterName: 'Sample adventurer',
   selectedRaceId,
   selectedRace,
   scores,
   sheetRacialBonus,
   sheetDrawback,
   totals,
   highTotalFlags,
   spent,
   remaining,
   humanBonusChoices,
});

const outDir = join(root, 'artifacts');
mkdirSync(outDir, { recursive: true });
const outFile = join(outDir, 'rpg-character-export.sample.json');
writeFileSync(outFile, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
process.stdout.write(`Wrote ${outFile}\n`);
