import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import PageMeta from "../../components/common/PageMeta";

// ─── SVG Icons ─────────────────────────────────────────────────────────────

function BuildingIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <line x1="9" y1="22" x2="9" y2="16" /><line x1="15" y1="22" x2="15" y2="16" /><line x1="9" y1="16" x2="15" y2="16" />
      <path d="M8 6h.01M16 6h.01M12 6h.01M12 10h.01M16 10h.01M8 10h.01M8 14h.01M12 14h.01M16 14h.01" />
    </svg>
  );
}
function UsersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
function TargetIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
    </svg>
  );
}
function RupeeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 3h12M6 8h12M6 13h8.5a3.5 3.5 0 1 0 0-7H10M14.5 13L6 21" />
    </svg>
  );
}

export default function ClinicAdminDashboard() {

  // ── Chart 1: Users By Role (semi-donut) ────────────────────────────────────
  const roleOptions: ApexOptions = {
    chart: { type: "donut", fontFamily: "Outfit, sans-serif", sparkline: { enabled: true } },
    plotOptions: {
      pie: { startAngle: -90, endAngle: 90, offsetY: 40, donut: { size: "70%" } }
    },
    colors: ["#60a5fa", "#f59e0b", "#10b981", "#f87171", "#facc15"],
    labels: ["Parents", "Therapists", "Admins", "School", "Psychologists"],
    dataLabels: { enabled: false },
    legend: { show: false },
    stroke: { width: 0 },
    tooltip: {
      enabled: true,
      custom: ({ series, seriesIndex, w }) => {
        const val = series[seriesIndex];
        const label = w.globals.labels[seriesIndex];
        return `<div style="padding:6px 12px;border-radius:8px;border:1px solid #e2e8f0;background:#fff;box-shadow:0 4px 12px rgba(0,0,0,0.08);font-family:Outfit,sans-serif;font-size:12px;color:#1e293b;">
          <div style="font-weight:700;text-align:center;">${val}</div>
          <div style="color:#64748b;font-size:11px;">${label}</div>
        </div>`;
      }
    }
  };
  const roleSeries = [500, 300, 150, 120, 142];

  // ── Chart 2: Ticket Volume Monthly Trend (bar) ──────────────────────────────
  const ticketOptions: ApexOptions = {
    chart: { type: "bar", toolbar: { show: false }, fontFamily: "Outfit, sans-serif" },
    colors: ["#38bdf8"],
    plotOptions: {
      bar: {
        columnWidth: "18%",
        borderRadius: 3,
        colors: { backgroundBarColors: ["#e2e8f0"], backgroundBarOpacity: 1, backgroundBarRadius: 3 }
      }
    },
    dataLabels: { enabled: false },
    grid: { borderColor: "#f1f5f9", strokeDashArray: 3, xaxis: { lines: { show: false } }, yaxis: { lines: { show: true } } },
    xaxis: {
      categories: ["Feb", "Mar", "Apr", "May", "Jun", "Jul"],
      axisBorder: { show: false }, axisTicks: { show: false },
      labels: { style: { colors: "#94a3b8", fontFamily: "Outfit", fontSize: "11px" } }
    },
    yaxis: {
      min: 0, max: 36, tickAmount: 4,
      labels: { style: { colors: "#94a3b8", fontFamily: "Outfit", fontSize: "11px" } }
    },
    tooltip: {
      custom: ({ dataPointIndex, w }) => {
        const month = w.globals.labels[dataPointIndex];
        const data = [
          { open: 8, in_progress: 5, resolved: 12, closed: 5 },
          { open: 12, in_progress: 8, resolved: 15, closed: 7 },
          { open: 15, in_progress: 11, resolved: 22, closed: 9 },
          { open: 10, in_progress: 6, resolved: 18, closed: 8 },
          { open: 14, in_progress: 9, resolved: 20, closed: 6 },
          { open: 16, in_progress: 12, resolved: 24, closed: 10 }
        ][dataPointIndex];
        return `<div style="padding:10px 13px;border-radius:10px;border:1px solid #e2e8f0;background:#fff;box-shadow:0 8px 20px rgba(0,0,0,0.1);font-family:Outfit,sans-serif;font-size:11px;min-width:110px;">
          <div style="font-weight:700;color:#1e293b;margin-bottom:5px;">${month}</div>
          <div style="color:#db2777;margin-bottom:2px;">open: ${data.open}</div>
          <div style="color:#059669;margin-bottom:2px;">in_progress: ${data.in_progress}</div>
          <div style="color:#d97706;margin-bottom:2px;">resolved: ${data.resolved}</div>
          <div style="color:#dc2626;">closed: ${data.closed}</div>
        </div>`;
      }
    }
  };
  const ticketSeries = [{ name: "Tickets", data: [14, 26, 27, 19, 14, 25] }];

  // ── Chart 3: Monthly Recurring Revenue (area) ───────────────────────────────
  const mrrOptions: ApexOptions = {
    chart: { type: "area", toolbar: { show: false }, fontFamily: "Outfit, sans-serif" },
    colors: ["#38bdf8"],
    stroke: { curve: "smooth", width: 2.5 },
    fill: { type: "gradient", gradient: { shadeIntensity: 1, opacityFrom: 0.3, opacityTo: 0.02, stops: [0, 100] } },
    dataLabels: { enabled: false },
    grid: { borderColor: "#f1f5f9", strokeDashArray: 3, xaxis: { lines: { show: false } }, yaxis: { lines: { show: true } } },
    xaxis: {
      categories: ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
      axisBorder: { show: false }, axisTicks: { show: false },
      labels: { style: { colors: "#94a3b8", fontFamily: "Outfit", fontSize: "11px" } }
    },
    yaxis: {
      min: 0, max: 16, tickAmount: 4,
      labels: {
        style: { colors: "#94a3b8", fontFamily: "Outfit", fontSize: "11px" },
        formatter: (v) => `₹${v}L`
      }
    },
    tooltip: {
      custom: ({ series, seriesIndex, dataPointIndex, w }) => {
        const month = w.globals.labels[dataPointIndex];
        const val = series[seriesIndex][dataPointIndex];
        return `<div style="padding:8px 13px;border-radius:10px;border:1px solid #e2e8f0;background:#fff;box-shadow:0 4px 12px rgba(0,0,0,0.1);font-family:Outfit,sans-serif;font-size:12px;text-align:center;">
          <div style="color:#94a3b8;margin-bottom:2px;font-size:11px;">${month}</div>
          <div style="color:#1e293b;font-weight:600;">MRP : <span style="font-weight:700;">₹ ${val}L</span></div>
        </div>`;
      }
    }
  };
  const mrrSeries = [{ name: "MRR", data: [8, 12, 14, 10, 8, 11, 9, 13, 11, 15, 13, 12] }];

  // ── Chart 4: Complaints by Status (donut) ──────────────────────────────────
  const complaintsDonutOptions: ApexOptions = {
    chart: { type: "donut", fontFamily: "Outfit, sans-serif", sparkline: { enabled: true } },
    plotOptions: { pie: { donut: { size: "60%" } } },
    colors: ["#ec4899", "#fb923c", "#34d399", "#818cf8", "#fde047", "#22d3ee"],
    labels: ["OPEN", "INVESTIGATING", "ACTION TAKEN", "RESOLVED", "DISMISSED", "CLOSED"],
    dataLabels: { enabled: false },
    legend: { show: false },
    stroke: { width: 2.5, colors: ["#fff"] },
    tooltip: { theme: "light" }
  };
  const complaintsDonutSeries = [3, 5, 18, 14, 4, 6];

  const complaintsLegend = [
    { count: 3,  label: "OPEN",          bg: "#ec4899" },
    { count: 5,  label: "INVESTIGATING", bg: "#fb923c" },
    { count: 18, label: "ACTION TAKEN",  bg: "#34d399" },
    { count: 14, label: "RESOLVED",      bg: "#818cf8" },
    { count: 4,  label: "DISMISSED",     bg: "#fde047", text: "#92400e" },
    { count: 6,  label: "CLOSED",        bg: "#22d3ee" }
  ];

  // ── Chart 5: Complaints Raised vs Action Taken (bar) ───────────────────────
  const complaintsCatOptions: ApexOptions = {
    chart: { type: "bar", toolbar: { show: false }, fontFamily: "Outfit, sans-serif" },
    colors: ["#67e8f9", "#38bdf8"],
    plotOptions: { bar: { columnWidth: "32%", borderRadius: 2, grouped: true } },
    dataLabels: { enabled: false },
    grid: { borderColor: "#f1f5f9", strokeDashArray: 3, xaxis: { lines: { show: false } }, yaxis: { lines: { show: true } } },
    xaxis: {
      categories: ["Privacy Breach", "Misconduct", "Negligence", "Service Failure", "Billing Dispute", "Harassment"],
      axisBorder: { show: false }, axisTicks: { show: false },
      labels: { style: { colors: "#94a3b8", fontFamily: "Outfit", fontSize: "10px" } }
    },
    yaxis: {
      min: 0, max: 1000,
      tickAmount: 5,
      labels: {
        style: { colors: "#94a3b8", fontFamily: "Outfit", fontSize: "11px" },
        formatter: (v) => v === 0 ? "0" : v >= 1000 ? "1000" : v.toString()
      }
    },
    legend: { show: false },
    tooltip: {
      shared: true, intersect: false,
      custom: ({ series, dataPointIndex, w }) => {
        const cat = w.globals.labels[dataPointIndex];
        const raised = Math.round(series[0][dataPointIndex] / 100);
        const action = Math.round(series[1][dataPointIndex] / 100);
        return `<div style="padding:10px 13px;border-radius:10px;border:1px solid #e2e8f0;background:#fff;box-shadow:0 8px 20px rgba(0,0,0,0.1);font-family:Outfit,sans-serif;font-size:11px;min-width:130px;">
          <div style="font-weight:700;color:#1e293b;margin-bottom:5px;">${cat}</div>
          <div style="color:#059669;margin-bottom:2px;">Total Raised : ${raised}</div>
          <div style="color:#0284c7;">Action Taken : ${action}</div>
        </div>`;
      }
    }
  };
  const complaintsCatSeries = [
    { name: "Total Raised", data: [900, 800, 700, 950, 800, 900] },
    { name: "Action Taken", data: [400, 500, 400, 450, 400, 400] }
  ];

  // ── Stat cards ──────────────────────────────────────────────────────────────
  const statCards = [
    { label: "Organizations",   value: "47",      sub: "6 new this month",       icon: <BuildingIcon className="w-5 h-5 text-white" />,     iconBg: "#60a5fa", bg: "#f0f9ff" },
    { label: "Total Users",     value: "1,284",   sub: "142 users this month",   icon: <UsersIcon className="w-5 h-5 text-blue-500" />,    iconBg: "#fff", bg: "#f8fafc" },
    { label: "Children Tracked",value: "3,891",   sub: "89 added this month",    icon: <TargetIcon className="w-5 h-5 text-blue-500" />,   iconBg: "#fff", bg: "#f8fafc" },
    { label: "MRR",             value: "₹12.4L",  sub: "vs ₹11.3L last month",   icon: <RupeeIcon className="w-5 h-5 text-blue-500" />,    iconBg: "#fff", bg: "#f8fafc" },
  ];

  return (
    <>
      <PageMeta title="Platform Overview | NeuroDiverse" description="Platform-wide admin overview for NeuroDiverse" />

      <div className="min-h-screen bg-[#f8fafc] -mx-4 md:-mx-6 -my-4 md:-my-6 p-[32px]" style={{ fontFamily: "Outfit, sans-serif" }}>

        {/* ── Page Header ───────────────────────────────────────────────── */}
        <div className="mb-[32px]">
          <h1 className="text-[36px] font-bold text-gray-900 leading-tight">Platform Overview</h1>
          <p className="text-[18px] text-gray-400 mt-1">NeuroDiverse — all organizations</p>
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            ROW 1 — Stats + Neuro Progress
        ══════════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-12 gap-[24px] mb-[24px] items-stretch">

          {/* Left stats card container wrapping all 4 stats cards inside a single styled block */}
          <div className="col-span-12 xl:col-span-4 min-w-0">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgba(15,23,42,0.08)] p-[24px] h-full flex flex-col justify-between">
              <div className="grid grid-cols-2 gap-[20px] h-full">
                {statCards.map((card, i) => (
                  <div
                    key={card.label}
                    className="rounded-2xl p-[20px] flex flex-col justify-between"
                    style={{ backgroundColor: card.bg }}
                  >
                    <div className="flex items-start justify-between">
                      <span className="text-[14px] font-medium text-gray-500 leading-tight">{card.label}</span>
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ml-2 ${
                          i === 0 
                            ? "text-white" 
                            : "bg-white border border-gray-100 shadow-[0_1px_3px_rgba(15,23,42,0.04)]"
                        }`}
                        style={{ backgroundColor: i === 0 ? card.iconBg : undefined }}
                      >
                        {card.icon}
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-[32px] font-bold text-gray-900 leading-none tracking-tight whitespace-nowrap">{card.value}</p>
                      <p className="text-[11px] text-gray-400 mt-1.5 font-medium">{card.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right large card — Neuro Progress Overview */}
          <div className="col-span-12 xl:col-span-8 min-w-0">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgba(15,23,42,0.08)] overflow-hidden h-full flex flex-col">

              {/* ── Top image area ── */}
              <div className="flex flex-1 min-h-0" style={{ minHeight: "280px" }}>
                {/* Large brain image — fills the left ~75% of the top area */}
                <div className="flex-1 min-w-0 flex items-center justify-center p-[24px] pb-0">
                  <img
                    src="/images/brain_main.png"
                    alt="Brain Anatomy"
                    className="w-full h-full object-contain"
                    style={{ maxHeight: "300px" }}
                  />
                </div>

                {/* 3 stacked brain thumbnails — right column */}
                <div
                  className="flex flex-col justify-center gap-[10px] flex-shrink-0 pr-[20px] pt-[20px] pb-[16px]"
                  style={{ width: "110px" }}
                >
                  {[
                    "/images/brain_cross3.png",
                    "/images/brain_cross1.png",
                    "/images/brain_cross2.png"
                  ].map((src, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl overflow-hidden border border-gray-100 bg-gray-50 shadow-sm flex-1"
                      style={{ minHeight: "72px" }}
                    >
                      <img src={src} alt="Brain cross-section" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Bottom text + metric cards area ── */}
              <div className="px-[24px] pb-[24px] pt-[16px]">
                {/* Title / Description */}
                <h2 className="text-[22px] font-bold text-gray-900 leading-tight">Neuro Progress Overview</h2>
                <p className="text-[13px] text-gray-400 mt-[3px] mb-[16px]">Overall Platform Health</p>

                {/* 4 metric boxes — 2×2 grid */}
                <div className="grid grid-cols-2 gap-[12px]">
                  {[
                    { label: "Total Children Under Monitoring", value: "2,486" },
                    { label: "Average Development Progress",    value: "72.8%" },
                    { label: "Goals Achieved This Month",       value: "1,842" },
                    { label: "Active Therapy Plans",            value: "1,126" }
                  ].map((m) => (
                    <div
                      key={m.label}
                      className="border border-gray-200 rounded-xl bg-white"
                      style={{ padding: "12px 16px" }}
                    >
                      <p className="text-[11px] text-gray-400 font-medium leading-tight">{m.label}</p>
                      <p className="text-[22px] font-bold text-gray-800 mt-1 leading-none">{m.value}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* ══════════════════════════════════════════════════════════════════
            ROW 2 — Users By Role + MRR Chart
        ══════════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-12 gap-[24px] mb-[24px] items-stretch">

          {/* Left: Users By Role */}
          <div className="col-span-12 xl:col-span-4 min-w-0">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgba(15,23,42,0.08)] p-[24px] relative flex flex-col justify-between h-[340px]">
              <h3 className="text-[24px] font-semibold text-gray-800 mb-2">Users By Role</h3>
              <div className="flex justify-center" style={{ marginTop: "-8px" }}>
                <div style={{ width: "220px" }}>
                  <Chart options={roleOptions} series={roleSeries} type="donut" width="100%" height={180} />
                </div>
              </div>
              {/* Legend */}
              <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 mt-1">
                {[
                  { label: "Parents",       color: "#60a5fa" },
                  { label: "Therapists",    color: "#f59e0b" },
                  { label: "Admins",        color: "#10b981" },
                  { label: "School",        color: "#f87171" },
                  { label: "Psychologists", color: "#facc15" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-[11px] text-gray-500">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Monthly Recurring Revenue */}
          <div className="col-span-12 xl:col-span-8 min-w-0">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgba(15,23,42,0.08)] p-[24px] relative flex flex-col justify-between h-[340px]">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[24px] font-semibold text-gray-800">Monthly Recurring Revenue</h3>
                <span className="text-[14px] text-gray-400">Last 12 months</span>
              </div>
              <div style={{ height: "240px" }}>
                <Chart options={mrrOptions} series={mrrSeries} type="area" height="100%" />
              </div>
            </div>
          </div>

        </div>

        {/* ══════════════════════════════════════════════════════════════════
            ROW 3 — Ticket Volume + Complaints Section
        ══════════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-12 gap-[24px] mb-[24px] items-stretch">

          {/* Ticket Volume Monthly Trend */}
          <div className="col-span-12 xl:col-span-4 min-w-0">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgba(15,23,42,0.08)] p-[24px] relative flex flex-col justify-between h-[320px]">
              <div>
                <h3 className="text-[24px] font-semibold text-gray-800">Ticket Volume — Monthly Trend</h3>
                <p className="text-[14px] text-gray-400 mt-1 mb-2">Breakdown by status over last 6 months</p>
              </div>
              <div className="flex-1" style={{ height: "210px" }}>
                <Chart options={ticketOptions} series={ticketSeries} type="bar" height="100%" />
              </div>
            </div>
          </div>

          {/* Complaints by Status */}
          <div className="col-span-12 xl:col-span-4 min-w-0">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgba(15,23,42,0.08)] p-[24px] flex flex-col justify-between h-[320px]">
              <h3 className="text-[24px] font-semibold text-gray-800 mb-3">Complaints by Status</h3>
              <div className="flex items-center gap-[24px] flex-1">
                {/* Donut chart */}
                <div className="flex-shrink-0" style={{ width: "140px" }}>
                  <Chart options={complaintsDonutOptions} series={complaintsDonutSeries} type="donut" height={150} />
                </div>
                {/* Legend pills */}
                <div className="flex-1 flex flex-col gap-2">
                  {complaintsLegend.map((item) => (
                    <div key={item.label} className="flex items-center gap-2">
                      <span className="text-[12px] font-bold text-gray-400 w-4 text-right flex-shrink-0">{item.count}</span>
                      <span
                        className="flex-1 text-center text-[10px] font-bold py-1 rounded tracking-wide"
                        style={{
                          backgroundColor: item.bg,
                          color: item.text || "#fff",
                        }}
                      >
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Complaints — Raised vs Action Taken */}
          <div className="col-span-12 xl:col-span-4 min-w-0">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgba(15,23,42,0.08)] p-[24px] relative flex flex-col justify-between h-[320px]">
              <div>
                <h3 className="text-[24px] font-semibold text-gray-800 leading-tight">Complaints — Raised vs. Action Taken</h3>
                <p className="text-[14px] text-gray-400 mt-1 mb-1 leading-tight">Tracks how many complaints had concrete action taken against the reported party</p>
              </div>
              <div className="flex-1" style={{ height: "200px" }}>
                <Chart options={complaintsCatOptions} series={complaintsCatSeries} type="bar" height="100%" />
              </div>
            </div>
          </div>

        </div>

        {/* ══════════════════════════════════════════════════════════════════
            Recent Organizations Table Card (Spans full width at bottom)
        ══════════════════════════════════════════════════════════════════ */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgba(15,23,42,0.08)] overflow-hidden p-[24px]">
          <div className="mb-[16px]">
            <h3 className="text-[24px] font-semibold text-gray-800">Recent Organizations</h3>
          </div>
          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className="w-full border-collapse" style={{ minWidth: "640px" }}>
              <thead>
                <tr style={{ backgroundColor: "#d6efff" }}>
                  {["Organization", "Type", "Plan", "Users", "Status"].map((col, i) => (
                    <th
                      key={col}
                      className="py-4 px-6 text-[14px] font-medium text-gray-600 uppercase tracking-wide"
                      style={{ textAlign: i === 0 ? "left" : i === 3 ? "center" : i === 4 ? "right" : "left" }}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {[
                  { name: "Bright Minds Developmental Clinic", type: "Clinic", plan: "Premium",    users: 120,  status: "Active" },
                  { name: "Hopewell Therapy Center",           type: "Clinic", plan: "Standard",   users: 45,   status: "Active" },
                  { name: "Little Stars Assessment Center",    type: "Clinic", plan: "Basic",      users: 30,   status: "Active" },
                  { name: "Greenwoods International School",   type: "School", plan: "Enterprise", users: 350,  status: "Active" },
                  { name: "Sunbeam Academy",                   type: "School", plan: "Enterprise", users: 410,  status: "Active" },
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-6 py-4 text-[14px] font-normal text-gray-700">{row.name}</td>
                    <td className="px-6 py-4 text-[14px] text-gray-500">{row.type}</td>
                    <td className="px-6 py-4 text-[14px] text-gray-500">{row.plan}</td>
                    <td className="px-6 py-4 text-[14px] text-gray-600 text-center">{row.users}</td>
                    <td className="px-6 py-4 text-[14px] text-right">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-[12px] font-medium bg-emerald-100 text-emerald-700">
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </>
  );
}
