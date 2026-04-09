import { topProducts, rankStyles } from "../data/mock-data";

const maxRevenue = topProducts[0].revenue;

export default function TopProductsCard() {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-4">
      <h3 className="font-semibold text-gray-900">Top Products</h3>
      <p className="text-xs text-gray-400 mt-0.5 mb-4">Ranked by revenue in the past 30 days</p>

      <div className="space-y-3">
        {topProducts.map((product, i) => (
          <div key={product.name} className="flex items-center gap-3">
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 text-[10px] font-bold ${rankStyles[i].bg} ${rankStyles[i].text}`}>
              {i + 1}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-medium text-gray-800 truncate">{product.name}</span>
                <span className="text-sm font-semibold text-gray-900 ml-2 shrink-0">
                  ₱{product.revenue.toLocaleString()}
                </span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${(product.revenue / maxRevenue) * 100}%`,
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
