'use client'

import { useEffect, useRef } from 'react'
import { useTheme } from 'next-themes'

interface ContextMenuProps {
  x: number
  y: number
  onClose: () => void
}

export function ContextMenu({ x, y, onClose }: ContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { setTheme, theme } = useTheme()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  const menuItems = [
    {
      label: 'View',
      items: ['Large icons', 'Medium icons', 'Small icons']
    },
    {
      label: 'Sort by',
      items: ['Name', 'Size', 'Type', 'Date modified']
    },
    {
      label: 'Theme',
      items: ['Light', 'Dark', 'System']
    },
    {
      label: 'Display settings',
      onClick: () => {/* implement settings */}
    },
    {
      label: 'Personalize',
      onClick: () => {/* implement personalization */}
    }
  ]

  return (
    <div
      ref={ref}
      className="fixed bg-background border rounded-md shadow-lg py-1 min-w-[200px]"
      style={{ 
        left: x,
        top: y,
        zIndex: 1000
      }}
    >
      {menuItems.map((item, index) => (
        <div key={index} className="relative group">
          <button
            className="w-full px-4 py-2 text-left hover:bg-accent hover:text-accent-foreground"
            onClick={item.onClick}
          >
            {item.label}
            {item.items && (
              <span className="absolute right-2">▶</span>
            )}
          </button>
          
          {item.items && (
            <div className="absolute left-full top-0 hidden group-hover:block
                          bg-background border rounded-md shadow-lg py-1 min-w-[150px]">
              {item.items.map((subItem, subIndex) => (
                <button
                  key={subIndex}
                  className="w-full px-4 py-2 text-left hover:bg-accent hover:text-accent-foreground"
                  onClick={() => {
                    if (item.label === 'Theme') {
                      setTheme(subItem.toLowerCase())
                    }
                  }}
                >
                  {subItem}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
} 