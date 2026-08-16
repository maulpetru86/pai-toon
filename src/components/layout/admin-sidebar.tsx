"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  PlusCircle,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const adminLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/komik", label: "Kelola Komik", icon: BookOpen },
  { href: "/admin/komik/baru", label: "Komik Baru", icon: PlusCircle },
  { href: "/admin/pengguna", label: "Pengguna", icon: Users },
];

interface AdminSidebarProps {
  mobileOpen?: boolean;
  onMobileOpenChange?: (open: boolean) => void;
}

export function AdminSidebar({ mobileOpen, onMobileOpenChange }: AdminSidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const navContent = (
    <>
      {adminLinks.map((link) => {
        const isActive =
          pathname === link.href ||
          (link.href !== "/admin" && pathname.startsWith(link.href));

        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => onMobileOpenChange?.(false)}
          >
            <div
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <link.icon className="h-4 w-4 flex-shrink-0" />
              <span>{link.label}</span>
            </div>
          </Link>
        );
      })}
    </>
  );

  return (
    <>
      {/* ═══ Desktop Sidebar ═══ */}
      <aside
        className={cn(
          "hidden lg:flex flex-col border-r border-border/40 bg-sidebar transition-all duration-300",
          collapsed ? "w-16" : "w-64"
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-border/40">
          {!collapsed && (
            <Link href="/admin" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <BookOpen className="h-4 w-4" />
              </div>
              <span className="text-sm font-bold">PAI-Toon Admin</span>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="h-8 w-8"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-2 space-y-1">
          {adminLinks.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href !== "/admin" && pathname.startsWith(link.href));

            return (
              <Link key={link.href} href={link.href}>
                <div
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <link.icon className="h-4 w-4 flex-shrink-0" />
                  {!collapsed && <span>{link.label}</span>}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Back to public */}
        <div className="border-t border-border/40 p-2">
          <Link href="/">
            <Button
              variant="ghost"
              className={cn("w-full justify-start gap-2", collapsed && "px-2")}
              size="sm"
            >
              <ChevronLeft className="h-4 w-4" />
              {!collapsed && <span className="text-xs">Kembali ke Beranda</span>}
            </Button>
          </Link>
        </div>
      </aside>

      {/* ═══ Mobile Sidebar (Drawer Overlay) ═══ */}
      {mobileOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={() => onMobileOpenChange?.(false)}
          />

          {/* Drawer */}
          <aside className="fixed inset-y-0 left-0 z-50 w-72 bg-sidebar border-r border-border/40 shadow-2xl lg:hidden animate-in slide-in-from-left duration-300">
            {/* Header */}
            <div className="flex h-16 items-center justify-between px-4 border-b border-border/40">
              <Link
                href="/admin"
                className="flex items-center gap-2"
                onClick={() => onMobileOpenChange?.(false)}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <BookOpen className="h-4 w-4" />
                </div>
                <span className="text-sm font-bold">PAI-Toon Admin</span>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onMobileOpenChange?.(false)}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-4 px-2 space-y-1">
              {navContent}
            </nav>

            {/* Back to public */}
            <div className="absolute bottom-0 left-0 right-0 border-t border-border/40 p-2 bg-sidebar">
              <Link href="/" onClick={() => onMobileOpenChange?.(false)}>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2"
                  size="sm"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="text-xs">Kembali ke Beranda</span>
                </Button>
              </Link>
            </div>
          </aside>
        </>
      )}
    </>
  );
}
