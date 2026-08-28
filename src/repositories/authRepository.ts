import initialUsers from "../data/users.json";
import { storageService } from "../services/storageService";


import type {
  LoginCredentials,
  CreateUserInput,
  User,
  UserRecord,
} from "../types/auth";


const SESSION_KEY = "app_session";
const USERS_KEY = "app_users";


const initialUserRecords = initialUsers as UserRecord[];

const getUsers = (): UserRecord[] =>
  storageService.get<UserRecord[]>(USERS_KEY) ?? initialUserRecords;

const saveUsers = (users: UserRecord[]) => storageService.set(USERS_KEY, users);

const toPublicUser = ({
  id,
  name,
  carnet,
  role,
  instrument,
  instrumentCode,
  isActive,
}: UserRecord): User => ({ id, name, carnet, role, instrument, instrumentCode, isActive });


export const authRepository = {
  login(credentials: LoginCredentials): User | null {
    const foundUser = getUsers().find(
      (user) =>
        user.carnet === credentials.carnet &&
        user.password === credentials.password &&
        user.isActive !== false,
    );


    if (!foundUser) {
      return null;
    }


    const sessionUser = toPublicUser(foundUser);


    storageService.set<User>(SESSION_KEY, sessionUser);


    return sessionUser;
  },


  getCurrentUser(): User | null {
    return storageService.get<User>(SESSION_KEY);
  },


  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  },


  logout(): void {
    storageService.remove(SESSION_KEY);
  },

  getMembers(): User[] {
    return getUsers()
      .filter((user) => user.role === "USUARIO")
      .map(toPublicUser);
  },

  addUser(input: CreateUserInput): { user?: User; error?: string } {
    const users = getUsers();

    if (users.some((user) => user.carnet === input.carnet)) {
      return { error: "Ya existe un usuario con este carnet." };
    }

    const newUser: UserRecord = {
      id: `user-${Date.now()}`,
      name: input.name,
      carnet: input.carnet,
      password: input.password,
      role: "USUARIO",
      instrument: input.instrument,
      instrumentCode: input.instrumentCode,
      isActive: true,
    };

    saveUsers([...users, newUser]);
    return { user: toPublicUser(newUser) };
  },

  toggleUserActive(userId: string): User | null {
    let updatedUser: User | null = null;
    const users = getUsers().map((user) => {
      if (user.id !== userId || user.role !== "USUARIO") {
        return user;
      }

      const updated = { ...user, isActive: user.isActive === false };
      updatedUser = toPublicUser(updated);
      return updated;
    });

    saveUsers(users);
    return updatedUser;
  },
};
