import type { User } from "@services/auth/auth.types";

interface IAuthStore {
  findByEmail(email: string): User | undefined;
  findById(id: string): User | undefined;
}

export type { IAuthStore };
