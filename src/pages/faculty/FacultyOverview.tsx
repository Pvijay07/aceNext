import React, { useEffect, useState } from "react";
import { BookOpen, Users, AlertCircle, Clock, Calendar, RefreshCw } from "lucide-react";
import { api } from "../../api";

const mockData = {
  assigned_courses: [
    { id: 1, title: "React 19 Mastery", students: 45 },
    { id: 2, title: "Node.js & Express", students: 30 },
  ],
  pending_reviews: 12,
  upcoming_classes: [
    { id: "c1", topic: "Advanced Hooks Deep Dive", date: "Today", time: "4:00 PM" },
    { id: "c2", topic: "REST API Security Patterns", date: "Tomorrow", time: "10:00 AM" },
  ],
};

export default function FacultyOverview() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    setLoading(true);
    api.get("/faculty/dashboard")
      .then((res) => {
        if (res && (res.assigned_courses || res.pending_reviews !== undefined)) {
          setData(res);
        } else {
          setData(mockData);
        }
      })
      .catch(() => {
        console.warn("Using mock data for faculty dashboard.");
        setData(mockData);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) {
    return (
      <div className="p-12 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const totalStudents = data.assigned_courses?.reduce((acc: number, c: any) => acc + (c.students || 0), 0) || 0;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Educator Overview</h2>
          <p className="text-sm text-slate-500 mt-1">Your assigned classes and daily mentoring tasks.</p>
        </div>
        <button onClick={fetchData} className="p-2 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 transition" title="Refresh">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group hover:border-indigo-200 transition-all">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Assigned Courses</p>
            <p className="text-3xl font-black text-slate-900">{data.assigned_courses?.length || 0}</p>
          </div>
          <div className="h-12 w-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group hover:border-emerald-200 transition-all">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Total Students</p>
            <p className="text-3xl font-black text-slate-900">{totalStudents}</p>
          </div>
          <div className="h-12 w-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group hover:border-rose-200 transition-all">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Pending Reviews</p>
            <p className="text-3xl font-black text-slate-900">{data.pending_reviews || 0}</p>
          </div>
          <div className="h-12 w-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform relative">
            {(data.pending_reviews || 0) > 0 && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
              </span>
            )}
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assigned Courses */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <h3 className="font-bold text-slate-900 mb-4">My Courses</h3>
          {data.assigned_courses?.length > 0 ? (
            <div className="space-y-3">
              {data.assigned_courses.map((course: any) => (
                <div key={course.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <span className="font-semibold text-sm text-slate-800">{course.title || `Course #${course.id}`}</span>
                  </div>
                  <span className="text-xs text-slate-500 font-medium">{course.students} students</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400 text-sm text-center py-6">No courses assigned yet.</p>
          )}
        </div>

        {/* Upcoming Classes */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <h3 className="font-bold text-slate-900 mb-4">Upcoming Classes</h3>
          {data.upcoming_classes?.length > 0 ? (
            <div className="space-y-3">
              {data.upcoming_classes.map((cls: any) => (
                <div key={cls.id} className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-100 rounded-xl">
                  <div className="p-2 bg-white rounded-lg shadow-sm text-blue-600">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{cls.topic}</p>
                    <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {cls.date} · {cls.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400 text-sm text-center py-6">No upcoming classes scheduled.</p>
          )}
        </div>
      </div>
    </div>
  );
}
