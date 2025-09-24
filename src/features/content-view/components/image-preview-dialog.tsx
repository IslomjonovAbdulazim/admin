import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ExternalLink, X } from 'lucide-react'

interface ImagePreviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  imageUrl: string
  wordText: string
}

export function ImagePreviewDialog({ open, onOpenChange, imageUrl, wordText }: ImagePreviewDialogProps) {
  const handleOpenNewTab = () => {
    window.open(imageUrl, '_blank')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-4xl max-h-[90vh] p-0'>
        <DialogHeader className='p-4 pb-2'>
          <div className='flex items-center justify-between'>
            <DialogTitle className='flex items-center gap-2'>
              Image for "{wordText}"
            </DialogTitle>
            <div className='flex items-center gap-4'>
              <Button
                variant='outline'
                size='sm'
                onClick={handleOpenNewTab}
                className='flex items-center gap-1'
              >
                <ExternalLink className='h-4 w-4' />
                Open
              </Button>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => onOpenChange(false)}
                className='p-2'
              >
                <X className='h-6 w-6' />
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        <div className='px-4 pb-4 flex justify-center'>
          <img
            src={imageUrl}
            alt={`Image for ${wordText}`}
            className='max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg'
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y5ZmFmYiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2YjczODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBub3QgZm91bmQ8L3RleHQ+PC9zdmc+'
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}