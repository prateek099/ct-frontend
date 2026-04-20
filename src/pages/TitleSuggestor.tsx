import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Type,
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  Loader,
  Tag,
  Search,
  TrendingUp,
} from "lucide-react";
import { useWorkflow } from "../context/WorkflowContext";
import { useGenerateTitles } from "../api/useWorkflow";
import PipelineStepper from "../components/PipelineStepper";
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

function buildScriptSummary(
  script: ReturnType<typeof useWorkflow>["generatedScript"]
): string | null {
  if (!script?.script?.sections?.length) return null;
  return script.script.sections.map((s) => s.name).join(" → ");
}

const CTR_COLORS: Record<string, string> = {
  Curiosity: "bg-amber-50 text-amber-700 border-amber-200",
  Fear: "bg-red-50 text-red-700 border-red-200",
  Aspiration: "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Social Proof": "bg-blue-50 text-blue-700 border-blue-200",
  Controversy: "bg-orange-50 text-orange-700 border-orange-200",
  Urgency: "bg-pink-50 text-pink-700 border-pink-200",
  Authority: "bg-violet-50 text-violet-700 border-violet-200",
  Relatability: "bg-teal-50 text-teal-700 border-teal-200",
};

function ctrColor(angle: string): string {
  return CTR_COLORS[angle] || "bg-stone-100 text-stone-600 border-stone-200";
}

// ── sub-components ────────────────────────────────────────────────────────────

function ContextBanner({
  ideaTitle,
  scriptSections,
}: {
  ideaTitle: string;
  scriptSections?: string[];
}) {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
      <p className="text-[10px] font-semibold text-amber-600 uppercase tracking-wider mb-1">
        Based on
      </p>
      <p className="text-sm font-bold text-stone-900">{ideaTitle}</p>
      {scriptSections && scriptSections.length > 0 && (
        <p className="text-xs text-stone-500 flex items-center gap-1 flex-wrap mt-1">
          <Tag size={11} className="flex-shrink-0 text-amber-500" />
          {scriptSections.join(" → ")}
        </p>
      )}
    </div>
  );
}

