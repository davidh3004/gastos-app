/** POST server-side al Apps Script (evita CORS del navegador). */

function getScriptUrl(): string {
  const url = process.env.NEXT_PUBLIC_SCRIPT_URL;
  if (!url) {
    throw new Error("NEXT_PUBLIC_SCRIPT_URL no está configurada");
  }
  return url;
}

function getToken(): string {
  const token = process.env.NEXT_PUBLIC_TOKEN;
  if (!token) {
    throw new Error("NEXT_PUBLIC_TOKEN no está configurada");
  }
  return token;
}

export async function postToAppsScript(
  body: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const response = await fetch(getScriptUrl(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: getToken(), ...body }),
    cache: "no-store",
  });

  const text = await response.text();

  if (!response.ok) {
    throw new Error(`Apps Script HTTP ${response.status}: ${response.statusText}`);
  }

  let json: Record<string, unknown>;
  try {
    json = JSON.parse(text) as Record<string, unknown>;
  } catch {
    throw new Error(
      "Apps Script no devolvió JSON. Verifica que doPost esté desplegado como Web App."
    );
  }

  if (json.ok === false) {
    const error =
      (typeof json.error === "string" && json.error) ||
      (typeof json.mensaje === "string" && json.mensaje) ||
      "Error en Apps Script";
    throw new Error(error);
  }

  return json;
}
