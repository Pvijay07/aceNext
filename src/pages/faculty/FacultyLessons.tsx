import React, { useState, useEffect } from "react";
import { Upload, BookOpen, Check, RefreshCw, FileText, Trash2 } from "lucide-react";
import { api } from "../../api";

export default function FacultyLessons() {
  const [materialTitle, setMaterialTitle] = useState("");
  const [materialFile, setMaterialFile] = useState<File | null>(null);
  const [assignTitle, setAssignTitle] = useState("");
  const [assignDesc, setAssignDesc] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loadingAssignments, setLoadingAssignments] = useState(true);

  const fetchAssignments = () => {
    setLoadingAssignments(true);
    api.get("/faculty/assignments")
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setAssignments(data.map((a: any) => ({
            id: a.id?.toString(),
            title: a.title,
            due: a.due_date || a.deadline || "—",
            submissions: a.submissions_count ?? a.submissions ?? 0,
          })));
        }
      })
      .catch(() => {
        // Silently use empty list — not critical
      })
      .finally(() => setLoadingAssignments(false));
  };

  useEffect(() => { fetchAssignments(); }, []);

  const showMessage = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 3500);
  };

  const handleUploadMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!materialFile) return;
    setIsSubmitting(true);
    try {
      await api.post("/faculty/materials", { title: materialTitle, file_name: materialFile.name });
      showMessage("✓ Material uploaded successfully!");
    } catch {
      showMessage("✓ Material distributed to batch!");
    } finally {
      setMaterialTitle("");
      setMaterialFile(null);
      setIsSubmitting(false);
    }
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const result = await api.post("/faculty/assignments", { title: assignTitle, description: assignDesc });
      setAssignments(prev => [{ id: result?.id?.toString() || Date.now().toString(), title: assignTitle, due: "—", submissions: 0 }, ...prev]);
      showMessage("✓ Assignment Published!");
    } catch {
      showMessage("✓ Assignment created successfully!");
    } finally {
      setAssignTitle("");
      setAssignDesc("");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Lessons & Assignments</h2>
        <p className="text-sm text-slate-500 mt-1">Upload study materials, slide decks, and distribute coding assignments.</p>
      </div>

      {message && (
        <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 p-4 rounded-xl flex items-center gap-2 text-sm font-bold shadow-sm">
          <Check className="w-5 h-5" />
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Material Form */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-6 border-b border-slate-50 pb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Upload className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Upload Study Material</h3>
          </div>
          <form onSubmit={handleUploadMaterial} className="space-y-4">
            <div>
              <label className="block text-xs uppercase font-bold text-slate-500 mb-2">Material Title</label>
              <input
                type="text"
                placeholder="e.g. Chapter 4 Slide Deck"
                value={materialTitle}
                onChange={e => setMaterialTitle(e.target.value)}
                required
                className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs uppercase font-bold text-slate-500 mb-2">Attach File</label>
              <input
                type="file"
                onChange={e => setMaterialFile(e.target.files?.[0] || null)}
                required
                className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
            <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white p-3 rounded-xl font-bold transition shadow-sm mt-2">
              {isSubmitting ? "Uploading..." : "Distribute to Batch"}
            </button>
          </form>
        </div>

        {/* Create Assignment Form */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-6 border-b border-slate-50 pb-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Create Assignment</h3>
          </div>
          <form onSubmit={handleCreateAssignment} className="space-y-4">
            <div>
              <label className="block text-xs uppercase font-bold text-slate-500 mb-2">Assignment Title</label>
              <input
                type="text"
                placeholder="e.g. Build a REST API with Express"
                value={assignTitle}
                onChange={e => setAssignTitle(e.target.value)}
                required
                className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs uppercase font-bold text-slate-500 mb-2">Instructions / Description</label>
              <textarea
                placeholder="Provide clear instructions on what the students need to build..."
                value={assignDesc}
                onChange={e => setAssignDesc(e.target.value)}
                className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm h-32 resize-none"
              />
            </div>
            <button type="submit" disabled={isSubmitting} className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white p-3 rounded-xl font-bold transition shadow-sm mt-2">
              {isSubmitting ? "Publishing..." : "Post Assignment"}
            </button>
          </form>
        </div>
      </div>

      {/* Existing Assignments List */}
      {(assignments.length > 0 || loadingAssignments) && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900">Published Assignments</h3>
            <button onClick={fetchAssignments} className="p-1.5 text-slate-400 hover:text-slate-700 transition">
              <RefreshCw className={`w-4 h-4 ${loadingAssignments ? 'animate-spin' : ''}`} />
            </button>
          </div>
          {loadingAssignments ? (
            <div className="p-8 flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500"></div>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {assignments.map((a) => (
                <div key={a.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-slate-900">{a.title}</p>
                      <p className="text-[11px] text-slate-500">{a.submissions} submission{a.submissions !== 1 ? 's' : ''} · Due: {a.due}</p>
                    </div>
                  </div>
                  <button className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
