import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText, Sparkles, Copy, Check, RefreshCw,
  Clock, BookOpen, ChevronDown, ChevronUp,
  AlertCircle, Loader, ArrowLeft, ArrowRight,
} from "lucide-react";
import { useWorkflow } from "../context/WorkflowContext";
import { useGenerateScript } from "../api/useWorkflow";
import type { ScriptSection as ScriptSectionType } from "../types/workflow";

// ── constants ─────────────────────────────────────────────────────────────────

const FLAVORS = [
  { id: "educational",  label: "Educational",  emoji: "📚", desc: "Structured & step-by-step" },
  { id: "entertaining", label: "Entertaining", emoji: "🎉", desc: "Energetic & humour-driven" },
  { id: "storytelling", label: "Storytelling",  emoji: "🎭", desc: "Narrative arc & emotion" },
  { id: "documentary",  label: "Documentary",  emoji: "🎬", desc: "Research-heavy & authoritative" },
];

// ── helpers ───────────────────────────────────────────────────────────────────

function formatDuration(seconds: number): string {
  if (!seconds) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m >= 60
    ? `${Math.floor(m / 60)}h ${m % 60}m`
    : `${m}m ${s.toString().padStart(2, "0")}s`;
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

function IdeaSummary({ idea }: { idea: NonNullable<ReturnType<typeof useWorkflow>["selectedIdea"]> }) {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 mb-6">
      <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Selected Idea</p>
      <h2 className="text-base font-bold text-white leading-snug mb-2">{idea.title}</h2>
      <p className="text-xs text-gray-300 mb-2">
        <span className="text-gray-100 font-medium">Hook: </span>{idea.hook}
      </p>
      <div className="flex flex-wrap gap-2">
        <span className="bg-blue-900/50 text-blue-300 text-xs px-2 py-0.5 rounded-full">{idea.angle}</span>
        <span className="bg-purple-900/50 text-purple-300 text-xs px-2 py-0.5 rounded-full">{idea.format}</span>
      </div>
    </div>
  );
}

function FlavorPicker({ selected, onChange }: { selected: string; onChange: (id: string) => void }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
      {FLAVORS.map((f) => (
        <button
          key={f.id}
          onClick={() => onChange(f.id)}
          className={`flex flex-col items-start p-3 rounded-lg border text-left transition-all ${
            selected === f.id
              ? "border-blue-500 bg-blue-900/30"
              : "border-gray-700 bg-gray-800 hover:border-gray-500"
          }`}
        >
          <span className="text-xl mb-1">{f.emoji}</span>
          <span className="text-sm font-semibold text-white">{f.label}</span>
          <span className="text-xs text-gray-400 mt-0.5">{f.desc}</span>
        </button>
      ))}
    </div>
  );
}

