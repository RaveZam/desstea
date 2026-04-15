import { notFound } from "next/navigation";
import { BranchDetailContent } from "../../../_features/branches";
import { getBranchByIdFromDB } from "../../../_features/branches/services/branchesService";

export const dynamic = "force-dynamic";

export default async function BranchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const branch = await getBranchByIdFromDB(id);
  if (!branch) notFound();
  return <BranchDetailContent branch={branch} />;
}
