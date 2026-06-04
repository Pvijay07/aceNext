import React, { useState, useEffect, useRef } from "react";
import { BookOpen, Trophy, Sparkles, User, BrainCircuit, Clock, Timer, X, Award, Globe, ChevronDown, Eye } from "lucide-react";
import { UserProfile } from "../types";

interface HeaderProps {
  profile: UserProfile;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  role: string;
  setRole: (role: "student" | "admin") => void;
  focusMode: boolean;
  setFocusMode: (val: boolean) => void;
}

type Language = "en" | "es" | "fr" | "de";

const languagesList = [
  { code: "en" as Language, label: "English", flag: "🇺🇸" },
  { code: "es" as Language, label: "Español", flag: "🇪🇸" },
  { code: "fr" as Language, label: "Français", flag: "🇫🇷" },
  { code: "de" as Language, label: "Deutsch", flag: "🇩🇪" }
];

const translations: Record<Language, Record<string, string>> = {
  en: {
    dashboard: "Dashboard",
    lms: "LMS Lessons",
    tutor: "AI Tutor",
    coding: "Coding Arena",
    quizzes: "Quizzes",
    labs: "Project Labs",
    resume: "Resume Builder",
    interview: "Mock Interview",
    jobs: "Jobs",
    xp: "XP",
    level: "Level",
    studentView: "Student View",
    adminView: "Admin View",
    liveSession: "Live Session",
    workspaceSessionCompleted: "Workspace Session Completed",
    timeFocused: "Time Focused",
    simulatedBoost: "Simulated Boost",
    focusedEfforts: "Focused efforts stimulate active retention and technical expertise. Protect your learning streak and unlock new application milestones!",
    done: "Done"
  },
  es: {
    dashboard: "Tablero",
    lms: "Lecciones LMS",
    tutor: "Tutor de IA",
    coding: "Arena de Código",
    quizzes: "Cuestionarios",
    labs: "Laboratorios",
    resume: "Currículum",
    interview: "Entrevista Simulada",
    jobs: "Empleos",
    xp: "XP",
    level: "Nivel",
    studentView: "Vista Estudiante",
    adminView: "Vista de administrador",
    liveSession: "Sesión en Vivo",
    workspaceSessionCompleted: "Sesión de Espacio de Trabajo Completada",
    timeFocused: "Tiempo de Enfoque",
    simulatedBoost: "Impulso Simulado",
    focusedEfforts: "Los esfuerzos concentrados estimulan la retención activa y la experiencia técnica. ¡Proteja su racha de aprendizaje!",
    done: "Hecho"
  },
  fr: {
    dashboard: "Tableau de Bord",
    lms: "Cours LMS",
    tutor: "Tuteur IA",
    coding: "Arène de Code",
    quizzes: "Quiz",
    labs: "Labos de Projet",
    resume: "Créateur de CV",
    interview: "Entretien Fictif",
    jobs: "Emplois",
    xp: "XP",
    level: "Niveau",
    studentView: "Vue Étudiant",
    adminView: "Vue Admin",
    liveSession: "Session en Direct",
    workspaceSessionCompleted: "Session d'Espace de Travail Terminée",
    timeFocused: "Temps Concentré",
    simulatedBoost: "Boost Simulé",
    focusedEfforts: "Les efforts concentrés stimulent la rétention active et l'expertise technique. Protégez votre série d'apprentissage!",
    done: "Terminé"
  },
  de: {
    dashboard: "Dashboard",
    lms: "LMS Lektionen",
    tutor: "KI-Tutor",
    coding: "Coding-Arena",
    quizzes: "Quiz",
    labs: "Projektlabore",
    resume: "Lebenslauf-Builder",
    interview: "Mock-Interview",
    jobs: "Jobs",
    xp: "EP",
    level: "Stufe",
    studentView: "Studentenansicht",
    adminView: "Adminansicht",
    liveSession: "Live-Sitzung",
    workspaceSessionCompleted: "Arbeitsbereich-Sitzung abgeschlossen",
    timeFocused: "Fokus-Zeit",
    simulatedBoost: "Simulierter Boost",
    focusedEfforts: "Fokussierte Bemühungen fördern das aktive Behalten und das technische Fachwissen. Schütze deine Lernsträhne!",
    done: "Fertig"
  }
};

