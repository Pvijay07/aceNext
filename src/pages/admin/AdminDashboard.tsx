import React from "react";
import { Users, LineChart, Users2, GraduationCap } from "lucide-react";

export default function AdminDashboard() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Overview</h2>
          <p className="text-sm text-slate-500 mt-1">Platform analytics and key performance indicators.</p>
        </div>
        <div className="flex gap-3">
          <select className="bg-white border border-slate-200 text-sm rounded-lg px-4 py-2 text-slate-700 shadow-sm outline-none">
            <option>Last 30 Days</option>
            <option>This Quarter</option>
            <option>This Year</option>
          </select>
          <button className="bg-slate-900 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-slate-800 transition shadow-sm">
            Download Report
          </button>
        </div>
      </div>

      {/* Visual Admin Metrics Header */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm flex items-start justify-between group hover:border-blue-200 transition-colors">
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Platform Students</p>
            <h3 className="text-2xl font-black text-slate-950">1,842</h3>
            <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full inline-block">
              +14% Monthly climb
            </span>
          </div>
          <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <Users className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm flex items-start justify-between group hover:border-indigo-200 transition-colors">
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Estimated Revenue</p>
            <h3 className="text-2xl font-black text-slate-950">₹3,450,200</h3>
            <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-full inline-block">
              14 Tiers active
            </span>
          </div>
          <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <LineChart className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm flex items-start justify-between group hover:border-amber-200 transition-colors">
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Average Batch Fill</p>
            <h3 className="text-2xl font-black text-slate-950">84.2%</h3>
            <span className="text-[10px] text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded-full inline-block">
              High capacity
            </span>
          </div>
          <div className="h-10 w-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <Users2 className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm flex items-start justify-between group hover:border-rose-200 transition-colors">
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Active Courses</p>
            <h3 className="text-2xl font-black text-slate-950">24</h3>
            <span className="text-[10px] text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded-full inline-block">
              Across 4 categories
            </span>
          </div>
          <div className="h-10 w-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <GraduationCap className="h-5 w-5" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm min-h-[300px] flex flex-col items-center justify-center">
            <LineChart className="w-12 h-12 text-slate-200 mb-3" />
            <p className="text-slate-500 font-medium text-sm">Enrollment Trends Chart (Placeholder)</p>
         </div>
         <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm min-h-[300px] flex flex-col items-center justify-center">
            <BarChart className="w-12 h-12 text-slate-200 mb-3" />
            <p className="text-slate-500 font-medium text-sm">Revenue Distribution Chart (Placeholder)</p>
         </div>
      </div>
    </div>
  );
}

function BarChart(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  )
}
