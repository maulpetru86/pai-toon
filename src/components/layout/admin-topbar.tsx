"use client";

import { Bell, LogOut, Menu, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { signOut } from "@/lib/firebase/auth";

interface AdminTopbarProps {
  onMenuClick?: () => void;
}

export function AdminTopbar({ onMenuClick }: AdminTopbarProps) {
  const { firebaseUser, userProfile } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    window.location.href = "/login";
  };

  const initials = userProfile?.displayName
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "AD";

  return (
    <header className="sticky top-0 z-40 flex h-14 sm:h-16 items-center justify-between border-b border-border/40 bg-background/80 backdrop-blur-xl px-4 md:px-6">
      <div className="flex items-center gap-3">
        {/* Hamburger — mobile only */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden h-9 w-9 -ml-1"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Buka menu</span>
        </Button>

        <div>
          <h2 className="text-sm font-semibold text-foreground">
            Panel Admin
          </h2>
          <p className="text-xs text-muted-foreground hidden sm:block">
            Kelola komik & konten PAI
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative h-9 w-9">
          <Bell className="h-4 w-4" />
          <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-destructive" />
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" className="gap-2 px-2 h-9" />
            }
          >
            <Avatar className="h-7 w-7">
              <AvatarImage src={userProfile?.photoURL || firebaseUser?.photoURL || ""} />
              <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium hidden sm:inline">
              {userProfile?.displayName || firebaseUser?.displayName || "Admin"}
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem className="gap-2">
              <User className="h-4 w-4" />
              Profil Saya
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="gap-2 text-destructive"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4" />
              Keluar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
