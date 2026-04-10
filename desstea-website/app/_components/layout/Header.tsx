export default function Header() {
  return (
    <header className="h-14 bg-white border-b border-gray-100 flex items-center px-6 gap-4 flex-shrink-0">
      {/* Greeting + date */}
      <div className="flex flex-col leading-tight">
        <p className="text-sm font-semibold text-gray-800">Good morning, Michael</p>
        <p className="text-[11px] text-gray-400">Monday, April 7, 2026</p>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {/* Mail */}
        <button className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors text-gray-400">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
        </button>

        {/* Bell */}
        <button className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors text-gray-400 relative">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 01-3.46 0" />
          </svg>
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#E8692A] rounded-full border border-white" />
        </button>

        {/* Divider */}
        <div className="w-px h-5 bg-gray-200 mx-1" />

        {/* User */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#3B82F6] to-[#1E40AF] flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
            MA
          </div>
          <div className="leading-tight hidden sm:block">
            <p className="text-xs font-semibold text-gray-800">Michael Aurelio</p>
            <p className="text-[10px] text-gray-400">michael@desstea.com</p>
          </div>
        </div>
      </div>
    </header>
  );
}
