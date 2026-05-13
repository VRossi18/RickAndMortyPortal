import clsx from 'clsx';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BASE_SCORE, MAX_SCORE_BEFORE_RACE } from './characterCreationMath';
import { RACES } from './races';
import { useCharacterCreation } from './useCharacterCreation';
import { ABILITY_IDS } from './types';
import type { AbilityId, RaceDefinition } from './types';

function formatBonus(n: number): string {
   if (n === 0) {
      return '—';
   }
   return n > 0 ? `+${n}` : String(n);
}

function RacePortrait({
   race,
   imageAlt,
   imgClassName,
}: {
   race: RaceDefinition;
   imageAlt: string;
   imgClassName: string;
}) {
   const [imgFailed, setImgFailed] = useState(false);

   if (imgFailed) {
      return (
         <div className={clsx('h-full w-full', race.cardClass)} role="img" aria-label={imageAlt} />
      );
   }

   return (
      <img
         src={race.portraitUrl}
         alt={imageAlt}
         className={imgClassName}
         loading="lazy"
         decoding="async"
         referrerPolicy="no-referrer"
         onError={() => setImgFailed(true)}
      />
   );
}

export function CharacterSheetContainer() {
   const { t } = useTranslation('common');
   const {
      selectedRaceId,
      selectedRace,
      scores,
      sheetRacialBonus,
      sheetDrawback,
      spent,
      remaining,
      totals,
      highTotalFlags,
      setRace,
      incrementAbility,
      decrementAbility,
      humanBonusChoices,
      setHumanBonusSlot,
   } = useCharacterCreation();

   const previewName = t(`rpg.races.${selectedRace.id}.name` as 'rpg.title');
   const previewSkill = t(`rpg.races.${selectedRace.id}.skill` as 'rpg.title');
   const previewSecondarySkill = t(
      `rpg.races.${selectedRace.id}.secondarySkill` as 'rpg.title',
   );
   const previewAlt = t(`rpg.races.${selectedRace.id}.imageAlt` as 'rpg.title');
   const previewVisual = t(`rpg.races.${selectedRace.id}.visualDescription` as 'rpg.title');
   const previewDrawback = t(
      `rpg.races.${selectedRace.id}.drawbackDescription` as 'rpg.title',
   );

   return (
      <div className="mx-auto max-w-5xl space-y-10 px-4 py-8 md:py-12">
         <header className="space-y-2 text-center md:text-left">
            <h1 className="text-3xl font-black tracking-tight text-foreground md:text-4xl">
               {t('rpg.title')}
            </h1>
            <p className="text-sm text-muted-foreground md:max-w-2xl">{t('rpg.subtitle')}</p>
            <p className="text-sm font-semibold text-primary">
               {t('rpg.poolSummary', { spent, remaining })}
            </p>
         </header>

         <section aria-labelledby="rpg-race-heading" className="space-y-4">
            <h2 id="rpg-race-heading" className="text-lg font-bold text-foreground">
               {t('rpg.raceHeading')}
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
               {RACES.map((race) => {
                  const selected = selectedRaceId === race.id;
                  const name = t(`rpg.races.${race.id}.name` as 'rpg.title');
                  const skill = t(`rpg.races.${race.id}.skill` as 'rpg.title');
                  const imageAlt = t(`rpg.races.${race.id}.imageAlt` as 'rpg.title');
                  const visualDescription = t(
                     `rpg.races.${race.id}.visualDescription` as 'rpg.title',
                  );
                  return (
                     <button
                        key={race.id}
                        type="button"
                        onClick={() => setRace(race.id)}
                        aria-pressed={selected}
                        aria-label={t('rpg.raceSelectAria', { race: name })}
                        className={clsx(
                           'group flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border bg-card text-left transition outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-color)]',
                           selected
                              ? 'border-green-400/90 ring-2 ring-green-400 ring-offset-2 ring-offset-[var(--bg-color)]'
                              : 'border-border/80 hover:border-green-400/45',
                        )}
                     >
                        <div className="relative aspect-square w-full shrink-0 overflow-hidden bg-card">
                           <RacePortrait
                              race={race}
                              imageAlt={imageAlt}
                              imgClassName="h-full w-full object-cover object-center"
                           />
                        </div>
                        <div className="flex min-h-0 flex-1 flex-col space-y-2 p-4 pt-3">
                           <p className="text-base font-bold text-foreground">{name}</p>
                           <p className="text-xs text-muted-foreground">
                              <span className="font-semibold text-foreground/80">
                                 {t('rpg.suggestedSkill')}:{' '}
                              </span>
                              {skill}
                           </p>
                           <p className="text-xs leading-relaxed text-muted-foreground">
                              {visualDescription}
                           </p>
                        </div>
                     </button>
                  );
               })}
            </div>
         </section>

         <section
            aria-labelledby="rpg-selected-race-heading"
            className="rounded-2xl border border-green-400/40 bg-card/30 p-4 ring-2 ring-green-400/50 ring-offset-2 ring-offset-[var(--bg-color)] md:p-6"
         >
            <h2 id="rpg-selected-race-heading" className="sr-only">
               {t('rpg.selectedRacePreview')}
            </h2>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
               <div className="mx-auto h-44 w-44 shrink-0 overflow-hidden rounded-2xl border border-green-400/50 bg-card shadow-md shadow-green-500/15 sm:mx-0 sm:h-48 sm:w-48">
                  <RacePortrait
                     race={selectedRace}
                     imageAlt={previewAlt}
                     imgClassName="h-full w-full object-cover object-center"
                  />
               </div>
               <div className="min-w-0 flex-1 text-center sm:text-left">
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                     {t('rpg.selectedRacePreview')}
                  </p>
                  <p className="mt-1 text-2xl font-black text-foreground">{previewName}</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                     <span className="font-semibold text-foreground/90">
                        {t('rpg.suggestedSkill')}:{' '}
                     </span>
                     {previewSkill}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                     <span className="font-semibold text-foreground/90">
                        {t('rpg.raceSecondarySkill')}:{' '}
                     </span>
                     {previewSecondarySkill}
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                     {previewVisual}
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-amber-800/95 dark:text-amber-200/90">
                     <span className="font-semibold text-foreground/85">
                        {t('rpg.raceDrawback')}:{' '}
                     </span>
                     {previewDrawback}
                  </p>
               </div>
            </div>
         </section>

         {selectedRaceId === 'humans' ? (
            <section
               aria-labelledby="rpg-human-bonus-heading"
               className="rounded-2xl border border-border/80 bg-card/40 p-4 md:p-5"
            >
               <h2 id="rpg-human-bonus-heading" className="text-base font-bold text-foreground">
                  {t('rpg.humanBonusHeading')}
               </h2>
               <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end">
                  <label className="block min-w-0 flex-1 text-sm">
                     <span className="text-muted-foreground">{t('rpg.humanBonusSlot1')}</span>
                     <select
                        className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-green-400"
                        value={humanBonusChoices[0]}
                        onChange={(e) => setHumanBonusSlot(0, e.target.value as AbilityId)}
                     >
                        {ABILITY_IDS.map((id) => (
                           <option key={id} value={id} disabled={id === humanBonusChoices[1]}>
                              {t(`rpg.abilities.${id}` as 'rpg.title')}
                           </option>
                        ))}
                     </select>
                  </label>
                  <label className="block min-w-0 flex-1 text-sm">
                     <span className="text-muted-foreground">{t('rpg.humanBonusSlot2')}</span>
                     <select
                        className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-green-400"
                        value={humanBonusChoices[1]}
                        onChange={(e) => setHumanBonusSlot(1, e.target.value as AbilityId)}
                     >
                        {ABILITY_IDS.map((id) => (
                           <option key={id} value={id} disabled={id === humanBonusChoices[0]}>
                              {t(`rpg.abilities.${id}` as 'rpg.title')}
                           </option>
                        ))}
                     </select>
                  </label>
               </div>
            </section>
         ) : null}

         <section aria-labelledby="rpg-abilities-heading" className="space-y-4">
            <h2 id="rpg-abilities-heading" className="text-lg font-bold text-foreground">
               {t('rpg.abilitiesHeading')}
            </h2>
            <ul className="space-y-4">
               {ABILITY_IDS.map((id) => {
                  const raceBonus = sheetRacialBonus[id];
                  const drawback = sheetDrawback[id];
                  const total = totals[id];
                  const invested = scores[id] - BASE_SCORE;
                  const warn = highTotalFlags[id];
                  return (
                     <li
                        key={id}
                        className="rounded-2xl border border-border/80 bg-card/40 p-4 md:flex md:items-center md:justify-between md:gap-6"
                     >
                        <div className="min-w-0 flex-1">
                           <p className="text-sm font-bold text-foreground">
                              {t(`rpg.abilities.${id}` as 'rpg.title')}
                           </p>
                           <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-xs sm:grid-cols-3 md:grid-cols-5">
                              <div>
                                 <dt className="text-muted-foreground">{t('rpg.sheetBase')}</dt>
                                 <dd className="font-mono text-sm font-semibold">{BASE_SCORE}</dd>
                              </div>
                              <div>
                                 <dt className="text-muted-foreground">{t('rpg.sheetInvested')}</dt>
                                 <dd className="font-mono text-sm font-semibold">
                                    {invested > 0 ? `+${invested}` : '0'}
                                 </dd>
                              </div>
                              <div>
                                 <dt className="text-muted-foreground">{t('rpg.sheetRacial')}</dt>
                                 <dd
                                    className={clsx(
                                       'font-mono text-sm font-semibold',
                                       raceBonus > 0 && 'text-emerald-600 dark:text-emerald-400',
                                    )}
                                 >
                                    {formatBonus(raceBonus)}
                                 </dd>
                              </div>
                              <div>
                                 <dt className="text-muted-foreground">{t('rpg.sheetDrawback')}</dt>
                                 <dd
                                    className={clsx(
                                       'font-mono text-sm font-semibold',
                                       drawback < 0 && 'text-rose-600 dark:text-rose-400',
                                    )}
                                 >
                                    {formatBonus(drawback)}
                                 </dd>
                              </div>
                              <div>
                                 <dt className="text-muted-foreground">{t('rpg.sheetTotal')}</dt>
                                 <dd
                                    className={clsx(
                                       'font-mono text-lg font-black',
                                       warn && 'text-amber-600 dark:text-amber-400',
                                    )}
                                 >
                                    {total}
                                 </dd>
                              </div>
                           </dl>
                           {warn ? (
                              <p className="mt-2 text-xs text-amber-700 dark:text-amber-300">
                                 {t('rpg.highTotalHint')}
                              </p>
                           ) : null}
                        </div>
                        <div className="mt-4 flex shrink-0 gap-2 md:mt-0">
                           <button
                              type="button"
                              onClick={() => decrementAbility(id)}
                              disabled={scores[id] <= BASE_SCORE}
                              className="rounded-lg border border-border px-3 py-2 text-sm font-semibold text-foreground transition hover:border-destructive/50 disabled:cursor-not-allowed disabled:opacity-40"
                              aria-label={`${t('rpg.decrement')} ${t(`rpg.abilities.${id}` as 'rpg.title')}`}
                           >
                              −
                           </button>
                           <button
                              type="button"
                              onClick={() => incrementAbility(id)}
                              disabled={scores[id] >= MAX_SCORE_BEFORE_RACE || remaining <= 0}
                              className="rounded-lg border border-primary/50 px-3 py-2 text-sm font-semibold text-primary transition hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-40"
                              aria-label={`${t('rpg.increment')} ${t(`rpg.abilities.${id}` as 'rpg.title')}`}
                           >
                              +
                           </button>
                        </div>
                     </li>
                  );
               })}
            </ul>
         </section>
      </div>
   );
}
