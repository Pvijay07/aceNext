import React, { useState } from "react";
import { Plus, Video, Calendar, Link as LinkIcon, Check } from "lucide-react";
import { api } from "../../api";

export default function FacultyZoom() {
  const [topic, setTopic] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const [message, setMessage] = useState("");

  const handleScheduleClass = async (e: React.FormEvent) => {
    e.preventDefault();
    // Mock scheduling
    setTimeout(() => {
      setMessage("✓ Live class scheduled successfully! Notifications sent to batch.");
      setTopic(""); setDate(""); setTime(""); setMeetingLink("");
      setTimeout(() => setMessage(""), 4000);
    }, 500);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Live Classes</h2>
        <p className="text-sm text-slate-500 mt-1">Schedule and manage your interactive Zoom or Google Meet sessions.</p>
      </div>

      {message && (
        <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 p-4 rounded-xl flex items-center gap-2 text-sm font-bold shadow-sm">
          <Check className="w-5 h-5" />
          {message}
        </div>
      )}

      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8 pb-6 border-b border-slate-50">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Video className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Schedule New Session</h3>
              <p className="text-xs text-slate-500 mt-0.5">Fill out the details below to notify enrolled students.</p>
            </div>
          </div>
          
          <form onSubmit={handleScheduleClass} className="space-y-6">
            <div>
              <label className="block text-xs uppercase font-bold text-slate-500 mb-2 ml-1">Class Topic</label>
              <input 
                type="text" 
                placeholder="e.g. Advanced State Management in React" 
                value={topic} 
                onChange={e => setTopic(e.target.value)} 
                required 
                className="w-full bg-slate-50 p-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm font-medium transition-all hover:bg-white" 
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs uppercase font-bold text-slate-500 mb-2 ml-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> Date
                </label>
                <input 
                  type="date" 
                  value={date} 
                  onChange={e => setDate(e.target.value)} 
                  required 
                  className="w-full bg-slate-50 p-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm font-medium transition-all hover:bg-white" 
                />
              </div>
              <div>
                <label className="block text-xs uppercase font-bold text-slate-500 mb-2 ml-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> Time (IST)
                </label>
                <input 
                  type="time" 
                  value={time} 
                  onChange={e => setTime(e.target.value)} 
                  required 
                  className="w-full bg-slate-50 p-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm font-medium transition-all hover:bg-white" 
                />
              </div>
            </div>
            
            <div>
              <label className="block text-xs uppercase font-bold text-slate-500 mb-2 ml-1 flex items-center gap-1.5">
                <LinkIcon className="w-3.5 h-3.5" /> Meeting Link
              </label>
              <input 
                type="url" 
                placeholder="https://zoom.us/j/123456789" 
                value={meetingLink} 
                onChange={e => setMeetingLink(e.target.value)} 
                className="w-full bg-slate-50 p-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm font-medium transition-all hover:bg-white" 
              />
            </div>
            
            <button 
              type="submit" 
              className="w-full bg-slate-900 hover:bg-slate-800 text-white p-4 rounded-2xl font-bold transition shadow-xl shadow-slate-900/10 flex items-center justify-center gap-2 mt-4"
            >
              <Plus className="w-5 h-5" />
              Schedule & Send Invites
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
