import React, { useState, useEffect } from "react";
import { ArrowUpRight, Award, Flame, GraduationCap, Zap, CheckCircle2, ChevronRight, Check, Sparkles, BookOpen, Code, Trophy, BarChart2, Calendar, Clock, Briefcase, AlertCircle, CheckSquare } from "lucide-react";
import { UserProfile, Course } from "../../types";
import { projectLabs, initialQuizzes } from "../../data";
import DailyGoalTracker from "./DailyGoalTracker";
import StudyCalendar from "./StudyCalendar";
import SyllabusPathways from "./SyllabusPathways";
import QuickPoll from "../../components/shared/QuickPoll";
import SmartPlanner from "./SmartPlanner";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts";

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const minutes = payload[0].value;
    const isGoalMet = minutes >= 45;
    return (
      <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-800 text-xs space-y-1">
        <p className="font-bold font-mono text-slate-400">{label}</p>
        <p className="text-sm font-semibold flex items-center gap-1">
          <span className="text-indigo-400 font-extrabold">{minutes} minutes</span> studied
        </p>
        <p className={`text-[10px] uppercase font-bold tracking-wider ${isGoalMet ? "text-emerald-400" : "text-amber-400"}`}>
          {isGoalMet ? "🎉 Daily Goal Achieved" : "🎯 Goal in progress"}
        </p>
      </div>
    );
  }
  return null;
};

interface DashboardProps {
  profile: UserProfile;
  courses: Course[];
  setActiveTab: (tab: string) => void;
  onTrackXp: (xp: number) => void;
}

