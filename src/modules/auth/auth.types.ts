export type AppRole = 'USER' | 'ADMIN';

export interface AuthenticatedUser {
  id: string;
  appRole: AppRole;
}

export interface AccessTokenPayload {
  sub: string;
  appRole: AppRole;
}
