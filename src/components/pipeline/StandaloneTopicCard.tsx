// StandaloneTopicCard — when a pipeline tool is opened standalone (no idea picked
// upstream), let the user type a topic / working title and synthesise a minimal
// VideoIdea so the tool can run without forcing them back to /idea.
import { useState } from "react";
import Icon from "../shared/Icon";
import type { VideoIdea } from "../../types/workflow";

interface Props {
  /** Verb fragment shown in the heading, e.g. "writing", "titles for", "description for". */
  forLabel: string;
  onSubmit: (idea: VideoIdea) => void;
}

export default function StandaloneTopicCard({ forLabel, onSubmit }: Props) {
  const [topic, setTopic] = useState("");

  const submit = () => {
    const t = topic.trim();
    if (!t) return;
    onSubmit({ title: t, hook: "", angle: "", format: "", reasoning: "" });
  };

  return (
    <div className="card" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div className="field-label">
        <Icon name="sparkles" size={12} /> Topic for {forLabel}
      </div>
      <p className="small muted" style={{ margin: 0 }}>
        You're in standalone mode — give this tool a topic to work with, no idea-pipeline required.
      </p>
      <div className="row" style={{ gap: 8 }}>
        <input
          className="input"
          value={topic}
          onChange={e => setTopic(e.target.value)}
          placeholder="e.g. How I built a YouTube studio for under $500"
          onKeyDown={e => e.key === "Enter" && submit()}
          style={{ flex: 1 }}
        />
        <button className="btn accent" onClick={submit} disabled={!topic.trim()}>
          Use topic <Icon name="arrowRight" size={13} />
        </button>
      </div>
    </div>
  );
}
