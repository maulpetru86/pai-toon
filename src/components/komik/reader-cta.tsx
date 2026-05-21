"use client";

import Link from "next/link";
import { BookOpen, Sparkles, UserPlus, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

/**
 * CTA panel yang muncul di bawah reader jika user belum login.
 * Mendorong registrasi tanpa memaksa (soft-registration).
 */
export function ReaderCTA() {
  const { isAuthenticated, loading } = useAuth();

  // Jangan tampilkan jika sedang loading atau sudah login
  if (loading || isAuthenticated) return null;

  return (
    <div className="relative overflow-hidden">
      {/* Gradient transition from black reader background */}
      <div className="h-16 bg-gradient-to-b from-black to-primary/95" />

      <div className="bg-gradient-to-b from-primary/95 to-primary px-4 py-12 text-center">
        {/* Decorative */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-1/4 w-64 h-64 bg-saffron/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-md mx-auto space-y-5">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-saffron/20 text-saffron text-sm font-medium">
            <Sparkles className="h-4 w-4" />
            Gratis, tanpa biaya!
          </div>

          <h3 className="text-2xl md:text-3xl font-bold text-white leading-tight">
            Seru kan? 🎉
          </h3>

          <p className="text-primary-foreground/80 text-sm md:text-base leading-relaxed">
            Yuk buat akun gratis untuk{" "}
            <strong className="text-saffron">simpan progres bacamu</strong>,
            kumpulkan XP, dan unlock badge keren!
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link href="/register">
              <Button
                size="lg"
                className="gap-2 px-8 bg-saffron text-black hover:bg-saffron/90 font-semibold w-full sm:w-auto"
              >
                <UserPlus className="h-5 w-5" />
                Daftar Gratis
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button
                variant="outline"
                size="lg"
                className="gap-2 px-8 border-white/20 !bg-transparent !text-white hover:!bg-white/10 w-full sm:w-auto"
              >
                <BookOpen className="h-5 w-5" />
                Sudah Punya Akun
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
