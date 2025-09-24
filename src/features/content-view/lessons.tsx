import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearch, useNavigate } from '@tanstack/react-router'
import { BookOpen, GraduationCap, FileText, ArrowLeft, ChevronRight } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { adminContentApi, type Course, type Lesson } from '@/lib/content-api'
import { format } from 'date-fns'

export function LessonsViewPage() {
  const navigate = useNavigate()
  const search = useSearch({ from: '/_authenticated/content/lessons' })
  const [selectedCourseId, setSelectedCourseId] = useState<string>('')

  // Set initial course ID from URL parameter
  useEffect(() => {
    if (search.courseId) {
      setSelectedCourseId(search.courseId.toString())
    }
  }, [search.courseId])

  const { data: courses = [] } = useQuery({
    queryKey: ['admin-courses'],
    queryFn: () => adminContentApi.getCourses(),
  })

  const { data: lessons = [], isLoading } = useQuery({
    queryKey: ['admin-lessons', selectedCourseId],
    queryFn: () => adminContentApi.getCourseLessons(parseInt(selectedCourseId)),
    enabled: !!selectedCourseId,
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
            Lessons
          </h1>
          <p className='text-muted-foreground text-lg'>
            View lessons for each course
          </p>
        </div>

        <Card className='mb-6'>
          <CardHeader>
            <CardTitle>Select Course</CardTitle>
            <CardDescription>Choose a course to view its lessons</CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
              <SelectTrigger className='w-full max-w-md'>
                <SelectValue placeholder='Select a course...' />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id.toString()}>
                    <div className='flex items-center gap-2'>
                      <GraduationCap className='h-4 w-4' />
                      {course.title}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {selectedCourseId && (
          <>
            {isLoading ? (
              <Card>
                <CardContent className='p-8'>
                  <div className='flex items-center justify-center'>
                    <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
                  </div>
                </CardContent>
              </Card>
            ) : lessons.length === 0 ? (
              <Card>
                <CardContent className='p-8'>
                  <div className='flex flex-col items-center justify-center text-center'>
                    <BookOpen className='h-12 w-12 text-muted-foreground mb-4' />
                    <p className='text-muted-foreground'>
                      No lessons found for this course.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
                {lessons.map((lesson) => (
                  <LessonCard key={lesson.id} lesson={lesson} courseId={selectedCourseId} />
                ))}
              </div>
            )}
          </>
        )}
      </Main>
    </>
  )
}

function LessonCard({ lesson, courseId }: { lesson: Lesson; courseId: string }) {
  const navigate = useNavigate()
  return (
    <Card 
      className='hover:shadow-md transition-all cursor-pointer hover:scale-[1.02] p-4'
      onClick={() => navigate({ to: '/content/words', search: { courseId: parseInt(courseId), lessonId: lesson.id } })}
    >
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <div className='flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-green-100 to-green-50 border border-green-200'>
            <span className='text-sm font-bold text-green-600'>{lesson.order}</span>
          </div>
          <div>
            <h3 className='font-semibold text-base'>{lesson.title}</h3>
            <p className='text-sm text-muted-foreground line-clamp-2'>
              {lesson.content || 'No description available'}
            </p>
          </div>
        </div>
        <div className='flex items-center gap-2'>
          {lesson.words_count && (
            <Badge variant='outline' className='text-xs'>{lesson.words_count} words</Badge>
          )}
          <ChevronRight className='h-4 w-4 text-muted-foreground' />
        </div>
      </div>
    </Card>
  )
}

const topNav = [
  {
    title: 'Courses',
    href: '/content/courses',
    isActive: false,
    disabled: false,
  },
  {
    title: 'Lessons',
    href: '/content/lessons',
    isActive: true,
    disabled: false,
  },
  {
    title: 'Words',
    href: '/content/words',
    isActive: false,
    disabled: false,
  },
]