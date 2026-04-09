interface Tab {
  label: string;
  value: string;
  count?: number;
}

interface TabsProps {
  tabs: Tab[];
  active: string;
  onChange: (value: string) => void;
  className?: string;
}

export default function Tabs({ tabs, active, onChange, className = "" }: TabsProps) {
  return (
    <div className={`flex gap-1 ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
            active === tab.value
              ? "bg-[#F2EBE5] text-[#6B4F3A]"
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
          }`}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span
              className={`ml-1.5 text-[11px] px-1.5 py-0.5 rounded-full ${
                active === tab.value ? "bg-[#6B4F3A] text-white" : "bg-gray-200 text-gray-500"
              }`}
            >
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
