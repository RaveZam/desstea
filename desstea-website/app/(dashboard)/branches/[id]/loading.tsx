export default function Loading() {
  return (
    <div className="h-full overflow-y-auto flex flex-col px-5 py-3 gap-4 animate-pulse">
      <div className="shrink-0 flex items-center gap-3">
        <div className="h-8 w-8 bg-gray-200 rounded-lg" />
        <div className="h-8 w-48 bg-gray-200 rounded-lg" />
      </div>
      <div className="shrink-0 grid grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 bg-gray-200 rounded-2xl" />
        ))}
      </div>
      <div className="shrink-0 h-72 bg-gray-200 rounded-2xl" />
      <div className="flex flex-col gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-12 bg-gray-200 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
