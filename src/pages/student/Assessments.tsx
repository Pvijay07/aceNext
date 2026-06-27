import { useState, useEffect } from "react";
import { ListChecks, Flame, HelpCircle, RefreshCw, Zap, Check, AlertTriangle, Sparkles } from "lucide-react";
import { QuizQuestion, UserProfile } from "../../types";
import { api } from "../../api";


interface AssessmentsProps {
  initialQuizzes: QuizQuestion[];
  profile: UserProfile;
  focusMode?: boolean;
  onTrackProgress: (quizId: string, score: number, xpGained: number) => void;
}

export default function Assessments({ initialQuizzes, profile, focusMode, onTrackProgress }: AssessmentsProps) {
  const [quizzes, setQuizzes] = useState<QuizQuestion[]>(initialQuizzes);
  const [answers, setAnswers] = useState<{ [qId: string]: number }>({});
  const [isSubmitted, setIsSubmitted] = useState<{ [qId: string]: boolean }>({});
  const [customTopic, setCustomTopic] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  useEffect(() => {
    setQuizzes(initialQuizzes);
  }, [initialQuizzes]);

  const handleSelectOption = (quizId: string, optIdx: number) => {
    if (isSubmitted[quizId]) return;
    setAnswers((prev) => ({ ...prev, [quizId]: optIdx }));
  };

  const checkAnswer = (quiz: QuizQuestion) => {
    const selected = answers[quiz.id];
    if (selected === undefined) return;
    setIsSubmitted((prev) => ({ ...prev, [quiz.id]: true }));

    const isCorrect = selected === quiz.answer;
    const scoreVal = isCorrect ? 100 : 0;
    const xpGained = isCorrect ? 60 : 15;

    onTrackProgress(quiz.id, scoreVal, xpGained);

    if (isCorrect) {
      window.dispatchEvent(
        new CustomEvent("celebrate_achievement", {
          detail: {
            title: "Syllabus Quiz Master! 🎯",
            subtitle: "You scored a perfect 100% on this assessment question and gained +60 XP!",
            type: "score",
          },
        })
      );
    }
  };

  const generateCustomQuiz = async () => {
    if (!customTopic.trim()) return;
    setIsGenerating(true);
    try {
      const data = await api.post("/quiz/generate", { topic: customTopic, size: 3 });
      if (Array.isArray(data) && data.length > 0) {
        // Appends new questions with generated IDs
        const normalized = data.map((q: any, i: number) => ({
          ...q,
          id: `custom-gen-${Date.now()}-${i}`
        }));
        setQuizzes(normalized);
        setAnswers({});
        setIsSubmitted({});
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div id="assessments-view" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* 1. Left quiz cards list */}
      <div className={`${focusMode ? "lg:col-span-12 max-w-4xl mx-auto w-full" : "lg:col-span-8"} space-y-6`}>
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-sm text-slate-800 uppercase tracking-tight flex items-center gap-1.5">
              <ListChecks className="h-4 w-4 text-blue-600" /> Syllabus Quizzes & Assessments
            </h3>
            <p className="text-xs text-slate-500 mt-1">Get +60 XP for correct answers; +15 XP for trying!</p>
          </div>
          <span className="text-xs font-bold text-slate-500 font-mono">
            {quizzes.length} Current Questions
          </span>
        </div>

        <div className="space-y-6">
          {quizzes.map((quiz, qIdx) => {
            const hasChosen = answers[quiz.id] !== undefined;
            const submitted = isSubmitted[quiz.id];
            const correctOption = quiz.answer;
            const userPick = answers[quiz.id];

            return (
              <div key={quiz.id} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm space-y-4">
                <div className="flex items-start gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-50 text-[11px] font-bold text-blue-600 shrink-0 font-mono">
                    {qIdx + 1}
                  </span>
                  <h4 className="text-xs font-bold text-slate-900 leading-relaxed font-sans">{quiz.question}</h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-9">
                  {quiz.options.map((option, optIdx) => {
                    const isSelected = userPick === optIdx;
                    let styleClass = "border-slate-100 bg-slate-50 hover:bg-slate-100/50 hover:border-slate-200 text-slate-700";

                    if (isSelected) {
                      styleClass = "border-blue-500 bg-blue-50/40 text-blue-900 ring-2 ring-blue-500/10 font-medium";
                    }

                    if (submitted) {
                      if (optIdx === correctOption) {
                        styleClass = "border-emerald-500 bg-emerald-50 text-emerald-900 font-bold";
                      } else if (isSelected) {
                        styleClass = "border-rose-300 bg-rose-50 text-rose-900 font-medium line-through";
                      } else {
                        styleClass = "border-slate-100 bg-slate-50 text-slate-400 pointer-events-none";
                      }
                    }

                    return (
                      <button
                        key={optIdx}
                        disabled={submitted}
                        onClick={() => handleSelectOption(quiz.id, optIdx)}
                        className={`text-left p-3.5 text-xs rounded-xl border transition-all ${styleClass}`}
                      >
                        <span className="font-mono text-[10px] uppercase font-bold text-slate-400 mr-2">
                          {String.fromCharCode(65 + optIdx)}.
                        </span>
                        {option}
                      </button>
                    );
                  })}
                </div>

                <div className="flex justify-end pt-2 pl-9">
                  {!submitted ? (
                    <button
                      onClick={() => checkAnswer(quiz)}
                      disabled={!hasChosen}
                      className="rounded-xl px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition disabled:opacity-40"
                    >
                      Check Answer
                    </button>
                  ) : (
                    <div className="w-full space-y-3 pb-1">
                      {userPick === correctOption ? (
                        <p className="text-[11px] text-emerald-700 font-bold flex items-center gap-1.5 bg-emerald-50/70 p-2.5 rounded-lg border border-emerald-100/50">
                          <Check className="h-4 w-4 stroke-[3]" /> Well Done! That's correct (+60 XP)
                        </p>
                      ) : (
                        <p className="text-[11px] text-rose-700 font-medium flex items-center gap-1.5 bg-rose-50 p-2.5 rounded-lg border border-rose-100">
                          <AlertTriangle className="h-4 w-4" /> Incorrect Option. Study the explanation below (+15 XP trying bonus)
                        </p>
                      )}

                      <div className="p-3.5 bg-slate-50 rounded-xl space-y-1">
                        <p className="text-[10px] font-extrabold text-slate-400 font-mono tracking-wider uppercase flex items-center gap-1">
                          <HelpCircle className="h-3.5 w-3.5 text-slate-400" /> Explanation Details
                        </p>
                        <p className="text-[10px] text-slate-600 leading-relaxed leading-normal">{quiz.explanation}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Right Quiz Generator Widget */}
      {!focusMode && (
        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-50 pb-2">
              <Sparkles className="h-5 w-5 text-indigo-500 animate-pulse" />
              <h4 className="font-bold text-xs text-slate-900 uppercase tracking-tight">AI Quiz Generator</h4>
            </div>
            <p className="text-xs text-slate-500 leading-normal">
              Need to practice a custom topic that is not in the default catalog? (e.g., "SQL subqueries", "React Context vs Jotai"). Tell Gemini to compile a direct 3-question MCQ instantly!
            </p>

            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase font-mono mb-1.5">Focus Topic</label>
                <input
                  type="text"
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  placeholder="eg. Javascript Promises, Docker images..."
                  className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <button
                onClick={generateCustomQuiz}
                disabled={isGenerating || !customTopic.trim()}
                className="w-full py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-500 transition disabled:opacity-50 shadow-md shadow-indigo-600/10 flex items-center justify-center gap-1.5"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Compiling smart MCQs...
                  </>
                ) : (
                  <>
                    <Zap className="h-3.5 w-3.5" /> Launch Live Quiz On Topic
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-tr from-blue-50 to-indigo-50 border border-blue-100 p-5 rounded-2xl space-y-3">
            <h5 className="font-bold text-xs text-blue-900">Weekly Leaderboard Status</h5>
            <div className="space-y-2 text-[11px] text-blue-950 font-medium">
              <div className="flex justify-between items-center bg-white/60 px-2.5 py-1.5 rounded-lg border border-white">
                <span>1. Rohan Mehra</span>
                <span className="font-bold">2,100 XP</span>
              </div>
              <div className="flex justify-between items-center bg-white/60 px-2.5 py-1.5 rounded-lg border border-white">
                <span>2. Vijay Kumar (You)</span>
                <span className="font-bold">{profile.xp} XP</span>
              </div>
              <div className="flex justify-between items-center bg-white/30 px-2.5 py-1.5 rounded-lg">
                <span>3. Anita Gupta</span>
                <span className="font-bold">1,250 XP</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
