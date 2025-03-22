"use client"

import { WindowState } from '@/types/system'
import { APP_REGISTRY } from '@/lib/apps/registry'

interface WindowContentProps {
  children: React.ReactNode
}

export function WindowContent({ children }: WindowContentProps) {
  return (
    <div className="h-[calc(100%-2rem)] overflow-auto">
      {children}
    </div>
  )
} 