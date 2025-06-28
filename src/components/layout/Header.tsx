import React from 'react'
import { Users, Bell, LogOut } from 'lucide-react'
import { Button } from '../ui/Button'
import { useAuth } from '../../hooks/useAuth'

interface HeaderProps {
  title: string
  showBack?: boolean
  onBack?: () => void
}

export const Header: React.FC<HeaderProps> = ({ title, showBack, onBack }) => {
  const { profile, signOut } = useAuth()

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            {showBack && (
              <Button variant="ghost" size="sm" onClick={onBack}>
                ←
              </Button>
            )}
            <div className="flex items-center space-x-2">
              <Users className="w-6 h-6 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">HypeCrew</span>
            </div>
          </div>

          <h1 className="text-lg font-semibold text-gray-900 hidden sm:block">
            {title}
          </h1>

          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <Bell className="w-5 h-5" />
            </Button>
            
            {profile && (
              <div className="flex items-center space-x-3">
                <div className="flex flex-col items-end">
                  <span className="text-sm font-medium text-gray-900">
                    {profile.full_name || profile.email}
                  </span>
                  <span className="text-xs text-gray-500 capitalize">
                    {profile.user_type}
                  </span>
                </div>
                
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  {profile.avatar_url ? (
                    <img 
                      src={profile.avatar_url} 
                      alt="Avatar" 
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-blue-600 font-medium text-sm">
                      {(profile.full_name || profile.email).charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>

                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => signOut()}
                  className="text-gray-500 hover:text-red-600"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}