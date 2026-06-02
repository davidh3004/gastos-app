import { loadHomeData } from "@/lib/home-data";
import { HomeErrorState } from "@/components/home/HomeErrorState";
import {
  AlertsSection,
  GastosSection,
  MetasComparativaGrid,
  MetricsSection,
  MonthHeaderSection,
  PatrimonioSection,
} from "@/components/home/sections";

export async function HomePage() {
  try {
    const data = await loadHomeData();

    return (
      <div className="flex flex-col gap-6 py-4 md:gap-8 md:py-8">
        <MonthHeaderSection data={data} />
        <MetricsSection data={data} />
        <AlertsSection data={data} />
        <GastosSection data={data} />
        <MetasComparativaGrid data={data} />
        <PatrimonioSection data={data} />
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
