import React, { useEffect, useState } from "react";
import { FileText, Upload, CheckCircle, AlertCircle } from "lucide-react";
import { api } from "../../api";

export default function AssignmentsList({ courseId }: { courseId: string }) {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [submissionFile, setSubmissionFile] = useState<File | null>(null);
  const [activeAssignmentId, setActiveAssignmentId] = useState<number | null>(null);

  useEffect(() => {
    api.get(`/assignments?course_id=${courseId}`).then(setAssignments).catch(console.error);
  }, [courseId]);

  const handleSubmit = async (e: React.FormEvent, id: number) => {
    e.preventDefault();
    if (!submissionFile) return;

    const formData = new FormData();
    formData.append("file", submissionFile);

    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`http://localhost:8000/api/assignments/${id}/submit`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData
      });
      if (!res.ok) throw new Error("Submit failed");
      alert("Assignment submitted successfully! Our AI is evaluating it.");
      setSubmissionFile(null);
      setActiveAssignmentId(null);
    } catch (err) {
      alert("Submission failed.");
    }
  };

  return (
    <div className="space-y-6 mt-8 border-t border-slate-800 pt-8">
      <h3 className="text-xl font-bold mb-4 flex items-center text-white">
        <FileText className="w-5 h-5 mr-2 text-indigo-400"/> Course Assignments
      </h3>
      {assignments.length === 0 ? (
        <p className="text-slate-400">No assignments posted yet.</p>
      ) : (
        <div className="grid gap-6">
          {assignments.map((a) => (
            <div key={a.id} className="bg-slate-800 border border-slate-700 p-6 rounded-xl">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-semibold text-lg text-white">{a.title}</h4>
                  <p className="text-sm text-slate-400 mt-1">{a.description}</p>
                  {a.deadline && (
                    <span className="text-xs bg-red-900/50 text-red-400 px-2 py-1 rounded mt-2 inline-block">
                      Due: {new Date(a.deadline).toLocaleDateString()}
                    </span>
                  )}
                </div>
                {activeAssignmentId !== a.id && (
                  <button 
                    onClick={() => setActiveAssignmentId(a.id)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition"
                  >
                    Submit Work
                  </button>
                )}
              </div>
              
              {activeAssignmentId === a.id && (
                <form onSubmit={(e) => handleSubmit(e, a.id)} className="mt-4 p-4 bg-slate-900 rounded border border-slate-700">
                  <h5 className="font-medium text-white mb-3">Upload your submission file:</h5>
                  <div className="flex items-center space-x-4">
                    <input 
                      type="file" 
                      onChange={e => setSubmissionFile(e.target.files?.[0] || null)} 
                      required 
                      className="flex-1 bg-slate-800 p-2 rounded text-slate-300" 
                    />
                    <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded font-bold flex items-center transition">
                      <Upload className="w-4 h-4 mr-2" /> Upload
                    </button>
                    <button type="button" onClick={() => setActiveAssignmentId(null)} className="text-slate-400 hover:text-white px-4">Cancel</button>
                  </div>
                </form>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
