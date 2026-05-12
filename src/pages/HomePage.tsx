import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { flushSync } from 'react-dom';
import { CharacterCard } from '../components/CharacterCard';
import { ThemeToggle } from '../components/ThemeToggle';
import { CharacterService } from '../services/characters';
import type { Character, Info } from '../types/api';

export function HomePage() {
   const [characters, setCharacters] = useState<Character[]>([]);
   const [loading, setLoading] = useState(true);
   const [page, setPage] = useState(1);
   const [pageInfo, setPageInfo] = useState<Info | null>(null);
   const [error, setError] = useState<string | null>(null);
   /** Card em foco durante a transição: afasta/dimui os outros antes da navegação. */
   const [transitionFocusId, setTransitionFocusId] = useState<number | null>(null);

   const handleBeforeNavigate = (id: number) => {
      flushSync(() => {
         setTransitionFocusId(id);
      });
   };

   useEffect(() => {
      let isMounted = true;

      const loadData = async () => {
         setLoading(true);
         setError(null);

         try {
            const data = await CharacterService.getCharacters(page);

            if (!isMounted) {
               return;
            }

            setCharacters(data.results);
            setPageInfo(data.info);
         } catch (err) {
            console.error('Erro ao carregar personagens:', err);
            if (isMounted) {
               setError('Nao foi possivel carregar os personagens desta pagina.');
            }
         } finally {
            if (isMounted) {
               setLoading(false);
            }
         }
      };

      loadData();

      return () => {
         isMounted = false;
      };
   }, [page]);

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

   return (
      <motion.div
         className="min-h-screen bg-[var(--bg-color)] transition-colors duration-300"
         initial={{ opacity: 0 }}
         animate={{ opacity: 1 }}
         exit={{ opacity: 0, transition: { duration: 0.28 } }}
      >
         <ThemeToggle />

         <header className="pt-16 pb-12 px-4 text-center">
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-[var(--text-color)]">
               RICK AND <span className="text-primary">MORTY</span>
            </h1>
            <p className="mt-4 text-slate-500 dark:text-slate-400 font-medium tracking-wide">
               EXPLORANDO O MULTIVERSO COM REACT & TAILWIND
            </p>
            <div className="mt-6 w-24 h-1.5 bg-primary mx-auto rounded-full opacity-20"></div>
         </header>

         <main className="max-w-[1400px] mx-auto px-6 pb-20">
            {loading ? (
               <div className="flex flex-col items-center justify-center h-80 gap-4">
                  <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-sm font-bold text-primary animate-pulse">
                     CARREGANDO DIMENSÃO...
                  </p>
               </div>
            ) : error ? (
               <div className="flex items-center justify-center h-80">
                  <p className="text-sm font-bold text-red-500">{error}</p>
               </div>
            ) : (
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
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
