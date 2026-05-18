// projectMode — read/derive the "standalone vs pipeline" attributes for a
// Project. The flags live inside `idea_json` so they round-trip via the
// existing JSON storage without needing a backend migration.
import type { Project, ProjectMode, StandaloneTool } from "../types/project";

export interface ToolMeta {
  tool: StandaloneTool;
  name: string;
  icon: string;
  path: string;
}

export const STANDALONE_TOOLS: Record<StandaloneTool, ToolMeta> = {
  idea:        { tool: "idea",        name: "Video Ideas",     icon: "lightbulb", path: "/idea" },
  script:      { tool: "script",      name: "Script Writer",   icon: "pencil",    path: "/script" },
  title:       { tool: "title",       name: "Title Generator", icon: "tag",       path: "/title" },
  description: { tool: "description", name: "Description",     icon: "align",     path: "/description" },
  thumbnail:   { tool: "thumbnail",   name: "Thumbnail Lab",   icon: "image",     path: "/thumbnail" },
};

export function getProjectMode(p: Project): ProjectMode {
  return p.idea_json?.mode === "standalone" ? "standalone" : "pipeline";
}

export function getProjectTool(p: Project): StandaloneTool | null {
  const t = p.idea_json?.tool;
  return t && t in STANDALONE_TOOLS ? t : null;
}

/** Route to resume editing a standalone project — back to its specific tool. */
export function getStandaloneResumeRoute(p: Project): string {
  const tool = getProjectTool(p);
  if (!tool) return "/create";
  return `${STANDALONE_TOOLS[tool].path}?mode=standalone`;
}

/**
 * Is the standalone project ready to publish?
 * Each tool defines its own definition of "done".
 */
export function isStandaloneReady(p: Project): boolean {
  const tool = getProjectTool(p);
  if (!tool) return false;
  switch (tool) {
    case "idea":        return !!p.idea_json?.selectedIdea;
    case "script":      return !!p.script_json?.script;
    case "title":       return !!p.title_json?.selectedTitle;
    case "description": return !!p.seo_json?.seo;
    case "thumbnail":   return !!p.thumbnail_json;
  }
}
