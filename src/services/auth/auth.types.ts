import type { UserRole } from "types/auth.types";
interface User {
  id: string;
  email: string;
  password: string;
  role: UserRole;
  brandId?: string;
}
export type { User };
