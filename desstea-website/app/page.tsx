import Sidebar from "./_components/sidebar/Sidebar";
import Header from "./_components/header/Header";
import StatCards from "./_components/stats/StatCards";
import SalesChart from "./_components/charts/SalesChart";
import RemindersCard from "./_components/cards/RemindersCard";
import TeamCard from "./_components/cards/TeamCard";
import OrderProgressCard from "./_components/cards/OrderProgressCard";
import ProjectListCard from "./_components/cards/ProjectListCard";
import TimeTrackerCard from "./_components/cards/TimeTrackerCard";

export default function DashboardPage() {
  return (
    <div className="flex h-screen overflow-hidden bg-[#F4F6F8]">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-3">
            {/* Page title row */}
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-[28px] font-bold text-gray-900 tracking-tight leading-tight">
                  Dashboard
                </h1>
                <p className="text-gray-500 text-sm mt-1">
                  Track, manage, and grow your tea business with ease.
                </p>
              </div>
              <div className="flex gap-2.5 mt-1">
                <button className="flex items-center gap-2 bg-[#E8692A] text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-[#d45c20] transition-colors shadow-sm">
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  New Order
                </button>
                <button className="flex items-center gap-2 border border-gray-200 bg-white text-gray-700 px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors shadow-sm">
                  Import Data
                </button>
              </div>
            </div>

            {/* Stat cards row */}
            <StatCards />

            {/* Middle row: Sales chart + Reminders */}
            <div
              className="grid gap-4"
              style={{ gridTemplateColumns: "1fr 280px" }}
            >
              <SalesChart />
              <RemindersCard />
            </div>

            {/* Bottom row: Team | Progress | (Projects + Timer) */}
            <div
              className="grid gap-4"
              style={{ gridTemplateColumns: "1fr 1fr 220px" }}
            >
              <TeamCard />
              <OrderProgressCard />
              <div className="flex flex-col gap-4">
                <ProjectListCard />
                <TimeTrackerCard />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
