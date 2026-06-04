import { useState } from "react";
import { FileText, Sparkles, RefreshCw, Star, HelpCircle, Check, BookOpen, Printer, Download } from "lucide-react";
import { UserProfile } from "../types";

interface ResumeSpecsProps {
  profile: UserProfile;
  focusMode?: boolean;
  onTrackXp: (xp: number) => void;
}

export default function ResumeSpecs({ profile, focusMode, onTrackXp }: ResumeSpecsProps) {
  const [skills, setSkills] = useState<string>("React.js, Tailwind CSS, Javascript, Express, Git");
  const [edu, setEdu] = useState<string>("B.Tech in Computer Science, State Tech University (2025)");
  const [exp, setExp] = useState<string>("Frontend Developer Intern at local startup. Worked on React styling tasks and fixed REST route bugs.");
  const [projects, setProjects] = useState<string>("Advanced Calculator App with local persistence and dual theme configs");

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [critique, setCritique] = useState<string>("");
  const [atsScore, setAtsScore] = useState<number | null>(null);
  const [missingKeys, setMissingKeys] = useState<string[]>([]);
  const [bulletSg, setBulletSg] = useState<{ original: string; improved: string }[]>([]);

  const analyzeCV = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/resume/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeData: {
            skills,
            education: edu,
            experience: exp,
            projects
          }
        })
      });
      const data = await response.json();
      setAtsScore(data.atsScore);
      setCritique(data.summary);
      setMissingKeys(data.missingKeywords || []);
      setBulletSg(data.bulletSuggestions || []);

      onTrackXp(80); // +80 XP for analyzing resume
    } catch (e) {
      console.error(e);
      setCritique("Review pipeline timed out. Ensure environment server is fully booted.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrintMock = () => {
    window.print();
  };

  const handleDownloadTxt = () => {
    const content = `========================================
RESUME BLUEPRINT: ${profile.name}
========================================
Email: ${profile.email}
Location: Bangalore, India
Status: Active portfolio synced with job systems

SKILLS
----------------------------------------
${skills}

EXPERIENCE
----------------------------------------
${exp}

EDUCATION
----------------------------------------
${edu}

PROJECTS
----------------------------------------
${projects}
`;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${profile.name.replace(/\s+/g, "_")}_Resume.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadJson = () => {
    const resumeObj = {
      name: profile.name,
      email: profile.email,
      location: "Bangalore, India",
      skills,
      experience: exp,
      education: edu,
      projects,
      generatedAt: new Date().toISOString(),
      atsScore: atsScore || 70
    };
    const jsonContent = JSON.stringify(resumeObj, null, 2);
    const blob = new Blob([jsonContent], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${profile.name.replace(/\s+/g, "_")}_Resume.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div id="resume-builder-view" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* 1. Left Editor Section */}
      <div className={`${focusMode ? "lg:col-span-5" : "lg:col-span-4"} space-y-4`}>
        <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-50 pb-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <h4 className="font-bold text-xs text-slate-800 uppercase tracking-tight">Interactive Resume Sections</h4>
          </div>

          <div className="space-y-3 text-xs text-slate-700">
            <div>
              <label className="block text-[10px] uppercase font-bold font-mono text-slate-400 mb-1">Core Tech Skills</label>
              <textarea
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                rows={2}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold font-mono text-slate-400 mb-1">Education Highlights</label>
              <textarea
                value={edu}
                onChange={(e) => setEdu(e.target.value)}
                rows={2}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold font-mono text-slate-400 mb-1">Professional Experience</label>
              <textarea
                value={exp}
                onChange={(e) => setExp(e.target.value)}
                rows={4}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold font-mono text-slate-400 mb-1">Projects & Certs</label>
              <textarea
                value={projects}
                onChange={(e) => setProjects(e.target.value)}
                rows={2}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans"
              />
            </div>

            <button
              onClick={analyzeCV}
              disabled={isLoading}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/15 transition flex items-center justify-center gap-1.5"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Scanning Keywords...
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" /> Analyze ATS Compatibility (+80 XP)
                </>
              )}
            </button>

            {/* Profile Data Simulated Downloads */}
            <div className="pt-3.5 border-t border-slate-100 space-y-2">
              <label className="block text-[10px] uppercase font-bold font-mono text-slate-400">Download Portfolio Blueprint</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleDownloadTxt}
                  className="py-2 px-2 border border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/20 text-slate-600 hover:text-indigo-600 rounded-xl text-[10px] font-bold tracking-tight transition flex items-center justify-center gap-1"
                >
                  <Download className="h-3 w-3" /> Plain Text (.txt)
                </button>
                <button
                  type="button"
                  onClick={handleDownloadJson}
                  className="py-2 px-2 border border-slate-200 hover:border-emerald-200 hover:bg-emerald-50/20 text-slate-600 hover:text-emerald-700 rounded-xl text-[10px] font-bold tracking-tight transition flex items-center justify-center gap-1"
                >
                  <Download className="h-3 w-3" /> Schema JSON (.json)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Middle PDF printable template Card */}
      <div className={`${focusMode ? "lg:col-span-7" : "lg:col-span-5"} space-y-4`}>
        <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-md print:shadow-none space-y-6 relative overflow-hidden font-serif select-text">
          <div className="absolute right-4 top-4 print:hidden flex items-center gap-1.5">
            <button
              onClick={handleDownloadTxt}
              title="Download Plain Text Resume"
              className="p-1 px-2.5 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-100 rounded-lg text-slate-500 hover:border-indigo-100 transition flex items-center gap-1 text-[10px] font-bold"
            >
              <Download className="h-3.5 w-3.5" />
              <span>TXT</span>
            </button>
            <button
              onClick={handleDownloadJson}
              title="Download Schema JSON Blueprint"
              className="p-1 px-2.5 hover:bg-emerald-50 hover:text-emerald-600 border border-slate-100 rounded-lg text-slate-500 hover:border-emerald-100 transition flex items-center gap-1 text-[10px] font-bold"
            >
              <Download className="h-3.5 w-3.5" />
              <span>JSON</span>
            </button>
            <button
              onClick={handlePrintMock}
              title="Print Resume"
              className="p-2 hover:bg-slate-50 rounded-lg border border-slate-100 text-slate-500 hover:text-slate-900 transition flex items-center justify-center"
            >
              <Printer className="h-4 w-4" />
            </button>
          </div>

          <div className="text-center pb-4 border-b border-slate-100 space-y-1.5 font-sans">
            <h2 className="text-xl font-bold tracking-tight text-slate-900">{profile.name}</h2>
            <p className="text-[10px] text-slate-500 font-medium tracking-wider">{profile.email} • Bangalore, India</p>
          </div>

          {/* Section 1 */}
          <div className="space-y-1.5">
            <h3 className="text-xs uppercase tracking-widest font-bold text-slate-800 border-b border-slate-100 pb-0.5 font-sans">Skills</h3>
            <p className="text-[11px] text-slate-700 font-mono leading-relaxed">{skills}</p>
          </div>

          {/* Section 2 */}
          <div className="space-y-1.5">
            <h3 className="text-xs uppercase tracking-widest font-bold text-slate-800 border-b border-slate-100 pb-0.5 font-sans">Experience</h3>
            <p className="text-[11px] text-slate-700 leading-relaxed max-w-none">{exp}</p>
          </div>

          {/* Section 3 */}
          <div className="space-y-1.5">
            <h3 className="text-xs uppercase tracking-widest font-bold text-slate-800 border-b border-slate-100 pb-0.5 font-sans">Education</h3>
            <p className="text-[11px] text-slate-700 leading-relaxed">{edu}</p>
          </div>

          {/* Section 4 */}
          <div className="space-y-1.5">
            <h3 className="text-xs uppercase tracking-widest font-bold text-slate-800 border-b border-slate-100 pb-0.5 font-sans">Projects</h3>
            <p className="text-[11px] text-slate-700 leading-relaxed">{projects}</p>
          </div>
        </div>
      </div>

      {/* 3. Right review panel */}
      {!focusMode && (
        <div className="lg:col-span-3 space-y-4">
          {atsScore !== null && (
            <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm space-y-4">
              <h4 className="font-bold text-xs text-slate-900 uppercase">ATS Evaluation Meter</h4>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase font-mono">Job Compatibility</p>
                  <p className="text-base font-black text-slate-900 flex items-center">
                    <Star className="h-4 w-4 text-emerald-500 mr-0.5 fill-emerald-500" /> {atsScore}% ATS Rate
                  </p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${
                  atsScore >= 75 ? "bg-emerald-50 text-emerald-700" : "bg-orange-50 text-orange-700"
                }`}>
                  {atsScore >= 75 ? "Excellent Match" : "Increase Metrics"}
                </span>
              </div>

              {missingKeys.length > 0 && (
                <div className="space-y-1.5 border-t border-slate-50 pt-3">
                  <p className="text-[10px] font-extrabold text-slate-400 font-mono tracking-wider uppercase">Missing Recommended Stacks</p>
                  <div className="flex flex-wrap gap-1">
                    {missingKeys.map((key, idx) => (
                      <span key={idx} className="text-[9px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                        {key}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {bulletSg.length > 0 && (
            <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm space-y-3">
              <h4 className="font-bold text-[11px] text-slate-800 tracking-wide uppercase">Quantified Power-ups</h4>
              <div className="space-y-3.5">
                {bulletSg.map((bul, idx) => (
                  <div key={idx} className="space-y-1 text-[10px] leading-normal">
                    <p className="text-slate-400 line-through">Dull: "{bul.original}"</p>
                    <p className="text-indigo-800 font-medium flex items-start gap-1">
                      <Check className="h-3 w-3 text-emerald-500 shrink-0 mt-0.5" />
                      <span>Star: "{bul.improved}"</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {critique && (
            <div className="rounded-xl border border-indigo-100/50 bg-indigo-50/70 p-4 shadow-sm">
              <h4 className="font-extrabold text-[10px] text-indigo-900 tracking-widest uppercase font-mono mb-1.5">Expert Recommendations</h4>
              <div className="text-[10px] text-indigo-950 font-sans leading-relaxed whitespace-pre-wrap">
                {critique}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
