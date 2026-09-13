export type UserRole = "ADMIN" | "USUARIO";


export interface User {
  id: string;
  name: string;
  carnet: string;
  role: UserRole;
  instrumentId?: string;
  instrument?: string;
  instrumentCode?: string;
  isActive?: boolean;
}


export interface UserRecord extends User {
  password: string;
}


export interface LoginCredentials {
  carnet: string;
  password: string;
}

export interface CreateUserInput {
  name: string;
  carnet: string;
  password: string;
  instrumentId: string;
}
