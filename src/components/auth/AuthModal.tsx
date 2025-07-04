import React, { useState } from 'react'
import { X, Users } from 'lucide-react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Select } from '../ui/Input'
import { useAuth } from '../../hooks/useAuth'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    userType: 'client' as 'performer' | 'client'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const { signIn, signUp } = useAuth()

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      if (mode === 'signin') {
        const { error } = await signIn(formData.email, formData.password)
        if (error) throw error
        onClose()
      } else {
        // Validate form data
        if (!formData.fullName.trim()) {
          throw new Error('Full name is required')
        }
        if (formData.password.length < 6) {
          throw new Error('Password must be at least 6 characters long')
        }
        
        const { error } = await signUp(
          formData.email, 
          formData.password, 
          formData.fullName.trim(), 
          formData.userType
        )
        
        if (error) throw error
        
        setSuccess('Account created successfully! You can now sign in.')
        
        // Reset form and switch to signin mode
        setFormData({
          email: formData.email, // Keep email for convenience
          password: '',
          fullName: '',
          userType: 'client'
        })
        setMode('signin')
      }
    } catch (error: any) {
      console.error('Auth error:', error)
      let errorMessage = 'An error occurred during authentication'
      
      if (error.message) {
        errorMessage = error.message
      } else if (error.error_description) {
        errorMessage = error.error_description
      }
      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear errors when user starts typing
    if (error) setError('')
    if (success) setSuccess('')
  }

  const switchMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin')
    setError('')
    setSuccess('')
    setFormData({
      email: '',
      password: '',
      fullName: '',
      userType: 'client'
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <Users className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">
                {mode === 'signin' ? 'Welcome Back' : 'Join HypeCrew'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={loading}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <>
                <Input
                  label="Full Name"
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  required
                  disabled={loading}
                />
                <Select
                  label="I am a..."
                  value={formData.userType}
                  onChange={(e) => handleInputChange('userType', e.target.value)}
                  options={[
                    { value: 'client', label: 'Client (Looking for hype talent)' },
                    { value: 'performer', label: 'Performer (Providing hype services)' }
                  ]}
                  disabled={loading}
                />
              </>
            )}

            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
              disabled={loading}
            />

            <Input
              label="Password"
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              required
              disabled={loading}
              helperText={mode === 'signup' ? 'Password must be at least 6 characters' : undefined}
            />

            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
                {error}
              </div>
            )}

            {success && (
              <div className="text-green-600 text-sm bg-green-50 p-3 rounded-lg border border-green-200">
                {success}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              loading={loading}
              disabled={loading}
            >
              {mode === 'signin' ? 'Sign In' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={switchMode}
              className="text-blue-600 hover:text-blue-700 text-sm transition-colors"
              disabled={loading}
            >
              {mode === 'signin' 
                ? "Don't have an account? Sign up" 
                : "Already have an account? Sign in"
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}