import type { JwtPayload } from '../services/auth/auth.types';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
      requestId: string;
    }
  }
}
