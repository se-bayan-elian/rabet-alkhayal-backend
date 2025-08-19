import { FindOptionsSelect } from 'typeorm';

export type paginationType = {
  page: number;
  limit: number;
  count: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};
export interface QueryOptions<T> {
  page?: number;
  limit?: number;
  sort?: keyof T | string;
  order?: 'ASC' | 'DESC';
  filters?: Partial<Record<keyof T, any>>;
  relations?: string[];
  select?: string[];
  search?: {
    fields: (keyof T)[];
    term: string;
  };
}

export type ServiceResponse<T> = {
  data: T | T[] | null;
  pagination?: paginationType;
  message?: string;
  success: boolean;
};
