import { COMIC_SLUGS } from "@/lib/static-params";
import KomikDetailClient from "./client-page";



export function generateMetadata() {
  return { title: "Komik PAI" };
}

export default function Page() {
  return <KomikDetailClient />;
}
