import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Calendar, MapPin, Clock, ArrowLeft, User } from 'lucide-react'
import { format } from 'date-fns'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import { ApplyModal } from '../components/gigs/ApplyModal'
import { formatCurrency } from '../lib/format'
import type { Gig, GigApplication } from '../lib/types'

export function GigDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const [gig, setGig] = useState<Gig | null>(null)
  const [applications, setApplications] = useState<GigApplication[]>([])
  const [existingApplication, setExistingApplication] = useState<GigApplication | null>(null)
  const [loading, setLoading] = useState(true)
  const [showApplyModal, setShowApplyModal] = useState(false)

  const isPerformer = profile?.user_type === 'performer'
  const isOwner = gig?.client_id === user?.id

  useEffect(() => {
    if (!id) return
    fetchGig()
  }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  async function fetchGig() {
    try {
      const { data, error } = await supabase
        .from('gigs')
        .select('*, client:profiles(*)')
        .eq('id', id!)
        .single()

      if (error) throw error
      setGig(data)

      if (data.client_id === user?.id) {
        const { data: apps } = await supabase
          .from('gig_applications')
          .select('*, performer:profiles(*)')
          .eq('gig_id', id!)
          .order('created_at', { ascending: false })
        setApplications(apps ?? [])
      }

      if (user && profile?.user_type === 'performer') {
        const { data: existing } = await supabase
          .from('gig_applications')
          .select('*')
          .eq('gig_id', id!)
          .eq('performer_id', user.id)
          .maybeSingle()
        setExistingApplication(existing)
      }
    } catch {
      navigate('/browse')
    } finally {
      setLoading(false)
    }
  }

  async function handleApplicationStatusChange(applicationId: string, status: 'accepted' | 'rejected') {
    const { error } = await supabase
      .from('gig_applications')
      .update({ status })
      .eq('id', applicationId)

    if (!error) {
      setApplications((prev) =>
        prev.map((a) => (a.id === applicationId ? { ...a, status } : a))
      )
      if (status === 'accepted' && gig) {
        await supabase.from('gigs').update({ status: 'in_progress' }).eq('id', gig.id)
        setGig({ ...gig, status: 'in_progress' })
      }
    }
  }

  function formatDate(dateString: string) {
    try {
      return format(new Date(dateString), 'EEEE, MMMM dd, yyyy')
    } catch {
      return dateString
    }
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
          <div className="h-32 bg-gray-200 rounded" />
        </div>
      </div>
    )
  }

  if (!gig) return null

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </button>

      <div>
        <div className="flex items-start justify-between mb-2">
          <h1 className="text-2xl font-bold text-gray-900">{gig.title}</h1>
          <span className="text-2xl font-bold text-green-600">{formatCurrency(gig.budget)}</span>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            gig.status === 'open' ? 'bg-green-100 text-green-800' :
            gig.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
            gig.status === 'completed' ? 'bg-gray-100 text-gray-800' :
            'bg-red-100 text-red-800'
          }`}>
            {gig.status.replace('_', ' ').toUpperCase()}
          </span>
          <span>{gig.event_type}</span>
        </div>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">Description</h2>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 whitespace-pre-wrap">{gig.description}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">Details</h2>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center text-gray-600">
            <Calendar className="w-5 h-5 mr-3 text-gray-400" />
            {formatDate(gig.date)}
          </div>
          <div className="flex items-center text-gray-600">
            <Clock className="w-5 h-5 mr-3 text-gray-400" />
            {gig.start_time}{gig.end_time ? ` - ${gig.end_time}` : ''}
          </div>
          <div className="flex items-center text-gray-600">
            <MapPin className="w-5 h-5 mr-3 text-gray-400" />
            {gig.location}
          </div>
          {gig.client && (
            <div className="flex items-center text-gray-600">
              <User className="w-5 h-5 mr-3 text-gray-400" />
              Posted by {gig.client.full_name || gig.client.email}
            </div>
          )}
        </CardContent>
      </Card>

      {gig.hype_styles_wanted.length > 0 && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">Hype Styles Wanted</h2>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {gig.hype_styles_wanted.map((style) => (
                <span key={style} className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full">
                  {style}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {gig.requirements.length > 0 && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">Requirements</h2>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              {gig.requirements.map((req, i) => (
                <li key={i}>{req}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {isPerformer && gig.status === 'open' && !isOwner && (
        <div className="sticky bottom-20 bg-white border-t border-gray-100 p-4 -mx-4 shadow-lg">
          {existingApplication ? (
            <div className="text-center">
              <p className="text-sm text-gray-600">
                You already applied &mdash; status:{' '}
                <span className="font-medium capitalize">{existingApplication.status}</span>
              </p>
            </div>
          ) : (
            <Button className="w-full" size="lg" onClick={() => setShowApplyModal(true)}>
              Apply to This Gig
            </Button>
          )}
        </div>
      )}

      {isOwner && applications.length > 0 && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">
              Applications ({applications.length})
            </h2>
          </CardHeader>
          <CardContent className="space-y-4">
            {applications.map((app) => (
              <div key={app.id} className="border border-gray-100 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium text-gray-900">
                      {app.performer?.full_name || 'Performer'}
                    </p>
                    {app.proposed_rate && (
                      <p className="text-sm text-gray-500">
                        Proposed: {formatCurrency(app.proposed_rate)}
                      </p>
                    )}
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    app.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    app.status === 'accepted' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {app.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{app.message}</p>
                {app.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleApplicationStatusChange(app.id, 'accepted')}
                    >
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleApplicationStatusChange(app.id, 'rejected')}
                    >
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <ApplyModal
        isOpen={showApplyModal}
        onClose={() => setShowApplyModal(false)}
        gig={gig}
        onApplied={() => {
          setShowApplyModal(false)
          fetchGig()
        }}
      />
    </div>
  )
}
