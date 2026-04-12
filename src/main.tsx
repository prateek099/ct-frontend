import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import "./index.css";

import { AuthProvider } from "./context/AuthContext";
import { WorkflowProvider } from "./context/WorkflowContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import VideoIdeaGenerator from "./pages/VideoIdeaGenerator";
import ScriptGenerator from "./pages/ScriptGenerator";
import TitleSuggestor from "./pages/TitleSuggestor";
import SeoDescription from "./pages/SeoDescription";
import WorkInProgress from "./pages/WorkInProgress";
import UsersPage from "./pages/UsersPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main style={{ padding: "1.5rem 2rem" }}>{children}</main>
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <WorkflowProvider>
            <Routes>
              {/* Public */}
              <Route path="/login" element={<LoginPage />} />

              {/* Protected — tool pages (no AppLayout, each has its own header/nav) */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <HomePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/video-idea-generator"
                element={
                  <ProtectedRoute>
                    <VideoIdeaGenerator />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/script-generator"
                element={
                  <ProtectedRoute>
                    <ScriptGenerator />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/title-suggestor"
                element={
                  <ProtectedRoute>
                    <TitleSuggestor />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/seo-description"
                element={
                  <ProtectedRoute>
                    <SeoDescription />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/work-in-progress"
                element={
                  <ProtectedRoute>
                    <WorkInProgress />
                  </ProtectedRoute>
                }
              />

              {/* Protected — admin pages (with AppLayout + Navbar) */}
              <Route
                path="/users"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <UsersPage />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </WorkflowProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
