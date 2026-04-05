const bars: Array<{ day: string; height: number; type: "stripe" | "dark" | "light"; tooltip?: string }> = [
  { day: "S", height: 42, type: "stripe" },
  { day: "M", height: 78, type: "dark" },
  { day: "T", height: 104, type: "light", tooltip: "26%" },
  { day: "W", height: 70, type: "dark" },
  { day: "T", height: 57, type: "stripe" },
  { day: "F", height: 46, type: "stripe" },
  { day: "S", height: 35, type: "stripe" },
];

const BAR_W = 28;
const SPACING = 52;
const START_X = 22;
const BOTTOM_Y = 128;
const LABEL_Y = 146;
const RX = 14;

export default function SalesChart() {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-4">
      <div className="flex items-center justify-between mb-1">
        <div>
          <h3 className="font-semibold text-gray-900">Sales Analytics</h3>
          <p className="text-xs text-gray-400 mt-0.5">Weekly performance overview</p>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded-full bg-[#6B4F3A]" />
            Sales
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded-full bg-[#E8692A]" />
            Target
          </span>
        </div>
      </div>

      <svg viewBox="0 0 400 158" className="w-full mt-2" style={{ overflow: "visible" }}>
        <defs>
          <pattern
            id="diagonalHatch"
            patternUnits="userSpaceOnUse"
            width="8"
            height="8"
            patternTransform="rotate(-45 0 0)"
          >
            <rect width="8" height="8" fill="#FFF3ED" />
            <line x1="0" y1="0" x2="0" y2="8" stroke="#F2D5C8" strokeWidth="3" />
          </pattern>

          <filter id="barShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#6B4F3A" floodOpacity="0.15" />
          </filter>
        </defs>

        {bars.map((bar, i) => {
          const x = START_X + i * SPACING;
          const cx = x + BAR_W / 2;
          const y = BOTTOM_Y - bar.height;

          const fill =
            bar.type === "dark"
              ? "#6B4F3A"
              : bar.type === "light"
              ? "#E8692A"
              : "url(#diagonalHatch)";

          return (
            <g key={i}>
              {/* Bar */}
              <rect
                x={x}
                y={y}
                width={BAR_W}
                height={bar.height}
                rx={RX}
                ry={RX}
                fill={fill}
                filter={bar.type !== "stripe" ? "url(#barShadow)" : undefined}
              />

              {/* Tooltip bubble */}
              {bar.tooltip && (
                <g>
                  <rect
                    x={cx - 20}
                    y={y - 30}
                    width={40}
                    height={22}
                    rx={11}
                    fill="#6B4F3A"
                  />
                  <text
                    x={cx}
                    y={y - 14}
                    textAnchor="middle"
                    fill="white"
                    fontSize={11}
                    fontWeight="700"
                    fontFamily="inherit"
                  >
                    {bar.tooltip}
                  </text>
                  {/* Arrow */}
                  <polygon
                    points={`${cx - 5},${y - 9} ${cx + 5},${y - 9} ${cx},${y - 3}`}
                    fill="#6B4F3A"
                  />
                </g>
              )}

              {/* Day label */}
              <text
                x={cx}
                y={LABEL_Y}
                textAnchor="middle"
                fill="#9CA3AF"
                fontSize={12}
                fontFamily="inherit"
              >
                {bar.day}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
