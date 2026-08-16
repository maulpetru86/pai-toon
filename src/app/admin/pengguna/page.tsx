"use client";

import { useState, useEffect } from "react";
import {
  Users,
  Search,
  Shield,
  BookOpen,
  Zap,
  Flame,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import type { User } from "@/types";

export default function AdminPenggunaPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(
          (doc) => ({ ...doc.data(), uid: doc.id } as User)
        );
        setUsers(data);
      } catch (error) {
        console.error("Gagal memuat pengguna:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  const filtered = users.filter(
    (u) =>
      u.displayName?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const adminCount = users.filter((u) => u.role === "admin").length;
  const studentCount = users.filter((u) => u.role === "student").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Kelola Pengguna</h1>
        <p className="text-sm text-muted-foreground">
          {users.length} pengguna terdaftar · {adminCount} admin · {studentCount} siswa
        </p>
      </div>

      {/* Search */}
      <div className="relative w-full sm:max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Cari nama atau email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-4 font-medium">Pengguna</th>
                <th className="text-left p-4 font-medium hidden sm:table-cell">Role</th>
                <th className="text-left p-4 font-medium hidden md:table-cell">XP</th>
                <th className="text-left p-4 font-medium hidden md:table-cell">Level</th>
                <th className="text-left p-4 font-medium hidden lg:table-cell">Streak</th>
                <th className="text-left p-4 font-medium hidden lg:table-cell">Komik Dibaca</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    Memuat data pengguna...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    {search
                      ? "Tidak ada pengguna yang cocok."
                      : "Belum ada pengguna terdaftar."}
                  </td>
                </tr>
              ) : (
                filtered.map((user) => (
                  <tr
                    key={user.uid}
                    className="border-b hover:bg-muted/30 transition-colors"
                  >
                    {/* User Info */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          {user.role === "admin" ? (
                            <Shield className="h-4 w-4 text-primary" />
                          ) : (
                            <Users className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium truncate max-w-[200px]">
                            {user.displayName || "Tanpa Nama"}
                          </p>
                          <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="p-4 hidden sm:table-cell">
                      <Badge
                        variant={user.role === "admin" ? "default" : "secondary"}
                        className="text-xs capitalize"
                      >
                        {user.role}
                      </Badge>
                    </td>

                    {/* XP */}
                    <td className="p-4 hidden md:table-cell">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Zap className="h-3.5 w-3.5 text-saffron" />
                        {user.xp || 0}
                      </span>
                    </td>

                    {/* Level */}
                    <td className="p-4 hidden md:table-cell text-muted-foreground">
                      Lv. {user.level || 1}
                    </td>

                    {/* Streak */}
                    <td className="p-4 hidden lg:table-cell">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Flame className="h-3.5 w-3.5 text-orange-500" />
                        {user.readingStreak || 0}
                      </span>
                    </td>

                    {/* Comics Read */}
                    <td className="p-4 hidden lg:table-cell">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <BookOpen className="h-3.5 w-3.5" />
                        {user.totalComicsRead || 0}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
