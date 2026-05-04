import LiveClock from "./LiveClock";

type Props = {
  email: string;
  displayName: string;
  initials: string;
};

export default function Header({ email, displayName, initials }: Props) {
  return (
    <header className="h-14 bg-white border-b border-gray-100 flex items-center px-6 gap-4 flex-shrink-0">
      {/* Greeting + date */}
      <div className="flex flex-col leading-tight">
        <p className="text-sm font-semibold text-gray-800">Good morning, {displayName}</p>
        <p className="text-[11px] text-gray-400">
          {new Date().toLocaleDateString("en-PH", {
            timeZone: "Asia/Manila",
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
          })}{" "}
          &middot; <LiveClock />
        </p>
      </div>

      <div className="flex items-center gap-2 ml-auto">

        {/* User */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#3B82F6] to-[#1E40AF] flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
            {initials}
          </div>
          <div className="leading-tight hidden sm:block">
            <p className="text-xs font-semibold text-gray-800">{displayName}</p>
            <p className="text-[10px] text-gray-400">{email}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
