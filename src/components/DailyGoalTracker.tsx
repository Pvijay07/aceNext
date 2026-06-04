import React, { useState, useEffect, FormEvent, ComponentType } from "react";
import { 
  BookOpen, 
  Code, 
  HelpCircle, 
  Mic, 
  FileText, 
  Plus, 
  Minus, 
  Clock, 
  Target, 
  PlusCircle, 
  Trash2, 
  CheckCircle2, 
  Sparkles,
  TrendingUp,
  AlertCircle,
  Bell,
  BellOff,
  BellRing,
  Volume2,
  Play,
  X
} from "lucide-react";

interface Activity {
  id: string;
  label: string;
  colorClass: string;
  textColor: string;
  icon: ComponentType<{ className?: string }>;
}

const ACTIVITIES: Activity[] = [
  { id: "lms", label: "LMS Video Lessons", colorClass: "bg-blue-500", textColor: "text-blue-600", icon: BookOpen },
  { id: "coding", label: "Coding Arena", colorClass: "bg-emerald-500", textColor: "text-emerald-600", icon: Code },
  { id: "quizzes", label: "Quizzes & Tests", colorClass: "bg-amber-500", textColor: "text-amber-600", icon: HelpCircle },
  { id: "interview", label: "AI Mock Interviews", colorClass: "bg-indigo-500", textColor: "text-indigo-600", icon: Mic },
  { id: "resume", label: "CV & Job Prep", colorClass: "bg-pink-500", textColor: "text-pink-600", icon: FileText },
];

