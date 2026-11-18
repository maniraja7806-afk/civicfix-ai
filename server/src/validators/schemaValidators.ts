import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().optional(),
  role: z.enum(['citizen', 'officer', 'admin']).default('citizen'),
  address: z.string().optional(),
  departmentId: z.string().optional(),
  designation: z.string().optional()
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

export const createComplaintSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(150),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.enum([
    'Roads & Potholes',
    'Garbage & Sanitation',
    'Water Leakage & Supply',
    'Streetlight & Electrical',
    'Drainage & Sewerage',
    'Public Health & Hygiene',
    'Public Safety & Parks',
    'Other Infrastructure'
  ]),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  address: z.string().min(3, 'Address is required'),
  landmark: z.string().optional(),
  priority: z.enum(['Critical', 'High', 'Medium', 'Low']).optional(),
  aiAnalysis: z.any().optional()
});

export const updateComplaintStatusSchema = z.object({
  status: z.enum([
    'Submitted',
    'AI Analysis',
    'Under Review',
    'Assigned',
    'In Progress',
    'Resolved',
    'Citizen Verification',
    'Closed',
    'Rejected',
    'Reopened'
  ]),
  comment: z.string().optional(),
  evidenceImages: z.array(z.string()).optional(),
  rejectionReason: z.string().optional(),
  reopenReason: z.string().optional()
});

export const assignComplaintSchema = z.object({
  departmentId: z.string().min(1, 'Department ID is required'),
  officerId: z.string().optional(),
  priority: z.enum(['Critical', 'High', 'Medium', 'Low']).optional(),
  adminNotes: z.string().optional()
});

export const citizenFeedbackSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
  isSatisfied: z.boolean().default(true)
});

export const departmentSchema = z.object({
  name: z.string().min(3, 'Department name is required'),
  code: z.string().min(2, 'Department code is required'),
  description: z.string().min(10, 'Description is required'),
  categoryMappings: z.array(z.string()),
  headOfficerName: z.string().optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional(),
  slaHours: z.object({
    critical: z.number().default(6),
    high: z.number().default(24),
    medium: z.number().default(72),
    low: z.number().default(168)
  }).optional()
});
