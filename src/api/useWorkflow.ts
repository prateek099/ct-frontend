import { useMutation } from "@tanstack/react-query";
import client from "./client";
import type { ChannelData, VideoIdea, GeneratedScript, TitleItem, SeoData } from "../types/workflow";

// ── Channel fetch ─────────────────────────────────────────────────────────────

interface FetchChannelPayload {
  url: string;
}

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
}

interface VideoIdeasResponse {
  prompt: string;
  response: { videoIdeas: VideoIdea[] };
}

export function useGenerateIdeas() {
  return useMutation({
    mutationFn: async (payload: GenerateIdeasPayload): Promise<VideoIdea[]> => {
      const { data } = await client.post<VideoIdeasResponse>("/video-idea-gen", payload);
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
}

export function useGenerateScript() {
  return useMutation({
    mutationFn: async (payload: GenerateScriptPayload): Promise<GeneratedScript> => {
      const { data } = await client.post<GeneratedScript>("/script-generator", payload);
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
}

interface TitleResponse {
  topic: string;
  titles: TitleItem[];
}

export function useGenerateTitles() {
  return useMutation({
    mutationFn: async (payload: GenerateTitlesPayload): Promise<TitleItem[]> => {
      const { data } = await client.post<TitleResponse>("/title-suggestor", payload);
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
}

export function useGenerateSeoDescription() {
  return useMutation({
    mutationFn: async (payload: GenerateSeoPayload): Promise<SeoData> => {
      const { data } = await client.post<SeoData>("/seo-description", payload);
      return data;
    },
  });
}
