import React, { useState, useEffect } from "react";
import { PlusCircle, Search, Edit, Eye, Trash2, Filter, RefreshCw, X } from "lucide-react";
import { api } from "../../api";

export default function AdminCourses() {
  const [courses, setCourses] = useState<any[]>([]);
  const [facultyList, setFacultyList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any | null>(null);
  
  // Form states
  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formDuration, setFormDuration] = useState("12 Weeks");
  const [formPrice, setFormPrice] = useState("15000");
  const [formMentorId, setFormMentorId] = useState("");
  const [formStatus, setFormStatus] = useState("published");

  const fetchFaculty = async () => {
    try {
      const data = await api.get("/faculty");
      setFacultyList(data);
      if (data.length > 0 && !formMentorId) {
        setFormMentorId(data[0].id);
      }
    } catch (e) {
      console.warn("Failed to fetch faculty list", e);
    }
  };

  const fetchCourses = () => {
    setLoading(true);
    api.get("/courses")
      .then((data) => {
        if (Array.isArray(data)) {
          setCourses(data.map((c: any) => ({
            id: c.id?.toString() || c.id,
            name: c.title || c.name,
            description: c.description || "",
            duration: c.duration || "12 Weeks",
            fee: c.price !== undefined ? `₹${Number(c.price).toLocaleString()}` : "₹15,000",
            price: c.price || 0,
            modules: c.modules?.length ?? 0,
            mentor_id: c.mentor_id || "",
            faculty: c.faculty_name || (c.faculty ? c.faculty.name : "—"),
            batches: c.batches_count ?? 0,
            status: c.status === 'published' ? 'Active' : 'Inactive',
          })));
        }
      })
      .catch((e) => {
        console.error("Failed to load courses", e);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCourses();
    fetchFaculty();
  }, []);

  const openCreateModal = () => {
    setEditingCourse(null);
    setFormTitle("");
    setFormDesc("");
    setFormDuration("12 Weeks");
    setFormPrice("15000");
    if (facultyList.length > 0) {
      setFormMentorId(facultyList[0].id);
    }
    setFormStatus("published");
    setModalOpen(true);
  };

  const openEditModal = (course: any) => {
    setEditingCourse(course);
    setFormTitle(course.name);
    setFormDesc(course.description);
    setFormDuration(course.duration);
    setFormPrice(course.price.toString());
    setFormMentorId(course.mentor_id || (facultyList.length > 0 ? facultyList[0].id : ""));
    setFormStatus(course.status === 'Active' ? 'published' : 'draft');
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title: formTitle,
      description: formDesc,
      duration: formDuration,
      price: Number(formPrice) || 0,
      mentor_id: formMentorId,
      status: formStatus
    };

    try {
      if (editingCourse) {
        await api.put(`/courses/${editingCourse.id}`, payload);
      } else {
        await api.post("/courses", payload);
      }
      setModalOpen(false);
      fetchCourses();
    } catch (e) {
      alert("Failed to save course details.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this course?")) return;
    try {
      await api.delete(`/courses/${id}`);
      fetchCourses();
    } catch (e) {
      alert("Failed to delete course.");
    }
  };

  const handleToggleStatus = async (course: any) => {
    const nextStatus = course.status === 'Active' ? 'draft' : 'published';
    try {
      await api.put(`/courses/${course.id}`, { status: nextStatus });
      fetchCourses();
    } catch (e) {
      alert("Failed to toggle course status.");
    }
  };

  const filtered = courses.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.id?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Courses Management</h2>
          <p className="text-sm text-slate-500 mt-1">Manage course catalog, fees, and faculty assignments.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchCourses} className="p-2 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 transition" title="Refresh">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={openCreateModal} className="bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-sm flex items-center gap-2">
            <PlusCircle className="w-4 h-4" />
            Add New Course
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search courses..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <button className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition">
            <Filter className="w-4 h-4" /> Filters
          </button>
        </div>

        {loading ? (
          <div className="p-12 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/50 text-xs uppercase text-slate-500 font-bold tracking-wider">
                <tr>
                  <th className="px-6 py-4">Course</th>
                  <th className="px-6 py-4">Duration</th>
                  <th className="px-6 py-4">Total Fee</th>
                  <th className="px-6 py-4">Faculty Mentor</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((course) => (
                  <tr key={course.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{course.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">{course.id} • {course.modules} Modules</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{course.duration}</td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-900">{course.fee}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{course.faculty}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button 
                        onClick={() => handleToggleStatus(course)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition ${
                          course.status === 'Active' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                      >
                        {course.status}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEditModal(course)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition" title="Edit"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(course.id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition" title="Delete"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400 text-sm">No courses found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Course Modal Form */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-250">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">{editingCourse ? "Edit Course" : "Create New Course"}</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Course Title</label>
                <input 
                  type="text" 
                  required
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  placeholder="e.g. Mastering Next.js"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Description</label>
                <textarea 
                  required
                  rows={3}
                  value={formDesc}
                  onChange={e => setFormDesc(e.target.value)}
                  placeholder="Course brief description and target outcomes..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Duration</label>
                  <input 
                    type="text" 
                    required
                    value={formDuration}
                    onChange={e => setFormDuration(e.target.value)}
                    placeholder="e.g. 12 Weeks"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Price (Fee in ₹)</label>
                  <input 
                    type="number" 
                    required
                    value={formPrice}
                    onChange={e => setFormPrice(e.target.value)}
                    placeholder="e.g. 15000"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Faculty Mentor</label>
                  <select 
                    value={formMentorId}
                    onChange={e => setFormMentorId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                  >
                    {facultyList.map(f => (
                      <option key={f.id} value={f.id}>{f.name} ({f.specialization || "Faculty"})</option>
                    ))}
                    {facultyList.length === 0 && <option value="">No Faculty available</option>}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Status</label>
                  <select 
                    value={formStatus}
                    onChange={e => setFormStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                  >
                    <option value="published">Active / Published</option>
                    <option value="draft">Draft / Inactive</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button 
                  type="button" 
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition font-semibold"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition font-semibold"
                >
                  {editingCourse ? "Save Changes" : "Create Course"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
