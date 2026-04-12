import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Youtube, Search, Sparkles, ChevronDown, ChevronUp,
  Copy, Check, Users, Eye, Clock, ArrowRight, AlertCircle, Loader,
} from "lucide-react";
import { useWorkflow } from "../context/WorkflowContext";
import { useFetchChannel, useGenerateIdeas } from "../api/useWorkflow";
import type { ChannelData, VideoIdea } from "../types/workflow";

// ── helpers ───────────────────────────────────────────────────────────────────

function formatCount(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return String(n);
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m >= 60) {
    const h = Math.floor(m / 60);
    const rem = m % 60;
    return `${h}h ${rem}m`;
  }
  return `${m}m ${s.toString().padStart(2, "0")}s`;
}

// ── sub-components ────────────────────────────────────────────────────────────

function StatBadge({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 bg-gray-700/50 rounded-lg px-3 py-2">
      <span className="text-gray-400">{icon}</span>
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm font-semibold text-white">{value}</p>
      </div>
    </div>
  );
}

function ChannelCard({ data }: { data: ChannelData }) {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 mb-6">
      <div className="flex items-start gap-4">
        {data.thumbnail_url && (
          <img src={data.thumbnail_url} alt={data.channel_name} className="w-14 h-14 rounded-full object-cover flex-shrink-0" />
        )}
        <div className="min-w-0">
          <h3 className="text-lg font-bold text-white truncate">{data.channel_name}</h3>
          {data.handle && <p className="text-sm text-blue-400">{data.handle}</p>}
          {data.description && <p className="text-xs text-gray-400 mt-1 line-clamp-2">{data.description}</p>}
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
        <StatBadge icon={<Users size={14} />} label="Subscribers" value={formatCount(data.subscriber_count)} />
        <StatBadge icon={<Eye size={14} />} label="Total Views" value={formatCount(data.total_views)} />
        <StatBadge icon={<Youtube size={14} />} label="Videos" value={formatCount(data.video_count)} />
        <StatBadge icon={<Clock size={14} />} label="Avg Duration" value={formatDuration(data.average_duration_seconds)} />
      </div>
      {data.recent_videos?.length > 0 && (
        <details className="mt-4">
          <summary className="text-sm text-gray-400 cursor-pointer hover:text-white select-none">
            Recent videos ({data.recent_videos.length})
          </summary>
          <ul className="mt-2 space-y-1 max-h-48 overflow-y-auto pr-1">
            {data.recent_videos.map((v) => (
              <li key={v.id} className="flex items-center justify-between text-xs text-gray-300 py-1 border-b border-gray-700/50">
                <span className="truncate mr-3 flex-1">{v.title}</span>
                <span className="text-gray-500 flex-shrink-0">{formatCount(v.view_count)} views</span>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}

function IdeaCard({ idea, index, onSelect }: { idea: VideoIdea; index: number; onSelect: (idea: VideoIdea) => void }) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleCopy = () => {
    const text = `Title: ${idea.title}\nHook: ${idea.hook}\nAngle: ${idea.angle}\nFormat: ${idea.format}`;
    navigator.clipboard.writeText(text).catch(() => {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.cssText = "position:fixed;left:-9999px;";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    });
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-3 hover:border-blue-500 transition-all">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">
            {index + 1}
          </span>
          <h3 className="text-sm font-bold text-white leading-snug">{idea.title}</h3>
        </div>
        <div className="flex gap-1 flex-shrink-0">
          <button onClick={handleCopy} className="p-1.5 text-gray-400 hover:text-white transition-colors" title="Copy">
            {copied ? <Check size={15} className="text-green-400" /> : <Copy size={15} />}
          </button>
          <button onClick={() => onSelect(idea)} className="p-1.5 text-blue-400 hover:text-blue-300 transition-colors" title="Use this idea">
            <ArrowRight size={15} />
          </button>
        </div>
      </div>

      <p className="text-gray-300 text-xs mt-2 ml-9">
        <span className="font-semibold text-gray-100">Hook: </span>{idea.hook}
      </p>

      <div className="flex flex-wrap gap-2 mt-2 ml-9">
        <span className="bg-blue-900/50 text-blue-300 text-xs px-2 py-0.5 rounded-full">{idea.angle}</span>
        <span className="bg-purple-900/50 text-purple-300 text-xs px-2 py-0.5 rounded-full">{idea.format}</span>
        {idea.reasoning && (
          <button onClick={() => setExpanded(!expanded)} className="text-gray-500 hover:text-gray-300 text-xs flex items-center gap-1 transition-colors">
            {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            Reasoning
          </button>
        )}
      </div>

      {expanded && idea.reasoning && (
        <p className="text-gray-400 text-xs mt-2 ml-9 italic border-l-2 border-gray-600 pl-3">
          {idea.reasoning}
        </p>
      )}
    </div>
  );
}

// ── main component ────────────────────────────────────────────────────────────

export default function VideoIdeaGenerator() {
  const navigate = useNavigate();
  const { channelData, setChannelData, ideas, setIdeas, setSelectedIdea, resetFromIdeas } = useWorkflow();

  const [urlInput, setUrlInput] = useState(channelData?.handle || "");
  const [urlType, setUrlType] = useState<"your" | "competitor">("your");
  const [topicOverride, setTopicOverride] = useState("");

  const fetchChannel = useFetchChannel();
  const generateIdeas = useGenerateIdeas();

  const handleFetchChannel = async () => {
    if (!urlInput.trim()) return;
    resetFromIdeas();
    try {
      const data = await fetchChannel.mutateAsync({ url: urlInput.trim() });
      setChannelData(data);
    } catch {
      // error shown via fetchChannel.error
    }
  };

  const handleGenerateIdeas = async () => {
    if (!channelData) return;
    setIdeas([]);
    const topic = topicOverride.trim() || channelData.channel_name;
    try {
      const ideas = await generateIdeas.mutateAsync({
        prompt: topic,
        channel_context: {
          channel_name: channelData.channel_name,
          handle: channelData.handle,
          description: channelData.description,
          subscriber_count: channelData.subscriber_count,
          average_duration_seconds: channelData.average_duration_seconds,
          recent_video_titles: channelData.recent_videos.map((v) => v.title),
        },
      });
      setIdeas(ideas);
    } catch {
      // error shown via generateIdeas.error
    }
  };

  const handleSelectIdea = (idea: VideoIdea) => {
    setSelectedIdea(idea);
    navigate("/script-generator");
  };

  const channelError = fetchChannel.error as any;
  const ideasError = generateIdeas.error as any;

  return (
    <div className="bg-gray-900 text-gray-200 min-h-screen font-sans">
      <div className="container mx-auto p-4 md:p-8 max-w-5xl">
        {/* Header */}
        <header className="text-center mb-8">
          <div className="inline-flex items-center justify-center bg-red-500/10 text-red-400 rounded-full p-3 mb-4">
            <Youtube size={32} />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white">YouTube Idea Generator</h1>
          <p className="text-gray-400 mt-2 max-w-xl mx-auto text-sm">
            Enter a channel URL to pull real data, then generate 10 channel-aware video ideas with AI reasoning.
          </p>
        </header>

        {/* Step 1 — Channel URL */}
        <section className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">1</span>
            Enter YouTube URL
          </h2>

          <div className="flex gap-2 mb-4">
            {(["your", "competitor"] as const).map((type) => (
              <button
                key={type}
                onClick={() => setUrlType(type)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  urlType === type ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                {type === "your" ? "Your Channel" : "Competitor Channel"}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <Youtube size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleFetchChannel()}
                placeholder="https://youtube.com/@channelname  or  paste a video link"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2.5 pl-9 pr-4 text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={handleFetchChannel}
              disabled={fetchChannel.isPending || !urlInput.trim()}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-5 rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {fetchChannel.isPending ? <Loader size={15} className="animate-spin" /> : <Search size={15} />}
              {fetchChannel.isPending ? "Fetching…" : "Fetch"}
            </button>
          </div>

          {channelError && (
            <div className="mt-3 flex items-center gap-2 text-red-400 text-sm">
              <AlertCircle size={15} /> {channelError?.response?.data?.error?.detail || channelError?.message}
            </div>
          )}
        </section>

        {/* Channel card */}
        {channelData && <ChannelCard data={channelData} />}

        {/* Step 2 — Generate Ideas */}
        {channelData && (
          <section className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 mb-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">2</span>
              Generate 10 Ideas
            </h2>

            <div className="mb-4">
              <label className="block text-sm text-gray-400 mb-1">
                Topic / Niche focus <span className="text-gray-500">(optional — defaults to channel name)</span>
              </label>
              <input
                type="text"
                value={topicOverride}
                onChange={(e) => setTopicOverride(e.target.value)}
                placeholder={`e.g. "${channelData.channel_name}" or "budget travel tips"`}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2.5 px-4 text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              onClick={handleGenerateIdeas}
              disabled={generateIdeas.isPending}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 px-6 rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {generateIdeas.isPending ? (
                <><Loader size={15} className="animate-spin" /> Generating…</>
              ) : (
                <><Sparkles size={15} /> Generate 10 Ideas</>
              )}
            </button>

            {ideasError && (
              <div className="mt-3 flex items-center gap-2 text-red-400 text-sm">
                <AlertCircle size={15} /> {ideasError?.response?.data?.error?.detail || ideasError?.message}
              </div>
            )}
          </section>
        )}

        {/* Ideas list */}
        {ideas.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Sparkles size={18} className="text-yellow-400" />
              10 Video Ideas
              <span className="text-xs text-gray-500 font-normal ml-1">— click <ArrowRight size={11} className="inline" /> to use an idea</span>
            </h2>
            {ideas.map((idea, i) => (
              <IdeaCard key={i} idea={idea} index={i} onSelect={handleSelectIdea} />
            ))}
          </section>
        )}
      </div>
    </div>
  );
}
