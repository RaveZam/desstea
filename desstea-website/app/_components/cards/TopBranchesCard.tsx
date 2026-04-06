const branches = [
  { name: "SM North EDSA", revenue: 298400 },
  { name: "Glorietta Makati", revenue: 275600 },
  { name: "SM Megamall", revenue: 241900 },
  { name: "Robinsons Ermita", revenue: 198300 },
  { name: "Ayala Cebu", revenue: 176800 },
];

const maxRevenue = branches[0].revenue;

const rankStyles = [
  { bg: "bg-[#C9A84C]/15", text: "text-[#C9A84C]" },
  { bg: "bg-[#9EA5AD]/15", text: "text-[#9EA5AD]" },
  { bg: "bg-[#B5754A]/15", text: "text-[#B5754A]" },
  { bg: "bg-gray-100", text: "text-gray-400" },
  { bg: "bg-gray-100", text: "text-gray-400" },
];

const LocationIcon = () => (
  <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
  </svg>
);

export default function TopBranchesCard() {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-4">
      <h3 className="font-semibold text-gray-900">Branch Overview</h3>
      <p className="text-xs text-gray-400 mt-0.5 mb-4">Revenue per branch in the past 30 days</p>

      <div className="space-y-3">
        {branches.map((branch, i) => (
          <div key={branch.name} className="flex items-center gap-3">
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 text-[10px] font-bold ${rankStyles[i].bg} ${rankStyles[i].text}`}>
              {i + 1}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1 min-w-0">
                  <span className="text-[#A08C7A]">
                    <LocationIcon />
                  </span>
                  <span className="text-sm font-medium text-gray-800 truncate">{branch.name}</span>
                </div>
                <span className="text-sm font-semibold text-gray-900 ml-2 shrink-0">
                  ₱{branch.revenue.toLocaleString()}
                </span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${(branch.revenue / maxRevenue) * 100}%`,
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
