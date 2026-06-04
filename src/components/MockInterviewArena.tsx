import { useState } from "react";
import { Sparkles, MessageSquare, Mic, MicOff, RefreshCw, Star, CheckCircle, ShieldAlert, Award } from "lucide-react";
import { UserProfile } from "../types";
import TechFlashcards from "./TechFlashcards";

interface ChatTurn {
  role: "user" | "model";
  content: string;
}

interface MockInterviewArenaProps {
  profile: UserProfile;
  focusMode?: boolean;
  onTrackXp: (xp: number) => void;
}

export default function MockInterviewArena({ profile, focusMode, onTrackXp }: MockInterviewArenaProps) {
  const [activeTab, setActiveTab] = useState<"roleplay" | "flashcards">("roleplay");
  const [role, setRole] = useState<string>("frontend");
  const [level, setLevel] = useState<string>("junior");
  const [mode, setMode] = useState<string>("technical");
  const [isStarted, setIsStarted] = useState<boolean>(false);

  const [history, setHistory] = useState<ChatTurn[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<string>("Welcome candidate! When you are ready, describe how you manage heavy state changes inside high-traffic React portals.");
  const [userAnswer, setUserAnswer] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isMicOn, setIsMicOn] = useState<boolean>(false);

  const [score, setScore] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string>("");
  const [strengths, setStrengths] = useState<string[]>([]);
  const [improvements, setImprovements] = useState<string[]>([]);

  const toggleMic = () => {
    // Simulated Voice STT
    if (!isMicOn) {
      setIsMicOn(true);
      setUserAnswer("In my recent projects, I optimize state updates using useMemo hooks and prevent excessive child re-renders by isolating local states...");
    } else {
      setIsMicOn(false);
    }
  };

  const handleStart = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/interview/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role,
          level,
          mode,
          history: [],
          currentAnswer: "Hi, I am ready to start my interview."
        })
      });
      const data = await response.json();
      setCurrentQuestion(data.nextQuestion);
      setHistory([{ role: "model", content: data.nextQuestion }]);
      setIsStarted(true);

      setScore(null);
      setFeedback("");
      setStrengths([]);
      setImprovements([]);
    } catch (e) {
      console.error(e);
      setIsStarted(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSubmit = async () => {
    if (!userAnswer.trim()) return;
    setIsLoading(true);

    const updatedHistory: ChatTurn[] = [
      ...history,
      { role: "user", content: userAnswer }
    ];
    setHistory(updatedHistory);
    const textSaved = userAnswer;
    setUserAnswer("");

    try {
      const response = await fetch("/api/interview/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role,
          level,
          mode,
          history: updatedHistory,
          currentAnswer: textSaved
        })
      });
      const data = await response.json();
      setCurrentQuestion(data.nextQuestion);
      setHistory((prev) => [...prev, { role: "model", content: data.nextQuestion }]);

      if (data.evaluation) {
        setScore(data.evaluation.score);
        setFeedback(data.evaluation.feedback);
        setStrengths(data.evaluation.strengths || []);
        setImprovements(data.evaluation.improvements || []);
      }

      onTrackXp(50); // Get +50 XP per interview logic pass
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Tab Swapping Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-3">
        <div className="space-y-0.5">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider font-mono">Mock Interview & Term Practice</h3>
          <p className="text-xs text-slate-500">Run voice-to-text AI model interviews, or build technical retention through interactive flashcards.</p>
        </div>

        <div className="flex bg-slate-100/80 p-1 rounded-xl border border-slate-200/40 select-none shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("roleplay")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === "roleplay"
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-800"
            }`}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            AI Mock Interview
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("flashcards")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === "flashcards"
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-800"
            }`}
          >
            <Award className="h-3.5 w-3.5 text-amber-500 hover:scale-105 transition" />
            Tech Flashcards
          </button>
        </div>
      </div>

      {activeTab === "roleplay" ? (
        <div id="mock-interview-view" className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-14rem)] max-h-[750px]">
      {/* 1. Sidebar configuration panel or evaluation overview */}
      <div className="lg:col-span-3 space-y-4 overflow-y-auto">
        {!isStarted ? (
          <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm space-y-4">
            <h4 className="font-bold text-xs text-slate-900 uppercase">Interview Parameters</h4>
            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 font-mono mb-1.5">Target Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                >
                  <option value="frontend">Frontend Developer</option>
                  <option value="backend">Backend Developer</option>
                  <option value="pm">Product Manager (PM)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 font-mono mb-1.5">Seniority Level</label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                >
                  <option value="junior">Entry or Junior (0-2 YOE)</option>
                  <option value="mid">Mid / Professional (2-5 YOE)</option>
                  <option value="senior">Staff & Lead (5+ YOE)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 font-mono mb-1.5">Focus Mode</label>
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                >
                  <option value="technical">Technical Coding & Coding logic</option>
                  <option value="hr">Behavioral & HR scenarios</option>
                </select>
              </div>

              <button
                onClick={handleStart}
                disabled={isLoading}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold transition flex items-center justify-center gap-1 shadow-md shadow-indigo-600/15"
              >
                {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Initiate Live AI Board"}
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-50 pb-2">
              <h4 className="font-bold text-xs text-slate-900 uppercase">Board Metrics</h4>
              <button
                onClick={() => setIsStarted(false)}
                className="text-[10px] font-bold text-blue-600 uppercase hover:underline"
              >
                Reset Role
              </button>
            </div>

            <div className="space-y-3.5">
              <div className="p-3.5 bg-slate-50 rounded-xl space-y-1">
                <p className="text-[10px] text-slate-400 font-bold uppercase font-mono">Current Candidate Target</p>
                <p className="text-xs font-semibold capitalize text-slate-900">{level} {role} ({mode})</p>
              </div>

              {score !== null && (
                <div className="p-3.5 bg-indigo-50/70 border border-indigo-100/50 rounded-xl text-center space-y-1">
                  <p className="text-[10px] text-indigo-400 font-bold uppercase font-mono">Simulated Answer Score</p>
                  <p className="text-xl font-black text-indigo-950 flex items-center justify-center gap-1.5">
                    <Award className="h-5 w-5 text-indigo-600" /> {score}% Grade
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 2. Middle Discussion Frame */}
      <div className={`${focusMode ? "lg:col-span-9" : "lg:col-span-6"} flex flex-col border border-slate-100 bg-white rounded-2xl shadow-sm overflow-hidden h-full`}>
        {/* Info header */}
        <div className="bg-slate-900 px-4 py-3 flex items-center justify-between text-white border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <MessageSquare className="h-4 w-4 text-emerald-400" />
            <span className="text-xs font-bold leading-none select-none uppercase">Interactive Interview Dialogue</span>
          </div>
          <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
            Active Mode
          </span>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
          {!isStarted ? (
            <div className="flex flex-col items-center justify-center p-6 text-center space-y-3 h-full">
              <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-sm">
                <Mic className="h-6 w-6" />
              </div>
              <h5 className="font-bold text-slate-800 text-xs text-center">Interactive STT Simulation Ready</h5>
              <p className="text-[11px] text-slate-500 max-w-sm leading-relaxed leading-normal">
                Choose your target industry title, click "Initiate Live AI Board" to trigger detailed technical queries from recruitment engines.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((turn, idx) => {
                const isModel = turn.role === "model";
                return (
                  <div key={idx} className={`flex items-start gap-2.5 ${isModel ? "" : "flex-row-reverse"}`}>
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs shrink-0 ${
                      isModel ? "bg-indigo-100 text-indigo-700 font-bold" : "bg-slate-900 text-white"
                    }`}>
                      {isModel ? "AI" : "You"}
                    </div>
                    <div className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed shadow-sm ${
                      isModel
                        ? "bg-white text-slate-800 rounded-tl-none border border-slate-100"
                        : "bg-slate-900 text-white rounded-tr-none"
                    }`}>
                      <p className="whitespace-pre-line font-sans font-medium">{turn.content}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {isLoading && (
            <div className="flex items-start gap-2.5">
              <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs shrink-0 animate-pulse">
                AI
              </div>
              <div className="max-w-[80%] rounded-2xl p-4 bg-white border border-slate-100 text-xs text-slate-500 flex items-center gap-2">
                <RefreshCw className="h-3.5 w-3.5 animate-spin text-indigo-600" />
                Reviewing answers...
              </div>
            </div>
          )}
        </div>

        {/* Input answers container */}
        {isStarted && (
          <div className="border-t border-slate-100 p-3 bg-white flex gap-2">
            <button
              onClick={toggleMic}
              type="button"
              className={`p-3 rounded-xl border flex items-center justify-center transition shadow-sm shrink-0 ${
                isMicOn
                  ? "bg-rose-50 border-rose-200 text-rose-600 animate-pulse"
                  : "bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900"
              }`}
            >
              {isMicOn ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </button>
            <input
              type="text"
              value={userAnswer}
              onChange={(e) => {
                setUserAnswer(e.target.value);
                if (isMicOn) setIsMicOn(false);
              }}
              placeholder={isMicOn ? "Compiling simulated transcript speech..." : "Your professional explanation answers..."}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 text-xs py-3 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAnswerSubmit();
              }}
            />
            <button
              onClick={handleAnswerSubmit}
              className="bg-slate-900 text-white hover:bg-slate-800 rounded-xl px-4 text-xs font-semibold select-none flex items-center justify-center gap-1 transition"
            >
              Analyze
            </button>
          </div>
        )}
      </div>

      {/* 3. Right Evaluation breakdown column */}
      {!focusMode && (
        <div className="lg:col-span-3 space-y-4 overflow-y-auto">
          {feedback && (
            <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm space-y-4">
              <h4 className="font-bold text-xs text-slate-900 uppercase">Performance Critique</h4>
              <div className="text-[11px] text-slate-600 prose whitespace-pre-wrap leading-relaxed font-sans">
                {feedback}
              </div>

              {strengths.length > 0 && (
                <div className="space-y-1.5 border-t border-slate-50 pt-3">
                  <p className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-widest font-mono flex items-center gap-1">
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-500" /> Strengths Detected
                  </p>
                  <ul className="space-y-1">
                    {strengths.map((str, idx) => (
                      <li key={idx} className="text-[10px] text-slate-600 font-semibold">{str}</li>
                    ))}
                  </ul>
                </div>
              )}

              {improvements.length > 0 && (
                <div className="space-y-1.5 border-t border-slate-50 pt-3">
                  <p className="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest font-mono flex items-center gap-1">
                    <ShieldAlert className="h-3.5 w-3.5 text-blue-500" /> Areas of Refinement
                  </p>
                  <ul className="space-y-1">
                    {improvements.map((imp, idx) => (
                      <li key={idx} className="text-[10px] text-slate-600 font-semibold">{imp}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
      ) : (
        <TechFlashcards onTrackXp={onTrackXp} />
      )}
    </div>
  );
}
