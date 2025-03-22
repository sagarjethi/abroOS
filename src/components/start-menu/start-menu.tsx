'use client';

import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { useDesktopStore } from '@/hooks/use-desktop-store'
import { cn } from '@/lib/utils'
import { Power } from 'lucide-react'

interface StartMenuProps {
  onClose: () => void
}

export function StartMenu({ onClose }: StartMenuProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { desktopIcons, openApp } = useDesktopStore()

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  const recentApps = desktopIcons.slice(0, 5)
  const allApps = desktopIcons

  return (
    <AnimatePresence>
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.2 }}
        className="fixed bottom-12 left-0 w-80 bg-zinc-900/95 backdrop-blur supports-[backdrop-filter]:bg-zinc-900/90 rounded-t-lg shadow-xl border border-zinc-800 p-4 z-50"
      >
        <div className="space-y-4">
          <div>
            <h2 className="text-sm font-medium mb-2 text-zinc-400">Recent</h2>
            <div className="grid grid-cols-5 gap-2">
              {recentApps.map((app) => {
                const Icon = app.icon
                return (
                  <Button
                    key={app.id}
                    variant="ghost"
                    size="icon"
                    className="h-12 w-12 rounded-lg hover:bg-white/10"
                    onClick={() => {
                      openApp(app.appId)
                      onClose()
                    }}
                  >
                    <Icon className={cn('h-6 w-6', app.color)} />
                  </Button>
                )
              })}
            </div>
          </div>

          <div>
            <h2 className="text-sm font-medium mb-2 text-zinc-400">All Apps</h2>
            <div className="grid grid-cols-4 gap-2">
              {allApps.map((app) => {
                const Icon = app.icon
                return (
                  <Button
                    key={app.id}
                    variant="ghost"
                    className="h-20 w-full flex flex-col items-center justify-center gap-1 rounded-lg hover:bg-white/10"
                    onClick={() => {
                      openApp(app.appId)
                      onClose()
                    }}
                  >
                    <Icon className={cn('h-8 w-8', app.color)} />
                    <span className="text-xs text-white">{app.name}</span>
                  </Button>
                )
              })}
            </div>
          </div>

          <div className="pt-2 border-t border-zinc-800">
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 text-white hover:bg-white/10"
              onClick={onClose}
            >
              <Power className="h-4 w-4" />
              <span>Shut Down</span>
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
} 