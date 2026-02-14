import type { LoginInput } from "../auth.validation";

interface LoginResult {
  token: string;
  user: {
    id: string;
    email: string;
    role: string;
  };
}

interface IAuthService {
  login(input: LoginInput): Promise<LoginResult>;
}

export type { IAuthService, LoginResult };
