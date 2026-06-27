import { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { Clock } from "lucide-react";

// Shared
import ConfettiCelebration from "./components/shared/ConfettiCelebration";
import AuthScreen from "./pages/auth/AuthScreen";
import DashboardLayout from "./layouts/DashboardLayout";

// Admin
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminCourses from "./pages/admin/AdminCourses";
import AdminStudents from "./pages/admin/AdminStudents";
import AdminModules from "./pages/admin/AdminModules";
import AdminBatches from "./pages/admin/AdminBatches";
import AdminFaculty from "./pages/admin/AdminFaculty";
import AdminPackages from "./pages/admin/AdminPackages";
import AdminSettings from "./pages/admin/AdminSettings";

// Faculty
import FacultyOverview from "./pages/faculty/FacultyOverview";
import FacultyLessons from "./pages/faculty/FacultyLessons";
import FacultyEvaluation from "./pages/faculty/FacultyEvaluation";
import FacultyZoom from "./pages/faculty/FacultyZoom";

// Coordinator
import CoordinatorDashboard from "./pages/coordinator/CoordinatorDashboard";
import BatchManagement from "./pages/coordinator/BatchManagement";
import CoordinatorStudents from "./pages/coordinator/CoordinatorStudents";
import CoordinatorAttendance from "./pages/coordinator/CoordinatorAttendance";
import CoordinatorReports from "./pages/coordinator/CoordinatorReports";
import CoordinatorCounseling from "./pages/coordinator/CoordinatorCounseling";
import CoordinatorSettings from "./pages/coordinator/CoordinatorSettings";

// Student
import Dashboard from "./pages/student/Dashboard";
import LMSPanel from "./pages/student/LMSPanel";
import LiveClassesList from "./pages/student/LiveClassesList";
import TutorBot from "./pages/student/TutorBot";
import CodingArena from "./pages/student/CodingArena";
import Assessments from "./pages/student/Assessments";
import ProjectLabsPanel from "./pages/student/ProjectLabsPanel";
import ResumeSpecs from "./pages/student/ResumeSpecs";
import MockInterviewArena from "./pages/student/MockInterviewArena";
import JobPortal from "./pages/student/JobPortal";


// Data & Types
import { initialCourses, mockChallenges, initialQuizzes, projectLabs, mockJobsList } from "./data";
import { UserProfile, Course, QuizQuestion, JobItem } from "./types";
import { api } from "./api";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("access_token"));
  const [isInitializing, setIsInitializing] = useState(!!localStorage.getItem("access_token"));
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [quizzes, setQuizzes] = useState<QuizQuestion[]>(initialQuizzes);
  const [jobsList, setJobsList] = useState<JobItem[]>(mockJobsList);
  
  // Minimalist Focus Mode variables
  const [focusMode, setFocusMode] = useState<boolean>(() => {
    return localStorage.getItem("platform_focus_mode") === "true";
  });
  
  const navigate = useNavigate();

  const handleToggleFocusMode = (val: boolean) => {
    setFocusMode(val);
    localStorage.setItem("platform_focus_mode", String(val));

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

  useEffect(() => {
    if (isAuthenticated) {
      setIsInitializing(true);
      fetchProfile();
    } else {
      setIsInitializing(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const handleAuthError = () => {
      handleLogout();
    };
    window.addEventListener("auth_error", handleAuthError);
    return () => window.removeEventListener("auth_error", handleAuthError);
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await api.get("/user");
      if (data && data.name) {
        const rawRole = typeof data.role === 'string' ? data.role.toLowerCase() : (data.role?.name?.toLowerCase() || "student");
        let normalizedRole = rawRole;
        
        // Normalize coordinator roles
        if (rawRole.includes("coordinator") || rawRole.includes("co-ordinator")) {
          normalizedRole = "coordinator";
        }

        setProfile({
          id: data.id.toString(),
          name: data.name,
          email: data.email,
          role: normalizedRole,
          xp: data.xp || 0,
          streak: data.profile?.streak || 0,
          badges: [],
          completedLessons: [],
          completedLabs: [],
          completedQuizzes: [],
          jobApplications: []
        });
      }
    } catch (err) {
      console.error(err);
      handleLogout();
    } finally {
      setIsInitializing(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    setIsAuthenticated(false);
    setProfile(null);
    setIsInitializing(false);
    navigate("/login");
  };

  const fetchCourses = async () => {
    try {
      const data = await api.get("/courses");
      if (data && data.length > 0) {
        setCourses(data);
      }
    } catch (e) {
      console.warn("Could not fetch courses from backend.", e);
    }
  };

  const fetchQuizzes = async () => {
    try {
      const data = await api.get('/assessments');
      if (Array.isArray(data) && data.length > 0) {
        const flattened: QuizQuestion[] = [];
        data.forEach((assessment: any) => {
            if (assessment.questions) {
                assessment.questions.forEach((q: any) => {
                    const optionsText = q.options.map((o: any) => o.option_text);
                    const correctIndex = q.options.findIndex((o: any) => o.is_correct);
                    flattened.push({
                        id: String(q.id),
                        question: q.content,
                        options: optionsText,
                        answer: correctIndex >= 0 ? correctIndex : 0,
                        explanation: q.options[correctIndex]?.explanation || "Check documentation for more info."
                    });
                });
            }
        });
        if (flattened.length > 0) {
            setQuizzes(flattened);
        }
      }
    } catch (e) {
      console.warn("Could not fetch quizzes from backend.", e);
    }
  };

  const fetchJobs = async () => {
    try {
      const data = await api.get('/jobs');
      if (Array.isArray(data) && data.length > 0) {
        setJobsList(data.map((j: any) => ({
            ...j,
            id: j.id.toString(),
            requirements: j.requirements || []
        })));
      }
    } catch(e) {
        console.warn("Could not fetch jobs from backend.", e);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchCourses();
      fetchQuizzes();
      fetchJobs();
    }
  }, [isAuthenticated]);

  const handleTrackProgress = async (lessonId?: string, quizId?: string, score?: number, labId?: string, xpGained?: number) => {
    try {
      await api.post("/student/progress", { lessonId, quizId, score, labId, xpGained });
      await fetchProfile();
    } catch (e) {
      console.error("Local sync success only.", e);
    }
  };

  const handleApplyJob = async (jobId: string) => {
    try {
      await api.post(`/jobs/${jobId}/apply`, {});
      await fetchProfile();
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateJobStatus = async (appId: string, status: string) => {
    try {
      await api.put(`/applications/${appId}/status`, { status });
      await fetchProfile();
    } catch (e) {
      console.error(e);
    }
  };

  // Placeholder module for unbuilt student features
  const PlaceholderStudentModule = ({ title, desc }: any) => (
    <div className="flex flex-col items-center justify-center min-h-[50vh] bg-white rounded-2xl border border-slate-100 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
      <p className="text-slate-500 max-w-md text-center mt-2">{desc}</p>
    </div>
  );

  const PlaceholderFacultyModule = ({ title, desc }: any) => (
    <div className="flex flex-col items-center justify-center min-h-[60vh] bg-white rounded-2xl border border-slate-100 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
      <p className="text-slate-500 max-w-md text-center mt-2">{desc}</p>
      <button className="mt-6 bg-slate-900 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-800 transition shadow-sm">
        Coming Soon
      </button>
    </div>
  );

  const PlaceholderCoordinatorModule = ({ title, desc }: any) => (
    <div className="flex flex-col items-center justify-center min-h-[60vh] bg-white rounded-2xl border border-slate-100 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-4">
        <Clock className="w-8 h-8" />
      </div>
      <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
      <p className="text-slate-500 max-w-md text-center mt-2">{desc}</p>
      <button className="mt-6 bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition shadow-sm">
        Under Development
      </button>
    </div>
  );

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || !profile) {
    return (
      <Routes>
        <Route path="*" element={<AuthScreen onSuccess={() => setIsAuthenticated(true)} />} />
      </Routes>
    );
  }

  // Redirect to respective dashboard based on role
  const getRoleBasePath = () => `/${profile.role}`;

  return (
    <>
      <ConfettiCelebration />
      <Routes>
        <Route path="/" element={<Navigate to={`${getRoleBasePath()}/dashboard`} replace />} />
        <Route path="/login" element={<Navigate to={`${getRoleBasePath()}/dashboard`} replace />} />

        {/* Admin Routes */}
        <Route path="/admin" element={profile.role === "admin" ? <DashboardLayout role="admin" profile={profile} onLogout={handleLogout} /> : <Navigate to={getRoleBasePath()} />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="courses" element={<AdminCourses />} />
          <Route path="students" element={<AdminStudents />} />
          <Route path="modules" element={<AdminModules />} />
          <Route path="batches" element={<AdminBatches />} />
          <Route path="faculty" element={<AdminFaculty />} />
          <Route path="packages" element={<AdminPackages />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        {/* Faculty Routes */}
        <Route path="/faculty" element={profile.role === "faculty" ? <DashboardLayout role="faculty" profile={profile} onLogout={handleLogout} /> : <Navigate to={getRoleBasePath()} />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<FacultyOverview />} />
          <Route path="lessons" element={<FacultyLessons />} />
          <Route path="practicals" element={<FacultyEvaluation />} />
          <Route path="zoom" element={<FacultyZoom />} />
          <Route path="classes" element={<FacultyZoom />} />
          <Route path="attendance" element={<PlaceholderFacultyModule title="Student Attendance" desc="Mark daily attendance." />} />
          <Route path="students" element={<PlaceholderFacultyModule title="My Students" desc="Track progress." />} />
          <Route path="mock-interviews" element={<PlaceholderFacultyModule title="Mock Interviews" desc="Schedule interviews." />} />
        </Route>

        {/* Coordinator Routes */}
        <Route path="/coordinator" element={profile.role === "coordinator" ? <DashboardLayout role="coordinator" profile={profile} onLogout={handleLogout} /> : <Navigate to={getRoleBasePath()} />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<CoordinatorDashboard />} />
          <Route path="batches" element={<BatchManagement />} />
          <Route path="students" element={<CoordinatorStudents />} />
          <Route path="attendance" element={<CoordinatorAttendance />} />
          <Route path="reports" element={<CoordinatorReports />} />
          <Route path="counseling" element={<CoordinatorCounseling />} />
          <Route path="settings" element={<CoordinatorSettings />} />
        </Route>

        {/* Student Routes */}
        <Route path="/student" element={profile.role === "student" ? <DashboardLayout role="student" profile={profile} onLogout={handleLogout} /> : <Navigate to={getRoleBasePath()} />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard profile={profile} courses={courses} setActiveTab={(t) => navigate(`/student/${t}`)} onTrackXp={(xp) => handleTrackProgress(undefined, undefined, undefined, undefined, xp)} />} />
          <Route path="lms" element={<LMSPanel profile={profile} courses={courses} focusMode={focusMode} onTrackProgress={(les, xp) => handleTrackProgress(les, undefined, undefined, undefined, xp)} />} />
          <Route path="classes" element={<LiveClassesList courseId={courses[0]?.id || "c1"} />} />
          <Route path="recordings" element={<PlaceholderStudentModule title="Class Recordings" desc="Access previous lecture recordings and transcripts." />} />
          <Route path="tutor" element={<TutorBot profile={profile} courses={courses} focusMode={focusMode} onTrackXp={(xp) => handleTrackProgress(undefined, undefined, undefined, undefined, xp)} />} />
          <Route path="coding" element={<CodingArena profile={profile} challenges={mockChallenges} focusMode={focusMode} onTrackProgress={(cId, xp) => handleTrackProgress(undefined, undefined, undefined, undefined, xp)} />} />
          <Route path="quizzes" element={<Assessments initialQuizzes={quizzes} profile={profile} focusMode={focusMode} onTrackProgress={(q, s, x) => handleTrackProgress(undefined, q, s, undefined, x)} />} />
          <Route path="labs" element={<ProjectLabsPanel profile={profile} labs={projectLabs} focusMode={focusMode} onTrackProgress={(l, x) => handleTrackProgress(undefined, undefined, undefined, l, x)} />} />
          <Route path="resume" element={<ResumeSpecs profile={profile} focusMode={focusMode} onTrackXp={(xp) => handleTrackProgress(undefined, undefined, undefined, undefined, xp)} />} />
          <Route path="interview" element={<MockInterviewArena profile={profile} focusMode={focusMode} onTrackXp={(xp) => handleTrackProgress(undefined, undefined, undefined, undefined, xp)} />} />
          <Route path="jobs" element={<JobPortal profile={profile} jobs={jobsList} onApply={handleApplyJob} onUpdateStatus={handleUpdateJobStatus} />} />
        </Route>
      </Routes>
    </>
  );
}
