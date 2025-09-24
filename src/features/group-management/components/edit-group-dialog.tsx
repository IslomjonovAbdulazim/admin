import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { Edit, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { groupsApi, type Group } from '@/lib/groups-api'
import { usersApi } from '@/lib/users-api'
import { adminContentApi } from '@/lib/content-api'
import { updateGroupSchema, type UpdateGroupData } from '../data/schema'
import { toast } from 'sonner'

interface EditGroupDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  group: Group
  onSuccess: () => void
}

export function EditGroupDialog({ open, onOpenChange, group, onSuccess }: EditGroupDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const queryClient = useQueryClient()

  const form = useForm<UpdateGroupData>({
    resolver: zodResolver(updateGroupSchema),
    defaultValues: {
      name: group.name,
      course_id: group.course_id,
      teacher_id: group.teacher_id,
    },
  })

  // Reset form when group changes
  useEffect(() => {
    if (group) {
      form.reset({
        name: group.name,
        course_id: group.course_id,
        teacher_id: group.teacher_id,
      })
    }
  }, [group, form])

  // Fetch teachers for selection
  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersApi.list({ limit: 100 }),
    enabled: open,
  })

  // Fetch courses for selection
  const { data: courses = [] } = useQuery({
    queryKey: ['admin-courses'],
    queryFn: () => adminContentApi.getCourses(),
    enabled: open,
  })

  const teachers = users.filter(user => user.role === 'teacher')

  const updateMutation = useMutation({
    mutationFn: (data: UpdateGroupData) => groupsApi.update(group.id, data),
    onSuccess: () => {
      toast.success('Group updated successfully')
      queryClient.invalidateQueries({ queryKey: ['groups'] })
      onSuccess()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to update group')
    },
    onSettled: () => {
      setIsSubmitting(false)
    },
  })

  const onSubmit = async (data: UpdateGroupData) => {
    setIsSubmitting(true)
    updateMutation.mutate(data)
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!isSubmitting) {
      onOpenChange(newOpen)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <div className='flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-primary/20 to-primary/10 border border-primary/20'>
              <Edit className='h-5 w-5 text-primary' />
            </div>
            Edit Group
          </DialogTitle>
          <DialogDescription>
            Update group information. Changes will be applied immediately.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <div className='grid gap-4'>
              {/* Current Group Info */}
              <div className='rounded-lg bg-muted/50 p-3'>
                <div className='flex items-center space-x-3'>
                  <div className='flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-100 to-blue-50 border border-blue-200'>
                    <span className='text-sm font-medium text-blue-600'>
                      {group.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </span>
                  </div>
                  <div className='flex-1'>
                    <div className='font-medium'>{group.name}</div>
                    <div className='text-sm text-muted-foreground'>
                      Course #{group.course_id} • Teacher #{group.teacher_id}
                    </div>
                  </div>
                  <Badge variant='secondary'>
                    {group.student_count} students
                  </Badge>
                </div>
              </div>

              {/* Name Field */}
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Group Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder='Enter group name' 
                        {...field} 
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Course Field */}
              <FormField
                control={form.control}
                name='course_id'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(parseInt(value))} 
                      value={field.value?.toString() || ''}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select a course' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {courses.map((course) => (
                          <SelectItem key={course.id} value={course.id.toString()}>
                            <div className='flex items-center space-x-3'>
                              <div className='flex h-6 w-6 items-center justify-center rounded-full bg-blue-100'>
                                <span className='text-xs font-medium text-blue-600'>
                                  {course.title.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                </span>
                              </div>
                              <div>
                                <div className='font-medium'>{course.title}</div>
                                <div className='text-xs text-muted-foreground'>
                                  ID: {course.id}
                                </div>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Teacher Field */}
              <FormField
                control={form.control}
                name='teacher_id'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teacher</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(parseInt(value))} 
                      value={field.value?.toString() || ''}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select a teacher' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {teachers.map((teacher) => (
                          <SelectItem key={teacher.id} value={teacher.id.toString()}>
                            <div className='flex items-center space-x-3'>
                              <div className='flex h-6 w-6 items-center justify-center rounded-full bg-blue-100'>
                                <span className='text-xs font-medium text-blue-600'>
                                  {teacher.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <div className='font-medium'>{teacher.name}</div>
                                <div className='text-xs text-muted-foreground'>
                                  {teacher.phone}
                                </div>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={() => handleOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type='submit'
                disabled={isSubmitting}
                className='bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80'
              >
                {isSubmitting && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                Update Group
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}