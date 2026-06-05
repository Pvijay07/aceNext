import { useState } from "react";
import { Play, FileText, CheckCircle, Brain, RefreshCw, PenTool, CheckCircle2 } from "lucide-react";
import { Course, UserProfile } from "../../types";

interface LMSPanelProps {
  courses: Course[];
  profile: UserProfile;
  focusMode?: boolean;
  onTrackProgress: (lessonId: string, xpGained: number) => void;
}

export default function LMSPanel({ courses, profile, focusMode, onTrackProgress }: LMSPanelProps) {
  const [selectedCourse, setSelectedCourse] = useState<Course>(() => {
    const savedCourseId = localStorage.getItem("lms_active_course_id");
    if (savedCourseId) {
      const found = courses.find(c => c.id === savedCourseId);
      if (found) return found;
    }
    return courses[0];
  });
  const [activeLessonId, setActiveLessonId] = useState<string>(() => {
    const savedLessonId = localStorage.getItem("lms_active_lesson_id");
    if (savedLessonId) {
      const savedCourseId = localStorage.getItem("lms_active_course_id");
      const matchedCourse = courses.find(c => c.id === savedCourseId) || courses[0];
      const allL = matchedCourse.modules.flatMap(m => m.lessons);
      if (allL.some(l => l.id === savedLessonId)) {
        return savedLessonId;
      }
    }
    const savedCourseId = localStorage.getItem("lms_active_course_id");
    const matchedCourse = courses.find(c => c.id === savedCourseId) || courses[0];
    return matchedCourse.modules[0].lessons[0].id;
  });
  const [studentNote, setStudentNote] = useState<string>("");
  const [isSummarizing, setIsSummarizing] = useState<boolean>(false);
  const [aiSummary, setAiSummary] = useState<string>("");

  // Find active lesson
  const allLessons = selectedCourse.modules.flatMap(m => m.lessons);
  const activeLesson = allLessons.find(l => l.id === activeLessonId) || allLessons[0];

  const handleLessonSelect = (id: string, courseId?: string) => {
    setActiveLessonId(id);
    localStorage.setItem("lms_active_lesson_id", id);
    if (courseId) {
      localStorage.setItem("lms_active_course_id", courseId);
    } else {
      localStorage.setItem("lms_active_course_id", selectedCourse.id);
    }
    setStudentNote("");
    setAiSummary("");
  };

  const markLessonComplete = () => {
    if (!profile.completedLessons.includes(activeLesson.id)) {
      onTrackProgress(activeLesson.id, 50);
    }
  };

  const summarizeNote = async () => {
    if (!studentNote.trim()) return;
    setIsSummarizing(true);
    try {
      const response = await fetch("/api/tutor/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            { role: "user", content: `Please summarize these raw course notes into a high-impact, professional technical checklist. Raw notes:\n\n${studentNote}` }
          ],
          context: {
            courseName: selectedCourse.title,
            lessonTitle: activeLesson.title,
            topic: activeLesson.topic
          }
        })
      });
      const data = await response.json();
      setAiSummary(data.content);
      // Reward XP for dynamic active study notes
      onTrackProgress(activeLesson.id, 25);
    } catch (e) {
      console.error(e);
      setAiSummary("Unable to summon the AI summarizer. Please configure active API Key.");
    } finally {
      setIsSummarizing(false);
    }
  };

  return (
    <div id="lms-view" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left: Courses list Sidebar */}
      {!focusMode && (
        <div className="lg:col-span-3 space-y-4">
          <h3 className="font-bold text-sm text-slate-500 uppercase tracking-wider px-1">LMS Courses Catalog</h3>
          <div className="space-y-3">
            {courses.map((course) => {
              const isSelected = selectedCourse.id === course.id;
              const completedCount = course.modules.reduce((acc, m) =>
                acc + m.lessons.filter(l => profile.completedLessons.includes(l.id)).length, 0);
              const totalCount = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);
              const isFullyCompleted = completedCount === totalCount;

              return (
                <button
                  key={course.id}
                  onClick={() => {
                    setSelectedCourse(course);
                    handleLessonSelect(course.modules[0].lessons[0].id, course.id);
                  }}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                    isSelected
                      ? "border-blue-200 bg-blue-50/50 ring-2 ring-blue-500/10"
                      : "border-slate-100 bg-white hover:border-slate-200"
                  }`}
                >
                  <div className="flex gap-3">
                    <img src={course.thumbnail} alt={course.title} className="w-12 h-12 rounded-lg object-cover" />
                    <div className="space-y-1 min-w-0">
                      <span className="inline-block text-[10px] font-bold text-blue-600 uppercase bg-blue-50/70 px-1.5 py-0.5 rounded-md">
                        {course.category}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 leading-tight truncate">{course.title}</h4>
                      <p className="text-[10px] text-slate-500 flex items-center gap-1">
                        {isFullyCompleted ? (
                          <span className="text-emerald-600 font-semibold flex items-center">
                            <CheckCircle2 className="h-3 w-3 mr-0.5" /> Fully Done
                          </span>
                        ) : (
                          <span>{completedCount} / {totalCount} Syllabus Complete</span>
                        )}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Middle: Video/PDF view and Lessons index */}
      <div className={`${focusMode ? "lg:col-span-10 lg:col-start-2 max-w-4xl mx-auto w-full" : "lg:col-span-6"} space-y-6`}>
        {/* Active Player / Document Panel */}
        <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden shadow-sm space-y-4 p-4">
          <div className="flex items-center justify-between border-b border-slate-50 pb-3">
            <div className="space-y-0.5">
              <span className="text-[10px] font-semibold text-slate-400 font-mono">NOW STUDYING</span>
              <h4 className="text-sm font-bold text-slate-900">{activeLesson.title}</h4>
            </div>
            <button
              onClick={markLessonComplete}
              className={`text-xs font-semibold px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
                profile.completedLessons.includes(activeLesson.id)
                  ? "bg-emerald-50 text-emerald-700 pointer-events-none"
                  : "bg-blue-600 text-white hover:bg-blue-500 shadow-md shadow-blue-500/10"
              }`}
            >
              <CheckCircle className="h-3.5 w-3.5" />
              {profile.completedLessons.includes(activeLesson.id) ? "Lesson Completed (+50 XP)" : "Mark Complete"}
            </button>
          </div>

          {/* Player Mock */}
          {activeLesson.videoUrl ? (
            <div className="relative aspect-video rounded-xl bg-slate-900 overflow-hidden group">
              <video
                key={activeLesson.id}
                className="w-full h-full object-cover"
                controls
                src={activeLesson.videoUrl}
                poster="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60"
              />
            </div>
          ) : activeLesson.pdfUrl ? (
            <div className="aspect-video rounded-xl bg-slate-50 flex flex-col items-center justify-center p-6 text-center border-2 border-dashed border-slate-200">
              <File className="h-12 w-12 text-slate-400 mb-2" />
              <h5 className="font-bold text-slate-800 text-xs">PDF Textbook slides available</h5>
              <p className="text-[10px] text-slate-500 max-w-xs mt-1 leading-normal">
                "{activeLesson.title}" comprises standard reading lists and sample structures. Download reading keys to proceed.
              </p>
              <a
                href={activeLesson.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-slate-900 text-white px-4 py-2 text-xs font-semibold hover:bg-slate-800 transition"
                onClick={markLessonComplete}
              >
                <FileText className="h-3.5 w-3.5" />
                View & Read PDF Workbook
              </a>
            </div>
          ) : (
            <div className="aspect-video rounded-xl bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
              <Book className="h-12 w-12 text-slate-400 mb-2" />
              <h5 className="font-bold text-slate-800 text-xs">Interactive Topic Outline</h5>
              <p className="text-[10px] text-slate-500 max-w-xs mt-1 leading-normal">
                Complete reading assignments focusing on <strong>{activeLesson.topic}</strong>. Review your concepts by checking with the AI, then mark complete!
              </p>
            </div>
          )}

          {/* Concepts Overview */}
          <div className="space-y-2 pt-2 border-t border-slate-50">
            <p className="text-xs font-semibold text-slate-700 flex items-center gap-1">
              <Brain className="h-3.5 w-3.5 text-blue-500" /> Focus Learning Areas:
            </p>
            <p className="text-xs text-slate-500 leading-relaxed font-mono bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              {activeLesson.topic || "General Software Engineering standards, layout spacing rhythms, variables clean state declarations, and memory optimizers."}
            </p>
          </div>
        </div>

        {/* Dynamic Notes Section */}
        <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-50 pb-2">
            <h4 className="font-bold text-xs text-slate-900 uppercase tracking-tight flex items-center gap-1.5">
              <PenTool className="h-4 w-4 text-indigo-500" /> Lesson Notebook
            </h4>
            <span className="text-[10px] text-slate-400 font-semibold uppercase">Earn +25 XP with AI summarizer</span>
          </div>
          <div className="space-y-3">
            <textarea
              value={studentNote}
              onChange={(e) => setStudentNote(e.target.value)}
              placeholder="Jot down notes during lectures here... eg, 'Slide 12 mentions closures are inner functions retaining state...'"
              rows={4}
              className="w-full text-xs p-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
            <button
              onClick={summarizeNote}
              disabled={isSummarizing || !studentNote.trim()}
              className="w-full py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-500 disabled:opacity-50 transition flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/10"
            >
              {isSummarizing ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Summarizing your notes...
                </>
              ) : (
                <>
                  <Brain className="h-3.5 w-3.5" /> AI Summarize to Key Checklist (+25 XP)
                </>
              )}
            </button>
          </div>

          {aiSummary && (
            <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-100/50 space-y-2 mt-4 animate-fadeIn">
              <h5 className="text-[11px] font-extrabold text-indigo-900 tracking-wider uppercase font-mono">AceNext AI Refinement Summary</h5>
              <div className="text-xs text-indigo-950 font-sans leading-relaxed whitespace-pre-line prose max-w-none">
                {aiSummary}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right: Modules & Lessons Index */}
      {!focusMode && (
        <div className="lg:col-span-3 space-y-5">
          <h3 className="font-bold text-sm text-slate-500 uppercase tracking-wider px-1">Syllabus Index</h3>
          <div className="space-y-4">
            {selectedCourse.modules.map((mod) => (
              <div key={mod.id} className="space-y-2">
                <h4 className="text-xs font-bold text-slate-800 leading-tight px-1">{mod.title}</h4>
                <div className="space-y-1.5">
                  {mod.lessons.map((les) => {
                    const isActive = les.id === activeLessonId;
                    const isCompleted = profile.completedLessons.includes(les.id);

                    return (
                      <button
                        key={les.id}
                        onClick={() => handleLessonSelect(les.id)}
                        className={`w-full text-left p-2.5 rounded-lg border transition-all flex items-center justify-between ${
                          isActive
                            ? "border-blue-300 bg-blue-50/30 font-semibold"
                            : "border-slate-100 bg-white hover:border-slate-200"
                        }`}
                      >
                        <div className="flex items-center space-x-2 min-w-0">
                          {isCompleted ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                          ) : (
                            <Play className={`h-3 w-3 shrink-0 ${isActive ? "text-blue-600" : "text-slate-400"}`} />
                          )}
                          <span className="text-[11px] text-slate-700 truncate leading-tight">{les.title}</span>
                        </div>
                        <span className="text-[9px] font-semibold text-slate-400 ml-2 shrink-0">{les.duration}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Utility icon fallbacks
function File({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/>
      <path d="M14 2v4a2 2 0 0 0 2 2h4"/>
    </svg>
  );
}

function Book({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/>
      <path d="M6 6h10"/>
      <path d="M6 10h10"/>
    </svg>
  );
}
