import { useState } from "react";
import { Briefcase, MapPin, DollarSign, UserCheck, Flame, Send, CheckCircle2 } from "lucide-react";
import { JobItem, UserProfile } from "../../types";

interface JobPortalProps {
  jobs: JobItem[];
  profile: UserProfile;
  onApply: (jobId: string) => void;
  onUpdateStatus: (appId: string, status: string) => void;
}

export default function JobPortal({ jobs, profile, onApply, onUpdateStatus }: JobPortalProps) {
  const [selectedJob, setSelectedJob] = useState<JobItem | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Applied": return "bg-blue-50 text-blue-700 border-blue-100";
      case "Shortlisted": return "bg-indigo-50 text-indigo-700 border-indigo-100";
      case "Interview Scheduled": return "bg-amber-50 text-amber-700 border-amber-100";
      case "Selected": return "bg-emerald-50 text-emerald-700 border-emerald-100";
      default: return "bg-slate-50 text-slate-700 border-slate-100";
    }
  };

  return (
    <div id="job-portal-view" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* 1. Left list of Job Listings */}
      <div className="lg:col-span-4 space-y-4">
        <h3 className="font-bold text-sm text-slate-500 uppercase tracking-wider px-1">Active Job Listings</h3>
        <div className="space-y-3">
          {jobs.map((job) => {
            const hasApplied = profile.jobApplications.some(
              (app) => app.company === job.company && app.role === job.role
            );

            return (
              <button
                key={job.id}
                onClick={() => setSelectedJob(job)}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  selectedJob?.id === job.id
                    ? "border-blue-200 bg-blue-50/50 ring-2 ring-blue-500/10"
                    : "border-slate-100 bg-white hover:border-slate-200"
                }`}
              >
                <div className="space-y-2.5">
                  <div className="flex gap-2.5">
                    <img src={job.logo} alt={job.company} className="w-10 h-10 rounded-lg object-cover" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 leading-tight block">{job.role}</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">{job.company}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 text-[9px] font-medium text-slate-500">
                    <span className="flex items-center gap-0.5 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                      <MapPin className="h-3 w-3 text-slate-400" />
                      {job.location}
                    </span>
                    <span className="flex items-center gap-0.5 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                      <DollarSign className="h-3 w-3 text-emerald-500 font-bold" />
                      {job.salary}
                    </span>
                  </div>

                  {hasApplied && (
                    <div className="flex justify-end pt-1">
                      <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                        Applied & In-review
                      </span>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Middle job details panel */}
      <div className="lg:col-span-5 space-y-6">
        {selectedJob ? (
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm space-y-5">
            <div className="flex gap-3.5 border-b border-slate-50 pb-4">
              <img src={selectedJob.logo} alt={selectedJob.company} className="w-14 h-14 rounded-xl object-cover" />
              <div>
                <h4 className="text-sm font-extrabold text-slate-950 heading-tight">{selectedJob.role}</h4>
                <p className="text-xs text-slate-500 font-semibold">{selectedJob.company} • {selectedJob.location}</p>
                <span className="inline-block mt-2 text-[9px] font-bold px-2.5 py-0.5 bg-blue-50 text-blue-600 rounded-full">
                  {selectedJob.type}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <h5 className="text-[10px] uppercase font-bold font-mono tracking-wider text-slate-400">Position Scope & Requirements</h5>
              <ul className="space-y-1.5 list-disc pl-4 text-xs text-slate-600 leading-relaxed">
                {selectedJob.requirements.map((req, idx) => (
                  <li key={idx}>{req}</li>
                ))}
              </ul>
            </div>

            <div className="pt-2 border-t border-slate-50">
              {profile.jobApplications.some(
                (app) => app.company === selectedJob.company && app.role === selectedJob.role
              ) ? (
                <button
                  disabled
                  className="w-full py-2.5 bg-slate-100 border border-slate-200 text-slate-500 rounded-xl text-xs font-semibold select-none cursor-not-allowed flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  Successfully Submitted for Review
                </button>
              ) : (
                <button
                  onClick={() => onApply(selectedJob.id)}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/10 transition flex items-center justify-center gap-1.5"
                >
                  <Send className="h-3.5 w-3.5" /> Apply to Position Now
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm flex flex-col items-center justify-center h-48 text-center text-slate-400">
            <Briefcase className="h-10 w-10 text-slate-300 mb-2" />
            <p className="text-xs font-semibold">Select a job from listings to read description and apply!</p>
          </div>
        )}
      </div>

      {/* 3. Right placement application progress tracker */}
      <div className="lg:col-span-3 space-y-4 h-full overflow-y-auto">
        <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center space-x-1.5">
            <UserCheck className="h-5 w-5 text-indigo-500" />
            <h4 className="font-bold text-xs text-slate-900 uppercase">Your Placement Board</h4>
          </div>
          <p className="text-[11px] text-slate-500 leading-normal">
            Track and upgrade your active job roles as they progress across interview steps.
          </p>

          <div className="space-y-3 pb-1">
            {profile.jobApplications.length > 0 ? (
              profile.jobApplications.map((app) => (
                <div key={app.id} className="p-3.5 rounded-xl border border-slate-100 space-y-2.5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h5 className="text-xs font-extrabold text-slate-900 leading-tight">{app.role}</h5>
                      <p className="text-[10px] text-slate-400 mt-0.5">{app.company}</p>
                    </div>
                    <span className={`text-[9px] font-bold px-2 py-0.5 border rounded-md uppercase ${getStatusColor(app.status)}`}>
                      {app.status}
                    </span>
                  </div>

                  {/* Manual Step Trigger to simulate interviewer movement */}
                  {app.status !== "Selected" && (
                    <div className="flex gap-1 justify-end pt-1 bg-slate-50/50 p-1.5 rounded-lg border border-slate-50">
                      <span className="text-[9px] text-slate-400 font-bold uppercase self-center mr-1">Simulate:</span>
                      {app.status === "Applied" && (
                        <button
                          onClick={() => onUpdateStatus(app.id, "Shortlisted")}
                          className="text-[9px] font-bold bg-white border border-indigo-200 text-indigo-600 rounded-md px-2 py-0.5 hover:bg-indigo-50"
                        >
                          Shortlist
                        </button>
                      )}
                      {app.status === "Shortlisted" && (
                        <button
                          onClick={() => onUpdateStatus(app.id, "Interview Scheduled")}
                          className="text-[9px] font-bold bg-white border border-amber-200 text-amber-600 rounded-md px-2 py-0.5 hover:bg-amber-50"
                        >
                          Interview
                        </button>
                      )}
                      {app.status === "Interview Scheduled" && (
                        <button
                          onClick={() => onUpdateStatus(app.id, "Selected")}
                          className="text-[9px] font-bold bg-white border border-emerald-200 text-emerald-600 rounded-md px-2 py-0.5 hover:bg-emerald-50"
                        >
                          Offer
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-[10px] text-slate-400 italic text-center py-2">No job applications submitted yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
