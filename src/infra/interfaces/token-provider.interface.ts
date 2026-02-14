import type { JwtPayload } from "types/auth.types";

interface ITokenProvider {
  sign(payload: JwtPayload): string;
  verify(token: string): JwtPayload;
}

export type { ITokenProvider };
