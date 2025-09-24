import {
  Command,
  BookOpen,
  GraduationCap,
  Type,
  Users,
  UsersRound,
} from 'lucide-react'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  user: {
    name: 'satnaing',
    email: 'satnaingdev@gmail.com',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
    {
      name: 'Edu Tizim Admin',
      logo: Command,
      plan: 'Super Admin',
    },
  ],
  navGroups: [
    {
      title: 'General',
      items: [
        {
          title: 'Content',
          icon: BookOpen,
          items: [
            {
              title: 'Courses',
              url: '/content/courses',
              icon: GraduationCap,
            },
            {
              title: 'Lessons',
              url: '/content/lessons',
              icon: BookOpen,
            },
            {
              title: 'Words',
              url: '/content/words',
              icon: Type,
            },
          ],
        },
        {
          title: 'Users',
          url: '/user-management',
          icon: Users,
        },
        {
          title: 'Groups',
          url: '/groups',
          icon: UsersRound,
        },
      ],
    },
  ],
}
