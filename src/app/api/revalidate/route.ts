import { revalidateSheetData } from "@/lib/revalidate-sheet";

export async function POST() {
  revalidateSheetData();
  return Response.json({ ok: true, revalidated: true });
}
