import Link from "next/link";
import { BookOpen, Heart } from "lucide-react";

export function PublicFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border/40 bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="space-y-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <BookOpen className="h-4 w-4" />
              </div>
              <span className="text-lg font-bold">PAI-Toon</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Platform komik pendidikan agama Islam untuk siswa SMA.
              Belajar PAI jadi lebih seru dan visual!
            </p>
          </div>

          {/* Navigasi */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Navigasi</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/" className="hover:text-foreground transition-colors">
                  Beranda
                </Link>
              </li>
              <li>
                <Link href="/komik" className="hover:text-foreground transition-colors">
                  Jelajahi Komik
                </Link>
              </li>
              <li>
                <Link href="/cari" className="hover:text-foreground transition-colors">
                  Pencarian
                </Link>
              </li>
            </ul>
          </div>

          {/* Kategori */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Kategori</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/komik?kategori=akidah-akhlak" className="hover:text-foreground transition-colors">
                  Akidah Akhlak
                </Link>
              </li>
              <li>
                <Link href="/komik?kategori=fikih" className="hover:text-foreground transition-colors">
                  Fikih
                </Link>
              </li>
              <li>
                <Link href="/komik?kategori=quran-hadis" className="hover:text-foreground transition-colors">
                  Al-Qur&apos;an &amp; Hadis
                </Link>
              </li>
              <li>
                <Link href="/komik?kategori=sejarah-islam" className="hover:text-foreground transition-colors">
                  Sejarah Islam
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-6 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            &copy; {currentYear} PAI-Toon. Hak cipta dilindungi.
          </p>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            Dibuat dengan <Heart className="h-3 w-3 text-red-500 fill-red-500" /> untuk pendidikan Islam
          </p>
        </div>
      </div>
    </footer>
  );
}
