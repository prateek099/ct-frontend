import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import './index.css'

import { AuthProvider } from './context/AuthContext'
import { WorkflowProvider } from './context/WorkflowContext'
import ProtectedRoute from './components/auth/ProtectedRoute'
import AdminRoute from './components/auth/AdminRoute'
import AppShell from './components/layout/AppShell'

import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import GoogleCallback from './pages/GoogleCallback'
import DashboardPage from './pages/DashboardPage'

// Pipeline — live API
import VideoIdeaGenerator from './pages/VideoIdeaGenerator'
import ScriptGenerator from './pages/ScriptGenerator'
import TitleSuggestor from './pages/TitleSuggestor'
import SeoDescription from './pages/SeoDescription'

// Static tool pages
import ThumbnailLab from './pages/ThumbnailLab'
import PublishPage from './pages/PublishPage'
import Voiceover from './pages/Voiceover'
import VideoGenerator from './pages/VideoGenerator'
import ReviewScript from './pages/ReviewScript'
import Repurpose from './pages/Repurpose'
import TrendingFinder from './pages/TrendingFinder'
import ChannelStats from './pages/ChannelStats'
import ContentCalendar from './pages/ContentCalendar'
import LinkInBio from './pages/LinkInBio'
import MyShop from './pages/MyShop'
import ThumbnailDownloader from './pages/ThumbnailDownloader'
import SubtitlesDownloader from './pages/SubtitlesDownloader'
import CopyrightChecker from './pages/CopyrightChecker'
import AdminPanel from './pages/AdminPanel'

// Admin
import UsersPage from './pages/UsersPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1 },
  },
})

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <AppShell>{children}</AppShell>
    </ProtectedRoute>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <WorkflowProvider>
            <Routes>
              {/* Public */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/oauth/google/callback" element={<GoogleCallback />} />

              {/* Dashboard */}
              <Route path="/" element={<Shell><DashboardPage /></Shell>} />

              {/* Pipeline — live API (T1–T4) */}
              <Route path="/idea"        element={<Shell><VideoIdeaGenerator /></Shell>} />
              <Route path="/script"      element={<Shell><ScriptGenerator /></Shell>} />
              <Route path="/title"       element={<Shell><TitleSuggestor /></Shell>} />
              <Route path="/description" element={<Shell><SeoDescription /></Shell>} />

              {/* Create — static (T5, T11, T13) */}
              <Route path="/thumbnail" element={<Shell><ThumbnailLab /></Shell>} />
              <Route path="/publish/:id" element={<Shell><PublishPage /></Shell>} />
              <Route path="/voiceover" element={<Shell><Voiceover /></Shell>} />
              <Route path="/video"     element={<Shell><VideoGenerator /></Shell>} />

              {/* Improve — static (T12, T14) */}
              <Route path="/review"    element={<Shell><ReviewScript /></Shell>} />
              <Route path="/repurpose" element={<Shell><Repurpose /></Shell>} />

              {/* Research — static (T7, T8) */}
              <Route path="/trending" element={<Shell><TrendingFinder /></Shell>} />
              <Route path="/stats"    element={<Shell><ChannelStats /></Shell>} />

              {/* Plan — static (T10) */}
              <Route path="/calendar" element={<Shell><ContentCalendar /></Shell>} />

              {/* Publish — static (T15, T16) */}
              <Route path="/linkinbio" element={<Shell><LinkInBio /></Shell>} />
              <Route path="/shop"      element={<Shell><MyShop /></Shell>} />

              {/* Utilities — static (T17, T18, T19) */}
              <Route path="/thumbnail-downloader"  element={<Shell><ThumbnailDownloader /></Shell>} />
              <Route path="/subtitles-downloader"  element={<Shell><SubtitlesDownloader /></Shell>} />
              <Route path="/copyright"             element={<Shell><CopyrightChecker /></Shell>} />

              {/* Admin (T9) — admin-only */}
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AppShell><AdminPanel /></AppShell>
                  </AdminRoute>
                }
              />

              {/* Users */}
              <Route path="/users" element={<Shell><UsersPage /></Shell>} />

              {/* Legacy redirects */}
              <Route path="/video-idea-generator" element={<Navigate to="/idea" replace />} />
              <Route path="/script-generator"     element={<Navigate to="/script" replace />} />
              <Route path="/title-suggestor"      element={<Navigate to="/title" replace />} />
              <Route path="/seo-description"      element={<Navigate to="/description" replace />} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </WorkflowProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
)
