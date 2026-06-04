import { useState, useEffect, useRef } from "react";
import Header from "./components/Header";
import Dashboard from "./components/Dashboard";
import LMSPanel from "./components/LMSPanel";
import TutorBot from "./components/TutorBot";
import CodingArena from "./components/CodingArena";
import Assessments from "./components/Assessments";
import ProjectLabsPanel from "./components/ProjectLabsPanel";
import ResumeSpecs from "./components/ResumeSpecs";
import MockInterviewArena from "./components/MockInterviewArena";
import JobPortal from "./components/JobPortal";
import AdminPanel from "./components/AdminPanel";
import ConfettiCelebration from "./components/ConfettiCelebration";
import { Clock, X } from "lucide-react";

import { initialCourses, mockChallenges, initialQuizzes, projectLabs, mockJobsList } from "./data";
import { UserProfile, Course } from "./types";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [role, setRole] = useState<"student" | "admin">("student");
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  
  // Minimalist Focus Mode variables
  const [focusMode, setFocusMode] = useState<boolean>(() => {
    return localStorage.getItem("platform_focus_mode") === "true";
  });
  const [focusSeconds, setFocusSeconds] = useState<number>(0);

  useEffect(() => {
    let interval: any = null;
    if (focusMode) {
      interval = setInterval(() => {
        setFocusSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setFocusSeconds(0);
    }
    return () => clearInterval(interval);
  }, [focusMode]);

  const handleToggleFocusMode = (val: boolean) => {
    setFocusMode(val);
    localStorage.setItem("platform_focus_mode", String(val));
    
    // Switch to active learning tab if currently on a dashboard/jobs
    if (val && (activeTab === "dashboard" || activeTab === "jobs")) {
      setActiveTab("lms");
    }

    // Trigger sweet visual celebration response
    window.dispatchEvent(
      new CustomEvent("celebrate_achievement", {
        detail: {
          title: val ? "Zen Focus Engaged! 🧘" : "Focus Mode Ended ☕",
          subtitle: val 
            ? "Header navigation and sidebars are now hidden. Enjoy a minimalist, distraction-free view."
            : "Reverted to full workspace navigation view.",
          type: "score"
        }
      })
    );
  };

  const formatFocusDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Sync profile metadata with severe db server endpoint
  const [profile, setProfile] = useState<UserProfile>({
    id: "student-1",
    name: "Vijay Kumar",
    email: "vijay.infasta@gmail.com",
    role: "student",
    xp: 1450,
    streak: 5,
    badges: [
      { id: "b1", title: "Swift Coder", icon: "Zap", desc: "Completed 5 coding problems correctly", color: "text-amber-500 bg-amber-50" },
      { id: "b2", title: "Problem Solver", icon: "Award", desc: "First perfect assessment score", color: "text-blue-500 bg-blue-50" },
      { id: "b3", title: "Curious Mind", icon: "BookOpen", desc: "Asked 10 questions to the AI Tutor", color: "text-emerald-500 bg-emerald-50" }
    ],
    completedLessons: ["l1", "l2"],
    completedLabs: [],
    completedQuizzes: [],
    jobApplications: [
      { id: "app-1", company: "Google", role: "Frontend Developer Intern", status: "Applied", date: "2026-06-01" },
      { id: "app-2", company: "Stripe", role: "Junior Software Engineer", status: "Shortlisted", date: "2026-06-03" }
    ]
  });

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/auth/profile");
      const data = await response.json();
      if (data && data.name) {
        setProfile(data);
      }
    } catch (e) {
      console.warn("Express server profile fetching offline, using state-backed mock engine.", e);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Celebrate newly unlocked badges automatically
  const prevBadgesLength = useRef<number>(profile.badges.length);
  useEffect(() => {
    if (profile.badges.length > prevBadgesLength.current) {
      const newlyAddedBadge = profile.badges[profile.badges.length - 1];
      if (newlyAddedBadge) {
        window.dispatchEvent(
          new CustomEvent("celebrate_achievement", {
            detail: {
              title: `Badge Unlocked: ${newlyAddedBadge.title}! 🏆`,
              subtitle: newlyAddedBadge.desc,
              type: "badge",
            },
          })
        );
      }
    }
    prevBadgesLength.current = profile.badges.length;
  }, [profile.badges]);

  const handleTrackProgress = async (lessonId?: string, quizId?: string, score?: number, labId?: string, xpGained?: number) => {
    // 1. Instantly update UI State eagerly
    setProfile((prev) => {
      const updatedLessons = lessonId && !prev.completedLessons.includes(lessonId) 
        ? [...prev.completedLessons, lessonId] 
        : prev.completedLessons;

      let updatedQuizzes = prev.completedQuizzes;
      if (quizId && score !== undefined) {
        const idx = prev.completedQuizzes.findIndex(q => q.id === quizId);
        if (idx >= 0) {
          const clone = [...prev.completedQuizzes];
          clone[idx].score = Math.max(clone[idx].score, score);
          updatedQuizzes = clone;
        } else {
          updatedQuizzes = [...prev.completedQuizzes, { id: quizId, score }];
        }
      }

      const updatedLabs = labId && !prev.completedLabs.includes(labId) 
        ? [...prev.completedLabs, labId] 
        : prev.completedLabs;

      const updatedXp = prev.xp + (xpGained || 0);

      const updatedBadges = [...prev.badges];
      if (updatedXp >= 1800 && !updatedBadges.some(b => b.id === "b4")) {
        updatedBadges.push({
          id: "b4",
          title: "Elite Scholar",
          icon: "ShieldAlert",
          desc: "Exceeded 1,800 total lifetime study experience points",
          color: "text-purple-500 bg-purple-50"
        });
      }

      return {
        ...prev,
        completedLessons: updatedLessons,
        completedQuizzes: updatedQuizzes,
        completedLabs: updatedLabs,
        xp: updatedXp,
        badges: updatedBadges
      };
    });

    // 2. Synchronize with stable DB Server Endpoint
    try {
      const response = await fetch("/api/student/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId, quizId, score, labId, xpGained })
      });
      const data = await response.json();
      if (data && data.profile) {
        setProfile(data.profile);
      }
    } catch (e) {
      console.error("Local sync success only. Express API not yet completed.", e);
    }
  };

  const handleApplyJob = async (company: string, roleTitle: string) => {
    // 1. update state
    const newApp = {
      id: `app-${Date.now()}`,
      company,
      role: roleTitle,
      status: "Applied",
      date: new Date().toISOString().split('T')[0]
    };

    setProfile((prev) => ({
      ...prev,
      jobApplications: [newApp, ...prev.jobApplications]
    }));

    // 2. sync with server
    try {
      const response = await fetch("/api/student/apply-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company, role: roleTitle })
      });
      const data = await response.json();
      if (data && data.profile) {
        setProfile(data.profile);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateJobStatus = async (jobId: string, status: string) => {
    setProfile((prev) => {
      const cloneApps = prev.jobApplications.map((app) => 
        app.id === jobId ? { ...app, status } : app
      );
      return {
        ...prev,
        jobApplications: cloneApps
      };
    });

    try {
      const response = await fetch("/api/student/update-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, status })
      });
      const data = await response.json();
      if (data && data.profile) {
        setProfile(data.profile);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddCourse = (newCourse: Course) => {
    setCourses((prev) => [newCourse, ...prev]);
  };

  const renderActiveTabContent = () => {
    if (role === "admin") {
      return <AdminPanel courses={courses} onAddCourse={handleAddCourse} />;
    }

    switch (activeTab) {
      case "dashboard":
        return (
          <Dashboard
            profile={profile}
            courses={courses}
            setActiveTab={setActiveTab}
            onTrackXp={(xpVal) => handleTrackProgress(undefined, undefined, undefined, undefined, xpVal)}
          />
        );
      case "lms":
        return (
          <LMSPanel
            courses={courses}
            profile={profile}
            focusMode={focusMode}
            onTrackProgress={(lesId, xpVal) => handleTrackProgress(lesId, undefined, undefined, undefined, xpVal)}
          />
        );
      case "tutor":
        return <TutorBot profile={profile} courses={courses} focusMode={focusMode} onTrackXp={(xpVal) => handleTrackProgress(undefined, undefined, undefined, undefined, xpVal)} />;
      case "coding":
        return (
          <CodingArena
            challenges={mockChallenges}
            profile={profile}
            focusMode={focusMode}
            onTrackProgress={(chalId, xpVal) => handleTrackProgress(undefined, undefined, undefined, chalId, xpVal)}
          />
        );
      case "quizzes":
        return (
          <Assessments
            initialQuizzes={initialQuizzes}
            profile={profile}
            focusMode={focusMode}
            onTrackProgress={(quizId, scoreVal, xpVal) => handleTrackProgress(undefined, quizId, scoreVal, undefined, xpVal)}
          />
        );
      case "labs":
        return (
          <ProjectLabsPanel
            labs={projectLabs}
            profile={profile}
            focusMode={focusMode}
            onTrackProgress={(labId, xpVal) => handleTrackProgress(undefined, undefined, undefined, labId, xpVal)}
          />
        );
      case "resume":
        return <ResumeSpecs profile={profile} focusMode={focusMode} onTrackXp={(xpVal) => handleTrackProgress(undefined, undefined, undefined, undefined, xpVal)} />;
      case "interview":
        return <MockInterviewArena profile={profile} focusMode={focusMode} onTrackXp={(xpVal) => handleTrackProgress(undefined, undefined, undefined, undefined, xpVal)} />;
      case "jobs":
        return (
          <JobPortal
            jobs={mockJobsList}
            profile={profile}
            onApply={handleApplyJob}
            onUpdateStatus={handleUpdateJobStatus}
          />
        );
      default:
        return (
          <Dashboard
            profile={profile}
            courses={courses}
            setActiveTab={setActiveTab}
            onTrackXp={(xpVal) => handleTrackProgress(undefined, undefined, undefined, undefined, xpVal)}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/30 flex flex-col antialiased selection:bg-blue-100 selection:text-blue-900 leading-normal text-slate-800">
      {/* Confetti Celebration Particle Layer & Toast */}
      <ConfettiCelebration />

      {/* Minimalism Focus Mode Sticky Top Bar */}
      {focusMode ? (
        <div id="zen-focus-bar" className="sticky top-0 z-50 w-full border-b border-indigo-950/20 bg-indigo-950 text-white shadow-lg shadow-indigo-950/10">
          <div className="mx-auto flex max-w-7xl h-14 items-center justify-between px-4 sm:px-6">
            <div className="flex items-center space-x-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600/90 text-white text-sm shadow-inner animate-pulse">
                🧘
              </span>
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2.5">
                <h2 className="text-xs font-black tracking-widest text-indigo-200 uppercase font-mono">
                  AceNext Zen Focus
                </h2>
                <span className="flex items-center gap-1.5 text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Deep-Focus Session
                </span>
              </div>
            </div>

            {/* Current Lesson/Module Details */}
            <div className="hidden md:flex items-center space-x-2 text-xs font-semibold text-indigo-200">
              <span className="text-[9px] tracking-wider text-indigo-400 font-mono uppercase bg-indigo-900/60 px-2 py-1 rounded">
                Active Zone:
              </span>
              <span className="text-white capitalize">
                {activeTab === "lms" ? "LMS Lessons" : activeTab === "tutor" ? "AI Tutor Bot" : activeTab === "coding" ? "Coding Arena Playground" : activeTab === "quizzes" ? "Syllabus Assessments" : activeTab === "labs" ? "Project Simulation Labs" : activeTab === "resume" ? "AI Resume Builder" : activeTab === "interview" ? "Mock Interview Arena" : activeTab}
              </span>
            </div>

            {/* Session Stats, Timer and End Action */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-900/60 border border-indigo-800 text-xs font-bold font-mono">
                <Clock className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
                <span className="text-emerald-400 font-black">{formatFocusDuration(focusSeconds)}</span>
              </div>
              
              <button
                type="button"
                onClick={() => handleToggleFocusMode(false)}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 border border-rose-500 hover:scale-[1.02] active:scale-[0.98] text-white font-bold rounded-lg text-xs tracking-wide transition flex items-center gap-1 cursor-pointer shadow-md shadow-rose-600/10"
                title="Exit distraction-free workspace"
              >
                <span>Exit Focus</span>
                <X className="h-3 w-3 stroke-[2.5]" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* App Header */
        <Header
          profile={profile}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          role={role}
          setRole={setRole}
          focusMode={focusMode}
          setFocusMode={handleToggleFocusMode}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 py-8">
        {renderActiveTabContent()}
      </main>

      {/* Footer */}
      {!focusMode && (
        <footer className="w-full bg-white border-t border-slate-100 py-6 text-center text-[11px] text-slate-400 font-medium">
          <p>© 2026 AceNext Learning Systems Inc. All rights reserved. Made securely behind sandboxed cloud gateways.</p>
        </footer>
      )}
    </div>
  );
}
