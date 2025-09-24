import { z } from 'zod'

export const createGroupSchema = z.object({
  name: z.string().min(2, 'Group name must be at least 2 characters'),
  course_id: z.number().positive('Please select a course'),
  teacher_id: z.number().positive('Please select a teacher'),
})

export const updateGroupSchema = z.object({
  name: z.string().min(2, 'Group name must be at least 2 characters').optional(),
  course_id: z.number().positive('Please select a course').optional(),
  teacher_id: z.number().positive('Please select a teacher').optional(),
})

export const addStudentSchema = z.object({
  student_id: z.number().positive('Please select a student'),
})

export type CreateGroupData = z.infer<typeof createGroupSchema>
export type UpdateGroupData = z.infer<typeof updateGroupSchema>
export type AddStudentData = z.infer<typeof addStudentSchema>