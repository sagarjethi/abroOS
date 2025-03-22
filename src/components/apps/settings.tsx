'use client'

import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Icons } from '@/components/ui/icons'

interface SettingItem {
  id: string
  title: string
  description: string
  icon: keyof typeof Icons
  type: 'switch' | 'button'
  action?: () => void
}

const SETTINGS: SettingItem[] = [
  {
    id: 'dark-mode',
    title: 'Dark Mode',
    description: 'Toggle dark mode on or off',
    icon: 'moon',
    type: 'switch',
  },
  {
    id: 'notifications',
    title: 'Notifications',
    description: 'Enable or disable system notifications',
    icon: 'alertCircle',
    type: 'switch',
  },
  {
    id: 'auto-start',
    title: 'Auto Start',
    description: 'Start apps automatically on system startup',
    icon: 'activity',
    type: 'switch',
  },
  {
    id: 'system-update',
    title: 'System Update',
    description: 'Check for system updates',
    icon: 'refresh',
    type: 'button',
  },
  {
    id: 'backup',
    title: 'Backup',
    description: 'Backup system settings and data',
    icon: 'save',
    type: 'button',
  },
  {
    id: 'privacy',
    title: 'Privacy',
    description: 'Manage privacy settings',
    icon: 'fileText',
    type: 'button',
  },
  {
    id: 'about',
    title: 'About',
    description: 'View system information',
    icon: 'info',
    type: 'button',
  },
]

export function Settings() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center h-12 px-4 border-b">
        <div className="flex items-center gap-2">
          <Icons.settings className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Settings</h2>
        </div>
        <div className="flex-1" />
        <Button variant="ghost" size="icon">
          <Icons.refresh className="h-4 w-4" />
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {SETTINGS.map((setting) => {
            const Icon = Icons[setting.icon]
            return (
              <div key={setting.id} className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent/50">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <Label htmlFor={setting.id}>{setting.title}</Label>
                      <p className="text-sm text-muted-foreground">
                        {setting.description}
                      </p>
                    </div>
                  </div>
                  {setting.type === 'switch' ? (
                    <Switch id={setting.id} />
                  ) : (
                    <Button variant="outline" size="sm">
                      Open
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
} 