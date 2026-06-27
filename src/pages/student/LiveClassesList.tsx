import React, { useEffect, useState } from "react";
import { Video, Clock, ExternalLink, Download } from "lucide-react";
import { api } from "../../api";

export default function LiveClassesList({ courseId }: { courseId: string }) {
  const [liveClasses, setLiveClasses] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);

  useEffect(() => {
    api.get(`/live-classes?course_id=${courseId}`).then(setLiveClasses).catch(console.error);
    api.get(`/materials?course_id=${courseId}`).then(setMaterials).catch(console.error);
  }, [courseId]);

  const handleJoin = async (id: string | number) => {
    try {
      const data = await api.post(`/live-classes/${id}/join`, {});
      if (data.meeting_link) {
        window.open(data.meeting_link, "_blank");
      } else {
        alert("Meeting link not available yet.");
      }
    } catch (e) {
      alert("Error joining class");
    }
  };

  const handleDownload = (url: string) => {
    if (url) {
      window.open(url, "_blank");
    } else {
      alert("Material URL is not available.");
    }
  };

  return (
    <div className="space-y-8 mt-8 border-t border-slate-800 pt-8">
      {/* Live Classes */}
      <div>
        <h3 className="text-xl font-bold mb-4 flex items-center text-white">
          <Video className="w-5 h-5 mr-2 text-indigo-400"/> Upcoming Live Classes
        </h3>
        {liveClasses.length === 0 ? (
          <p className="text-slate-400 text-sm">No scheduled classes.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {liveClasses.map((lc) => (
              <div key={lc.id} className="bg-slate-800 border border-slate-700 p-4 rounded-xl flex justify-between items-center">
                <div>
                  <h4 className="font-semibold text-white">{lc.topic}</h4>
                  <div className="flex items-center text-slate-400 text-xs mt-1">
                    <Clock className="w-3.5 h-3.5 mr-1" />
                    {lc.date} @ {lc.start_time}
                  </div>
                </div>
                <button 
                  onClick={() => handleJoin(lc.id)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium flex items-center transition text-xs"
                >
                  Join <ExternalLink className="w-3.5 h-3.5 ml-1.5"/>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Study Materials */}
      <div>
        <h3 className="text-xl font-bold mb-4 flex items-center text-white">
          <Download className="w-5 h-5 mr-2 text-emerald-400"/> Study Materials & Lecture Slides
        </h3>
        {materials.length === 0 ? (
          <p className="text-slate-400 text-sm">No materials uploaded.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {materials.map((m) => (
              <div key={m.id} className="bg-slate-800 border border-slate-700 p-4 rounded-xl flex justify-between items-center">
                <div>
                  <h4 className="font-semibold text-white">{m.title}</h4>
                  <span className="text-[10px] bg-slate-700 text-slate-300 px-2 py-0.5 rounded mt-1.5 inline-block uppercase font-bold tracking-wider">{m.type}</span>
                </div>
                <button 
                  onClick={() => handleDownload(m.url)}
                  className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-medium flex items-center transition text-xs"
                >
                  Access Resource
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
