import PageMeta from "../../components/common/PageMeta";

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
    statusColor: "#16a34a",
    percent: 80,
    barColor: "#22c55e",
  },
  {
    title: "Following 2-Step Instructions",
    category: "Communication",
    status: "Steady progress",
    statusColor: "#4f46e5",
    percent: 60,
    barColor: "#6366f1",
  },
  {
    title: "Peer Initiation",
    category: "Social",
    status: "Keep practising",
    statusColor: "#d97706",
    percent: 45,
    barColor: "#f59e0b",
  },
  {
    title: "Handwriting — Letter Formation",
    category: "Motor",
    status: "Getting better!",
    statusColor: "#16a34a",
    percent: 72,
    barColor: "#22c55e",
  },
];

const quickActions = [
  { label: "Log Home Observation",  icon: <PlusIcon />,     bg: "#6366f1", hover: "#4f46e5" },
  { label: "Message Priya Sharma",  icon: <MessageIcon />,  bg: "#0d9488", hover: "#0f766e" },
  { label: "Book Advisory Session", icon: <CalendarIcon />, bg: "#16a34a", hover: "#15803d" },
  { label: "View Progress Report",  icon: <ReportIcon />,   bg: "#7c3aed", hover: "#6d28d9" },
];

const weekStats = [
  { label: "Sessions completed",  value: "3 / 4",  highlight: false },
  { label: "Home observations",   value: "5",      highlight: false },
  { label: "Goals improving",     value: "3 of 4", highlight: true  },
];

// ─── Component ───────────────────────────────────────────────────────────────
export default function ParentDashboard() {
  return (
    <>
      <PageMeta
        title="Parent Dashboard | NeuroCare"
        description="Parent and Guardian Dashboard for NeuroCare"
      />

      <div
        className="min-h-screen bg-[#f1f5f9] -mx-4 md:-mx-6 -my-4 md:-my-6 p-4 md:p-5"
        style={{ fontFamily: "Outfit, Inter, sans-serif" }}
      >
        {/* ── Welcome Header ─────────────────────────────────────────────── */}
        <div className="mb-3">
          <h1 className="text-[19px] font-bold text-gray-900 leading-tight">
            Welcome back, Meera
          </h1>
          <p className="text-[13px] text-gray-500 mt-0.5">
            Here's how Arjun is progressing
          </p>
        </div>

        {/* ── Child Summary Card ──────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(15,23,42,0.07)] p-3.5 mb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {/* Left — Avatar + info */}
          <div className="flex items-start gap-4">
            {/* Purple avatar */}
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-bold text-[14px] select-none"
              style={{ backgroundColor: "#6366f1" }}
            >
              AK
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[15px] font-bold text-gray-900">Arjun Krishnamurthy</span>
                <span
                  className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: "#dcfce7", color: "#16a34a" }}
                >
                  Active
                </span>
              </div>
              <p className="text-[13px] text-gray-500 mt-0.5">
                Age 7 · ADHD — Combined Presentation
              </p>
              <div className="flex gap-2 mt-1.5 flex-wrap">
                <span
                  className="text-[11px] font-semibold px-2 py-0.5 rounded"
                  style={{ backgroundColor: "#fef3c7", color: "#d97706" }}
                >
                  ADHD
                </span>
                <span
                  className="text-[11px] font-semibold px-2 py-0.5 rounded"
                  style={{ backgroundColor: "#e0f2fe", color: "#0284c7" }}
                >
                  ASD
                </span>
              </div>
            </div>
          </div>

          {/* Right — Next session */}
          <div className="text-right flex-shrink-0">
            <p className="text-[12px] text-gray-400 font-medium">Next session</p>
            <p className="text-[15px] font-bold text-gray-900 mt-0.5">Tomorrow, 10:00 AM</p>
            <p className="text-[12px] text-gray-400 mt-0.5">with Priya Sharma</p>
          </div>
        </div>

        {/* ── Main 2-column grid ─────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">

          {/* ── Left: Goal Progress (spans 2 of 3 cols on desktop) ─────── */}
          <div className="lg:col-span-2 flex flex-col">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(15,23,42,0.07)] p-4 flex flex-col flex-1">
              {/* Card header */}
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-[14px] font-bold text-gray-900">Goal Progress</h2>
                <span className="text-[11px] text-gray-400">4 of 6 goals active</span>
              </div>

              {/* Goal rows */}
              <div className="flex flex-col divide-y divide-gray-50 flex-1">
                {goals.map((goal, idx) => (
                  <div key={idx} className="py-2.5 first:pt-0 last:pb-0">
                    {/* Title row */}
                    <div className="flex items-baseline justify-between gap-2 mb-1.5">
                      <div className="flex items-baseline gap-1.5 flex-wrap min-w-0">
                        <span className="text-[14px] font-semibold text-gray-800 leading-tight">
                          {goal.title}
                        </span>
                        <span className="text-[12px] text-gray-400 font-normal whitespace-nowrap">
                          · {goal.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span
                          className="text-[12px] font-semibold whitespace-nowrap"
                          style={{ color: goal.statusColor }}
                        >
                          {goal.status}
                        </span>
                        <span className="text-[12px] font-bold text-gray-400">
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
          <div className="flex flex-col gap-4">

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(15,23,42,0.07)] p-4">
              <h2 className="text-[14px] font-bold text-gray-900 mb-2.5">Quick Actions</h2>
              <div className="flex flex-col gap-2">
                {quickActions.map((action, idx) => (
                  <button
                    key={idx}
                    className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-white text-[12.5px] font-semibold transition-all duration-150 active:scale-[0.98] cursor-pointer text-left"
                    style={{ backgroundColor: action.bg }}
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
            <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(15,23,42,0.07)] p-4">
              <h2 className="text-[14px] font-bold text-gray-900 mb-2.5">This Week at a Glance</h2>
              <div className="flex flex-col gap-2.5">
                {weekStats.map((stat, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="text-[13px] text-gray-500">{stat.label}</span>
                    <span
                      className="text-[13px] font-semibold"
                      style={{ color: stat.highlight ? "#4add5eff" : "#374151" }}
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