export default function Dashboard({ profile, courses, setActiveTab, onTrackXp }: DashboardProps) {
  const currentLevel = Math.floor(profile.xp / 500) + 1;
  const nextLevelXp = currentLevel * 500;
  const prevLevelXp = (currentLevel - 1) * 500;
  const progressPercent = Math.min(100, Math.max(0, ((profile.xp - prevLevelXp) / 500) * 100));

  // Load current day's active study minutes to show live updates on the chart!
  const [todayMinutes, setTodayMinutes] = useState(0);

  useEffect(() => {
    const updateMinutes = () => {
      const saved = localStorage.getItem("daily_study_activities_minutes");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed && typeof parsed === "object") {
            const sum = Object.keys(parsed).reduce(
              (acc: number, key: string) => acc + (parsed[key] || 0),
              0
            );
            setTodayMinutes(sum);
          }
        } catch (e) {
          console.error(e);
        }
      }
    };

    updateMinutes();
    window.addEventListener("storage", updateMinutes);
    const interval = setInterval(updateMinutes, 1000);

    return () => {
      window.removeEventListener("storage", updateMinutes);
      clearInterval(interval);
    };
  }, []);

  // Past 7 Days dynamic study activity list matching current system day
  const chartData = (() => {
    const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const today = new Date();
    const list = [];
    
    // High-fidelity relative daily minutes completed earlier this week
    const pastEfforts = [30, 55, 20, 60, 15, 45]; 

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const isToday = i === 0;
      const dayName = isToday ? "Today" : dayLabels[d.getDay()];
      const mins = isToday ? todayMinutes : (pastEfforts[6 - i - 1] || 30);
      
      list.push({
        day: dayName,
        minutes: mins,
        goal: 45,
        isToday,
      });
    }
    return list;
  })();

  // Compute stats
  const totalLessons = courses.reduce((acc, c) => acc + c.modules.reduce((mAcc, m) => mAcc + m.lessons.length, 0), 0);
  const completedCount = profile.completedLessons.length;
  const completionRate = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  // --- Dynamic Suggestion & Recommendation Engine ---
  // A. Course recommendations
  const recommendedCourses = courses.map(course => {
    const courseLessonIds = course.modules.flatMap(m => m.lessons.map(l => l.id));
    const completedCountInCourse = courseLessonIds.filter(id => profile.completedLessons.includes(id)).length;
    const isCompleted = completedCountInCourse === courseLessonIds.length;
    const isStarted = completedCountInCourse > 0;
    
    let priority = 0;
    let reason = "";
    
    if (isCompleted) {
      priority = -1; // lowest priority
      reason = "Completed";
    } else if (isStarted) {
      priority = 4; // highest priority (resume learning in progress)
      reason = `In Progress (${Math.round((completedCountInCourse / courseLessonIds.length) * 100)}% done) • Pick up right where you left off.`;
    } else {
      // Not started, match to current XP level
      if (profile.xp < 800 && course.category === "Frontend Development") {
        priority = 3;
        reason = "Aligned with your Level 1 frontend foundation pathways & styling goals.";
      } else if (profile.xp >= 800 && profile.xp < 1500 && course.category === "Backend Development") {
        priority = 3;
        reason = "Step up to API and server routing paths suited for your Level 2 intermediate skillset.";
      } else if (profile.xp >= 1500 && course.category === "Data Structures & Algos") {
        priority = 3;
        reason = "Ace candidate technical screeners with advanced patterns suited for Level 3.";
      } else {
        priority = 1;
        reason = `Complement your engineering journey with new ${course.category} concepts.`;
      }
    }
    
    return {
      type: "course" as const,
      id: course.id,
      title: course.title,
      category: course.category,
      desc: course.description,
      extra: `${courseLessonIds.length} lessons • +${course.xpReward} XP Reward`,
      reason,
      priority,
      targetTab: "lms"
    };
  }).filter(c => c.priority >= 0);

  recommendedCourses.sort((a, b) => b.priority - a.priority);

  // B. Lab recommendations
  const recommendedLabs = projectLabs.map(lab => {
    const isCompleted = profile.completedLabs.includes(lab.id);
    let priority = 0;
    let reason = "";
    
    if (isCompleted) {
      priority = -1;
      reason = "Completed";
    } else {
      if (lab.difficulty === "Beginner" && profile.xp < 800) {
        priority = 3;
        reason = "Perfect sandbox task for practicing fundamental state bindings and layout grids.";
      } else if (lab.difficulty === "Intermediate" && profile.xp >= 800 && profile.xp < 1500) {
        priority = 3;
        reason = "Hone dynamic filters, search indices, and complex array actions on a pipeline Kanban board.";
      } else if (lab.difficulty === "Advanced" && profile.xp >= 1500) {
        priority = 3;
        reason = "Test architectural boundaries with interactive calendars, timelines, and alert states.";
      } else {
        priority = 2;
        reason = `Hone your real-world development style in this ${lab.difficulty} mock blueprint workspace.`;
      }
    }
    
    return {
      type: "lab" as const,
      id: lab.id,
      title: lab.title,
      category: `${lab.difficulty} Lab Project`,
      desc: lab.description,
      extra: `${lab.tasks.length} core tasks • +150 XP Reward`,
      reason,
      priority,
      targetTab: "labs"
    };
  }).filter(l => l.priority >= 0);

  recommendedLabs.sort((a, b) => b.priority - a.priority);

  // Take the best choices to form side-by-side targets
  const suggestions = [];
  if (recommendedCourses[0]) suggestions.push(recommendedCourses[0]);
  if (recommendedLabs[0]) suggestions.push(recommendedLabs[0]);
  if (suggestions.length < 2) {
    if (recommendedCourses[1]) suggestions.push(recommendedCourses[1]);
    if (recommendedLabs[1]) suggestions.push(recommendedLabs[1]);
  }

  return (
    <div id="dashboard-view" className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-2xl bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white relative overflow-hidden shadow-xl">
        <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-indigo-500/20 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center space-x-1.5 rounded-full bg-indigo-500/15 px-3 py-1 text-xs font-medium text-indigo-300 backdrop-blur-md">
            <Flame className="h-3.5 w-3.5 animate-pulse text-amber-500" />
            <span>{profile.streak} Day Study Streak Active!</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Welcome back, {profile.name}!
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Ready to ace your engineering path? You're currently Level {currentLevel} with {profile.xp} total XP. Practice code challenges, complete interactive LMS lessons, or prepare with AI mock interviews today.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={() => setActiveTab("lms")}
              className="rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold hover:bg-blue-500 transition shadow-lg shadow-blue-500/20 flex items-center gap-1"
            >
              Resume Lessons
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setActiveTab("interview")}
              className="rounded-xl bg-white/10 hover:bg-white/15 px-4 py-2.5 text-xs font-semibold backdrop-blur-md transition flex items-center gap-1 text-white border border-white/10"
            >
              Start AI Mock Interview
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1 */}
        <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Experience Level</p>
            <h3 className="text-2xl font-bold text-slate-900">Level {currentLevel}</h3>
            <p className="text-[11px] text-slate-500">{nextLevelXp - profile.xp} XP to Level {currentLevel + 1}</p>
          </div>
          <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
            <Zap className="h-5 w-5" />
          </div>
        </div>

        {/* Stat 2 */}
        <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">LMS Progress</p>
            <h3 className="text-2xl font-bold text-slate-900">{completionRate}%</h3>
            <p className="text-[11px] text-slate-500">{completedCount} of {totalLessons} modules done</p>
          </div>
          <div className="h-10 w-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
            <GraduationCap className="h-5 w-5" />
          </div>
        </div>

        {/* Stat 3 */}
        <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Coding Challenges</p>
            <h3 className="text-2xl font-bold text-slate-900">
              {profile.completedLabs.length} <span className="text-xs text-slate-400 font-normal">solved</span>
            </h3>
            <p className="text-[11px] text-slate-500">Practice algorithms in compiler</p>
          </div>
          <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>

        {/* Stat 4 */}
        <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Placement Status</p>
            <h3 className="text-2xl font-bold text-slate-900">
              {profile.jobApplications.length > 0 ? profile.jobApplications[0].status : "No Active App"}
            </h3>
            <p className="text-[11px] text-slate-500">
              {profile.jobApplications.length > 0 ? `At ${profile.jobApplications[0].company}` : "Awaiting response"}
            </p>
          </div>
          <div className="h-10 w-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
            <ArrowUpRight className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Daily Digest Summary Card */}
      {(() => {
        const completedQuizIds = profile.completedQuizzes.map(q => q.id);
        const pendingQuizzes = initialQuizzes.filter(quiz => !completedQuizIds.includes(quiz.id));

        const getQuizDeadline = (quizId: string) => {
          switch (quizId) {
            case "quiz-1":
              return { date: "June 6, 2026", daysLeft: 2, priority: "High" };
            case "quiz-2":
              return { date: "June 9, 2026", daysLeft: 5, priority: "Medium" };
            case "quiz-3":
              return { date: "June 11, 2026", daysLeft: 7, priority: "Medium" };
            default:
              return { date: "June 14, 2026", daysLeft: 10, priority: "Low" };
          }
        };

        const getJobDeadline = (app: { company: string; role: string; status: string; date: string }) => {
          switch (app.status) {
            case "Applied":
              return {
                milestone: "Screener Review & Follow-up",
                deadline: "June 7, 2026",
                daysLeft: 3,
                action: "Review portfolio or complete sandbox coding labs to boost your visible profile stats.",
                priority: "Medium"
              };
            case "Shortlisted":
              return {
                milestone: "Technical Take-home Coding Test",
                deadline: "June 8, 2026",
                daysLeft: 4,
                action: "Solve the remaining Medium modules in LMS or practice in the Coding Arena.",
                priority: "High"
              };
            case "Interview Scheduled":
            case "Interview":
              return {
                milestone: "Live System Design & Screen",
                deadline: "June 10, 2026",
                daysLeft: 6,
                action: "Familiarize yourself with mock interview modules. Test your real-time responses under pressure.",
                priority: "High"
              };
            case "Selected":
              return {
                milestone: "Offer Documentation Signing",
                deadline: "June 12, 2026",
                daysLeft: 8,
                action: "Validate formal parameters & sign of contract documents before start date.",
                priority: "Medium"
              };
            default:
              return {
                milestone: "Review Next Steps",
                deadline: "June 15, 2026",
                daysLeft: 11,
                action: "Browse new jobs to keep options open.",
                priority: "Low"
              };
          }
        };

        const actionItemsCount = pendingQuizzes.length + profile.jobApplications.filter(app => app.status !== "Rejected").length;

        return (
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-50 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-900 text-base">Your Daily Digest</h4>
                    <span className="text-[10px] bg-indigo-600 text-white font-mono font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      June 4, 2026
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Overview of upcoming deadlines requiring your focus
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 self-start sm:self-auto">
                <span className="text-xs font-bold text-slate-500 font-mono bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">
                  ⚡ Action Items: {actionItemsCount}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Section 1: Job Applications */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-sky-50 text-sky-600 rounded-lg animate-pulse">
                    <Briefcase className="h-4 w-4" />
                  </span>
                  <h5 className="font-extrabold text-[11px] tracking-wider text-slate-400 uppercase font-mono">
                    Job Application Milestones
                  </h5>
                </div>

                {profile.jobApplications.length > 0 ? (
                  <div className="space-y-3">
                    {profile.jobApplications.map((app) => {
                      const deadlineDetails = getJobDeadline(app);
                      const isHigh = deadlineDetails.priority === "High";
                      
                      return (
                        <div key={app.id} className="p-3.5 rounded-xl border border-slate-50 bg-slate-50/20 hover:border-slate-100 transition space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div className="space-y-0.5">
                              <h6 className="text-xs font-bold text-slate-900 leading-tight">
                                {app.role} @ <strong className="font-extrabold text-slate-950">{app.company}</strong>
                              </h6>
                              <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                                <Clock className="h-3 w-3 inline text-slate-300" />
                                Status: <span className="font-black text-indigo-600">{app.status}</span>
                              </p>
                            </div>
                            <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-md ${
                              isHigh 
                                ? "bg-rose-50 text-rose-700 border border-rose-100" 
                                : "bg-amber-50 text-amber-700 border border-amber-100"
                            }`}>
                              {deadlineDetails.priority} Priority
                            </span>
                          </div>

                          <div className="pl-3 border-l-2 border-indigo-400/30 text-[11px] space-y-1 text-slate-600">
                            <p className="font-bold text-slate-800">
                              🎯 {deadlineDetails.milestone}
                            </p>
                            <p className="leading-relaxed text-slate-600 text-xs">
                              {deadlineDetails.action}
                            </p>
                            <p className="text-[10px] text-indigo-600 font-semibold mt-1">
                              Deadline: {deadlineDetails.deadline} ({deadlineDetails.daysLeft} days left)
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-6 rounded-xl border border-dashed border-slate-100 text-center space-y-2">
                    <p className="text-xs text-slate-400 italic">No active application milestones found.</p>
                    <button
                      onClick={() => setActiveTab("jobs")}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-700 hover:underline"
                    >
                      Explore job listings in portal
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}

                {profile.jobApplications.length > 0 && (
                  <button
                    onClick={() => setActiveTab("jobs")}
                    className="w-full text-center py-2 text-xs font-bold text-indigo-600 bg-indigo-50/40 hover:bg-indigo-50 transition rounded-xl flex items-center justify-center gap-1.5"
                  >
                    Go to Placement Board
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Section 2: Course Assessments */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg animate-pulse">
                    <CheckSquare className="h-4 w-4" />
                  </span>
                  <h5 className="font-extrabold text-[11px] tracking-wider text-slate-400 uppercase font-mono">
                    Pending Course Assessments
                  </h5>
                </div>

                {pendingQuizzes.length > 0 ? (
                  <div className="space-y-3">
                    {pendingQuizzes.map((quiz) => {
                      const deadline = getQuizDeadline(quiz.id);
                      const isHigh = deadline.priority === "High";

                      return (
                        <div key={quiz.id} className="p-3.5 rounded-xl border border-slate-50 bg-slate-50/20 hover:border-slate-100 transition space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div className="space-y-0.5">
                              <h6 className="text-xs font-bold text-slate-900 leading-tight">
                                {quiz.question.slice(0, 52)}...
                              </h6>
                              <p className="text-[10px] text-slate-400 mt-0.5">
                                Topic: <span className="font-semibold text-slate-500">Syllabus Core MCQ</span>
                              </p>
                            </div>
                            <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-md ${
                              isHigh 
                                ? "bg-rose-50 text-rose-700 border border-rose-100" 
                                : "bg-amber-50 text-amber-700 border border-amber-100"
                            }`}>
                              {deadline.priority} Priority
                            </span>
                          </div>

                          <div className="pl-3 border-l-2 border-emerald-400/30 text-[11px] space-y-1 text-slate-600">
                            <p className="font-bold text-slate-800">
                              📝 Course Assessment Quiz
                            </p>
                            <p className="leading-relaxed text-slate-600 text-xs">
                              Test your core ecosystem knowledge to unlock rewards. Correct answer yields +60 XP.
                            </p>
                            <p className="text-[10px] text-emerald-600 font-semibold mt-1">
                              Recommended Goal: {deadline.date} (In {deadline.daysLeft} days)
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-6 rounded-xl border border-dashed border-emerald-100 bg-emerald-50/10 text-center space-y-2">
                    <p className="text-xs font-bold text-emerald-800">🎉 Outstanding Work!</p>
                    <p className="text-[11px] text-slate-400 leading-normal font-medium">
                      You have completed all pending syllabus quizzes. Keep your mastery sharp with custom topics!
                    </p>
                    <button
                      onClick={() => setActiveTab("quizzes")}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-700 hover:underline"
                    >
                      Generate AI Quizzes
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}

                {pendingQuizzes.length > 0 && (
                  <button
                    onClick={() => setActiveTab("quizzes")}
                    className="w-full text-center py-2 text-xs font-bold text-emerald-600 bg-emerald-50/40 hover:bg-emerald-50 transition rounded-xl flex items-center justify-center gap-1.5"
                  >
                    Complete Pending Quizzes
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Daily Study & Habitat tracker */}
      <DailyGoalTracker />

      {/* Curriculum/Sequence Pathway Roadmap */}
      <SyllabusPathways profile={profile} courses={courses} setActiveTab={setActiveTab} />

      {/* Recommended for You Adaptive Section */}
      <div id="recommended-section" className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 font-mono uppercase tracking-wider">
              <Sparkles className="h-4 w-4 text-indigo-600" />
              <span>Recommended For You</span>
            </div>
            <h4 className="text-sm font-bold text-slate-900">Customized Learning Pathways</h4>
          </div>
          <span className="text-[10px] font-bold py-1 px-2.5 rounded-md bg-amber-500/10 text-amber-700 font-mono uppercase tracking-wide flex items-center gap-1">
            <Trophy className="h-3 w-3" />
            Level {currentLevel} Adaptive Suggestions
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {suggestions.map((item) => {
            const isLab = item.type === "lab";
            return (
              <div
                key={item.id}
                className="group relative flex flex-col justify-between p-5 rounded-2xl border border-slate-100 bg-white hover:-translate-y-0.5 hover:shadow-md transition-all duration-300"
              >
                <div className="space-y-3">
                  {/* Category and extra badge info */}
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center gap-1 text-[10px] uppercase font-bold py-1 px-2.5 rounded-full ${
                      isLab 
                        ? "bg-amber-50 text-amber-700 border border-amber-200/50" 
                        : "bg-blue-50 text-blue-700 border border-blue-200/50"
                    }`}>
                      {isLab ? <Code className="h-3 w-3" /> : <BookOpen className="h-3 w-3" />}
                      {item.category}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 font-mono">
                      {item.extra}
                    </span>
                  </div>

                  {/* Title and Short description */}
                  <div className="space-y-1">
                    <h5 className="font-bold text-slate-900 sm:text-base group-hover:text-indigo-600 transition-colors">
                      {item.title}
                    </h5>
                    <p className="text-xs text-slate-500 leading-relaxed font-normal">
                      {item.desc}
                    </p>
                  </div>

                  {/* Deep AI personal reason context */}
                  <div className="flex items-start gap-2 bg-indigo-50/40 p-3 rounded-xl border border-indigo-100/30 text-slate-600 text-[11px] leading-relaxed">
                    <Sparkles className="h-3.5 w-3.5 text-indigo-500 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-indigo-950 font-semibold">Tutor Advice:</strong> {item.reason}
                    </span>
                  </div>
                </div>

                {/* Jump to layout and execute path CTA */}
                <div className="pt-4 mt-2 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={() => setActiveTab(item.targetTab)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg text-white bg-slate-900 hover:bg-indigo-600 transition-all shadow-sm"
                  >
                    {isLab ? "Launch Workspace Lab" : "Resume Module Lessons"}
                    <ArrowUpRight className="h-3.5 w-3.5 stroke-[2.5]" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: XP Progression & Streak Calendar */}
        <div className="lg:col-span-2 space-y-6">
          {/* Level Progress Slider */}
          <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-slate-900">Current Level Milestones</h4>
                <p className="text-xs text-slate-500">Earn XP by finishing chapters, quiz scores, or sandbox tests</p>
              </div>
              <span className="text-xs font-bold text-slate-800">{profile.xp} / {nextLevelXp} XP</span>
            </div>
            <div className="relative h-3 w-full rounded-full bg-slate-100 overflow-hidden">
              <div
                className="absolute top-0 bottom-0 left-0 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-400 font-semibold uppercase">
              <span>LVL {currentLevel}</span>
              <span>{Math.round(progressPercent)}% completed of level</span>
              <span>LVL {currentLevel + 1}</span>
            </div>
          </div>

          {/* heatmap-style 'Study Calendar' visualization */}
          <StudyCalendar />

          {/* AI-Powered Smart Study Weekly Planner */}
          <SmartPlanner onTrackXp={onTrackXp} />

          {/* 7-Day Study Activity Recharts Bar Chart */}
          <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 font-mono uppercase tracking-wider">
                  <BarChart2 className="h-4 w-4 text-indigo-500" />
                  <span>Consistency Performance</span>
                </div>
                <h4 className="font-semibold text-slate-900 mt-0.5">7-Day Study Minutes Analytics</h4>
              </div>
              <span className="text-[10px] font-bold py-1 px-2.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/40 font-mono flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Target: 45 Min/Day
              </span>
            </div>
            
            <p className="text-xs text-slate-500 leading-normal">
              Consistent focus is the foundation of high-performance learning. Today's bar updates dynamically relative to active study logs!
            </p>

            <div className="h-[220px] w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="day" 
                    tickLine={false} 
                    axisLine={false} 
                    tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }}
                  />
                  <YAxis 
                    tickLine={false} 
                    axisLine={false} 
                    tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }}
                    unit="m"
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99, 102, 241, 0.03)', radius: 6 }} />
                  <ReferenceLine y={45} stroke="#10b981" strokeDasharray="4 4" strokeWidth={1} />
                  <Bar dataKey="minutes" radius={[4, 4, 0, 0]} maxBarSize={32}>
                    {chartData.map((entry, index) => {
                      const isGoalMet = entry.minutes >= 45;
                      let barColor = "#6366f1"; // indigo
                      if (entry.isToday) {
                        barColor = isGoalMet ? "#10b981" : "#818cf8";
                      } else if (isGoalMet) {
                        barColor = "#3b82f6"; // blue
                      } else {
                        barColor = "#cbd5e1"; // slate
                      }
                      return <Cell key={`cell-${index}`} fill={barColor} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Legends / Breakdown metrics */}
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 justify-center pt-2 border-t border-slate-50 text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wide">
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded bg-blue-500" />
                <span>Goal Met ({`>=`} 45m)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded bg-slate-300" />
                <span>Under Target</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded bg-emerald-500" />
                <span>Today (Meta-Habit)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Badges Collection & Placement Quick Track */}
        <div className="space-y-6">
          {/* Daily Quick skill-checking poll card */}
          <QuickPoll onTrackXp={onTrackXp} />

          {/* Badge Grid Collection */}
          <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-slate-900">Achievements & Badges</h4>
              <span className="text-xs font-bold text-blue-600 px-2 py-0.5 rounded-full bg-blue-50">
                {profile.badges.length} Unlocked
              </span>
            </div>
            <div className="space-y-3">
              {profile.badges.map((badge) => (
                <div key={badge.id} className="flex items-center space-x-3 p-3.5 rounded-xl border border-dashed border-slate-100 hover:border-slate-200 transition">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${badge.color}`}>
                    <Award className="h-5 w-5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">{badge.title}</h5>
                    <p className="text-[10px] text-slate-500 leading-normal">{badge.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Manual celebration test action */}
            <div className="pt-3 border-t border-slate-100/80">
              <button
                type="button"
                onClick={() => {
                  window.dispatchEvent(
                    new CustomEvent("celebrate_achievement", {
                      detail: {
                        title: "Achievement Celebration Test! 🌟",
                        subtitle: "You unlocked the high-fidelity confetti particles engine on the dashboard!",
                        type: "badge",
                      },
                    })
                  );
                }}
                className="w-full py-2 bg-slate-50 hover:bg-slate-100/80 text-slate-600 hover:text-slate-800 rounded-xl text-[10px] font-bold tracking-tight transition flex items-center justify-center gap-1.5 border border-slate-200/60 border-dashed"
              >
                <Sparkles className="h-3 w-3 text-amber-500 animate-pulse" />
                Trigger Celebration Preview
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
