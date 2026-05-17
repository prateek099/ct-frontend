import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import AdminRoute from "./AdminRoute";

// Mock the auth context so we can drive isAuthenticated/isLoading directly.
const mockUseAdminAuth = vi.fn();
vi.mock("../../context/AdminAuthContext", () => ({
  useAdminAuth: () => mockUseAdminAuth(),
}));

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route
          path="/admin/*"
          element={
            <AdminRoute>
              <div>SECRET ADMIN CONTENT</div>
            </AdminRoute>
          }
        />
        <Route path="/admin/login" element={<div>ADMIN LOGIN PAGE</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("AdminRoute", () => {
  it("renders children when admin is authenticated", () => {
    mockUseAdminAuth.mockReturnValue({ isAuthenticated: true, isLoading: false });
    renderAt("/admin/dashboard");
    expect(screen.getByText("SECRET ADMIN CONTENT")).toBeInTheDocument();
  });

  it("redirects to /admin/login when not authenticated", () => {
    mockUseAdminAuth.mockReturnValue({ isAuthenticated: false, isLoading: false });
    renderAt("/admin/llm-cache");
    expect(screen.getByText("ADMIN LOGIN PAGE")).toBeInTheDocument();
    expect(screen.queryByText("SECRET ADMIN CONTENT")).not.toBeInTheDocument();
  });

  it("shows a loading state while the admin session is being checked", () => {
    mockUseAdminAuth.mockReturnValue({ isAuthenticated: false, isLoading: true });
    renderAt("/admin/auth-events");
    expect(screen.getByText(/checking admin session/i)).toBeInTheDocument();
    // Neither final state is rendered yet
    expect(screen.queryByText("SECRET ADMIN CONTENT")).not.toBeInTheDocument();
    expect(screen.queryByText("ADMIN LOGIN PAGE")).not.toBeInTheDocument();
  });
});
