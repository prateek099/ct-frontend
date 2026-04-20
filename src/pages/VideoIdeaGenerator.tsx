import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Youtube,
  Search,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Users,
  Eye,
  Clock,
  ArrowRight,
  AlertCircle,
  Loader,
  Lightbulb,
} from "lucide-react";
import { useWorkflow } from "../context/WorkflowContext";
import { useFetchChannel, useGenerateIdeas } from "../api/useWorkflow";
import PipelineStepper from "../components/PipelineStepper";
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
    return `${h}h ${m % 60}m`;
  }
  return `${m}m ${s.toString().padStart(2, "0")}s`;
}

// ── sub-components ────────────────────────────────────────────────────────────

function StatBadge({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 rounded-lg px-3 py-2">
      <span className="text-stone-400">{icon}</span>
      <div>
        <p className="text-[10px] text-stone-400 uppercase tracking-wide">{label}</p>
        <p className="text-sm font-semibold text-stone-900">{value}</p>
      </div>
    </div>
  );
}

function ChannelCard({ data }: { data: ChannelData }) {
  return (
    <div className="bg-white border border-stone-200 rounded-xl p-5 mb-6 shadow-sm">
      <div className="flex items-start gap-4">
        {data.thumbnail_url && (
          <img
            src={data.thumbnail_url}
            alt={data.channel_name}
            className="w-12 h-12 rounded-full object-cover flex-shrink-0 border border-stone-200"
          />
        )}
        <div className="min-w-0">
          <h3 className="text-base font-bold text-stone-900 truncate">{data.channel_name}</h3>
          {data.handle && <p className="text-sm text-indigo-600">{data.handle}</p>}
          {data.description && (
            <p className="text-xs text-stone-500 mt-1 line-clamp-2">{data.description}</p>
          )}
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
        <StatBadge icon={<Users size={13} />} label="Subscribers" value={formatCount(data.subscriber_count)} />
        <StatBadge icon={<Eye size={13} />} label="Total Views" value={formatCount(data.total_views)} />
        <StatBadge icon={<Youtube size={13} />} label="Videos" value={formatCount(data.video_count)} />
        <StatBadge icon={<Clock size={13} />} label="Avg Duration" value={formatDuration(data.average_duration_seconds)} />
      </div>
      {data.recent_videos?.length > 0 && (
        <details className="mt-4">
          <summary className="text-xs text-stone-500 cursor-pointer hover:text-stone-800 select-none font-medium">
            Recent videos ({data.recent_videos.length})
          </summary>
          <ul className="mt-2 space-y-1 max-h-40 overflow-y-auto pr-1">
            {data.recent_videos.map((v) => (
              <li
                key={v.id}
                className="flex items-center justify-between text-xs text-stone-600 py-1 border-b border-stone-100"
              >
                <span className="truncate mr-3 flex-1">{v.title}</span>
                <span className="text-stone-400 flex-shrink-0">{formatCount(v.view_count)} views</span>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}

function IdeaCard({
  idea,
  index,
  onSelect,
}: {
  idea: VideoIdea;
  index: number;
  onSelect: (idea: VideoIdea) => void;
}) {
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
    <div className="bg-white border border-stone-200 rounded-xl p-4 mb-2.5 hover:border-indigo-300 hover:shadow-sm transition-all">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-bold mt-0.5">
            {index + 1}
          </span>
          <h3 className="text-sm font-bold text-stone-900 leading-snug">{idea.title}</h3>
        </div>
        <div className="flex gap-1 flex-shrink-0">
          <button
            onClick={handleCopy}
            className="p-1.5 text-stone-400 hover:text-stone-700 transition-colors rounded-lg hover:bg-stone-100"
            title="Copy"
          >
            {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
          </button>
          <button
            onClick={() => onSelect(idea)}
            className="flex items-center gap-1 px-2.5 py-1 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition-colors"
            title="Use this idea"
          >
            Use <ArrowRight size={11} />
          </button>
        </div>
      </div>

      <p className="text-stone-600 text-xs mt-2 ml-9">
        <span className="font-semibold text-stone-700">Hook: </span>
        {idea.hook}
      </p>

      <div className="flex flex-wrap gap-2 mt-2 ml-9">
        <span className="bg-indigo-50 text-indigo-700 text-xs px-2 py-0.5 rounded-full border border-indigo-100">
          {idea.angle}
        </span>
        <span className="bg-violet-50 text-violet-700 text-xs px-2 py-0.5 rounded-full border border-violet-100">
          {idea.format}
        </span>
        {idea.reasoning && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-stone-400 hover:text-stone-700 text-xs flex items-center gap-1 transition-colors"
          >
            {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            Reasoning
          </button>
        )}
      </div>

      {expanded && idea.reasoning && (
        <p className="text-stone-500 text-xs mt-2 ml-9 italic border-l-2 border-stone-200 pl-3 leading-relaxed">
          {idea.reasoning}
        </p>
      )}
    </div>
  );
}

// ── main component ────────────────────────────────────────────────────────────

export default function VideoIdeaGenerator() {
  const navigate = useNavigate();
  const { channelData, setChannelData, ideas, setIdeas, setSelectedIdea, resetFromIdeas } =
    useWorkflow();

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
      const result = await generateIdeas.mutateAsync({
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
      setIdeas(result);
    } catch {
      // error shown via generateIdeas.error
    }
  };

  const handleSelectIdea = (idea: VideoIdea) => {
    setSelectedIdea(idea);
    navigate("/script-generator");
  };

  const channelError = fetchChannel.error as { response?: { data?: { error?: { detail?: string } } }; message?: string } | null;
  const ideasError = generateIdeas.error as { response?: { data?: { error?: { detail?: string } } }; message?: string } | null;

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      {/* Stepper */}
      <PipelineStepper current={1} />

      {/* Header */}
      <div className="mb-7">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center border border-amber-100">
            <Lightbulb size={18} className="text-amber-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-stone-900">Video Idea Generator</h1>
            <p className="text-stone-500 text-xs">
              Pull channel data → generate 10 AI-powered video ideas
            </p>
          </div>
        </div>
      </div>

      {/* Step 1 — Channel URL */}
      <div className="bg-white border border-stone-200 rounded-xl p-5 mb-5 shadow-sm">
        <h2 className="text-sm font-semibold text-stone-900 mb-4 flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center font-bold">
            1
          </span>
          Enter YouTube URL
        </h2>

        <div className="flex gap-2 mb-4">
          {(["your", "competitor"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setUrlType(type)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                urlType === type
                  ? "bg-indigo-600 text-white"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              {type === "your" ? "Your Channel" : "Competitor"}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Youtube
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
            />
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleFetchChannel()}
              placeholder="https://youtube.com/@channelname"
              className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2.5 pl-9 pr-4 text-stone-900 placeholder-stone-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
            />
          </div>
          <button
            onClick={handleFetchChannel}
            disabled={fetchChannel.isPending || !urlInput.trim()}
            className="flex items-center gap-2 bg-stone-900 hover:bg-stone-800 text-white font-semibold py-2.5 px-4 rounded-xl text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {fetchChannel.isPending ? (
              <Loader size={14} className="animate-spin" />
            ) : (
              <Search size={14} />
            )}
            {fetchChannel.isPending ? "Fetching…" : "Fetch"}
          </button>
        </div>

        {channelError && (
          <div className="mt-3 flex items-center gap-2 text-red-600 text-xs bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            <AlertCircle size={13} />
            {channelError?.response?.data?.error?.detail || channelError?.message}
          </div>
        )}
      </div>

      {/* Channel card */}
      {channelData && <ChannelCard data={channelData} />}

      {/* Step 2 — Generate Ideas */}
      {channelData && (
        <div className="bg-white border border-stone-200 rounded-xl p-5 mb-5 shadow-sm">
          <h2 className="text-sm font-semibold text-stone-900 mb-4 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center font-bold">
              2
            </span>
            Generate 10 Ideas
          </h2>

          <div className="mb-4">
            <label className="block text-xs font-medium text-stone-600 mb-1.5">
              Topic / Niche focus{" "}
              <span className="text-stone-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={topicOverride}
              onChange={(e) => setTopicOverride(e.target.value)}
              placeholder={`e.g. "${channelData.channel_name}" or "budget travel tips"`}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2.5 px-4 text-stone-900 placeholder-stone-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
            />
          </div>

          <button
            onClick={handleGenerateIdeas}
            disabled={generateIdeas.isPending}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2.5 px-5 rounded-xl text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {generateIdeas.isPending ? (
              <>
                <Loader size={14} className="animate-spin" /> Generating…
              </>
            ) : (
              <>
                <Sparkles size={14} /> Generate 10 Ideas
              </>
            )}
          </button>

          {ideasError && (
            <div className="mt-3 flex items-center gap-2 text-red-600 text-xs bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              <AlertCircle size={13} />
              {ideasError?.response?.data?.error?.detail || ideasError?.message}
            </div>
          )}
        </div>
      )}

      {/* Ideas list */}
      {ideas.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={15} className="text-amber-500" />
            <h2 className="text-sm font-semibold text-stone-900">
              {ideas.length} Video Ideas
            </h2>
            <span className="text-xs text-stone-400">— click Use to continue with that idea</span>
          </div>
          {ideas.map((idea, i) => (
            <IdeaCard key={i} idea={idea} index={i} onSelect={handleSelectIdea} />
          ))}
        </div>
      )}
    </div>
  );
}

