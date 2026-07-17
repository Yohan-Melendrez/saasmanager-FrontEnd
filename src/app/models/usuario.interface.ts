export interface Usuario {
  id?: number;
  username: string;
  email: string;
  rol: string;
}

export interface UpdateUserRequest {
  username?: string;
  email?: string;
  passwordActual?: string;
  passwordNuevo?: string;
  rol?: string;
}
