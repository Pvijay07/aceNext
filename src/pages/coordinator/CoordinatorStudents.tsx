import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Mail,
  Phone,
  ExternalLink,
  FileCheck,
  RefreshCw,
  Plus,
  X,
  Upload,
  Check,
  AlertCircle,
  Edit,
  Trash2,
} from "lucide-react";
import { api } from "../../api";

export default function CoordinatorStudents() {
  const [students, setStudents] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [batchFilter, setBatchFilter] = useState("All");

  // Modals
  const [admissionModalOpen, setAdmissionModalOpen] = useState(false);
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);

  // Form states
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formQualification, setFormQualification] = useState("");
  const [formCourseId, setFormCourseId] = useState("");
  const [formStatus, setFormStatus] = useState("Pending");

  // Approval state
  const [approvalRemarks, setApprovalRemarks] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const studentData = await api.get("/students");
      setStudents(studentData);

      const courseData = await api.get("/courses");
      setCourses(courseData);
      if (courseData.length > 0) setFormCourseId(courseData[0].id);

      const batchData = await api.get("/batches");
      setBatches(batchData);
    } catch (e) {
      console.error("Failed to load coordinator student data", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAdmissionModal = () => {
    setFormName("");
    setFormEmail("");
    setFormPhone("");
    setFormQualification("");
    if (courses.length > 0) setFormCourseId(courses[0].id);
    setFormStatus("Pending");
    setAdmissionModalOpen(true);
  };

  const handleAddAdmission = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: formName,
      email: formEmail,
      phone: formPhone,
      qualification: formQualification,
      course_id: formCourseId,
      status: formStatus,
    };

    try {
      await api.post("/students", payload);
      setAdmissionModalOpen(false);
      fetchData();
    } catch (e) {
      alert("Failed to submit student admission.");
    }
  };

  const openEditModal = (student: any) => {
    setSelectedStudent(student);
    setFormName(student.name || "");
    setFormEmail(student.email || "");
    setFormPhone(student.phone || "");
    setFormQualification(student.qualification || "");
    setFormStatus(student.admission_status || "Pending");
    setEditModalOpen(true);
  };

  const handleEditStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    try {
      await api.put(`/students/${selectedStudent.id}`, {
        name: formName, email: formEmail, phone: formPhone, qualification: formQualification, status: formStatus
      });
      setEditModalOpen(false);
      fetchData();
    } catch (e) { alert("Failed to edit student."); }
  };

  const handleDeleteStudent = async () => {
    if (!selectedStudent) return;
    try {
      await api.delete(`/students/${selectedStudent.id}`);
      setDeleteModalOpen(false);
      fetchData();
    } catch (e) { alert("Failed to delete student."); }
  };

  const handleVerifyAdmission = async (
    studentId: string,
    status: "Approved" | "Rejected",
  ) => {
    try {
      await api.post(`/students/${studentId}/admission-status`, {
        status,
        remarks: approvalRemarks,
      });
      setVerifyModalOpen(false);
      setApprovalRemarks("");
      fetchData();
    } catch (e) {
      alert("Failed to update student admission status.");
    }
  };

  const filtered = students.filter((s) => {
    const matchSearch =
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.id?.toLowerCase().includes(search.toLowerCase()) ||
      s.email?.toLowerCase().includes(search.toLowerCase());

    // Checks if the student is assigned to batchFilter or if batchFilter is All
    const matchBatch =
      batchFilter === "All" || (s.batches && s.batches.includes(batchFilter));

    return matchSearch && matchBatch;
  });

  const uniqueBatches = Array.from(new Set(batches.map((b) => b.name)));

  const atRiskCount = students.filter(
    (s) => s.status === "inactive" || s.admission_status === "Pending",
  ).length;
  const activeCount = students.filter(
    (s) => s.status === "active" && s.admission_status === "Approved",
  ).length;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Student Coordination
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Verify documents, manage admissions, and approve enrollments.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchData}
            className="p-2 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 transition"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={openAdmissionModal}
            className="bg-indigo-600 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-indigo-700 transition shadow-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add New Admission
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl">
          <p className="text-xs font-bold text-blue-600 uppercase">
            Pending & Inactive admissions
          </p>
          <h4 className="text-2xl font-black text-blue-900 mt-1">
            {loading ? "—" : atRiskCount}
          </h4>
        </div>
        <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl">
          <p className="text-xs font-bold text-emerald-600 uppercase">
            Active / Approved Students
          </p>
          <h4 className="text-2xl font-black text-emerald-900 mt-1">
            {loading ? "—" : activeCount}
          </h4>
        </div>
        <div className="bg-purple-50 border border-purple-100 p-4 rounded-2xl">
          <p className="text-xs font-bold text-purple-600 uppercase">
            Total Applications
          </p>
          <h4 className="text-2xl font-black text-purple-900 mt-1">
            {loading ? "—" : students.length}
          </h4>
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-50/30">
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by student name, ID or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={batchFilter}
              onChange={(e) => setBatchFilter(e.target.value)}
              className="bg-white border border-slate-200 text-sm rounded-xl px-4 py-2 text-slate-700 shadow-sm outline-none"
            >
              <option value="All">All Batches</option>
              {uniqueBatches.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
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
                  <th className="px-6 py-4">Student Details</th>
                  <th className="px-6 py-4">Course Enrolled</th>
                  <th className="px-6 py-4">Admission Status</th>
                  <th className="px-6 py-4">Assigned Batch</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((student) => (
                  <tr
                    key={student.id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600">
                          {student.name?.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">
                            {student.name}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            {student.id}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {student.email} • {student.phone}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-700">
                      {student.enrolled_course}
                      <div className="text-[10px] text-slate-400 italic">
                        Qual: {student.qualification}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                          student.admission_status === "Approved"
                            ? "bg-emerald-100 text-emerald-700"
                            : student.admission_status === "Rejected"
                              ? "bg-rose-100 text-rose-700"
                              : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {student.admission_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-600">
                      {student.batches && student.batches.length > 0
                        ? student.batches.join(", ")
                        : "Unassigned"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {student.admission_status === "Pending" ? (
                          <button
                            onClick={() => {
                              setSelectedStudent(student);
                              setVerifyModalOpen(true);
                            }}
                            className="bg-indigo-50 text-indigo-700 font-bold px-2 py-1.5 rounded-lg hover:bg-indigo-100 transition text-xs flex items-center gap-1"
                          >
                            <FileCheck className="w-3.5 h-3.5" /> Verify
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400 px-2 font-bold">
                            Verified
                          </span>
                        )}
                        <button
                          onClick={() => openEditModal(student)}
                          className="bg-slate-50 hover:bg-slate-100 text-slate-700 p-1.5 rounded-lg transition"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedStudent(student);
                            setDeleteModalOpen(true);
                          }}
                          className="bg-rose-50 hover:bg-rose-100 text-rose-700 p-1.5 rounded-lg transition"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center text-slate-400 text-sm"
                    >
                      No students found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Admission Modal */}
      {admissionModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">
                Add New Admission Application
              </h3>
              <button
                onClick={() => setAdmissionModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddAdmission} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Student Full Name
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Amit Verma"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Email ID
                </label>
                <input
                  type="email"
                  required
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Mobile Number
                  </label>
                  <input
                    type="text"
                    required
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="+91 9988776655"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Highest Qualification
                  </label>
                  <input
                    type="text"
                    required
                    value={formQualification}
                    onChange={(e) => setFormQualification(e.target.value)}
                    placeholder="e.g. B.Tech IT"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Enroll Course
                </label>
                <select
                  value={formCourseId}
                  onChange={(e) => setFormCourseId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex items-center gap-3">
                <Upload className="w-5 h-5 text-slate-400" />
                <div className="text-left">
                  <div className="text-xs font-bold text-slate-700">
                    Marksheet / Documents Uploaded
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Verify documents logic simulated locally.
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAdmissionModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition font-semibold"
                >
                  Submit Admission
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Verify & Approve Modal */}
      {verifyModalOpen && selectedStudent && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">
                Verify Student Marksheets
              </h3>
              <button
                onClick={() => setVerifyModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-amber-50 border border-amber-100 p-3.5 rounded-xl flex gap-3 text-amber-800">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <div className="text-xs">
                  <span className="font-bold">Verification Checklist:</span>{" "}
                  Verify that the name on the ID card matches the academic
                  certificate files.
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-xs text-slate-400 font-bold uppercase">
                  Applicant Name
                </div>
                <div className="text-sm font-bold text-slate-900">
                  {selectedStudent.name}
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-xs text-slate-400 font-bold uppercase">
                  Course Enrolled
                </div>
                <div className="text-sm font-bold text-slate-900">
                  {selectedStudent.enrolled_course}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Approval Remarks / Reason for status
                </label>
                <input
                  type="text"
                  value={approvalRemarks}
                  onChange={(e) => setApprovalRemarks(e.target.value)}
                  placeholder="e.g. Document verified, eligible for enrollment."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button
                  onClick={() =>
                    handleVerifyAdmission(selectedStudent.id, "Rejected")
                  }
                  className="px-4 py-2 border border-rose-200 text-rose-600 rounded-lg text-sm hover:bg-rose-50 font-bold transition"
                >
                  Reject
                </button>
                <button
                  onClick={() =>
                    handleVerifyAdmission(selectedStudent.id, "Approved")
                  }
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700 font-bold transition flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  Verify & Approve
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Edit Student Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Edit Student</h3>
              <button onClick={() => setEditModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition p-1"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleEditStudent} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Student Full Name</label>
                <input type="text" required value={formName} onChange={e => setFormName(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Email ID</label>
                <input type="email" required value={formEmail} onChange={e => setFormEmail(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Mobile Number</label>
                  <input type="text" value={formPhone} onChange={e => setFormPhone(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Qualification</label>
                  <input type="text" value={formQualification} onChange={e => setFormQualification(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Admission Status</label>
                <select value={formStatus} onChange={e => setFormStatus(e.target.value)} className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none">
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
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
      {deleteModalOpen && selectedStudent && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden animate-in zoom-in-95 duration-200 p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Delete Student?</h3>
            <p className="text-sm text-slate-500 mb-6">Are you sure you want to delete <strong>{selectedStudent.name}</strong>? This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteModalOpen(false)} className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 font-bold transition">Cancel</button>
              <button onClick={handleDeleteStudent} className="flex-1 px-4 py-2 bg-rose-600 text-white rounded-lg text-sm hover:bg-rose-700 font-bold transition">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
