import { useNavigate } from "react-router-dom";
import { ArrowLeft, Wrench } from "lucide-react";

export default function WorkInProgress() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center text-center p-8 min-h-[60vh]">
      <div className="w-16 h-16 bg-amber-50 border border-amber-100 rounded-2xl flex items-center justify-center mb-5">
        <Wrench size={28} className="text-amber-500" />
      </div>
      <h1 className="text-xl font-bold text-stone-900 mb-2">Coming Soon</h1>
      <p className="text-stone-500 text-sm max-w-xs leading-relaxed">
        This tool is currently under development. Check back soon!
      </p>
      <button
        onClick={() => navigate("/")}
        className="mt-8 flex items-center gap-2 bg-stone-900 hover:bg-stone-800 text-white font-semibold py-2.5 px-5 rounded-xl text-sm transition-colors"
      >
        <ArrowLeft size={14} /> Back to Dashboard
      </button>
    </div>
  );
}
