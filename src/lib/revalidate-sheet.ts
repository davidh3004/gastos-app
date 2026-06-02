import { revalidateTag } from "next/cache";
import { SHEET_DATA_TAG } from "@/lib/data-cache";

/** Fuerza la próxima lectura del Sheet a ir a Apps Script (tras guardar o editar). */
export function revalidateSheetData(): void {
  revalidateTag(SHEET_DATA_TAG, "max");
}
