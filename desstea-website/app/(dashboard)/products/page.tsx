import { ProductsPageContent } from "../../_features/products";
import { listProducts, listCategories, listAddonGroupTemplates } from "../../_features/products/services/productsService";
import { listBranches } from "../../_features/branches/services/branchesService";

export default async function ProductsPage() {
  const [products, categories, branches, addonGroupTemplates] = await Promise.all([
    listProducts(),
    listCategories(),
    listBranches(),
    listAddonGroupTemplates(),
  ]);
  return (
    <ProductsPageContent
      initialProducts={products}
      initialCategories={categories}
      initialBranches={branches}
      initialAddonGroupTemplates={addonGroupTemplates}
    />
  );
}
