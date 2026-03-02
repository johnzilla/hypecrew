import { useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '../ui/Button'
import { Input, Textarea } from '../ui/Input'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { formatCurrency } from '../../lib/format'
import type { Gig } from '../../lib/types'

interface ApplyModalProps {
  isOpen: boolean
  onClose: () => void
  gig: Gig
  onApplied: () => void
}

export function ApplyModal({ isOpen, onClose, gig, onApplied }: ApplyModalProps) {
  const { user } = useAuth()
  const [message, setMessage] = useState('')
  const [proposedRate, setProposedRate] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return

    if (!message.trim()) {
      setError('Please write a message to the client')
      return
    }

    setLoading(true)
    setError('')

    try {
      const { error: insertError } = await supabase
        .from('gig_applications')
        .insert({
          gig_id: gig.id,
          performer_id: user.id,
          message: message.trim(),
          proposed_rate: proposedRate ? parseFloat(proposedRate) : null,
        })

      if (insertError) throw insertError

      setMessage('')
      setProposedRate('')
      onApplied()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to submit application'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Apply to Gig</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={loading}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <p className="text-sm text-gray-600 mb-1">{gig.title}</p>
          <p className="text-sm font-medium text-green-600 mb-6">
            Budget: {formatCurrency(gig.budget)}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea
              label="Your Message"
              placeholder="Tell the client why you're a great fit for this gig..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              required
              disabled={loading}
            />

            <Input
              label="Proposed Rate (AUD, optional)"
              type="number"
              min="0"
              step="10"
              placeholder="Leave blank to accept listed budget"
              value={proposedRate}
              onChange={(e) => setProposedRate(e.target.value)}
              disabled={loading}
            />

            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" loading={loading} disabled={loading}>
              Submit Application
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
