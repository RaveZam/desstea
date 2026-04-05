const ArrowIcon = () => (
  <svg
    className="w-4 h-4"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.5}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="7" y1="17" x2="17" y2="7" />
    <polyline points="7,7 17,7 17,17" />
  </svg>
);

const TrendIcon = ({ white }: { white?: boolean }) => (
  <span
    className={`flex items-center gap-1 text-[11px] font-medium ${white ? "text-white/70" : "text-[#E8692A]"}`}
  >
    <svg
      className="w-3 h-3"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="23,6 13.5,15.5 8.5,10.5 1,18" />
      <polyline points="17,6 23,6 23,12" />
    </svg>
    Increased from last month
  </span>
);

export default function StatCards() {
  return (
    <div className="grid grid-cols-4 gap-4">
      {/* Total Orders — dark green */}
      <div className="bg-[#6B4F3A] text-white rounded-2xl p-4 relative overflow-hidden">
        <div className="absolute top-3 right-3">
          <button className="w-6 h-6 bg-white/15 rounded-full flex items-center justify-center hover:bg-white/25 transition-colors">
            <ArrowIcon />
          </button>
        </div>
        <p className="text-xs font-medium text-white/70">Total Orders</p>
        <p className="text-3xl font-bold mt-1.5 mb-2">124</p>
        <TrendIcon white />
      </div>

      {/* Completed Orders */}
      <div className="bg-white rounded-2xl p-4 shadow-sm relative">
        <div className="absolute top-3 right-3">
          <button className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors text-gray-500">
            <ArrowIcon />
          </button>
        </div>
        <p className="text-xs font-medium text-gray-500">Completed Orders</p>
        <p className="text-3xl font-bold text-gray-900 mt-1.5 mb-2">98</p>
        <TrendIcon />
      </div>

      {/* Active Orders */}
      <div className="bg-white rounded-2xl p-4 shadow-sm relative">
        <div className="absolute top-3 right-3">
          <button className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors text-gray-500">
            <ArrowIcon />
          </button>
        </div>
        <p className="text-xs font-medium text-gray-500">Active Orders</p>
        <p className="text-3xl font-bold text-gray-900 mt-1.5 mb-2">18</p>
        <TrendIcon />
      </div>

      {/* Pending */}
      <div className="bg-white rounded-2xl p-4 shadow-sm relative">
        <div className="absolute top-3 right-3">
          <button className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors text-gray-500">
            <ArrowIcon />
          </button>
        </div>
        <p className="text-xs font-medium text-gray-500">Pending</p>
        <p className="text-3xl font-bold text-gray-900 mt-1.5 mb-2">8</p>
        <span className="text-[11px] font-medium text-gray-400">On Review</span>
      </div>
    </div>
  );
}
