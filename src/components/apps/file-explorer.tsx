'use client'

import { FC } from 'react'
import { Icons } from '@/components/ui/icons'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'

interface FileItem {
  id: string
  name: string
  type: 'file' | 'folder'
  icon: keyof typeof Icons
}

const MOCK_FILES: FileItem[] = [
  { id: '1', name: 'Documents', type: 'folder', icon: 'folder' },
  { id: '2', name: 'Downloads', type: 'folder', icon: 'folder' },
  { id: '3', name: 'Pictures', type: 'folder', icon: 'folder' },
  { id: '4', name: 'Music', type: 'folder', icon: 'folder' },
  { id: '5', name: 'Videos', type: 'folder', icon: 'folder' },
  { id: '6', name: 'Desktop', type: 'folder', icon: 'folder' },
  { id: '7', name: 'readme.txt', type: 'file', icon: 'file' },
  { id: '8', name: 'config.json', type: 'file', icon: 'file' },
]

export const FileExplorer: FC = () => {
  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-2 border-b">
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Icons.arrowLeft className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Icons.arrowRight className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Icons.refresh className="h-4 w-4" />
        </Button>
        <div className="flex-1" />
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Icons.filePlus className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Icons.folderPlus className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          <div className="grid grid-cols-4 gap-4">
            {MOCK_FILES.map((file) => {
              const Icon = Icons[file.icon]
              return (
                <Button
                  key={file.id}
                  variant="ghost"
                  className="flex flex-col items-center gap-2 h-auto p-4"
                >
                  <Icon className="h-8 w-8" />
                  <span className="text-sm text-center truncate w-full">
                    {file.name}
                  </span>
                </Button>
              )
            })}
          </div>
        </div>
      </ScrollArea>
    </div>
  )
} 