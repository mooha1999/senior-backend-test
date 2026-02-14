import type { User } from "./auth.types";
import type { IAuthStore } from "./interfaces/auth-store.interface";
import { UserRole } from "types/auth.types";

const seededUsers: User[] = [
  {
    id: "user-admin-1",
    email: "admin@marketplace.com",
    password: "admin123",
    role: UserRole.ADMIN,
  },
  {
    id: "user-brand-1",
    email: "brand@marketplace.com",
    password: "brand123",
    role: UserRole.BRAND,
    brandId: "brand1",
  },
  {
    id: "user-brand-2",
    email: "brand2@marketplace.com",
    password: "brand456",
    role: UserRole.BRAND,
    brandId: "brand2",
  },
  {
    id: "user-customer-1",
    email: "customer@marketplace.com",
    password: "customer123",
    role: UserRole.CUSTOMER,
  },
  {
    id: "user-customer-2",
    email: "customer2@marketplace.com",
    password: "customer456",
    role: UserRole.CUSTOMER,
  },
];

class AuthStore implements IAuthStore {
  private users: Map<string, User>;

  constructor() {
    this.users = new Map();
    for (const user of seededUsers) {
      this.users.set(user.id, user);
    }
  }

  findByEmail(email: string): User | undefined {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return undefined;
  }

  findById(id: string): User | undefined {
    return this.users.get(id);
  }
}

export { AuthStore };
