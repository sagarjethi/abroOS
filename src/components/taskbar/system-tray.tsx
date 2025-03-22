'use client';
import { useTheme } from 'next-themes'
import { format } from 'date-fns'
import { useState, useEffect } from 'react'

export function SystemTray() {
  const { theme, setTheme } = useTheme()
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="flex items-center gap-4 px-4">
      <button
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className="p-1 rounded-md hover:bg-accent/50"
      >
        {theme === 'dark' ? '🌙' : '☀️'}
      </button>
      
      <div className="text-sm">
        {format(time, 'HH:mm')}
      </div>
    </div>
  )
} 