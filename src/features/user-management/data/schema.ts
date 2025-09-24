import { z } from 'zod'

// Schema for creating a new user (admin can only create teacher/student)
export const createUserSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  phone: z
    .string()
    .min(13, 'Phone number must be in format +998XXXXXXXXX')
    .regex(/^\+998\d{9}$/, 'Please enter a valid Uzbek phone number (+998XXXXXXXXX)'),
  role: z.enum(['teacher', 'student'], {
    message: 'Please select a role (admins can only create teachers and students)',
  }),
})

// Schema for updating a user (cannot change role to admin)
export const updateUserSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  phone: z
    .string()
    .min(13, 'Phone number must be in format +998XXXXXXXXX')
    .regex(/^\+998\d{9}$/, 'Please enter a valid Uzbek phone number (+998XXXXXXXXX)'),
  role: z.enum(['teacher', 'student'], {
    message: 'Cannot change role to admin',
  }),
})

// Schema for filtering users
export const userFiltersSchema = z.object({
  role: z.enum(['all', 'admin', 'teacher', 'student']).default('all'),
  search: z.string().optional(),
})

export type CreateUserData = z.infer<typeof createUserSchema>
export type UpdateUserData = z.infer<typeof updateUserSchema>
export type UserFilters = z.infer<typeof userFiltersSchema>

// Role configuration
export const roleConfig = {
  admin: {
    label: 'Admin',
    color: 'purple',
    description: 'Full access to learning center management',
  },
  teacher: {
    label: 'Teacher',
    color: 'blue',
    description: 'Manage classes, students, and content',
  },
  student: {
    label: 'Student',
    color: 'green',
    description: 'Access learning materials and courses',
  },
} as const