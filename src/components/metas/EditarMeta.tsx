"use client";

import { useCallback, useState } from "react";
import { clsx } from "clsx";
import type { Meta } from "@/types";
import { useDataRefresh } from "@/components/providers/data-refresh-context";
import { actualizarMeta } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { inputBase } from "@/lib/ui-classes";

interface EditarMetaProps {
  metas: Meta[];
}

interface MetaFormState {
  nombre: string;
  objetivo: string;
  fecha_limite: string;
  actual: string;
  notas: string;
}

function metaToForm(meta: Meta): MetaFormState {
  return {
    nombre: meta.nombre,
    objetivo: String(meta.objetivo),
    fecha_limite: meta.fecha_limite,
    actual: String(meta.actual),
    notas: meta.notas,
  };
}

export function EditarMeta({ metas: metasIniciales }: EditarMetaProps) {
  const { refreshNow } = useDataRefresh();
  const [metas, setMetas] = useState(metasIniciales);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [form, setForm] = useState<MetaFormState | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const mostrarToast = useCallback((mensaje: string) => {
    setToast(mensaje);
    window.setTimeout(() => setToast(null), 4000);
  }, []);

  function abrirEdicion(meta: Meta) {
    setEditandoId(meta.id);
    setForm(metaToForm(meta));
    setError(null);
  }

  function cerrarEdicion() {
    setEditandoId(null);
    setForm(null);
    setError(null);
  }

  async function handleGuardar(meta: Meta) {
    if (!form) {
      return;
    }

    const objetivo = Number(form.objetivo);
    const actual = Number(form.actual);

    if (!form.nombre.trim()) {
      setError("El nombre es obligatorio.");
      return;
    }

    if (Number.isNaN(objetivo) || objetivo < 0) {
      setError("El objetivo debe ser un número válido.");
      return;
    }

    if (Number.isNaN(actual) || actual < 0) {
      setError("El monto actual debe ser un número válido.");
      return;
    }

    setGuardando(true);
    setError(null);

    try {
      await actualizarMeta({
        id: meta.id,
        nombre: form.nombre.trim(),
        objetivo,
        fecha_limite: form.fecha_limite,
        actual,
        notas: form.notas.trim(),
      });

      refreshNow();

      const actualizada: Meta = {
        ...meta,
        nombre: form.nombre.trim(),
        objetivo,
        fecha_limite: form.fecha_limite,
        actual,
        notas: form.notas.trim(),
      };

      setMetas((prev) =>
        prev.map((item) => (item.id === meta.id ? actualizada : item))
      );
      cerrarEdicion();
      mostrarToast("Meta guardada correctamente.");
    } catch (err) {
      const mensaje =
        err instanceof Error
          ? err.message
          : "No se pudo guardar. Verifica que el endpoint actualizar_meta esté activo.";
      setError(mensaje);
    } finally {
      setGuardando(false);
    }
  }

  if (metas.length === 0) {
    return (
      <p className="text-sm text-gray-600 dark:text-muted">
        No hay metas para editar.
      </p>
    );
  }

  return (
    <>
      <ul className="space-y-3">
        {metas.map((meta) => {
          const abierta = editandoId === meta.id;

          return (
            <li
              key={meta.id}
              className="rounded-xl border border-gray-200 bg-white dark:border-border dark:bg-surface"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 dark:text-foreground">
                    {meta.nombre}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-muted-foreground">
                    {meta.tipo} · {formatCurrency(meta.actual)} /{" "}
                    {formatCurrency(meta.objetivo)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    abierta ? cerrarEdicion() : abrirEdicion(meta)
                  }
                  className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-[#1F4E78] transition-colors hover:bg-gray-50 dark:border-border dark:text-primary dark:hover:bg-surface-muted"
                >
                  {abierta ? "Cancelar" : "Editar"}
                </button>
              </div>

              {abierta && form && (
                <form
                  className="space-y-4 border-t border-gray-200 p-4 dark:border-border"
                  onSubmit={(e) => {
                    e.preventDefault();
                    void handleGuardar(meta);
                  }}
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="flex flex-col gap-1 sm:col-span-2">
                      <span className="text-xs font-medium text-gray-500 dark:text-muted-foreground">
                        Nombre
                      </span>
                      <input
                        type="text"
                        value={form.nombre}
                        onChange={(e) =>
                          setForm({ ...form, nombre: e.target.value })
                        }
                        className={inputBase}
                        required
                      />
                    </label>

                    <label className="flex flex-col gap-1">
                      <span className="text-xs font-medium text-gray-500 dark:text-muted-foreground">
                        Objetivo
                      </span>
                      <input
                        type="number"
                        min={0}
                        step={1}
                        value={form.objetivo}
                        onChange={(e) =>
                          setForm({ ...form, objetivo: e.target.value })
                        }
                        className={inputBase}
                        required
                      />
                    </label>

                    <label className="flex flex-col gap-1">
                      <span className="text-xs font-medium text-gray-500 dark:text-muted-foreground">
                        Actual
                      </span>
                      <input
                        type="number"
                        min={0}
                        step={1}
                        value={form.actual}
                        onChange={(e) =>
                          setForm({ ...form, actual: e.target.value })
                        }
                        className={inputBase}
                        required
                      />
                    </label>

                    <label className="flex flex-col gap-1 sm:col-span-2">
                      <span className="text-xs font-medium text-gray-500 dark:text-muted-foreground">
                        Fecha límite
                      </span>
                      <input
                        type="date"
                        value={
                          form.fecha_limite.includes("T")
                            ? form.fecha_limite.slice(0, 10)
                            : form.fecha_limite
                        }
                        onChange={(e) =>
                          setForm({ ...form, fecha_limite: e.target.value })
                        }
                        className={inputBase}
                        required
                      />
                    </label>

                    <label className="flex flex-col gap-1 sm:col-span-2">
                      <span className="text-xs font-medium text-gray-500 dark:text-muted-foreground">
                        Notas
                      </span>
                      <textarea
                        value={form.notas}
                        onChange={(e) =>
                          setForm({ ...form, notas: e.target.value })
                        }
                        rows={3}
                        className={clsx(inputBase, "resize-y")}
                      />
                    </label>
                  </div>

                  {error && (
                    <p className="text-sm text-red-600 dark:text-red-400" role="alert">
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={guardando}
                    className="rounded-lg bg-[#1F4E78] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50 dark:bg-primary"
                  >
                    {guardando ? "Guardando…" : "Guardar"}
                  </button>
                </form>
              )}
            </li>
          );
        })}
      </ul>

      {toast && (
        <div
          role="status"
          className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-800 shadow-sm dark:border-green-800 dark:bg-green-950/80 dark:text-green-300 md:bottom-8"
        >
          {toast}
        </div>
      )}
    </>
  );
}
