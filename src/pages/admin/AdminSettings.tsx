import React, { useState, useEffect } from "react";
import { Save, Shield, Settings, Server, Sliders, CheckCircle2, AlertTriangle, RefreshCw } from "lucide-react";
import { api } from "../../api";

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    platform_name: "AceNext AI",
    contact_email: "support@acenext.com",
    support_phone: "+91 98765 43210",
    maintenance_mode: false,
    enable_ai_tutor: true,
    enable_gamification: true,
    enable_zoom_integration: false,
    allow_self_registration: true,
    allow_faculty_registration: false,
    backup_frequency: "daily",
    session_timeout: 120
  });

  const [activeTab, setActiveTab] = useState("general");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = () => {
    setLoading(true);
    api.get("/settings")
      .then((data) => {
        if (data && typeof data === "object") {
          setSettings(prev => ({
            ...prev,
            ...data
          }));
        }
      })
      .catch((err) => {
        console.warn("Could not load backend settings, using defaults.", err);
      })
      .finally(() => setLoading(false));
  };

  const handleToggle = (key: string) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev]
    }));
  };

  const handleChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    api.post("/settings", settings)
      .then(() => {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      })
      .catch((err) => {
        alert("Failed to save settings. Please try again.");
        console.error(err);
      })
      .finally(() => setSaving(false));
  };

  const tabs = [
    { id: "general", label: "General Settings", icon: <Settings className="w-4 h-4" /> },
    { id: "features", label: "Feature Flags", icon: <Sliders className="w-4 h-4" /> },
    { id: "security", label: "Access & Security", icon: <Shield className="w-4 h-4" /> },
    { id: "system", label: "System & Backups", icon: <Server className="w-4 h-4" /> },
  ];

  if (loading) {
    return (
      <div className="p-12 flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">System Settings</h2>
          <p className="text-sm text-slate-500 mt-1">Configure global application variables, user permissions, and integrations.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition shadow-sm flex items-center gap-2 disabled:opacity-50"
        >
          {saving ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Navigation Sidebar */}
        <div className="w-full md:w-64 shrink-0 space-y-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/10"
                    : "bg-white text-slate-600 border border-slate-200/50 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Setting Panels */}
        <div className="flex-1 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          {saveSuccess && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold text-sm">Settings saved successfully!</p>
                <p className="text-xs text-emerald-600 mt-0.5">Configuration updates have been broadcasted and applied across the environment.</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-6">
            {activeTab === "general" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">General Settings</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Platform Name</label>
                      <input
                        type="text"
                        value={settings.platform_name}
                        onChange={(e) => handleChange("platform_name", e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all font-medium text-slate-800"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Support / Admin Email</label>
                      <input
                        type="email"
                        value={settings.contact_email}
                        onChange={(e) => handleChange("contact_email", e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all font-medium text-slate-800"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Support Phone Number</label>
                      <input
                        type="text"
                        value={settings.support_phone}
                        onChange={(e) => handleChange("support_phone", e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all font-medium text-slate-800"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-6">
                  <div className="flex items-start justify-between bg-amber-50/50 border border-amber-200/60 rounded-2xl p-5 gap-4">
                    <div className="space-y-1">
                      <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-amber-600" /> Maintenance Mode
                      </h4>
                      <p className="text-xs text-slate-500 leading-relaxed max-w-lg">
                        Locks down student and coordinator dashboards, showing a maintenance screen. Admin dashboard access remains active.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggle("maintenance_mode")}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        settings.maintenance_mode ? "bg-amber-600" : "bg-slate-200"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          settings.maintenance_mode ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "features" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">Feature Flags</h3>
                  <p className="text-xs text-slate-500 mb-6">Enable or disable specific features across the learning workspace.</p>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-50/50 border border-slate-150 rounded-2xl">
                      <div className="space-y-1">
                        <h4 className="font-bold text-slate-800 text-sm">AI Tutor Bot</h4>
                        <p className="text-xs text-slate-500">Provides students access to the real-time coding helper and AI Chat Assistant.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleToggle("enable_ai_tutor")}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          settings.enable_ai_tutor ? "bg-blue-600" : "bg-slate-200"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            settings.enable_ai_tutor ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-50/50 border border-slate-150 rounded-2xl">
                      <div className="space-y-1">
                        <h4 className="font-bold text-slate-800 text-sm">Gamification & XP System</h4>
                        <p className="text-xs text-slate-500">Enables student scorecards, leaderboard positions, and lessons completion rewards.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleToggle("enable_gamification")}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          settings.enable_gamification ? "bg-blue-600" : "bg-slate-200"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            settings.enable_gamification ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-50/50 border border-slate-150 rounded-2xl">
                      <div className="space-y-1">
                        <h4 className="font-bold text-slate-800 text-sm">Zoom Live Classes Integration</h4>
                        <p className="text-xs text-slate-500">Sync class scheduling with official Zoom APIs to launch sessions directly from dashboard.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleToggle("enable_zoom_integration")}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          settings.enable_zoom_integration ? "bg-blue-600" : "bg-slate-200"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            settings.enable_zoom_integration ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "security" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">Access Control</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-50/50 border border-slate-150 rounded-2xl">
                      <div className="space-y-1">
                        <h4 className="font-bold text-slate-800 text-sm">Allow Student Self-Registration</h4>
                        <p className="text-xs text-slate-500">Enable new student account registration from the login/landing portal.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleToggle("allow_self_registration")}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          settings.allow_self_registration ? "bg-blue-600" : "bg-slate-200"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            settings.allow_self_registration ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-50/50 border border-slate-150 rounded-2xl">
                      <div className="space-y-1">
                        <h4 className="font-bold text-slate-800 text-sm">Allow Faculty On-demand Signup</h4>
                        <p className="text-xs text-slate-500">Allow users to sign up selecting a Mentor/Faculty role directly.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleToggle("allow_faculty_registration")}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          settings.allow_faculty_registration ? "bg-blue-600" : "bg-slate-200"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            settings.allow_faculty_registration ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "system" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">System & Backup Operations</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Backup Frequency</label>
                      <select
                        value={settings.backup_frequency}
                        onChange={(e) => handleChange("backup_frequency", e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all font-semibold text-slate-700 outline-none"
                      >
                        <option value="hourly">Every Hour</option>
                        <option value="daily">Daily (At 00:00 UTC)</option>
                        <option value="weekly">Weekly (Sundays)</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Session Timeout (minutes)</label>
                      <input
                        type="number"
                        value={settings.session_timeout}
                        onChange={(e) => handleChange("session_timeout", parseInt(e.target.value) || 120)}
                        className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all font-medium text-slate-800"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-6">
                  <h4 className="font-bold text-slate-800 text-sm mb-3">Database Snapshot</h4>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <p className="text-xs font-semibold text-slate-700">Last backup: 12 hours ago</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">Size: 42.5 MB (Full database dump & static uploads)</p>
                    </div>
                    <button
                      type="button"
                      className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-4 py-2.5 rounded-xl transition"
                    >
                      Trigger Manual Backup
                    </button>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
