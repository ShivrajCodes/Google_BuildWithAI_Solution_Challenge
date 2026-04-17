"use client";

import { useState, useEffect } from "react";
import { Search, Activity, ShieldCheck, ShieldAlert, History, Link as LinkIcon, Loader2, AlertCircle } from "lucide-react";

export default function Home() {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [recentScans, setRecentScans] = useState([]);

  // Load recent scans from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("mediaguard_scans");
    if (saved) {
      try {
        setRecentScans(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse recent scans", e);
      }
    }
  }, []);

  const saveScan = (scanResult) => {
    const newScan = {
      ...scanResult,
      timestamp: new Date().toISOString(),
      id: Date.now().toString(),
    };
    
    setRecentScans((prev) => {
      const updated = [newScan, ...prev].slice(0, 10);
      localStorage.setItem("mediaguard_scans", JSON.stringify(updated));
      return updated;
    });
  };

  const handleScan = async (e) => {
    e.preventDefault();
    if (!url.trim()) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("http://localhost:8000/check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image_url: url }),
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      const data = await response.json();
      
      const scanResult = {
        url,
        score: data.score,
        verdict: data.verdict,
        matches: data.matches || [],
      };
      
      setResult(scanResult);
      saveScan(scanResult);
    } catch (err) {
      console.error(err);
      setError("Failed to analyze media. Please ensure the backend is running at http://localhost:8000.");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + date.toLocaleDateString();
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/30">
      
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-slate-900 border-r border-slate-800 flex flex-col z-20 shadow-2xl">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.5)]">
            <Activity className="w-6 h-6 text-blue-400" />
          </div>
          <h1 className="font-bold text-xl tracking-tight bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
            MediaGuard AI
          </h1>
        </div>
        
        <div className="p-4 flex-1 overflow-y-auto">
          <div className="flex items-center gap-2 mb-4 text-slate-400 text-sm font-medium uppercase tracking-wider px-2">
            <History className="w-4 h-4" />
            <h2>Recent Scans</h2>
          </div>
          
          <div className="space-y-2">
            {recentScans.length === 0 ? (
              <div className="text-slate-500 text-sm italic px-2">No recent scans.</div>
            ) : (
              recentScans.map((scan) => (
                <div key={scan.id} className="group p-3 rounded-xl bg-slate-800/50 border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer" onClick={() => { setUrl(scan.url); setResult(scan); setError(null); }}>
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs text-slate-400 block truncate max-w-[120px]" title={scan.url}>
                      {scan.url.substring(0, 30)}...
                    </span>
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${scan.score > 0.8 ? 'bg-red-500/20 text-red-400' : scan.score < 0.3 ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                      {(scan.score * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500">{formatDate(scan.timestamp)}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </aside>

      {/* Main Canvas */}
      <main className="flex-1 ml-64 p-8 relative flex flex-col items-center">
        
        {/* Top Scanner Bar area */}
        <div className="w-full max-w-4xl mt-12 mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-light mb-3 text-white">Global IP Protection Scanner</h2>
            <p className="text-slate-400">Detect unauthorized use of digital sports media across the web.</p>
          </div>
          
          <form onSubmit={handleScan} className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <LinkIcon className="w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
            </div>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter image URL to scan across global platforms..."
              required
              className="w-full bg-slate-900 border border-slate-700 rounded-2xl py-4 pl-12 pr-44 text-lg shadow-xl focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-600"
            />
            <button
              type="submit"
              disabled={isLoading || !url.trim()}
              className="absolute right-2 top-2 bottom-2 bg-blue-600 hover:bg-blue-500 text-white font-medium px-6 rounded-xl flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.4)] disabled:shadow-none"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Scanning
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Analyze Media
                </>
              )}
            </button>
            
            {/* Animated Loading Bar */}
            {isLoading && (
              <div className="absolute -bottom-2 left-4 right-4 h-0.5 bg-slate-800 overflow-hidden rounded-full">
                <div className="h-full bg-blue-500 w-1/3 animate-[scanning_1.5s_ease-in-out_infinite]" />
              </div>
            )}
          </form>

          {/* Error Toast */}
          {error && (
            <div className="mt-6 flex items-center gap-3 p-4 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 animate-in fade-in slide-in-from-top-4">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p>{error}</p>
            </div>
          )}
        </div>

        {/* Intelligence Report Results Card */}
        {result && !isLoading && (
          <div className="w-full max-w-4xl bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300 mt-4 mb-16">
            {/* Card Header */}
            <div className="flex flex-col md:flex-row p-6 md:p-8 border-b border-slate-800 gap-8 items-center md:items-start relative overflow-hidden">
              {/* Subtle background glow based on threat level */}
              <div className={`absolute -top-32 -right-32 w-64 h-64 rounded-full blur-[100px] opacity-20 pointer-events-none ${result.score > 0.8 ? 'bg-red-500' : result.score < 0.3 ? 'bg-green-500' : 'bg-yellow-500'}`} />

              <div className="shrink-0 w-32 h-32 rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shadow-inner flex items-center justify-center p-2 relative group">
                {/* Fallback styling for the actual image. If src fails, it will still look okay */}
                <img src={result.url} alt="Scanned target" className="max-w-full max-h-full object-contain rounded-xl z-10 block" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                <div className="absolute inset-0 flex items-center justify-center text-slate-700 text-xs text-center z-0">Preview<br/>Unavailable</div>
              </div>
              
              <div className="flex-1 flex flex-col md:flex-row justify-between w-full md:items-center gap-6">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-500 mb-2">Subject Analysis</h3>
                  <div className="text-xl text-slate-300 font-mono break-all line-clamp-2" title={result.url}>
                    {result.url}
                  </div>
                </div>

                {/* Massive Threat Badge */}
                <div className="shrink-0 flex justify-center">
                  <div className={`flex flex-col items-center justify-center w-36 h-36 rounded-full border-[6px] relative shadow-[0_0_30px_rgba(0,0,0,0.5)] ${
                    result.score > 0.8 ? 'border-red-500/30 text-red-400 bg-red-950/30' : 
                    result.score < 0.3 ? 'border-green-500/30 text-green-400 bg-green-950/30' : 
                    'border-yellow-500/30 text-yellow-400 bg-yellow-950/30'
                  }`}>
                    {/* Inner glow */}
                    <div className={`absolute inset-0 rounded-full blur-md opacity-50 pointer-events-none ${result.score > 0.8 ? 'bg-red-500/20' : result.score < 0.3 ? 'bg-green-500/20' : 'bg-yellow-500/20'}`} />
                    <span className="text-4xl font-black tracking-tighter relative z-10">
                      {(result.score * 100).toFixed(0)}<span className="text-2xl text-opacity-70">%</span>
                    </span>
                    <span className="text-xs uppercase font-bold tracking-widest mt-1 opacity-80 relative z-10">Risk Score</span>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Verdict Block */}
            <div className="px-6 md:px-8 pt-8">
              <div className="bg-slate-950/60 border border-blue-500/20 rounded-xl p-5 relative overflow-hidden group">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />
                <div className="flex gap-4 items-start relative z-10">
                  {result.score > 0.8 ? (
                    <ShieldAlert className="w-8 h-8 text-red-400 shrink-0 mt-0.5" />
                  ) : result.score < 0.3 ? (
                    <ShieldCheck className="w-8 h-8 text-green-400 shrink-0 mt-0.5" />
                  ) : (
                    <Activity className="w-8 h-8 text-yellow-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <h4 className="text-blue-400 font-semibold mb-1 uppercase text-sm tracking-wider flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                      AI Analyst Verdict
                    </h4>
                    <p className="text-slate-300 font-mono text-[15px] leading-relaxed">
                      {result.verdict}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Evidence Grid */}
            <div className="p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-white flex items-center gap-2">
                  Match Evidence 
                  <span className="bg-slate-800 text-slate-300 text-xs px-2.5 py-0.5 rounded-full border border-slate-700">
                    {result.matches?.length || 0} Found
                  </span>
                </h3>
              </div>
              
              {result.matches && result.matches.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {result.matches.map((matchUrl, idx) => (
                    <a href={matchUrl} target="_blank" rel="noopener noreferrer" key={idx} className="group relative aspect-square rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center p-2 hover:border-blue-500/50 transition-colors cursor-pointer">
                      <img src={matchUrl} alt={`Evidence ${idx+1}`} className="max-w-full max-h-full object-contain z-10 group-hover:scale-105 transition-transform block" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                      <div className="absolute inset-0 flex items-center justify-center text-slate-700 text-[10px] text-center z-0">Preview<br/>Unavailable</div>
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-20 flex flex-col justify-end p-3">
                        <span className="text-[10px] font-mono text-blue-300 truncate w-full block bg-slate-950/80 px-1 py-0.5 rounded text-center">
                          External Source
                        </span>
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center border border-dashed border-slate-800 rounded-xl bg-slate-950/30">
                  <Activity className="w-8 h-8 text-slate-700 mx-auto mb-3" />
                  <p className="text-slate-500 text-sm">No external matches were detected.</p>
                </div>
              )}
            </div>
            
          </div>
        )}
      </main>

    </div>
  );
}
