import { useState, useMemo, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { UsersRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { groupsApi, type Group } from '@/lib/groups-api'
import { GroupManagementTable } from './components/group-management-table'
import { CreateGroupDialog } from './components/create-group-dialog'
import { EditGroupDialog } from './components/edit-group-dialog'
import { GroupFilters } from './components/group-filters'

export function GroupManagement() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)
  const [filters, setFilters] = useState<{
    search?: string
  }>({})

  // Fetch all groups
  const {
    data: allGroups = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['groups'],
    queryFn: () => {
      return groupsApi.list({ 
        limit: 100 
      })
    },
  })

  // Filter groups based on search
  const filteredGroups = useMemo(() => {
    let filtered = allGroups

    // Apply search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      filtered = filtered.filter((group) =>
        group.name.toLowerCase().includes(searchTerm)
      )
    }

    return filtered
  }, [allGroups, filters])

  const handleFiltersChange = useCallback((newFilters: typeof filters) => {
    setFilters(newFilters)
  }, [])

  const handleEdit = (group: Group) => {
    setSelectedGroup(group)
    setEditDialogOpen(true)
  }

  const handleSuccess = () => {
    refetch()
    setCreateDialogOpen(false)
    setEditDialogOpen(false)
    setSelectedGroup(null)
  }

  return (
    <>
      {/* ===== Top Heading ===== */}
      <Header>
        <TopNav links={topNav} />
        <div className='ms-auto flex items-center space-x-4'>
          <Search />
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      {/* ===== Main ===== */}
      <Main>
        <div className='mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
          <div className='space-y-1'>
            <h1 className='text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent'>
              Groups
            </h1>
            <p className='text-muted-foreground text-lg'>
              Create and manage learning groups with teachers and students
            </p>
          </div>
          <div className='flex items-center space-x-3'>
            <Button 
              onClick={() => setCreateDialogOpen(true)}
              size='lg'
              className='bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-lg hover:shadow-xl transition-all duration-200'
            >
              <UsersRound className='mr-2 h-5 w-5' />
              Create Group
            </Button>
          </div>
        </div>

        {/* Search and Filter */}
        <GroupFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          className='mb-6'
        />

        {/* Group Table */}
        <GroupManagementTable
          data={filteredGroups}
          isLoading={isLoading}
          onEdit={handleEdit}
          onRefresh={refetch}
        />
      </Main>

      {/* Dialogs */}
      <CreateGroupDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={handleSuccess}
      />

      {selectedGroup && (
        <EditGroupDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          group={selectedGroup}
          onSuccess={handleSuccess}
        />
      )}
    </>
  )
}

const topNav = [
  {
    title: 'Overview',
    href: '/groups',
    isActive: true,
    disabled: false,
  },
  {
    title: 'Group Analytics',
    href: '/groups/analytics',
    isActive: false,
    disabled: true,
  },
]