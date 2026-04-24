import { ProductsPageContent } from "../../_features/products";
import { listProducts, listCategories, listAddonGroupTemplates, listCombos } from "../../_features/products/services/productsService";
import { listBranches } from "../../_features/branches/services/branchesService";

export default async function ProductsPage() {
  const [products, categories, branches, addonGroupTemplates, combos] = await Promise.all([
    listProducts(),
    listCategories(),
    listBranches(),
    listAddonGroupTemplates(),
    listCombos(),
  ]);
  return (
    <ProductsPageContent
      initialProducts={products}
      initialCategories={categories}
      initialBranches={branches}
      initialAddonGroupTemplates={addonGroupTemplates}
      initialCombos={combos}
    />
  );
}
