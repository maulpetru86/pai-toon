"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Route guard untuk area admin.
 * Redirect ke beranda jika user bukan admin.
 */
export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { firebaseUser, userProfile, loading, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    // Belum login → redirect ke login
    if (!firebaseUser) {
      router.replace("/login");
      return;
    }

    // Bukan admin → redirect ke beranda
    if (userProfile && !isAdmin) {
      router.replace("/");
      return;
    }
  }, [firebaseUser, userProfile, loading, isAdmin, router]);

  // Loading state
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="space-y-4 text-center">
          <Skeleton className="h-12 w-12 rounded-full mx-auto" />
          <Skeleton className="h-4 w-48 mx-auto" />
          <p className="text-sm text-muted-foreground">Memverifikasi akses...</p>
        </div>
      </div>
    );
  }

  // Belum login atau bukan admin → tampilkan loading (menunggu redirect)
  if (!firebaseUser || !isAdmin) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="space-y-4 text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-sm text-muted-foreground">Mengalihkan...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
