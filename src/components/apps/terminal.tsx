'use client'

import { FC, useEffect, useRef, useState } from 'react'
import { Icons } from '@/components/ui/icons'
import { Button } from '@/components/ui/button'

interface Command {
  input: string
  output: string
}

export const Terminal: FC = () => {
  const [commands, setCommands] = useState<Command[]>([
    {
      input: 'welcome',
      output: 'Welcome to AbroOS Terminal! Type "help" to see available commands.',
    },
  ])
  const [currentInput, setCurrentInput] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleCommand = (command: string) => {
    let output = ''
    switch (command.toLowerCase()) {
      case 'help':
        output = `Available commands:
- help: Show this help message
- clear: Clear the terminal
- echo <text>: Display the text
- date: Show current date and time
- pwd: Show current directory
- ls: List files and directories`
        break
      case 'clear':
        setCommands([])
        return
      case 'date':
        output = new Date().toLocaleString()
        break
      case 'pwd':
        output = '/home/user'
        break
      case 'ls':
        output = `Documents  Downloads  Pictures  Music  Videos  Desktop`
        break
      default:
        if (command.startsWith('echo ')) {
          output = command.slice(5)
        } else {
          output = `Command not found: ${command}`
        }
    }
    setCommands((prev) => [...prev, { input: command, output }])
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentInput.trim()) return
    handleCommand(currentInput)
    setCurrentInput('')
  }

  return (
    <div className="flex flex-col h-full bg-black text-green-400 font-mono">
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-2 border-b border-border">
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Icons.terminal className="h-4 w-4" />
        </Button>
        <div className="flex-1" />
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Icons.refresh className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {commands.map((command, index) => (
          <div key={index} className="mb-2">
            <div className="flex items-center gap-2">
              <span className="text-green-500">$</span>
              <span>{command.input}</span>
            </div>
            {command.output && (
              <div className="mt-1 ml-4 whitespace-pre-wrap">
                {command.output}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-border">
        <div className="flex items-center gap-2">
          <span className="text-green-500">$</span>
          <input
            ref={inputRef}
            type="text"
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            className="flex-1 bg-transparent outline-none"
            placeholder="Enter command..."
            autoFocus
          />
        </div>
      </form>
    </div>
  )
} 