function TitleCard({
  item,
  index,
  isSelected,
  onSelect,
}: {
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
      className={`border rounded-xl p-4 mb-2.5 transition-all cursor-pointer ${
        isSelected
          ? "border-emerald-400 bg-emerald-50 shadow-sm"
          : "border-stone-200 bg-white hover:border-amber-300 hover:shadow-sm"
      }`}
      onClick={() => onSelect(item)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <span
            className={`flex-shrink-0 w-6 h-6 rounded-full text-white text-[10px] flex items-center justify-center font-bold mt-0.5 ${
              isSelected ? "bg-emerald-500" : "bg-indigo-600"
            }`}
          >
            {isSelected ? "✓" : index + 1}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-stone-900 leading-snug">{item.title}</p>
            <p className="text-xs text-stone-400 mt-0.5">{item.title.length} chars</p>
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={handleCopy}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors"
          >
            {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors"
          >
            {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mt-3 ml-9">
        <span
          className={`text-xs px-2 py-0.5 rounded-full font-medium border ${ctrColor(item.ctr_angle)}`}
        >
          {item.ctr_angle}
        </span>
        <span className="bg-stone-100 text-stone-600 text-xs px-2 py-0.5 rounded-full">
          {item.style}
        </span>
        {item.seo_keywords?.slice(0, 2).map((kw) => (
          <span
            key={kw}
            className="bg-stone-50 text-stone-500 text-xs px-2 py-0.5 rounded-full flex items-center gap-1 border border-stone-200"
          >
            <Search size={9} /> {kw}
          </span>
        ))}
      </div>

      {expanded && (
        <div className="mt-3 ml-9 space-y-2 border-t border-stone-100 pt-3">
          <p className="text-xs text-stone-600 italic leading-relaxed">
            <span className="text-stone-800 font-medium not-italic">Reasoning: </span>
            {item.reasoning}
          </p>
          <p className="text-xs text-stone-500">
            <span className="text-stone-700 font-medium">Search intent: </span>
            {item.search_intent}
          </p>
          {item.seo_keywords?.length > 0 && (
            <p className="text-xs text-stone-500">
              <span className="text-stone-700 font-medium">SEO keywords: </span>
              {item.seo_keywords.join(", ")}
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
    selectedIdea,
    generatedScript,
    channelData,
    suggestedTitles,
    setSuggestedTitles,
    selectedTitle,
    setSelectedTitle,
    resetFromScript,
  } = useWorkflow();

  const generateTitles = useGenerateTitles();

  if (!selectedIdea) {
    return (
      <div className="p-6 md:p-8 max-w-4xl mx-auto">
        <PipelineStepper current={3} />
        <div className="flex flex-col items-center justify-center text-center py-24">
          <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mb-4">
            <Type size={24} className="text-amber-400" />
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

  const error = generateTitles.error as { response?: { data?: { error?: { detail?: string } } }; message?: string } | null;

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      {/* Stepper */}
      <PipelineStepper current={3} />

      {/* Header */}
      <div className="flex items-center gap-3 mb-7">
        <button
          onClick={() => navigate("/script-generator")}
          className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={16} />
        </button>
        <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center border border-amber-100">
          <Type size={18} className="text-amber-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-stone-900">Title Suggestor</h1>
          <p className="text-stone-500 text-xs">
            10 variations with CTR angle, search intent & reasoning
          </p>
        </div>
      </div>

      <ContextBanner
        ideaTitle={selectedIdea.title}
        scriptSections={generatedScript?.script?.sections?.map((s) => s.name)}
      />

      {/* Generate button */}
      <button
        onClick={handleGenerate}
        disabled={generateTitles.isPending}
        className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2.5 px-5 rounded-xl text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed mb-6"
      >
        {generateTitles.isPending ? (
          <>
            <Loader size={14} className="animate-spin" /> Generating Titles…
          </>
        ) : suggestedTitles.length > 0 ? (
          <>
            <RefreshCw size={14} /> Regenerate
          </>
        ) : (
          <>
            <Sparkles size={14} /> Generate 10 Titles
          </>
        )}
      </button>

      {error && (
        <div className="flex items-center gap-2 text-red-600 text-xs bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-6">
          <AlertCircle size={13} />
          {error?.response?.data?.error?.detail || error?.message}
        </div>
      )}

      {/* Selected title badge */}
      {selectedTitle && (
        <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 mb-6">
          <Check size={15} className="text-emerald-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider mb-0.5">
              Selected title
            </p>
            <p className="text-sm font-bold text-stone-900">{selectedTitle.title}</p>
          </div>
          <button
            onClick={() => setSelectedTitle(null)}
            className="text-xs text-stone-400 hover:text-stone-700 transition-colors flex-shrink-0"
          >
            Change
          </button>
        </div>
      )}

      {/* Titles list */}
      {suggestedTitles.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-stone-900 flex items-center gap-2">
              <TrendingUp size={14} className="text-amber-500" />
              {suggestedTitles.length} Title Variations
            </h2>
            <p className="text-xs text-stone-400">Click a card to select it</p>
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

          {/* Next step CTA */}
          <div
            className={`mt-6 rounded-xl p-5 text-center border ${
              selectedTitle
                ? "bg-white border-stone-200 shadow-sm"
                : "bg-stone-50 border-dashed border-stone-300"
            }`}
          >
            <p className="text-sm text-stone-500 mb-4">
              {selectedTitle
                ? `Using: "${selectedTitle.title.slice(0, 55)}${
                    selectedTitle.title.length > 55 ? "…" : ""
                  }" — generate SEO description next.`
                : "Select a title above, then generate your SEO description."}
            </p>
            <button
              onClick={() => navigate("/seo-description")}
              disabled={!selectedTitle}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 px-6 rounded-xl text-sm transition-colors disabled:bg-stone-200 disabled:text-stone-400 disabled:cursor-not-allowed"
            >
              SEO Description <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
