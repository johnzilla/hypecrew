import React from 'react'
import { GigList } from '../components/gigs/GigList'
import { Gig } from '../lib/types'
import { useAuth } from '../hooks/useAuth'

interface BrowseGigsProps {
  onViewGig: (gig: Gig) => void
  onApplyToGig: (gig: Gig) => void
}

export const BrowseGigs: React.FC<BrowseGigsProps> = ({ onViewGig, onApplyToGig }) => {
  const { profile } = useAuth()
  const isPerformer = profile?.user_type === 'performer'

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {isPerformer ? 'Available Gigs' : 'Browse Talent'}
        </h1>
        <p className="text-gray-600">
          {isPerformer 
            ? 'Find exciting opportunities to showcase your hype skills'
            : 'Discover amazing performers for your next event'
          }
        </p>
      </div>

      <GigList
        onViewGig={onViewGig}
        onApplyToGig={onApplyToGig}
        showApplyButton={isPerformer}
      />
    </div>
  )
}