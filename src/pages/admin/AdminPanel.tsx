import React from "react";
import AdminDashboard from "./AdminDashboard";
import AdminCourses from "./AdminCourses";
import AdminStudents from "./AdminStudents";
import AdminModules from "./AdminModules";
import AdminBatches from "./AdminBatches";
import AdminFaculty from "./AdminFaculty";
import AdminPackages from "./AdminPackages";
import { Layers, Users, Calendar, Briefcase, Award } from "lucide-react";
import { Course } from "../../types";

interface AdminPanelProps {
  courses?: Course[];
  onAddCourse?: (newCourse: Course) => void;
  activeTab?: string;
}

export default function AdminPanel({ courses = [], onAddCourse, activeTab = "dashboard" }: AdminPanelProps) {
  
  switch (activeTab) {
    case "dashboard":
      return <AdminDashboard />;
    case "courses":
      return <AdminCourses />;
    case "students":
      return <AdminStudents />;
    case "modules":
      return <AdminModules />;
    case "batches":
      return <AdminBatches />;
    case "faculty":
      return <AdminFaculty />;
    case "packages":
      return <AdminPackages />;
    default:
      return <AdminDashboard />;
  }
}
