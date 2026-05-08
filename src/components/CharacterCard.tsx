import { useRef } from 'react';
import type { Character } from '../types/api';

interface Props {
   character: Character;
}

export function CharacterCard({ character }: Props) {
   const ref = useRef<HTMLDivElement>(null);

   const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${e.clientX - r.left}px`);
      el.style.setProperty('--my', `${e.clientY - r.top}px`);
   };

   const statusColor =
      character.status === 'Alive'
         ? 'var(--portal-green)'
         : character.status === 'Dead'
           ? 'var(--destructive)'
           : 'var(--muted-foreground)';

   return (
      <div ref={ref} onMouseMove={handleMove} className="glow-card group">
         <div className="aspect-square overflow-hidden">
            <img
               src={character.image}
               alt={character.name}
               loading="lazy"
               className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
         </div>
         <div className="p-4 space-y-2">
            <h3 className="text-lg font-semibold leading-tight text-foreground line-clamp-1">
               {character.name}
            </h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
               <span
                  className="status-dot"
                  style={{ color: statusColor, backgroundColor: statusColor }}
               />
               <span>
                  {character.status} — {character.species}
               </span>
            </div>
            <div className="text-xs text-muted-foreground">
               <p className="truncate">
                  <span className="opacity-60">Origem:</span> {character.origin.name}
               </p>
               <p className="truncate">
                  <span className="opacity-60">Local:</span> {character.location.name}
               </p>
            </div>
         </div>
      </div>
   );
}
