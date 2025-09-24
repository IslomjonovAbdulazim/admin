import { createFileRoute } from '@tanstack/react-router'
import { CoursesViewPage } from '@/features/content-view'

export const Route = createFileRoute('/_authenticated/content/courses')({
  component: CoursesViewPage,
})