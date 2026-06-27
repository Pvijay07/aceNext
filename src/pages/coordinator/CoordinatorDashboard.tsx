import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Calendar, Clock, CheckCircle2, AlertCircle, ArrowUpRight, RefreshCw } from "lucide-react";
import { api } from "../../api";

export default function CoordinatorDashboard() {
  const [batches, setBatches] = useState<any[]>([]);
  const [stats, setStats] = useState({ activeBatches: 0, totalStudents: 0, pendingApprovals: 0, avgCompletion: 0 });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchData = () => {
    setLoading(true);
    Promise.allSettled([
      api.get("/batches"),
      api.get("/coordinator/dashboard"),
    ]).then(([batchesResult, dashResult]) => {
      // Batches
      let batchData: any[] = [];
      if (batchesResult.status === "fulfilled" && Array.isArray(batchesResult.value)) {
        batchData = batchesResult.value.map((b: any) => ({
          id: b.id?.toString(),
          name: b.name || b.batch_name || b.course_name || "Batch",
          students: b.enrolled_count ?? b.students ?? b.enrolled ?? 0,
          progress: b.progress ?? b.completion_percentage ?? 0,
          status: b.status || "Ongoing",
        }));
      }
      setBatches(batchData.slice(0, 5));

      // Stats from dashboard endpoint or derived
      if (dashResult.status === "fulfilled" && dashResult.value) {
        const d = dashResult.value;
        setStats({
          activeBatches: d.active_batches ?? batchData.filter((b: any) => b.status !== "Completed").length,
          totalStudents: d.total_students ?? batchData.reduce((s: number, b: any) => s + (b.students || 0), 0),
          pendingApprovals: d.pending_approvals ?? 0,
          avgCompletion: d.avg_completion ?? Math.round(batchData.reduce((s: number, b: any) => s + (b.progress || 0), 0) / (batchData.length || 1)),
        });
      } else {
        setStats({
          activeBatches: batchData.filter((b: any) => b.status !== "Completed").length,
          totalStudents: batchData.reduce((s: number, b: any) => s + (b.students || 0), 0),
          pendingApprovals: 0,
          avgCompletion: Math.round(batchData.reduce((s: number, b: any) => s + (b.progress || 0), 0) / (batchData.length || 1)),
        });
      }
    }).finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const statCards = [
    { label: "Active Batches", value: stats.activeBatches, icon: Calendar, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Total Students", value: stats.totalStudents, icon: Users, color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "Pending Approvals", value: stats.pendingApprovals, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Avg. Completion", value: `${stats.avgCompletion}%`, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Coordinator Dashboard</h2>
          <p className="text-sm text-slate-500 mt-1">Manage batches, student enrollments, and operational tasks.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchData} className="p-2 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 transition" title="Refresh">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={() => navigate('/coordinator/batches')} className="bg-indigo-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-indigo-700 transition shadow-sm">
            Quick Assign Student
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <div key={i} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm flex items-start justify-between group hover:border-indigo-200 transition-colors">
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{stat.label}</p>
              <h3 className="text-2xl font-black text-slate-950">
                {loading ? <span className="w-12 h-6 bg-slate-100 rounded animate-pulse inline-block"></span> : stat.value}
              </h3>
            </div>
            <div className={`h-10 w-10 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
              <stat.icon className="h-5 w-5" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Batches Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900">Active Batches Overview</h3>
            <button onClick={() => navigate('/coordinator/batches')} className="text-indigo-600 text-xs font-bold hover:underline">View All</button>
          </div>
          {loading ? (
            <div className="p-8 flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50/50 text-xs uppercase text-slate-500 font-bold tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Batch Details</th>
                    <th className="px-6 py-4 text-center">Students</th>
                    <th className="px-6 py-4">Course Progress</th>
                    <th className="px-6 py-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {batches.map((batch) => (
                    <tr key={batch.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{batch.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">{batch.id}</div>
                      </td>
                      <td className="px-6 py-4 text-center font-medium">{batch.students}</td>
                      <td className="px-6 py-4">
                        <div className="w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1">
                          <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${batch.progress}%` }}></div>
                        </div>
                        <span className="text-[10px] text-slate-500 mt-1 inline-block">{batch.progress}% Complete</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          batch.status === 'Ongoing' ? 'bg-emerald-50 text-emerald-600' :
                          batch.status === 'Starting Soon' ? 'bg-amber-50 text-amber-600' :
                          'bg-slate-100 text-slate-500'
                        }`}>
                          {batch.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {batches.length === 0 && (
                    <tr><td colSpan={4} className="px-6 py-10 text-center text-slate-400 text-sm">No batches found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Priority Tasks */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h3 className="font-bold text-slate-900 mb-4">Priority Tasks</h3>
          <div className="space-y-4">
            {[
              { color: "rose", title: "Approve Student Transfers", desc: `${stats.pendingApprovals || 3} students requested batch change.`, icon: AlertCircle },
              { color: "amber", title: "Verify Fee Clearance", desc: "Batch B10 is entering final module.", icon: Clock },
              { color: "blue", title: "Counseling Session", desc: "Scheduled for 4:00 PM today.", icon: Users },
            ].map((task) => (
              <div key={task.title} className={`flex gap-3 items-start p-3 bg-${task.color}-50 rounded-xl border border-${task.color}-100 group cursor-pointer hover:bg-${task.color}-100 transition-colors`}>
                <div className={`p-2 bg-white rounded-lg text-${task.color}-600 shadow-sm`}>
                  <task.icon className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <h4 className={`text-sm font-bold text-${task.color}-900`}>{task.title}</h4>
                  <p className={`text-xs text-${task.color}-700 mt-0.5`}>{task.desc}</p>
                </div>
                <ArrowUpRight className={`w-4 h-4 text-${task.color}-400 opacity-0 group-hover:opacity-100 transition-opacity`} />
              </div>
            ))}
          </div>
          <button onClick={() => navigate('/coordinator/students')} className="w-full mt-6 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition">
            Manage All Tasks
          </button>
        </div>
      </div>
    </div>
  );
}
