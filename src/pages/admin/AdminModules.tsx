import React, { useState } from "react";
import { Plus, GripVertical, Layers, Search, MoreVertical, Edit2, Trash2 } from "lucide-react";

export default function AdminModules() {
  const [modules, setModules] = useState([
    { id: "mod-1", title: "HTML & CSS Core", order: 1, duration: "3 Weeks", courses: 1, status: "Active" },
    { id: "mod-2", title: "JavaScript Fundamentals", order: 2, duration: "4 Weeks", courses: 2, status: "Active" },
    { id: "mod-3", title: "React Single Page Apps", order: 3, duration: "5 Weeks", courses: 1, status: "Active" },
    { id: "mod-4", title: "Node.js & Express API", order: 4, duration: "4 Weeks", courses: 1, status: "Draft" },
  ]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Curriculum Modules</h2>
          <p className="text-sm text-slate-500 mt-1">Manage learning modules and their sequence across courses.</p>
        </div>
        <button className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl font-bold text-sm transition shadow-sm flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create Module
        </button>
      </div>

      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="relative w-full max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search modules..." 
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-6 py-4 font-semibold w-12">Seq</th>
                <th className="px-6 py-4 font-semibold">Module Name</th>
                <th className="px-6 py-4 font-semibold">Duration</th>
                <th className="px-6 py-4 font-semibold">Linked Courses</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {modules.map((mod) => (
                <tr key={mod.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-400 cursor-move hover:text-slate-600">
                      <GripVertical className="w-4 h-4" />
                      <span className="font-mono text-xs">{mod.order}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-900 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                      <Layers className="w-4 h-4" />
                    </div>
                    {mod.title}
                  </td>
                  <td className="px-6 py-4 text-slate-600">{mod.duration}</td>
                  <td className="px-6 py-4 text-slate-600">{mod.courses} Courses</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      mod.status === 'Active' 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {mod.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"><Edit2 className="w-4 h-4" /></button>
                      <button className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
