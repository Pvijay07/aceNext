import React, { useState } from "react";
import { Check, Lock, Play, Flame, Trophy, ChevronRight, BookOpen, Zap, Award, ArrowRight, Compass } from "lucide-react";
import { UserProfile, Course, Lesson } from "../../types";
import LiveClassesList from "./LiveClassesList";
import AssignmentsList from "./AssignmentsList";

interface SyllabusPathwaysProps {
  profile: UserProfile;
  courses: Course[];
  setActiveTab: (tab: string) => void;
}

export default function SyllabusPathways({ profile, courses, setActiveTab }: SyllabusPathwaysProps) {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  // Let's lay out the overall sequence of courses
  // Course 1 (c1) -> Course 2 (c2) -> Course 3 (c3)
  
  // Flatten out all lessons in order to find the overall "next step"
  const allOrderedLessons: { lesson: Lesson; course: Course; isCompleted: boolean }[] = [];
  
  courses.forEach(course => {
    course.modules.forEach(mod => {
      mod.lessons.forEach(lesson => {
        allOrderedLessons.push({
          lesson,
          course,
          isCompleted: profile.completedLessons.includes(lesson.id)
        });
      });
    });
  });

  // Calculate next step
  const nextStep = allOrderedLessons.find(item => !item.isCompleted);

  const handleStartNextStep = (lessonId: string, courseId: string) => {
    localStorage.setItem("lms_active_course_id", courseId);
    localStorage.setItem("lms_active_lesson_id", lessonId);
    setActiveTab("lms");

    // Dispatch slight custom interaction
    window.dispatchEvent(
      new CustomEvent("celebrate_achievement", {
        detail: {
          title: "Syllabus Path Loaded! 🗺️",
          subtitle: `Guided directly to core lesson: "${allOrderedLessons.find(i => i.lesson.id === lessonId)?.lesson.title}"`,
          type: "score"
        }
      })
    );
  };

  return (
    <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-50 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 font-mono uppercase tracking-wider">
            <Compass className="h-4 w-4 text-indigo-500" />
            <span>Curriculum Sequential Roadmap</span>
          </div>
          <h4 className="text-base font-bold text-slate-900">Your Structured Engineering Path</h4>
          <p className="text-xs text-slate-500 leading-normal">
            Progress through required topics in sequence. Meet requirements to unlock next stages of backend API development and FAANG system challenges.
          </p>
        </div>

        {nextStep && (
          <button
            onClick={() => handleStartNextStep(nextStep.lesson.id, nextStep.course.id)}
            className="self-start sm:self-center bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-md shadow-indigo-600/10 flex items-center gap-1.5 group cursor-pointer"
          >
            <Play className="h-3.5 w-3.5 fill-current text-white group-hover:scale-110 transition" />
            <span>Resume Target Step</span>
          </button>
        )}
      </div>

      {/* Target Focus Callout (The Immediate Next Milestone) */}
      {nextStep ? (
        <div className="relative bg-gradient-to-r from-slate-50 to-indigo-50/30 rounded-2xl p-5 border border-indigo-100/50 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="space-y-2 max-w-xl">
            <span className="inline-flex items-center gap-1 text-[9px] font-extrabold text-indigo-600 bg-indigo-500/10 px-2 py-0.5 rounded-full font-mono uppercase tracking-wider">
              🎯 Immediate NEXT TARGET STEP
            </span>
            <div className="space-y-1">
              <h5 className="font-bold text-sm text-slate-900 leading-tight">
                {nextStep.lesson.title}
              </h5>
              <p className="text-[11px] text-slate-500 flex items-center gap-2">
                <span>Course: <strong>{nextStep.course.title}</strong></span>
                <span className="h-1 w-1 bg-slate-300 rounded-full" />
                <span>Topic: {nextStep.lesson.topic}</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => handleStartNextStep(nextStep.lesson.id, nextStep.course.id)}
            className="w-full md:w-auto px-4.5 py-2 hover:bg-slate-900 bg-slate-950 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 shadow transition"
          >
            <span>Launch Lesson</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <div className="bg-emerald-50/40 p-5 rounded-2xl border border-emerald-100/30 text-center space-y-2">
          <div className="h-10 w-10 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
            <Trophy className="h-5 w-5" />
          </div>
          <h5 className="font-bold text-slate-900 text-sm">Pathways Completed Outstandingly! 🎓</h5>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            You processed all baseline curriculum requirements. Keep running candidate mocks or build custom flashcards to refine your real-world delivery.
          </p>
        </div>
      )}

      {/* Roadmap Sequence List */}
      <div className="space-y-6 relative pt-2">
        {/* Connection vertical timeline bar */}
        <div className="absolute left-6.5 top-0 bottom-4 w-0.5 bg-slate-100 pointer-events-none" />

        {courses.map((course, courseIdx) => {
          // Calculate progress of course
          const maxCourseLessons = course.modules.flatMap(m => m.lessons);
          const completedCourseLessons = maxCourseLessons.filter(l => profile.completedLessons.includes(l.id));
          const isCourseDone = completedCourseLessons.length === maxCourseLessons.length;
          const isCourseStarted = completedCourseLessons.length > 0;
          
          // A course is Unlocked if it is the first course, or if the prior course in the sequence is 100% completed.
          const isUnlocked = courseIdx === 0 || (courseIdx > 0 && 
            courses[courseIdx - 1].modules.flatMap(m => m.lessons).every(l => profile.completedLessons.includes(l.id))
          );

          return (
            <div key={course.id} className="relative flex gap-4 items-start group">
              {/* Outer circle node indicator */}
              <div className="z-10 shrink-0">
                <div className={`h-13 w-13 rounded-full flex items-center justify-center border-2 transition-all ${
                  isUnlocked
                    ? isCourseDone
                      ? "bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/10"
                      : "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-600/10"
                    : "bg-slate-50 border-slate-200 text-slate-300"
                }`}>
                  {isCourseDone ? (
                    <Check className="h-5.5 w-5.5 stroke-[3]" />
                  ) : !isUnlocked ? (
                    <Lock className="h-4.5 w-4.5" />
                  ) : (
                    <span className="font-mono text-sm font-black">{courseIdx + 1}</span>
                  )}
                </div>
              </div>

              {/* Main Course Path Card details */}
              <div className="flex-1 bg-slate-50/50 border border-slate-100 rounded-2xl p-5 space-y-4 hover:border-slate-200/80 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded font-mono ${
                        isCourseDone ? "bg-emerald-500/10 text-emerald-700" :
                        isUnlocked ? "bg-indigo-50 text-indigo-700" : "bg-slate-100 text-slate-400"
                      }`}>
                        Stage 0{courseIdx + 1} • {course.category}
                      </span>
                      {!isUnlocked && (
                        <span className="text-[9px] font-bold text-slate-400 font-mono flex items-center gap-0.5">
                          🔒 LOCKED (COMPLETE STAGE {courseIdx})
                        </span>
                      )}
                    </div>
                    <button 
                      onClick={() => setSelectedCourse(course)}
                      className="text-left font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors"
                    >
                      {course.title}
                    </button>
                    <p className="text-xs text-slate-500 leading-normal font-normal">
                      {course.description}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="block text-xs font-bold text-slate-700">
                      {completedCourseLessons.length} / {maxCourseLessons.length} Done
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium font-mono">
                      +{course.xpReward} XP Reward
                    </span>
                  </div>
                </div>

                {/* Individual Chapters steps inside this course */}
                <div className="space-y-2">
                  <span className="block text-[10px] font-extrabold text-slate-400 font-mono uppercase tracking-wider">
                    Syllabus Requirements checklist
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {maxCourseLessons.map((les) => {
                      const isDone = profile.completedLessons.includes(les.id);
                      const isCurrentStep = nextStep?.lesson.id === les.id;
                      
                      return (
                        <div
                          key={les.id}
                          onClick={() => {
                            if (isUnlocked) {
                              handleStartNextStep(les.id, course.id);
                            }
                          }}
                          className={`flex items-center justify-between p-3 rounded-xl border transition-all text-left ${
                            isUnlocked ? "cursor-pointer" : "cursor-not-allowed"
                          } ${
                            isDone
                              ? "bg-emerald-500/[0.02] border-emerald-100/55 hover:bg-emerald-500/[0.04]"
                              : isCurrentStep
                              ? "bg-indigo-500/[0.03] border-indigo-200 ring-1 ring-indigo-100 hover:bg-indigo-500/[0.06]"
                              : "bg-white border-slate-100 hover:border-slate-200"
                          }`}
                        >
                          <div className="space-y-0.5 min-w-0 pr-2">
                            <h6 className={`text-[11px] font-bold truncate leading-tight ${
                              isDone ? "text-slate-600 line-through text-slate-400" : "text-slate-800"
                            }`}>
                              {les.title}
                            </h6>
                            <p className="text-[10px] text-slate-400 flex items-center gap-1.5 font-medium">
                              <span>⏱ {les.duration}</span>
                              <span className="h-1 w-1 bg-slate-200 rounded-full" />
                              <span>{les.topic}</span>
                            </p>
                          </div>

                          <div className="shrink-0">
                            {isDone ? (
                              <div className="h-5 w-5 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 border border-emerald-100">
                                <Check className="h-3.5 w-3.5 stroke-[3.5]" />
                              </div>
                            ) : isCurrentStep ? (
                              <div className="px-2 py-0.5 rounded bg-indigo-600 text-white font-mono font-black text-[9px] animate-pulse">
                                CURRENT
                              </div>
                            ) : (
                              <div className="h-5 w-5 bg-slate-50 rounded-full flex items-center justify-center text-slate-350 border border-slate-100">
                                {isUnlocked ? (
                                  <Play className="h-2.5 w-2.5 text-slate-400 fill-current ml-0.5" />
                                ) : (
                                  <Lock className="h-2.5 w-2.5 text-slate-300" />
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {selectedCourse && (
        <>
          <LiveClassesList courseId={selectedCourse.id} />
          <AssignmentsList courseId={selectedCourse.id} />
        </>
      )}
    </div>
  );
}
