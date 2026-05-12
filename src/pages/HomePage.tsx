import { isAxiosError } from 'axios';
import { motion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { CharacterCard } from '../components/CharacterCard';
import { CharacterFiltersBar } from '../components/CharacterFiltersBar';
import { CharacterService, type CharacterListFilters } from '../services/characters';
import type { Character, Info } from '../types/api';

const emptyInfo: Info = { count: 0, pages: 1, next: null, prev: null };

export function HomePage() {
   const [characters, setCharacters] = useState<Character[]>([]);
   const [loading, setLoading] = useState(true);
   const [page, setPage] = useState(1);
   const [pageInfo, setPageInfo] = useState<Info | null>(null);
   const [error, setError] = useState<string | null>(null);
   const [transitionFocusId, setTransitionFocusId] = useState<number | null>(null);

   const [nameDraft, setNameDraft] = useState('');
   const [appliedName, setAppliedName] = useState('');
   const lastCommittedName = useRef('');

   const [status, setStatus] = useState('');
   const [gender, setGender] = useState('');
   const [species, setSpecies] = useState('');
   const [type, setType] = useState('');
   const [advancedOpen, setAdvancedOpen] = useState(false);

   const hasActiveFilters = useMemo(
      () =>
         nameDraft.trim() !== '' ||
         status !== '' ||
         gender !== '' ||
         species.trim() !== '' ||
         type.trim() !== '',
      [nameDraft, status, gender, species, type],
   );

   const clearAllFilters = () => {
      lastCommittedName.current = '';
      setNameDraft('');
      setAppliedName('');
      setStatus('');
      setGender('');
      setSpecies('');
      setType('');
      setAdvancedOpen(false);
      setPage(1);
   };

   useEffect(() => {
      const id = window.setTimeout(() => {
         const next = nameDraft.trim();
         if (lastCommittedName.current !== next) {
            lastCommittedName.current = next;
            setAppliedName(next);
            setPage(1);
         }
      }, 380);
      return () => window.clearTimeout(id);
   }, [nameDraft]);

   const listFilters: CharacterListFilters = useMemo(
      () => ({
         ...(appliedName ? { name: appliedName } : {}),
         ...(status ? { status } : {}),
         ...(gender ? { gender } : {}),
         ...(species.trim() ? { species: species.trim() } : {}),
         ...(type.trim() ? { type: type.trim() } : {}),
      }),
      [appliedName, status, gender, species, type],
   );

   useEffect(() => {
      let isMounted = true;

      const loadData = async () => {
         setLoading(true);
         setError(null);

         try {
            const data = await CharacterService.getCharacters(page, listFilters);

            if (!isMounted) {
               return;
            }

            setCharacters(data.results);
            setPageInfo(data.info);
         } catch (err) {
            if (!isMounted) {
               return;
            }

            if (isAxiosError(err) && err.response?.status === 404) {
               setCharacters([]);
               setPageInfo(emptyInfo);
               setError(null);
            } else {
               console.error('Erro ao carregar personagens:', err);
               setError('Nao foi possivel carregar os personagens desta pagina.');
            }
         } finally {
            if (isMounted) {
               setLoading(false);
            }
         }
      };

      void loadData();

      return () => {
         isMounted = false;
      };
   }, [page, listFilters]);

   const handleBeforeNavigate = (id: number) => {
      flushSync(() => {
         setTransitionFocusId(id);
      });
   };

   const goToPreviousPage = () => {
      if (pageInfo?.prev) {
         setPage((currentPage) => currentPage - 1);
      }
   };

   const goToNextPage = () => {
      if (pageInfo?.next) {
         setPage((currentPage) => currentPage + 1);
      }
   };

   const showEmptyResults = !loading && !error && characters.length === 0;

   return (
      <motion.div
         className="min-h-screen bg-[var(--bg-color)] transition-colors duration-300"
         initial={{ opacity: 0 }}
         animate={{ opacity: 1 }}
         exit={{ opacity: 0 }}
         transition={{ duration: 0.28, ease: 'easeOut' }}
      >
         <header className="px-4 pb-6 pt-8 text-center md:pt-10">
            <h1 className="text-5xl font-black tracking-tighter text-[var(--text-color)] md:text-6xl">
               RICK AND <span className="text-primary">MORTY</span>
            </h1>
            <p className="mt-4 font-medium tracking-wide text-slate-500 dark:text-slate-400">
               EXPLORANDO O MULTIVERSO DE RICK AND MORTY
            </p>
            <div className="mx-auto mt-6 h-1.5 w-24 rounded-full bg-primary opacity-20"></div>
         </header>

         <main className="mx-auto max-w-[1400px] px-6 pb-20">
            <CharacterFiltersBar
               nameDraft={nameDraft}
               onNameDraftChange={setNameDraft}
               status={status}
               onStatusChange={(v) => {
                  setStatus(v);
                  setPage(1);
               }}
               gender={gender}
               onGenderChange={(v) => {
                  setGender(v);
                  setPage(1);
               }}
               species={species}
               onSpeciesChange={(v) => {
                  setSpecies(v);
                  setPage(1);
               }}
               type={type}
               onTypeChange={(v) => {
                  setType(v);
                  setPage(1);
               }}
               advancedOpen={advancedOpen}
               onAdvancedOpenChange={setAdvancedOpen}
               hasActiveFilters={hasActiveFilters}
               onClearFilters={clearAllFilters}
            />

            <div className="relative min-h-[20rem]">
               {error ? (
                  <div className="flex h-80 items-center justify-center">
                     <p className="text-sm font-bold text-red-500">{error}</p>
                  </div>
               ) : showEmptyResults ? (
                  <div className="flex min-h-[16rem] flex-col items-center justify-center gap-2 px-4 text-center">
                     <p className="text-base font-semibold text-[var(--text-color)]">
                        Nenhum personagem encontrado para esses filtros.
                     </p>
                     <p className="max-w-md text-sm text-muted-foreground">
                        Ajuste o nome ou os filtros e tente de novo — a API oficial da série não encontrou resultados
                        para esta combinação.
                     </p>
                  </div>
               ) : (
                  <div
                     className={`grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 ${loading ? 'pointer-events-none opacity-45' : ''}`}
                  >
                     {characters.map((char) => {
                        const interaction =
                           transitionFocusId === null
                              ? 'normal'
                              : transitionFocusId === char.id
                                ? 'source'
                                : 'dimmed';
                        return (
                           <CharacterCard
                              key={char.id}
                              character={char}
                              interaction={interaction}
                              onBeforeNavigate={handleBeforeNavigate}
                           />
                        );
                     })}
                  </div>
               )}

               {loading ? (
                  <div
                     className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 rounded-xl bg-[var(--bg-color)]/75 backdrop-blur-[2px]"
                     aria-busy="true"
                     aria-live="polite"
                  >
                     <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                     <p className="animate-pulse text-sm font-bold text-primary">CARREGANDO DIMENSÃO...</p>
                  </div>
               ) : null}
            </div>
         </main>
         <footer className="flex items-center justify-center gap-4 pb-8">
            <button
               type="button"
               onClick={goToPreviousPage}
               disabled={!pageInfo?.prev || loading}
               className="rounded-md border border-primary/40 px-4 py-2 text-sm font-semibold text-[var(--text-color)] transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
            >
               Anterior
            </button>

            <span className="text-sm font-semibold text-[var(--text-color)]">
               Pagina {page} de {pageInfo?.pages ?? 1}
            </span>

            <button
               type="button"
               onClick={goToNextPage}
               disabled={!pageInfo?.next || loading}
               className="rounded-md border border-primary/40 px-4 py-2 text-sm font-semibold text-[var(--text-color)] transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
            >
               Proxima
            </button>
         </footer>
      </motion.div>
   );
}
