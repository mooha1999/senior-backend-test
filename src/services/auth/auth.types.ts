enum UserRole {
  ADMIN = 'admin',
  BRAND = 'brand',
  CUSTOMER = 'customer',
}

interface User {
  id: string;
  email: string;
  password: string;
  role: UserRole;
  brandId?: string;
}

interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
  brandId?: string;
}

export { UserRole };
export type { User, JwtPayload };
