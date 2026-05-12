import React, { Suspense, lazy } from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import './index.css'

import { AuthProvider } from './context/AuthContext'
import { WorkflowProvider } from './context/WorkflowContext'
import { ThemeProvider } from './context/ThemeContext'
import ThemeToggle from './components/shared/ThemeToggle'
import ErrorBoundary from './components/shared/ErrorBoundary'
import RouteFallback from './components/shared/RouteFallback'
import ProtectedRoute from './components/auth/ProtectedRoute'
import AdminRoute from './components/auth/AdminRoute'
import AppShell from './components/layout/AppShell'
import { installGlobalErrorHandlers } from './lib/installGlobalErrorHandlers'

// Eagerly imported pages — first-paint critical / fallback / auth entry
import HomePage from './pages/marketing/HomePage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import NotFoundPage from './pages/NotFoundPage'

// Auth flows beyond login/signup — small but only hit by users who follow the email
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'))
const GoogleCallback = lazy(() => import('./pages/GoogleCallback'))

// Workspace entry
const DashboardPage = lazy(() => import('./pages/DashboardPage'))

// Marketing — public, standalone pages (lazy: most visitors land on `/` and convert; the rest are secondary)
const ProductsPage = lazy(() => import('./pages/marketing/ProductsPage'))
const FeaturesPage = lazy(() => import('./pages/marketing/FeaturesPage'))
const PricingPage = lazy(() => import('./pages/marketing/PricingPage'))
const AboutPage = lazy(() => import('./pages/marketing/AboutPage'))
const BlogPage = lazy(() => import('./pages/marketing/BlogPage'))
const ContactPage = lazy(() => import('./pages/marketing/ContactPage'))

// Pipeline — live API
const VideoIdeaGenerator = lazy(() => import('./pages/VideoIdeaGenerator'))
const ScriptGenerator = lazy(() => import('./pages/ScriptGenerator'))
const TitleSuggestor = lazy(() => import('./pages/TitleSuggestor'))
const SeoDescription = lazy(() => import('./pages/SeoDescription'))

// Static tool pages
const ThumbnailLab = lazy(() => import('./pages/ThumbnailLab'))
const PublishPage = lazy(() => import('./pages/PublishPage'))
const Voiceover = lazy(() => import('./pages/todo_Voiceover'))
const VideoGenerator = lazy(() => import('./pages/todo_VideoGenerator'))
const TrendingFinder = lazy(() => import('./pages/TrendingFinder'))
const ChannelStats = lazy(() => import('./pages/ChannelStats'))
const ContentCalendar = lazy(() => import('./pages/ContentCalendar'))
const LinkInBio = lazy(() => import('./pages/todo_LinkInBio'))
const AdminPanel = lazy(() => import('./pages/AdminPanel'))

// Admin
const UsersPage = lazy(() => import('./pages/UsersPage'))
const AdminClientErrors = lazy(() => import('./pages/AdminClientErrors'))
const AdminAuthEvents = lazy(() => import('./pages/AdminAuthEvents'))

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
                {/* Single outer Suspense — fine for now, fallback is consistent across routes. */}
                <Suspense fallback={<RouteFallback />}>
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
                    <Route
                      path="/admin/auth-events"
                      element={
                        <AdminRoute>
                          <AppShell><AdminAuthEvents /></AppShell>
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
                </Suspense>
                <ThemeToggle />
              </WorkflowProvider>
            </AuthProvider>
          </BrowserRouter>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)
