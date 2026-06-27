import React, { useState, useEffect } from "react";
import {
  Calendar,
  Sparkles,
  Clock,
  Plus,
  Trash2,
  CheckCircle2,
  ListTodo,
  HelpCircle,
  Timer,
  Check,
  BookOpen,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  Lightbulb
} from "lucide-react";
import { api } from "../../api";


interface DeadlineItem {
  id: string;
  courseTitle: string;
  task: string;
  dueDate: string;
}

interface StudyDayPlan {
  day: string;
  focus: string;
  activities: string[];
  duration: string;
  tips: string;
}

interface PlannerResponse {
  schedule: StudyDayPlan[];
  recommendations: string[];
}

interface SmartPlannerProps {
  onTrackXp: (xp: number) => void;
}

const DEFAULT_DEADLINES: DeadlineItem[] = [
  {
    id: "dl-1",
    courseTitle: "Mastering React 19 & Tailwind v4",
    task: "Deploy Concurrent Rendering State Portfolios",
    dueDate: "2026-06-12"
  },
  {
    id: "dl-2",
    courseTitle: "High Performance RESTful APIs",
    task: "Optimize Redis Cache Middleware & API Throttling",
    dueDate: "2026-06-18"
  }
];

export default function SmartPlanner({ onTrackXp }: SmartPlannerProps) {
  // Personal availability state
  const [dailyHours, setDailyHours] = useState<number>(2);
  const [preferredTime, setPreferredTime] = useState<string>("evening");
  const [comments, setComments] = useState<string>("Available mostly during weekday evenings and weekends.");

  // Upcoming deadlines state
  const [deadlines, setDeadlines] = useState<DeadlineItem[]>(() => {
    const saved = localStorage.getItem("planner_deadlines_v1");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return DEFAULT_DEADLINES;
  });

  // Deadline inputs
  const [newCourseTitle, setNewCourseTitle] = useState("");
  const [newTask, setNewTask] = useState("");
  const [newDueDate, setNewDueDate] = useState("");

  // Planner result state (loaded from cache if available)
  const [plannerResult, setPlannerResult] = useState<PlannerResponse | null>(() => {
    const saved = localStorage.getItem("planner_suggested_schedule_v1");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return null;
  });

  // Track checked off schedule items for interactive completion
  const [completedItems, setCompletedItems] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem("planner_completed_items_v1");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {};
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loadingPhrase, setLoadingPhrase] = useState("Analyzing course milestones...");

  // Rotate loading phrases beautifully to entertain the user
  useEffect(() => {
    if (!isLoading) return;
    const phrases = [
      "Analyzing course milestones...",
      "Structuring high-impact study blocks...",
      "Calculating buffer zones for upcoming deadlines...",
      "Tailoring sequence topics based on available time...",
      "Optimizing rest intervals to boost daily focus recall..."
    ];
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % phrases.length;
      setLoadingPhrase(phrases[index]);
    }, 1800);
    return () => clearInterval(interval);
  }, [isLoading]);

  // Persist deadlines
  useEffect(() => {
    localStorage.setItem("planner_deadlines_v1", JSON.stringify(deadlines));
  }, [deadlines]);

  // Persist completed states
  useEffect(() => {
    localStorage.setItem("planner_completed_items_v1", JSON.stringify(completedItems));
  }, [completedItems]);

  // Add custom deadline
  const handleAddDeadline = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseTitle.trim() || !newTask.trim()) return;

    const newItem: DeadlineItem = {
      id: `dl-${Date.now()}`,
      courseTitle: newCourseTitle.trim(),
      task: newTask.trim(),
      dueDate: newDueDate || new Date(Date.now() + 72 * 3600 * 1000).toISOString().split("T")[0]
    };

    setDeadlines((prev) => [...prev, newItem]);
    setNewCourseTitle("");
    setNewTask("");
    setNewDueDate("");
  };

  // Remove deadline
  const handleRemoveDeadline = (id: string) => {
    setDeadlines((prev) => prev.filter((item) => item.id !== id));
  };

  // Call Server-Side Planner Gen
  const handleGeneratePlannerSchedule = async () => {
    setIsLoading(true);
    setErrorMsg(null);

    // Warm celebrate dispatch
    window.dispatchEvent(
      new CustomEvent("celebrate_achievement", {
        detail: {
          title: "Planning Active! ⚡",
          subtitle: "Invoking AI systems of AceNext academic advisors to optimize your study slots.",
          type: "badge"
        }
      })
    );

    try {
      const data = await api.post("/planner/generate", {
        availability: { dailyHours, preferredTime, comments },
        deadlines
      }) as PlannerResponse;

      setPlannerResult(data);
      // Reset completed checklist
      setCompletedItems({});
      localStorage.setItem("planner_suggested_schedule_v1", JSON.stringify(data));
      localStorage.setItem("planner_completed_items_v1", "{}");

      // Give XP reward for completing goals
      onTrackXp(40);

      window.dispatchEvent(
        new CustomEvent("celebrate_achievement", {
          detail: {
            title: "Study Schedule Tailored! 🎓",
            subtitle: "Study guidelines set in sequence. You earned +40 XP planner points!",
            type: "score"
          }
        })
      );
    } catch (e: any) {
      console.error(e);
      setErrorMsg("Failed to connect with AceNext smart planner gateway. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Reset/Clear suggestions
  const handleResetSchedule = () => {
    if (window.confirm("Do you want to reset your study schedule? This will clear any completed checkboxes.")) {
      setPlannerResult(null);
      setCompletedItems({});
      localStorage.removeItem("planner_suggested_schedule_v1");
      localStorage.removeItem("planner_completed_items_v1");
    }
  };

  // Handle checking off schedule items
  const toggleItemCompleted = (dayKey: string, activityIdx: number) => {
    const key = `${dayKey}_${activityIdx}`;
    const wasCompleted = !!completedItems[key];

    setCompletedItems((prev) => ({
      ...prev,
      [key]: !wasCompleted
    }));

    if (!wasCompleted) {
      // Small XP boost for checking off goals
      onTrackXp(15);
      window.dispatchEvent(
        new CustomEvent("celebrate_achievement", {
          detail: {
            title: "Study Activity Checked! ⚡",
            subtitle: "Fantastic focus! You earned +15 XP consistency credits.",
            type: "score"
          }
        })
      );
    }
  };

  // Count progress
  const totalActivitiesCount = plannerResult?.schedule.reduce((acc, day) => acc + day.activities.length, 0) || 0;
  const completedActivitiesCount = Object.keys(completedItems).filter((k) => completedItems[k]).length;
  const progressPercentage = totalActivitiesCount > 0 ? Math.round((completedActivitiesCount / totalActivitiesCount) * 100) : 0;

  return (
    <div id="smart-study-planner-card" className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden space-y-6">
      {/* Visual top banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-indigo-800 p-6 text-white space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-bold font-mono text-indigo-200 uppercase tracking-wider">
          <Sparkles className="h-4 w-4 text-emerald-300 animate-pulse" />
          <span>Cooperative Study Integration</span>
        </div>
        <h3 className="text-xl font-bold tracking-tight">AI Smart Planner</h3>
        <p className="text-xs text-indigo-100 max-w-2xl leading-relaxed">
          Struggling to manage study consistency? Give the agent your deadline constraints and availability to construct a personalized day-by-day weekly schedule.
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* Layout: Input Parameters side-by-side with Upcoming target inputs */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Availability Settings Panel (Column span: 5) */}
          <div className="lg:col-span-5 space-y-5 bg-slate-50/60 border border-slate-150 p-5 rounded-2xl">
            <h4 className="text-xs font-black uppercase text-indigo-950 font-mono tracking-wider flex items-center gap-1.5 border-b border-slate-200/50 pb-2.5">
              <Clock className="w-4 h-4 text-indigo-600" />
              Your Availability Parameters
            </h4>

            <div className="space-y-4 text-xs font-sans">
              {/* Daily hours */}
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-700">
                  Target Daily Study Budget:
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {[1, 2, 3, 4, 5].map((hr) => (
                    <button
                      key={hr}
                      type="button"
                      onClick={() => setDailyHours(hr)}
                      className={`py-2 rounded-xl border font-bold text-center transition cursor-pointer ${
                        dailyHours === hr
                          ? "bg-indigo-600 border-indigo-600 text-white shadow-sm"
                          : "bg-white hover:bg-slate-50 border-slate-200 text-slate-600"
                      }`}
                    >
                      {hr}h
                    </button>
                  ))}
                </div>
              </div>

              {/* Preferred hours slots */}
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-700">
                  Preferred Daily Focus Slot:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { val: "morning", desc: "🌅 Morning" },
                    { val: "afternoon", desc: "☀️ Afternoon" },
                    { val: "evening", desc: "🌆 Evening" },
                    { val: "night", desc: "🌙 Night" }
                  ].map((slot) => (
                    <button
                      key={slot.val}
                      type="button"
                      onClick={() => setPreferredTime(slot.val)}
                      className={`p-2.5 rounded-xl border font-semibold text-left transition cursor-pointer ${
                        preferredTime === slot.val
                          ? "bg-indigo-50 border-indigo-300 text-indigo-900 font-bold"
                          : "bg-white hover:bg-slate-50 border-slate-150 text-slate-600"
                      }`}
                    >
                      {slot.desc}
                    </button>
                  ))}
                </div>
              </div>

              {/* Freeform comments availability */}
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-700">
                  Daily Rest Constraints or Comments:
                </label>
                <textarea
                  className="w-full h-18 p-2.5 bg-white border border-slate-200 rounded-xl focus:border-indigo-400 focus:outline-none text-slate-800 leading-normal font-medium resize-none shadow-inner text-xs"
                  placeholder="e.g. Busy with job interviews on Thursdays. Weekend mornings are best..."
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Academic Deadlines Panel (Column span: 7) */}
          <div className="lg:col-span-7 space-y-5 bg-slate-50/60 border border-slate-150 p-5 rounded-2xl flex flex-col justify-between">
            <div className="space-y-4">
              <h4 className="text-xs font-black uppercase text-indigo-950 font-mono tracking-wider flex items-center gap-1.5 border-b border-slate-200/50 pb-2.5">
                <Calendar className="w-4 h-4 text-blue-600" />
                Upcoming Course Milestones & Deadlines
              </h4>

              {/* List of current deadlines */}
              {deadlines.length === 0 ? (
                <div className="p-4 bg-white border border-slate-150 rounded-xl text-center text-slate-400 text-xs">
                  No upcoming deadlines set. Add custom goals below to align the weekly planner.
                </div>
              ) : (
                <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                  {deadlines.map((dl) => (
                    <div
                      key={dl.id}
                      className="flex items-center justify-between p-3 bg-white border border-slate-150 rounded-xl hover:border-slate-300 group transition-colors"
                    >
                      <div className="space-y-0.5 min-w-0 pr-4">
                        <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-800 font-mono">
                          {dl.courseTitle}
                        </span>
                        <h5 className="font-bold text-xs text-slate-800 truncate leading-tight">
                          {dl.task}
                        </h5>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-[10px] font-mono text-indigo-700 bg-indigo-50 px-2 py-1 rounded-lg font-black">
                          📅 {dl.dueDate}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveDeadline(dl.id)}
                          className="p-1 rounded-lg hover:bg-rose-50 text-slate-350 hover:text-rose-600 transition cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Form to add custom deadlines */}
            <form onSubmit={handleAddDeadline} className="grid grid-cols-1 md:grid-cols-12 gap-2 mt-3 pt-3 border-t border-slate-200/40">
              <div className="md:col-span-4">
                <input
                  type="text"
                  required
                  placeholder="e.g. Mastering React"
                  className="w-full text-xs font-semibold p-2 border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-indigo-400"
                  value={newCourseTitle}
                  onChange={(e) => setNewCourseTitle(e.target.value)}
                />
              </div>
              <div className="md:col-span-5">
                <input
                  type="text"
                  required
                  placeholder="Task, e.g. State assessment"
                  className="w-full text-xs font-semibold p-2 border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-indigo-400"
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                />
              </div>
              <div className="md:col-span-3 flex items-center gap-1.5">
                <input
                  type="date"
                  className="flex-1 text-xs font-semibold p-2 border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-indigo-400"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                />
                <button
                  type="submit"
                  className="p-2 rounded-xl bg-slate-900 border-none hover:bg-slate-800 text-white shrink-0 cursor-pointer"
                  title="Add target milestone"
                >
                  <Plus className="h-4.5 w-4.5" />
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* CTA generation trigger */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-slate-100 pt-5">
          <p className="text-[11px] leading-relaxed text-slate-500 max-w-xl">
            🌱 <strong>Weekly consistency generates real results.</strong> Submitting parameters generates a sequential timeline that targets maximum study efficiency. Earns <strong>+40 XP</strong> upon optimization.
          </p>

          <button
            type="button"
            onClick={handleGeneratePlannerSchedule}
            disabled={isLoading || deadlines.length === 0}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-md shadow-indigo-600/10 cursor-pointer disabled:opacity-40"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin text-white" />
                <span>Generating Program...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 fill-white text-white" />
                <span>Optimize My Weekly Schedule</span>
              </>
            )}
          </button>
        </div>

        {/* Error Callout */}
        {errorMsg && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-800 flex items-start gap-2.5 text-xs font-semibold font-sans">
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
            <p>{errorMsg}</p>
          </div>
        )}

        {/* LOADING SHIM (Rotating tips and animations) */}
        {isLoading && (
          <div className="p-8 border border-dashed border-indigo-150 bg-indigo-50/15 rounded-2xl text-center space-y-4 animate-pulse pt-10">
            <div className="h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto text-indigo-600">
              <RefreshCw className="h-6 w-6 animate-spin text-indigo-600" />
            </div>
            <div className="space-y-1">
              <h5 className="font-bold text-sm text-slate-900">AceNext AI Academic Advisor at Work...</h5>
              <p className="text-xs text-indigo-600 font-mono font-medium">{loadingPhrase}</p>
            </div>
            <p className="text-[10px] text-slate-450 max-w-sm mx-auto leading-relaxed">
              We leverage custom multi-objective constraint solvers paired with Gemini reasoning to align complex lesson durations with daily workloads.
            </p>
          </div>
        )}

        {/* RECOMMENDED GENERATION SHOWDOWN */}
        {!isLoading && plannerResult && (
          <div className="space-y-6 pt-2 animate-fade-in">
            {/* Split Top stats bar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-2xl bg-indigo-50/40 border border-indigo-100/50">
              <div className="space-y-1">
                <span className="text-[9px] font-black tracking-widest text-indigo-700 font-mono uppercase block">
                  Active Study Roadmap
                </span>
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-sm text-slate-900">
                    Weekly Completion Status
                  </h4>
                  <span className="bg-indigo-600 text-white font-mono font-extrabold px-2 py-0.5 rounded text-[10px]">
                    {progressPercentage}% Completed
                  </span>
                </div>
              </div>

              {/* Progress visual slider */}
              <div className="flex-1 sm:max-w-xs relative space-y-1.5">
                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <div className="flex justify-between text-[9px] font-mono font-bold text-slate-400 select-none">
                  <span>{completedActivitiesCount} of {totalActivitiesCount} TASKS DONE</span>
                  <span>🚀 +15 XP / CHECK</span>
                </div>
              </div>

              {/* Clear button */}
              <button
                type="button"
                onClick={handleResetSchedule}
                className="py-1.5 px-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-xl text-[10px] font-mono font-black uppercase tracking-wider flex items-center gap-1 cursor-pointer"
              >
                Clear
              </button>
            </div>

            {/* Weekly Grid (Grid layout, 7 days) */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-7 gap-3 pt-1 font-sans">
              {plannerResult.schedule.map((dayPlan) => {
                const dayKey = dayPlan.day.toLowerCase();
                const totalDayItems = dayPlan.activities.length;
                
                // Calculate if all items checked for this day
                const itemsCompletedCount = dayPlan.activities.filter((_, idx) => !!completedItems[`${dayKey}_${idx}`]).length;
                const isDaySuccess = totalDayItems > 0 && itemsCompletedCount === totalDayItems;

                return (
                  <div
                    key={dayPlan.day}
                    className={`rounded-xl border p-4.5 space-y-3.5 transition-all flex flex-col justify-between ${
                      isDaySuccess
                        ? "bg-emerald-500/[0.02] border-emerald-200 hover:border-emerald-300"
                        : "bg-slate-50/50 border-slate-150 hover:border-slate-250 hover:bg-slate-50"
                    }`}
                  >
                    {/* Day header */}
                    <div className="space-y-0.5 border-b border-dashed border-slate-200/80 pb-2">
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="font-extrabold text-xs text-slate-900">
                          {dayPlan.day}
                        </span>
                        <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-tight">
                          ⏱ {dayPlan.duration}
                        </span>
                      </div>
                      <p className="text-[10px] font-bold text-indigo-700 truncate" title={dayPlan.focus}>
                        {dayPlan.focus}
                      </p>
                    </div>

                    {/* Step objectives checklist */}
                    <div className="space-y-2 flex-1">
                      {dayPlan.activities.map((act, idx) => {
                        const isChecked = !!completedItems[`${dayKey}_${idx}`];
                        return (
                          <div
                            key={idx}
                            onClick={() => toggleItemCompleted(dayKey, idx)}
                            className={`flex items-start gap-2 p-2 rounded-lg border text-[11px] leading-relaxed font-semibold transition cursor-pointer select-none text-left ${
                              isChecked
                                ? "bg-emerald-500/[0.04] border-emerald-100 text-slate-400 line-through"
                                : "bg-white border-slate-100 text-slate-600 hover:border-slate-200"
                            }`}
                          >
                            <div className={`h-4 w-4 rounded-md border shrink-0 mt-0.5 flex items-center justify-center transition ${
                              isChecked
                                ? "bg-emerald-500 border-emerald-500 text-white"
                                : "border-slate-300 bg-white"
                            }`}>
                              {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                            </div>
                            <span className="flex-1 truncate-2-lines">{act}</span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Pro tip item */}
                    {dayPlan.tips && (
                      <div className="pt-2.5 border-t border-slate-150/60 text-[10px] leading-normal text-slate-450 flex items-start gap-1">
                        <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                        <span className="italic font-medium">{dayPlan.tips}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* General Coach Insights section */}
            {plannerResult.recommendations && plannerResult.recommendations.length > 0 && (
              <div className="p-4.5 bg-amber-500/[0.02] border border-amber-500/20 rounded-2xl space-y-2.5">
                <div className="flex items-center gap-1.5 text-xs font-black text-amber-800 font-mono uppercase tracking-wider pl-0.5">
                  <Lightbulb className="h-4.5 w-4.5 text-amber-600" />
                  <span>AI Academic Coach Insights & Recommendations</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {plannerResult.recommendations.map((rec, idx) => (
                    <div
                      key={idx}
                      className="text-xs text-slate-600 leading-relaxed font-sans bg-white border border-slate-150 p-3 rounded-xl flex items-start gap-2 shadow-inner"
                    >
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="font-medium">{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
