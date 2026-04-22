export type DateRangeKey = "today" | "7d" | "30d";

export function getDateBounds(range: DateRangeKey): { start: Date; end: Date } {
  // Anchor everything to Philippine time (UTC+8)
  const phOffset = 8 * 60 * 60 * 1000;
  const now = new Date();
  const phNow = new Date(now.getTime() + phOffset);
  const todayStartUtc = Date.UTC(
    phNow.getUTCFullYear(),
    phNow.getUTCMonth(),
    phNow.getUTCDate()
  );
  const todayStart = new Date(todayStartUtc - phOffset);
  const tomorrowStart = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

  if (range === "today") return { start: todayStart, end: tomorrowStart };
  if (range === "7d")
    return {
      start: new Date(todayStart.getTime() - 6 * 24 * 60 * 60 * 1000),
      end: tomorrowStart,
    };
  // 30d
  return {
    start: new Date(todayStart.getTime() - 29 * 24 * 60 * 60 * 1000),
    end: tomorrowStart,
  };
}
