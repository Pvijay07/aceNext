import React from "react";
import FacultyOverview from "./FacultyOverview";
import FacultyLessons from "./FacultyLessons";
import FacultyEvaluation from "./FacultyEvaluation";
import FacultyZoom from "./FacultyZoom";
import { ClipboardList, Users, Mic } from "lucide-react";

export default function FacultyDashboard({ activeTab = "dashboard" }: { activeTab?: string }) {
  
  // Temporary Placeholder for unbuilt modules
  const PlaceholderModule = ({ title, desc, icon }: any) => (
    <div className="flex flex-col items-center justify-center min-h-[60vh] bg-white rounded-2xl border border-slate-100 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
        {icon}
      </div>
      <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
      <p className="text-slate-500 max-w-md text-center mt-2">{desc}</p>
      <button className="mt-6 bg-slate-900 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-800 transition shadow-sm">
        Coming Soon (Phase 4 Extension)
      </button>
    </div>
  );

  switch (activeTab) {
    case "dashboard":
      return <FacultyOverview />;
    case "lessons":
      return <FacultyLessons />;
    case "practicals":
      return <FacultyEvaluation />;
    case "zoom":
      return <FacultyZoom />;
    case "attendance":
      return <PlaceholderModule title="Student Attendance" desc="Mark daily attendance for enrolled batches." icon={<ClipboardList className="w-8 h-8"/>} />;
    case "faculty_students":
      return <PlaceholderModule title="My Students" desc="Track progress of students assigned under your mentorship." icon={<Users className="w-8 h-8"/>} />;
    case "interviews":
      return <PlaceholderModule title="Mock Interviews" desc="Schedule and conduct mock technical interviews." icon={<Mic className="w-8 h-8"/>} />;
    default:
      return <FacultyOverview />;
  }
}
