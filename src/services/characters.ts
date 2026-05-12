import api from './api';
import type { ApiResponse, Character } from '../types/api';

/**
 * Filtros da listagem (UI). `status` e `gender` são enviados em minúsculas à API,
 * conforme https://rickandmortyapi.com/documentation/#character-schema
 */
export type CharacterListFilters = {
   name?: string;
   status?: string;
   gender?: string;
   species?: string;
   type?: string;
};

function toApiParams(page: number, filters: CharacterListFilters): Record<string, string | number> {
   const params: Record<string, string | number> = { page };

   const name = filters.name?.trim();
   if (name) {
      params.name = name;
   }

   const species = filters.species?.trim();
   if (species) {
      params.species = species;
   }

   const type = filters.type?.trim();
   if (type) {
      params.type = type;
   }

   const status = filters.status?.trim();
   if (status) {
      params.status = status.toLowerCase();
   }

   const gender = filters.gender?.trim();
   if (gender) {
      params.gender = gender.toLowerCase();
   }

   return params;
}

export const CharacterService = {
   /**
    * Lista paginada de personagens com filtros opcionais da API oficial.
    */
   getCharacters: async (
      page: number,
      filters: CharacterListFilters = {},
   ): Promise<ApiResponse<Character>> => {
      const params = toApiParams(page, filters);
      const { data } = await api.get<ApiResponse<Character>>('/character', { params });
      return data;
   },

   /**
    * Obtém os detalhes de um único personagem pelo ID.
    */
   getCharacterById: async (id: number): Promise<Character> => {
      const { data } = await api.get<Character>(`/character/${id}`);
      return data;
   },

   /**
    * Obtém múltiplos personagens simultaneamente através de um array de IDs.
    */
   getMultipleCharacters: async (ids: number[]): Promise<Character[]> => {
      const { data } = await api.get<Character[]>(`/character/${ids.join(',')}`);
      return data;
   },
};
