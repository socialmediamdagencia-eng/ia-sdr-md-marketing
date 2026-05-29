import { DashboardOverview } from "@/modules/dashboard/components/dashboard-overview";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  return <DashboardOverview />;
}
