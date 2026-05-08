import api from './api';
import type { ApiResponse, Character } from '../types/api';

type CharacterFilters = {
   name?: string;
   status?: Character['status'];
   species?: string;
   type?: string;
   gender?: Character['gender'];
};

export const CharacterService = {
   /**
    * Obtém uma lista paginada de personagens.
    * @param page Número da página (padrão 1)
    * @param filters Objeto opcional com filtros (name, status, species, etc)
    */
   getCharacters: async (
      page: number,
      filters: CharacterFilters = {},
   ): Promise<ApiResponse<Character>> => {
      const params = {
         page,
         ...filters,
      };

      const { data } = await api.get<ApiResponse<Character>>('/character', { params });
      return data;
   },

   /**
    * Obtém os detalhes de um único personagem pelo ID.
    * @param id ID numérico do personagem
    */
   getCharacterById: async (id: number): Promise<Character> => {
      const { data } = await api.get<Character>(`/character/${id}`);
      return data;
   },

   /**
    * Obtém múltiplos personagens simultaneamente através de um array de IDs.
    * Útil para carregar personagens favoritos ou específicos de uma vez.
    */
   getMultipleCharacters: async (ids: number[]): Promise<Character[]> => {
      const { data } = await api.get<Character[]>(`/character/${ids.join(',')}`);
      return data;
   },
};
