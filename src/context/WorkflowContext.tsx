/**
 * WorkflowContext — shared state across the creator tools workflow.
 *
 * Pending flags and data are synced via useMutationState so they update
 * even when the generating page is unmounted (user navigated away).
 */
import { createContext, useContext, useState, useCallback, useRef, useEffect, ReactNode } from "react";
import { useMutationState } from "@tanstack/react-query";
import type { ChannelData, VideoIdea, GeneratedScript, TitleItem, SeoData } from "../types/workflow";
import type { Project, ProjectCreate, ProjectIdeaJson, ProjectUpdate, StandaloneTool } from "../types/project";
import { MUTATION_KEYS } from "../api/useWorkflow";
import { useCreateProject, useUpdateProject } from "../api/useProjects";

interface WorkflowContextValue {
  // Step 1: Channel data
  channelData: ChannelData | null;
  setChannelData: (data: ChannelData | null) => void;
  // Step 2: Generated ideas
  ideas: VideoIdea[];
  setIdeas: (ideas: VideoIdea[]) => void;
  selectedIdea: VideoIdea | null;
  setSelectedIdea: (idea: VideoIdea | null) => void;
  // Step 3: Generated script
  generatedScript: GeneratedScript | null;
  setGeneratedScript: (script: GeneratedScript | null) => void;
  setGeneratedScriptAndSave: (script: GeneratedScript | null) => void;
  // Step 4: Titles
  suggestedTitles: TitleItem[];
  setSuggestedTitles: (titles: TitleItem[]) => void;
  selectedTitle: TitleItem | null;
  setSelectedTitle: (title: TitleItem | null) => void;
  // Step 5: SEO description
  seoDescription: SeoData | null;
  setSeoDescription: (seo: SeoData | null) => void;
  // Pending flags (read-only — managed internally via mutation subscriptions)
  ideasPending: boolean;
  scriptPending: boolean;
  titlesPending: boolean;
  seoPending: boolean;
  // Generation lifecycle — call startXxx before mutate(), stopXxx to cancel
  startIdeas: (controller: AbortController) => void;
  startScript: (controller: AbortController) => void;
  startTitles: (controller: AbortController) => void;
  startSeo: (controller: AbortController) => void;
  stopIdeas: () => void;
  stopScript: () => void;
  stopTitles: () => void;
  stopSeo: () => void;
  // Reset helpers
  resetAll: () => void;
  resetFromIdeas: () => void;
  resetFromScript: () => void;
  resetFromTitles: () => void;
  // Project persistence
  currentProjectId: number | null;
  loadProject: (p: Project) => void;
  // Standalone mode — when a tool is opened via /create's Standalone tab, the
  // pipeline page sets this so persisted projects are flagged accordingly.
  standaloneTool: StandaloneTool | null;
  setStandaloneTool: (tool: StandaloneTool | null) => void;
}

const WorkflowContext = createContext<WorkflowContextValue | null>(null);

