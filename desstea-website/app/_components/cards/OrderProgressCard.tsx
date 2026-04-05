// Semi-circle gauge math:
// center (110, 118), radius 88
// Path: M 22 118 A 88 88 0 0 0 198 118  (upper semi-circle)
// Path length = π × 88 = 276.46
// 67% fill = 185.2
// Completed (50%) = 138.2 → dasharray="138.2 276.46"
// In Progress (17%) = 46.9 → dasharray="46.9 276.46", dashoffset="138.2"

const PATH = "M 22 118 A 88 88 0 0 0 198 118";
const PATH_LEN = 276.46;

const PCT_COMPLETED = 0.5;
const PCT_IN_PROGRESS = 0.17;
// Pending = 1 - 0.5 - 0.17 = 0.33

const SEG_COMPLETED = PCT_COMPLETED * PATH_LEN;       // 138.23
const SEG_IN_PROGRESS = PCT_IN_PROGRESS * PATH_LEN;  // 46.99

export default function OrderProgressCard() {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 flex flex-col items-center">
      <div className="w-full flex items-center justify-between mb-1">
        <h3 className="font-semibold text-gray-900">Order Progress</h3>
        <button className="text-xs text-[#6B4F3A] font-medium hover:underline">Details</button>
      </div>

      <div className="relative w-full">
        <svg viewBox="0 0 220 130" className="w-full">
          {/* Background track */}
          <path
            d={PATH}
            fill="none"
            stroke="#FFF3ED"
            strokeWidth={22}
            strokeLinecap="round"
          />

          {/* In Progress segment (medium green) — rendered first so Completed sits on top cleanly */}
          <path
            d={PATH}
            fill="none"
            stroke="#E8692A"
            strokeWidth={22}
            strokeLinecap="butt"
            strokeDasharray={`${SEG_COMPLETED + SEG_IN_PROGRESS} ${PATH_LEN}`}
            strokeDashoffset={0}
          />

          {/* Completed segment (dark green) */}
          <path
            d={PATH}
            fill="none"
            stroke="#6B4F3A"
            strokeWidth={22}
            strokeLinecap="round"
            strokeDasharray={`${SEG_COMPLETED} ${PATH_LEN}`}
            strokeDashoffset={0}
          />

          {/* Center percentage */}
          <text
            x="110"
            y="88"
            textAnchor="middle"
            fontSize="28"
            fontWeight="800"
            fill="#111827"
            fontFamily="inherit"
          >
            67%
          </text>
          <text
            x="110"
            y="108"
            textAnchor="middle"
            fontSize="11"
            fill="#6B7280"
            fontFamily="inherit"
          >
            Orders Fulfilled
          </text>
        </svg>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-5 mt-1">
        <span className="flex items-center gap-1.5 text-xs text-gray-600">
          <span className="w-2.5 h-2.5 rounded-full bg-[#6B4F3A] inline-block" />
          Completed
        </span>
        <span className="flex items-center gap-1.5 text-xs text-gray-600">
          <span className="w-2.5 h-2.5 rounded-full bg-[#E8692A] inline-block" />
          In Progress
        </span>
        <span className="flex items-center gap-1.5 text-xs text-gray-600">
          <span
            className="w-2.5 h-2.5 rounded-full inline-block"
            style={{
              background: "repeating-linear-gradient(-45deg, #F2D5C8, #F2D5C8 2px, #FFF3ED 2px, #FFF3ED 5px)",
            }}
          />
          Pending
        </span>
      </div>
    </div>
  );
}
