import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileSearch,
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  Hash,
  Tag,
  ArrowLeft,
  AlertCircle,
  Loader,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  Eye,
} from "lucide-react";
import { useWorkflow } from "../context/WorkflowContext";
import { useGenerateSeoDescription } from "../api/useWorkflow";
import PipelineStepper from "../components/PipelineStepper";

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

function buildScriptOutline(
  script: ReturnType<typeof useWorkflow>["generatedScript"]
): string | null {
  if (!script?.script?.sections?.length) return null;
  return script.script.sections.map((s) => s.name).join(" → ");
}

function wordCount(text: string): number {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

// ── sub-components ────────────────────────────────────────────────────────────

function ContextBanner({
  ideaTitle,
  selectedTitleText,
}: {
  ideaTitle: string;
  selectedTitleText?: string;
}) {
  return (
    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6">
      <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider mb-1">
        Writing description for
      </p>
      {selectedTitleText ? (
        <>
          <p className="text-sm font-bold text-stone-900">{selectedTitleText}</p>
          <p className="text-xs text-stone-500 mt-0.5">
            <span className="text-stone-600">Idea: </span>
            {ideaTitle}
          </p>
        </>
      ) : (
        <p className="text-sm font-bold text-stone-900">{ideaTitle}</p>
      )}
    </div>
  );
}

function CopyButton({ getText }: { getText: () => string }) {
  const [copied, setCopied] = useState(false);
  const handle = (e: React.MouseEvent) => {
    e.stopPropagation();
    copyToClipboard(getText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handle}
      className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors ${
        copied
          ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
          : "bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-900"
      }`}
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

function ProgressBar({ count, max, unit }: { count: number; max: number; unit: string }) {
  const pct = Math.min((count / max) * 100, 100);
  const color = pct > 90 ? "bg-red-500" : pct > 70 ? "bg-amber-500" : "bg-emerald-500";
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-1.5 bg-stone-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className={`text-xs font-medium tabular-nums ${pct > 90 ? "text-red-500" : "text-stone-400"}`}>
        {count.toLocaleString()} / {max.toLocaleString()} {unit}
      </span>
    </div>
  );
}

function SectionCard({
  icon,
  title,
  children,
  actions,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="border border-stone-200 rounded-xl overflow-hidden mb-4 shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-stone-100">
        <span className="flex items-center gap-2 text-sm font-semibold text-stone-900">
          {icon}
          {title}
        </span>
        <div className="flex items-center gap-2">{actions}</div>
      </div>
      <div className="bg-stone-50 px-4 py-4">{children}</div>
    </div>
  );
}

// ── main component ────────────────────────────────────────────────────────────

export default function SeoDescription() {
  const navigate = useNavigate();
  const {
    selectedIdea,
    generatedScript,
    channelData,
    selectedTitle,
    seoDescription,
    setSeoDescription,
    resetFromTitles,
  } = useWorkflow();

  const [keywordsExpanded, setKeywordsExpanded] = useState(false);
  const [editableDesc, setEditableDesc] = useState(seoDescription?.description || "");
  const [editableTags, setEditableTags] = useState(seoDescription?.tags || "");

  const generateSeo = useGenerateSeoDescription();

  if (!selectedIdea) {
    return (
      <div className="p-6 md:p-8 max-w-4xl mx-auto">
        <PipelineStepper current={4} />
        <div className="flex flex-col items-center justify-center text-center py-24">
          <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-4">
            <FileSearch size={24} className="text-emerald-400" />
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
    resetFromTitles();
    setEditableDesc("");
    setEditableTags("");
    const scriptOutline = buildScriptOutline(generatedScript);
    const activeTitle = selectedTitle?.title || selectedIdea.title;
    try {
      const data = await generateSeo.mutateAsync({
        title: activeTitle,
        topic: selectedIdea.title,
        script_outline: scriptOutline,
        niche: channelData?.description?.slice(0, 150) || null,
        channel_context: channelData
          ? {
              channel_name: channelData.channel_name,
              handle: channelData.handle,
              recent_video_titles: channelData.recent_videos?.map((v) => v.title) || [],
            }
          : undefined,
      });
      setSeoDescription(data);
      setEditableDesc(data.description || "");
      setEditableTags(data.tags || "");
    } catch {
      // error shown via generateSeo.error
    }
  }, [selectedIdea, selectedTitle, generatedScript, channelData, setSeoDescription, resetFromTitles, generateSeo]);

  const seo = seoDescription;
  const error = generateSeo.error as { response?: { data?: { error?: { detail?: string } } }; message?: string } | null;

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <PipelineStepper current={4} />

      {/* Header */}
      <div className="flex items-center gap-3 mb-7">
        <button
          onClick={() => navigate("/title-suggestor")}
          className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={16} />
        </button>
        <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center border border-emerald-100">
          <FileSearch size={18} className="text-emerald-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-stone-900">SEO Description</h1>
          <p className="text-stone-500 text-xs">
            YouTube-optimised description · 5 hashtags · comma-separated tags
          </p>
        </div>
      </div>

      <ContextBanner ideaTitle={selectedIdea.title} selectedTitleText={selectedTitle?.title} />

      <button
        onClick={handleGenerate}
        disabled={generateSeo.isPending}
        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 px-5 rounded-xl text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed mb-6"
      >
        {generateSeo.isPending ? (
          <><Loader size={14} className="animate-spin" /> Generating…</>
        ) : seo ? (
          <><RefreshCw size={14} /> Regenerate</>
        ) : (
          <><Sparkles size={14} /> Generate SEO Description</>
        )}
      </button>

      {error && (
        <div className="flex items-center gap-2 text-red-600 text-xs bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-6">
          <AlertCircle size={13} />
          {error?.response?.data?.error?.detail || error?.message}
        </div>
      )}

      {seo && (
        <div>
          {/* Keywords toggle */}
          <div
            className="flex items-center justify-between px-4 py-3 bg-white border border-stone-200 rounded-xl mb-4 cursor-pointer hover:border-stone-300 transition-colors shadow-sm"
            onClick={() => setKeywordsExpanded(!keywordsExpanded)}
          >
            <span className="flex items-center gap-2 text-sm font-semibold text-stone-900">
              <TrendingUp size={14} className="text-indigo-500" />
              SEO Keywords
            </span>
            <div className="flex items-center gap-3">
              <span className="text-xs text-stone-400 hidden sm:block">
                Primary: <span className="text-indigo-600 font-medium">{seo.primary_keyword}</span>
              </span>
              {keywordsExpanded ? (
                <ChevronUp size={13} className="text-stone-400" />
              ) : (
                <ChevronDown size={13} className="text-stone-400" />
              )}
            </div>
          </div>

          {keywordsExpanded && (
            <div className="bg-white border border-stone-200 rounded-xl p-4 mb-4 shadow-sm">
              <div className="mb-3">
                <p className="text-xs font-medium text-stone-500 mb-1.5">Primary keyword</p>
                <span className="inline-block bg-indigo-50 border border-indigo-200 text-indigo-700 text-sm px-3 py-1 rounded-full font-semibold">
                  {seo.primary_keyword}
                </span>
              </div>
              {seo.secondary_keywords?.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-stone-500 mb-1.5">Secondary keywords</p>
                  <div className="flex flex-wrap gap-2">
                    {seo.secondary_keywords.map((kw) => (
                      <span key={kw} className="bg-stone-100 text-stone-600 text-xs px-2.5 py-0.5 rounded-full">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <SectionCard
            icon={<Eye size={14} className="text-emerald-500" />}
            title="Video Description"
            actions={<CopyButton getText={() => editableDesc} />}
          >
            <div className="mb-3">
              <ProgressBar count={wordCount(editableDesc)} max={2000} unit="words" />
            </div>
            <textarea
              value={editableDesc}
              onChange={(e) => setEditableDesc(e.target.value)}
              rows={16}
              className="w-full bg-white border border-stone-200 rounded-xl p-3 text-sm text-stone-800 leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent placeholder-stone-400"
              placeholder="Description will appear here…"
            />
            <p className="text-xs text-stone-400 mt-1.5">Edit directly before copying.</p>
          </SectionCard>

          <SectionCard
            icon={<Hash size={14} className="text-pink-500" />}
            title={`Hashtags (${seo.hashtags?.length || 0})`}
            actions={<CopyButton getText={() => (seo.hashtags || []).join(" ")} />}
          >
            <div className="flex flex-wrap gap-2">
              {(seo.hashtags || []).map((tag) => (
                <span key={tag} className="inline-flex items-center bg-pink-50 border border-pink-200 text-pink-700 text-sm font-medium px-3 py-1.5 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
            <p className="text-xs text-stone-400 mt-3">
              Already included at the bottom of the description above.
            </p>
          </SectionCard>

          <SectionCard
            icon={<Tag size={14} className="text-orange-500" />}
            title="YouTube Tags"
            actions={<CopyButton getText={() => editableTags} />}
          >
            <div className="mb-3">
              <ProgressBar count={editableTags.length} max={500} unit="chars" />
            </div>
            <textarea
              value={editableTags}
              onChange={(e) => setEditableTags(e.target.value)}
              rows={3}
              className="w-full bg-white border border-stone-200 rounded-xl p-3 text-sm text-stone-800 leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="tag1, tag2, tag3 …"
            />
            <p className="text-xs text-stone-400 mt-1.5">
              Paste into YouTube Studio → Details → Tags.
            </p>
          </SectionCard>

          <div className="mt-6 bg-white border border-dashed border-stone-300 rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <Check size={22} className="text-emerald-500" />
            </div>
            <p className="text-sm font-semibold text-stone-900 mb-1">Pipeline complete 🎉</p>
            <p className="text-xs text-stone-500">
              You have all the metadata you need to publish. Thumbnail ideas coming soon.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
