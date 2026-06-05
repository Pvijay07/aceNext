import React, { useEffect, useState } from "react";
import { Check, CheckCircle2, FileCode2 } from "lucide-react";
import { api } from "../../api";

export default function FacultyEvaluation() {
  const [pendingSubmissions, setPendingSubmissions] = useState<any[]>([]);
  const [gradeInput, setGradeInput] = useState<Record<number, {score: string, feedback: string}>>({});
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Mocking pending submissions
    setPendingSubmissions([
      { id: 1, assignment: { title: "Build a REST API with Express" }, user_id: "ST-042", ai_score: 85, ai_feedback: "Good use of routing, but error handling is missing in the database controller.", file_type: "GitHub Repo" },
      { id: 2, assignment: { title: "React Component Library" }, user_id: "ST-019", ai_score: 92, ai_feedback: "Excellent component architecture. Props are typed perfectly.", file_type: "ZIP Archive" }
    ]);
  }, []);

  const handleGrade = async (subId: number) => {
    const input = gradeInput[subId];
    if (!input || !input.score) return;
    
    // Mock successful grading
    setTimeout(() => {
      setMessage(`✓ Grade overridden for submission #${subId}`);
      setPendingSubmissions(prev => prev.filter(s => s.id !== subId));
      setTimeout(() => setMessage(""), 4000);
    }, 500);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Assignment Evaluation</h2>
        <p className="text-sm text-slate-500 mt-1">Review student practicals, verify AI-generated scores, and provide human feedback.</p>
      </div>

      {message && (
        <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 p-4 rounded-xl flex items-center gap-2 text-sm font-bold shadow-sm">
          <CheckCircle2 className="w-5 h-5" />
          {message}
        </div>
      )}

      {pendingSubmissions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">All Caught Up!</h3>
          <p className="text-slate-500 mt-2">There are no pending assignment submissions to grade.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {pendingSubmissions.map((sub) => (
            <div key={sub.id} className="bg-white border border-slate-200 shadow-sm p-6 rounded-2xl group hover:border-blue-200 transition-colors">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 border-b border-slate-100 pb-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
                    <FileCode2 className="w-6 h-6 text-slate-500" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg text-slate-900">{sub.assignment?.title}</h4>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-semibold font-mono">Student ID: {sub.user_id}</span>
                      <span className="text-xs text-slate-500 font-medium">Type: {sub.file_type}</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 w-full md:w-80">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400">AI Tutor Analysis</span>
                    <span className="bg-indigo-100 text-indigo-700 px-2.5 py-0.5 rounded text-xs font-bold">
                      {sub.ai_score}/100
                    </span>
                  </div>
                  <p className="text-xs text-indigo-900/70 leading-relaxed font-medium">"{sub.ai_feedback}"</p>
                </div>
              </div>

              <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                <h5 className="text-xs uppercase tracking-wider font-bold text-slate-500 mb-3">Human Grade Override</h5>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="w-full sm:w-32">
                    <input 
                      type="number" 
                      placeholder="Score (0-100)" 
                      value={gradeInput[sub.id]?.score || ""}
                      onChange={e => setGradeInput({...gradeInput, [sub.id]: {...gradeInput[sub.id], score: e.target.value}})}
                      className="w-full bg-white p-2.5 rounded-lg text-slate-900 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm font-semibold" 
                    />
                  </div>
                  <div className="w-full flex-1">
                    <input 
                      type="text" 
                      placeholder="Add specific feedback for the student..." 
                      value={gradeInput[sub.id]?.feedback || ""}
                      onChange={e => setGradeInput({...gradeInput, [sub.id]: {...gradeInput[sub.id], feedback: e.target.value}})}
                      className="w-full bg-white p-2.5 rounded-lg text-slate-900 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm" 
                    />
                  </div>
                  <button 
                    onClick={() => handleGrade(sub.id)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-lg font-bold text-sm transition shadow-sm w-full sm:w-auto shrink-0"
                  >
                    Submit Grade
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
