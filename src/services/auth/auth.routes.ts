import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../../config';
import { logger } from '../../infra/logger';
import { asyncHandler } from '../../middleware/error-handler';
import { authStore } from './auth.store';
import { loginSchema } from './auth.validation';
import type { JwtPayload } from './auth.types';

const authRouter = Router();

authRouter.post(
  '/login',
  asyncHandler(async (req, res) => {
    const body = loginSchema.parse(req.body);

    const user = authStore.findByEmail(body.email);

    if (!user || user.password !== body.password) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      ...(user.brandId ? { brandId: user.brandId } : {}),
    };

    const token = jwt.sign(payload, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn,
    });

    logger.info({
      message: 'User logged in',
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    res.status(200).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  })
);

export { authRouter };
