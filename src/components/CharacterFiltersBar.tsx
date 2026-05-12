interface CharacterFiltersBarProps {
   nameDraft: string;
   onNameDraftChange: (value: string) => void;
   status: string;
   onStatusChange: (value: string) => void;
   gender: string;
   onGenderChange: (value: string) => void;
   species: string;
   onSpeciesChange: (value: string) => void;
   type: string;
   onTypeChange: (value: string) => void;
   advancedOpen: boolean;
   onAdvancedOpenChange: (open: boolean) => void;
   onClearFilters: () => void;
   hasActiveFilters: boolean;
}

export function CharacterFiltersBar({
   nameDraft,
   onNameDraftChange,
   status,
   onStatusChange,
   gender,
   onGenderChange,
   species,
   onSpeciesChange,
   type,
   onTypeChange,
   advancedOpen,
   onAdvancedOpenChange,
   onClearFilters,
   hasActiveFilters,
}: CharacterFiltersBarProps) {
   return (
      <div className="mx-auto mb-10 max-w-3xl space-y-4">
         <div className="space-y-2">
            <label htmlFor="character-search" className="sr-only">
               Buscar personagem por nome
            </label>
            <input
               id="character-search"
               type="search"
               value={nameDraft}
               onChange={(e) => onNameDraftChange(e.target.value)}
               placeholder="Buscar por nome (ex.: Rick, Morty)..."
               autoComplete="off"
               className="w-full rounded-xl border border-primary/40 bg-[var(--bg-color)] px-4 py-3 text-sm font-medium text-[var(--text-color)] shadow-sm outline-none ring-primary/30 transition placeholder:text-muted-foreground focus:border-primary focus:ring-2"
            />
         </div>

         <div className="flex flex-wrap items-center gap-3">
            <label className="sr-only" htmlFor="filter-status">
               Status
            </label>
            <select
               id="filter-status"
               value={status}
               onChange={(e) => onStatusChange(e.target.value)}
               className="min-w-[8.5rem] flex-1 rounded-lg border border-primary/40 bg-[var(--bg-color)] px-3 py-2 text-sm font-semibold text-[var(--text-color)] outline-none ring-primary/30 focus:border-primary focus:ring-2 sm:flex-none"
            >
               <option value="">Status (todos)</option>
               <option value="alive">Alive</option>
               <option value="dead">Dead</option>
               <option value="unknown">Unknown</option>
            </select>

            <label className="sr-only" htmlFor="filter-gender">
               Gênero
            </label>
            <select
               id="filter-gender"
               value={gender}
               onChange={(e) => onGenderChange(e.target.value)}
               className="min-w-[9.5rem] flex-1 rounded-lg border border-primary/40 bg-[var(--bg-color)] px-3 py-2 text-sm font-semibold text-[var(--text-color)] outline-none ring-primary/30 focus:border-primary focus:ring-2 sm:flex-none"
            >
               <option value="">Gênero (todos)</option>
               <option value="female">Female</option>
               <option value="male">Male</option>
               <option value="genderless">Genderless</option>
               <option value="unknown">Unknown</option>
            </select>

            <button
               type="button"
               onClick={() => onAdvancedOpenChange(!advancedOpen)}
               className="rounded-lg border border-primary/40 px-3 py-2 text-sm font-semibold text-primary transition hover:border-primary hover:bg-primary/10"
            >
               {advancedOpen ? 'Ocultar filtros avançados' : 'Filtros avançados'}
            </button>

            <button
               type="button"
               onClick={onClearFilters}
               disabled={!hasActiveFilters}
               className="rounded-lg border border-border px-3 py-2 text-sm font-semibold text-muted-foreground transition hover:border-destructive/50 hover:bg-destructive/10 hover:text-destructive disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border disabled:hover:bg-transparent disabled:hover:text-muted-foreground"
            >
               Limpar filtros
            </button>
         </div>

         {advancedOpen ? (
            <div className="grid gap-3 rounded-xl border border-border/80 bg-card/40 p-4 sm:grid-cols-2">
               <div className="space-y-1">
                  <label
                     htmlFor="filter-species"
                     className="text-xs font-bold uppercase tracking-wide text-muted-foreground"
                  >
                     Espécies
                  </label>
                  <input
                     id="filter-species"
                     type="text"
                     value={species}
                     onChange={(e) => onSpeciesChange(e.target.value)}
                     placeholder="ex.: Human"
                     className="w-full rounded-lg border border-primary/40 bg-[var(--bg-color)] px-3 py-2 text-sm text-[var(--text-color)] outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                  />
               </div>
               <div className="space-y-1">
                  <label
                     htmlFor="filter-type"
                     className="text-xs font-bold uppercase tracking-wide text-muted-foreground"
                  >
                     Tipo
                  </label>
                  <input
                     id="filter-type"
                     type="text"
                     value={type}
                     onChange={(e) => onTypeChange(e.target.value)}
                     placeholder="ex.: vazio ou Parasite"
                     className="w-full rounded-lg border border-primary/40 bg-[var(--bg-color)] px-3 py-2 text-sm text-[var(--text-color)] outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                  />
               </div>
            </div>
         ) : null}
      </div>
   );
}
