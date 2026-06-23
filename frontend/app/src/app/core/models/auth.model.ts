export interface JwtPayload {
  sub: string;
  role: 'ADMIN' | 'ENTRENADOR' | 'CLIENTE' | 'RECEPCION';
  gymId: string;
}

export interface LoginResponse {
  access_token: string;
  user: { id: string; nombres: string; role: string; };
}

export interface StoredUser {
  id: string;
  nombres: string;
  role: string;
  gymId: string;
  access_token: string;
}
