import React, { useState, useEffect } from 'react'
import { Search, Filter, SlidersHorizontal } from 'lucide-react'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { Select } from '../ui/Input'
import { GigCard } from './GigCard'
import { supabase } from '../../lib/supabase'
import { Gig, HYPE_STYLES, EVENT_TYPES } from '../../lib/types'

interface GigListProps {
  onViewGig: (gig: Gig) => void
  onApplyToGig?: (gig: Gig) => void
  showApplyButton?: boolean
}

export const GigList: React.FC<GigListProps> = ({ 
  onViewGig, 
  onApplyToGig,
  showApplyButton = false 
}) => {
  const [gigs, setGigs] = useState<Gig[]>([])
  const [filteredGigs, setFilteredGigs] = useState<Gig[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedEventType, setSelectedEventType] = useState('')
  const [selectedHypeStyle, setSelectedHypeStyle] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchGigs()
  }, [])

  useEffect(() => {
    filterGigs()
  }, [gigs, searchTerm, selectedEventType, selectedHypeStyle])

  const fetchGigs = async () => {
    try {
      const { data, error } = await supabase
        .from('gigs')
        .select(`
          *,
          client:profiles(*)
        `)
        .eq('status', 'open')
        .order('created_at', { ascending: false })

      if (error) throw error
      setGigs(data || [])
    } catch (error) {
      console.error('Error fetching gigs:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterGigs = () => {
    let filtered = [...gigs]

    if (searchTerm) {
      filtered = filtered.filter(gig => 
        gig.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        gig.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        gig.location.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedEventType) {
      filtered = filtered.filter(gig => gig.event_type === selectedEventType)
    }

    if (selectedHypeStyle) {
      filtered = filtered.filter(gig => 
        gig.hype_styles_wanted.includes(selectedHypeStyle)
      )
    }

    setFilteredGigs(filtered)
  }

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedEventType('')
    setSelectedHypeStyle('')
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search and Filter Controls */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex gap-2 mb-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search gigs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            size="md"
            onClick={() => setShowFilters(!showFilters)}
            className={showFilters ? 'bg-blue-50 text-blue-600' : ''}
          >
            <SlidersHorizontal className="w-4 h-4" />
          </Button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-gray-100">
            <Select
              label="Event Type"
              value={selectedEventType}
              onChange={(e) => setSelectedEventType(e.target.value)}
              options={[
                { value: '', label: 'All Event Types' },
                ...EVENT_TYPES.map(type => ({ value: type, label: type }))
              ]}
            />
            <Select
              label="Hype Style"
              value={selectedHypeStyle}
              onChange={(e) => setSelectedHypeStyle(e.target.value)}
              options={[
                { value: '', label: 'All Hype Styles' },
                ...HYPE_STYLES.map(style => ({ value: style, label: style }))
              ]}
            />
            {(selectedEventType || selectedHypeStyle || searchTerm) && (
              <div className="md:col-span-2">
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear All Filters
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Results */}
      <div className="text-sm text-gray-600 px-1">
        {filteredGigs.length} gig{filteredGigs.length !== 1 ? 's' : ''} available
      </div>

      {/* Gig Cards */}
      <div className="space-y-4">
        {filteredGigs.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-2">No gigs found</div>
            <p className="text-gray-500">
              Try adjusting your search or filters to find more opportunities.
            </p>
          </div>
        ) : (
          filteredGigs.map((gig) => (
            <GigCard
              key={gig.id}
              gig={gig}
              onViewDetails={onViewGig}
              showApplyButton={showApplyButton}
              onApply={onApplyToGig}
            />
          ))
        )}
      </div>
    </div>
  )
}