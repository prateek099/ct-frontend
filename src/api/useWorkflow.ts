import { useMutation } from "@tanstack/react-query";
import client from "./client";
import type { ChannelData, VideoIdea, GeneratedScript, TitleItem, SeoData } from "../types/workflow";

// Stable keys used by WorkflowContext to subscribe to mutation state globally
export const MUTATION_KEYS = {
  generateIdeas:  ["generate-ideas"]  as const,
  generateScript: ["generate-script"] as const,
  generateTitles: ["generate-titles"] as const,
  generateSeo:    ["generate-seo"]    as const,
} as const

// ── Channel fetch ─────────────────────────────────────────────────────────────

interface FetchChannelPayload { url: string }

export function useFetchChannel() {
  return useMutation({
    mutationFn: async (payload: FetchChannelPayload): Promise<ChannelData> => {
      const { data } = await client.post<ChannelData>("/yt/channel", payload);
      return data;
    },
  });
}

// ── Video ideas ───────────────────────────────────────────────────────────────

interface ChannelContext {
  channel_name: string;
  handle?: string;
  description?: string;
  subscriber_count?: number;
  average_duration_seconds?: number;
  recent_video_titles?: string[];
}

interface GenerateIdeasPayload {
  prompt: string;
  channel_context?: ChannelContext;
  signal?: AbortSignal;
}

interface VideoIdeasResponse {
  prompt: string;
  response: { videoIdeas: VideoIdea[] };
}

export function useGenerateIdeas() {
  return useMutation({
    mutationKey: MUTATION_KEYS.generateIdeas,
    mutationFn: async ({ signal, ...payload }: GenerateIdeasPayload): Promise<VideoIdea[]> => {
      const { data } = await client.post<VideoIdeasResponse>("/video-idea-gen", payload, { signal });
      return data.response?.videoIdeas || [];
    },
  });
}

// ── Script generator ──────────────────────────────────────────────────────────

interface ScriptChannelContext {
  channel_name?: string;
  average_duration_seconds?: number;
  recent_video_titles?: string[];
}

interface GenerateScriptPayload {
  title: string;
  hook: string;
  angle: string;
  format: string;
  flavor?: string;
  channel_context?: ScriptChannelContext;
  signal?: AbortSignal;
}

export function useGenerateScript() {
  return useMutation({
    mutationKey: MUTATION_KEYS.generateScript,
    mutationFn: async ({ signal, ...payload }: GenerateScriptPayload): Promise<GeneratedScript> => {
      const { data } = await client.post<GeneratedScript>("/script-generator", payload, { signal });
      return data;
    },
  });
}

// ── Title suggestor ───────────────────────────────────────────────────────────

interface TitleChannelContext {
  channel_name?: string;
  handle?: string;
  recent_video_titles?: string[];
}

interface GenerateTitlesPayload {
  topic: string;
  hook?: string;
  angle?: string;
  format?: string;
  script_summary?: string | null;
  channel_context?: TitleChannelContext;
  signal?: AbortSignal;
}

interface TitleResponse {
  topic: string;
  titles: TitleItem[];
}

export function useGenerateTitles() {
  return useMutation({
    mutationKey: MUTATION_KEYS.generateTitles,
    mutationFn: async ({ signal, ...payload }: GenerateTitlesPayload): Promise<TitleItem[]> => {
      const { data } = await client.post<TitleResponse>("/title-suggestor", payload, { signal });
      return data.titles || [];
    },
  });
}

// ── SEO description ───────────────────────────────────────────────────────────

interface SeoChannelContext {
  channel_name?: string;
  handle?: string;
  recent_video_titles?: string[];
}

interface GenerateSeoPayload {
  title: string;
  topic: string;
  script_outline?: string | null;
  niche?: string | null;
  channel_context?: SeoChannelContext;
  signal?: AbortSignal;
}

export function useGenerateSeoDescription() {
  return useMutation({
    mutationKey: MUTATION_KEYS.generateSeo,
    mutationFn: async ({ signal, ...payload }: GenerateSeoPayload): Promise<SeoData> => {
      const { data } = await client.post<SeoData>("/seo-description", payload, { signal });
      return data;
    },
  });
}
