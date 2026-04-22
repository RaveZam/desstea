export default function Loading() {
  return (
    <div className="h-full overflow-y-auto flex flex-col px-5 py-3 gap-4 animate-pulse">
      <div className="shrink-0 flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-36 bg-gray-200 rounded-lg" />
          <div className="h-4 w-52 bg-gray-200 rounded" />
        </div>
        <div className="h-9 w-32 bg-gray-200 rounded-xl" />
      </div>
      <div className="shrink-0 grid grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-24 bg-gray-200 rounded-2xl" />
        ))}
      </div>
      <div className="flex flex-col gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-16 bg-gray-200 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
