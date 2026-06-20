export interface IRepository<T, ID = string> {
  findById(id: ID): Promise<T | null>;
  findAll(params?: Record<string, any>): Promise<T[]>;
  create(data: Partial<T>): Promise<T>;
  update(id: ID, data: Partial<T>): Promise<T>;
  delete(id: ID): Promise<void>;
}
