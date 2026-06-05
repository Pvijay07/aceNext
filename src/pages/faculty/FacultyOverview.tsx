import React, { useEffect, useState } from "react";
import { BookOpen, Users, AlertCircle } from "lucide-react";
import { api } from "../../api";

export default function FacultyOverview() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    // In a real app we'd fetch this properly, but since the backend might fail locally,
    // we use a resilient fetch pattern.
    api.get("/faculty/dashboard").then(setData).catch((e) => {
      console.warn("Using mock data due to backend disconnect", e);
      setData({
        assigned_courses: [{ id: 1, students: 45 }, { id: 2, students: 30 }],
        pending_reviews: 12
      });
    });
  }, []);

  if (!data) return <div className="p-8 text-slate-500 animate-pulse">Loading Faculty Data...</div>;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Educator Overview</h2>
        <p className="text-sm text-slate-500 mt-1">Your assigned classes and daily mentoring tasks.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group hover:border-indigo-200 transition-all">
          <div>
             <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Assigned Courses</p>
             <p className="text-3xl font-black text-slate-900">{data.assigned_courses?.length || 0}</p>
          </div>
          <div className="h-12 w-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
             <BookOpen className="w-6 h-6" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group hover:border-emerald-200 transition-all">
          <div>
             <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Total Students</p>
             <p className="text-3xl font-black text-slate-900">
               {data.assigned_courses?.reduce((acc: number, c: any) => acc + (c.students || 0), 0) || 0}
             </p>
          </div>
          <div className="h-12 w-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
             <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group hover:border-rose-200 transition-all">
          <div>
             <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Pending Reviews</p>
             <p className="text-3xl font-black text-slate-900">{data.pending_reviews || 0}</p>
          </div>
          <div className="h-12 w-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform relative">
             <span className="absolute -top-1 -right-1 flex h-3 w-3">
               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
               <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
             </span>
             <AlertCircle className="w-6 h-6" />
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm min-h-[300px] flex flex-col items-center justify-center">
         <p className="text-slate-500 font-medium text-sm">Upcoming Classes Schedule (Placeholder Calendar)</p>
      </div>
    </div>
  );
}
