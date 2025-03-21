'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function Settings() {
  const [darkMode, setDarkMode] = useState(false)
  const [notifications, setNotifications] = useState(true)

  return (
    <div className="flex flex-col h-full">
      <Tabs defaultValue="general" className="flex-1">
        <div className="border-b px-4">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
          </TabsList>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-6">
            <TabsContent value="general">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" placeholder="Enter your username" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="Enter your email" />
                </div>
                <Button>Save Changes</Button>
              </div>
            </TabsContent>
            <TabsContent value="appearance">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="dark-mode">Dark Mode</Label>
                  <Switch
                    id="dark-mode"
                    checked={darkMode}
                    onCheckedChange={setDarkMode}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accent-color">Accent Color</Label>
                  <Input
                    id="accent-color"
                    type="color"
                    className="w-20 h-10 p-1"
                  />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="notifications">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="notifications">Enable Notifications</Label>
                  <Switch
                    id="notifications"
                    checked={notifications}
                    onCheckedChange={setNotifications}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notification-sound">Notification Sound</Label>
                  <Input
                    id="notification-sound"
                    type="file"
                    accept="audio/*"
                    className="w-full"
                  />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="about">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Version</Label>
                  <p className="text-sm text-muted-foreground">1.0.0</p>
                </div>
                <div className="space-y-2">
                  <Label>Build</Label>
                  <p className="text-sm text-muted-foreground">2024.03.20</p>
                </div>
                <Button variant="outline">Check for Updates</Button>
              </div>
            </TabsContent>
          </div>
        </ScrollArea>
      </Tabs>
    </div>
  )
} 