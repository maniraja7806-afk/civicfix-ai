import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { User, IUser } from '../models/User';
import { getInMemoryStore } from '../utils/inMemoryStore';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'citizen' | 'officer' | 'admin';
    name: string;
    departmentId?: string;
  };
}

export const authenticateJwt = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Authentication required. No token provided.'
      });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwtSecret) as any;

    if (!decoded || !decoded.id) {
      res.status(401).json({
        success: false,
        message: 'Invalid or expired token.'
      });
      return;
    }

    // Try finding user in MongoDB, fall back to inMemoryStore if standalone
    try {
      const user = await User.findById(decoded.id).select('-passwordHash');
      if (user && user.isActive) {
        req.user = {
          id: user._id.toString(),
          email: user.email,
          role: user.role,
          name: user.name,
          departmentId: user.departmentId ? user.departmentId.toString() : undefined
        };
        next();
        return;
      }
    } catch (dbErr) {
      // If DB is offline, check in-memory store
      const memUser = getInMemoryStore().getUserById(decoded.id);
      if (memUser && memUser.isActive) {
        req.user = {
          id: memUser._id,
          email: memUser.email,
          role: memUser.role,
          name: memUser.name,
          departmentId: memUser.departmentId
        };
        next();
        return;
      }
    }

    // Check in-memory store directly as fallback
    const memUser = getInMemoryStore().getUserById(decoded.id);
    if (memUser && memUser.isActive) {
      req.user = {
        id: memUser._id,
        email: memUser.email,
        role: memUser.role,
        name: memUser.name,
        departmentId: memUser.departmentId
      };
      next();
      return;
    }

    res.status(401).json({
      success: false,
      message: 'User no longer exists or has been deactivated.'
    });
  } catch (err: any) {
    res.status(401).json({
      success: false,
      message: 'Token verification failed.',
      error: err.message
    });
  }
};
