import React, { useState } from 'react'
import { Calendar, MapPin, DollarSign, Plus } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Input, Textarea, Select } from '../components/ui/Input'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { EVENT_TYPES, HYPE_STYLES } from '../lib/types'

interface PostGigProps {
  onGigPosted: () => void
}

export const PostGig: React.FC<PostGigProps> = ({ onGigPosted }) => {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_type: '',
    location: '',
    date: '',
    start_time: '',
    end_time: '',
    budget: '',
    requirements: [''],
    hype_styles_wanted: [] as string[]
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleRequirementChange = (index: number, value: string) => {
    const newRequirements = [...formData.requirements]
    newRequirements[index] = value
    setFormData(prev => ({ ...prev, requirements: newRequirements }))
  }

  const addRequirement = () => {
    setFormData(prev => ({ 
      ...prev, 
      requirements: [...prev.requirements, ''] 
    }))
  }

  const removeRequirement = (index: number) => {
    setFormData(prev => ({ 
      ...prev, 
      requirements: prev.requirements.filter((_, i) => i !== index) 
    }))
  }

  const toggleHypeStyle = (style: string) => {
    setFormData(prev => ({
      ...prev,
      hype_styles_wanted: prev.hype_styles_wanted.includes(style)
        ? prev.hype_styles_wanted.filter(s => s !== style)
        : [...prev.hype_styles_wanted, style]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    setError('')

    try {
      const { error } = await supabase
        .from('gigs')
        .insert([
          {
            client_id: user.id,
            title: formData.title,
            description: formData.description,
            event_type: formData.event_type,
            location: formData.location,
            date: formData.date,
            start_time: formData.start_time,
            end_time: formData.end_time || null,
            budget: parseFloat(formData.budget),
            requirements: formData.requirements.filter(req => req.trim() !== ''),
            hype_styles_wanted: formData.hype_styles_wanted,
            status: 'open'
          }
        ])

      if (error) throw error

      // Reset form
      setFormData({
        title: '',
        description: '',
        event_type: '',
        location: '',
        date: '',
        start_time: '',
        end_time: '',
        budget: '',
        requirements: [''],
        hype_styles_wanted: []
      })

      onGigPosted()
    } catch (error: any) {
      setError(error.message || 'Failed to post gig')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Post a Gig</h1>
        <p className="text-gray-600">
          Tell performers about your event and what kind of energy you're looking for
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">Event Details</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Gig Title"
              placeholder="e.g., Wedding entrance energy crew needed"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              required
            />

            <Textarea
              label="Description"
              placeholder="Describe what you need, the vibe you're going for, and any specific requirements..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={4}
              required
            />

            <Select
              label="Event Type"
              value={formData.event_type}
              onChange={(e) => handleInputChange('event_type', e.target.value)}
              options={[
                { value: '', label: 'Select event type' },
                ...EVENT_TYPES.map(type => ({ value: type, label: type }))
              ]}
              required
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">When & Where</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Date"
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                required
              />
              <Input
                label="Start Time"
                type="time"
                value={formData.start_time}
                onChange={(e) => handleInputChange('start_time', e.target.value)}
                required
              />
            </div>

            <Input
              label="End Time (Optional)"
              type="time"
              value={formData.end_time}
              onChange={(e) => handleInputChange('end_time', e.target.value)}
              helperText="Leave blank if duration is flexible"
            />

            <Input
              label="Location"
              placeholder="e.g., Sydney CBD, Melbourne Convention Centre"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              required
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">Budget & Requirements</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Budget (AUD)"
              type="number"
              min="0"
              step="10"
              placeholder="200"
              value={formData.budget}
              onChange={(e) => handleInputChange('budget', e.target.value)}
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hype Styles Wanted
              </label>
              <div className="grid grid-cols-2 gap-2">
                {HYPE_STYLES.map((style) => (
                  <label key={style} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.hype_styles_wanted.includes(style)}
                      onChange={() => toggleHypeStyle(style)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{style}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Special Requirements
              </label>
              {formData.requirements.map((requirement, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <Input
                    placeholder="e.g., Must be available for rehearsal"
                    value={requirement}
                    onChange={(e) => handleRequirementChange(index, e.target.value)}
                    className="flex-1"
                  />
                  {formData.requirements.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeRequirement(index)}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={addRequirement}
                icon={Plus}
              >
                Add Requirement
              </Button>
            </div>
          </CardContent>
        </Card>

        {error && (
          <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <Button type="submit" loading={loading} className="flex-1">
            Post Gig
          </Button>
        </div>
      </form>
    </div>
  )
}