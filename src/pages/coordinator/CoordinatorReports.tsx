import React, { useState, useEffect } from "react";
import { RefreshCw, Download, BarChart2, Users, FileText, Activity } from "lucide-react";
import { api } from "../../api";

export default function CoordinatorReports() {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const data = await api.get("/reports");
      setReport(data);
    } catch (e) {
      console.error("Failed to load reports", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Activity Reports</h2>
          <p className="text-sm text-slate-500 mt-1">Generate and view detailed student performance and batch activity reports.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchReport} className="p-2 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 transition" title="Refresh">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button className="bg-indigo-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-indigo-700 transition flex items-center gap-2">
            <Download className="w-4 h-4" /> Download PDF
          </button>
        </div>
      </div>

      {loading || !report ? (
        <div className="p-12 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-start justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase">Total Students</p>
                <h3 className="text-2xl font-black text-slate-900 mt-1">{report.summary?.total_students}</h3>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center"><Users className="w-5 h-5"/></div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-start justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase">Total Batches</p>
                <h3 className="text-2xl font-black text-slate-900 mt-1">{report.summary?.total_batches}</h3>
              </div>
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center"><BarChart2 className="w-5 h-5"/></div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-start justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase">Avg Attendance</p>
                <h3 className="text-2xl font-black text-slate-900 mt-1">{report.summary?.attendance_rate}%</h3>
              </div>
              <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center"><Activity className="w-5 h-5"/></div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-start justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase">Avg Score</p>
                <h3 className="text-2xl font-black text-slate-900 mt-1">{report.summary?.avg_score}%</h3>
              </div>
              <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center"><FileText className="w-5 h-5"/></div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900">Recent Activity Logs</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-bold">
                  <tr>
                    <th className="px-6 py-4">Student</th>
                    <th className="px-6 py-4">Activity Type</th>
                    <th className="px-6 py-4">Result / Score</th>
                    <th className="px-6 py-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {report.recent_activity?.map((act: any) => (
                    <tr key={act.id}>
                      <td className="px-6 py-4 font-bold text-slate-900">{act.student}</td>
                      <td className="px-6 py-4">{act.type}</td>
                      <td className="px-6 py-4 font-medium">{act.score}</td>
                      <td className="px-6 py-4 text-xs text-slate-500">{act.date}</td>
                    </tr>
                  ))}
                  {(!report.recent_activity || report.recent_activity.length === 0) && (
                    <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-400">No recent activity.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
