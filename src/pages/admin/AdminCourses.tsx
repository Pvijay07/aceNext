import React, { useState } from "react";
import { PlusCircle, Search, MoreVertical, Edit, Eye, Trash2, Filter } from "lucide-react";

export default function AdminCourses() {
  const [showAddModal, setShowAddModal] = useState(false);

  const mockCourses = [
    { id: "C-101", name: "Mastering React 19", duration: "12 Weeks", fee: "₹15,000", modules: 8, faculty: "Sarah Johnson", batches: 3, status: "Active" },
    { id: "C-102", name: "Backend with Node.js", duration: "10 Weeks", fee: "₹12,000", modules: 6, faculty: "David Smith", batches: 2, status: "Active" },
    { id: "C-103", name: "Data Structures & Algos", duration: "16 Weeks", fee: "₹20,000", modules: 12, faculty: "Michael Brown", batches: 4, status: "Inactive" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Courses Management</h2>
          <p className="text-sm text-slate-500 mt-1">Manage course catalog, fees, and faculty assignments.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-sm flex items-center gap-2"
        >
          <PlusCircle className="w-4 h-4" />
          Add New Course
        </button>
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search courses..." 
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
             <button className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition">
               <Filter className="w-4 h-4" /> Filters
             </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50/50 text-xs uppercase text-slate-500 font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">Course</th>
                <th className="px-6 py-4">Duration</th>
                <th className="px-6 py-4">Total Fee</th>
                <th className="px-6 py-4">Faculty</th>
                <th className="px-6 py-4">Batches</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mockCourses.map((course) => (
                <tr key={course.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-bold text-slate-900">{course.name}</div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">{course.id} • {course.modules} Modules</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{course.duration}</td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-900">{course.fee}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{course.faculty}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="bg-blue-50 text-blue-700 font-bold px-2.5 py-1 rounded-md text-[11px]">
                      {course.batches} Active
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      course.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {course.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition" title="View Details">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition" title="Edit Course">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
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
