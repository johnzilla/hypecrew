import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { Button } from '../components/ui/Button'
import { Input, Textarea, Select } from '../components/ui/Input'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import { HYPE_STYLES } from '../lib/types'
import type { PerformerProfile } from '../lib/types'

export function ProfilePage() {
  const { user, profile, signOut, refreshProfile } = useAuth()
  const [fullName, setFullName] = useState(profile?.full_name ?? '')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const [performerProfile, setPerformerProfile] = useState<PerformerProfile | null>(null)
  const [performerForm, setPerformerForm] = useState({
    performer_type: 'solo' as 'solo' | 'crew',
    base_location: '',
    hourly_rate: '',
    bio: '',
    hype_styles: [] as string[],
    specialties: '',
  })
  const [performerLoading, setPerformerLoading] = useState(false)

  const isPerformer = profile?.user_type === 'performer'

  useEffect(() => {
    setFullName(profile?.full_name ?? '')
    if (isPerformer && user) {
      fetchPerformerProfile()
    }
  }, [profile, user]) // eslint-disable-line react-hooks/exhaustive-deps

  async function fetchPerformerProfile() {
    const { data } = await supabase
      .from('performer_profiles')
      .select('*')
      .eq('user_id', user!.id)
      .maybeSingle()

    if (data) {
      setPerformerProfile(data)
      setPerformerForm({
        performer_type: data.performer_type,
        base_location: data.base_location,
        hourly_rate: String(data.hourly_rate),
        bio: data.bio ?? '',
        hype_styles: data.hype_styles,
        specialties: data.specialties.join(', '),
      })
    }
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return

    setSaving(true)
    setMessage('')

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName.trim() || null })
        .eq('id', user.id)

      if (error) throw error
      await refreshProfile()
      setMessage('Profile updated successfully')
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  async function handleSavePerformerProfile(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return

    setPerformerLoading(true)
    setMessage('')

    const payload = {
      user_id: user.id,
      performer_type: performerForm.performer_type,
      base_location: performerForm.base_location,
      hourly_rate: parseFloat(performerForm.hourly_rate) || 0,
      bio: performerForm.bio || null,
      hype_styles: performerForm.hype_styles,
      specialties: performerForm.specialties
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    }

    try {
      if (performerProfile) {
        const { error } = await supabase
          .from('performer_profiles')
          .update(payload)
          .eq('id', performerProfile.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('performer_profiles')
          .insert(payload)
        if (error) throw error
      }
      await fetchPerformerProfile()
      setMessage('Performer profile saved')
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : 'Failed to save performer profile')
    } finally {
      setPerformerLoading(false)
    }
  }

  function toggleHypeStyle(style: string) {
    setPerformerForm((prev) => ({
      ...prev,
      hype_styles: prev.hype_styles.includes(style)
        ? prev.hype_styles.filter((s) => s !== style)
        : [...prev.hype_styles, style],
    }))
  }

  if (!user || !profile) return null

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Your Profile</h1>
        <p className="text-gray-600">Manage your account settings</p>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">Account</h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <Input label="Email" value={profile.email} disabled />
            <Input
              label="Account Type"
              value={profile.user_type === 'performer' ? 'Performer' : 'Client'}
              disabled
            />
            <Input
              label="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your display name"
            />
            <Button type="submit" loading={saving}>
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>

      {isPerformer && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">
              Performer Profile {performerProfile ? '' : '(Not set up yet)'}
            </h2>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSavePerformerProfile} className="space-y-4">
              <Select
                label="Performer Type"
                value={performerForm.performer_type}
                onChange={(e) =>
                  setPerformerForm((p) => ({
                    ...p,
                    performer_type: e.target.value as 'solo' | 'crew',
                  }))
                }
                options={[
                  { value: 'solo', label: 'Solo Performer' },
                  { value: 'crew', label: 'Crew' },
                ]}
              />
              <Input
                label="Base Location"
                value={performerForm.base_location}
                onChange={(e) =>
                  setPerformerForm((p) => ({ ...p, base_location: e.target.value }))
                }
                placeholder="e.g., Sydney, NSW"
                required
              />
              <Input
                label="Hourly Rate (AUD)"
                type="number"
                min="0"
                step="10"
                value={performerForm.hourly_rate}
                onChange={(e) =>
                  setPerformerForm((p) => ({ ...p, hourly_rate: e.target.value }))
                }
                required
              />
              <Textarea
                label="Bio"
                value={performerForm.bio}
                onChange={(e) =>
                  setPerformerForm((p) => ({ ...p, bio: e.target.value }))
                }
                placeholder="Tell clients about yourself and your experience..."
                rows={4}
              />
              <Input
                label="Specialties (comma-separated)"
                value={performerForm.specialties}
                onChange={(e) =>
                  setPerformerForm((p) => ({ ...p, specialties: e.target.value }))
                }
                placeholder="e.g., MC, DJ, Dancer"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hype Styles
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {HYPE_STYLES.map((style) => (
                    <label key={style} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={performerForm.hype_styles.includes(style)}
                        onChange={() => toggleHypeStyle(style)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{style}</span>
                    </label>
                  ))}
                </div>
              </div>
              <Button type="submit" loading={performerLoading}>
                {performerProfile ? 'Update Performer Profile' : 'Create Performer Profile'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {message && (
        <div className={`text-sm p-3 rounded-lg ${
          message.includes('success') || message.includes('saved')
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message}
        </div>
      )}

      <Card>
        <CardContent className="pt-6">
          <Button variant="outline" className="w-full text-red-600 hover:text-red-700" onClick={() => signOut()}>
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
