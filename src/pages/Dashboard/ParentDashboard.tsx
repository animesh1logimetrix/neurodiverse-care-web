import { useState } from "react";
import { useNavigate } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import { useAuth } from "../../context/AuthContext";

// ─── SVG Icons ──────────────────────────────────────────────────────────────

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}
function MessageIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}
function CalendarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}
function ReportIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

// ─── Progress Bar ────────────────────────────────────────────────────────────
function ProgressBar({ percent, color }: { percent: number; color: string }) {
  return (
    <div className="w-full rounded-full overflow-hidden" style={{ height: "5px", backgroundColor: "#e5e7eb" }}>
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${percent}%`, backgroundColor: color }}
      />
    </div>
  );
}

// ─── Data ────────────────────────────────────────────────────────────────────
const goals = [
  {
    title: "Eye Contact During Play",
    category: "Social",
    status: "Getting better!",
    statusColor: "#12b76a",
    percent: 80,
    barColor: "#32d583",
  },
  {
    title: "Following 2-Step Instructions",
    category: "Communication",
    status: "Steady progress",
    statusColor: "#7db9fb",
    percent: 60,
    barColor: "#88c2fb",
  },
  {
    title: "Peer Initiation",
    category: "Social",
    status: "Keep practising",
    statusColor: "#f79009",
    percent: 45,
    barColor: "#fdb022",
  },
  {
    title: "Handwriting — Letter Formation",
    category: "Motor",
    status: "Getting better!",
    statusColor: "#12b76a",
    percent: 72,
    barColor: "#32d583",
  },
];

const quickActions = [
  { label: "Log Home Observation",  icon: <PlusIcon />,     bg: "#7db9fb", hover: "#6aa8e7", path: "/dashboard/home-observations" },
  // { label: "Message Priya Sharma",  icon: <MessageIcon />,  bg: "#0d9488", hover: "#0f766e" },
  { label: "Book Advisory Session", icon: <CalendarIcon />, bg: "#12b76a", hover: "#039855", path: "#" },
  { label: "View Progress Report",  icon: <ReportIcon />,   bg: "#7a5af8", hover: "#6941c6", path: "#" },
];

const weekStats = [
  { label: "Sessions completed",  value: "3 / 4",  highlight: false },
  { label: "Home observations",   value: "5",      highlight: false },
  { label: "Goals improving",     value: "3 of 4", highlight: true  },
];

// ─── Component ───────────────────────────────────────────────────────────────
export default function ParentDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const parentName = user?.name ? user.name.split(" ")[0] : "Parent";
  const [timeFilter, setTimeFilter] = useState("Weekly Progress");

  return (
    <>
      <PageMeta
        title="Parent Dashboard | NeuroCare"
        description="Parent and Guardian Dashboard for NeuroCare"
      />

      <div
        className=" -mx-4 md:-mx-6 -my-4 md:-my-6 p-[24px]"
        style={{ fontFamily: "Outfit, sans-serif" }}
      >
        {/* ── Welcome Header ─────────────────────────────────────────────── */}
        <div className="mb-[16px] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-[20px] font-bold text-gray-900 leading-tight">
              Welcome back, {parentName}
            </h1>
            <p className="text-[12px] text-black mt-1">
              Here's how Arjun is progressing
            </p>
          </div>
          
          <div className="flex-shrink-0">
            <select 
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl shadow-sm text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#7db9fb] focus:border-[#7db9fb] hover:bg-gray-50 transition-colors cursor-pointer appearance-none pr-10 relative"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                backgroundPosition: `right 12px center`,
                backgroundRepeat: `no-repeat`,
                backgroundSize: `16px`,
              }}
            >
              <option value="Daily Progress">Daily Progress</option>
              <option value="Weekly Progress">Weekly Progress</option>
              <option value="Monthly Progress">Monthly Progress</option>
            </select>
          </div>
        </div>

        {/* ── Child Summary Card ──────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgba(15,23,42,0.08)] p-[16px] mb-[16px] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-[16px]">
          {/* Left — Avatar + info */}
          <div className="flex items-start gap-[16px]">
            {/* Purple avatar */}
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-bold text-[16px] select-none"
              style={{ backgroundColor: "#6aa8e7" }}
            >
              AK
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[18px] font-bold text-gray-900">Arjun Krishnamurthy</span>
                <span
                  className="text-[12px] font-semibold px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: "#ecfdf3", color: "#12b76a" }}
                >
                  Active
                </span>
              </div>
              <p className="text-[14px] text-gray-500 mt-0.5">
                Age 7 · ADHD — Combined Presentation
              </p>
              <div className="flex gap-2 mt-2 flex-wrap">
                <span
                  className="text-[12px] font-semibold px-2 py-0.5 rounded"
                  style={{ backgroundColor: "#fffaeb", color: "#f79009" }}
                >
                  ADHD
                </span>
                <span
                  className="text-[12px] font-semibold px-2 py-0.5 rounded"
                  style={{ backgroundColor: "#f0f6fe", color: "#7db9fb" }}
                >
                  ASD
                </span>
              </div>
            </div>
          </div>

          {/* Right — Next session */}
          {/* <div className="text-right flex-shrink-0">
            <p className="text-[14px] text-gray-400 font-medium">Next session</p>
            <p className="text-[18px] font-bold text-gray-900 mt-1">Tomorrow, 10:00 AM</p>
            <p className="text-[14px] text-gray-400 mt-0.5">with Priya Sharma</p>
          </div> */}
        </div>

        {/* ── Main 2-column grid ─────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-[16px] items-stretch">

          {/* ── Left: Goal Progress (spans 2 of 3 cols on desktop) ─────── */}
          <div className="lg:col-span-2 flex flex-col min-w-0">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgba(15,23,42,0.08)] p-[16px] flex flex-col flex-1 h-full">
              {/* Card header */}
              <div className="flex items-center justify-between mb-[16px]">
                <h2 className="text-[15px] font-bold text-gray-800 leading-tight">Goal Progress</h2>
                <span className="text-[12px] text-gray-400">4 of 6 goals active</span>
              </div>

              {/* Goal rows */}
              <div className="flex flex-col divide-y divide-gray-50 flex-1">
                {goals.map((goal, idx) => (
                  <div key={idx} className="py-4 first:pt-0 last:pb-0">
                    {/* Title row */}
                    <div className="flex items-baseline justify-between gap-2 mb-2">
                      <div className="flex items-baseline gap-2 flex-wrap min-w-0">
                        <span className="text-[16px] font-semibold text-gray-800 leading-tight">
                          {goal.title}
                        </span>
                        <span className="text-[14px] text-gray-400 font-normal whitespace-nowrap">
                          · {goal.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span
                          className="text-[14px] font-semibold whitespace-nowrap"
                          style={{ color: goal.statusColor }}
                        >
                          {goal.status}
                        </span>
                        <span className="text-[14px] font-bold text-gray-400">
                          {goal.percent}%
                        </span>
                      </div>
                    </div>
                    {/* Progress bar */}
                    <ProgressBar percent={goal.percent} color={goal.barColor} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right column: Quick Actions + This Week ─────────────────── */}
          <div className="flex flex-col gap-[16px]">

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgba(15,23,42,0.08)] p-[16px]">
              <h2 className="text-[15px] font-bold text-gray-800 leading-tight mb-[12px]">Quick Actions</h2>
              <div className="flex flex-col gap-3">
                {quickActions.map((action, idx) => (
                  <button
                    key={idx}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white text-[14px] font-semibold transition-all duration-150 active:scale-[0.98] cursor-pointer text-left"
                    style={{ backgroundColor: action.bg }}
                    onClick={() => action.path && action.path !== "#" && navigate(action.path)}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.backgroundColor = action.hover;
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.backgroundColor = action.bg;
                    }}
                  >
                    <span className="flex-shrink-0 opacity-90">{action.icon}</span>
                    {action.label}
                  </button>
                ))}
              </div>
            </div>

            {/* This Week at a Glance */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgba(15,23,42,0.08)] p-[16px]">
              <h2 className="text-[15px] font-bold text-gray-800 leading-tight mb-[12px]">This Week at a Glance</h2>
              <div className="flex flex-col gap-4">
                {weekStats.map((stat, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="text-[14px] text-gray-500">{stat.label}</span>
                    <span
                      className="text-[14px] font-semibold"
                      style={{ color: stat.highlight ? "#12b76a" : "#475467" }}
                    >
                      {stat.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
