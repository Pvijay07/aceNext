import React, { useState, useEffect } from "react";
import { Calendar, ChevronLeft, ChevronRight, Info, Plus, Sparkles, Trophy, Flame } from "lucide-react";

interface StudyDay {
  dateString: string; // YYYY-MM-DD
  dayNumber: number;
  minutes: number;
  isCurrentDay: boolean;
}

export default function StudyCalendar() {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDay, setSelectedDay] = useState<StudyDay | null>(null);
  const [heatmapData, setHeatmapData] = useState<Record<string, number>>({});
  const [todayMins, setTodayMins] = useState(0);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  // Format month names
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const weekdayHeaders = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Fetch today's dynamic minutes from localStorage to synchronize and update live
  useEffect(() => {
    const fetchTodayMinutes = () => {
      const saved = localStorage.getItem("daily_study_activities_minutes");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed && typeof parsed === "object") {
            const sum = Object.keys(parsed).reduce(
              (acc: number, key: string) => acc + (parsed[key] || 0),
              0
            );
            setTodayMins(sum);
          }
        } catch (e) {
          console.error("Error reading todays activity minutes", e);
        }
      }
    };

    fetchTodayMinutes();
    const interval = setInterval(fetchTodayMinutes, 1000);
    return () => clearInterval(interval);
  }, []);

  // Initialize or load calendar historical heatmap data from localStorage
  useEffect(() => {
    const storageKey = `historical_study_heatmap_v1`;
    const saved = localStorage.getItem(storageKey);
    let dataMap: Record<string, number> = {};

    if (saved) {
      try {
        dataMap = JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse historical study heatmap", e);
      }
    } else {
      // Seed initial high-fidelity study pattern representation
      const today = new Date();
      const currentYear = today.getFullYear();
      const currentMonth = today.getMonth() + 1; // 1-indexed

      // Helper to generate key
      const keyOf = (day: number) => {
        return `${currentYear}-${String(currentMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      };

      // Beautiful consistency seeds!
      dataMap = {
        [keyOf(1)]: 50,
        [keyOf(2)]: 15,
        [keyOf(3)]: 60,
        [keyOf(5)]: 45,
        [keyOf(8)]: 30,
        [keyOf(9)]: 55,
        [keyOf(10)]: 90,
        [keyOf(12)]: 40,
        [keyOf(15)]: 60,
        [keyOf(16)]: 20,
        [keyOf(17)]: 35,
        [keyOf(18)]: 45,
        [keyOf(22)]: 15,
        [keyOf(23)]: 65,
        [keyOf(24)]: 50,
        [keyOf(25)]: 45,
        [keyOf(29)]: 40,
        [keyOf(30)]: 60,
      };

      // Save initial seed map to localStorage
      localStorage.setItem(storageKey, JSON.stringify(dataMap));
    }

    // Always ensure today's value is linked to live daily_study_activities_minutes
    const todayStr = getYYYYMMDD(new Date());
    dataMap[todayStr] = todayMins;

    setHeatmapData(dataMap);
  }, [todayMins]);

  // Utility to convert Date instance to custom string YYYY-MM-DD
  const getYYYYMMDD = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  // Switch months
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDay(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDay(null);
  };

  // Generate calendar cells
  const firstDay = new Date(year, month, 1);
  const startOffset = firstDay.getDay(); // 0 is Sunday, 1 is Monday ...
  const numDays = new Date(year, month + 1, 0).getDate();

  const studyDays: (StudyDay | null)[] = [];

  // Padding cells before Month starts
  for (let s = 0; s < startOffset; s++) {
    studyDays.push(null);
  }

  // Populate actual month dates
  const todayDateStr = getYYYYMMDD(new Date());

  for (let d = 1; d <= numDays; d++) {
    const cellDate = new Date(year, month, d);
    const cellDateStr = getYYYYMMDD(cellDate);
    const mins = heatmapData[cellDateStr] !== undefined ? heatmapData[cellDateStr] : 0;

    studyDays.push({
      dateString: cellDateStr,
      dayNumber: d,
      minutes: mins,
      isCurrentDay: cellDateStr === todayDateStr
    });
  }

  // Determine heatmap color intensities
  const getColorClass = (mins: number) => {
    if (mins === 0) return "bg-slate-50 border-slate-100 hover:border-slate-300 text-slate-400";
    if (mins <= 15) return "bg-emerald-100/75 border-emerald-200 text-emerald-800 hover:bg-emerald-200/90";
    if (mins <= 30) return "bg-emerald-300/80 border-emerald-400/50 text-emerald-950 hover:bg-emerald-400/90";
    if (mins <= 45) return "bg-emerald-500 border-emerald-600/30 text-white hover:bg-emerald-600";
    return "bg-emerald-700 border-emerald-800 text-white hover:bg-emerald-800 shadow-sm shadow-emerald-700/10";
  };

  const getHeatmapTitle = (mins: number) => {
    if (mins === 0) return "No minutes studied";
    if (mins <= 15) return "Light study session (1-15m)";
    if (mins <= 30) return "Medium study session (16-30m)";
    if (mins <= 45) return "Daily Goal Met! (31-45m)";
    return "Supercharged study session (45m+)";
  };

  // Adjust minutes simulation handler
  const handleSimulateMinutes = (amount: number) => {
    if (!selectedDay) return;
    const key = selectedDay.dateString;
    const newMinutes = Math.max(0, (heatmapData[key] || 0) + amount);

    const updatedData = { ...heatmapData, [key]: newMinutes };
    setHeatmapData(updatedData);
    localStorage.setItem(`historical_study_heatmap_v1`, JSON.stringify(updatedData));

    // Update today's main logger state if they adjusted today's tile
    const todayStr = getYYYYMMDD(new Date());
    if (key === todayStr) {
      const saved = localStorage.getItem("daily_study_activities_minutes");
      let activities = { lms: 0, coding: 0, quizzes: 0, interview: 0, resume: 0 };
      if (saved) {
        try {
          activities = JSON.parse(saved);
        } catch (e) {}
      }
      // Allocate to "lms" track as generic increment
      activities.lms = Math.max(0, activities.lms + amount);
      localStorage.setItem("daily_study_activities_minutes", JSON.stringify(activities));
    }

    // Refresh selected tile state
    setSelectedDay((prev) => prev ? { ...prev, minutes: newMinutes } : null);
  };

  // Calculate consistency analytics for the current month representation
  const activeDaysCount = Object.keys(heatmapData).filter(
    (key) => key.startsWith(`${year}-${String(month + 1).padStart(2, "0")}`) && heatmapData[key] > 0
  ).length;

  const totalMonthlyMinutes = Object.keys(heatmapData)
    .filter((key) => key.startsWith(`${year}-${String(month + 1).padStart(2, "0")}`))
    .reduce((sum, key) => sum + (heatmapData[key] || 0), 0);

  const streakDaysMet = Object.keys(heatmapData).filter(
    (key) => key.startsWith(`${year}-${String(month + 1).padStart(2, "0")}`) && heatmapData[key] >= 45
  ).length;

  const currentMonthName = monthNames[month];

  return (
    <div id="study-heatmap-widget" className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-5">
      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-50 pb-4">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 font-mono uppercase tracking-wider">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Consistency Heatmap</span>
          </div>
          <h4 className="font-bold text-slate-900 text-sm">Study Calendar & Attendance Tracker</h4>
          <p className="text-xs text-slate-500 leading-normal">
            Visualize your monthly engagement patterns. Squares get dimmer or brighter based on how long you focus.
          </p>
        </div>

        {/* Change month navigation */}
        <div className="flex items-center gap-1">
          <button
            onClick={handlePrevMonth}
            className="p-2 border border-slate-100 rounded-lg hover:bg-slate-50 text-slate-600 transition"
            title="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-xs font-bold text-slate-800 px-3 py-1 font-mono min-w-[100px] text-center bg-slate-50 rounded-lg border border-slate-100">
            {currentMonthName} {year}
          </span>
          <button
            onClick={handleNextMonth}
            className="p-2 border border-slate-100 rounded-lg hover:bg-slate-50 text-slate-600 transition"
            title="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Grid Container */}
      <div className="space-y-4">
        {/* Heatmap Layout Grid */}
        <div className="overflow-x-auto pb-1.5">
          <div className="min-w-[320px] max-w-sm sm:max-w-md mx-auto">
            {/* Week Headers */}
            <div className="grid grid-cols-7 gap-1.5 mb-2 text-center">
              {weekdayHeaders.map((header) => (
                <div key={header} className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                  {header}
                </div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1.5">
              {studyDays.map((day, idx) => {
                if (!day) {
                  return <div key={`empty-${idx}`} className="h-10 sm:h-11 rounded-lg bg-slate-50/20" />;
                }

                const colorClass = getColorClass(day.minutes);
                const isSelected = selectedDay?.dateString === day.dateString;

                return (
                  <button
                    key={day.dateString}
                    onClick={() => setSelectedDay(day)}
                    title={`${day.dateString}: ${day.minutes} mins studied`}
                    className={`relative h-10 sm:h-11 rounded-lg border text-xs font-bold transition-all flex flex-col items-center justify-between p-1 select-none ${colorClass} ${
                      day.isCurrentDay ? "ring-2 ring-indigo-500/80 font-black scale-102 font-sans" : ""
                    } ${isSelected ? "ring-2 ring-slate-900 border-transparent shadow" : ""}`}
                  >
                    <span className="absolute top-1 left-1.5 text-[9px] font-mono leading-none">
                      {day.dayNumber}
                    </span>
                    {day.minutes > 0 && (
                      <span className="text-[8px] font-sans opacity-70 mt-auto leading-none mb-0.5">
                        {day.minutes}m
                      </span>
                    )}
                    {day.isCurrentDay && (
                      <span className="absolute bottom-1 right-1 h-1 w-1 rounded-full bg-indigo-500" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Legend block */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wide border-t border-slate-50 pt-3.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <span>Level: Less</span>
            <div className="h-3 w-3 rounded bg-slate-50 border border-slate-200" title="0 mins" />
            <div className="h-3 w-3 rounded bg-emerald-100" title="1-15 mins" />
            <div className="h-3 w-3 rounded bg-emerald-300" title="16-30 mins" />
            <div className="h-3 w-3 rounded bg-emerald-500" title="31-45 mins" />
            <div className="h-3 w-3 rounded bg-emerald-700" title="45m+" />
            <span>More</span>
          </div>

          <span className="flex items-center gap-0.5 text-indigo-500 animate-pulse text-[9px]">
            <Info className="h-3.5 w-3.5 text-indigo-500 shrink-0" /> Tap/Click inside any cell to simulate logs
          </span>
        </div>

        {/* Selected Day Context Controls */}
        {selectedDay ? (
          <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 text-white space-y-3.5 animate-fadeIn">
            <div className="flex items-start justify-between gap-2 border-b border-white/5 pb-2.5">
              <div className="space-y-0.5">
                <span className="text-[9px] font-mono font-extrabold text-emerald-400 uppercase tracking-widest pl-0.5">
                  Cell Selection Dashboard
                </span>
                <h5 className="font-extrabold text-xs text-slate-100">
                  {new Date(selectedDay.dateString).toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric"
                  })}
                </h5>
              </div>

              <div className="text-right">
                <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                  Focused Duration
                </span>
                <span className="text-xs font-black text-slate-100 font-mono">
                  {selectedDay.minutes} minutes
                </span>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-0.5">
              <div className="text-[11px] text-slate-300 max-w-sm flex items-center gap-2">
                <Trophy className="h-4 w-4 text-amber-400 shrink-0" />
                <span>
                  {selectedDay.minutes >= 45 ? (
                    <strong className="text-emerald-400 font-bold">Goal met!</strong>
                  ) : (
                    <span className="text-slate-400">Needs {Math.max(0, 45 - selectedDay.minutes)}m more to achieve Goal.</span>
                  )}{" "}
                  Adjust minutes spent below to test heatmap patterns.
                </span>
              </div>

              {/* Adjust minutes shortcuts */}
              <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0 font-mono">
                <button
                  onClick={() => handleSimulateMinutes(-15)}
                  disabled={selectedDay.minutes === 0}
                  className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 rounded-lg text-[10px] font-black border border-white/5 text-slate-300 transition"
                >
                  -15m
                </button>
                <button
                  onClick={() => handleSimulateMinutes(15)}
                  className="py-1.5 px-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-[10px] font-black shadow-lg shadow-indigo-600/10 text-white flex items-center gap-1 transition"
                >
                  <Plus className="h-3 w-3 stroke-[2.5]" /> Add 15m
                </button>
                <button
                  onClick={() => handleSimulateMinutes(45)}
                  className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-[10px] font-black shadow-lg shadow-emerald-600/10 text-white flex items-center gap-1 transition"
                >
                  <Plus className="h-3 w-3 stroke-[2.5]" /> Add 45m
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-50/50 rounded-xl border border-slate-100 text-center">
            <div className="space-y-0.5">
              <span className="text-[9px] text-slate-400 uppercase tracking-widest font-mono font-bold">Active Days ({currentMonthName})</span>
              <p className="text-sm font-black text-slate-800">{activeDaysCount} Days</p>
            </div>
            <div className="space-y-0.5 border-t sm:border-t-0 sm:border-x border-slate-200/50 py-2 sm:py-0">
              <span className="text-[9px] text-slate-400 uppercase tracking-widest font-mono font-bold">Total Mind-Share</span>
              <p className="text-sm font-black text-emerald-600 font-mono">{totalMonthlyMinutes} mins</p>
            </div>
            <div className="space-y-0.5">
              <span className="text-[9px] text-slate-400 uppercase tracking-widest font-mono font-bold">Goals Achieved (45m+)</span>
              <p className="text-sm font-black text-indigo-600">{streakDaysMet} days</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
