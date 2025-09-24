import { useState } from 'react'
import { MoreHorizontal, Trash2, Edit, UsersRound, GraduationCap, BookOpen, User, Users } from 'lucide-react'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { groupsApi, type Group } from '@/lib/groups-api'
import { adminContentApi } from '@/lib/content-api'
import { usersApi } from '@/lib/users-api'
import { GroupStudentsDialog } from './group-students-dialog'
import { toast } from 'sonner'

interface GroupManagementTableProps {
  data: Group[]
  isLoading: boolean
  onEdit: (group: Group) => void
  onRefresh: () => void
}

interface GroupRowProps { 
  group: Group
  onEdit: (group: Group) => void
  onDelete: (group: Group) => void
  onManageStudents: (group: Group) => void
}

export function GroupManagementTable({ data, isLoading, onEdit, onRefresh }: GroupManagementTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [studentsDialogOpen, setStudentsDialogOpen] = useState(false)
  const [groupToDelete, setGroupToDelete] = useState<Group | null>(null)
  const [selectedGroupForStudents, setSelectedGroupForStudents] = useState<Group | null>(null)
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: (id: number) => groupsApi.delete(id),
    onSuccess: () => {
      toast.success('Group deleted successfully')
      queryClient.invalidateQueries({ queryKey: ['groups'] })
      onRefresh()
      setDeleteDialogOpen(false)
      setGroupToDelete(null)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to delete group')
    },
  })

  const handleDelete = (group: Group) => {
    setGroupToDelete(group)
    setDeleteDialogOpen(true)
  }

  const handleManageStudents = (group: Group) => {
    setSelectedGroupForStudents(group)
    setStudentsDialogOpen(true)
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Groups</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex items-center justify-center py-8'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Groups</CardTitle>
          <CardDescription>No groups found</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex flex-col items-center justify-center py-8'>
            <UsersRound className='h-12 w-12 text-muted-foreground mb-4' />
            <p className='text-muted-foreground text-center'>
              No groups have been created yet.
              <br />
              Click "Create Group" to get started.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className='border-0 shadow-lg bg-gradient-to-br from-card via-card to-card/95'>
        <CardHeader className='pb-4'>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle className='text-xl font-semibold flex items-center gap-2'>
                <UsersRound className='h-5 w-5 text-primary' />
                Groups ({data.length})
              </CardTitle>
              <CardDescription className='mt-1'>
                Manage learning groups with teachers and students
              </CardDescription>
            </div>
            <div className='text-right'>
              <div className='text-sm text-muted-foreground'>Total Students</div>
              <div className='text-2xl font-bold text-primary'>
                {data.reduce((sum, group) => sum + group.student_count, 0)}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Group Name</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Teacher</TableHead>
                <TableHead>Students</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className='w-[70px]'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((group) => (
                <GroupRow 
                  key={group.id} 
                  group={group} 
                  onEdit={onEdit} 
                  onDelete={handleDelete}
                  onManageStudents={handleManageStudents}
                />
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        handleConfirm={() => groupToDelete && deleteMutation.mutate(groupToDelete.id)}
        title='Delete Group'
        desc={`Are you sure you want to delete "${groupToDelete?.name}"? This action cannot be undone.`}
        confirmText='Delete Group'
        isLoading={deleteMutation.isPending}
        destructive
      />

      {selectedGroupForStudents && (
        <GroupStudentsDialog
          open={studentsDialogOpen}
          onOpenChange={setStudentsDialogOpen}
          group={selectedGroupForStudents}
        />
      )}
    </>
  )
}

// Separate component for group row
function GroupRow({ group, onEdit, onDelete, onManageStudents }: GroupRowProps) {
  // Fetch courses to show names instead of IDs
  const { data: courses = [] } = useQuery({
    queryKey: ['admin-courses'],
    queryFn: () => adminContentApi.getCourses(),
  })

  // Fetch users to show teacher names instead of IDs
  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersApi.list({ limit: 100 }),
  })

  const getCourseTitle = (courseId: number) => {
    const course = courses.find(c => c.id === courseId)
    return course?.title || `Course #${courseId}`
  }

  const getTeacherName = (teacherId: number) => {
    const teacher = users.find(u => u.id === teacherId && u.role === 'teacher')
    return teacher?.name || `Teacher #${teacherId}`
  }
  return (
    <TableRow>
      {/* Group Name */}
      <TableCell className='max-w-[300px]'>
        <div className='flex items-center gap-3'>
          <div className='flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-100 to-blue-50 border border-blue-200'>
            <UsersRound className='h-5 w-5 text-blue-600' />
          </div>
          <div className='min-w-0 flex-1'>
            <div className='font-medium truncate' title={group.name}>{group.name}</div>
            <div className='text-sm text-muted-foreground'>
              Group ID: {group.id}
            </div>
          </div>
        </div>
      </TableCell>

      {/* Course */}
      <TableCell>
        <div className='flex items-center gap-2'>
          <BookOpen className='h-4 w-4 text-muted-foreground' />
          <span className='text-sm font-medium'>{getCourseTitle(group.course_id)}</span>
        </div>
      </TableCell>

      {/* Teacher */}
      <TableCell>
        <div className='flex items-center gap-2'>
          <GraduationCap className='h-4 w-4 text-muted-foreground' />
          <span className='text-sm font-medium'>{getTeacherName(group.teacher_id)}</span>
        </div>
      </TableCell>

      {/* Students */}
      <TableCell>
        <Badge variant='secondary' className='gap-1'>
          <User className='h-3 w-3' />
          {group.student_count} students
        </Badge>
      </TableCell>

      {/* Created */}
      <TableCell>
        <div className='text-sm text-muted-foreground'>
          {format(new Date(group.created_at), 'MMM dd, yyyy')}
        </div>
      </TableCell>

      {/* Actions */}
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' className='h-8 w-8 p-0'>
              <span className='sr-only'>Open menu</span>
              <MoreHorizontal className='h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onManageStudents(group)}>
              <Users className='mr-2 h-4 w-4' />
              Manage Students
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(group)}>
              <Edit className='mr-2 h-4 w-4' />
              Edit Group
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => onDelete(group)}
              className='text-red-600'
            >
              <Trash2 className='mr-2 h-4 w-4' />
              Delete Group
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  )
}