import type { Request, Response, NextFunction } from 'express';
import type { UserRole } from '../services/auth/auth.types';

const authorize = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !allowedRoles.includes(req.user.role as UserRole)) {
      res.status(403).json({
        error: 'Forbidden: insufficient permissions',
        code: 'FORBIDDEN',
        requiredRoles: allowedRoles,
      });
      return;
    }
    next();
  };
};

export { authorize };
