"use client";
import { useState } from "react";

export default function Home() {
  const [activeTab, setActiveTab] = useState("link");
  const [url, setUrl] = useState("");
  const [manualText, setManualText] = useState("");
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState("");

  const handleClear = () => {
    setUrl("");
    setManualText("");
    setSummary("");
  };

  const handleSummarize = async () => {
    if (loading) return;
    setLoading(true);
    setSummary("");

    try {
      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: activeTab === "link" ? url : null,
          manualText: activeTab === "manual" ? manualText : null,
        }),
      });
      const data = await response.json();
      setSummary(data.summary);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#050505] text-white flex flex-col p-12 sm:p-24 font-sans">
      <div className="max-w-2xl w-full">
        {/* Exact Header Style */}
        <h1 className="text-6xl font-bold mb-4 bg-gradient-to-b from-white to-zinc-500 bg-clip-text text-transparent tracking-tighter">
          Briefly AI
        </h1>
        <p className="text-zinc-400 text-lg mb-12 max-w-md leading-snug">
          Transform long videos into sharp, actionable summaries in seconds.
        </p>

        {/* Subtle Tab Toggle */}
        <div className="flex gap-6 mb-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">
          <button 
            onClick={() => setActiveTab("link")}
            className={activeTab === 'link' ? "text-white" : "hover:text-zinc-400 transition-colors"}
          >
            YouTube URL
          </button>
          <button 
            onClick={() => setActiveTab("manual")}
            className={activeTab === 'manual' ? "text-white" : "hover:text-zinc-400 transition-colors"}
          >
            Paste Text
          </button>
        </div>

        {/* The Integrated Input Bar with Clear Button */}
        <div className="flex items-center w-full gap-3">
          <div className="flex-1">
            {activeTab === "link" ? (
              <input
                type="text"
                placeholder="Paste YouTube URL here..."
                className="w-full bg-zinc-900/40 border border-zinc-800 p-4 rounded-xl outline-none focus:border-zinc-700 transition-all text-zinc-300"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            ) : (
              <textarea
                placeholder="Paste transcript here..."
                rows={1}
                className="w-full bg-zinc-900/40 border border-zinc-800 p-4 rounded-xl outline-none focus:border-zinc-700 transition-all resize-none text-zinc-300"
                value={manualText}
                onChange={(e) => setManualText(e.target.value)}
              />
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* The "X" Clear Button */}
            {(url || manualText || summary) && (
              <button 
                onClick={handleClear}
                className="p-2 text-zinc-500 hover:text-white transition-colors text-lg"
                title="Clear input"
              >
                ✕
              </button>
            )}
            
            <button
              onClick={handleSummarize}
              disabled={loading}
              className="bg-zinc-300 text-black px-5 py-4 rounded-lg font-bold text-sm whitespace-nowrap hover:bg-white transition-all disabled:opacity-50"
            >
              {loading ? "..." : "Summarize"}
            </button>
          </div>
        </div>

        {/* Summary Result */}
        {summary && (
          <div className="mt-12 border-t border-zinc-900 pt-8 animate-in fade-in duration-700">
            <div className="prose prose-invert max-w-none text-zinc-400 leading-relaxed">
              {summary.split('\n').map((line, i) => (
                <p key={i} className="mb-4">{line}</p>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}