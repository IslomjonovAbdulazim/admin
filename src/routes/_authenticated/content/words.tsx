import { createFileRoute } from '@tanstack/react-router'
import { WordsViewPage } from '@/features/content-view'
import { z } from 'zod'

const wordsSearchSchema = z.object({
  courseId: z.number().optional(),
  lessonId: z.number().optional(),
})

export const Route = createFileRoute('/_authenticated/content/words')({
  component: WordsViewPage,
  validateSearch: wordsSearchSchema,
})