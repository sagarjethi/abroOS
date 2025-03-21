'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ArrowLeftIcon, ArrowRightIcon, RefreshCwIcon } from 'lucide-react'

const MOCK_PAGES = {
  'https://example.com': {
    title: 'Example Domain',
    content: `
      <h1>Example Domain</h1>
      <p>This domain is for use in illustrative examples in documents. You may use this domain in literature without prior coordination or asking for permission.</p>
      <p>More information...</p>
    `
  },
  'https://google.com': {
    title: 'Google',
    content: `
      <div class="search-container">
        <img src="/icons/google.svg" alt="Google" />
        <input type="text" />
        <div class="buttons">
          <button>Google Search</button>
          <button>I'm Feeling Lucky</button>
        </div>
      </div>
    `
  }
}

export default function Browser() {
  const [url, setUrl] = useState('https://example.com')
  const [history, setHistory] = useState<string[]>(['https://example.com'])
  const [currentIndex, setCurrentIndex] = useState(0)

  const currentPage = MOCK_PAGES[url as keyof typeof MOCK_PAGES] || {
    title: '404 Not Found',
    content: '<h1>404 Not Found</h1><p>The requested URL was not found on this server.</p>'
  }

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newUrl = url.startsWith('http') ? url : `https://${url}`
    setUrl(newUrl)
    setHistory(prev => [...prev.slice(0, currentIndex + 1), newUrl])
    setCurrentIndex(prev => prev + 1)
  }

  const goBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
      setUrl(history[currentIndex - 1])
    }
  }

  const goForward = () => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex(prev => prev + 1)
      setUrl(history[currentIndex + 1])
    }
  }

  const refresh = () => {
    // In a real browser, this would reload the page
    console.log('Refreshing page...')
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 p-2 border-b">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={goBack} disabled={currentIndex === 0}>
            <ArrowLeftIcon className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={goForward} disabled={currentIndex === history.length - 1}>
            <ArrowRightIcon className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={refresh}>
            <RefreshCwIcon className="h-4 w-4" />
          </Button>
        </div>
        <form onSubmit={handleUrlSubmit} className="flex-1 flex">
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1"
            placeholder="Enter URL..."
          />
        </form>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-4">{currentPage.title}</h1>
          <div dangerouslySetInnerHTML={{ __html: currentPage.content }} />
        </div>
      </ScrollArea>
    </div>
  )
} 