export default function Loading() {
  return (
    <div className="h-full overflow-y-auto flex flex-col px-5 py-3 gap-4 animate-pulse">
      <div className="shrink-0 flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-40 bg-gray-200 rounded-lg" />
          <div className="h-4 w-64 bg-gray-200 rounded" />
        </div>
        <div className="h-9 w-32 bg-gray-200 rounded-xl" />
      </div>
      <div className="shrink-0 grid grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 bg-gray-200 rounded-2xl" />
        ))}
      </div>
      <div className="shrink-0 grid gap-4" style={{ gridTemplateColumns: "2fr 1fr", height: 320 }}>
        <div className="bg-gray-200 rounded-2xl" />
        <div className="bg-gray-200 rounded-2xl" />
      </div>
      <div className="shrink-0 grid gap-4" style={{ gridTemplateColumns: "3fr 1fr" }}>
        <div className="h-48 bg-gray-200 rounded-2xl" />
        <div className="h-48 bg-gray-200 rounded-2xl" />
      </div>
    </div>
  );
}
