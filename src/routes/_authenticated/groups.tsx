import { createFileRoute } from '@tanstack/react-router'
import { GroupManagement } from '@/features/group-management'

export const Route = createFileRoute('/_authenticated/groups')({
  component: GroupManagement,
})