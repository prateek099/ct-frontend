// StandaloneActions — back-to-Create + Publish buttons shown on pipeline pages
// when the user has launched them via /create's "Standalone" tab.
//
// Publish behaviour:
//   - if the user has a project in progress (currentProjectId), open /publish/:id
//   - otherwise fall back to the dashboard — they haven't generated anything yet
import { useNavigate } from "react-router-dom";
import Icon from "../shared/Icon";

interface Props {
  currentProjectId: number | null;
  publishDisabled?: boolean;
  /** Optional override for the Publish button label. */
  publishLabel?: string;
}

export default function StandaloneActions({ currentProjectId, publishDisabled, publishLabel = "Publish" }: Props) {
  const navigate = useNavigate();
  return (
    <>
      <button className="btn" onClick={() => navigate("/create")}>
        <Icon name="arrowLeft" size={14} /> Back to Create
      </button>
      <button
        className="btn primary"
        disabled={publishDisabled}
        onClick={() => {
          if (currentProjectId != null) navigate(`/publish/${currentProjectId}`);
          else navigate("/dashboard");
        }}
      >
        {publishLabel} <Icon name="arrowRight" size={14} />
      </button>
    </>
  );
}
