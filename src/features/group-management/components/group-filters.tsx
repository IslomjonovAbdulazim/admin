import { useState, useEffect } from 'react'
import { Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useDebounce } from '@/hooks/use-debounce'

interface GroupFiltersProps {
  filters: {
    search?: string
  }
  onFiltersChange: (filters: any) => void
  className?: string
}

export function GroupFilters({ filters, onFiltersChange, className }: GroupFiltersProps) {
  const [searchValue, setSearchValue] = useState(filters.search || '')
  const debouncedSearch = useDebounce(searchValue, 300)

  // Update filters when debounced search changes
  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      onFiltersChange({
        ...filters,
        search: debouncedSearch || undefined,
      })
    }
  }, [debouncedSearch, filters.search])

  const handleSearchChange = (value: string) => {
    setSearchValue(value)
  }

  const clearFilters = () => {
    setSearchValue('')
    onFiltersChange({
      search: undefined,
    })
  }

  const clearSearch = () => {
    setSearchValue('')
    onFiltersChange({
      ...filters,
      search: undefined,
    })
  }

  const hasActiveFilters = filters.search

  return (
    <div className={cn('flex flex-col gap-3 p-4 rounded-lg bg-muted/30 border', className)}>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center'>
        {/* Search Input */}
        <div className='relative flex-1'>
          <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
          <Input
            placeholder='Search groups by name...'
            value={searchValue}
            onChange={(e) => handleSearchChange(e.target.value)}
            className='pl-10 pr-10 h-9'
          />
          {searchValue && (
            <Button
              variant='ghost'
              size='sm'
              onClick={clearSearch}
              className='absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2 p-0 text-muted-foreground'
            >
              <X className='h-3 w-3' />
            </Button>
          )}
        </div>

        {/* Clear Button */}
        {hasActiveFilters && (
          <Button variant='ghost' size='sm' onClick={clearFilters} className='h-9'>
            <X className='h-4 w-4' />
          </Button>
        )}
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className='flex flex-wrap items-center gap-2'>
          {filters.search && (
            <Badge variant='outline' className='text-xs'>
              "{filters.search}"
              <X className='ml-1 h-3 w-3 cursor-pointer' onClick={clearSearch} />
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}