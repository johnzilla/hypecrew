import React from 'react'
import { Search, Plus, MessageCircle, User } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

interface BottomNavigationProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({ 
  activeTab, 
  onTabChange 
}) => {
  const { profile } = useAuth()

  const tabs = [
    { id: 'browse', label: 'Browse', icon: Search },
    { 
      id: 'post', 
      label: profile?.user_type === 'performer' ? 'Find Gigs' : 'Post Gig', 
      icon: Plus 
    },
    { id: 'messages', label: 'Messages', icon: MessageCircle },
    { id: 'profile', label: 'Profile', icon: User }
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="max-w-md mx-auto">
        <div className="flex justify-around">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`
                  flex flex-col items-center justify-center py-2 px-4 min-w-0 flex-1
                  transition-colors duration-200
                  ${isActive 
                    ? 'text-blue-600' 
                    : 'text-gray-500 hover:text-gray-700'
                  }
                `}
              >
                <Icon className={`w-6 h-6 mb-1 ${isActive ? 'text-blue-600' : ''}`} />
                <span className="text-xs font-medium truncate">
                  {tab.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}