import React, { useEffect, useState } from "react";
import { FileText, Send, CheckCircle, Award, AlertCircle, RefreshCw } from "lucide-react";
import { api } from "../../api";

export default function AssignmentsList({ courseId }: { courseId: string }) {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [submissionText, setSubmissionText] = useState("");
  const [activeAssignmentId, setActiveAssignmentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchAssignments = () => {
    setLoading(true);
    api.get(`/assignments?course_id=${courseId}`)
      .then(setAssignments)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAssignments();
  }, [courseId]);

  const handleSubmit = async (e: React.FormEvent, id: string) => {
    e.preventDefault();
    if (!submissionText.trim()) return;

    try {
      await api.post(`/assignments/${id}/submit`, { text_answer: submissionText });
      alert("✓ Submission received! Gemini AI Grader has evaluated your work.");
      setSubmissionText("");
      setActiveAssignmentId(null);
      fetchAssignments();
    } catch (err) {
      alert("Submission failed. Please try again.");
    }
  };

  return (
    <div className="space-y-6 mt-8 border-t border-slate-700 pt-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold flex items-center text-white">
          <FileText className="w-5 h-5 mr-2 text-indigo-400"/> Course Assignments
        </h3>
        <button onClick={fetchAssignments} className="p-1.5 text-slate-400 hover:text-white transition">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {loading && assignments.length === 0 ? (
        <div className="p-8 flex justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-400"></div>
        </div>
      ) : assignments.length === 0 ? (
        <p className="text-slate-400">No assignments posted yet.</p>
      ) : (
        <div className="grid gap-6">
          {assignments.map((a) => (
            <div key={a.id} className="bg-slate-800 border border-slate-700 p-6 rounded-xl">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                <div className="flex-1">
                  <h4 className="font-semibold text-lg text-white">{a.title}</h4>
                  <p className="text-sm text-slate-400 mt-1">{a.description}</p>
                  {a.deadline && (
                    <span className="text-xs bg-red-950 text-red-400 px-2 py-0.5 rounded border border-red-900 mt-2 inline-block">
                      Due: {new Date(a.deadline).toLocaleDateString()}
                    </span>
                  )}
                </div>

                <div className="shrink-0">
                  {a.submission ? (
                    <div className="flex flex-col items-end gap-1">
                      <span className="bg-emerald-950 text-emerald-400 px-2.5 py-1 rounded-lg text-xs font-bold border border-emerald-900 flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" />
                        {a.submission.status}
                      </span>
                      <span className="text-sm font-bold text-white mt-1">Score: {a.submission.score}/100</span>
                    </div>
                  ) : (
                    activeAssignmentId !== a.id && (
                      <button 
                        onClick={() => setActiveAssignmentId(a.id)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition text-sm"
                      >
                        Submit Work
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Show AI Feedback if submitted */}
              {a.submission && (
                <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 mt-3 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs text-indigo-400 font-bold uppercase tracking-wider">
                    <Award className="w-4 h-4" />
                    <span>Grading & Feedback Review</span>
                  </div>
                  {a.submission.faculty_score !== null ? (
                    <div className="space-y-1">
                      <p className="text-xs text-slate-300 font-medium">Instructor Feedback: "{a.submission.faculty_feedback || "Excellent effort!"}"</p>
                      <p className="text-[10px] text-slate-500">Instructor score overrides AI score.</p>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-300 font-medium leading-relaxed font-sans">{a.submission.ai_feedback}</p>
                  )}
                </div>
              )}
              
              {activeAssignmentId === a.id && (
                <form onSubmit={(e) => handleSubmit(e, a.id)} className="mt-4 p-4 bg-slate-900 rounded-xl border border-slate-700 space-y-4">
                  <h5 className="font-semibold text-sm text-white">Enter your submission (text answer or source code):</h5>
                  <textarea 
                    rows={6}
                    required
                    value={submissionText}
                    onChange={e => setSubmissionText(e.target.value)}
                    placeholder="function mySolution() { ... }"
                    className="w-full bg-slate-800 p-3 rounded-lg text-slate-200 text-sm font-mono border border-slate-700 focus:outline-none focus:border-indigo-500"
                  />
                  <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => { setActiveAssignmentId(null); setSubmissionText(""); }} className="text-xs text-slate-400 hover:text-white px-3 font-semibold">Cancel</button>
                    <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center transition">
                      <Send className="w-3.5 h-3.5 mr-1.5" /> Submit Assignment
                    </button>
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
