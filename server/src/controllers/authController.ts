import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User';
import { Department } from '../models/Department';
import { config } from '../config/env';
import { registerSchema, loginSchema } from '../validators/schemaValidators';
import { AuthRequest } from '../middleware/authMiddleware';
import { getInMemoryStore } from '../utils/inMemoryStore';
import { logger } from '../utils/logger';

const generateToken = (user: any) => {
  return jwt.sign(
    {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name
    },
    config.jwtSecret,
    { expiresIn: '7d' }
  );
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = registerSchema.parse(req.body);

    const existingUser =
      (await User.findOne({ email: validatedData.email.toLowerCase() }).catch(() => null)) ||
      getInMemoryStore().getUserByEmail(validatedData.email);

    if (existingUser) {
      res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.'
      });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(validatedData.password, salt);

    let newUser: any;

    try {
      newUser = await User.create({
        name: validatedData.name,
        email: validatedData.email.toLowerCase(),
        passwordHash,
        phone: validatedData.phone,
        role: validatedData.role,
        address: validatedData.address,
        departmentId: validatedData.departmentId || undefined,
        designation: validatedData.designation
      });
    } catch (dbErr) {
      // In-memory fallback
      newUser = getInMemoryStore().saveUser({
        name: validatedData.name,
        email: validatedData.email.toLowerCase(),
        passwordHash,
        phone: validatedData.phone,
        role: validatedData.role,
        address: validatedData.address,
        departmentId: validatedData.departmentId || undefined,
        designation: validatedData.designation,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    const token = generateToken(newUser);

    res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      token,
      user: {
        id: newUser._id.toString(),
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        phone: newUser.phone,
        address: newUser.address,
        departmentId: newUser.departmentId
      }
    });
  } catch (error: any) {
    logger.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Registration failed'
    });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = loginSchema.parse(req.body);

    let user: any = null;
    try {
      user = await User.findOne({ email: validatedData.email.toLowerCase() });
    } catch {
      user = getInMemoryStore().getUserByEmail(validatedData.email);
    }

    if (!user) {
      user = getInMemoryStore().getUserByEmail(validatedData.email);
    }

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
      return;
    }

    const isMatch = await bcrypt.compare(validatedData.password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
      return;
    }

    if (user.isActive === false) {
      res.status(403).json({
        success: false,
        message: 'This account has been deactivated. Please contact municipal administration.'
      });
      return;
    }

    const token = generateToken(user);

    res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        departmentId: user.departmentId ? user.departmentId.toString() : undefined
      }
    });
  } catch (error: any) {
    logger.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Login failed'
    });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    let user: any = null;
    try {
      user = await User.findById(req.user.id).select('-passwordHash').populate('departmentId');
    } catch {
      user = getInMemoryStore().getUserById(req.user.id);
    }

    if (!user) {
      user = getInMemoryStore().getUserById(req.user.id);
    }

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        department: user.departmentId,
        avatar: user.avatar,
        isActive: user.isActive
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Demo Login for 1-click SIH presentation
export const demoLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const role = (req.body.role || 'citizen') as 'citizen' | 'officer' | 'admin';

    let user: any = null;
    try {
      user = await User.findOne({ role });
    } catch {
      // In-memory lookup
      for (const u of getInMemoryStore().users.values()) {
        if (u.role === role) {
          user = u;
          break;
        }
      }
    }

    if (!user) {
      for (const u of getInMemoryStore().users.values()) {
        if (u.role === role) {
          user = u;
          break;
        }
      }
    }

    if (!user) {
      // Create quick demo user
      const demoUsers = {
        citizen: {
          name: 'Aarav Sharma (Citizen)',
          email: 'citizen@civicfix.gov.in',
          role: 'citizen',
          address: 'Connaught Place, New Delhi',
          phone: '+91 98765 43210'
        },
        officer: {
          name: 'Rajesh Kumar (Municipal Officer)',
          email: 'officer@civicfix.gov.in',
          role: 'officer',
          address: 'Central Zone Office, PWD',
          phone: '+91 98111 22334',
          designation: 'Senior Executive Engineer'
        },
        admin: {
          name: 'Pooja Verma (City Commissioner)',
          email: 'admin@civicfix.gov.in',
          role: 'admin',
          address: 'Municipal Corporation HQ',
          phone: '+91 99999 88888',
          designation: 'Chief Municipal Commissioner'
        }
      };

      const target = demoUsers[role];
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash('CivicFix@2026', salt);
      user = getInMemoryStore().saveUser({
        ...target,
        passwordHash,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    const token = generateToken(user);

    res.status(200).json({
      success: true,
      message: `Demo logged in as ${role.toUpperCase()}`,
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        departmentId: user.departmentId ? user.departmentId.toString() : undefined
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const logout = async (_req: Request, res: Response): Promise<void> => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully.'
  });
};
