// useStandaloneMode — pipeline tools can be used in two modes:
//   pipeline   (default): chained idea → script → title → description → thumbnail flow
//   standalone:           single-tool usage, surfaced via /create → "Standalone" tab
//
// The mode is carried in the URL (?mode=standalone) so it survives refresh and
// is preserved when the user moves between standalone tools via the sidebar.
import { useLocation } from "react-router-dom";

export function useStandaloneMode(): boolean {
  const { search } = useLocation();
  return new URLSearchParams(search).get("mode") === "standalone";
}

/** Append `?mode=standalone` to a route path. */
export function withStandalone(path: string): string {
  return path.includes("?") ? `${path}&mode=standalone` : `${path}?mode=standalone`;
}
