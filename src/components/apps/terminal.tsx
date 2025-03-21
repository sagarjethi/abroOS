'use client'

import { useState, useRef, useEffect } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'

interface Command {
  input: string
  output: string
}

const MOCK_COMMANDS: Record<string, string> = {
  'help': 'Available commands:\nhelp - Show this help message\nclear - Clear the terminal\nls - List files\npwd - Show current directory',
  'clear': '',
  'ls': 'Documents  Downloads  Pictures  Music  Videos  Desktop',
  'pwd': '/home/user',
}

export default function Terminal() {
  const [commands, setCommands] = useState<Command[]>([])
  const [currentInput, setCurrentInput] = useState('')
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [commands])

  const handleCommand = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && currentInput.trim()) {
      const command = currentInput.trim()
      const output = MOCK_COMMANDS[command] || `Command not found: ${command}`

      setCommands(prev => [...prev, { input: command, output }])
      setCurrentInput('')

      if (command === 'clear') {
        setCommands([])
      }
    }
  }

  return (
    <div className="flex flex-col h-full bg-black text-green-400 font-mono">
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        {commands.map((cmd, index) => (
          <div key={index} className="mb-2">
            <div className="flex items-center">
              <span className="mr-2">$</span>
              <span>{cmd.input}</span>
            </div>
            {cmd.output && (
              <pre className="mt-1 whitespace-pre-wrap">{cmd.output}</pre>
            )}
          </div>
        ))}
      </ScrollArea>
      <div className="flex items-center p-4 border-t border-green-900">
        <span className="mr-2">$</span>
        <input
          type="text"
          value={currentInput}
          onChange={(e) => setCurrentInput(e.target.value)}
          onKeyDown={handleCommand}
          className="flex-1 bg-transparent outline-none"
          autoFocus
          placeholder="Type a command..."
        />
      </div>
    </div>
  )
} 