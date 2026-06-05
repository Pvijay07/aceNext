import React, { useState } from "react";
import { Upload, BookOpen, Link as LinkIcon, Check } from "lucide-react";
import { api } from "../../api";

export default function FacultyLessons() {
  const [materialTitle, setMaterialTitle] = useState("");
  const [materialFile, setMaterialFile] = useState<File | null>(null);
  
  const [assignTitle, setAssignTitle] = useState("");
  const [assignDesc, setAssignDesc] = useState("");

  const [message, setMessage] = useState("");

  const handleUploadMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!materialFile) return;
    
    // Mock upload success
    setTimeout(() => {
      setMessage("✓ Material uploaded successfully!");
      setMaterialTitle("");
      setMaterialFile(null);
      setTimeout(() => setMessage(""), 3000);
    }, 500);
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    // Mock create assignment
    setTimeout(() => {
      setMessage("✓ Assignment Published!");
      setAssignTitle(""); 
      setAssignDesc("");
      setTimeout(() => setMessage(""), 3000);
    }, 500);
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
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl font-bold transition shadow-sm mt-2">
              Distribute to Batch
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
            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-xl font-bold transition shadow-sm mt-2">
              Post Assignment
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
