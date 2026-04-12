import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileSearch, Sparkles, Copy, Check, RefreshCw,
  Hash, Tag, ArrowLeft,
  AlertCircle, Loader, ChevronDown, ChevronUp,
  TrendingUp, Eye,
} from "lucide-react";
import { useWorkflow } from "../context/WorkflowContext";
import { useGenerateSeoDescription } from "../api/useWorkflow";

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

function buildScriptOutline(script: ReturnType<typeof useWorkflow>["generatedScript"]): string | null {
  if (!script?.script?.sections?.length) return null;
  return script.script.sections.map((s) => s.name).join(" → ");
}

function wordCount(text: string): number {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

// ── sub-components ────────────────────────────────────────────────────────────

function ContextBanner({ ideaTitle, selectedTitleText }: { ideaTitle: string; selectedTitleText?: string }) {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 mb-6 space-y-2">
      <p className="text-xs text-gray-400 uppercase tracking-wide">Writing description for</p>
      {selectedTitleText ? (
        <>
          <p className="text-sm font-bold text-white">{selectedTitleText}</p>
          <p className="text-xs text-gray-400"><span className="text-gray-300">Original idea: </span>{ideaTitle}</p>
        </>
      ) : (
        <p className="text-sm font-bold text-white">{ideaTitle}</p>
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
      className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md transition-colors ${
        copied ? "bg-green-800/50 text-green-300" : "bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white"
      }`}
    >
      {copied ? <Check size={13} /> : <Copy size={13} />}
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

function ProgressBar({ count, max, unit }: { count: number; max: number; unit: string }) {
  const pct = Math.min((count / max) * 100, 100);
  const color = pct > 90 ? "bg-red-500" : pct > 70 ? "bg-yellow-500" : "bg-green-500";
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className={`text-xs font-medium tabular-nums ${pct > 90 ? "text-red-400" : "text-gray-400"}`}>
        {count.toLocaleString()} / {max.toLocaleString()} {unit}
      </span>
    </div>
  );
}

function SectionCard({ icon, title, children, actions }: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="border border-gray-700 rounded-xl overflow-hidden mb-4">
      <div className="flex items-center justify-between px-4 py-3 bg-gray-800">
        <span className="flex items-center gap-2 text-sm font-semibold text-white">{icon}{title}</span>
        <div className="flex items-center gap-2">{actions}</div>
      </div>
      <div className="bg-gray-900 px-4 py-4">{children}</div>
    </div>
  );
}

// ── main component ────────────────────────────────────────────────────────────

export default function SeoDescription() {
  const navigate = useNavigate();
  const { selectedIdea, generatedScript, channelData, selectedTitle, seoDescription, setSeoDescription, resetFromTitles } = useWorkflow();

  const [keywordsExpanded, setKeywordsExpanded] = useState(false);
  const [editableDesc, setEditableDesc] = useState(seoDescription?.description || "");
  const [editableTags, setEditableTags] = useState(seoDescription?.tags || "");

  const generateSeo = useGenerateSeoDescription();

  if (!selectedIdea) {
    return (
      <div className="bg-gray-900 min-h-screen flex flex-col items-center justify-center text-center p-8">
        <FileSearch size={48} className="text-gray-600 mb-4" />
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
  const error = generateSeo.error as any;

  return (
    <div className="bg-gray-900 text-gray-200 min-h-screen font-sans">
      <div className="max-w-4xl mx-auto p-4 md:p-8">
        <button onClick={() => navigate("/title-suggestor")} className="flex items-center gap-1.5 text-gray-400 hover:text-white text-sm mb-6 transition-colors">
          <ArrowLeft size={14} /> Back to Titles
        </button>

        <header className="mb-8">
          <div className="inline-flex items-center justify-center bg-green-500/10 text-green-400 rounded-full p-3 mb-3">
            <FileSearch size={28} />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">SEO Description</h1>
          <p className="text-gray-400 mt-1 text-sm">
            YouTube-optimised description (&lt;2000 words) · 5 hashtags · comma-separated tags (&lt;500 chars).
          </p>
        </header>

        <ContextBanner ideaTitle={selectedIdea.title} selectedTitleText={selectedTitle?.title} />

        <button
          onClick={handleGenerate}
          disabled={generateSeo.isPending}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 px-6 rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-6"
        >
          {generateSeo.isPending ? (
            <><Loader size={15} className="animate-spin" /> Generating…</>
          ) : seo ? (
            <><RefreshCw size={15} /> Regenerate</>
          ) : (
            <><Sparkles size={15} /> Generate SEO Description</>
          )}
        </button>

        {error && (
          <div className="flex items-center gap-2 text-red-400 text-sm mb-6">
            <AlertCircle size={15} /> {error?.response?.data?.error?.detail || error?.message}
          </div>
        )}

        {seo && (
          <div>
            {/* Keywords */}
            <div
              className="flex items-center justify-between px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl mb-4 cursor-pointer hover:border-gray-600 transition-colors"
              onClick={() => setKeywordsExpanded(!keywordsExpanded)}
            >
              <span className="flex items-center gap-2 text-sm font-semibold text-white">
                <TrendingUp size={15} className="text-blue-400" />
                SEO Keywords
              </span>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400 hidden sm:block">
                  Primary: <span className="text-blue-300 font-medium">{seo.primary_keyword}</span>
                </span>
                {keywordsExpanded ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
              </div>
            </div>

            {keywordsExpanded && (
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 mb-4 -mt-1">
                <div className="mb-3">
                  <p className="text-xs text-gray-400 mb-1 font-medium">Primary keyword</p>
                  <span className="inline-block bg-blue-900/50 text-blue-300 text-sm px-3 py-1 rounded-full font-semibold">{seo.primary_keyword}</span>
                </div>
                {seo.secondary_keywords?.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-400 mb-2 font-medium">Secondary keywords</p>
                    <div className="flex flex-wrap gap-2">
                      {seo.secondary_keywords.map((kw) => (
                        <span key={kw} className="bg-gray-700 text-gray-300 text-xs px-2 py-0.5 rounded-full">{kw}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Description */}
            <SectionCard
              icon={<Eye size={15} className="text-green-400" />}
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
                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-sm text-gray-200 leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-gray-500"
                placeholder="Description will appear here…"
              />
              <p className="text-xs text-gray-500 mt-1">You can edit directly before copying.</p>
            </SectionCard>

            {/* Hashtags */}
            <SectionCard
              icon={<Hash size={15} className="text-pink-400" />}
              title={`Hashtags (${seo.hashtags?.length || 0})`}
              actions={<CopyButton getText={() => (seo.hashtags || []).join(" ")} />}
            >
              <div className="flex flex-wrap gap-2">
                {(seo.hashtags || []).map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1 bg-pink-900/30 border border-pink-800/50 text-pink-300 text-sm font-medium px-3 py-1.5 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-3">These are already included at the bottom of the description above.</p>
            </SectionCard>

            {/* Tags */}
            <SectionCard
              icon={<Tag size={15} className="text-orange-400" />}
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
                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-sm text-gray-200 leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="tag1, tag2, tag3 …"
              />
              <p className="text-xs text-gray-500 mt-1">Paste into YouTube Studio → Details → Tags. You can edit directly.</p>
            </SectionCard>

            {/* Placeholder — next phase */}
            <div className="mt-6 bg-gray-800/50 border border-dashed border-gray-600 rounded-xl p-5 text-center">
              <p className="text-sm text-gray-400 mb-3">All set? Thumbnail ideas coming next.</p>
              <button disabled className="inline-flex items-center gap-2 bg-gray-700 text-gray-500 font-semibold py-2.5 px-6 rounded-lg text-sm cursor-not-allowed">
                Thumbnail Ideas
                <span className="text-xs bg-gray-600 text-gray-400 px-2 py-0.5 rounded-full ml-1">Soon</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
