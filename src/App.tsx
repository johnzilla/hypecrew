import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { AppLayout } from './components/layout/AppLayout'
import { Landing } from './pages/Landing'
import { BrowseGigs } from './pages/BrowseGigs'
import { PostGig } from './pages/PostGig'
import { GigDetail } from './pages/GigDetail'
import { ProfilePage } from './pages/ProfilePage'
import { MessagesPage } from './pages/MessagesPage'
import { Footer } from './components/layout/Footer'

function AuthenticatedRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/browse" element={<BrowseGigs />} />
        <Route path="/post" element={<PostGig />} />
        <Route path="/gig/:id" element={<GigDetail />} />
        <Route path="/messages" element={<MessagesPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="*" element={<Navigate to="/browse" replace />} />
      </Route>
    </Routes>
  )
}

function UnauthenticatedRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function AppRoutes() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading HypeCrew...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return user ? <AuthenticatedRoutes /> : <UnauthenticatedRoutes />
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}
