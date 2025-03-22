import { Calculator } from '@/components/apps/calculator'
import { Notes } from '@/components/apps/notes'
import { Settings } from '@/components/apps/settings'
import { Terminal } from '@/components/apps/terminal'

export const apps = [
  {
    id: 'calculator',
    title: 'Calculator',
    icon: '/icons/calculator.png',
    component: <Calculator />
  },
  {
    id: 'notes',
    title: 'Notes',
    icon: '/icons/notes.png',
    component: <Notes />
  },
  {
    id: 'settings',
    title: 'Settings',
    icon: '/icons/settings.png',
    component: <Settings />
  },
  {
    id: 'terminal',
    title: 'Terminal',
    icon: '/icons/terminal.png',
    component: <Terminal />
  }
] 