import React, { useState, useEffect } from "react";
import { Plus, Calendar, Search, Users, Clock, RefreshCw, X, AlertTriangle } from "lucide-react";
import { api } from "../../api";

export default function AdminBatches() {
  const [batches, setBatches] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [facultyList, setFacultyList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modal states
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<any | null>(null);

  // Form states
  const [formName, setFormName] = useState("");
  const [formCourseId, setFormCourseId] = useState("");
  const [formFacultyId, setFormFacultyId] = useState("");
  const [formStartDate, setFormStartDate] = useState("");
  const [formEndDate, setFormEndDate] = useState("");
  const [formCapacity, setFormCapacity] = useState("30");
  const [formStatus, setFormStatus] = useState("Ongoing");
  const [formDelayReason, setFormDelayReason] = useState("");
  const [formExpectedCompletionDate, setFormExpectedCompletionDate] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const batchData = await api.get("/batches");
      setBatches(batchData);

      const courseData = await api.get("/courses");
      setCourses(courseData);

      const facultyData = await api.get("/faculty");
      setFacultyList(facultyData);

      if (courseData.length > 0) setFormCourseId(courseData[0].id);
      if (facultyData.length > 0) setFormFacultyId(facultyData[0].id);
    } catch (e) {
      console.error("Failed to load administration data", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateModal = () => {
    setFormName("");
    if (courses.length > 0) setFormCourseId(courses[0].id);
    if (facultyList.length > 0) setFormFacultyId(facultyList[0].id);
    setFormStartDate(new Date().toISOString().split("T")[0]);
    setFormEndDate(new Date(Date.now() + 90*24*60*60*1000).toISOString().split("T")[0]);
    setFormCapacity("30");
    setCreateModalOpen(true);
  };

  const openEditModal = (batch: any) => {
    setSelectedBatch(batch);
    setFormName(batch.name || "");
    setFormCourseId(batch.course_id || "");
    setFormFacultyId(batch.faculty_id || "");
    setFormStartDate(batch.start_date || "");
    setFormEndDate(batch.end_date || "");
    setFormCapacity(String(batch.capacity || 30));
    setFormStatus(batch.status || "Ongoing");
    setFormDelayReason(batch.delay_reason || "");
    setFormExpectedCompletionDate(batch.expected_completion_date || batch.end_date || "");
    setEditModalOpen(true);
  };

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: formName,
      course_id: formCourseId,
      faculty_id: formFacultyId,
      start_date: formStartDate,
      end_date: formEndDate,
      capacity: Number(formCapacity) || 30,
    };

    try {
      await api.post("/batches", payload);
      setCreateModalOpen(false);
      fetchData();
    } catch (e) {
      alert("Failed to create batch.");
    }
  };

  const handleUpdateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatch) return;

    const payload = {
      name: formName,
      course_id: formCourseId,
      faculty_id: formFacultyId,
      start_date: formStartDate,
      end_date: formEndDate,
      capacity: Number(formCapacity) || 30,
      status: formStatus,
      delay_reason: formStatus === "Delayed" ? formDelayReason : "",
      expected_completion_date: formStatus === "Delayed" ? formExpectedCompletionDate : formEndDate,
    };

    try {
      await api.put(`/batches/${selectedBatch.id}`, payload);
      setEditModalOpen(false);
      fetchData();
    } catch (e) {
      alert("Failed to update batch.");
    }
  };

  const filtered = batches.filter(b =>
    b.id?.toLowerCase().includes(search.toLowerCase()) ||
    b.name?.toLowerCase().includes(search.toLowerCase()) ||
    b.course_name?.toLowerCase().includes(search.toLowerCase())
  );

  const activeBatches = batches.filter(b => b.status === "Ongoing").length;
  const delayedBatches = batches.filter(b => b.status === "Delayed").length;
  const openBatches = batches.filter(b => b.status === "Starting Soon").length;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Batch Management</h2>
          <p className="text-sm text-slate-500 mt-1">Schedule new batches, monitor delay alerts, and review metrics.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchData} className="p-2 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 transition" title="Refresh">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={openCreateModal} className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl font-bold text-sm transition shadow-sm flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Schedule Batch
          </button>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Ongoing Batches</p>
            <p className="text-2xl font-black text-slate-900">{loading ? "—" : activeBatches}</p>
          </div>
          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Delayed Batches</p>
            <p className="text-2xl font-black text-rose-600">{loading ? "—" : delayedBatches}</p>
          </div>
          <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Starting Soon</p>
            <p className="text-2xl font-black text-amber-600">{loading ? "—" : openBatches}</p>
          </div>
          <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-100 shadow-sm rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/20">
          <div className="relative w-full max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search batches by Course or Name..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-12 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/50 text-xs uppercase font-bold text-slate-500">
                <tr>
                  <th className="px-6 py-4">Batch Name</th>
                  <th className="px-6 py-4">Course Enrolled</th>
                  <th className="px-6 py-4">Assigned Faculty</th>
                  <th className="px-6 py-4">Schedule Dates</th>
                  <th className="px-6 py-4 text-center">Students</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((batch) => {
                  return (
                    <tr key={batch.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-6 py-4 font-bold text-slate-900">{batch.name}</td>
                      <td className="px-6 py-4 font-medium text-slate-700">{batch.course_name}</td>
                      <td className="px-6 py-4 text-slate-600">{batch.faculty_name}</td>
                      <td className="px-6 py-4 text-slate-600 text-xs">
                        <div>Start: {batch.start_date}</div>
                        <div>End: {batch.end_date}</div>
                        {batch.status === 'Delayed' && (
                          <div className="text-rose-600 font-bold mt-1">Expected: {batch.expected_completion_date}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-bold text-slate-800">{batch.enrolled_count}</span> / <span className="text-slate-400">{batch.capacity}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider w-fit ${
                            batch.status === 'Ongoing' ? 'bg-blue-100 text-blue-700' :
                            batch.status === 'Delayed' ? 'bg-rose-100 text-rose-700' :
                            batch.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                            'bg-slate-100 text-slate-600'
                          }`}>
                            {batch.status}
                          </span>
                          {batch.status === 'Delayed' && batch.delay_reason && (
                            <span className="text-[10px] text-rose-500 italic mt-1 max-w-[120px] truncate" title={batch.delay_reason}>
                              Reason: {batch.delay_reason}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => openEditModal(batch)}
                          className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-2.5 py-1.5 rounded-lg transition"
                        >
                          Modify
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className="px-6 py-12 text-center text-slate-400 text-sm">No batches found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Schedule New Batch</h3>
              <button onClick={() => setCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition p-1"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreateBatch} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Batch Name</label>
                <input 
                  type="text" 
                  required
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  placeholder="e.g. Batch A"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Course Catalog</label>
                <select 
                  value={formCourseId}
                  onChange={e => setFormCourseId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                >
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Assigned Faculty</label>
                <select 
                  value={formFacultyId}
                  onChange={e => setFormFacultyId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                >
                  {facultyList.map(f => (
                    <option key={f.id} value={f.id}>{f.name} ({f.specialization || "Faculty"})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Start Date</label>
                  <input 
                    type="date" 
                    required
                    value={formStartDate}
                    onChange={e => setFormStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">End Date</label>
                  <input 
                    type="date" 
                    required
                    value={formEndDate}
                    onChange={e => setFormEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Batch Capacity</label>
                <input 
                  type="number" 
                  required
                  value={formCapacity}
                  onChange={e => setFormCapacity(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button type="button" onClick={() => setCreateModalOpen(false)} className="px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition font-semibold">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm hover:bg-slate-800 transition font-semibold">Schedule</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 font-sans">Modify Batch Details</h3>
              <button onClick={() => setEditModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition p-1"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleUpdateBatch} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Batch Name</label>
                <input 
                  type="text" 
                  required
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Batch Status</label>
                  <select 
                    value={formStatus}
                    onChange={e => setFormStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                  >
                    <option value="Ongoing">Ongoing</option>
                    <option value="Starting Soon">Starting Soon</option>
                    <option value="Completed">Completed</option>
                    <option value="Delayed">Delayed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Assigned Faculty</label>
                  <select 
                    value={formFacultyId}
                    onChange={e => setFormFacultyId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                  >
                    {facultyList.map(f => (
                      <option key={f.id} value={f.id}>{f.name} ({f.specialization || "Faculty"})</option>
                    ))}
                  </select>
                </div>
              </div>

              {formStatus === "Delayed" && (
                <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl space-y-3">
                  <div className="flex gap-2 text-rose-800 font-bold text-sm">
                    <AlertTriangle className="w-5 h-5 shrink-0" />
                    <span>Delay Logging Details</span>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-rose-700 uppercase tracking-wider mb-1">Delay Reason</label>
                    <select 
                      value={formDelayReason}
                      onChange={e => setFormDelayReason(e.target.value)}
                      className="w-full px-3 py-2 border border-rose-200 bg-white rounded-lg text-xs outline-none"
                    >
                      <option value="">Select a reason</option>
                      <option value="Faculty Unavailable">Faculty Unavailable</option>
                      <option value="Student Attendance Issues">Student Attendance Issues</option>
                      <option value="Holiday Impact">Holiday Impact</option>
                      <option value="Technical Issues">Technical Issues</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-rose-700 uppercase tracking-wider mb-1">Expected Completion Date</label>
                    <input 
                      type="date"
                      value={formExpectedCompletionDate}
                      onChange={e => setFormExpectedCompletionDate(e.target.value)}
                      className="w-full px-3 py-2 border border-rose-200 rounded-lg text-xs outline-none"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Start Date</label>
                  <input 
                    type="date" 
                    required
                    value={formStartDate}
                    onChange={e => setFormStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">End Date</label>
                  <input 
                    type="date" 
                    required
                    value={formEndDate}
                    onChange={e => setFormEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button type="button" onClick={() => setEditModalOpen(false)} className="px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition font-semibold">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition font-semibold">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
