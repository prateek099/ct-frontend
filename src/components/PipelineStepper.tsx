import { Check } from "lucide-react";
import { useNavigate } from "react-router-dom";

const STEPS = [
  { label: "Idea", path: "/video-idea-generator", step: 1 },
  { label: "Script", path: "/script-generator", step: 2 },
  { label: "Title", path: "/title-suggestor", step: 3 },
  { label: "SEO", path: "/seo-description", step: 4 },
] as const;

interface PipelineStepperProps {
  current: 1 | 2 | 3 | 4;
}

export default function PipelineStepper({ current }: PipelineStepperProps) {
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-1 mb-7">
      {STEPS.map((step, i) => {
        const isDone = step.step < current;
        const isActive = step.step === current;
        const isFuture = step.step > current;

        return (
          <div key={step.step} className="flex items-center">
            <button
              onClick={() => isDone && navigate(step.path)}
              disabled={isFuture}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 ${
                isActive
                  ? "bg-indigo-600 text-white shadow-sm shadow-indigo-200"
                  : isDone
                  ? "bg-stone-200 text-stone-700 hover:bg-stone-300 cursor-pointer"
                  : "bg-stone-100 text-stone-400 cursor-default"
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
                  isActive
                    ? "bg-white/25 text-white"
                    : isDone
                    ? "bg-stone-400 text-white"
                    : "bg-stone-200 text-stone-500"
                }`}
              >
                {isDone ? <Check size={9} strokeWidth={3} /> : step.step}
              </span>
              {step.label}
            </button>

            {i < STEPS.length - 1 && (
              <div
                className={`w-5 h-px mx-0.5 ${
                  isDone ? "bg-stone-400" : "bg-stone-200"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
