export abstract class BaseRepository<T, CreateDto, UpdateDto, Filters> {
  abstract findAll(): Promise<T[]>;
  abstract findWithFilters(filters: Filters): Promise<{ data: T[]; total: number }>;
  abstract findById(id: string): Promise<T | null>;
  abstract create(data: CreateDto): Promise<T>;
  abstract update(id: string, data: UpdateDto): Promise<T>;
  abstract delete(id: string): Promise<T>;
}