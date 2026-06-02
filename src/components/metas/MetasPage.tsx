import { loadMetasData } from "@/lib/metas-data";
import { MetaAcumuladaCard } from "@/components/metas/MetaAcumuladaCard";
import { MetasRecurrentesList } from "@/components/metas/MetasRecurrentesList";
import { Simulador } from "@/components/metas/Simulador";
import { EditarMeta } from "@/components/metas/EditarMeta";
import { HomeErrorState } from "@/components/home/HomeErrorState";
import { card, pageTitle, sectionTitle, textMuted } from "@/lib/ui-classes";

export async function MetasPage() {
  try {
    const data = await loadMetasData();

    return (
      <div className="flex flex-col gap-6 py-4 md:gap-8 md:py-8">
        <header className="px-4 md:px-0">
          <h1 className={pageTitle}>Metas financieras</h1>
        </header>

        <section className={`mx-4 md:mx-0 ${card}`}>
          <h2 className={`mb-4 ${sectionTitle}`}>Metas de acumulación</h2>
          {data.metasAcumuladas.length === 0 ? (
            <p className={`text-sm ${textMuted}`}>
              No tienes metas de acumulación configuradas.
            </p>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {data.metasAcumuladas.map((meta) => (
                <li key={meta.id}>
                  <MetaAcumuladaCard
                    meta={meta}
                    ahorroMensual={data.ahorroMensual}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className={`mx-4 md:mx-0 ${card}`}>
          <h2 className={`mb-4 ${sectionTitle}`}>Metas recurrentes</h2>
          <MetasRecurrentesList
            metas={data.metasRecurrentes}
            resumen={data.resumen}
          />
        </section>

        <section className={`mx-4 md:mx-0 ${card}`}>
          <h2 className={`mb-4 ${sectionTitle}`}>Simulador</h2>
          <Simulador metasAcumuladas={data.metasAcumuladas} />
        </section>

        <section className={`mx-4 md:mx-0 ${card}`}>
          <h2 className={`mb-4 ${sectionTitle}`}>Editar metas</h2>
          <p className={`mb-4 text-sm ${textMuted}`}>
            Los cambios se envían al Google Sheet cuando el endpoint{" "}
            <code className="rounded bg-gray-100 px-1 text-xs dark:bg-surface-muted">
              actualizar_meta
            </code>{" "}
            esté activo en Apps Script.
          </p>
          <EditarMeta metas={data.metas} />
        </section>
      </div>
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error desconocido";
    return (
      <div className="py-4 md:py-8">
        <HomeErrorState message={message} />
      </div>
    );
  }
}
