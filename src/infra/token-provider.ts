import jwt from "jsonwebtoken";
import type { ITokenProvider } from "./interfaces/token-provider.interface";
import type { JwtPayload } from "types/auth.types";

class JwtTokenProvider implements ITokenProvider {
  constructor(
    private readonly secret: string,
    private readonly expiresIn: string,
  ) {}

  sign(payload: JwtPayload): string {
    const signOptions: jwt.SignOptions = {
      expiresIn: this.expiresIn as jwt.SignOptions["expiresIn"],
    };
    return jwt.sign({ ...payload }, this.secret, signOptions);
  }

  verify(token: string): JwtPayload {
    return jwt.verify(token, this.secret) as JwtPayload;
  }
}

export { JwtTokenProvider };
