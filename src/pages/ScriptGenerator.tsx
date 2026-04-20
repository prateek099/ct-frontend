import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  Clock,
  BookOpen,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Loader,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { useWorkflow } from "../context/WorkflowContext";
import { useGenerateScript } from "../api/useWorkflow";
import PipelineStepper from "../components/PipelineStepper";
import type { ScriptSection as ScriptSectionType } from "../types/workflow";

// ── constants ─────────────────────────────────────────────────────────────────

const FLAVORS = [
  { id: "educational", label: "Educational", emoji: "📚", desc: "Structured & step-by-step" },
  { id: "entertaining", label: "Entertaining", emoji: "🎉", desc: "Energetic & humour-driven" },
  { id: "storytelling", label: "Storytelling", emoji: "🎭", desc: "Narrative arc & emotion" },
  { id: "documentary", label: "Documentary", emoji: "🎬", desc: "Research-heavy & authoritative" },
] as const;

// ── helpers ───────────────────────────────────────────────────────────────────

function formatDuration(seconds: number): string {
  if (!seconds) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${m}m ${s.toString().padStart(2, "0")}s`;
}

function copyToClipboard(text: string) {
  return navigator.clipboard.writeText(text).catch(() => {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.cssText = "position:fixed;left:-9999px;";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
  });
}

// ── sub-components ────────────────────────────────────────────────────────────

function IdeaSummary({
  idea,
}: {
  idea: NonNullable<ReturnType<typeof useWorkflow>["selectedIdea"]>;
}) {
  return (
    <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 mb-6">
      <p className="text-[10px] font-semibold text-indigo-500 uppercase tracking-wider mb-1">
        Selected Idea
      </p>
      <h2 className="text-sm font-bold text-stone-900 leading-snug mb-2">{idea.title}</h2>
      <p className="text-xs text-stone-600 mb-2">
        <span className="font-semibold">Hook: </span>
        {idea.hook}
      </p>
      <div className="flex flex-wrap gap-2">
        <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-0.5 rounded-full">
          {idea.angle}
        </span>
        <span className="bg-violet-100 text-violet-700 text-xs px-2 py-0.5 rounded-full">
          {idea.format}
        </span>
      </div>
    </div>
  );
}

function FlavorPicker({
  selected,
  onChange,
}: {
  selected: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
      {FLAVORS.map((f) => (
        <button
          key={f.id}
          onClick={() => onChange(f.id)}
          className={`flex flex-col items-start p-3.5 rounded-xl border text-left transition-all ${
            selected === f.id
              ? "border-indigo-400 bg-indigo-50 shadow-sm"
              : "border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50"
          }`}
        >
          <span className="text-xl mb-1.5">{f.emoji}</span>
          <span className="text-sm font-semibold text-stone-900">{f.label}</span>
          <span className="text-xs text-stone-500 mt-0.5 leading-tight">{f.desc}</span>
        </button>
      ))}
    </div>
  );
}

function ScriptSectionCard({
  section,
  index,
}: {
  section: ScriptSectionType;
  index: number;
}) {
  const [expanded, setExpanded] = useState(true);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    copyToClipboard(section.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="border border-stone-200 rounded-xl mb-2.5 overflow-hidden shadow-sm">
      <div
        className="flex items-center justify-between px-4 py-3 bg-white cursor-pointer hover:bg-stone-50 select-none"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2.5">
          <span className="w-5 h-5 rounded-md bg-violet-600 text-white text-[10px] flex items-center justify-center font-bold flex-shrink-0">
            {index + 1}
          </span>
          <span className="text-sm font-semibold text-stone-900">{section.name}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleCopy();
            }}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors"
          >
            {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
          </button>
          {expanded ? (
            <ChevronUp size={14} className="text-stone-400" />
          ) : (
            <ChevronDown size={14} className="text-stone-400" />
          )}
        </div>
      </div>
      {expanded && (
        <div className="px-4 py-4 bg-stone-50 border-t border-stone-100">
          <p className="text-sm text-stone-700 leading-relaxed whitespace-pre-wrap">
            {section.content}
          </p>
        </div>
      )}
    </div>
  );
}

// ── main component ────────────────────────────────────────────────────────────

export default function ScriptGenerator() {
  const navigate = useNavigate();
  const { selectedIdea, channelData, generatedScript, setGeneratedScript } = useWorkflow();

  const [flavor, setFlavor] = useState("educational");
  const [showFullScript, setShowFullScript] = useState(false);
  const [fullCopied, setFullCopied] = useState(false);

  const generateScript = useGenerateScript();

  if (!selectedIdea) {
    return (
      <div className="p-6 md:p-8 max-w-4xl mx-auto">
        <PipelineStepper current={2} />
        <div className="flex flex-col items-center justify-center text-center py-24">
          <div className="w-14 h-14 bg-violet-50 rounded-2xl flex items-center justify-center mb-4">
            <FileText size={24} className="text-violet-400" />
          </div>
          <h2 className="text-lg font-bold text-stone-900 mb-2">No idea selected</h2>
          <p className="text-stone-500 text-sm mb-6">Go back and pick a video idea first.</p>
          <button
            onClick={() => navigate("/video-idea-generator")}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors"
          >
            <ArrowLeft size={14} /> Back to Ideas
          </button>
        </div>
      </div>
    );
  }

  const handleGenerate = useCallback(async () => {
    setGeneratedScript(null);
    const payload = {
      title: selectedIdea.title,
      hook: selectedIdea.hook,
      angle: selectedIdea.angle,
      format: selectedIdea.format,
      flavor,
      channel_context: channelData
        ? {
            channel_name: channelData.channel_name,
            average_duration_seconds: channelData.average_duration_seconds,
            recent_video_titles: channelData.recent_videos?.map((v) => v.title) || [],
          }
        : undefined,
    };
    try {
      const data = await generateScript.mutateAsync(payload);
      setGeneratedScript(data);
    } catch {
      // error shown via generateScript.error
    }
  }, [selectedIdea, channelData, flavor, setGeneratedScript, generateScript]);

  const handleCopyFull = () => {
    if (!generatedScript?.script?.full_script) return;
    copyToClipboard(generatedScript.script.full_script);
    setFullCopied(true);
    setTimeout(() => setFullCopied(false), 2000);
  };

  const script = generatedScript?.script;
  const error = generateScript.error as { response?: { data?: { error?: { detail?: string } } }; message?: string } | null;

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      {/* Stepper */}
      <PipelineStepper current={2} />

      {/* Header */}
      <div className="flex items-center gap-3 mb-7">
        <button
          onClick={() => navigate("/video-idea-generator")}
          className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={16} />
        </button>
        <div className="w-9 h-9 bg-violet-50 rounded-xl flex items-center justify-center border border-violet-100">
          <FileText size={18} className="text-violet-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-stone-900">Script Writer</h1>
          <p className="text-stone-500 text-xs">
            Full script calibrated to your channel's average video length
          </p>
        </div>
      </div>

      <IdeaSummary idea={selectedIdea} />

      {/* Flavor picker */}
      <div className="mb-6">
        <h2 className="text-xs font-semibold text-stone-600 uppercase tracking-wider mb-3">
          Script Style
        </h2>
        <FlavorPicker selected={flavor} onChange={setFlavor} />
      </div>

      {/* Target duration notice */}
      {channelData && channelData.average_duration_seconds > 0 && (
        <div className="flex items-center gap-2 text-xs text-stone-600 mb-5 bg-white border border-stone-200 rounded-xl px-4 py-3 shadow-sm">
          <Clock size={13} className="text-indigo-500 flex-shrink-0" />
          Script will target&nbsp;
          <span className="text-stone-900 font-semibold">
            ~{Math.round((channelData.average_duration_seconds / 60) * 130).toLocaleString()} words
          </span>
          &nbsp;to match your channel average of&nbsp;
          <span className="text-stone-900 font-semibold">
            {formatDuration(channelData.average_duration_seconds)}
          </span>
        </div>
      )}

      {/* Generate button */}
      <button
        onClick={handleGenerate}
        disabled={generateScript.isPending}
        className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold py-2.5 px-5 rounded-xl text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed mb-6"
      >
        {generateScript.isPending ? (
          <>
            <Loader size={14} className="animate-spin" /> Writing Script…
          </>
        ) : generatedScript ? (
          <>
            <RefreshCw size={14} /> Regenerate
          </>
        ) : (
          <>
            <Sparkles size={14} /> Generate Script
          </>
        )}
      </button>

      {error && (
        <div className="flex items-center gap-2 text-red-600 text-xs bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-6">
          <AlertCircle size={13} />
          {error?.response?.data?.error?.detail || error?.message}
        </div>
      )}

      {/* Script output */}
      {script && (
        <div>
          {/* Stats row */}
          <div className="flex flex-wrap gap-4 mb-5 p-4 bg-white border border-stone-200 rounded-xl shadow-sm">
            <div className="flex items-center gap-2 text-sm">
              <BookOpen size={13} className="text-violet-500" />
              <span className="text-stone-500">Words:</span>
              <span className="text-stone-900 font-semibold">
                {script.word_count?.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock size={13} className="text-indigo-500" />
              <span className="text-stone-500">Est. duration:</span>
              <span className="text-stone-900 font-semibold">
                {formatDuration(script.estimated_duration_seconds)}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <FileText size={13} className="text-emerald-500" />
              <span className="text-stone-500">Sections:</span>
              <span className="text-stone-900 font-semibold">{script.sections?.length}</span>
            </div>
          </div>

          {/* Sections */}
          <div className="mb-4">
            {script.sections?.map((section, i) => (
              <ScriptSectionCard key={i} section={section} index={i} />
            ))}
          </div>

          {/* Full script expandable */}
          <div className="border border-stone-200 rounded-xl overflow-hidden mb-8 shadow-sm">
            <div
              className="flex items-center justify-between px-4 py-3 bg-white cursor-pointer hover:bg-stone-50"
              onClick={() => setShowFullScript(!showFullScript)}
            >
              <span className="text-sm font-semibold text-stone-900 flex items-center gap-2">
                <FileText size={14} className="text-stone-400" />
                Full Script (copy-ready)
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopyFull();
                  }}
                  className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 px-3 py-1.5 rounded-lg transition-colors"
                >
                  {fullCopied ? (
                    <Check size={12} className="text-emerald-500" />
                  ) : (
                    <Copy size={12} />
                  )}
                  {fullCopied ? "Copied!" : "Copy all"}
                </button>
                {showFullScript ? (
                  <ChevronUp size={14} className="text-stone-400" />
                ) : (
                  <ChevronDown size={14} className="text-stone-400" />
                )}
              </div>
            </div>
            {showFullScript && (
              <div className="p-4 bg-stone-50 border-t border-stone-100 max-h-96 overflow-y-auto">
                <pre className="text-sm text-stone-700 whitespace-pre-wrap leading-relaxed font-sans">
                  {script.full_script}
                </pre>
              </div>
            )}
          </div>

          {/* Next step CTA */}
          <div className="bg-white border border-stone-200 rounded-xl p-5 text-center shadow-sm">
            <p className="text-sm text-stone-500 mb-4">
              Happy with the script? Generate title variations next.
            </p>
            <button
              onClick={() => navigate("/title-suggestor")}
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2.5 px-6 rounded-xl text-sm transition-colors"
            >
              Title Suggestor <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
