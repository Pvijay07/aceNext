import { useState, FormEvent } from "react";
import { PlusCircle, LineChart, Shield, GraduationCap, Check, Users, Users2, AlertTriangle, Lightbulb } from "lucide-react";
import { Course } from "../types";

interface AdminPanelProps {
  courses: Course[];
  onAddCourse: (newCourse: Course) => void;
}

export default function AdminPanel({ courses, onAddCourse }: AdminPanelProps) {
  const [courseTitle, setCourseTitle] = useState<string>("");
  const [courseCategory, setCourseCategory] = useState<string>("Frontend Development");
  const [courseDesc, setCourseDesc] = useState<string>("");
  const [reward, setReward] = useState<string>("400");
  const [thumbnailUrl, setThumbnailUrl] = useState<string>("");

  const [message, setMessage] = useState<string>("");

  const handleAddNewCourse = (e: FormEvent) => {
    e.preventDefault();
    if (!courseTitle.trim() || !courseDesc.trim()) return;

    const newC: Course = {
      id: `c-custom-${Date.now()}`,
      category: courseCategory,
      title: courseTitle,
      description: courseDesc,
      thumbnail: thumbnailUrl || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60",
      xpReward: parseInt(reward) || 300,
      modules: [
        {
          id: `mod-custom-${Date.now()}`,
          title: "Module 1: Introductory Sandbox Outline",
          lessons: [
            {
              id: `les-custom-${Date.now()}-1`,
              title: "Lesson 1: Foundational core directives",
              duration: "10 mins",
              topic: "Basics of custom topic parameters"
            }
          ]
        }
      ]
    };

    onAddCourse(newC);
    setCourseTitle("");
    setCourseDesc("");
    setThumbnailUrl("");
    setMessage("✓ Custom course created and appended to catalog outline successfully!");
    setTimeout(() => setMessage(""), 4000);
  };

  return (
    <div id="admin-panel-view" className="space-y-6">
      {/* Visual Admin Metrics Header */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm flex items-start justify-between">
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Platform Students</p>
            <h3 className="text-2xl font-black text-slate-950">1,842</h3>
            <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full inline-block">
              +14% Monthly climb
            </span>
          </div>
          <div className="h-9 w-9 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
            <Users className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm flex items-start justify-between">
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Estimated Revenue</p>
            <h3 className="text-2xl font-black text-slate-950">₹3,450,200</h3>
            <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-full inline-block">
              14 Tiers active
            </span>
          </div>
          <div className="h-9 w-9 bg-blue-50 text-indigo-600 rounded-lg flex items-center justify-center">
            <LineChart className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm flex items-start justify-between">
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Average Course Streaks</p>
            <h3 className="text-2xl font-black text-slate-950">84.2%</h3>
            <span className="text-[10px] text-orange-600 font-bold bg-orange-50 px-2 py-0.5 rounded-full inline-block">
              High commitment rate
            </span>
          </div>
          <div className="h-9 w-9 bg-blue-50 text-amber-600 rounded-lg flex items-center justify-center">
            <Users2 className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm flex items-start justify-between">
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Syllabus Chapters</p>
            <h3 className="text-2xl font-black text-slate-950">{courses.length} Active Courses</h3>
            <span className="text-[10px] text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded-full inline-block">
              Directly curated
            </span>
          </div>
          <div className="h-9 w-9 bg-blue-50 text-indigo-600 rounded-lg flex items-center justify-center">
            <GraduationCap className="h-5 w-5" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Create new course */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center space-x-1.5 border-b border-slate-50 pb-2">
            <PlusCircle className="h-5 w-5 text-indigo-600" />
            <h4 className="font-extrabold text-xs text-slate-950 uppercase font-mono tracking-tight">Create Custom Syllabus Course</h4>
          </div>

          {message && (
            <p className="p-3 bg-emerald-50 border border-emerald-100/50 text-emerald-700 text-xs font-bold rounded-xl flex items-center gap-1.5">
              <Check className="h-4 w-4 shrink-0" />
              {message}
            </p>
          )}

          <form onSubmit={handleAddNewCourse} className="space-y-3.5 text-xs text-slate-700">
            <div>
              <label className="block text-[10px] uppercase font-bold font-mono text-slate-400 mb-1.5">Course Title</label>
              <input
                type="text"
                value={courseTitle}
                onChange={(e) => setCourseTitle(e.target.value)}
                placeholder="eg. Advanced Databases with Spanner"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[10px] uppercase font-bold font-mono text-slate-400 mb-1.5">Category</label>
                <select
                  value={courseCategory}
                  onChange={(e) => setCourseCategory(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                >
                  <option value="Frontend Development">Frontend Development</option>
                  <option value="Backend Development">Backend Development</option>
                  <option value="Data Structures & Algos">Data Structures & Algos</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold font-mono text-slate-400 mb-1.5">XP Reward</label>
                <input
                  type="number"
                  value={reward}
                  onChange={(e) => setReward(e.target.value)}
                  placeholder="300"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold font-mono text-slate-400 mb-1.5">Thumbnail Unsplash URL (Optional)</label>
              <input
                type="text"
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold font-mono text-slate-400 mb-1.5">Course Description</label>
              <textarea
                value={courseDesc}
                onChange={(e) => setCourseDesc(e.target.value)}
                rows={3}
                placeholder="Describe key syllabus features, lesson plans, frameworks used..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-indigo-600 hover:bg-slate-950 text-white rounded-xl text-xs font-semibold transition"
            >
              Curate and Publish Custom Course
            </button>
          </form>
        </div>

        {/* Right column: Pending Student Applications Review/Approval Queue */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center space-x-1.5 border-b border-slate-50 pb-2">
            <Shield className="h-5 w-5 text-indigo-600" />
            <h4 className="font-extrabold text-xs text-slate-950 uppercase font-mono tracking-tight">Mentoring Queue Tasks</h4>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-xl border border-dashed border-rose-100/80 bg-rose-50/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-rose-600 uppercase">HIGH PRIORITY QUEUE</span>
                <span className="text-[9px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-md">1 Day delay</span>
              </div>
              <h5 className="text-xs font-bold text-slate-900 leading-tight">Student: Rajesh Sen</h5>
              <p className="text-[11px] text-slate-600 leading-normal font-sans">
                Completed 4 MCQ assessments on Redis schemas but flagged under isolation limits error.
              </p>
              <div className="flex items-center gap-1.5 text-[9px] font-bold text-indigo-700 bg-indigo-50/50 p-2 rounded-lg border border-indigo-100/50">
                <Lightbulb className="h-3.5 w-3.5 shrink-0" />
                <span>Recommendation: AI Tutor reviewed correct answer path. Re-evaluate exam attempts.</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-indigo-100 bg-white space-y-2.5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-indigo-600 uppercase">PENDING PLACEMENT ASSIGNMENT</span>
                <span className="text-[9px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">Assigned Interviewer</span>
              </div>
              <h5 className="text-xs font-bold text-slate-900">Student: Pooja Verma</h5>
              <p className="text-[11px] text-slate-600 leading-normal">
                Submitted complete CRM Leads Kanban board repository for final engineering certification.
              </p>
              <button className="text-[10px] font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg px-3 py-1 transition select-none">
                Approve Project and Issue Certificate
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
