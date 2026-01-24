'use client'

import { useState } from 'react'
import { ArrowLeft, ArrowRight, RotateCw, Lock, MoreVertical } from 'lucide-react'

interface NavigationBarProps {
  onUrlSubmit?: (url: string) => void
}

export default function NavigationBar({ onUrlSubmit }: NavigationBarProps) {
  const [url, setUrl] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (url.trim()) {
      onUrlSubmit?.(url.trim())
    }
  }

  return (
    <div className="bg-gray-800 border-b border-gray-700 px-4 py-2">
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-1">
          <button
            className="p-2 hover:bg-gray-700 rounded transition-colors"
            title="Back"
          >
            <ArrowLeft size={16} className="text-gray-400" />
          </button>
          
          <button
            className="p-2 hover:bg-gray-700 rounded transition-colors"
            title="Forward"
          >
            <ArrowRight size={16} className="text-gray-400" />
          </button>
          
          <button
            className="p-2 hover:bg-gray-700 rounded transition-colors"
            title="Refresh"
          >
            <RotateCw size={16} className="text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex items-center bg-gray-900 rounded-full px-4 py-2">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Search or enter a URL"
            className="flex-1 bg-transparent text-white placeholder-gray-500 outline-none text-sm"
          />
        </form>

        <button
          className="p-2 hover:bg-gray-700 rounded transition-colors"
          title="More options"
        >
        </button>
      </div>
    </div>
  )
}
