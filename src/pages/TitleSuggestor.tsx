import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Type, Sparkles, Copy, Check, RefreshCw,
  ChevronDown, ChevronUp, ArrowLeft, ArrowRight,
  AlertCircle, Loader, Tag, Search, TrendingUp,
} from "lucide-react";
import { useWorkflow } from "../context/WorkflowContext";
import { useGenerateTitles } from "../api/useWorkflow";
import type { TitleItem } from "../types/workflow";

// ── helpers ───────────────────────────────────────────────────────────────────

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

function buildScriptSummary(script: ReturnType<typeof useWorkflow>["generatedScript"]): string | null {
  if (!script?.script?.sections?.length) return null;
  return script.script.sections.map((s) => s.name).join(" → ");
}

// ── CTR angle colour map ──────────────────────────────────────────────────────

const CTR_COLORS: Record<string, string> = {
  Curiosity:     "bg-yellow-900/40 text-yellow-300",
  Fear:          "bg-red-900/40 text-red-300",
  Aspiration:    "bg-green-900/40 text-green-300",
  "Social Proof":"bg-blue-900/40 text-blue-300",
  Controversy:   "bg-orange-900/40 text-orange-300",
  Urgency:       "bg-pink-900/40 text-pink-300",
  Authority:     "bg-purple-900/40 text-purple-300",
  Relatability:  "bg-teal-900/40 text-teal-300",
};

function ctrColor(angle: string): string {
  return CTR_COLORS[angle] || "bg-gray-700 text-gray-300";
}

// ── sub-components ────────────────────────────────────────────────────────────

function ContextBanner({ ideaTitle, scriptSections }: { ideaTitle: string; scriptSections?: string[] }) {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 mb-6 space-y-2">
      <p className="text-xs text-gray-400 uppercase tracking-wide">Based on</p>
      <p className="text-sm font-bold text-white">{ideaTitle}</p>
      {scriptSections && scriptSections.length > 0 && (
        <p className="text-xs text-gray-400 flex items-center gap-1 flex-wrap">
          <Tag size={11} className="flex-shrink-0" />
          {scriptSections.join(" → ")}
        </p>
      )}
    </div>
  );
}

