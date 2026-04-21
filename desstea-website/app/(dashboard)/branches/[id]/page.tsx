import { notFound } from "next/navigation";
import { BranchDetailContent } from "../../../_features/branches";
import { getBranchByIdFromDB, getBranchDetailData } from "../../../_features/branches/services/branchesService";
import type { DateRangeKey } from "../../../_features/dashboard/services/dashboardService";

export const dynamic = "force-dynamic";

const PERIOD_LABELS: Record<DateRangeKey, string> = {
  today: "yesterday",
  "7d": "prior 7 days",
  "30d": "prior 30 days",
};

export default async function BranchDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ range?: string }>;
}) {
  const [{ id }, { range: rawRange }] = await Promise.all([params, searchParams]);
  const range = (["today", "7d", "30d"].includes(rawRange ?? "") ? rawRange : "30d") as DateRangeKey;

  const branch = await getBranchByIdFromDB(id);
  if (!branch) notFound();

  const data = await getBranchDetailData(branch.id, range);

  return <BranchDetailContent branch={branch} data={data} periodLabel={PERIOD_LABELS[range]} />;
}
