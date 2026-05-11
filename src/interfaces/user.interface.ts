export interface IUser {
  id: string;
  username: string;
  email: string;
  password: string;
  photoURL: string;
}

export interface ICreateUser {
  username: string;
  email: string;
  password: string;
}

export interface IUserFilters {
  username?: string;
  email?: string;
  page?: number;
  limit?: number;
  orderBy?: 'username' | 'email' | 'createdAt';
  order?: 'asc' | 'desc';
}