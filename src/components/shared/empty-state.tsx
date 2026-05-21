import { BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: React.ReactNode;
  judul: string;
  deskripsi?: string;
  aksi?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  judul,
  deskripsi,
  aksi,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 px-4 text-center",
        className
      )}
    >
      <div className="rounded-full bg-muted p-6 mb-4">
        {icon || (
          <BookOpen className="h-10 w-10 text-muted-foreground" />
        )}
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-1">{judul}</h3>
      {deskripsi && (
        <p className="text-sm text-muted-foreground max-w-md mb-4">
          {deskripsi}
        </p>
      )}
      {aksi && <div>{aksi}</div>}
    </div>
  );
}
