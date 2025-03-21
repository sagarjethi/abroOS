'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { FolderIcon, FileIcon, ChevronRightIcon } from 'lucide-react'

interface FileItem {
  id: string
  name: string
  type: 'folder' | 'file'
  size?: string
  modified?: string
}

const MOCK_FILES: FileItem[] = [
  { id: '1', name: 'Documents', type: 'folder' },
  { id: '2', name: 'Downloads', type: 'folder' },
  { id: '3', name: 'Pictures', type: 'folder' },
  { id: '4', name: 'Music', type: 'folder' },
  { id: '5', name: 'Videos', type: 'folder' },
  { id: '6', name: 'Desktop', type: 'folder' },
  { id: '7', name: 'README.md', type: 'file', size: '2.5 KB', modified: '2024-03-20' },
  { id: '8', name: 'package.json', type: 'file', size: '1.2 KB', modified: '2024-03-20' },
]

export default function FileExplorer() {
  const [currentPath, setCurrentPath] = useState('/')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredFiles = MOCK_FILES.filter(file =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 p-2 border-b">
        <Button variant="ghost" size="sm" onClick={() => setCurrentPath('/')}>
          <ChevronRightIcon className="h-4 w-4 mr-1" />
          Home
        </Button>
        <Input
          placeholder="Search files..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
        />
      </div>
      <ScrollArea className="flex-1">
        <div className="grid grid-cols-4 gap-4 p-4">
          {filteredFiles.map(file => (
            <div
              key={file.id}
              className="flex flex-col items-center p-4 rounded-lg hover:bg-accent cursor-pointer"
            >
              {file.type === 'folder' ? (
                <FolderIcon className="h-12 w-12 text-yellow-500" />
              ) : (
                <FileIcon className="h-12 w-12 text-blue-500" />
              )}
              <span className="mt-2 text-sm text-center truncate w-full">
                {file.name}
              </span>
              {file.type === 'file' && (
                <span className="text-xs text-muted-foreground">
                  {file.size} • {file.modified}
                </span>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
} 