export default function Header({ profile, activeTab, setActiveTab, role, setRole }: HeaderProps) {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem("selected_platform_language") as Language;
    return (saved && translations[saved]) ? saved : "en";
  });

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const changeLanguage = (newLang: Language) => {
    setLanguage(newLang);
    localStorage.setItem("selected_platform_language", newLang);
    window.dispatchEvent(new CustomEvent("platformLanguageChange", { detail: newLang }));
    setDropdownOpen(false);
  };

  const t = translations[language];

  const tabs = [
    { id: "dashboard", label: t.dashboard },
    { id: "lms", label: t.lms },
    { id: "tutor", label: t.tutor },
    { id: "coding", label: t.coding },
    { id: "quizzes", label: t.quizzes },
    { id: "labs", label: t.labs },
    { id: "resume", label: t.resume },
    { id: "interview", label: t.interview },
    { id: "jobs", label: t.jobs },
  ];

  // Active study session timer states
  const [seconds, setSeconds] = useState(0);
  const secondsRef = useRef(0);
  const [activeTracking, setActiveTracking] = useState<string | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [summaryData, setSummaryData] = useState<{
    tabName: string;
    durationSeconds: number;
    xpReward: number;
  } | null>(null);

  // Sync ref with states to read most instant stopwatch values on activeTab transition events
  useEffect(() => {
    secondsRef.current = seconds;
  }, [seconds]);

  // Ticks when in LMS Lessons or Coding Arena
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    const isTracking = activeTab === "lms" || activeTab === "coding";

    if (isTracking) {
      setActiveTracking(activeTab);
      setSeconds(0);
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setActiveTracking(null);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeTab]);

  // Hook to detect tab switch out of active workspace
  const prevTabRef = useRef(activeTab);
  useEffect(() => {
    const prevTab = prevTabRef.current;
    const wasTracking = prevTab === "lms" || prevTab === "coding";

    if (wasTracking && activeTab !== prevTab) {
      const elapsed = secondsRef.current;
      if (elapsed > 0) {
        const tabLabel = prevTab === "lms" ? t.lms : t.coding;
        setSummaryData({
          tabName: tabLabel,
          durationSeconds: elapsed,
          xpReward: Math.min(25, Math.ceil(elapsed / 12) * 2)
        });
        setShowSummary(true);
      }
    }
    prevTabRef.current = activeTab;
  }, [activeTab, language]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  return (
    <header id="app-header" className="sticky top-0 z-40 w-full border-b border-slate-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl h-16 items-center justify-between px-4 sm:px-6">
        {/* Logo and Name */}
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20">
            <BrainCircuit className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-1.5">
              AceNext <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">AI Platform</span>
            </h1>
          </div>
        </div>

        {/* Stats Summary & Live Study stopwatch */}
        <div className="hidden md:flex items-center space-x-6 text-sm text-slate-600">
          {activeTracking && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-600 border border-red-100/50 text-xs font-bold font-mono animate-pulse">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
              <Clock className="h-3.5 w-3.5 text-red-500 shrink-0" />
              <span className="uppercase text-[9px] tracking-wider text-red-500">{t.liveSession}:</span>
              <span>{formatTime(seconds)}</span>
            </div>
          )}

          <div className="flex items-center space-x-1.5">
            <Trophy className="h-4 w-4 text-amber-500" />
            <span className="font-semibold text-slate-800">{profile.xp}</span> <span>{t.xp}</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <Sparkles className="h-4 w-4 text-indigo-500 animate-pulse" />
            <span className="font-semibold text-slate-800">
              {profile.streak} {language === "es" ? "Días racha" : language === "fr" ? "Jours de série" : language === "de" ? "Tage Strähne" : "Days Streak"}
            </span>
          </div>
          <div className="flex items-center space-x-1 rounded-lg bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700">
            <span>{t.level} {Math.floor(profile.xp / 500) + 1}</span>
          </div>
        </div>

        {/* Right Switchers */}
        <div className="flex items-center space-x-4">
          {/* Language Switcher Dropdown */}
          <div ref={dropdownRef} className="relative z-50">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              type="button"
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition"
              title="Change Language / Cambiar Idioma"
            >
              <Globe className="h-3.5 w-3.5 text-slate-500" />
              <span className="uppercase font-mono">{languagesList.find(l => l.code === language)?.code}</span>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-40 bg-white border border-slate-200 rounded-xl shadow-xl p-1 animate-fade-in divide-y divide-slate-100 space-y-1">
                <div className="px-2.5 py-1 text-[9px] font-bold text-slate-400 font-mono uppercase tracking-wider">
                  Language
                </div>
                <div className="pt-1.5 space-y-0.5">
                  {languagesList.map((lang) => {
                    const isActive = lang.code === language;
                    return (
                      <button
                        key={lang.code}
                        onClick={() => changeLanguage(lang.code)}
                        type="button"
                        className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg flex items-center justify-between transition-colors ${
                          isActive
                            ? "bg-slate-900 text-white font-bold"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium"
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          <span className="text-sm leading-none">{lang.flag}</span>
                          <span>{lang.label}</span>
                        </span>
                        {isActive && <span className="text-[10px] text-emerald-500 font-bold">✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => setFocusMode(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-indigo-50 border border-indigo-100 rounded-xl hover:bg-indigo-100/50 hover:text-indigo-900 transition shadow-sm font-sans"
            title="Slink into minimalist deep-focus workspace"
          >
            <Eye className="h-3.5 w-3.5 text-indigo-600 animate-pulse" />
            <span className="hidden sm:inline">Focus Mode</span>
          </button>

          <div className="flex rounded-lg bg-slate-100 p-0.5 text-xs">
            <button
              onClick={() => setRole("student")}
              className={`rounded-md px-3 py-1 font-medium transition ${
                role === "student" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              {t.studentView}
            </button>
            <button
              onClick={() => setRole("admin")}
              className={`rounded-md px-3 py-1 font-medium transition ${
                role === "admin" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              {t.adminView}
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <div className="hidden sm:block text-right">
              <p className="text-xs font-semibold text-slate-900">{profile.name}</p>
              <p className="text-[10px] text-slate-500 uppercase">{profile.role}</p>
            </div>
            <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center border-2 border-white shadow-sm">
              <User className="h-4 w-4 text-blue-700" />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-bar */}
      <div className="w-full bg-slate-50/50 border-t border-slate-100 overflow-x-auto">
        <div className="mx-auto flex max-w-7xl px-4 sm:px-6 py-2 gap-1 min-w-max items-center justify-between">
          <div className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                {tab.label}
                {tab === tabs.find(t => t.id === "tutor") && (
                  <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-indigo-500" />
                )}
              </button>
            ))}
          </div>

          {/* Mobile indicator layout */}
          {activeTracking && (
            <div className="md:hidden flex items-center gap-1.5 px-3 py-1 rounded bg-red-50 text-red-600 text-[11px] font-bold font-mono">
              <Clock className="h-3 w-3 animate-spin text-red-500" />
              <span>{formatTime(seconds)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Session Summary Modal Dialog */}
      {showSummary && summaryData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-white rounded-2xl border border-slate-100 p-6 shadow-2xl relative overflow-hidden space-y-4">
            {/* Slide decorative gradient line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-indigo-500 to-emerald-500" />
            
            <button
              type="button"
              onClick={() => setShowSummary(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition"
              title="Close summary"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="space-y-4 text-center">
              <div className="mx-auto h-12 w-12 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                <Timer className="h-6 w-6 text-indigo-600" />
              </div>

              <div className="space-y-1">
                <p className="text-[10px] font-black tracking-widest text-indigo-500 font-mono uppercase">
                  {t.workspaceSessionCompleted}
                </p>
                <h3 className="text-base font-black text-slate-950">
                  {summaryData.tabName} {language === 'es' ? 'Sesión' : language === 'fr' ? 'Session' : language === 'de' ? 'Sitzung' : 'Session'}
                </h3>
              </div>

              <div className="py-4 px-3 bg-slate-50 border border-slate-100 rounded-xl grid grid-cols-2 gap-3 text-center">
                <div className="space-y-0.5 border-r border-slate-200/60">
                  <span className="text-[9px] uppercase font-bold text-slate-400 font-mono">
                    {t.timeFocused}
                  </span>
                  <p className="text-sm font-black text-slate-900 font-mono">
                    {formatTime(summaryData.durationSeconds)}
                  </p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[9px] uppercase font-bold text-slate-400 font-mono">
                    {t.simulatedBoost}
                  </span>
                  <p className="text-sm font-black text-emerald-600 font-mono flex items-center justify-center gap-0.5">
                    +{summaryData.xpReward} {t.xp || "XP"}
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed font-normal">
                {t.focusedEfforts}
              </p>

              <button
                type="button"
                onClick={() => setShowSummary(false)}
                className="w-full py-2.5 bg-slate-950 text-white hover:bg-slate-800 transition duration-200 text-xs font-bold rounded-xl shadow-md cursor-pointer select-none"
              >
                {t.done}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
