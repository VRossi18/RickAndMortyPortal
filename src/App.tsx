import { useEffect, useState } from 'react';
import { CharacterService } from './services/characters';
import type { Character, Info } from './types/api';
import { CharacterCard } from './components/CharacterCard';
import { ThemeToggle } from './components/ThemeToggle';

function App() {
   const [characters, setCharacters] = useState<Character[]>([]);
   const [loading, setLoading] = useState(true);
   const [page, setPage] = useState(1);
   const [pageInfo, setPageInfo] = useState<Info | null>(null);
   const [error, setError] = useState<string | null>(null);

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
         } catch (error) {
            console.error('Erro ao carregar personagens:', error);
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
      <div className="min-h-screen bg-[var(--bg-color)] transition-colors duration-300">
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
               /* Loading State mais limpo */
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
               /* 
                  Grid System: 
                  - Mobile: 1 card
                  - Tablet: 2 cards (sm)
                  - Desktop: 4 cards (lg)
                  - Gap aumentado para respirar (gap-8)
               */
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {characters.map((char) => (
                     <CharacterCard key={char.id} character={char} />
                  ))}
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
      </div>
   );
}

export default App;
