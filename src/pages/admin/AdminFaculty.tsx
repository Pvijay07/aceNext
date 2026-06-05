import React, { useState } from "react";
import { Plus, Search, Mail, Star, BookOpen, MoreVertical } from "lucide-react";

export default function AdminFaculty() {
  const [faculty, setFaculty] = useState([
    { id: "F-01", name: "Dr. Sarah Jenkins", role: "Senior Mentor", courses: 4, rating: 4.9, status: "Active", avatar: "SJ" },
    { id: "F-02", name: "Michael Chang", role: "Frontend Expert", courses: 2, rating: 4.8, status: "Active", avatar: "MC" },
    { id: "F-03", name: "Priya Sharma", role: "Data Science Lead", courses: 3, rating: 4.9, status: "On Leave", avatar: "PS" },
  ]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Faculty & Mentors</h2>
          <p className="text-sm text-slate-500 mt-1">Manage teaching staff, monitor ratings, and assign course loads.</p>
        </div>
        <button className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl font-bold text-sm transition shadow-sm flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Onboard Faculty
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {faculty.map((member) => (
          <div key={member.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
            <button className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-lg opacity-0 group-hover:opacity-100 transition-all">
              <MoreVertical className="w-4 h-4" />
            </button>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-500 text-white flex items-center justify-center text-xl font-bold shadow-md">
                {member.avatar}
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900">{member.name}</h3>
                <p className="text-xs text-slate-500 font-medium">{member.role}</p>
              </div>
            </div>

            <div className="flex items-center justify-between py-3 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-semibold text-slate-700">{member.courses} Assigned</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span className="text-sm font-bold text-slate-900">{member.rating}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 mt-2 border-t border-slate-100">
              <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                member.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600 border border-slate-200'
              }`}>
                {member.status}
              </span>
              <button className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 transition">
                <Mail className="w-3.5 h-3.5" /> Message
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
