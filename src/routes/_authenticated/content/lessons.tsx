import { createFileRoute } from '@tanstack/react-router'
import { LessonsViewPage } from '@/features/content-view'
import { z } from 'zod'

const lessonsSearchSchema = z.object({
  courseId: z.number().optional(),
})

export const Route = createFileRoute('/_authenticated/content/lessons')({
  component: LessonsViewPage,
  validateSearch: lessonsSearchSchema,
})