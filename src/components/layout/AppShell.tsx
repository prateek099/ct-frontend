import { useState } from "react";
import type { ReactNode } from "react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import SavedProjectsPanel from "../projects/SavedProjectsPanel";
import { useProjects } from "../../api/useProjects";

export default function AppShell({ children }: { children: ReactNode }) {
  const [projectsOpen, setProjectsOpen] = useState(false);
  // Light-touch fetch just to drive the sidebar count badge.
  const { data: projects = [] } = useProjects({ status: "draft,saved", limit: 50 });

  return (
    <>
      <div className="app">
        <Sidebar
          onOpenProjects={() => setProjectsOpen(true)}
          projectsOpen={projectsOpen}
          projectsCount={projects.length}
        />
        <div className="main">
          <TopBar onOpenProjects={() => setProjectsOpen(true)} projectsCount={projects.length} />
          <div className="content">{children}</div>
        </div>
      </div>
      <SavedProjectsPanel
        open={projectsOpen}
        onClose={() => setProjectsOpen(false)}
      />
      <div className="mobile-guard">
        <div>
          <h1>Creator OS</h1>
          <p>Open on a tablet or desktop for the best experience. Creator OS is optimised for screens 768px and wider.</p>
        </div>
      </div>
    </>
  );
}
