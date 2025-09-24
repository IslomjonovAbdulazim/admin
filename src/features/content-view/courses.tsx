import { useQuery } from '@tanstack/react-query'
import { BookOpen, GraduationCap, ChevronRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useNavigate } from '@tanstack/react-router'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { adminContentApi, type Course } from '@/lib/content-api'

export function CoursesViewPage() {
  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['admin-courses'],
    queryFn: () => adminContentApi.getCourses(),
  })

  return (
    <>
      <Header>
        <TopNav links={topNav} />
        <div className='ms-auto flex items-center space-x-4'>
          <Search />
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-6'>
          <h1 className='text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent'>
            Courses
          </h1>
          <p className='text-muted-foreground text-lg'>
            View available courses in your learning center
          </p>
        </div>

        {isLoading ? (
          <Card>
            <CardContent className='p-8'>
              <div className='flex items-center justify-center'>
                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
              </div>
            </CardContent>
          </Card>
        ) : courses.length === 0 ? (
          <Card>
            <CardContent className='p-8'>
              <div className='flex flex-col items-center justify-center text-center'>
                <BookOpen className='h-12 w-12 text-muted-foreground mb-4' />
                <p className='text-muted-foreground'>
                  No courses available yet.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </Main>
    </>
  )
}

function CourseCard({ course }: { course: Course }) {
  const navigate = useNavigate()
  return (
    <Card 
      className='hover:shadow-md transition-all cursor-pointer hover:scale-[1.02] p-4'
      onClick={() => navigate({ to: '/content/lessons', search: { courseId: course.id } })}
    >
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <div className='flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-100 to-blue-50 border border-blue-200'>
            <GraduationCap className='h-5 w-5 text-blue-600' />
          </div>
          <div>
            <h3 className='font-semibold text-base'>{course.title}</h3>
            <p className='text-sm text-muted-foreground'>Course #{course.id}</p>
          </div>
        </div>
        <div className='flex items-center gap-2'>
          {course.lessons_count && (
            <Badge variant='outline' className='text-xs'>{course.lessons_count} lessons</Badge>
          )}
          <ChevronRight className='h-4 w-4 text-muted-foreground' />
        </div>
      </div>
      {course.description && (
        <p className='text-sm text-muted-foreground mt-3 line-clamp-2'>{course.description}</p>
      )}
    </Card>
  )
}

const topNav = [
  {
    title: 'Courses',
    href: '/content/courses',
    isActive: true,
    disabled: false,
  },
  {
    title: 'Lessons',
    href: '/content/lessons',
    isActive: false,
    disabled: false,
  },
  {
    title: 'Words',
    href: '/content/words',
    isActive: false,
    disabled: false,
  },
]