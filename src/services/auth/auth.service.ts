import type {
  IAuthService,
  LoginResult,
} from "./interfaces/auth-service.interface";
import type { IAuthStore } from "./interfaces/auth-store.interface";
import type { ITokenProvider } from "@infra/interfaces/token-provider.interface";
import type { ILogger } from "@infra/interfaces/logger.interface";
import type { LoginInput } from "./auth.validation";
import type { JwtPayload } from "types/auth.types";
import { AppError } from "@middleware/error-handler";

class AuthService implements IAuthService {
  constructor(
    private readonly authStore: IAuthStore,
    private readonly tokenProvider: ITokenProvider,
    private readonly logger: ILogger,
  ) {}

  async login(input: LoginInput): Promise<LoginResult> {
    const user = this.authStore.findByEmail(input.email);

    if (!user || user.password !== input.password) {
      throw new AppError(401, "Invalid credentials", "INVALID_CREDENTIALS");
    }

    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      ...(user.brandId ? { brandId: user.brandId } : {}),
    };

    const token = this.tokenProvider.sign(payload);

    this.logger.info({
      message: "User logged in",
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }
}

export { AuthService };
