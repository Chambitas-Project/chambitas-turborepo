import React from "react";
import { DashboardNavbar } from "../widgets/navbar/ui/DashboardNavbar";

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: "student" | "employer";
}

export function DashboardLayout({ children, role }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900">
      <DashboardNavbar role={role} />
      <main className="max-w-7xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
}