export function WorkflowProvider({ children }: { children: ReactNode }) {
  const [channelData, setChannelData] = useState<ChannelData | null>(null);
  const [ideas, setIdeas] = useState<VideoIdea[]>([]);
  const [selectedIdea, setSelectedIdea] = useState<VideoIdea | null>(null);
  const [generatedScript, setGeneratedScript] = useState<GeneratedScript | null>(null);
  const [suggestedTitles, setSuggestedTitles] = useState<TitleItem[]>([]);
  const [selectedTitle, setSelectedTitle] = useState<TitleItem | null>(null);
  const [seoDescription, setSeoDescription] = useState<SeoData | null>(null);

  const [ideasPending, setIdeasPending] = useState(false);
  const [scriptPending, setScriptPending] = useState(false);
  const [titlesPending, setTitlesPending] = useState(false);
  const [seoPending, setSeoPending] = useState(false);

  // ── Project persistence ────────────────────────────────────────────────
  // Prateek: Single project row holds the full idea→script→title→seo chain.
  // Created lazily on the first successful save; subsequent successes PATCH
  // the same row. loadProject() rehydrates context for resume.
  const [currentProjectId, setCurrentProjectId] = useState<number | null>(null);
  const currentProjectIdRef = useRef<number | null>(null);
  currentProjectIdRef.current = currentProjectId;

  // Standalone mode flag — set by pipeline pages when they detect ?mode=standalone.
  // Used to (a) decide whether to stamp idea_json.mode='standalone' onto created
  // projects and (b) allow non-idea tools to lazily create projects on first save.
  const [standaloneTool, setStandaloneTool] = useState<StandaloneTool | null>(null);
  const standaloneToolRef = useRef<StandaloneTool | null>(null);
  standaloneToolRef.current = standaloneTool;

  const createProjectMutation = useCreateProject();
  const updateProjectMutation = useUpdateProject();

  // stampStandalone — when a standalone tool is active, every write to
  // idea_json must keep mode + tool set, otherwise a follow-up PATCH would
  // overwrite the field and silently lose the standalone marker. Apply this
  // to ALL outgoing idea_json payloads, not just the initial create.
  const stampStandalone = useCallback(
    <T extends Pick<ProjectCreate, "idea_json">>(payload: T): T => {
      const tool = standaloneToolRef.current;
      if (!tool) return payload;
      const base: ProjectIdeaJson = payload.idea_json ?? {};
      return { ...payload, idea_json: { ...base, mode: "standalone", tool } };
    },
    [],
  );

  // patchProject — small wrapper that stamps idea_json on every PATCH so the
  // standalone marker isn't wiped by a partial update.
  const patchProject = useCallback(
    (payload: ProjectUpdate & { id: number }) => {
      if ("idea_json" in payload) {
        updateProjectMutation.mutate(stampStandalone(payload));
      } else {
        updateProjectMutation.mutate(payload);
      }
    },
  // eslint-disable-next-line react-hooks/exhaustive-deps
    [stampStandalone],
  );

  // ensureProjectId — guarantee a project row exists, creating one with the
  // given initial payload (and standalone metadata) if currentProjectId is null.
  // Returns the id synchronously when the project already exists; otherwise
  // starts the create and returns null. Subsequent calls while the create is
  // in flight enqueue their payload as PATCH operations that will replay
  // against the new project id as soon as the create resolves — this prevents
  // duplicate project rows when (e.g.) setSelectedIdea and a script success
  // fire back-to-back.
  const createInFlight = useRef(false);
  const pendingUpdates = useRef<ProjectUpdate[]>([]);
  const ensureProjectId = useCallback((init: ProjectCreate): number | null => {
    if (currentProjectIdRef.current != null) return currentProjectIdRef.current;
    if (createInFlight.current) {
      pendingUpdates.current.push(init);
      return null;
    }
    createInFlight.current = true;
    createProjectMutation.mutate(
      stampStandalone(init),
      {
        onSuccess: (p) => {
          setCurrentProjectId(p.id);
          createInFlight.current = false;
          const queued = pendingUpdates.current;
          pendingUpdates.current = [];
          for (const upd of queued) {
            patchProject({ id: p.id, ...upd });
          }
        },
        onError: () => {
          createInFlight.current = false;
          pendingUpdates.current = [];
        },
      },
    );
    return null;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Prateek: keep references to latest channel + selected items so we can
  // include them in autosave payloads without stale-closure issues.
  const channelDataRef = useRef<ChannelData | null>(null);
  channelDataRef.current = channelData;
  const selectedIdeaRef = useRef<VideoIdea | null>(null);
  selectedIdeaRef.current = selectedIdea;
  const selectedTitleRef = useRef<TitleItem | null>(null);
  selectedTitleRef.current = selectedTitle;

  // AbortController refs (useRef = no re-render on change)
  const ideasCtrl = useRef<AbortController | null>(null);
  const scriptCtrl = useRef<AbortController | null>(null);
  const titlesCtrl = useRef<AbortController | null>(null);
  const seoCtrl = useRef<AbortController | null>(null);

  // ── Subscribe to each mutation's latest state ────────────────────────────
  // useMutationState lives in WorkflowProvider (always mounted), so it fires
  // even when the individual page component that called mutate() is unmounted.

  const ideasHistory = useMutationState({
    filters: { mutationKey: MUTATION_KEYS.generateIdeas },
    select: m => ({ status: m.state.status, data: m.state.data as VideoIdea[] | undefined }),
  });
  const latestIdeas = ideasHistory[ideasHistory.length - 1];

  const scriptHistory = useMutationState({
    filters: { mutationKey: MUTATION_KEYS.generateScript },
    select: m => ({ status: m.state.status, data: m.state.data as GeneratedScript | undefined }),
  });
  const latestScript = scriptHistory[scriptHistory.length - 1];

  const titlesHistory = useMutationState({
    filters: { mutationKey: MUTATION_KEYS.generateTitles },
    select: m => ({ status: m.state.status, data: m.state.data as TitleItem[] | undefined }),
  });
  const latestTitles = titlesHistory[titlesHistory.length - 1];

  const seoHistory = useMutationState({
    filters: { mutationKey: MUTATION_KEYS.generateSeo },
    select: m => ({ status: m.state.status, data: m.state.data as SeoData | undefined }),
  });
  const latestSeo = seoHistory[seoHistory.length - 1];

  // Sync ideas
  useEffect(() => {
    if (!latestIdeas) return;
    if (latestIdeas.status === "success" && latestIdeas.data) {
      setIdeas(latestIdeas.data);
      setIdeasPending(false);
      ideasCtrl.current = null;
      // Prateek: autosave — create project on first idea batch, else PATCH.
      const ideaJson: ProjectIdeaJson = {
        channel: channelDataRef.current,
        ideas: latestIdeas.data,
        selectedIdea: selectedIdeaRef.current,
      };
      const id = ensureProjectId({ idea_json: ideaJson });
      if (id != null) {
        patchProject({ id, idea_json: ideaJson });
      }
    } else if (latestIdeas.status === "error") {
      setIdeasPending(false);
      ideasCtrl.current = null;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latestIdeas?.status]);

  // Sync script
  useEffect(() => {
    if (!latestScript) return;
    if (latestScript.status === "success" && latestScript.data) {
      setGeneratedScript(latestScript.data);
      setScriptPending(false);
      scriptCtrl.current = null;
      const id = ensureProjectId({
        title: latestScript.data.title,
        idea_json: { selectedIdea: selectedIdeaRef.current },
        script_json: { script: latestScript.data },
      });
      if (id != null) {
        patchProject({
          id,
          script_json: { script: latestScript.data },
          title: latestScript.data.title,
        });
      }
    } else if (latestScript.status === "error") {
      setScriptPending(false);
      scriptCtrl.current = null;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latestScript?.status]);

  // Sync titles
  useEffect(() => {
    if (!latestTitles) return;
    if (latestTitles.status === "success" && latestTitles.data) {
      setSuggestedTitles(latestTitles.data);
      setTitlesPending(false);
      titlesCtrl.current = null;
      const titlePayload = {
        suggestedTitles: latestTitles.data,
        selectedTitle: selectedTitleRef.current,
      };
      const id = ensureProjectId({
        idea_json: { selectedIdea: selectedIdeaRef.current },
        title_json: titlePayload,
      });
      if (id != null) {
        patchProject({ id, title_json: titlePayload });
      }
    } else if (latestTitles.status === "error") {
      setTitlesPending(false);
      titlesCtrl.current = null;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latestTitles?.status]);

  // Sync seo
  useEffect(() => {
    if (!latestSeo) return;
    if (latestSeo.status === "success" && latestSeo.data) {
      setSeoDescription(latestSeo.data);
      setSeoPending(false);
      seoCtrl.current = null;
      const id = ensureProjectId({
        idea_json: { selectedIdea: selectedIdeaRef.current },
        seo_json: { seo: latestSeo.data },
      });
      if (id != null) {
        patchProject({ id, seo_json: { seo: latestSeo.data } });
      }
    } else if (latestSeo.status === "error") {
      setSeoPending(false);
      seoCtrl.current = null;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latestSeo?.status]);

  // ── Generation lifecycle helpers ─────────────────────────────────────────

  const startIdeas = useCallback((c: AbortController) => {
    ideasCtrl.current = c;
    setIdeasPending(true);
  }, []);

  const startScript = useCallback((c: AbortController) => {
    scriptCtrl.current = c;
    setScriptPending(true);
  }, []);

  const startTitles = useCallback((c: AbortController) => {
    titlesCtrl.current = c;
    setTitlesPending(true);
  }, []);

  const startSeo = useCallback((c: AbortController) => {
    seoCtrl.current = c;
    setSeoPending(true);
  }, []);

  const stopIdeas = useCallback(() => {
    ideasCtrl.current?.abort();
    ideasCtrl.current = null;
    setIdeasPending(false);
  }, []);

  const stopScript = useCallback(() => {
    scriptCtrl.current?.abort();
    scriptCtrl.current = null;
    setScriptPending(false);
  }, []);

  const stopTitles = useCallback(() => {
    titlesCtrl.current?.abort();
    titlesCtrl.current = null;
    setTitlesPending(false);
  }, []);

  const stopSeo = useCallback(() => {
    seoCtrl.current?.abort();
    seoCtrl.current = null;
    setSeoPending(false);
  }, []);

  // ── Reset helpers ────────────────────────────────────────────────────────

  const resetAll = useCallback(() => {
    setChannelData(null);
    setIdeas([]);
    setSelectedIdea(null);
    setGeneratedScript(null);
    setSuggestedTitles([]);
    setSelectedTitle(null);
    setSeoDescription(null);
    setCurrentProjectId(null);
    setStandaloneTool(null);
  }, []);

  // Prateek: Wrapped setters that autosave the selection into idea_json/title_json.
  // "Pick an idea" and "pick a title" are pipeline decisions — persist them
  // alongside the generated lists so resume restores the full workflow.
  // In standalone mode these also lazily create a project so the user can later
  // resume / publish the work.
  const setSelectedIdeaAndSave = useCallback((idea: VideoIdea | null) => {
    setSelectedIdea(idea);
    const ideaJson: ProjectIdeaJson = {
      channel: channelDataRef.current,
      ideas,
      selectedIdea: idea,
    };
    const id = ensureProjectId({ idea_json: ideaJson });
    if (id != null) {
      patchProject({ id, idea_json: ideaJson });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ideas]);

  const setSelectedTitleAndSave = useCallback((t: TitleItem | null) => {
    setSelectedTitle(t);
    const titleJson = { suggestedTitles, selectedTitle: t };
    const id = ensureProjectId({
      idea_json: { selectedIdea: selectedIdeaRef.current },
      title_json: titleJson,
    });
    if (id != null) {
      patchProject({ id, title_json: titleJson });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [suggestedTitles]);

  const setGeneratedScriptAndSave = useCallback((script: GeneratedScript | null) => {
    setGeneratedScript(script);
    if (script == null) return;
    const id = ensureProjectId({
      title: script.title,
      idea_json: { selectedIdea: selectedIdeaRef.current },
      script_json: { script },
    });
    if (id != null) {
      patchProject({ id, script_json: { script }, title: script.title });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Prateek: Resume flow — rehydrate context from a server-side project row.
  const loadProject = useCallback((p: Project) => {
    setCurrentProjectId(p.id);
    setChannelData(p.idea_json?.channel ?? null);
    setIdeas(p.idea_json?.ideas ?? []);
    setSelectedIdea(p.idea_json?.selectedIdea ?? null);
    setGeneratedScript(p.script_json?.script ?? null);
    setSuggestedTitles(p.title_json?.suggestedTitles ?? []);
    setSelectedTitle(p.title_json?.selectedTitle ?? null);
    setSeoDescription(p.seo_json?.seo ?? null);
    // Restore the standalone marker so subsequent saves keep the project flagged.
    const restoredTool = p.idea_json?.tool;
    setStandaloneTool(p.idea_json?.mode === "standalone" && restoredTool ? restoredTool : null);
  }, []);

  const resetFromIdeas = useCallback(() => {
    setIdeas([]);
    setSelectedIdea(null);
    setGeneratedScript(null);
    setSuggestedTitles([]);
    setSelectedTitle(null);
    setSeoDescription(null);
  }, []);

  const resetFromScript = useCallback(() => {
    setSuggestedTitles([]);
    setSelectedTitle(null);
    setSeoDescription(null);
  }, []);

  const resetFromTitles = useCallback(() => {
    setSeoDescription(null);
  }, []);

  return (
    <WorkflowContext.Provider
      value={{
        channelData, setChannelData,
        ideas, setIdeas,
        selectedIdea, setSelectedIdea: setSelectedIdeaAndSave,
        generatedScript, setGeneratedScript, setGeneratedScriptAndSave,
        suggestedTitles, setSuggestedTitles,
        selectedTitle, setSelectedTitle: setSelectedTitleAndSave,
        seoDescription, setSeoDescription,
        ideasPending, scriptPending, titlesPending, seoPending,
        startIdeas, startScript, startTitles, startSeo,
        stopIdeas, stopScript, stopTitles, stopSeo,
        resetAll, resetFromIdeas, resetFromScript, resetFromTitles,
        currentProjectId, loadProject,
        standaloneTool, setStandaloneTool,
      }}
    >
      {children}
    </WorkflowContext.Provider>
  );
}

export function useWorkflow(): WorkflowContextValue {
  const ctx = useContext(WorkflowContext);
  if (!ctx) throw new Error("useWorkflow must be used inside <WorkflowProvider>");
  return ctx;
}
