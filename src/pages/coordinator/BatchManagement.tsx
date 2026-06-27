import React, { useState, useEffect } from "react";
import { Search, Filter, MoreVertical, Plus, UserPlus, Calendar, RefreshCw, X, ArrowLeftRight, Edit, Trash2 } from "lucide-react";
import { api } from "../../api";

export default function BatchManagement() {
  const [activeTab, setActiveTab] = useState("all");
  const [batches, setBatches] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [facultyList, setFacultyList] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [assignStudentModalOpen, setAssignStudentModalOpen] = useState(false);
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [assignFacultyModalOpen, setAssignFacultyModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  
  // Filters
  const [filterOpen, setFilterOpen] = useState(false);
  const [courseFilter, setCourseFilter] = useState("All");
  
  // Selection/Targets
  const [selectedBatch, setSelectedBatch] = useState<any | null>(null);
  const [targetStudentId, setTargetStudentId] = useState("");
  const [targetBatchId, setTargetBatchId] = useState("");
  const [targetFacultyId, setTargetFacultyId] = useState("");

  // Form states
  const [formName, setFormName] = useState("");
  const [formCourseId, setFormCourseId] = useState("");
  const [formFacultyId, setFormFacultyId] = useState("");
  const [formStartDate, setFormStartDate] = useState("");
  const [formEndDate, setFormEndDate] = useState("");
  const [formCapacity, setFormCapacity] = useState("30");
  const [formStatus, setFormStatus] = useState("Ongoing");

  const fetchData = async () => {
    setLoading(true);
    try {
      const batchData = await api.get("/batches");
      setBatches(batchData);

      const studentData = await api.get("/students");
      // filter only approved students
      setStudents(studentData.filter((s: any) => s.admission_status === "Approved"));

      const facultyData = await api.get("/faculty");
      setFacultyList(facultyData);

      const courseData = await api.get("/courses");
      setCourses(courseData);

      if (courseData.length > 0) setFormCourseId(courseData[0].id);
      if (facultyData.length > 0) {
        setFormFacultyId(facultyData[0].id);
        setTargetFacultyId(facultyData[0].id);
      }
    } catch (e) {
      console.error("Failed to load coordinator data", e);
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
    setFormStatus("Starting Soon");
    setCreateModalOpen(true);
  };

  const openEditModal = (batch: any) => {
    setSelectedBatch(batch);
    setFormName(batch.name || "");
    setFormCourseId(batch.course_id || (courses.length > 0 ? courses[0].id : ""));
    setFormFacultyId(batch.faculty_id || (facultyList.length > 0 ? facultyList[0].id : ""));
    setFormStartDate(batch.start_date || "");
    setFormEndDate(batch.end_date || "");
    setFormCapacity(batch.capacity?.toString() || "30");
    setFormStatus(batch.status || "Ongoing");
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

  const handleEditBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatch) return;
    try {
      await api.put(`/batches/${selectedBatch.id}`, {
        name: formName, course_id: formCourseId, faculty_id: formFacultyId,
        start_date: formStartDate, end_date: formEndDate, capacity: Number(formCapacity),
        status: formStatus
      });
      setEditModalOpen(false);
      fetchData();
    } catch (e) { alert("Failed to edit batch."); }
  };

  const handleDeleteBatch = async () => {
    if (!selectedBatch) return;
    try {
      await api.delete(`/batches/${selectedBatch.id}`);
      setDeleteModalOpen(false);
      fetchData();
    } catch (e) { alert("Failed to delete batch."); }
  };

  const handleAssignStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatch || !targetStudentId) return;

    try {
      await api.post(`/batches/${selectedBatch.id}/assign-student`, { student_id: targetStudentId });
      setAssignStudentModalOpen(false);
      setTargetStudentId("");
      fetchData();
    } catch (e) {
      alert("Failed to assign student.");
    }
  };

  const handleTransferStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatch || !targetStudentId || !targetBatchId) return;

    try {
      await api.post(`/batches/${selectedBatch.id}/transfer-student`, {
        student_id: targetStudentId,
        target_batch_id: targetBatchId
      });
      setTransferModalOpen(false);
      setTargetStudentId("");
      setTargetBatchId("");
      fetchData();
    } catch (e) {
      alert("Failed to transfer student.");
    }
  };

  const handleAssignFaculty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatch || !targetFacultyId) return;

    try {
      await api.post(`/batches/${selectedBatch.id}/assign-faculty`, { faculty_id: targetFacultyId });
      setAssignFacultyModalOpen(false);
      fetchData();
    } catch (e) {
      alert("Failed to assign faculty.");
    }
  };

  const filtered = batches.filter(b => {
    const matchSearch = b.name?.toLowerCase().includes(search.toLowerCase()) ||
      b.course_name?.toLowerCase().includes(search.toLowerCase()) ||
      b.id?.toLowerCase().includes(search.toLowerCase());
    const matchTab = activeTab === "all" ||
      (activeTab === "ongoing" && b.status === "Ongoing") ||
      (activeTab === "upcoming" && b.status === "Starting Soon") ||
      (activeTab === "completed" && b.status === "Completed") ||
      (activeTab === "delayed" && b.status === "Delayed");
    const matchCourse = courseFilter === "All" || b.course_id?.toString() === courseFilter.toString();
    return matchSearch && matchTab && matchCourse;
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Batch Management</h2>
          <p className="text-sm text-slate-500 mt-1">Create batches, assign faculty/students, and track timeline progressions.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchData} className="p-2 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 transition" title="Refresh">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={openCreateModal} className="bg-indigo-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-indigo-700 transition shadow-sm flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create New Batch
          </button>
        </div>
      </div>

      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {["all", "ongoing", "upcoming", "completed", "delayed"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all capitalize ${
              activeTab === tab ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-50/30">
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search batches by name, course or ID..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm"
            />
          </div>
          <div className="relative">
            <button 
              onClick={() => setFilterOpen(!filterOpen)}
              className={`p-2.5 border rounded-xl transition shadow-sm ${filterOpen ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
              <Filter className="w-4 h-4" />
            </button>
            {filterOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-slate-100 rounded-xl shadow-xl z-10 p-4 animate-in fade-in slide-in-from-top-2">
                <div className="text-xs font-bold text-slate-700 uppercase mb-2">Filter by Course</div>
                <select 
                  value={courseFilter}
                  onChange={e => setCourseFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-sm outline-none"
                >
                  <option value="All">All Courses</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className="p-12 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-bold tracking-wider">
                <tr>
                  <th className="px-6 py-4">Batch Details</th>
                  <th className="px-6 py-4">Assigned Faculty</th>
                  <th className="px-6 py-4">Start/End Date</th>
                  <th className="px-6 py-4 text-center">Students</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((batch) => (
                  <tr key={batch.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{batch.name}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{batch.course_name}</div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-700">{batch.faculty_name}</td>
                    <td className="px-6 py-4 text-slate-500 text-xs">
                      <div>Start: {batch.start_date}</div>
                      <div>End: {batch.end_date}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="font-bold text-slate-900">{batch.enrolled_count}</div>
                      <div className="text-[10px] text-slate-400 italic">Cap: {batch.capacity}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                        batch.status === 'Ongoing' ? 'bg-blue-100 text-blue-700' :
                        batch.status === 'Starting Soon' ? 'bg-amber-100 text-amber-700' :
                        batch.status === 'Delayed' ? 'bg-rose-100 text-rose-700' :
                        'bg-slate-200 text-slate-600'
                      }`}>
                        {batch.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button 
                          onClick={() => { setSelectedBatch(batch); setAssignStudentModalOpen(true); }} 
                          className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-1.5 rounded-lg flex items-center gap-1 transition"
                          title="Assign Student"
                        >
                          <UserPlus className="w-3.5 h-3.5" /> Student
                        </button>
                        <button 
                          onClick={() => { setSelectedBatch(batch); setTransferModalOpen(true); }}
                          className="bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-bold px-2 py-1.5 rounded-lg flex items-center gap-1 transition"
                          title="Transfer Student"
                        >
                          <ArrowLeftRight className="w-3.5 h-3.5" /> Transfer
                        </button>
                        <button 
                          onClick={() => { setSelectedBatch(batch); setAssignFacultyModalOpen(true); }}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-2 py-1.5 rounded-lg flex items-center gap-1 transition"
                          title="Assign Faculty"
                        >
                          <Calendar className="w-3.5 h-3.5" /> Reassign
                        </button>
                        <button 
                          onClick={() => openEditModal(batch)}
                          className="bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold px-2 py-1.5 rounded-lg flex items-center gap-1 transition"
                          title="Edit Batch"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => { setSelectedBatch(batch); setDeleteModalOpen(true); }}
                          className="bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold px-2 py-1.5 rounded-lg flex items-center gap-1 transition"
                          title="Delete Batch"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400 text-sm">No batches found.</td></tr>
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
              <h3 className="text-lg font-bold text-slate-900">Create New Batch</h3>
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
                  placeholder="e.g. Frontend Intensive B3"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Select Course</label>
                <select 
                  value={formCourseId}
                  onChange={e => setFormCourseId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Select Faculty</label>
                <select 
                  value={formFacultyId}
                  onChange={e => setFormFacultyId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
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
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">End Date</label>
                  <input 
                    type="date" 
                    required
                    value={formEndDate}
                    onChange={e => setFormEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Max Batch Capacity</label>
                <input 
                  type="number" 
                  required
                  value={formCapacity}
                  onChange={e => setFormCapacity(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button type="button" onClick={() => setCreateModalOpen(false)} className="px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition font-semibold">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition font-semibold">Create Batch</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Student Modal */}
      {assignStudentModalOpen && selectedBatch && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Assign Student to {selectedBatch.name}</h3>
              <button onClick={() => setAssignStudentModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition p-1"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAssignStudent} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Select Student</label>
                <select 
                  value={targetStudentId}
                  onChange={e => setTargetStudentId(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-sm outline-none"
                >
                  <option value="">-- Choose Student --</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.email})</option>
                  ))}
                </select>
              </div>
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button type="button" onClick={() => setAssignStudentModalOpen(false)} className="px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition font-semibold">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition font-semibold">Assign Student</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transfer Student Modal */}
      {transferModalOpen && selectedBatch && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Transfer Student from {selectedBatch.name}</h3>
              <button onClick={() => setTransferModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition p-1"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleTransferStudent} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Select Student</label>
                <select 
                  value={targetStudentId}
                  onChange={e => setTargetStudentId(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-sm outline-none"
                >
                  <option value="">-- Choose Student --</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.email})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Destination Batch</label>
                <select 
                  value={targetBatchId}
                  onChange={e => setTargetBatchId(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-sm outline-none"
                >
                  <option value="">-- Choose Target Batch --</option>
                  {batches.filter(b => b.id !== selectedBatch.id).map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button type="button" onClick={() => setTransferModalOpen(false)} className="px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition font-semibold">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm hover:bg-amber-700 transition font-semibold">Transfer Student</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Faculty Modal */}
      {assignFacultyModalOpen && selectedBatch && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Reassign Faculty to {selectedBatch.name}</h3>
              <button onClick={() => setAssignFacultyModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition p-1"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAssignFaculty} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Assigned Faculty Member</label>
                <select 
                  value={targetFacultyId}
                  onChange={e => setTargetFacultyId(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-sm outline-none"
                >
                  {facultyList.map(f => (
                    <option key={f.id} value={f.id}>{f.name} ({f.specialization || "Faculty"})</option>
                  ))}
                </select>
              </div>
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button type="button" onClick={() => setAssignFacultyModalOpen(false)} className="px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition font-semibold">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition font-semibold">Assign Faculty</button>
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
              <h3 className="text-lg font-bold text-slate-900">Edit Batch</h3>
              <button onClick={() => setEditModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition p-1"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleEditBatch} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Batch Name</label>
                <input type="text" required value={formName} onChange={e => setFormName(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Select Course</label>
                  <select value={formCourseId} onChange={e => setFormCourseId(e.target.value)} className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-sm outline-none">
                    {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Select Faculty</label>
                  <select value={formFacultyId} onChange={e => setFormFacultyId(e.target.value)} className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-sm outline-none">
                    {facultyList.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Start Date</label>
                  <input type="date" required value={formStartDate} onChange={e => setFormStartDate(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">End Date</label>
                  <input type="date" required value={formEndDate} onChange={e => setFormEndDate(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Max Capacity</label>
                  <input type="number" required value={formCapacity} onChange={e => setFormCapacity(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Status</label>
                  <select value={formStatus} onChange={e => setFormStatus(e.target.value)} className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-sm outline-none">
                    <option value="Starting Soon">Starting Soon</option>
                    <option value="Ongoing">Ongoing</option>
                    <option value="Completed">Completed</option>
                    <option value="Delayed">Delayed</option>
                  </select>
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button type="button" onClick={() => setEditModalOpen(false)} className="px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition font-semibold">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition font-semibold">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && selectedBatch && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden animate-in zoom-in-95 duration-200 p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Delete Batch?</h3>
            <p className="text-sm text-slate-500 mb-6">Are you sure you want to delete <strong>{selectedBatch.name}</strong>? This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteModalOpen(false)} className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 font-bold transition">Cancel</button>
              <button onClick={handleDeleteBatch} className="flex-1 px-4 py-2 bg-rose-600 text-white rounded-lg text-sm hover:bg-rose-700 font-bold transition">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
