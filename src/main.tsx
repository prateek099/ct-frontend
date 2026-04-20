import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import "./index.css";

import { AuthProvider } from "./context/AuthContext";
import { WorkflowProvider } from "./context/WorkflowContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AppShell from "./components/layout/AppShell";

import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
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

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <AppShell>{children}</AppShell>
    </ProtectedRoute>
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

              {/* Protected — all inside AppShell (sidebar layout) */}
              <Route
                path="/"
                element={
                  <Shell>
                    <DashboardPage />
                  </Shell>
                }
              />
              <Route
                path="/video-idea-generator"
                element={
                  <Shell>
                    <VideoIdeaGenerator />
                  </Shell>
                }
              />
              <Route
                path="/script-generator"
                element={
                  <Shell>
                    <ScriptGenerator />
                  </Shell>
                }
              />
              <Route
                path="/title-suggestor"
                element={
                  <Shell>
                    <TitleSuggestor />
                  </Shell>
                }
              />
              <Route
                path="/seo-description"
                element={
                  <Shell>
                    <SeoDescription />
                  </Shell>
                }
              />
              <Route
                path="/work-in-progress"
                element={
                  <Shell>
                    <WorkInProgress />
                  </Shell>
                }
              />
              <Route
                path="/users"
                element={
                  <Shell>
                    <UsersPage />
                  </Shell>
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