function TitleCard({ item, index, isSelected, onSelect }: {
  item: TitleItem;
  index: number;
  isSelected: boolean;
  onSelect: (item: TitleItem) => void;
}) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    copyToClipboard(item.title);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`border rounded-xl p-4 mb-3 transition-all cursor-pointer ${
        isSelected ? "border-green-500 bg-green-900/10" : "border-gray-700 bg-gray-800 hover:border-blue-500"
      }`}
      onClick={() => onSelect(item)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <span className={`flex-shrink-0 w-6 h-6 rounded-full text-white text-xs flex items-center justify-center font-bold mt-0.5 ${isSelected ? "bg-green-600" : "bg-blue-600"}`}>
            {isSelected ? "✓" : index + 1}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white leading-snug">{item.title}</p>
            <p className="text-xs text-gray-500 mt-0.5">{item.title.length} chars</p>
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button onClick={handleCopy} className="p-1.5 text-gray-400 hover:text-white transition-colors">
            {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
          </button>
          <button onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }} className="p-1.5 text-gray-400 hover:text-white transition-colors">
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mt-3 ml-9">
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ctrColor(item.ctr_angle)}`}>{item.ctr_angle}</span>
        <span className="bg-gray-700 text-gray-300 text-xs px-2 py-0.5 rounded-full">{item.style}</span>
        {item.seo_keywords?.slice(0, 2).map((kw) => (
          <span key={kw} className="bg-gray-700/60 text-gray-400 text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
            <Search size={9} /> {kw}
          </span>
        ))}
      </div>

      {expanded && (
        <div className="mt-3 ml-9 space-y-2 border-t border-gray-700 pt-3">
          <p className="text-xs text-gray-300 italic leading-relaxed">
            <span className="text-gray-100 font-medium not-italic">Reasoning: </span>{item.reasoning}
          </p>
          <p className="text-xs text-gray-400">
            <span className="text-gray-300 font-medium">Search intent: </span>{item.search_intent}
          </p>
          {item.seo_keywords?.length > 0 && (
            <p className="text-xs text-gray-400">
              <span className="text-gray-300 font-medium">SEO keywords: </span>{item.seo_keywords.join(", ")}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ── main component ────────────────────────────────────────────────────────────

export default function TitleSuggestor() {
  const navigate = useNavigate();
  const {
    selectedIdea, generatedScript, channelData,
    suggestedTitles, setSuggestedTitles,
    selectedTitle, setSelectedTitle,
    resetFromScript,
  } = useWorkflow();

  const generateTitles = useGenerateTitles();

  if (!selectedIdea) {
    return (
      <div className="bg-gray-900 min-h-screen flex flex-col items-center justify-center text-center p-8">
        <Type size={48} className="text-gray-600 mb-4" />
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
    resetFromScript();
    const scriptSummary = buildScriptSummary(generatedScript);
    try {
      const titles = await generateTitles.mutateAsync({
        topic: selectedIdea.title,
        hook: selectedIdea.hook || "",
        angle: selectedIdea.angle || "",
        format: selectedIdea.format || "",
        script_summary: scriptSummary,
        channel_context: channelData
          ? {
              channel_name: channelData.channel_name,
              handle: channelData.handle,
              recent_video_titles: channelData.recent_videos?.map((v) => v.title) || [],
            }
          : undefined,
      });
      setSuggestedTitles(titles);
    } catch {
      // error shown via generateTitles.error
    }
  }, [selectedIdea, generatedScript, channelData, setSuggestedTitles, resetFromScript, generateTitles]);

  const error = generateTitles.error as any;

  return (
    <div className="bg-gray-900 text-gray-200 min-h-screen font-sans">
      <div className="max-w-4xl mx-auto p-4 md:p-8">
        <button onClick={() => navigate("/script-generator")} className="flex items-center gap-1.5 text-gray-400 hover:text-white text-sm mb-6 transition-colors">
          <ArrowLeft size={14} /> Back to Script
        </button>

        <header className="mb-8">
          <div className="inline-flex items-center justify-center bg-yellow-500/10 text-yellow-400 rounded-full p-3 mb-3">
            <Type size={28} />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Title Suggestor</h1>
          <p className="text-gray-400 mt-1 text-sm">10 title variations across styles — each with CTR angle, search intent, and reasoning.</p>
        </header>

        <ContextBanner
          ideaTitle={selectedIdea.title}
          scriptSections={generatedScript?.script?.sections?.map((s) => s.name)}
        />

        <button
          onClick={handleGenerate}
          disabled={generateTitles.isPending}
          className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-2.5 px-6 rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-6"
        >
          {generateTitles.isPending ? (
            <><Loader size={15} className="animate-spin" /> Generating Titles…</>
          ) : suggestedTitles.length > 0 ? (
            <><RefreshCw size={15} /> Regenerate Titles</>
          ) : (
            <><Sparkles size={15} /> Generate 10 Titles</>
          )}
        </button>

        {error && (
          <div className="flex items-center gap-2 text-red-400 text-sm mb-6">
            <AlertCircle size={15} /> {error?.response?.data?.error?.detail || error?.message}
          </div>
        )}

        {selectedTitle && (
          <div className="flex items-start gap-3 bg-green-900/20 border border-green-700 rounded-xl px-4 py-3 mb-6">
            <Check size={16} className="text-green-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-green-400 font-medium mb-0.5">Selected title</p>
              <p className="text-sm font-bold text-white">{selectedTitle.title}</p>
            </div>
            <button onClick={() => setSelectedTitle(null)} className="text-xs text-gray-500 hover:text-white transition-colors flex-shrink-0">
              Change
            </button>
          </div>
        )}

        {suggestedTitles.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <TrendingUp size={16} className="text-yellow-400" />
                10 Title Variations
              </h2>
              <p className="text-xs text-gray-500">Click a card to select it</p>
            </div>

            {suggestedTitles.map((item, i) => (
              <TitleCard
                key={i}
                item={item}
                index={i}
                isSelected={selectedTitle?.title === item.title}
                onSelect={setSelectedTitle}
              />
            ))}

            <div className={`mt-6 rounded-xl p-5 text-center border ${selectedTitle ? "bg-gray-800/50 border-gray-700" : "bg-gray-800/30 border-dashed border-gray-600"}`}>
              <p className="text-sm text-gray-400 mb-3">
                {selectedTitle
                  ? `Using: "${selectedTitle.title.slice(0, 55)}${selectedTitle.title.length > 55 ? "…" : ""}" — generate your SEO description next.`
                  : "Select a title above, then generate your SEO description."}
              </p>
              <button
                onClick={() => navigate("/seo-description")}
                disabled={!selectedTitle}
                className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 px-6 rounded-lg text-sm transition-colors disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed"
              >
                SEO Description <ArrowRight size={14} />
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
