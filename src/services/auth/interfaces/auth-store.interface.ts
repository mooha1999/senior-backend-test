import type { User } from "../auth.types";

interface IAuthStore {
  findByEmail(email: string): User | undefined;
  findById(id: string): User | undefined;
}

export type { IAuthStore };