export default function DailyGoalTracker() {
  // State for daily goals
  const [targetGoal, setTargetGoal] = useState<number>(() => {
    const saved = localStorage.getItem("daily_study_goal_target");
    return saved ? parseInt(saved, 10) : 45;
  });

  // State for tracked minutes per activity
  const [activitiesMinutes, setActivitiesMinutes] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem("daily_study_activities_minutes");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === "object") {
          return parsed as Record<string, number>;
        }
      } catch (e) {
        console.error("Failed to parse activities minutes from localStorage", e);
      }
    }
    return { lms: 0, coding: 0, quizzes: 0, interview: 0, resume: 0 };
  });

  // Category being selected for input logging
  const [selectedCategory, setSelectedCategory] = useState<string>("lms");
  // Manual minutes text input state
  const [manualMinutes, setManualMinutes] = useState<string>("");

  // Alert or toast message
  const [goalAchievedToast, setGoalAchievedToast] = useState<boolean>(false);

  // Reminders Enable/Disable state
  const [remindersEnabled, setRemindersEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem("daily_learning_reminders_enabled");
    return saved === null ? true : saved === "true";
  });

  // Reminder Target Time state
  const [reminderTime, setReminderTime] = useState<string>(() => {
    const saved = localStorage.getItem("daily_learning_reminder_time");
    return saved ? saved : "18:00";
  });

  // State to control simulated active push notification toast display
  const [pushNotifActive, setPushNotifActive] = useState<boolean>(false);

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem("daily_study_goal_target", targetGoal.toString());
  }, [targetGoal]);

  useEffect(() => {
    localStorage.setItem("daily_study_activities_minutes", JSON.stringify(activitiesMinutes));
  }, [activitiesMinutes]);

  useEffect(() => {
    localStorage.setItem("daily_learning_reminders_enabled", remindersEnabled.toString());
  }, [remindersEnabled]);

  useEffect(() => {
    localStorage.setItem("daily_learning_reminder_time", reminderTime);
  }, [reminderTime]);

  const playNotificationSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc1 = audioCtx.createOscillator();
      const osc2 = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      osc1.type = "sine";
      osc2.type = "sine";
      
      // Pleasant double study chime melody (E5 and G5)
      osc1.frequency.setValueAtTime(659.25, audioCtx.currentTime); // E5
      osc2.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.08); // G5

      gainNode.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(audioCtx.currentTime + 0.5);
      osc2.stop(audioCtx.currentTime + 0.5);
    } catch (err) {
      console.warn("Audio Context not supported or blocked by user gesture:", err);
    }
  };

  const triggerTestPush = () => {
    setPushNotifActive(true);
    playNotificationSound();
  };

  // Calculate sum total
  const totalMinutes: number = Object.keys(activitiesMinutes).reduce(
    (acc: number, key: string) => acc + (activitiesMinutes[key] || 0),
    0
  );

  // Checker effect that watches the system clock for matches to selected notification time target
  useEffect(() => {
    if (!remindersEnabled) return;

    const checkReminder = () => {
      const now = new Date();
      const currentHourMin = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      const todayStr = now.toDateString();

      const savedLastAlert = localStorage.getItem("daily_learning_last_alert_date");

      if (currentHourMin === reminderTime) {
        if (totalMinutes < targetGoal) {
          if (savedLastAlert !== todayStr) {
            localStorage.setItem("daily_learning_last_alert_date", todayStr);
            setPushNotifActive(true);
            playNotificationSound();
          }
        }
      }
    };

    checkReminder();
    const timerId = setInterval(checkReminder, 15000);
    return () => clearInterval(timerId);
  }, [remindersEnabled, reminderTime, totalMinutes, targetGoal]);

  // Trigger achievement toast if they crossed target and hadn't before in the current render session
  useEffect(() => {
    if (totalMinutes >= targetGoal && totalMinutes > 0 && targetGoal > 0) {
      setGoalAchievedToast(true);
    } else {
      setGoalAchievedToast(false);
    }
  }, [totalMinutes, targetGoal]);

  // Handler to add minutes
  const handleAddMinutes = (category: string, amount: number) => {
    if (isNaN(amount) || amount <= 0) return;
    setActivitiesMinutes((prev) => ({
      ...prev,
      [category]: (prev[category] || 0) + amount,
    }));
  };

  // Handler to subtract minutes safely
  const handleSubtractMinutes = (category: string, amount: number) => {
    setActivitiesMinutes((prev) => {
      const current = prev[category] || 0;
      return {
        ...prev,
        [category]: Math.max(0, current - amount),
      };
    });
  };

  // Handle manual input submit
  const handleLogManual = (e: FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(manualMinutes, 10);
    if (!isNaN(parsed) && parsed > 0) {
      handleAddMinutes(selectedCategory, parsed);
      setManualMinutes("");
    }
  };

  // Handle clearing all activity minutes
  const handleResetDaysTally = () => {
    if (window.confirm("Are you sure you want to reset your study minutes for today?")) {
      setActivitiesMinutes({ lms: 0, coding: 0, quizzes: 0, interview: 0, resume: 0 });
    }
  };

  // Handle quick setting standard objectives
  const setPresetTarget = (preset: number) => {
    setTargetGoal(preset);
  };

  // Progress calculations
  const progressPercent = targetGoal > 0 ? Math.min(100, Math.round((totalMinutes / targetGoal) * 100)) : 0;

  return (
    <div id="daily-learning-goal-card" className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-6">
      {/* Header and target info */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-50 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 font-mono uppercase tracking-wider">
            <Clock className="h-4 w-4 text-indigo-500 animate-spin-slow" />
            <span>Daily Learning Goal</span>
          </div>
          <h4 className="text-sm font-bold text-slate-900">Study Habit & Engagement Hub</h4>
          <p className="text-xs text-slate-500 leading-normal">
            Establish healthy schedules! Set standard targets and record active study minutes spent across different learning tracks.
          </p>
        </div>

        {/* Preset Target Quick Buttons */}
        <div className="space-y-1.5 self-start sm:self-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase font-mono tracking-wider">Time Target</p>
          <div className="flex flex-wrap gap-1">
            {[15, 30, 45, 60, 90].map((preset) => (
              <button
                key={preset}
                onClick={() => setPresetTarget(preset)}
                className={`text-[10px] font-bold px-2 py-1 rounded-md border transition-all ${
                  targetGoal === preset
                    ? "bg-indigo-600 border-indigo-600 text-white shadow-sm shadow-indigo-600/10"
                    : "bg-slate-50 border-slate-100 hover:border-slate-200 text-slate-600"
                }`}
              >
                {preset}m
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Progress display */}
      <div className="space-y-3.5 bg-slate-50/50 p-4.5 rounded-xl border border-slate-100/70">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Today's Progress</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-black text-slate-900">{totalMinutes}</span>
              <span className="text-xs font-bold text-slate-400">/ {targetGoal} mins logged</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Completion</span>
            <p className="text-base font-black text-slate-700 flex items-center justify-end gap-1">
              <TrendingUp className="h-4 w-4 text-indigo-500" />
              {progressPercent}%
            </p>
          </div>
        </div>

        {/* Dynamic Horizontal Progress bar */}
        <div className="relative h-3 w-full bg-slate-200/50 rounded-full overflow-hidden">
          <div
            className={`absolute top-0 bottom-0 left-0 rounded-full transition-all duration-500 ${
              totalMinutes >= targetGoal 
                ? "bg-gradient-to-r from-emerald-500 to-teal-500" 
                : "bg-gradient-to-r from-indigo-500 to-blue-500"
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Dynamic motivation or toast banner */}
        {goalAchievedToast ? (
          <div className="flex items-start gap-2 p-3 bg-emerald-50 rounded-xl border border-emerald-100/40 text-emerald-800 text-[11px] font-medium leading-relaxed animate-fade-in">
            <Sparkles className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-extrabold">Habit Objective Met! 🎉</span> Beautiful focus! You have achieved your daily set target of {targetGoal} minutes. Push additional milestones to grow your platform level.
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-2 p-3 bg-indigo-50/30 rounded-xl border border-slate-100 text-slate-500 text-[11px] leading-relaxed">
            <Target className="h-3.5 w-3.5 text-indigo-500 shrink-0 mt-0.5" />
            <div>
              Remain determined! Spend <span className="font-bold text-slate-700">{Math.max(0, targetGoal - totalMinutes)} more minutes</span> studying today to hit your desired schedule target and protect Streaks.
            </div>
          </div>
        )}

        {/* Goal Reminder Settings Ribbon */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-white border border-slate-100 rounded-xl shadow-xs mt-2">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl border transition-all ${
              remindersEnabled 
                ? "bg-indigo-50 border-indigo-200/50 text-indigo-600 animate-pulse" 
                : "bg-slate-50 border-slate-200 text-slate-400"
            }`}>
              {remindersEnabled ? <BellRing className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
            </div>
            <div className="space-y-0.5">
              <label className="text-[11px] font-extrabold text-slate-800 block">Daily Study Alarm Reminder</label>
              <p className="text-[10px] text-slate-400 leading-none">
                {remindersEnabled 
                  ? `Notifies at ${reminderTime} if goal is not achieved.` 
                  : "Daily alarm reminders are turned off."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto justify-between sm:justify-end">
            <div className="relative">
              <input 
                type="time" 
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                disabled={!remindersEnabled}
                className={`text-xs p-1.5 rounded-lg border font-mono font-black text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500/40 bg-slate-50 cursor-pointer ${
                  !remindersEnabled ? "opacity-45 pointer-events-none" : "hover:bg-slate-100"
                }`}
              />
            </div>
            
            <div className="flex items-center gap-1.5 shadow-xs bg-slate-50 border border-slate-100 rounded-lg p-0.5">
              <button
                type="button"
                onClick={() => setRemindersEnabled(!remindersEnabled)}
                className={`text-[10px] font-black px-2.5 py-1.5 rounded-md transition-all ${
                  remindersEnabled 
                    ? "bg-indigo-600 text-white shadow-xs" 
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {remindersEnabled ? "On" : "Off"}
              </button>

              {remindersEnabled && (
                <button
                  type="button"
                  onClick={triggerTestPush}
                  title="Test-fire the alarm right now!"
                  className="px-2.5 py-1.5 rounded-md text-[10px] font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 transition flex items-center gap-1 border border-amber-200/20"
                >
                  <Play className="h-2.5 w-2.5 fill-current" />
                  Test Push
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Logging Activities */}
        <div className="space-y-4">
          <h5 className="text-[10px] uppercase font-mono font-extrabold text-slate-400 tracking-wider">Log Activity Minutes</h5>
          
          {/* Select Activity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {ACTIVITIES.map((act) => {
              const isSelected = selectedCategory === act.id;
              const ActivityIcon = act.icon;
              return (
                <button
                  key={act.id}
                  type="button"
                  onClick={() => setSelectedCategory(act.id)}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition ${
                    isSelected
                      ? "bg-indigo-600 border-indigo-600 text-white scale-[1.02] shadow-sm shadow-indigo-600/10"
                      : "bg-white border-slate-100 hover:border-slate-200 text-slate-700"
                  }`}
                >
                  <div className={`p-1.5 rounded-lg shrink-0 ${
                    isSelected ? "bg-white/20 text-white" : `${act.colorClass}/10 ${act.textColor}`
                  }`}>
                    <ActivityIcon className="h-4 w-4" />
                  </div>
                  <div>
                    <h6 className="text-[11px] font-bold leading-tight block">{act.label}</h6>
                    <span className={`text-[9px] block ${isSelected ? "text-indigo-200" : "text-slate-400 font-semibold"}`}>
                      {activitiesMinutes[act.id] || 0}m spent today
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Quick Increment buttons and manual inputs */}
          <div className="rounded-xl border border-slate-100 p-4 space-y-4 bg-white shadow-xs">
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-slate-400 font-mono block">
                Quick Log minutes to: <span className="text-indigo-600 font-extrabold capitalize">{ACTIVITIES.find(a => a.id === selectedCategory)?.label || selectedCategory}</span>
              </label>
              
              <div className="flex flex-wrap gap-1.5">
                {[5, 10, 15, 30, 45, 60].map((addMins) => (
                  <button
                    key={addMins}
                    type="button"
                    onClick={() => handleAddMinutes(selectedCategory, addMins)}
                    className="text-[11px] font-bold px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100/90 border border-slate-100 text-slate-700 hover:text-slate-900 transition flex items-center gap-0.5"
                  >
                    <Plus className="h-3 w-3 stroke-[3] text-indigo-500" />
                    {addMins}m
                  </button>
                ))}
              </div>
            </div>

            {/* Manual input */}
            <form onSubmit={handleLogManual} className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="number"
                  min="1"
                  max="480"
                  value={manualMinutes}
                  onChange={(e) => setManualMinutes(e.target.value)}
                  placeholder="Enter custom study minutes..."
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-sans"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-bold font-mono text-slate-400 pointer-events-none uppercase">mins</span>
              </div>
              <button
                type="submit"
                disabled={!manualMinutes}
                className="bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl px-4 text-xs font-bold transition flex items-center gap-1 shrink-0"
              >
                Log Minutes
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Breakdown and Stats */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h5 className="text-[10px] uppercase font-mono font-extrabold text-slate-400 tracking-wider">Log Breakdown & Activity Tracker</h5>
            {totalMinutes > 0 && (
              <button
                onClick={handleResetDaysTally}
                className="text-[10px] font-extrabold text-rose-500 uppercase hover:underline flex items-center gap-1 transition"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Reset Today's Log
              </button>
            )}
          </div>

          <div className="rounded-xl border border-slate-100 p-4 space-y-3.5 bg-white shadow-xs">
            {totalMinutes > 0 ? (
              <div className="space-y-3">
                {ACTIVITIES.map((act) => {
                  const minutesTracked = activitiesMinutes[act.id] || 0;
                  const ratioPercent = totalMinutes > 0 ? Math.round((minutesTracked / totalMinutes) * 100) : 0;
                  const ActIcon = act.icon;

                  return (
                    <div key={act.id} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1.5 text-slate-700 font-semibold">
                          <ActIcon className={`h-4 w-4 ${act.textColor}`} />
                          {act.label}
                        </span>
                        
                        {/* Adjust Category Minutes directly */}
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-mono font-black text-slate-900">{minutesTracked}m</span>
                          <span className="text-[10px] text-slate-400">({ratioPercent}%)</span>
                          
                          <div className="flex items-center bg-slate-50 border border-slate-100 rounded-md p-0.5 ml-1">
                            <button
                              onClick={() => handleSubtractMinutes(act.id, 5)}
                              disabled={minutesTracked === 0}
                              title="Minus 5 minutes"
                              className="p-1 hover:bg-white text-slate-400 hover:text-slate-900 disabled:opacity-30 rounded transition"
                            >
                              <Minus className="h-2.5 w-2.5 stroke-[3]" />
                            </button>
                            <button
                              onClick={() => handleAddMinutes(act.id, 5)}
                              title="Add 5 minutes"
                              className="p-1 hover:bg-white text-slate-400 hover:text-slate-900 rounded transition"
                            >
                              <Plus className="h-2.5 w-2.5 stroke-[3]" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Visual segment breakdown */}
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${act.colorClass} rounded-full`}
                          style={{ width: `${ratioPercent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center space-y-2.5">
                <div className="h-10 w-10 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center shadow-xs">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <h6 className="font-bold text-xs text-slate-700">No Study Activities Tracked Yet</h6>
                  <p className="text-[11px] text-slate-400 max-w-xs mt-1">
                    Log minutes manually or tap on rapid timing shortcut controls below to build your study progress timeline.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dynamic Floating Push Notification Style Toast Alert */}
      {pushNotifActive && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-slate-900 border border-slate-800 text-white rounded-2xl shadow-2xl p-5 space-y-3.5 mr-4 md:mr-0 transition-all duration-300 transform scale-100 animate-bounce-short">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-600/30">
                <BellRing className="h-5 w-5 animate-pulse text-indigo-200" />
              </div>
              <div className="space-y-0.5">
                <h5 className="text-[10px] font-black tracking-widest uppercase text-indigo-400 font-mono">Habit Guardian</h5>
                <p className="text-xs font-bold text-slate-100">Study Goal Unresolved!</p>
              </div>
            </div>
            <button 
              type="button"
              onClick={() => setPushNotifActive(false)}
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition"
              title="Close Notification"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-3 pt-1">
            <div className="space-y-1">
              <p className="text-[11px] text-slate-300 leading-normal">
                You haven't hit your daily schedule of <strong className="text-white">{targetGoal} mins</strong> studying today! Currently logged: <strong className="text-indigo-300">{totalMinutes} mins</strong> ({targetGoal - totalMinutes}m remaining). Protect your learning streak!
              </p>
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span>Alarm time set: {reminderTime}</span>
                <span className="flex items-center gap-0.5 text-amber-400 font-bold">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" /> Streak Warning
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1 justify-end">
              <button
                type="button"
                onClick={() => setPushNotifActive(false)}
                className="text-[10px] font-extrabold px-3 py-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 text-slate-300 transition"
              >
                Dismiss
              </button>
              <button
                type="button"
                onClick={() => {
                  handleAddMinutes("lms", 15);
                  setPushNotifActive(false);
                }}
                className="text-[10px] font-black px-3.5 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition shadow-sm shadow-indigo-600/10 flex items-center gap-1.5"
              >
                <Plus className="h-3 w-3 stroke-[3]" />
                Log 15m Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
