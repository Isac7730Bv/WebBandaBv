import { storageService } from "../services/storageService";

import type {
  LoginCredentials,
  CreateUserInput,
  User,
} from "../types/auth";

const SESSION_KEY = "app_session";
const API_BASE = "/api";

export const authRepository = {
  async login(credentials: LoginCredentials): Promise<User | null> {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      return null;
    }

    const { user } = (await response.json()) as { user: User };
    storageService.set<User>(SESSION_KEY, user);
    return user;
  },

  // La sesión actual se sigue guardando en el navegador (localStorage):
  // solo indica quién inició sesión en ESTE navegador. Los datos de los
  // estudiantes y la asistencia ahora viven en la base de datos SQLite,
  // no aquí.
  getCurrentUser(): User | null {
    return storageService.get<User>(SESSION_KEY);
  },

  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  },

  logout(): void {
    storageService.remove(SESSION_KEY);
  },

  async getMembers(): Promise<User[]> {
    const response = await fetch(`${API_BASE}/members`);
    const { members } = (await response.json()) as { members: User[] };
    return members;
  },

  async addUser(input: CreateUserInput): Promise<{ user?: User; error?: string }> {
    const response = await fetch(`${API_BASE}/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });

    const data = (await response.json()) as { user?: User; error?: string };

    if (!response.ok) {
      return { error: data.error ?? "No se pudo crear el estudiante." };
    }

    return { user: data.user };
  },

  async toggleUserActive(userId: string): Promise<User | null> {
    const response = await fetch(`${API_BASE}/members/${userId}/toggle`, {
      method: "PATCH",
    });

    if (!response.ok) {
      return null;
    }

    const { user } = (await response.json()) as { user: User };
    return user;
  },
};
