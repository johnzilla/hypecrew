import { useNavigate, useLocation } from 'react-router-dom'
import { Search, Plus, MessageCircle, User } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

const TABS = [
  { path: '/browse', label: 'Browse', icon: Search },
  { path: '/post', label: 'Post Gig', altLabel: 'Find Gigs', icon: Plus },
  { path: '/messages', label: 'Messages', icon: MessageCircle },
  { path: '/profile', label: 'Profile', icon: User },
]

export function BottomNavigation() {
  const navigate = useNavigate()
  const location = useLocation()
  const { profile } = useAuth()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="max-w-md mx-auto">
        <div className="flex justify-around">
          {TABS.map((tab) => {
            const Icon = tab.icon
            const isActive = location.pathname.startsWith(tab.path)
            const label =
              tab.altLabel && profile?.user_type === 'performer'
                ? tab.altLabel
                : tab.label

            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className={`
                  flex flex-col items-center justify-center py-2 px-4 min-w-0 flex-1
                  transition-colors duration-200
                  ${isActive ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}
                `}
              >
                <Icon className={`w-6 h-6 mb-1 ${isActive ? 'text-blue-600' : ''}`} />
                <span className="text-xs font-medium truncate">{label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
