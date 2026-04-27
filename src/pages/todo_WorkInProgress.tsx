import { useNavigate } from "react-router-dom";
import { ArrowLeft, Wrench } from "lucide-react";

export default function WorkInProgress() {
  const navigate = useNavigate();

  return (
    <div className="bg-gray-900 min-h-screen flex flex-col items-center justify-center text-center p-8">
      <div className="inline-flex items-center justify-center bg-yellow-500/10 text-yellow-400 rounded-full p-4 mb-6">
        <Wrench size={40} />
      </div>
      <h1 className="text-2xl font-bold text-white mb-2">Coming Soon</h1>
      <p className="text-gray-400 mt-1 text-sm max-w-xs">
        This tool is currently under construction. Check back soon!
      </p>
      <button
        onClick={() => navigate("/dashboard")}
        className="mt-8 flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2.5 px-6 rounded-lg text-sm transition-colors"
      >
        <ArrowLeft size={15} /> Back to Dashboard
      </button>
    </div>
  );
}
