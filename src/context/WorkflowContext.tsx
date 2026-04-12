/**
 * WorkflowContext — shared state across the creator tools workflow.
 *
 * Flow: Channel URL → Video Ideas → Script → Titles → SEO Description
 *
 * Each tool page reads from and writes to this context so no data needs
 * to be passed through URL params or re-fetched on navigation.
 */
import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import type {
  ChannelData,
  VideoIdea,
  GeneratedScript,
  TitleItem,
  SeoData,
} from "../types/workflow";

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
  // Step 4: Titles
  suggestedTitles: TitleItem[];
  setSuggestedTitles: (titles: TitleItem[]) => void;
  selectedTitle: TitleItem | null;
  setSelectedTitle: (title: TitleItem | null) => void;
  // Step 5: SEO description
  seoDescription: SeoData | null;
  setSeoDescription: (seo: SeoData | null) => void;
  // Reset helpers
  resetAll: () => void;
  resetFromIdeas: () => void;
  resetFromScript: () => void;
  resetFromTitles: () => void;
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

  /** Full reset — used when starting a brand new workflow */
  const resetAll = useCallback(() => {
    setChannelData(null);
    setIdeas([]);
    setSelectedIdea(null);
    setGeneratedScript(null);
    setSuggestedTitles([]);
    setSelectedTitle(null);
    setSeoDescription(null);
  }, []);

  /** Partial reset — keep channel data but clear downstream */
  const resetFromIdeas = useCallback(() => {
    setIdeas([]);
    setSelectedIdea(null);
    setGeneratedScript(null);
    setSuggestedTitles([]);
    setSelectedTitle(null);
    setSeoDescription(null);
  }, []);

  /** Partial reset — keep channel + idea, clear script and downstream */
  const resetFromScript = useCallback(() => {
    setSuggestedTitles([]);
    setSelectedTitle(null);
    setSeoDescription(null);
  }, []);

  /** Partial reset — keep everything up to selected title, clear desc */
  const resetFromTitles = useCallback(() => {
    setSeoDescription(null);
  }, []);

  return (
    <WorkflowContext.Provider
      value={{
        channelData, setChannelData,
        ideas, setIdeas,
        selectedIdea, setSelectedIdea,
        generatedScript, setGeneratedScript,
        suggestedTitles, setSuggestedTitles,
        selectedTitle, setSelectedTitle,
        seoDescription, setSeoDescription,
        resetAll, resetFromIdeas, resetFromScript, resetFromTitles,
      }}
    >
      {children}
    </WorkflowContext.Provider>
  );
}

/** Convenience hook — throws if used outside provider */
export function useWorkflow(): WorkflowContextValue {
  const ctx = useContext(WorkflowContext);
  if (!ctx) throw new Error("useWorkflow must be used inside <WorkflowProvider>");
  return ctx;
}
