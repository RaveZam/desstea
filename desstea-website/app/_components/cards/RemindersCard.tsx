export default function RemindersCard() {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Reminders</h3>
        <button className="text-xs text-[#6B4F3A] font-medium hover:underline">View all</button>
      </div>

      {/* Reminder item */}
      <div className="flex-1 flex flex-col justify-center">
        <div className="bg-[#FFF3ED] rounded-2xl p-4 border border-[#F2EBE5]">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-8 h-8 bg-[#6B4F3A] rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 8h1a4 4 0 010 8h-1" />
                <path d="M3 8h14v9a4 4 0 01-4 4H7a4 4 0 01-4-4V8z" />
                <line x1="6" y1="2" x2="6" y2="4" />
                <line x1="10" y1="2" x2="10" y2="4" />
                <line x1="14" y1="2" x2="14" y2="4" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm leading-tight">Team Tasting Session</p>
              <p className="text-xs text-gray-400 mt-0.5">New spring blend evaluation</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-4">
            <svg className="w-3.5 h-3.5 text-[#E8692A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12,6 12,12 16,14" />
            </svg>
            <span className="font-medium text-[#6B4F3A]">10:00 AM – 12:00 PM</span>
          </div>

          <button className="w-full bg-[#6B4F3A] text-white text-sm font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 hover:bg-[#5A3F2E] transition-colors">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <polygon points="23,7 16,12 23,17" />
              <rect x="1" y="5" width="15" height="14" rx="2" />
            </svg>
            Start Session
          </button>
        </div>
      </div>

      {/* Upcoming dots */}
      <div className="flex items-center gap-1.5 mt-4">
        <div className="w-2 h-2 rounded-full bg-[#6B4F3A]" />
        <div className="w-2 h-2 rounded-full bg-[#F2EBE5]" />
        <div className="w-2 h-2 rounded-full bg-[#F2EBE5]" />
        <span className="text-[11px] text-gray-400 ml-1">2 more reminders</span>
      </div>
    </div>
  );
}
