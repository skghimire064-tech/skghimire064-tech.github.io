export type UserRole = 'admin' | 'user';

export interface AppUser {
  id: string;
  username: string;
  password: string;
  role: UserRole;
}

export const DEFAULT_USERS: AppUser[] = [
  { id: 'default-admin', username: 'admin', password: 'admin123', role: 'admin' },
];
