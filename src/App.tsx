import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Header } from './components/layout/Header'
import { BottomNavigation } from './components/layout/BottomNavigation'
import { AuthModal } from './components/auth/AuthModal'
import { BrowseGigs } from './pages/BrowseGigs'
import { PostGig } from './pages/PostGig'
import { useAuth } from './hooks/useAuth'
import { Gig } from './lib/types'

function App() {
  const { user, profile, loading } = useAuth()
  const [activeTab, setActiveTab] = useState('browse')
  const [showAuthModal, setShowAuthModal] = useState(false)

  const handleTabChange = (tab: string) => {
    if (!user) {
      setShowAuthModal(true)
      return
    }
    setActiveTab(tab)
  }

  const handleViewGig = (gig: Gig) => {
    console.log('View gig:', gig)
    // TODO: Navigate to gig detail page
  }

  const handleApplyToGig = (gig: Gig) => {
    console.log('Apply to gig:', gig)
    // TODO: Open application modal
  }

  const handleGigPosted = () => {
    setActiveTab('browse')
    // TODO: Show success message
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading HypeCrew...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-8">
              <div className="flex items-center justify-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xl">H</span>
                </div>
                <h1 className="text-4xl font-bold text-gray-900">HypeCrew</h1>
              </div>
              <p className="text-xl text-gray-600 mb-8">
                The marketplace connecting hype performers with events that need energy
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div className="bg-white rounded-2xl p-8 shadow-sm">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-blue-600 text-2xl">🎤</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">For Performers</h3>
                <p className="text-gray-600">
                  Find exciting gigs, showcase your skills, and build your reputation in the hype industry
                </p>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-sm">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-green-600 text-2xl">🎉</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">For Clients</h3>
                <p className="text-gray-600">
                  Book professional hype talent to energize your events and create unforgettable experiences
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => setShowAuthModal(true)}
                className="bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-700 transition-colors w-full md:w-auto"
              >
                Get Started
              </button>
              <p className="text-gray-500 text-sm">
                Join thousands of performers and clients creating amazing events
              </p>
            </div>
          </div>
        </div>

        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
        />
      </div>
    )
  }

  const getPageTitle = () => {
    switch (activeTab) {
      case 'browse': return profile?.user_type === 'performer' ? 'Available Gigs' : 'Browse Performers'
      case 'post': return profile?.user_type === 'performer' ? 'Find Gigs' : 'Post a Gig'
      case 'messages': return 'Messages'
      case 'profile': return 'Profile'
      default: return 'HypeCrew'
    }
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'browse':
        return (
          <BrowseGigs
            onViewGig={handleViewGig}
            onApplyToGig={handleApplyToGig}
          />
        )
      case 'post':
        if (profile?.user_type === 'client') {
          return <PostGig onGigPosted={handleGigPosted} />
        } else {
          return (
            <BrowseGigs
              onViewGig={handleViewGig}
              onApplyToGig={handleApplyToGig}
            />
          )
        }
      case 'messages':
        return (
          <div className="max-w-4xl mx-auto p-4">
            <div className="text-center py-12">
              <div className="text-gray-400 text-lg mb-2">Messages Coming Soon</div>
              <p className="text-gray-500">
                Real-time messaging between clients and performers will be available soon.
              </p>
            </div>
          </div>
        )
      case 'profile':
        return (
          <div className="max-w-4xl mx-auto p-4">
            <div className="text-center py-12">
              <div className="text-gray-400 text-lg mb-2">Profile Coming Soon</div>
              <p className="text-gray-500">
                Manage your profile, portfolio, and settings.
              </p>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title={getPageTitle()} />
      
      <main className="pb-20">
        {renderContent()}
      </main>

      <BottomNavigation
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  )
}

export default App