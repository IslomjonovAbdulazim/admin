import { useState } from 'react'
import { MoreHorizontal, Trash2, Edit, Phone, Users, Shield, User as UserIcon, GraduationCap, Coins } from 'lucide-react'
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
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { usersApi, type User } from '@/lib/users-api'
import { toast } from 'sonner'

interface UserManagementTableProps {
  data: User[]
  isLoading: boolean
  onEdit: (user: User) => void
  onRefresh: () => void
}

export function UserManagementTable({ data, isLoading, onEdit, onRefresh }: UserManagementTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: (id: number) => usersApi.delete(id),
    onSuccess: () => {
      toast.success('User deleted successfully')
      queryClient.invalidateQueries({ queryKey: ['users'] })
      onRefresh()
      setDeleteDialogOpen(false)
      setUserToDelete(null)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to delete user')
    },
  })

  const handleDelete = (user: User) => {
    setUserToDelete(user)
    setDeleteDialogOpen(true)
  }


  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Admins</CardTitle>
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
          <CardTitle>Admins</CardTitle>
          <CardDescription>No admins found</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex flex-col items-center justify-center py-8'>
            <Users className='h-12 w-12 text-muted-foreground mb-4' />
            <p className='text-muted-foreground text-center'>
              No admins have been created yet.
              <br />
              Click "Add Admin" to get started.
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
                <Users className='h-5 w-5 text-primary' />
                Users ({data.length})
              </CardTitle>
              <CardDescription className='mt-1'>
                Manage teachers and students in your learning center
              </CardDescription>
            </div>
            <div className='text-right'>
              <div className='text-sm text-muted-foreground'>Active Users</div>
              <div className='text-2xl font-bold text-primary'>
                {data.filter(user => user.is_active).length}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Coins</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className='w-[70px]'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((user) => <UserRow key={user.id} user={user} onEdit={onEdit} onDelete={handleDelete} />)}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        handleConfirm={() => userToDelete && deleteMutation.mutate(userToDelete.id)}
        title='Delete Admin'
        desc={`Are you sure you want to delete ${userToDelete?.name}? This action cannot be undone.`}
        confirmText='Delete Admin'
        isLoading={deleteMutation.isPending}
        destructive
      />
    </>
  )
}

// Separate component for user row
function UserRow({ user, onEdit, onDelete }: { 
  user: User
  onEdit: (user: User) => void
  onDelete: (user: User) => void
}) {
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className='h-3 w-3' />
      case 'teacher':
        return <GraduationCap className='h-3 w-3' />
      case 'student':
        return <UserIcon className='h-3 w-3' />
      default:
        return <UserIcon className='h-3 w-3' />
    }
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'default'
      case 'teacher':
        return 'secondary'
      case 'student':
        return 'outline'
      default:
        return 'outline'
    }
  }

  return (
    <TableRow key={user.id}>
      {/* User */}
      <TableCell className='max-w-[300px]'>
        <div className='flex items-center gap-3'>
          <div className='flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-primary/20 to-primary/10 border border-primary/20'>
            <span className='text-sm font-medium text-primary'>
              {user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
            </span>
          </div>
          <div className='min-w-0 flex-1'>
            <div className='font-medium truncate' title={user.name}>{user.name}</div>
            <div className='flex items-center text-sm text-muted-foreground'>
              <Phone className='mr-1 h-3 w-3' />
              <span className='truncate'>{user.phone}</span>
            </div>
          </div>
        </div>
      </TableCell>

      {/* Role */}
      <TableCell>
        <Badge variant={getRoleBadgeVariant(user.role)} className='gap-1'>
          {getRoleIcon(user.role)}
          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
        </Badge>
      </TableCell>

      {/* Coins */}
      <TableCell>
        <div className='flex items-center gap-1 text-sm'>
          <Coins className='h-3 w-3 text-yellow-600' />
          <span className='font-medium'>{user.coins.toLocaleString()}</span>
        </div>
      </TableCell>

      {/* Created */}
      <TableCell>
        <div className='flex items-center gap-2 text-sm text-muted-foreground'>
          {format(new Date(user.created_at), 'MMM dd, yyyy')}
        </div>
      </TableCell>

      {/* Actions */}
      <TableCell>
        {user.role !== 'admin' ? (
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
              <DropdownMenuItem onClick={() => onEdit(user)}>
                <Edit className='mr-2 h-4 w-4' />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => onDelete(user)}
                className='text-red-600'
              >
                <Trash2 className='mr-2 h-4 w-4' />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className='text-xs text-muted-foreground'>Protected</div>
        )}
      </TableCell>
    </TableRow>
  )
}