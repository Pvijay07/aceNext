import { useState } from "react";
import { FolderGit2, Sparkles, RefreshCw, Star, CheckSquare, Target, Github, AlertCircle } from "lucide-react";
import { ProjectLab, UserProfile } from "../../types";
import { api } from "../../api";


interface ProjectLabsPanelProps {
  labs: ProjectLab[];
  profile: UserProfile;
  focusMode?: boolean;
  onTrackProgress: (labId: string, xpGained: number) => void;
}

export default function ProjectLabsPanel({ labs = [], profile, focusMode, onTrackProgress }: ProjectLabsPanelProps) {
  const [selectedLab, setSelectedLab] = useState<ProjectLab | null>(labs && labs.length > 0 ? labs[0] : null);
  const [gitUrl, setGitUrl] = useState<string>("");
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [reviewResult, setReviewResult] = useState<string>("");
  const [evalScore, setEvalScore] = useState<number | null>(null);
  const [feedbackBullets, setFeedbackBullets] = useState<string[]>([]);

  const handleEvaluate = async () => {
    if (!gitUrl.trim()) return;
    setIsEvaluating(true);
    try {
      const data = await api.post("/grader/code", {
        code: `Repo Submitted: ${gitUrl}\nLab title: ${selectedLab.title}`,
        language: "Full Stack Structure Review",
        context: {
          title: selectedLab.title,
          description: selectedLab.description
        }
      });
      setReviewResult(data.review);
      if (data.score) setEvalScore(data.score);
      if (data.suggestions) setFeedbackBullets(data.suggestions);

      // Save lab progress
      if (data.score >= 70) {
        onTrackProgress(selectedLab.id, 150);
      }
    } catch (e) {
      console.error(e);
      setReviewResult("An error occurred reviews pipeline. Monitor server connection log keys.");
    } finally {
      setIsEvaluating(false);
    }
  };

  if (!selectedLab || labs.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500">
        No project labs available at the moment.
      </div>
    );
  }

  return (
    <div id="project-labs-view" className={`grid grid-cols-1 ${focusMode ? 'lg:grid-cols-1' : 'lg:grid-cols-12'} gap-6`}>
      {/* 1. Left Catalog sidebar */}
      {!focusMode && (
        <div className="lg:col-span-3 space-y-4">
          <h3 className="font-bold text-sm text-slate-500 uppercase tracking-wider px-1">Project Labs Catalog</h3>
          <div className="space-y-3">
            {labs.map((lab) => {
              const isSelected = selectedLab.id === lab.id;
              const diffColor =
                lab.difficulty === "Beginner"
                  ? "text-emerald-600 bg-emerald-50"
                  : lab.difficulty === "Intermediate"
                  ? "text-amber-600 bg-amber-50"
                  : "text-purple-600 bg-purple-50";

              const hasFinished = profile.completedLabs.includes(lab.id);

              return (
                <button
                  key={lab.id}
                  onClick={() => {
                    setSelectedLab(lab);
                    setReviewResult("");
                    setEvalScore(null);
                    setFeedbackBullets([]);
                    setGitUrl("");
                  }}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    isSelected
                      ? "border-blue-200 bg-blue-50/50 ring-2 ring-blue-500/10 font-medium"
                      : "border-slate-100 bg-white hover:border-slate-200"
                  }`}
                >
                  <div className="space-y-2">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md ${diffColor}`}>
                      {lab.difficulty}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 leading-tight block">{lab.title}</h4>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                      <span>{lab.tasks.length} Mileposts</span>
                      {hasFinished && <span className="text-emerald-600 font-bold">✓ Approved</span>}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. Middle Project specs dashboard */}
      <div className={`${focusMode ? "lg:col-span-7" : "lg:col-span-5"} space-y-6`}>
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-50 pb-3">
            <div>
              <span className="text-[10px] font-semibold text-slate-400 font-mono">WORKSPACE LABS</span>
              <h4 className="text-sm font-bold text-slate-900">{selectedLab.title}</h4>
            </div>
            <span className="text-xs font-bold text-slate-400 font-mono flex items-center gap-1">
              <FolderGit2 className="h-4 w-4 text-slate-500" />
              Project Blueprint
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed font-sans">{selectedLab.description}</p>

          <div className="space-y-3">
            <h5 className="text-[10px] font-extrabold text-slate-400 tracking-wider uppercase font-mono flex items-center gap-1.5">
              <CheckSquare className="h-4 w-4 text-slate-400" /> Key Tasks & Checklist Milestones
            </h5>
            <div className="space-y-2">
              {selectedLab.tasks.map((task, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-blue-600 shrink-0 select-none">Task {idx + 1}:</span>
                  <span>{task}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3 pt-1">
            <h5 className="text-[10px] font-extrabold text-slate-400 tracking-wider uppercase font-mono flex items-center gap-1.5">
              <Target className="h-4 w-4 text-slate-400" /> Focus Learning Syllabus
            </h5>
            <div className="flex flex-wrap gap-1.5">
              {selectedLab.learningObjectives.map((obj, idx) => (
                <span key={idx} className="text-[10px] font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                  {obj}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Github review triggers */}
      <div className={`${focusMode ? "lg:col-span-5" : "lg:col-span-4"} space-y-4 flex flex-col h-full overflow-y-auto`}>
        <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm space-y-4">
          <h4 className="font-bold text-xs text-slate-900 uppercase tracking-tight flex items-center gap-1.5">
            <Github className="h-4 w-4 text-slate-800" /> GitHub Repository Submission
          </h4>
          <p className="text-xs text-slate-500 leading-normal">
            Submit your finalized project files or repo link below. AceNext's AI Code Reviewer will inspect directories, evaluate layout architectures, and provide marks.
          </p>

          <div className="space-y-2.5">
            <input
              type="text"
              value={gitUrl}
              onChange={(e) => setGitUrl(e.target.value)}
              placeholder="eg. https://github.com/myusername/project"
              className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
            <button
              onClick={handleEvaluate}
              disabled={isEvaluating || !gitUrl.trim()}
              className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition disabled:opacity-50 shadow-sm flex items-center justify-center gap-1.5"
            >
              {isEvaluating ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Simulating security runs...
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" /> Submit Code for AI review (+150 XP)
                </>
              )}
            </button>
          </div>
        </div>

        {evalScore !== null && (
          <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm space-y-3.5">
            <h4 className="font-bold text-xs text-slate-900 uppercase">Automated AI Grades</h4>
            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl">
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase font-mono">Syllabus Grade</p>
                <p className="text-sm font-black text-slate-900 flex items-center gap-1">
                  <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                  {evalScore >= 70 ? `${evalScore}/100 PASS` : `${evalScore}/100 REFINE`}
                </p>
              </div>
              <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${
                evalScore >= 70 ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
              }`}>
                {evalScore >= 70 ? "Approved" : "Refinement"}
              </span>
            </div>

            {feedbackBullets.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <p className="text-[10px] font-extrabold text-slate-400 font-mono tracking-wider uppercase">Mentoring Checklist</p>
                <ul className="space-y-1">
                  {feedbackBullets.map((bl, idx) => (
                    <li key={idx} className="text-[10px] text-slate-600 font-medium flex items-start gap-1">
                      <AlertCircle className="h-3 w-3 text-indigo-500 shrink-0 mt-0.5" />
                      <span>{bl}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {reviewResult && (
          <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-100/50 space-y-1.5">
            <h5 className="font-extrabold text-[10px] text-indigo-900 tracking-widest uppercase font-mono">Detailed Repo Critique</h5>
            <div className="text-[10px] text-indigo-950 font-sans leading-relaxed whitespace-pre-line prose">
              {reviewResult}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
