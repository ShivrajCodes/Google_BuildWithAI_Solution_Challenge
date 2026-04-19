"use client";

import { useState, useEffect } from "react";
import { Search, Activity, ShieldCheck, ShieldAlert, History, Link as LinkIcon, Loader2, AlertCircle, Sun, Moon, Database, Bot, ArrowRight, Image as ImageIcon, LogIn, LogOut } from "lucide-react";
export default function Home() {
  const [session, setSession] = useState(null);
  const status = session ? "authenticated" : "unauthenticated";
  const signIn = () => setSession({ user: { name: 'Demo User', image: 'https://avatar.vercel.sh/guest' } });
  const signOut = () => setSession(null);
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [recentScans, setRecentScans] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(true);

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
      const response = await fetch("/check", {
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
    const diffMs = Date.now() - date.getTime();
    if (diffMs < 300000) return 'Just now';
    if (diffMs < 3600000) return `${Math.floor(diffMs/60000)} mins ago`;
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + date.toLocaleDateString();
  };

  const mockHistory = [
    { id: "mock1", url: "https://example.com/stolen-stream-frame.jpg", score: 0.92, timestamp: new Date(Date.now() - 120000).toISOString() },
    { id: "mock2", url: "https://example.com/verified-press-photo.png", score: 0.15, timestamp: new Date(Date.now() - 3600000).toISOString() }
  ];

  const displayScans = recentScans.length > 0 ? recentScans : mockHistory;

  return (
    <div className={`min-h-screen font-sans selection:bg-blue-500/30 flex ${isDarkMode ? "dark" : ""}`}>
      {/* Base container taking theme background */}
      <div className="flex-1 flex bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-200 transition-colors duration-300 relative w-full h-full min-h-screen">
      
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col z-50 shadow-2xl transition-colors duration-300">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/20 border border-blue-200 dark:border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.3)] dark:shadow-[0_0_15px_rgba(59,130,246,0.5)]">
              <Activity className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="font-bold text-lg tracking-tight bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-300 bg-clip-text text-transparent">
              MediaGuard
            </h1>
          </div>
          
          <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
        
        <div className="p-4 flex-1 overflow-y-auto">
          <div className="flex items-center gap-2 mb-4 text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wider px-2">
            <History className="w-4 h-4" />
            <h2>Recent Scans</h2>
          </div>
          
          <div className="space-y-2">
            {displayScans.map((scan) => (
              <div key={scan.id} className="group p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-slate-700 transition-colors cursor-pointer flex gap-3 shadow-sm dark:shadow-none" onClick={() => { setUrl(scan.url); setResult(scan); setError(null); }}>
                <div className="shrink-0 w-8 h-8 rounded bg-slate-200 dark:bg-slate-700/50 flex items-center justify-center border border-slate-300 dark:border-slate-600 overflow-hidden">
                  <ImageIcon className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1 gap-1">
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300 block truncate" title={scan.url}>
                      {scan.url.substring(0, 30)}...
                    </span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${scan.score > 0.8 ? 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400' : scan.score < 0.3 ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400'}`}>
                      {(scan.score * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 tracking-wide">{formatDate(scan.timestamp)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          {status === "loading" ? (
            <div className="flex items-center justify-center p-3 animate-pulse">
              <div className="w-5 h-5 border-2 border-slate-300 dark:border-slate-600 border-t-blue-500 rounded-full animate-spin" />
            </div>
          ) : session ? (
            <div className="flex items-center justify-between gap-3 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3 min-w-0">
                <img src={session.user?.image || "https://avatar.vercel.sh/guest"} alt="Avatar" className="w-8 h-8 rounded-full border border-slate-300 dark:border-slate-600" />
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{session.user?.name || "User"}</span>
                </div>
              </div>
              <button onClick={() => signOut()} className="p-2 mr-1 text-slate-500 hover:text-red-600 dark:hover:text-red-400 transition-colors tooltip relative group" aria-label="Sign Out">
                <LogOut className="w-4 h-4" />
                <span className="absolute -top-8 -translate-x-1/2 left-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">Sign Out</span>
              </button>
            </div>
          ) : (
            <button onClick={() => signIn("google")} className="w-full py-3 px-4 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white text-sm font-semibold rounded-xl shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5">
              <LogIn className="w-4 h-4" />
              Sign in with Google
            </button>
          )}
        </div>
      </aside>

      {/* Main Canvas */}
      <main className="flex-1 ml-64 p-8 relative flex flex-col items-center">
        
        {/* Ambient Backgrounds */}
        {!result && (
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            {/* Radial gradient */ }
            <div className="absolute top-[-20%] left-[20%] w-[60%] h-[60%] bg-blue-500/10 dark:bg-blue-500/10 blur-[120px] rounded-full mix-blend-normal" />
            {/* Dot grid */}
            <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-60 dark:opacity-40" />
            
            {/* Bottom Glow */}
            <div className="absolute bottom-[-10%] left-[10%] w-[80%] h-[30%] bg-cyan-500/5 dark:bg-cyan-500/5 blur-[100px] rounded-full mix-blend-normal z-0" />
          </div>
        )}

        {/* Top Scanner Bar area */}
        <div className="w-full max-w-4xl mt-12 mb-12 relative z-10">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-light mb-3 text-slate-800 dark:text-white">Global IP Protection Scanner</h2>
            <p className="text-slate-500 dark:text-slate-400">Detect unauthorized use of digital sports media across the web.</p>
          </div>
          
          {status === "loading" ? (
             <div className="w-full flex justify-center py-12">
               <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
             </div>
          ) : session ? (
            <form onSubmit={handleScan} className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <LinkIcon className="w-5 h-5 text-slate-400 dark:text-slate-500 group-focus-within:text-blue-500 dark:group-focus-within:text-blue-400 transition-colors" />
              </div>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Enter image URL to scan across global platforms..."
                required
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl py-4 pl-12 pr-44 text-lg shadow-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 dark:focus:border-blue-500/50 dark:focus:ring-blue-500/10 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 text-slate-800 dark:text-slate-200"
              />
              <button
                type="submit"
                disabled={isLoading || !url.trim()}
                className="absolute right-2 top-2 bottom-2 bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-500 text-white font-medium px-6 rounded-xl flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.3)] dark:shadow-[0_0_15px_rgba(37,99,235,0.4)] disabled:shadow-none"
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
                <div className="absolute -bottom-2 left-4 right-4 h-0.5 bg-slate-200 dark:bg-slate-800 overflow-hidden rounded-full">
                  <div className="h-full bg-blue-500 w-1/3 animate-[scanning_1.5s_ease-in-out_infinite]" />
                </div>
              )}
            </form>
          ) : (
            <div className="w-full bg-slate-100/50 dark:bg-slate-800/20 border border-slate-200 dark:border-slate-800/50 p-8 rounded-3xl backdrop-blur-sm text-center flex flex-col items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-4 relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12 scale-150 transition-transform group-hover:scale-[1.7]">
                 <ShieldAlert className="w-32 h-32 text-slate-500" />
               </div>
               <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-lg relative z-10">
                 <ShieldCheck className="w-8 h-8 text-blue-500 dark:text-blue-400" />
               </div>
               <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 relative z-10">Access Restricted</h3>
               <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-2 relative z-10">Please authenticate to access the Global IP Protection Scanner and execute AI-powered media forensics.</p>
               <button onClick={() => signIn("google")} className="px-6 py-2.5 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 font-medium rounded-xl border border-slate-300 dark:border-slate-700 shadow-sm hover:border-blue-400 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-2 relative z-10">
                 <LogIn className="w-4 h-4" />
                 Sign in
               </button>
            </div>
          )}

          {/* Quick-Test Chips */}
          {!result && !isLoading && session && (
            <div className="flex flex-wrap justify-center gap-3 mt-6">
              {["Premier League IP", "F1 Broadcast", "Stolen NBA Clip"].map((chip) => (
                <button 
                  key={chip} 
                  type="button" 
                  onClick={() => setUrl(`https://storage.example.com/check/${chip.toLowerCase().replace(/ /g, '-')}.jpg`)} 
                  className="text-xs px-4 py-2 rounded-full border border-slate-300 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/40 backdrop-blur text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 hover:border-slate-400 dark:hover:border-slate-700 hover:text-blue-600 dark:hover:text-blue-400 transition-all font-medium flex items-center gap-1.5 shadow-sm"
                >
                  <Search className="w-3 h-3 opacity-50" />
                  Try: {chip}
                </button>
              ))}
            </div>
          )}

          {/* Error Toast */}
          {error && (
            <div className="mt-6 flex items-center gap-3 p-4 rounded-xl bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400 border border-red-200 dark:border-red-900/50 animate-in fade-in slide-in-from-top-4">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p>{error}</p>
            </div>
          )}
        </div>

        {/* Live System Telemetry (Middle Canvas) */}
        {!result && !isLoading && (
          <div className="w-full max-w-4xl mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700 relative z-10">
            <div className="bg-white/70 dark:bg-slate-900/50 backdrop-blur-md border border-slate-200/80 dark:border-blue-500/20 rounded-2xl p-6 shadow-xl shadow-slate-200/50 dark:shadow-[0_0_20px_rgba(59,130,246,0.07)] flex items-center gap-4 group hover:border-blue-400/50 dark:hover:border-blue-500/50 transition-all hover:-translate-y-1">
              <div className="p-3.5 bg-blue-100 dark:bg-blue-500/20 rounded-xl group-hover:scale-110 transition-transform shadow-inner border border-blue-200 dark:border-blue-500/30">
                <Bot className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h4 className="text-[13px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400/80 mb-0.5">Active CrewAI Agents</h4>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse" />
                  <p className="text-2xl font-bold text-slate-800 dark:text-slate-200">3 Online</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/70 dark:bg-slate-900/50 backdrop-blur-md border border-slate-200/80 dark:border-blue-500/20 rounded-2xl p-6 shadow-xl shadow-slate-200/50 dark:shadow-[0_0_20px_rgba(59,130,246,0.07)] flex items-center gap-4 group hover:border-blue-400/50 dark:hover:border-blue-500/50 transition-all hover:-translate-y-1">
              <div className="p-3.5 bg-cyan-100 dark:bg-cyan-500/20 rounded-xl group-hover:scale-110 transition-transform shadow-inner border border-cyan-200 dark:border-cyan-500/30">
                <Database className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
              </div>
              <div>
                <h4 className="text-[13px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400/80 mb-0.5">Global Vectors</h4>
                <p className="text-2xl font-bold text-slate-800 dark:text-slate-200">2.4M</p>
              </div>
            </div>

            <div className="bg-white/70 dark:bg-slate-900/50 backdrop-blur-md border border-slate-200/80 dark:border-blue-500/20 rounded-2xl p-6 shadow-xl shadow-slate-200/50 dark:shadow-[0_0_20px_rgba(59,130,246,0.07)] flex items-center gap-4 group hover:border-blue-400/50 dark:hover:border-blue-500/50 transition-all hover:-translate-y-1">
              <div className="p-3.5 bg-red-100 dark:bg-red-500/20 rounded-xl group-hover:scale-110 transition-transform shadow-inner border border-red-200 dark:border-red-500/30">
                <ShieldAlert className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h4 className="text-[13px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400/80 mb-0.5">Threats Blocked (24h)</h4>
                <p className="text-2xl font-bold text-slate-800 dark:text-slate-200">142</p>
              </div>
            </div>
          </div>
        )}

        {/* System Architecture Visualizer (Bottom Canvas) */}
        {!result && !isLoading && (
          <div className="w-full max-w-3xl mt-auto pt-16 flex items-center justify-between text-slate-500 dark:text-slate-400 text-[11px] font-mono uppercase tracking-widest px-4 animate-in fade-in duration-1000 relative z-10">
            <div className="flex flex-col items-center gap-3">
              <div className="p-2 border border-slate-200 dark:border-slate-800 rounded bg-white/80 dark:bg-slate-900/50 backdrop-blur shadow-sm">
                <ImageIcon className="w-4 h-4 opacity-70" />
              </div>
              <span>1. Perceptual Fingerprinting</span>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-700 to-transparent mx-4 relative">
              <ArrowRight className="w-3 h-3 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-600 bg-slate-50 dark:bg-slate-950 px-1 box-content" />
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="p-2 border border-slate-200 dark:border-slate-800 rounded bg-white/80 dark:bg-slate-900/50 backdrop-blur shadow-sm">
                <Database className="w-4 h-4 opacity-70" />
              </div>
              <span>2. ChromaDB Search</span>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-700 to-transparent mx-4 relative">
              <ArrowRight className="w-3 h-3 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-600 bg-slate-50 dark:bg-slate-950 px-1 box-content" />
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="p-2 border border-blue-200 dark:border-blue-900/50 rounded bg-blue-50/80 dark:bg-blue-900/20 backdrop-blur text-blue-600 dark:text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.1)] dark:shadow-[0_0_10px_rgba(59,130,246,0.2)]">
                <Bot className="w-4 h-4" />
              </div>
              <span className="text-blue-600 dark:text-blue-400 font-semibold">3. Llama 3.3 Verdict</span>
            </div>
          </div>
        )}

        {/* Intelligence Report Results Card */}
        {result && !isLoading && (
          <div className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl dark:shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300 mt-4 mb-16 relative z-10">
            {/* Card Header */}
            <div className="flex flex-col md:flex-row p-6 md:p-8 border-b border-slate-100 dark:border-slate-800 gap-8 items-center md:items-start relative overflow-hidden">
              {/* Subtle background glow based on threat level */}
              <div className={`absolute -top-32 -right-32 w-64 h-64 rounded-full blur-[100px] opacity-20 pointer-events-none ${result.score > 0.8 ? 'bg-red-500' : result.score < 0.3 ? 'bg-green-500' : 'bg-yellow-500'}`} />

              <div className="shrink-0 w-32 h-32 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-inner flex items-center justify-center p-2 relative group">
                {/* Fallback styling for the actual image. If src fails, it will still look okay */}
                <img src={result.url} alt="Scanned target" className="max-w-full max-h-full object-contain rounded-xl z-10 block" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                <div className="absolute inset-0 flex items-center justify-center text-slate-400 dark:text-slate-700 text-xs text-center z-0">Preview<br/>Unavailable</div>
              </div>
              
              <div className="flex-1 flex flex-col md:flex-row justify-between w-full md:items-center gap-6">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-500 mb-2">Subject Analysis</h3>
                  <div className="text-xl text-slate-700 dark:text-slate-300 font-mono break-all line-clamp-2" title={result.url}>
                    {result.url}
                  </div>
                </div>

                {/* Massive Threat Badge */}
                <div className="shrink-0 flex justify-center">
                  <div className={`flex flex-col items-center justify-center w-36 h-36 rounded-full border-[6px] relative dark:shadow-[0_0_30px_rgba(0,0,0,0.5)] bg-white ${
                    result.score > 0.8 ? 'border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 dark:bg-red-950/30' : 
                    result.score < 0.3 ? 'border-green-200 dark:border-green-500/30 text-green-600 dark:text-green-400 dark:bg-green-950/30' : 
                    'border-yellow-200 dark:border-yellow-500/30 text-yellow-600 dark:text-yellow-400 dark:bg-yellow-950/30'
                  }`}>
                    {/* Inner glow */}
                    <div className={`absolute inset-0 rounded-full blur-md opacity-30 dark:opacity-50 pointer-events-none ${result.score > 0.8 ? 'bg-red-200 dark:bg-red-500/20' : result.score < 0.3 ? 'bg-green-200 dark:bg-green-500/20' : 'bg-yellow-200 dark:bg-yellow-500/20'}`} />
                    <span className="text-4xl font-black tracking-tighter relative z-10">
                      {(result.score * 100).toFixed(0)}<span className="text-2xl opacity-70">%</span>
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-widest mt-1 opacity-80 relative z-10">Risk Score</span>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Verdict Block */}
            <div className="px-6 md:px-8 pt-8 pb-4">
              <div className="bg-slate-50 dark:bg-slate-950/60 border border-blue-200 dark:border-blue-500/20 rounded-xl p-5 relative overflow-hidden group">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />
                <div className="flex gap-4 items-start relative z-10">
                  {result.score > 0.8 ? (
                    <ShieldAlert className="w-8 h-8 text-red-500 dark:text-red-400 shrink-0 mt-0.5" />
                  ) : result.score < 0.3 ? (
                    <ShieldCheck className="w-8 h-8 text-green-500 dark:text-green-400 shrink-0 mt-0.5" />
                  ) : (
                    <Activity className="w-8 h-8 text-yellow-500 dark:text-yellow-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <h4 className="text-blue-600 dark:text-blue-400 font-semibold mb-1 uppercase text-sm tracking-wider flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 dark:bg-blue-400 animate-pulse" />
                      AI Analyst Verdict
                    </h4>
                    <p className="text-slate-700 dark:text-slate-300 font-mono text-[14px] leading-relaxed">
                      {result.verdict}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Evidence Grid */}
            <div className="p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-slate-800 dark:text-white flex items-center gap-2">
                  Match Evidence 
                  <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                    {result.matches?.length || 0} Found
                  </span>
                </h3>
              </div>
              
              {result.matches && result.matches.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {result.matches.map((matchUrl, idx) => (
                    <a href={matchUrl} target="_blank" rel="noopener noreferrer" key={idx} className="group relative aspect-square rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-center p-2 hover:border-blue-400 dark:hover:border-blue-500/50 transition-colors cursor-pointer shadow-sm">
                      <img src={matchUrl} alt={`Evidence ${idx+1}`} className="max-w-full max-h-full object-contain z-10 group-hover:scale-105 transition-transform block" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                      <div className="absolute inset-0 flex items-center justify-center text-slate-400 dark:text-slate-700 text-[10px] text-center z-0">Preview<br/>Unavailable</div>
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-20 flex flex-col justify-end p-3">
                        <span className="text-[10px] font-mono text-blue-200 truncate w-full block bg-slate-900/80 px-1 py-0.5 rounded text-center">
                          External Source
                        </span>
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950/30">
                  <Activity className="w-8 h-8 text-slate-400 dark:text-slate-700 mx-auto mb-3" />
                  <p className="text-slate-500 text-sm">No external matches were detected.</p>
                </div>
              )}
            </div>
            
          </div>
        )}
      </main>

      </div>
    </div>
  );
}
