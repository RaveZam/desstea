import { BranchDetailContent } from "../../../_features/branches";

export default async function BranchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <BranchDetailContent branchId={id} />;
}
