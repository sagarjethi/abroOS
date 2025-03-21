'use client'

import { FC } from 'react'
import { WindowState, WindowAction } from '@/types/system'
import { cn } from '@/lib/utils'

interface WindowProps {
  window: WindowState
  onAction: (action: WindowAction) => void
}

export const Window: FC<WindowProps> = ({ window, onAction }) => {
  return (
    <div
      className={cn(
        'fixed pointer-events-auto',
        'flex flex-col rounded-lg border border-border shadow-lg',
        'bg-background/80 backdrop-blur-md',
        window.isMinimized && 'hidden'
      )}
      style={{
        left: window.position.x,
        top: window.position.y,
        width: window.size.width,
        height: window.size.height,
        zIndex: window.zIndex
      }}
    >
      <div className="flex items-center h-10 px-4 border-b border-border">
        <div className="flex items-center gap-2 flex-1">
          <img
            src={window.icon}
            alt={window.title}
            className="w-4 h-4"
          />
          <span className="text-sm font-medium">{window.title}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onAction({ type: 'MINIMIZE', windowId: window.id })}
            className="w-6 h-6 rounded-md hover:bg-accent/50 transition-colors flex items-center justify-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
          <button
            onClick={() => onAction({ type: 'MAXIMIZE', windowId: window.id })}
            className="w-6 h-6 rounded-md hover:bg-accent/50 transition-colors flex items-center justify-center"
          >
            {window.isMaximized ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4"
              >
                <rect x="4" y="4" width="16" height="16" rx="2" ry="2" />
                <line x1="4" y1="10" x2="20" y2="10" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              </svg>
            )}
          </button>
          <button
            onClick={() => onAction({ type: 'CLOSE', windowId: window.id })}
            className="w-6 h-6 rounded-md hover:bg-red-500/50 transition-colors flex items-center justify-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>
      <div className="flex-1 p-4">
        {/* Window content will be rendered here */}
      </div>
    </div>
  )
} 