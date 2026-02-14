enum UserRole {
  ADMIN = "admin",
  BRAND = "brand",
  CUSTOMER = "customer",
}

interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
  brandId?: string;
}

export { UserRole };
export type { JwtPayload };
