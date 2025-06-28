import React from 'react'
import { Calendar, MapPin, DollarSign, Clock, Star } from 'lucide-react'
import { Card, CardContent } from '../ui/Card'
import { Button } from '../ui/Button'
import { Gig } from '../../lib/types'
import { format } from 'date-fns'

interface GigCardProps {
  gig: Gig
  onViewDetails: (gig: Gig) => void
  showApplyButton?: boolean
  onApply?: (gig: Gig) => void
}

export const GigCard: React.FC<GigCardProps> = ({ 
  gig, 
  onViewDetails, 
  showApplyButton = false,
  onApply 
}) => {
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy')
    } catch {
      return dateString
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-100 text-green-800'
      case 'in_progress': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-gray-100 text-gray-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Card hover onClick={() => onViewDetails(gig)} className="transition-all duration-200">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 text-lg leading-tight mb-1">
              {gig.title}
            </h3>
            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(gig.status)}`}>
              {gig.status.replace('_', ' ').toUpperCase()}
            </span>
          </div>
          <div className="text-right">
            <div className="flex items-center text-green-600 font-bold text-lg">
              <DollarSign className="w-4 h-4" />
              {gig.budget}
            </div>
          </div>
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {gig.description}
        </p>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center text-gray-500 text-sm">
            <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="truncate">{formatDate(gig.date)}</span>
          </div>
          
          <div className="flex items-center text-gray-500 text-sm">
            <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="truncate">{gig.start_time}</span>
          </div>

          <div className="flex items-center text-gray-500 text-sm col-span-2">
            <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="truncate">{gig.location}</span>
          </div>
        </div>

        {gig.hype_styles_wanted.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {gig.hype_styles_wanted.slice(0, 3).map((style) => (
                <span 
                  key={style}
                  className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
                >
                  {style}
                </span>
              ))}
              {gig.hype_styles_wanted.length > 3 && (
                <span className="px-2 py-1 bg-gray-50 text-gray-500 text-xs rounded-full">
                  +{gig.hype_styles_wanted.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-between items-center">
          <div className="text-xs text-gray-500">
            {gig.event_type}
          </div>
          
          {showApplyButton && onApply && (
            <Button 
              size="sm" 
              onClick={(e) => {
                e.stopPropagation()
                onApply(gig)
              }}
            >
              Apply Now
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}