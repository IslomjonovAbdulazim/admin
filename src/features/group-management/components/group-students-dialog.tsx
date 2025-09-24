import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Users, UserPlus, X, Trash2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { groupsApi, type Group } from '@/lib/groups-api'
import { usersApi } from '@/lib/users-api'
import { toast } from 'sonner'

interface GroupStudentsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  group: Group
}

export function GroupStudentsDialog({ open, onOpenChange, group }: GroupStudentsDialogProps) {
  const [selectedStudentId, setSelectedStudentId] = useState<string>('')
  const queryClient = useQueryClient()

  // Fetch all students
  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersApi.list({ limit: 100 }),
    enabled: open,
  })

  const students = users.filter(user => user.role === 'student')

  const addStudentMutation = useMutation({
    mutationFn: (studentId: number) => groupsApi.addStudent(group.id, { student_id: studentId }),
    onSuccess: () => {
      toast.success('Student added to group successfully')
      queryClient.invalidateQueries({ queryKey: ['groups'] })
      setSelectedStudentId('')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to add student to group')
    },
  })

  const removeStudentMutation = useMutation({
    mutationFn: (studentId: number) => groupsApi.removeStudent(group.id, studentId),
    onSuccess: () => {
      toast.success('Student removed from group successfully')
      queryClient.invalidateQueries({ queryKey: ['groups'] })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to remove student from group')
    },
  })

  const handleAddStudent = () => {
    if (selectedStudentId) {
      addStudentMutation.mutate(parseInt(selectedStudentId))
    }
  }

  const handleRemoveStudent = (studentId: number) => {
    removeStudentMutation.mutate(studentId)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[600px]'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <div className='flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-100 to-blue-50 border border-blue-200'>
              <Users className='h-5 w-5 text-blue-600' />
            </div>
            Manage Students - {group.name}
          </DialogTitle>
          <DialogDescription>
            Add or remove students from this group. Students must be registered in the system first.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-6'>
          {/* Add Student Section */}
          <Card>
            <CardHeader className='pb-3'>
              <CardTitle className='text-lg flex items-center gap-2'>
                <UserPlus className='h-4 w-4' />
                Add Student
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='flex gap-3'>
                <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                  <SelectTrigger className='flex-1'>
                    <SelectValue placeholder='Select a student to add' />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((student) => (
                      <SelectItem key={student.id} value={student.id.toString()}>
                        <div className='flex items-center space-x-3'>
                          <div className='flex h-6 w-6 items-center justify-center rounded-full bg-green-100'>
                            <span className='text-xs font-medium text-green-600'>
                              {student.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className='font-medium'>{student.name}</div>
                            <div className='text-xs text-muted-foreground'>
                              {student.phone}
                            </div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button 
                  onClick={handleAddStudent}
                  disabled={!selectedStudentId || addStudentMutation.isPending}
                  className='bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
                >
                  <UserPlus className='h-4 w-4' />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Current Students Section */}
          <Card>
            <CardHeader className='pb-3'>
              <CardTitle className='text-lg flex items-center gap-2'>
                <Users className='h-4 w-4' />
                Current Students ({group.student_count})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {group.student_count === 0 ? (
                <div className='text-center py-8'>
                  <Users className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
                  <p className='text-muted-foreground'>
                    No students in this group yet.
                    <br />
                    Add students using the form above.
                  </p>
                </div>
              ) : (
                <div className='space-y-2'>
                  <p className='text-sm text-muted-foreground mb-4'>
                    This group has {group.student_count} students. Individual student management will be available in a future update.
                  </p>
                  <Badge variant='secondary' className='text-xs'>
                    {group.student_count} students enrolled
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className='flex justify-end'>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}