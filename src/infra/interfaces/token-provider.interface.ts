import type { JwtPayload } from "@services/auth/auth.types";

interface ITokenProvider {
  sign(payload: JwtPayload): string;
  verify(token: string): JwtPayload;
}

export type { ITokenProvider };
