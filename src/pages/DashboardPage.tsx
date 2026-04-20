import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Lightbulb,
  FileText,
  Type,
  FileSearch,
  Image,
  TrendingUp,
  BarChart2,
  Copyright,
  ArrowRight,
  Sparkles,
  Zap,
} from "lucide-react";

const pipelineSteps = [
  {
    step: 1,
    label: "Idea Generator",
    desc: "Generate 10 AI-powered ideas from your channel data",
    icon: Lightbulb,
    path: "/video-idea-generator",
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
    border: "hover:border-amber-300",
    tag: "T1",
  },
  {
    step: 2,
    label: "Script Writer",
    desc: "Turn your idea into a full ready-to-record script",
    icon: FileText,
    path: "/script-generator",
    iconBg: "bg-violet-50",
    iconColor: "text-violet-600",
    border: "hover:border-violet-300",
    tag: "T2",
  },
  {
    step: 3,
    label: "Title Suggestor",
    desc: "10 click-optimised title variations with CTR scores",
    icon: Type,
    path: "/title-suggestor",
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
    border: "hover:border-blue-300",
    tag: "T3",
  },
  {
    step: 4,
    label: "SEO Description",
    desc: "YouTube-optimised description + hashtags + tags",
    icon: FileSearch,
    path: "/seo-description",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    border: "hover:border-emerald-300",
    tag: "T4",
  },
] as const;

const upcomingTools = [
  {
    icon: Image,
    label: "Thumbnail Ideas",
    desc: "Creative concepts that get clicks",
    tag: "T5",
  },
  {
    icon: TrendingUp,
    label: "Trending Finder",
    desc: "What's hot in your niche right now",
    tag: "T7",
  },
  {
    icon: BarChart2,
    label: "Channel Stats",
    desc: "Analytics at a glance",
    tag: "T8",
  },
  {
    icon: Copyright,
    label: "Copyright Checker",
    desc: "Audio safety before publishing",
    tag: "T19",
  },
] as const;

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const firstName = user?.name?.split(" ")[0] ?? "Creator";
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="p-6 md:p-8 lg:p-10 max-w-5xl mx-auto">
      {/* ── Header ── */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-stone-900">
          {greeting}, {firstName} 👋
        </h1>
        <p className="text-stone-500 text-sm mt-1">What are we making today?</p>
      </div>

      {/* ── Hero CTA ── */}
      <div className="relative bg-indigo-600 rounded-2xl p-6 md:p-7 mb-8 overflow-hidden">
        {/* Subtle bg pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/30" />
          <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full bg-white/20" />
        </div>

        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={15} className="text-indigo-200" />
              <span className="text-indigo-200 text-xs font-semibold uppercase tracking-wider">
                Content pipeline
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white mb-1">
              Start a new video
            </h2>
            <p className="text-indigo-200 text-sm">
              Go from idea to publish-ready in 4 steps
            </p>

            {/* Mini stepper */}
            <div className="flex items-center gap-1.5 mt-4 flex-wrap">
              {["Idea", "Script", "Title", "SEO"].map((s, i) => (
                <div key={s} className="flex items-center gap-1">
                  <span className="bg-white/15 text-white/90 text-xs px-2.5 py-1 rounded-full font-medium">
                    {i + 1}. {s}
                  </span>
                  {i < 3 && (
                    <ArrowRight size={10} className="text-indigo-300 flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => navigate("/video-idea-generator")}
            className="flex-shrink-0 flex items-center gap-2 bg-white text-indigo-700 font-semibold px-5 py-3 rounded-xl text-sm hover:bg-indigo-50 transition-colors shadow-sm self-start sm:self-center"
          >
            <Zap size={14} />
            Start pipeline
          </button>
        </div>
      </div>

      {/* ── Pipeline steps ── */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-semibold text-stone-500 uppercase tracking-widest">
            Pipeline Steps
          </h2>
          <span className="text-xs text-stone-400">4 steps available</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {pipelineSteps.map((step) => (
            <button
              key={step.step}
              onClick={() => navigate(step.path)}
              className={`text-left bg-white border border-stone-200 rounded-xl p-4 md:p-5 cursor-pointer hover:shadow-sm transition-all duration-150 group ${step.border}`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${step.iconBg}`}
                >
                  <step.icon size={18} className={step.iconColor} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                      Step {step.step}
                    </span>
                    <span className="text-[10px] text-stone-300 font-mono">{step.tag}</span>
                  </div>
                  <h3 className="font-semibold text-stone-900 text-sm leading-tight">
                    {step.label}
                  </h3>
                  <p className="text-stone-500 text-xs mt-0.5 leading-snug">{step.desc}</p>
                </div>
                <ArrowRight
                  size={14}
                  className="text-stone-300 group-hover:text-indigo-500 flex-shrink-0 mt-1 transition-colors"
                />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Upcoming tools ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-semibold text-stone-500 uppercase tracking-widest">
            Coming Soon
          </h2>
          <span className="text-xs text-stone-400">More tools in development</span>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {upcomingTools.map((tool) => (
            <div
              key={tool.label}
              className="bg-white border border-stone-200 border-dashed rounded-xl p-4"
            >
              <tool.icon size={18} className="text-stone-400 mb-2.5" />
              <p className="text-sm font-medium text-stone-500 leading-tight">
                {tool.label}
              </p>
              <p className="text-xs text-stone-400 mt-0.5 leading-snug">{tool.desc}</p>
              <span className="inline-block mt-3 text-[10px] bg-stone-100 text-stone-400 px-2 py-0.5 rounded-full font-mono">
                {tool.tag} · Soon
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
