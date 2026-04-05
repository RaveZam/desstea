const members = [
  {
    name: "Alexandra Deff",
    initials: "AD",
    color: "bg-rose-400",
    task: "Github Project Repository",
    status: "Completed",
  },
  {
    name: "Edwin Adenike",
    initials: "EA",
    color: "bg-sky-400",
    task: "Integrate User Authentication System",
    status: "In Progress",
  },
  {
    name: "Isaac Oluwatemilorun",
    initials: "IO",
    color: "bg-violet-400",
    task: "Develop Search & Filter Feature",
    status: "Pending",
  },
  {
    name: "David Oshodi",
    initials: "DO",
    color: "bg-amber-400",
    task: "Responsive Layout for Menu Page",
    status: "In Progress",
  },
];

const statusStyles: Record<string, string> = {
  Completed: "bg-[#F2EBE5] text-[#6B4F3A]",
  "In Progress": "bg-yellow-100 text-yellow-700",
  Pending: "bg-orange-100 text-orange-600",
};

export default function TeamCard() {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Team Collaboration</h3>
        <button className="flex items-center gap-1.5 text-xs border border-gray-200 text-gray-600 font-medium px-3 py-1.5 rounded-xl hover:bg-gray-50 transition-colors">
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Member
        </button>
      </div>

      <div className="space-y-3">
        {members.map((m) => (
          <div key={m.name} className="flex items-center gap-3">
            <div className={`w-8 h-8 ${m.color} rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
              {m.initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">{m.name}</p>
              <p className="text-xs text-gray-400 truncate">
                Working on{" "}
                <span className="text-[#6B4F3A] font-medium">{m.task}</span>
              </p>
            </div>
            <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap flex-shrink-0 ${statusStyles[m.status]}`}>
              {m.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
