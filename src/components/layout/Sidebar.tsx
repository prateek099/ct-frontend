import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  Lightbulb,
  FileText,
  Type,
  FileSearch,
  Image,
  TrendingUp,
  BarChart2,
  Users,
  LogOut,
  X,
  Youtube,
  LayoutDashboard,
} from "lucide-react";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const pipelineTools = [
  { label: "Idea Generator", icon: Lightbulb, path: "/video-idea-generator", step: 1 },
  { label: "Script Writer", icon: FileText, path: "/script-generator", step: 2 },
  { label: "Title Suggestor", icon: Type, path: "/title-suggestor", step: 3 },
  { label: "SEO Description", icon: FileSearch, path: "/seo-description", step: 4 },
] as const;

const utilityTools = [
  { label: "Thumbnail Ideas", icon: Image },
  { label: "Trending Finder", icon: TrendingUp },
  { label: "Channel Stats", icon: BarChart2 },
] as const;

function NavItem({
  to,
  children,
  end,
  onClick,
}: {
  to: string;
  children: React.ReactNode;
  end?: boolean;
  onClick?: () => void;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
          isActive
            ? "bg-stone-800 text-white"
            : "text-stone-400 hover:text-white hover:bg-stone-800/70"
        }`
      }
    >
      {children}
    </NavLink>
  );
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const { user, logout } = useAuth();

  const initial = user?.name ? user.name[0].toUpperCase() : "C";
  const displayName = user?.name || "Creator";
  const displayEmail = user?.email === "demo" ? "Demo account" : (user?.email ?? "");

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-20 lg:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-stone-950 z-30 flex flex-col
          transition-transform duration-300 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-stone-800/60 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Youtube size={15} className="text-white" />
            </div>
            <div>
              <span className="text-white font-bold text-sm leading-none block">Creator OS</span>
              <span className="text-stone-500 text-[10px] leading-none">by Creator Tools</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-stone-500 hover:text-white transition-colors p-1 rounded-md hover:bg-stone-800"
          >
            <X size={16} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {/* Dashboard */}
          <NavItem to="/" end onClick={onClose}>
            <LayoutDashboard size={15} className="flex-shrink-0" />
            Dashboard
          </NavItem>

          {/* Pipeline */}
          <div>
            <p className="text-[10px] font-semibold text-stone-600 uppercase tracking-widest px-3 mb-1.5">
              Pipeline
            </p>
            <div className="space-y-0.5">
              {pipelineTools.map((tool) => (
                <NavItem key={tool.path} to={tool.path} onClick={onClose}>
                  <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center text-[10px] font-bold text-stone-500 bg-stone-800 rounded border border-stone-700">
                    {tool.step}
                  </span>
                  <tool.icon size={14} className="flex-shrink-0" />
                  <span className="truncate">{tool.label}</span>
                </NavItem>
              ))}
            </div>
          </div>

          {/* Tools (coming soon) */}
          <div>
            <p className="text-[10px] font-semibold text-stone-600 uppercase tracking-widest px-3 mb-1.5">
              Tools
            </p>
            <div className="space-y-0.5">
              {utilityTools.map((tool) => (
                <div
                  key={tool.label}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-stone-600 cursor-default"
                >
                  <tool.icon size={14} className="flex-shrink-0" />
                  <span className="truncate">{tool.label}</span>
                  <span className="ml-auto text-[10px] bg-stone-800 text-stone-600 px-1.5 py-0.5 rounded flex-shrink-0">
                    Soon
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Admin */}
          <div>
            <p className="text-[10px] font-semibold text-stone-600 uppercase tracking-widest px-3 mb-1.5">
              Admin
            </p>
            <NavItem to="/users" onClick={onClose}>
              <Users size={14} className="flex-shrink-0" />
              Users
            </NavItem>
          </div>
        </nav>

        {/* User footer */}
        <div className="border-t border-stone-800/60 px-3 py-3 flex-shrink-0">
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg">
            <div className="w-8 h-8 rounded-full bg-indigo-700 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {initial}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-stone-200 truncate leading-tight">
                {displayName}
              </p>
              <p className="text-[11px] text-stone-500 truncate leading-tight mt-0.5">
                {displayEmail}
              </p>
            </div>
            <button
              onClick={logout}
              className="p-1.5 text-stone-500 hover:text-white hover:bg-stone-800 rounded-md transition-colors flex-shrink-0"
              title="Sign out"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
