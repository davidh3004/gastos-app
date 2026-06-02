"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { clsx } from "clsx";
import { ArrowRight, Loader2 } from "lucide-react";
import {
  CATEGORIAS_REGLAS,
  categorizarLocal,
  normalizarCategoria,
} from "@/lib/categorias";
import { useDataRefresh } from "@/components/providers/data-refresh-context";
import {
  categorizarDescripcion,
  guardarTransaccion,
} from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import type { TipoTransaccion } from "@/types";
import { card, inputBase, pageTitle } from "@/lib/ui-classes";

function getFechaHoy(): string {
  const hoy = new Date();
  const mes = String(hoy.getMonth() + 1).padStart(2, "0");
  const dia = String(hoy.getDate()).padStart(2, "0");
  return `${hoy.getFullYear()}-${mes}-${dia}`;
}

const ESTADO_INICIAL = {
  monto: "",
  descripcion: "",
  categoria: "",
  fecha: getFechaHoy(),
  tipo: "Gasto" as TipoTransaccion,
};

export default function AgregarPage() {
  const { refreshNow } = useDataRefresh();
  const [monto, setMonto] = useState(ESTADO_INICIAL.monto);
  const [descripcion, setDescripcion] = useState(ESTADO_INICIAL.descripcion);
  const [categoria, setCategoria] = useState(ESTADO_INICIAL.categoria);
  const [fecha, setFecha] = useState(ESTADO_INICIAL.fecha);
  const [tipo, setTipo] = useState<TipoTransaccion>(ESTADO_INICIAL.tipo);
  const [categoriaSugerida, setCategoriaSugerida] = useState<string | null>(
    null
  );
  const [categorizando, setCategorizando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const categoriaEditadaRef = useRef(false);
  const descripcionDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  const montoNumerico = parseFloat(monto.replace(/,/g, ""));
  const montoValido = !Number.isNaN(montoNumerico) && montoNumerico > 0;
  const esIngreso = tipo === "Ingreso";

  const mostrarToast = useCallback((mensaje: string) => {
    setToast(mensaje);
    window.setTimeout(() => setToast(null), 4000);
  }, []);

  function resetFormulario() {
    setMonto(ESTADO_INICIAL.monto);
    setDescripcion(ESTADO_INICIAL.descripcion);
    setCategoria(ESTADO_INICIAL.categoria);
    setFecha(getFechaHoy());
    setTipo(ESTADO_INICIAL.tipo);
    setCategoriaSugerida(null);
    categoriaEditadaRef.current = false;
    setError(null);
  }

  const aplicarCategoriaSugerida = useCallback((sugerida: string) => {
    const normalizada = normalizarCategoria(sugerida);
    setCategoriaSugerida(normalizada);
    if (!categoriaEditadaRef.current) {
      setCategoria(normalizada);
    }
  }, []);

  function handleMontoChange(valor: string) {
    const limpio = valor.replace(/[^0-9.,-]/g, "");
    if (limpio.startsWith("-")) {
      setTipo("Gasto");
      setMonto(limpio.replace("-", ""));
      return;
    }
    setMonto(limpio);
  }

  useEffect(() => {
    const texto = descripcion.trim();

    if (descripcionDebounceRef.current) {
      clearTimeout(descripcionDebounceRef.current);
    }

    descripcionDebounceRef.current = setTimeout(() => {
      if (texto.length < 3) {
        setCategoriaSugerida(null);
        setCategorizando(false);
        return;
      }

      const local = categorizarLocal(texto);
      if (local) {
        aplicarCategoriaSugerida(local);
      }

      setCategorizando(true);

      void (async () => {
        try {
          const sugerida = await categorizarDescripcion(texto);
          aplicarCategoriaSugerida(sugerida);
        } catch {
          if (!local) {
            setCategoriaSugerida(null);
          }
        } finally {
          setCategorizando(false);
        }
      })();
    }, texto.length < 3 ? 0 : 350);

    return () => {
      if (descripcionDebounceRef.current) {
        clearTimeout(descripcionDebounceRef.current);
      }
    };
  }, [descripcion, aplicarCategoriaSugerida]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!montoValido) {
      setError("Ingresa un monto válido mayor a cero.");
      return;
    }

    if (!descripcion.trim()) {
      setError("La descripción es obligatoria.");
      return;
    }

    if (!categoria) {
      setError("Selecciona una categoría.");
      return;
    }

    if (!fecha) {
      setError("Selecciona una fecha.");
      return;
    }

    setGuardando(true);

    try {
      await guardarTransaccion({
        descripcion: descripcion.trim(),
        tipo,
        monto: montoNumerico,
        fecha,
        categoria,
      });

      refreshNow();
      mostrarToast("✅ Transacción guardada");
      resetFormulario();
    } catch (err) {
      const mensaje =
        err instanceof Error
          ? err.message
          : "No se pudo guardar la transacción.";
      setError(mensaje);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100dvh-7rem)] flex-col py-4 md:min-h-[calc(100dvh-4.5rem)] md:py-8">
      <div className="mx-auto w-full max-w-[480px] flex-1 px-4 md:px-0">
        <header className="mb-6">
          <h1 className={pageTitle}>Agregar transacción</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-muted">
            Registro manual cuando el Shortcut no está disponible
          </p>
        </header>

        <form onSubmit={handleSubmit} className={clsx(card, "space-y-5")}>
          {/* Monto + tipo */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-foreground">
              Monto
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={monto}
              onChange={(e) => handleMontoChange(e.target.value)}
              placeholder="0"
              required
              className={clsx(
                inputBase,
                "w-full tabular-nums",
                montoValido &&
                  (esIngreso
                    ? "border-green-300 text-green-700 focus:border-green-600 focus:ring-green-600/25 dark:border-green-800 dark:text-green-400"
                    : "border-red-300 text-red-700 focus:border-red-600 focus:ring-red-600/25 dark:border-red-800 dark:text-red-400")
              )}
              aria-label="Monto"
            />
            {montoValido && (
              <p
                className={clsx(
                  "mt-1.5 text-sm font-medium",
                  esIngreso
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                )}
              >
                {esIngreso ? "Ingreso" : "Gasto"} ·{" "}
                {formatCurrency(esIngreso ? montoNumerico : -montoNumerico)}
              </p>
            )}
          </div>

          <div>
            <span className="mb-2 block text-sm font-medium text-gray-700 dark:text-foreground">
              Tipo
            </span>
            <div className="grid grid-cols-2 gap-2">
              {(["Ingreso", "Gasto"] as const).map((opcion) => (
                <button
                  key={opcion}
                  type="button"
                  onClick={() => setTipo(opcion)}
                  className={clsx(
                    "rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors",
                    tipo === opcion
                      ? opcion === "Ingreso"
                        ? "border-green-600 bg-green-50 text-green-700 dark:border-green-700 dark:bg-green-950/50 dark:text-green-400"
                        : "border-red-600 bg-red-50 text-red-700 dark:border-red-700 dark:bg-red-950/50 dark:text-red-400"
                      : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-border dark:bg-surface dark:text-muted dark:hover:bg-surface-muted"
                  )}
                >
                  {opcion}
                </button>
              ))}
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-foreground">
              Descripción
            </label>
            <input
              type="text"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Ej. Almuerzo en Adrian Tropical"
              required
              className={clsx(inputBase, "w-full")}
              aria-label="Descripción"
            />
            {categorizando && (
              <p className="mt-1.5 flex items-center gap-1.5 text-xs text-gray-500 dark:text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                Buscando categoría…
              </p>
            )}
            {!categorizando && categoriaSugerida && descripcion.trim().length > 3 && (
              <span className="mt-2 inline-flex rounded-lg border border-primary/30 bg-primary/5 px-2 py-0.5 text-xs font-medium text-primary">
                Sugerida: {categoriaSugerida}
              </span>
            )}
          </div>

          {/* Categoría */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-foreground">
              Categoría
            </label>
            <select
              value={categoria}
              onChange={(e) => {
                categoriaEditadaRef.current = true;
                setCategoria(e.target.value);
              }}
              required
              className={clsx(inputBase, "w-full cursor-pointer py-2")}
              aria-label="Categoría"
            >
              <option value="" disabled>
                Selecciona una categoría
              </option>
              {CATEGORIAS_REGLAS.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
              {categoriaSugerida &&
                !CATEGORIAS_REGLAS.includes(
                  categoriaSugerida as (typeof CATEGORIAS_REGLAS)[number]
                ) && (
                  <option value={categoriaSugerida}>{categoriaSugerida}</option>
                )}
            </select>
          </div>

          {/* Fecha */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-foreground">
              Fecha
            </label>
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              required
              className={clsx(inputBase, "w-full")}
              aria-label="Fecha"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={guardando}
            className="flex w-full min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-base font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {guardando ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                Guardando…
              </>
            ) : (
              "Guardar transacción"
            )}
          </button>

          <Link
            href="/gastos"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-border dark:text-foreground dark:hover:bg-surface-muted"
          >
            Ver transacciones
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </form>
      </div>

      {toast && (
        <div
          role="status"
          className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-800 shadow-sm dark:border-green-800 dark:bg-green-950/80 dark:text-green-300 md:bottom-8"
        >
          {toast}
        </div>
      )}
    </div>
  );
}
