'use client'

import { FC } from 'react'
import { Icons } from '@/components/ui/icons'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export const Browser: FC = () => {
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
        <Input
          type="text"
          placeholder="Enter URL or search"
          className="h-8 flex-1"
        />
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Icons.search className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 p-4">
        <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground">
          <Icons.globe className="h-12 w-12" />
          <p className="text-lg font-medium">Welcome to Browser</p>
          <p className="text-sm">Enter a URL or search term to get started</p>
        </div>
      </div>
    </div>
  )
} 