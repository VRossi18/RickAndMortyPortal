import { isAxiosError } from 'axios';
import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { CharacterService } from '../services/characters';
import type { Character } from '../types/api';
import type { CharacterLocationState } from '../types/navigation';

function formatDate(iso: string) {
   try {
      return new Date(iso).toLocaleString();
   } catch {
      return iso;
   }
}

export function CharacterDetailPage() {
   const { id: idParam } = useParams();
   const location = useLocation();
   const portal = (location.state as CharacterLocationState | null)?.portal;

   const id = useMemo(() => {
      const n = Number(idParam);
      return Number.isFinite(n) && n > 0 ? Math.floor(n) : NaN;
   }, [idParam]);

   const invalidId = Number.isNaN(id);

   const [character, setCharacter] = useState<Character | null>(null);
   const [loading, setLoading] = useState(() => !invalidId);
   const [error, setError] = useState<string | null>(() => (invalidId ? 'ID invalido.' : null));

   useEffect(() => {
      if (invalidId) {
         return;
      }

      let isMounted = true;

      const load = async () => {
         setLoading(true);
         setError(null);
         try {
            const data = await CharacterService.getCharacterById(id);
            if (!isMounted) return;
            setCharacter(data);
         } catch (err) {
            if (!isMounted) return;
            if (isAxiosError(err) && err.response?.status === 404) {
               setError('Personagem nao encontrado.');
            } else {
               setError('Nao foi possivel carregar este personagem.');
            }
            setCharacter(null);
         } finally {
            if (isMounted) setLoading(false);
         }
      };

      void load();

      return () => {
         isMounted = false;
      };
   }, [id, invalidId]);

   const statusColor =
      character?.status === 'Alive'
         ? 'var(--portal-green)'
         : character?.status === 'Dead'
           ? 'var(--destructive)'
           : 'var(--muted-foreground)';

   return (
      <motion.div
         className="relative min-h-screen overflow-x-hidden bg-[var(--bg-color)] text-[var(--text-color)]"
         initial={{ opacity: 0 }}
         animate={{ opacity: 1 }}
         exit={{ opacity: 0 }}
         transition={{ duration: 0.25, ease: 'easeOut' }}
      >
         {portal ? (
            <motion.div
               aria-hidden
               className="pointer-events-none fixed inset-0 z-0 mix-blend-screen"
               style={{
                  backgroundImage: `radial-gradient(circle at ${portal.x}px ${portal.y}px, color-mix(in oklch, var(--portal-green) 65%, transparent) 0%, color-mix(in oklch, var(--portal-cyan) 35%, transparent) 22%, transparent 52%)`,
               }}
               initial={{ opacity: 1, scale: 0.45 }}
               animate={{ opacity: 0.25, scale: 1.35 }}
               transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
            />
         ) : null}

         <div className="relative z-10">
            <div className="mx-auto max-w-5xl px-4 pb-6 pt-10 md:pt-14">
               <Link
                  to="/characters"
                  className="inline-flex w-fit items-center gap-2 rounded-md border border-primary/40 px-3 py-2 text-sm font-semibold text-primary transition hover:border-primary hover:bg-primary/10"
               >
                  Voltar ao portal
               </Link>
            </div>

            <div className="relative mx-auto max-w-5xl px-4 pb-24">
               {loading ? (
                  <div className="flex flex-col items-center justify-center gap-4 py-24">
                     <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                     <p className="text-sm font-bold text-primary">ABRINDO DIMENSÃO...</p>
                  </div>
               ) : error ? (
                  <p className="py-16 text-center text-sm font-bold text-red-500">{error}</p>
               ) : character ? (
                  <div className="flex flex-col gap-10 md:flex-row md:items-start">
                     <div className="mx-auto w-full max-w-sm shrink-0 overflow-hidden rounded-2xl border border-primary/25 bg-card shadow-lg shadow-primary/10 md:mx-0">
                        <img
                           src={character.image}
                           alt={character.name}
                           className="aspect-square w-full object-cover"
                        />
                     </div>

                     <div className="min-w-0 flex-1 space-y-6">
                        <div>
                           <h1 className="text-3xl font-black tracking-tight md:text-4xl">
                              {character.name}
                           </h1>
                           <div className="mt-3 flex flex-wrap items-center gap-2 text-muted-foreground">
                              <span
                                 className="status-dot"
                                 style={{ color: statusColor, backgroundColor: statusColor }}
                              />
                              <span className="text-sm font-medium">
                                 {character.status} — {character.species}
                              </span>
                           </div>
                        </div>

                        <dl className="grid gap-4 text-sm sm:grid-cols-2">
                           <div className="rounded-xl border border-border/60 bg-card/40 p-4">
                              <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                 Tipo
                              </dt>
                              <dd className="mt-1 font-medium text-foreground">
                                 {character.type || '—'}
                              </dd>
                           </div>
                           <div className="rounded-xl border border-border/60 bg-card/40 p-4">
                              <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                 Gênero
                              </dt>
                              <dd className="mt-1 font-medium text-foreground">
                                 {character.gender}
                              </dd>
                           </div>
                           <div className="rounded-xl border border-border/60 bg-card/40 p-4 sm:col-span-2">
                              <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                 Origem
                              </dt>
                              <dd className="mt-1 font-medium text-foreground">
                                 {character.origin.name}
                              </dd>
                           </div>
                           <div className="rounded-xl border border-border/60 bg-card/40 p-4 sm:col-span-2">
                              <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                 Local atual
                              </dt>
                              <dd className="mt-1 font-medium text-foreground">
                                 {character.location.name}
                              </dd>
                           </div>
                           <div className="rounded-xl border border-border/60 bg-card/40 p-4 sm:col-span-2">
                              <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                 Episódios (URLs na API)
                              </dt>
                              <dd className="mt-1 font-medium text-foreground">
                                 {character.episode.length} episódio(s)
                              </dd>
                           </div>
                           <div className="rounded-xl border border-border/60 bg-card/40 p-4 sm:col-span-2">
                              <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                 Criado em
                              </dt>
                              <dd className="mt-1 font-medium text-foreground">
                                 {formatDate(character.created)}
                              </dd>
                           </div>
                        </dl>
                     </div>
                  </div>
               ) : null}
            </div>
         </div>
      </motion.div>
   );
}
