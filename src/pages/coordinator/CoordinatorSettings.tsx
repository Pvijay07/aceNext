import React, { useState, useEffect } from "react";
import { Save, Bell, Shield, Smartphone } from "lucide-react";
import { api } from "../../api";

export default function CoordinatorSettings() {
  const [settings, setSettings] = useState({
    coordinator_notifications: true,
    auto_approve_attendance: false,
    daily_report_email: true,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch global settings and map any coordinator specific ones
    api.get("/settings").then(res => {
      if (res) {
        setSettings(prev => ({
          ...prev,
          coordinator_notifications: res.coordinator_notifications ?? true,
          auto_approve_attendance: res.auto_approve_attendance ?? false,
          daily_report_email: res.daily_report_email ?? true,
        }));
      }
    }).catch(console.error);
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.put("/settings", settings);
      alert("Settings saved successfully!");
    } catch (e) {
      alert("Error saving settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Coordinator Settings</h2>
        <p className="text-sm text-slate-500 mt-1">Manage your notification preferences and workflow automation.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Bell className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-slate-900">In-App Notifications</h4>
              <p className="text-sm text-slate-500">Receive alerts when students apply or drop out.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={settings.coordinator_notifications} onChange={e => setSettings({...settings, coordinator_notifications: e.target.checked})} />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          <div className="h-px bg-slate-100"></div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-slate-900">Auto-Approve Attendance</h4>
              <p className="text-sm text-slate-500">Automatically mark students present if they joined the Zoom session.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={settings.auto_approve_attendance} onChange={e => setSettings({...settings, auto_approve_attendance: e.target.checked})} />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          <div className="h-px bg-slate-100"></div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-slate-900">Daily Report Emails</h4>
              <p className="text-sm text-slate-500">Receive a summary email of all batch activities at 5 PM daily.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={settings.daily_report_email} onChange={e => setSettings({...settings, daily_report_email: e.target.checked})} />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
        </div>
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
          <button onClick={handleSave} disabled={loading} className="bg-slate-900 text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-slate-800 transition flex items-center gap-2 shadow-sm disabled:opacity-50">
            {loading ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : <Save className="w-4 h-4" />}
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
}
