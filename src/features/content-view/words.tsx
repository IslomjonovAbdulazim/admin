import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearch, useNavigate } from '@tanstack/react-router'
import { BookOpen, GraduationCap, FileText, Type, Volume2, Image } from 'lucide-react'
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
import { adminContentApi, type Course, type Lesson, type Word } from '@/lib/content-api'
import { getStaticUrl } from '@/lib/utils'
import { ImagePreviewDialog } from './components/image-preview-dialog'

export function WordsViewPage() {
  const navigate = useNavigate()
  const search = useSearch({ from: '/_authenticated/content/words' })
  const [selectedCourseId, setSelectedCourseId] = useState<string>('')
  const [selectedLessonId, setSelectedLessonId] = useState<string>('')
  const [imageDialog, setImageDialog] = useState<{ open: boolean; imageUrl: string; wordText: string }>({
    open: false,
    imageUrl: '',
    wordText: '',
  })

  // Set initial course and lesson IDs from URL parameters
  useEffect(() => {
    if (search.courseId) {
      setSelectedCourseId(search.courseId.toString())
    }
    if (search.lessonId) {
      setSelectedLessonId(search.lessonId.toString())
    }
  }, [search.courseId, search.lessonId])

  const { data: courses = [] } = useQuery({
    queryKey: ['admin-courses'],
    queryFn: () => adminContentApi.getCourses(),
  })

  const { data: lessons = [] } = useQuery({
    queryKey: ['admin-lessons', selectedCourseId],
    queryFn: () => adminContentApi.getCourseLessons(parseInt(selectedCourseId)),
    enabled: !!selectedCourseId,
  })

  const { data: words = [], isLoading } = useQuery({
    queryKey: ['admin-words', selectedLessonId],
    queryFn: () => adminContentApi.getLessonWords(parseInt(selectedLessonId)),
    enabled: !!selectedLessonId,
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
            Words
          </h1>
          <p className='text-muted-foreground text-lg'>
            View vocabulary words for each lesson
          </p>
        </div>

        <div className='flex gap-4 mb-6'>
          <Select value={selectedCourseId} onValueChange={(value) => {
            setSelectedCourseId(value)
            setSelectedLessonId('')
          }}>
            <SelectTrigger className='w-[200px]'>
              <SelectValue placeholder='Select course...' />
            </SelectTrigger>
            <SelectContent>
              {courses.map((course) => (
                <SelectItem key={course.id} value={course.id.toString()}>
                  {course.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select 
            value={selectedLessonId} 
            onValueChange={setSelectedLessonId}
            disabled={!selectedCourseId}
          >
            <SelectTrigger className='w-[200px]'>
              <SelectValue placeholder={selectedCourseId ? 'Select lesson...' : 'Select course first'} />
            </SelectTrigger>
            <SelectContent>
              {lessons.map((lesson) => (
                <SelectItem key={lesson.id} value={lesson.id.toString()}>
                  {lesson.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedLessonId && (
          <>
            {isLoading ? (
              <Card>
                <CardContent className='p-8'>
                  <div className='flex items-center justify-center'>
                    <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
                  </div>
                </CardContent>
              </Card>
            ) : words.length === 0 ? (
              <Card>
                <CardContent className='p-8'>
                  <div className='flex flex-col items-center justify-center text-center'>
                    <Type className='h-12 w-12 text-muted-foreground mb-4' />
                    <p className='text-muted-foreground'>
                      No words found for this lesson.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
                {words.map((word) => (
                  <WordCard 
                    key={word.id} 
                    word={word} 
                    onImageClick={(imageUrl, wordText) => {
                      setImageDialog({ open: true, imageUrl, wordText })
                    }} 
                  />
                ))}
              </div>
            )}
          </>
        )}

        <ImagePreviewDialog
          open={imageDialog.open}
          onOpenChange={(open) => setImageDialog(prev => ({ ...prev, open }))}
          imageUrl={imageDialog.imageUrl}
          wordText={imageDialog.wordText}
        />
      </Main>
    </>
  )
}

function WordCard({ word, onImageClick }: { word: Word; onImageClick?: (imageUrl: string, wordText: string) => void }) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-700 border-green-200'
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'hard': return 'bg-red-100 text-red-700 border-red-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  return (
    <Card className='p-4'>
      <div className='flex items-start justify-between mb-3'>
        <div className='flex items-center gap-2'>
          <div className='flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-purple-100 to-purple-50 border border-purple-200'>
            <Type className='h-4 w-4 text-purple-600' />
          </div>
          <div>
            <h3 className='font-semibold text-base'>{word.word}</h3>
            <p className='text-sm text-muted-foreground'>{word.translation}</p>
          </div>
        </div>
        <Badge className={`${getDifficultyColor(word.difficulty)} text-xs`}>
          {word.difficulty}
        </Badge>
      </div>

      {word.definition && (
        <p className='text-sm text-muted-foreground mb-2 line-clamp-2'>{word.definition}</p>
      )}

      {word.sentence && (
        <p className='text-sm italic text-muted-foreground mb-3 line-clamp-2'>"{word.sentence}"</p>
      )}

      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          {word.audio && (
            <button 
              className='flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800'
              onClick={() => {
                const audioUrl = getStaticUrl(word.audio)
                if (audioUrl) {
                  const audio = new Audio(audioUrl)
                  audio.play().catch(console.error)
                }
              }}
            >
              <Volume2 className='h-3 w-3' />
              Audio
            </button>
          )}
          {word.image && (
            <button 
              className='flex items-center gap-1 text-xs text-green-600 hover:text-green-800'
              onClick={() => {
                const imageUrl = getStaticUrl(word.image)
                if (imageUrl) {
                  onImageClick?.(imageUrl, word.word)
                }
              }}
            >
              <Image className='h-3 w-3' />
              Image
            </button>
          )}
        </div>
        <span className='text-xs text-muted-foreground'>#{word.order}</span>
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
    isActive: false,
    disabled: false,
  },
  {
    title: 'Words',
    href: '/content/words',
    isActive: true,
    disabled: false,
  },
]