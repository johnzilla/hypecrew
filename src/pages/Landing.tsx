import { useState } from 'react'
import { AuthModal } from '../components/auth/AuthModal'
import { Footer } from '../components/layout/Footer'

export function Landing() {
  const [showAuthModal, setShowAuthModal] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      <div className="flex-1">
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
                  <span className="text-blue-600 text-2xl">&#127908;</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">For Performers</h3>
                <p className="text-gray-600">
                  Find exciting gigs, showcase your skills, and build your reputation in the hype industry
                </p>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-sm">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-green-600 text-2xl">&#127881;</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">For VIP</h3>
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
      </div>

      <Footer />

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  )
}
