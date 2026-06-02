import type { HomeData } from "@/lib/home-data";
import { getAlertasActivas } from "@/lib/alertas-utils";
import { formatCurrency, formatMes } from "@/lib/utils";
import { MetricCard } from "@/components/ui/MetricCard";
import { AlertItem } from "@/components/ui/AlertItem";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { GastosBarChart } from "@/components/charts/GastosBarChart";
import { MesAMesLineChart } from "@/components/charts/MesAMesLineChart";
import {
  Building2,
  PiggyBank,
  TrendingUp,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import {
  card,
  iconBox,
  pageTitle,
  sectionTitle,
  textMuted,
  textSubtle,
} from "@/lib/ui-classes";

const META_AHORRO = 20;

function formatHoy(): string {
  return new Date().toLocaleDateString("es-DO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatFechaActualizacion(fecha: string): string {
  const parsed = new Date(fecha);
  if (Number.isNaN(parsed.getTime())) {
    return fecha;
  }
  return parsed.toLocaleDateString("es-DO", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getCuentaIcon(tipo: string): LucideIcon {
  const normalized = tipo
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (
    normalized.includes("banco") ||
    normalized.includes("corriente") ||
    normalized.includes("credito")
  ) {
    return Building2;
  }
  if (normalized.includes("ahorro") || normalized.includes("savings")) {
    return PiggyBank;
  }
  if (
    normalized.includes("inversion") ||
    normalized.includes("broker") ||
    normalized.includes("accion")
  ) {
    return TrendingUp;
  }
  if (normalized.includes("efectivo") || normalized.includes("cash")) {
    return Wallet;
  }

  return Wallet;
}

export function MonthHeaderSection({ data }: { data: HomeData }) {
  const mesLabel = data.resumen.mes || data.mes;

  return (
    <header className="px-4 md:px-0">
      <h1 className={pageTitle}>{formatMes(mesLabel)}</h1>
      <p className="mt-1 text-sm capitalize text-muted">{formatHoy()}</p>
    </header>
  );
}

export function MetricsSection({ data }: { data: HomeData }) {
  const { resumen, patrimonio } = data;
  const disponiblePositivo = resumen.flujo_neto >= 0;
  const tasaTrend =
    resumen.tasa_ahorro >= META_AHORRO
      ? ("up" as const)
      : ("down" as const);

  return (
    <div className="grid grid-cols-2 gap-3 px-4 md:grid-cols-4 md:gap-4 md:px-0">
      <MetricCard
        label="Gastado este mes"
        value={formatCurrency(resumen.gastos)}
      />
      <MetricCard
        label="Disponible"
        value={formatCurrency(resumen.flujo_neto)}
        valueClassName={
          disponiblePositivo
            ? "text-gray-900 dark:text-foreground"
            : "text-red-600 dark:text-red-400"
        }
      />
      <MetricCard
        label="Tasa de ahorro"
        value={`${resumen.tasa_ahorro}%`}
        sub={`Meta ${META_AHORRO}%`}
        trend={tasaTrend}
      />
      <MetricCard
        label="Patrimonio total"
        value={formatCurrency(patrimonio.total)}
      />
    </div>
  );
}

export function AlertsSection({ data }: { data: HomeData }) {
  const alertasActivas = getAlertasActivas(data.alertas);
  const criticas = alertasActivas.filter((a) => a.nivel === "critico").length;

  if (alertasActivas.length === 0) {
    return null;
  }

  return (
    <section className={`mx-4 md:mx-0 ${card}`}>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <h2 className={sectionTitle}>Alertas activas</h2>
        {criticas > 0 && (
          <span className="rounded-lg bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600 dark:bg-red-950/50 dark:text-red-400">
            {criticas} crítica{criticas !== 1 ? "s" : ""}
          </span>
        )}
      </div>
      <ul className="space-y-3">
        {alertasActivas.map((alerta) => (
          <li key={alerta.categoria}>
            <AlertItem alerta={alerta} />
          </li>
        ))}
      </ul>
    </section>
  );
}

export function GastosSection({ data }: { data: HomeData }) {
  return (
    <section className={`mx-4 md:mx-0 ${card}`}>
      <h2 className={`mb-4 ${sectionTitle}`}>¿En qué gasté este mes?</h2>
      <GastosBarChart data={[data.categoriasMes]} mes={data.mes} />
    </section>
  );
}

export function MetasSection({ data }: { data: HomeData }) {
  const metasAcumuladas = data.metas.filter((meta) => meta.tipo === "Acumulada");

  return (
    <section className={card}>
      <h2 className={`mb-4 ${sectionTitle}`}>Mis metas</h2>
      {metasAcumuladas.length === 0 ? (
        <p className={`text-sm ${textMuted}`}>No tienes metas acumuladas aún.</p>
      ) : (
        <ul className="space-y-5">
          {metasAcumuladas.map((meta) => (
            <li key={meta.id}>
              <ProgressBar
                label={meta.nombre}
                actual={meta.actual}
                objetivo={meta.objetivo}
                showAmounts
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function ComparativaSection({ data }: { data: HomeData }) {
  return (
    <section className={card}>
      <h2 className={`mb-4 ${sectionTitle}`}>Comparativa</h2>
      <MesAMesLineChart data={[data.mesAMes]} />
    </section>
  );
}

export function MetasComparativaGrid({ data }: { data: HomeData }) {
  return (
    <div className="grid gap-4 px-4 md:grid-cols-2 md:gap-6 md:px-0">
      <MetasSection data={data} />
      <ComparativaSection data={data} />
    </div>
  );
}

export function PatrimonioSection({ data }: { data: HomeData }) {
  const { patrimonio } = data;

  return (
    <section className={`mx-4 md:mx-0 ${card}`}>
      <p className={`text-sm font-medium ${textMuted}`}>Patrimonio</p>
      <p className="mt-1 text-3xl font-semibold text-gray-900 tabular-nums dark:text-foreground">
        {formatCurrency(patrimonio.total)}
      </p>

      <ul className="mt-6 divide-y divide-gray-200 dark:divide-border">
        {patrimonio.cuentas.map((cuenta) => {
          const Icon = getCuentaIcon(cuenta.tipo);

          return (
            <li
              key={`${cuenta.cuenta}-${cuenta.tipo}`}
              className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className={iconBox}>
                  <Icon className="h-5 w-5 text-primary" aria-hidden />
                </div>
                <div className="min-w-0">
                  <p className="truncate font-medium text-gray-900 dark:text-foreground">
                    {cuenta.cuenta}
                  </p>
                  <p className={`text-sm ${textMuted}`}>{cuenta.tipo}</p>
                </div>
              </div>
              <p className="shrink-0 text-sm font-medium tabular-nums text-gray-900 dark:text-foreground">
                {formatCurrency(cuenta.saldo)}
              </p>
            </li>
          );
        })}
      </ul>

      <p className={`mt-4 text-xs ${textSubtle}`}>
        Última actualización: {formatFechaActualizacion(patrimonio.ultima_actualizacion)}
      </p>
    </section>
  );
}

