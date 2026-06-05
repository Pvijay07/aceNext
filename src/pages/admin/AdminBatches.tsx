import React, { useState } from "react";
import { Plus, Calendar, Search, Users, Clock, AlertCircle } from "lucide-react";

export default function AdminBatches() {
  const [batches, setBatches] = useState([
    { id: "B-2026-A", course: "Full Stack Web Development", startDate: "15 Jun 2026", time: "10:00 AM - 1:00 PM", capacity: 45, enrolled: 42, status: "Filling Fast" },
    { id: "B-2026-B", course: "Data Science Bootcamp", startDate: "01 Jul 2026", time: "2:00 PM - 5:00 PM", capacity: 30, enrolled: 12, status: "Open" },
    { id: "B-2026-C", course: "Full Stack Web Development", startDate: "10 Aug 2026", time: "6:00 PM - 9:00 PM", capacity: 40, enrolled: 40, status: "Full" },
  ]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Batch Management</h2>
          <p className="text-sm text-slate-500 mt-1">Schedule new batches and monitor enrollment capacity.</p>
        </div>
        <button className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl font-bold text-sm transition shadow-sm flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Schedule Batch
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
         {/* Summary Cards */}
         <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
           <div className="flex justify-between items-start">
             <div>
               <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Active Batches</p>
               <p className="text-2xl font-black text-slate-900">8</p>
             </div>
             <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
               <Calendar className="w-5 h-5" />
             </div>
           </div>
         </div>
         <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
           <div className="flex justify-between items-start">
             <div>
               <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Capacity</p>
               <p className="text-2xl font-black text-slate-900">320</p>
             </div>
             <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
               <Users className="w-5 h-5" />
             </div>
           </div>
         </div>
         <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
           <div className="flex justify-between items-start">
             <div>
               <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Upcoming Starts</p>
               <p className="text-2xl font-black text-slate-900">3</p>
             </div>
             <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center">
               <Clock className="w-5 h-5" />
             </div>
           </div>
         </div>
      </div>

      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="relative w-full max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search batches by ID or Course..." 
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-6 py-4 font-semibold">Batch ID</th>
                <th className="px-6 py-4 font-semibold">Course</th>
                <th className="px-6 py-4 font-semibold">Schedule</th>
                <th className="px-6 py-4 font-semibold">Enrollment</th>
                <th className="px-6 py-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {batches.map((batch) => {
                const fillPercentage = (batch.enrolled / batch.capacity) * 100;
                return (
                  <tr key={batch.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-slate-900">{batch.id}</td>
                    <td className="px-6 py-4 font-medium text-slate-700">{batch.course}</td>
                    <td className="px-6 py-4 text-slate-600">
                      <div className="flex flex-col gap-1">
                        <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-slate-400"/> {batch.startDate}</span>
                        <span className="flex items-center gap-1.5 text-xs"><Clock className="w-3.5 h-3.5 text-slate-400"/> {batch.time}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${fillPercentage > 90 ? 'bg-rose-500' : fillPercentage > 50 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                            style={{ width: `${fillPercentage}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-semibold text-slate-600">{batch.enrolled}/{batch.capacity}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        batch.status === 'Full' ? 'bg-rose-100 text-rose-700' :
                        batch.status === 'Filling Fast' ? 'bg-amber-100 text-amber-700' :
                        'bg-emerald-100 text-emerald-700'
                      }`}>
                        {batch.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
