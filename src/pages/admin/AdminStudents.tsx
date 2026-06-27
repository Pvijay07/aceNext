import React, { useState, useEffect } from "react";
import { Search, Filter, Eye, DollarSign, Mail, Download, RefreshCw } from "lucide-react";
import { api } from "../../api";

const mockStudents = [
  { id: "ST-001", name: "Rahul Verma", course: "Mastering React 19", batch: "Batch-12", date: "12 May 2026", totalFee: 15000, paid: 15000, status: "Paid" },
  { id: "ST-002", name: "Sneha Patil", course: "Mastering React 19", batch: "Batch-12", date: "15 May 2026", totalFee: 15000, paid: 5000, status: "Partial" },
  { id: "ST-003", name: "Amit Kumar", course: "Backend with Node.js", batch: "Batch-08", date: "01 Jun 2026", totalFee: 12000, paid: 0, status: "Unpaid" },
  { id: "ST-004", name: "Pooja Sharma", course: "Data Structures", batch: "Batch-05", date: "20 May 2026", totalFee: 20000, paid: 10000, status: "Overdue" },
];

export default function AdminStudents() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const fetchStudents = () => {
    setLoading(true);
    api.get("/students")
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setStudents(data.map((s: any) => ({
            id: s.id?.toString() || s.student_id,
            name: s.name || s.full_name,
            course: s.course_name || s.course || "—",
            batch: s.batch_name || s.batch || "—",
            date: s.enrollment_date || s.created_at?.split("T")[0] || "—",
            totalFee: s.total_fee || s.totalFee || 0,
            paid: s.paid_amount || s.paid || 0,
            status: s.payment_status || s.status || "Unpaid",
          })));
        } else {
          setStudents(mockStudents);
        }
      })
      .catch(() => {
        console.warn("Using mock data for students.");
        setStudents(mockStudents);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchStudents(); }, []);

  const filtered = students.filter(s => {
    const matchSearch = s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.id?.toLowerCase().includes(search.toLowerCase()) ||
      s.course?.toLowerCase().includes(search.toLowerCase()) ||
      s.batch?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Student Directory</h2>
          <p className="text-sm text-slate-500 mt-1">Manage enrollments, track fee payments, and view academic history.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchStudents} className="p-2 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 transition" title="Refresh">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button className="bg-white border border-slate-200 text-slate-700 text-sm font-semibold px-4 py-2 rounded-lg hover:bg-slate-50 transition shadow-sm flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-50/30">
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by student name, ID, course, or batch..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="bg-white border border-slate-200 text-sm rounded-lg px-3 py-2 text-slate-700 shadow-sm outline-none"
            >
              <option value="All">All Payment Statuses</option>
              <option>Paid</option>
              <option>Partial</option>
              <option>Overdue</option>
              <option>Unpaid</option>
            </select>
            <button className="flex items-center justify-center p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition bg-white shadow-sm">
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-12 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-bold tracking-wider">
                <tr>
                  <th className="px-6 py-4">Student Details</th>
                  <th className="px-6 py-4">Course & Batch</th>
                  <th className="px-6 py-4">Enrollment Date</th>
                  <th className="px-6 py-4">Fee Status</th>
                  <th className="px-6 py-4">Balance</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((student) => {
                  const balance = student.totalFee - student.paid;
                  return (
                    <tr key={student.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-blue-500 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                            {student.name?.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{student.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">{student.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-slate-800 font-medium">{student.course}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{student.batch}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-500">{student.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                          student.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' :
                          student.status === 'Partial' ? 'bg-amber-100 text-amber-700' :
                          student.status === 'Overdue' ? 'bg-rose-100 text-rose-700' :
                          'bg-slate-200 text-slate-600'
                        }`}>
                          {student.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-bold text-slate-900">₹{balance.toLocaleString()}</div>
                        <div className="text-[10px] text-slate-400">of ₹{student.totalFee.toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition" title="Record Payment"><DollarSign className="w-4 h-4" /></button>
                          <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Send Reminder"><Mail className="w-4 h-4" /></button>
                          <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition" title="View Profile"><Eye className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400 text-sm">No students found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
