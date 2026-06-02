/** Categorías alineadas a la hoja Reglas / Mes a Mes */
export const CATEGORIAS_REGLAS = [
  "Bares/Entretenimiento",
  "Cafés",
  "Cargo Banco",
  "CuidadoPersonal/Barbería",
  "Educación",
  "Envíos/Courier",
  "Gasolina",
  "Impuestos",
  "Ingreso Extra/Transferencias Recibidas",
  "Nómina",
  "Restaurantes",
  "RetiroEfectivo",
  "Ropa/Compras",
  "Salud",
  "Servicios",
  "Sin categorizar",
  "Supermercado",
  "Suscripciones Tech",
  "Vivienda",
] as const;

export type CategoriaRegla = (typeof CATEGORIAS_REGLAS)[number];

/** Patrones típicos de la hoja Reglas (fallback + respuesta instantánea). */
export const PATRONES_CATEGORIA: ReadonlyArray<{
  patron: string;
  categoria: string;
}> = [
  { patron: "ADRIAN TROPICAL", categoria: "Restaurantes" },
  { patron: "MCDONALDS", categoria: "Restaurantes" },
  { patron: "DOMINOS", categoria: "Restaurantes" },
  { patron: "PIZZA", categoria: "Restaurantes" },
  { patron: "RESTAURANT", categoria: "Restaurantes" },
  { patron: "STARBUCKS", categoria: "Cafés" },
  { patron: "JAI CAFE", categoria: "Cafés" },
  { patron: "COFFEE", categoria: "Cafés" },
  { patron: "CAFE", categoria: "Cafés" },
  { patron: "UBER", categoria: "Gasolina" },
  { patron: "INDRIVE", categoria: "Gasolina" },
  { patron: "SHELL", categoria: "Gasolina" },
  { patron: "ESSO", categoria: "Gasolina" },
  { patron: "TEXACO", categoria: "Gasolina" },
  { patron: "NETFLIX", categoria: "Suscripciones Tech" },
  { patron: "SPOTIFY", categoria: "Suscripciones Tech" },
  { patron: "OPENAI", categoria: "Suscripciones Tech" },
  { patron: "CURSOR", categoria: "Suscripciones Tech" },
  { patron: "GITHUB", categoria: "Suscripciones Tech" },
  { patron: "APPLE.COM", categoria: "Suscripciones Tech" },
  { patron: "GOOGLE STORAGE", categoria: "Suscripciones Tech" },
  { patron: "BRAVO", categoria: "Supermercado" },
  { patron: "WALMART", categoria: "Supermercado" },
  { patron: "SUPER", categoria: "Supermercado" },
  { patron: "AMAZON", categoria: "Ropa/Compras" },
  { patron: "SHEIN", categoria: "Ropa/Compras" },
  { patron: "BARBER", categoria: "CuidadoPersonal/Barbería" },
  { patron: "FARMACIA", categoria: "Salud" },
  { patron: "HOSPITAL", categoria: "Salud" },
  { patron: "NOMINA", categoria: "Nómina" },
  { patron: "TRANSFERENCIA RECIBIDA", categoria: "Ingreso Extra/Transferencias Recibidas" },
  { patron: "ZELLE", categoria: "Ingreso Extra/Transferencias Recibidas" },
];

function normalizarTexto(texto: string): string {
  return texto
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/** Coincide descripción con patrones locales (misma lógica que Reglas). */
export function categorizarLocal(descripcion: string): string | null {
  const upper = normalizarTexto(descripcion.trim());
  if (!upper) return null;

  const ordenados = [...PATRONES_CATEGORIA].sort(
    (a, b) => b.patron.length - a.patron.length
  );

  for (const { patron, categoria } of ordenados) {
    if (upper.includes(patron)) {
      return categoria;
    }
  }

  return null;
}

/** Ajusta nombre de categoría al listado del dropdown. */
export function normalizarCategoria(categoria: string): string {
  const trimmed = categoria.trim();
  if (!trimmed) return "Sin categorizar";

  if (CATEGORIAS_REGLAS.includes(trimmed as CategoriaRegla)) {
    return trimmed;
  }

  const key = trimmed.replace(/\s+/g, "").toLowerCase();
  const match = CATEGORIAS_REGLAS.find(
    (c) => c.replace(/\s+/g, "").toLowerCase() === key
  );

  return match ?? trimmed;
}
