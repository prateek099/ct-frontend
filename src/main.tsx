import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import './index.css'

import { AuthProvider } from './context/AuthContext'
import { WorkflowProvider } from './context/WorkflowContext'
import { ThemeProvider } from './context/ThemeContext'
import ThemeToggle from './components/shared/ThemeToggle'
import ErrorBoundary from './components/shared/ErrorBoundary'
import ProtectedRoute from './components/auth/ProtectedRoute'
import AdminRoute from './components/auth/AdminRoute'
import AppShell from './components/layout/AppShell'
import { installGlobalErrorHandlers } from './lib/installGlobalErrorHandlers'

import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import GoogleCallback from './pages/GoogleCallback'
import DashboardPage from './pages/DashboardPage'

// Marketing — public, standalone pages
import HomePage from './pages/marketing/HomePage'
import ProductsPage from './pages/marketing/ProductsPage'
import FeaturesPage from './pages/marketing/FeaturesPage'
import PricingPage from './pages/marketing/PricingPage'
import AboutPage from './pages/marketing/AboutPage'
import BlogPage from './pages/marketing/BlogPage'
import ContactPage from './pages/marketing/ContactPage'

// Pipeline — live API
import VideoIdeaGenerator from './pages/VideoIdeaGenerator'
import ScriptGenerator from './pages/ScriptGenerator'
import TitleSuggestor from './pages/TitleSuggestor'
import SeoDescription from './pages/SeoDescription'

// Static tool pages
import ThumbnailLab from './pages/ThumbnailLab'
import PublishPage from './pages/PublishPage'
import Voiceover from './pages/todo_Voiceover'
import VideoGenerator from './pages/todo_VideoGenerator'
import TrendingFinder from './pages/TrendingFinder'
import ChannelStats from './pages/ChannelStats'
import ContentCalendar from './pages/ContentCalendar'
import LinkInBio from './pages/todo_LinkInBio'
import AdminPanel from './pages/AdminPanel'

// Admin
import UsersPage from './pages/UsersPage'
import AdminClientErrors from './pages/AdminClientErrors'

// 404
import NotFoundPage from './pages/NotFoundPage'

// Install async/global error handlers before the app mounts so a crash
// during initial render is still captured.
installGlobalErrorHandlers()

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
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <BrowserRouter>
            <AuthProvider>
              <WorkflowProvider>
                <Routes>
              {/* Public */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signin" element={<Navigate to="/login" replace />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/oauth/google/callback" element={<GoogleCallback />} />

              {/* Marketing — public. `/` is the homepage; the workspace lives at `/dashboard`. */}
              <Route path="/"         element={<HomePage />} />
              <Route path="/home"     element={<Navigate to="/" replace />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/features" element={<FeaturesPage />} />
              <Route path="/pricing"  element={<PricingPage />} />
              <Route path="/about"    element={<AboutPage />} />
              <Route path="/blog"     element={<BlogPage />} />
              <Route path="/contact"  element={<ContactPage />} />

              {/* Dashboard (protected) */}
              <Route path="/dashboard" element={<Shell><DashboardPage /></Shell>} />

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

              {/* Standalone tools (T7, T8, T10, T15) */}
              <Route path="/trending"  element={<Shell><TrendingFinder /></Shell>} />
              <Route path="/stats"     element={<Shell><ChannelStats /></Shell>} />
              <Route path="/calendar"  element={<Shell><ContentCalendar /></Shell>} />
              <Route path="/linkinbio" element={<Shell><LinkInBio /></Shell>} />

              {/* Admin (T9) — admin-only */}
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AppShell><AdminPanel /></AppShell>
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/client-errors"
                element={
                  <AdminRoute>
                    <AppShell><AdminClientErrors /></AppShell>
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

              {/* Fallback — unknown URLs render the 404 page so real misses don't masquerade as a homepage visit */}
              <Route path="*" element={<NotFoundPage />} />
              </Routes>
              <ThemeToggle />
              </WorkflowProvider>
            </AuthProvider>
          </BrowserRouter>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)
