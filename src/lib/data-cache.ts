/** Tag único para invalidar todos los GET del Sheet (Next.js cache). */
export const SHEET_DATA_TAG = "sheet-data";

const DEFAULT_REVALIDATE_SECONDS = 15;
const DEFAULT_POLL_MS = 20_000;
const MIN_REVALIDATE_SECONDS = 0;

/** ISR: cuánto tiempo puede servirse una respuesta cacheada del Sheet. */
export function getRevalidateSeconds(): number {
  const raw = process.env.DATA_REVALIDATE_SECONDS;
  if (raw === undefined || raw === "") {
    return DEFAULT_REVALIDATE_SECONDS;
  }
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed < MIN_REVALIDATE_SECONDS) {
    return DEFAULT_REVALIDATE_SECONDS;
  }
  return parsed;
}

/** Intervalo de refresco en el cliente (pestaña visible). */
export function getClientPollMs(): number {
  const raw = process.env.NEXT_PUBLIC_DATA_POLL_MS;
  if (raw === undefined || raw === "") {
    return DEFAULT_POLL_MS;
  }
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed < 5_000) {
    return DEFAULT_POLL_MS;
  }
  return parsed;
}