function ScriptSectionCard({ section, index }: { section: ScriptSectionType; index: number }) {
  const [expanded, setExpanded] = useState(true);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    copyToClipboard(section.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="border border-gray-700 rounded-lg mb-3 overflow-hidden">
      <div
        className="flex items-center justify-between px-4 py-2.5 bg-gray-800 cursor-pointer hover:bg-gray-750 select-none"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded bg-blue-700 text-white text-xs flex items-center justify-center font-bold flex-shrink-0">
            {index + 1}
          </span>
          <span className="text-sm font-semibold text-white">{section.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); handleCopy(); }}
            className="p-1 text-gray-400 hover:text-white transition-colors"
          >
            {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
          </button>
          {expanded ? <ChevronUp size={15} className="text-gray-400" /> : <ChevronDown size={15} className="text-gray-400" />}
        </div>
      </div>
      {expanded && (
        <div className="px-4 py-3 bg-gray-900">
          <p className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap">{section.content}</p>
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
      <div className="bg-gray-900 min-h-screen flex flex-col items-center justify-center text-center p-8">
        <FileText size={48} className="text-gray-600 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">No idea selected</h2>
        <p className="text-gray-400 mb-6 text-sm">Go back and pick a video idea first.</p>
        <button
          onClick={() => navigate("/video-idea-generator")}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors"
        >
          <ArrowLeft size={15} /> Back to Ideas
        </button>
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
  const error = generateScript.error as any;

  return (
    <div className="bg-gray-900 text-gray-200 min-h-screen font-sans">
      <div className="max-w-4xl mx-auto p-4 md:p-8">
        <button onClick={() => navigate("/video-idea-generator")} className="flex items-center gap-1.5 text-gray-400 hover:text-white text-sm mb-6 transition-colors">
          <ArrowLeft size={14} /> Back to Ideas
        </button>

        <header className="mb-8">
          <div className="inline-flex items-center justify-center bg-purple-500/10 text-purple-400 rounded-full p-3 mb-3">
            <FileText size={28} />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Script Generator</h1>
          <p className="text-gray-400 mt-1 text-sm">Generates a full script calibrated to your channel's average video length.</p>
        </header>

        <IdeaSummary idea={selectedIdea} />

        <section className="mb-6">
          <h2 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">1</span>
            Choose Script Flavor
          </h2>
          <FlavorPicker selected={flavor} onChange={setFlavor} />
        </section>

        {channelData && channelData.average_duration_seconds > 0 && (
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-6 bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2.5">
            <Clock size={14} className="text-blue-400 flex-shrink-0" />
            Script will target&nbsp;
            <span className="text-white font-medium">
              ~{Math.round((channelData.average_duration_seconds / 60) * 130).toLocaleString()} words
            </span>
            &nbsp;to match your channel average of&nbsp;
            <span className="text-white font-medium">{formatDuration(channelData.average_duration_seconds)}</span>
          </div>
        )}

        <button
          onClick={handleGenerate}
          disabled={generateScript.isPending}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5 px-6 rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-6"
        >
          {generateScript.isPending ? (
            <><Loader size={15} className="animate-spin" /> Writing Script…</>
          ) : generatedScript ? (
            <><RefreshCw size={15} /> Regenerate</>
          ) : (
            <><Sparkles size={15} /> Generate Script</>
          )}
        </button>

        {error && (
          <div className="flex items-center gap-2 text-red-400 text-sm mb-6">
            <AlertCircle size={15} /> {error?.response?.data?.error?.detail || error?.message}
          </div>
        )}

        {script && (
          <section>
            <div className="flex flex-wrap gap-4 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <BookOpen size={14} className="text-purple-400" />
                <span className="text-gray-400">Words:</span>
                <span className="text-white font-semibold">{script.word_count?.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock size={14} className="text-blue-400" />
                <span className="text-gray-400">Est. duration:</span>
                <span className="text-white font-semibold">{formatDuration(script.estimated_duration_seconds)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <FileText size={14} className="text-green-400" />
                <span className="text-gray-400">Sections:</span>
                <span className="text-white font-semibold">{script.sections?.length}</span>
              </div>
            </div>

            <div className="mb-4">
              {script.sections?.map((section, i) => (
                <ScriptSectionCard key={i} section={section} index={i} />
              ))}
            </div>

            <div className="border border-gray-700 rounded-xl overflow-hidden mb-8">
              <div
                className="flex items-center justify-between px-4 py-3 bg-gray-800 cursor-pointer"
                onClick={() => setShowFullScript(!showFullScript)}
              >
                <span className="text-sm font-semibold text-white flex items-center gap-2">
                  <FileText size={15} className="text-gray-400" />
                  Full Script (copy-ready)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleCopyFull(); }}
                    className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white bg-gray-700 hover:bg-gray-600 px-3 py-1.5 rounded-md transition-colors"
                  >
                    {fullCopied ? <Check size={13} className="text-green-400" /> : <Copy size={13} />}
                    {fullCopied ? "Copied!" : "Copy all"}
                  </button>
                  {showFullScript ? <ChevronUp size={15} className="text-gray-400" /> : <ChevronDown size={15} className="text-gray-400" />}
                </div>
              </div>
              {showFullScript && (
                <div className="p-4 bg-gray-900 max-h-96 overflow-y-auto">
                  <pre className="text-sm text-gray-200 whitespace-pre-wrap leading-relaxed font-sans">{script.full_script}</pre>
                </div>
              )}
            </div>

            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5 text-center">
              <p className="text-sm text-gray-400 mb-3">Happy with the script? Generate 10 title variations next.</p>
              <button
                onClick={() => navigate("/title-suggestor")}
                className="inline-flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-2.5 px-6 rounded-lg text-sm transition-colors"
              >
                Title Suggestor <ArrowRight size={14} />
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
