import type { TopProduct } from "../services/dashboardService";

type Props = { products: TopProduct[] };

const rankStyles = [
  { bg: "bg-[#C9A84C]/15", text: "text-[#C9A84C]" },
  { bg: "bg-[#9EA5AD]/15", text: "text-[#9EA5AD]" },
  { bg: "bg-[#B5754A]/15", text: "text-[#B5754A]" },
  { bg: "bg-gray-100", text: "text-gray-400" },
  { bg: "bg-gray-100", text: "text-gray-400" },
];

export default function TopProductsCard({ products }: Props) {
  const maxRevenue = products[0]?.revenue ?? 1;

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4" style={{ border: "1px solid #F5EDE7" }}>
      <h3 className="font-semibold text-gray-900">Top Products</h3>
      <p className="text-xs text-gray-400 mt-0.5 mb-4">Ranked by revenue · selected period</p>

      <div className="space-y-3">
        {products.map((product, i) => (
          <div key={product.name} className="flex items-center gap-3">
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 text-[10px] font-bold ${rankStyles[i]?.bg ?? "bg-gray-100"} ${rankStyles[i]?.text ?? "text-gray-400"}`}>
              {i + 1}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-medium text-gray-800 truncate">{product.name}</span>
                <span className="text-sm font-semibold text-gray-900 ml-2 shrink-0">
                  ₱{Number(product.revenue).toLocaleString()}
                </span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${(Number(product.revenue) / Number(maxRevenue)) * 100}%`,
                    background: "linear-gradient(90deg, #6B4F3A 0%, #A07858 100%)",
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
