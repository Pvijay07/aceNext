import React, { useState } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import { 
  Search, Bell, MessageSquare, Menu, X, 
  Home, BookOpen, Video, FileText, PlaySquare, 
  Book, Bot, Briefcase, Award, Settings, HelpCircle,
  Users, Layers, Calendar, BarChart, FileCheck, Target
} from "lucide-react";
import { UserProfile } from "../../types";

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: string;
  isNew?: boolean;
}

interface DashboardLayoutProps {
  role: string;
  profile: UserProfile | null;
  onLogout: () => void;
}

export default function DashboardLayout({ role, profile, onLogout }: DashboardLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Define Nav items based on role
  let navItems: NavItem[] = [];

  if (role === "admin") {
    navItems = [
      { id: "dashboard", label: "Dashboard", icon: <Home className="w-5 h-5" /> },
      { id: "courses", label: "Courses", icon: <BookOpen className="w-5 h-5" /> },
      { id: "modules", label: "Modules", icon: <Layers className="w-5 h-5" /> },
      { id: "students", label: "Students", icon: <Users className="w-5 h-5" /> },
      { id: "batches", label: "Batches", icon: <Calendar className="w-5 h-5" /> },
      { id: "faculty", label: "Faculty", icon: <Briefcase className="w-5 h-5" /> },
      { id: "packages", label: "Add-on Packages", icon: <Award className="w-5 h-5" /> },
    ];
  } else if (role === "faculty") {
    navItems = [
      { id: "dashboard", label: "Dashboard", icon: <Home className="w-5 h-5" /> },
      { id: "attendance", label: "Attendance", icon: <FileCheck className="w-5 h-5" /> },
      { id: "lessons", label: "Lessons & Course", icon: <BookOpen className="w-5 h-5" /> },
      { id: "practicals", label: "Practicals & Tasks", icon: <FileText className="w-5 h-5" /> },
      { id: "students", label: "Students", icon: <Users className="w-5 h-5" /> },
      { id: "mock-interviews", label: "Mock Interviews", icon: <Target className="w-5 h-5" /> },
      { id: "classes", label: "Classes & Zoom", icon: <Video className="w-5 h-5" /> },
    ];
  } else {
    // Default Student
    navItems = [
      { id: "dashboard", label: "Dashboard", icon: <Home className="w-5 h-5" /> },
      { id: "lms", label: "My Courses", icon: <BookOpen className="w-5 h-5" /> },
      { id: "classes", label: "Live Classes", icon: <Video className="w-5 h-5" /> },
      { id: "quizzes", label: "Assignments", icon: <FileText className="w-5 h-5" /> },
      { id: "recordings", label: "Recordings", icon: <PlaySquare className="w-5 h-5" /> },
      { id: "labs", label: "Project Labs", icon: <Book className="w-5 h-5" /> },
      { id: "interview", label: "Mock Interviews", icon: <Target className="w-5 h-5" /> },
      { id: "tutor", label: "AI Assistant", icon: <Bot className="w-5 h-5" />, isNew: true },
      { id: "jobs", label: "Job Portal", icon: <Briefcase className="w-5 h-5" /> },
      { id: "resume", label: "My Profile", icon: <Users className="w-5 h-5" /> },
    ];
  }

  const bottomNavItems = [
    { id: "settings", label: "Settings", icon: <Settings className="w-5 h-5" /> },
    { id: "help", label: "Help & Support", icon: <HelpCircle className="w-5 h-5" /> },
  ];

  const handleNavClick = (path: string) => {
    navigate(`/${role}/${path}`);
    setMobileMenuOpen(false);
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Sidebar (Desktop) */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0B1120] border-r border-slate-800 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-800/50">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 text-white p-1.5 rounded-lg">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">AceNext</span>
          </div>
          <button onClick={() => setMobileMenuOpen(false)} className="lg:hidden text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1 custom-scrollbar">
          {navItems.map((item) => {
            const isActive = location.pathname.includes(`/${role}/${item.id}`) || (location.pathname === `/${role}` && item.id === 'dashboard');
            return (
              <Link
                key={item.id}
                to={`/${role}/${item.id}`}
                onClick={() => setMobileMenuOpen(false)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive 
                    ? "bg-blue-600 text-white shadow-sm" 
                    : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
                }`}
              >
                <div className={`${isActive ? "text-white" : "text-slate-500 group-hover:text-white"} transition-colors`}>
                  {item.icon}
                </div>
                {item.label}
                {item.badge && (
                  <span className="ml-auto bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
                {item.isNew && (
                  <span className="ml-auto bg-emerald-100 text-emerald-700 text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                    New
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-slate-800/50 space-y-1">
          {bottomNavItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-slate-800/50 hover:text-white transition-colors group"
            >
              <div className="text-slate-500 group-hover:text-white transition-colors">
                {item.icon}
              </div>
              {item.label}
            </button>
          ))}
          
          {role === "student" && (
            <div className="pt-4 mt-2">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl p-4 text-white relative overflow-hidden">
                <div className="absolute -top-4 -right-4 w-16 h-16 bg-white/10 rounded-full blur-xl"></div>
                <h4 className="font-bold text-sm mb-1 relative z-10">Upgrade Your Skills</h4>
                <p className="text-xs text-blue-100 mb-3 relative z-10">Explore new courses and boost your career.</p>
                <button className="bg-white text-blue-600 text-xs font-bold py-2 px-3 rounded-lg w-full shadow-sm hover:bg-slate-50 transition relative z-10">
                  Browse Courses
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-4 sm:px-6 lg:px-8 z-40">
          <div className="flex items-center gap-4 flex-1">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            <div className="hidden sm:flex items-center max-w-md w-full relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3" />
              <input 
                type="text" 
                placeholder="Search for courses, classes, assignments..." 
                className="w-full pl-10 pr-4 py-2 bg-slate-100/50 border-none rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-5">
            <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border border-white"></span>
            </button>
            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition">
              <MessageSquare className="w-5 h-5" />
            </button>
            
            <div className="h-8 w-px bg-slate-200 mx-1 hidden sm:block"></div>
            
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-bold text-slate-900 leading-none">{profile?.name || "User"}</span>
                <span className="text-[11px] text-slate-500 font-medium capitalize mt-0.5">{role}</span>
              </div>
              <button onClick={onLogout} className="relative group cursor-pointer">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold shadow-sm ring-2 ring-white">
                  {profile?.name ? profile.name.charAt(0).toUpperCase() : "U"}
                </div>
                <div className="absolute top-10 right-0 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  Click to Logout
                </div>
              </button>
            </div>
          </div>
        </header>

        {/* Main Scrolling Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
