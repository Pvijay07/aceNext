import { useState } from "react";
import { Terminal, RefreshCw, Send, Play, Sparkles, HelpCircle, Code, ShieldCheck } from "lucide-react";
import { CodeChallenge, UserProfile } from "../../types";
import { api } from "../../api";

interface CodingArenaProps {
  challenges: CodeChallenge[];
  profile: UserProfile;
  focusMode?: boolean;
  onTrackProgress: (labId: string, xpGained: number) => void;
}

export default function CodingArena({ challenges, profile, focusMode, onTrackProgress }: CodingArenaProps) {
  const [activeChallenge, setActiveChallenge] = useState<CodeChallenge>(challenges[0]);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("javascript");
  const [sourceCode, setSourceCode] = useState<string>(challenges[0].initialCode.javascript);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [consoleOutput, setConsoleOutput] = useState<string>("// Console ready. Hit 'Run Code' to execute tests.");
  const [reviewResult, setReviewResult] = useState<string>("");
  const [aiScore, setAiScore] = useState<number | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isReviewing, setIsReviewing] = useState<boolean>(false);

  // Synchronize initial code when challenge or language switches
  const handleChallengeChange = (challenge: CodeChallenge) => {
    setActiveChallenge(challenge);
    const code = challenge.initialCode[selectedLanguage] || challenge.initialCode.javascript;
    setSourceCode(code);
    setConsoleOutput("// Console ready. Hit 'Run Code' to execute tests.");
    setReviewResult("");
    setAiScore(null);
    setSuggestions([]);
  };

  const handleLanguageChange = (lang: string) => {
    setSelectedLanguage(lang);
    const code = activeChallenge.initialCode[lang] || activeChallenge.initialCode.javascript;
    setSourceCode(code);
    setConsoleOutput("// Console ready. Hit 'Run Code' to execute.");
  };

  const runCompiler = async () => {
    setIsRunning(true);
    setConsoleOutput(`[AceNext Compiler: Initializing ${selectedLanguage} workspace...]`);
    try {
      const data = await api.post("/coding/submit", {
          challenge_id: activeChallenge.id,
          code: sourceCode,
          language: selectedLanguage
      });
      setConsoleOutput(data.submission.error_log || "Compilation successful. All tests passed.");

      if (data.submission.status === 'passed') {
        setAiScore(100);
      }
    } catch (e) {
      console.error(e);
      setConsoleOutput("[Fatal Compiler Error] Buffer timeout. Try submitting again.");
    } finally {
      setIsRunning(false);
    }
  };

  const getAiReview = async () => {
    setIsReviewing(true);
    try {
      const data = await api.post("/grader/code", {
        code: sourceCode,
        language: selectedLanguage,
        context: {
          id: activeChallenge.id,
          title: activeChallenge.title,
          description: activeChallenge.problem
        }
      });
      setReviewResult(data.review);
      if (data.score) setAiScore(data.score);
      if (data.suggestions) setSuggestions(data.suggestions);

      // Reward XP for solving problem and requesting review
      if (data.score >= 70) {
        onTrackProgress(activeChallenge.id, 100);
        window.dispatchEvent(
          new CustomEvent("celebrate_achievement", {
            detail: {
              title: "Coding Challenge Solved! 💻",
              subtitle: `Excellent job! Your code scored ${data.score}/100 in the arena and yielded XP boost!`,
              type: "score",
            },
          })
        );
      }
    } catch (e) {
      console.error(e);
      setReviewResult("AI review currently buffer compiling. Verify your environment keys.");
    } finally {
      setIsReviewing(false);
    }
  };

  return (
    <div id="coding-arena-view" className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-14rem)] max-h-[750px]">
      {/* 1. Sidebar list of challenges */}
      {!focusMode && (
        <div className="lg:col-span-3 space-y-4 overflow-y-auto">
          <h3 className="font-bold text-sm text-slate-500 uppercase tracking-wider px-1">Challenge List</h3>
          <div className="space-y-2.5">
            {challenges.map((challenge) => {
              const isSelected = activeChallenge.id === challenge.id;
              const diffColor =
                challenge.difficulty === "Easy"
                  ? "bg-emerald-50 text-emerald-700"
                  : challenge.difficulty === "Medium"
                  ? "bg-amber-50 text-amber-700"
                  : "bg-rose-50 text-rose-700";

              const hasSolved = profile.completedLabs.includes(challenge.id);

              return (
                <button
                  key={challenge.id}
                  onClick={() => handleChallengeChange(challenge)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                    isSelected
                      ? "border-blue-200 bg-blue-50/40 ring-2 ring-blue-500/10 font-medium"
                      : "border-slate-100 bg-white hover:border-slate-200"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md ${diffColor}`}>
                        {challenge.difficulty}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">{challenge.category}</span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{challenge.title}</h4>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
                      <span>{challenge.testCases.length} Test cases</span>
                      {hasSolved && <span className="text-emerald-600 font-bold flex items-center">✓ Solved</span>}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. Middle Editor Area */}
      <div className={`${focusMode ? "lg:col-span-8" : "lg:col-span-6"} flex flex-col border border-slate-100 bg-white rounded-2xl shadow-sm overflow-hidden h-full`}>
        {/* Editor controls */}
        <div className="bg-slate-900 px-4 py-2.5 flex items-center justify-between text-white border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Code className="h-4 w-4 text-blue-400" />
            <span className="text-xs font-bold font-mono">WORKSPACE: {activeChallenge.category}</span>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={selectedLanguage}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-slate-200 text-[11px] rounded-lg px-2 py-1 focus:outline-none focus:border-blue-500 font-semibold"
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python 3</option>
            </select>
          </div>
        </div>

        {/* Textarea Editor */}
        <div className="flex-1 relative font-mono">
          <textarea
            value={sourceCode}
            onChange={(e) => setSourceCode(e.target.value)}
            className="w-full h-full p-4 text-[11px] text-slate-200 bg-slate-950 font-mono resize-none focus:outline-none focus:ring-0 leading-relaxed"
            spellCheck={false}
          />
        </div>

        {/* Console Workspace Output */}
        <div className="h-40 border-t border-slate-800 bg-slate-900 p-3 flex flex-col justify-between font-mono">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-800 text-slate-400 text-[10px] font-bold">
            <span className="flex items-center gap-1">
              <Terminal className="h-3 w-3" /> CONSOLE OUTPUT
            </span>
            <span className="text-slate-500">Read-only sandbox</span>
          </div>
          <pre className="flex-1 overflow-y-auto text-[10px] font-mono text-emerald-400 pt-1.5 leading-relaxed whitespace-pre-wrap select-text">
            {consoleOutput}
          </pre>
          <div className="flex justify-end gap-2 pt-1">
            <button
              onClick={runCompiler}
              disabled={isRunning || isReviewing}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold px-3 py-1.5 rounded-lg border border-slate-700 transition flex items-center gap-1"
            >
              {isRunning ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3" />}
              Run Code
            </button>
            <button
              onClick={getAiReview}
              disabled={isRunning || isReviewing}
              className="bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold px-4 py-1.5 rounded-lg transition flex items-center gap-1.5 shadow-md shadow-blue-500/10"
            >
              {isReviewing ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
              Get AI Review Submit (+100 XP)
            </button>
          </div>
        </div>
      </div>

      {/* 3. Right review and problem statement column */}
      <div className={`${focusMode ? "lg:col-span-4" : "lg:col-span-3"} flex flex-col h-full overflow-y-auto space-y-4`}>
        {/* Case specs */}
        <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm space-y-3">
          <h4 className="font-bold text-[11px] text-slate-800 tracking-wide uppercase">Problem Scope</h4>
          <h3 className="text-xs font-bold text-slate-900">{activeChallenge.title}</h3>
          <p className="text-[11px] text-slate-500 leading-normal whitespace-pre-wrap font-sans">
            {activeChallenge.problem}
          </p>
          {activeChallenge.hint && (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-100/50 space-y-1">
              <p className="text-[10px] font-extrabold text-blue-800 tracking-wider flex items-center gap-1 font-mono">
                <HelpCircle className="h-3.5 w-3.5 text-blue-500" /> Tutor Hints
              </p>
              <p className="text-[10px] text-blue-950 font-medium leading-relaxed font-sans">{activeChallenge.hint}</p>
            </div>
          )}
        </div>

        {/* AI score showing and evaluation review details */}
        {aiScore !== null && (
          <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm space-y-3">
            <h4 className="font-bold text-[11px] text-slate-800 tracking-wide uppercase">AI Review Results</h4>
            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl">
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase font-mono">Sling-factor Score</p>
                <p className="text-base font-black text-slate-900">{aiScore}/100 Quality</p>
              </div>
              <div className="h-10 w-10 text-emerald-600 bg-emerald-50 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                <ShieldCheck className="h-5 w-5" />
              </div>
            </div>

            {suggestions.length > 0 && (
              <div className="space-y-1.5 pt-1.5">
                <p className="text-[10px] font-extrabold text-slate-400 font-mono tracking-wider uppercase">Optimization Targets</p>
                <ul className="space-y-1">
                  {suggestions.map((sg, idx) => (
                    <li key={idx} className="text-[10px] text-slate-600 font-medium flex items-start gap-1">
                      <span className="text-indigo-500 shrink-0 select-none">•</span>
                      <span>{sg}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {reviewResult && (
          <div className="rounded-xl border border-indigo-100/50 bg-indigo-50/70 p-4 shadow-sm">
            <h4 className="font-extrabold text-[10px] text-indigo-900 tracking-widest uppercase font-mono mb-2">Deep Code Review Analysis</h4>
            <div className="text-[10px] text-indigo-950 leading-relaxed font-sans prose whitespace-pre-wrap">
              {reviewResult}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
