import React, { useState } from "react";
import { Plus, Package, Check, X, Edit2 } from "lucide-react";

export default function AdminPackages() {
  const [packages, setPackages] = useState([
    { id: "P-01", name: "Job Placement Guarantee", price: "₹25,000", users: 145, active: true },
    { id: "P-02", name: "1-on-1 Mentorship (Monthly)", price: "₹5,000/mo", users: 89, active: true },
    { id: "P-03", name: "Resume & Portfolio Review", price: "₹2,500", users: 210, active: true },
    { id: "P-04", name: "Premium Mock Interviews", price: "₹4,000", users: 0, active: false },
  ]);

  const toggleStatus = (id: string) => {
    setPackages(packages.map(p => p.id === id ? { ...p, active: !p.active } : p));
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Add-on Packages</h2>
          <p className="text-sm text-slate-500 mt-1">Manage supplementary services and premium upgrades for students.</p>
        </div>
        <button className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl font-bold text-sm transition shadow-sm flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create Package
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <div key={pkg.id} className={`bg-white border rounded-2xl p-6 transition-all relative ${pkg.active ? 'border-slate-200 shadow-sm' : 'border-slate-100 opacity-60'}`}>
            <div className="flex justify-between items-start mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${pkg.active ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
                <Package className="w-6 h-6" />
              </div>
              <button 
                onClick={() => toggleStatus(pkg.id)}
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded border transition-colors ${pkg.active ? 'text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200' : 'text-slate-500 bg-slate-50 border-slate-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200'}`}
              >
                {pkg.active ? 'Active (Click to Disable)' : 'Disabled (Click to Enable)'}
              </button>
            </div>
            
            <h3 className="font-bold text-lg text-slate-900 mb-1">{pkg.name}</h3>
            <p className="text-2xl font-black text-slate-900 mb-4">{pkg.price}</p>
            
            <div className="bg-slate-50 rounded-lg p-3 flex justify-between items-center text-sm font-medium">
              <span className="text-slate-500">Active Subscribers:</span>
              <span className="text-slate-900 font-bold">{pkg.users}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
