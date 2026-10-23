export type UserRole = 'admin' | 'user';

export interface AppUser {
  id: string;
  username: string;
  role: UserRole;
  createdAt?: string;
}

export interface ManagedUserInput {
  username: string;
  password?: string;
  role: UserRole;
}
