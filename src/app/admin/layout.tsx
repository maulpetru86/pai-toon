"use client";

import { useState } from "react";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { AdminTopbar } from "@/components/layout/admin-topbar";
import { AdminGuard } from "@/components/layout/admin-guard";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AdminGuard>
      <div className="flex h-screen overflow-hidden">
        <AdminSidebar
          mobileOpen={sidebarOpen}
          onMobileOpenChange={setSidebarOpen}
        />
        <div className="flex flex-1 flex-col overflow-hidden">
          <AdminTopbar onMenuClick={() => setSidebarOpen(true)} />
          <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-muted/20">
            {children}
          </main>
        </div>
      </div>
    </AdminGuard>
  );
}
