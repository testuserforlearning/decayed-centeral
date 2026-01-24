'use client'

import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { GlassCard } from '@developer-hub/liquid-glass'

interface Tab {
  id: string
  title: string
  isActive: boolean
}

export default function TabBar() {
  const [tabs, setTabs] = useState<Tab[]>([
    { id: '1', title: 'New Tab', isActive: true }
  ])

  const addNewTab = () => {
    const newTab: Tab = {
      id: Date.now().toString(),
      title: 'New Tab',
      isActive: false
    }
    setTabs([...tabs.map(tab => ({ ...tab, isActive: false })), newTab])
  }

  const closeTab = (tabId: string) => {
    if (tabs.length === 1) return
    const newTabs = tabs.filter(tab => tab.id !== tabId)
    const closedTabIndex = tabs.findIndex(tab => tab.id === tabId)
    const activeTab = tabs.find(tab => tab.isActive)
    
    if (activeTab?.id === tabId && newTabs.length > 0) {
      const newActiveIndex = Math.min(closedTabIndex, newTabs.length - 1)
      newTabs[newActiveIndex].isActive = true
    }
    
    setTabs(newTabs)
  }

  const switchTab = (tabId: string) => {
    setTabs(tabs.map(tab => ({
      ...tab,
      isActive: tab.id === tabId
    })))
  }

  return (
    <div className="bg-gray-900 border-b border-gray-800">
      <div className="flex items-center px-2 py-1">
        <button
          onClick={addNewTab}
          className="p-2 hover:bg-gray-800 rounded-xl transition-colors"
          title="New Tab"
        >
          <Plus size={16} className="text-gray-400" />
        </button>

        <div className="flex flex-1 overflow-x-auto">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className={`flex items-center min-w-0 max-w-240 px-3 py-2 ml-1 rounded-xl cursor-pointer group ${
                tab.isActive
                  ? 'bg-gray-800 text-white'
                  : 'bg-gray-850 text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
              onClick={() => switchTab(tab.id)}
            >
              <span className="text-sm truncate mr-2">{tab.title}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  closeTab(tab.id)
                }}
                className={`p-0.5 rounded hover:bg-gray-700 transition-colors ${
                  tab.isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                }`}
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
