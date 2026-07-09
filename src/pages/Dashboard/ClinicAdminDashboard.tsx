import React from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import PageMeta from "../../components/common/PageMeta";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";

// ─── SVG Icons ─────────────────────────────────────────────────────────────

function AlertTriangleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function TargetIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

export default function ClinicAdminDashboard() {

  // ── Chart 1: Sessions This Week (Line) ────────────────────────────────────
  const sessionsWeekOptions: ApexOptions = {
    chart: {
      type: "line",
      toolbar: { show: false },
      fontFamily: "Outfit, sans-serif",
      sparkline: { enabled: false },
      parentHeightOffset: 0
    },
    colors: ["#3b82f6"],
    stroke: {
      curve: "smooth",
      width: 2.5,
    },
    markers: {
      size: 0,
      hover: { size: 5 }
    },
    dataLabels: { enabled: false },
    grid: {
      borderColor: "#f8fafc",
      strokeDashArray: 3,
      padding: { top: -15, bottom: -5, left: 10, right: 10 }
    },
    xaxis: {
      categories: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: { colors: "#94a3b8", fontSize: "10px" },
        offsetY: -3
      },
    },
    yaxis: {
      min: 0,
      max: 36,
      tickAmount: 4,
      labels: {
        style: { colors: "#94a3b8", fontSize: "10px" },
        offsetX: -5
      },
    },
    legend: { show: false },
    tooltip: {
      theme: "light",
      x: { show: false },
      y: {
        title: { formatter: () => "Sessions:" }
      },
      style: {
        fontSize: "11px",
        fontFamily: "Outfit"
      }
    }
  };

  const sessionsWeekSeries = [
    {
      name: "Sessions",
      data: [20, 32, 18, 22, 16, 30, 24],
    },
  ];

  // ── Chart 2: Diagnosis Distribution (Donut) ──────────────────────────────
  const diagnosisDonutOptions: ApexOptions = {
    chart: {
      type: "donut",
      fontFamily: "Outfit, sans-serif",
      sparkline: { enabled: true }
    },
    plotOptions: {
      pie: {
        donut: {
          size: "72%",
        }
      }
    },
    colors: ["#818cf8", "#e879f9", "#fb923c", "#4ade80", "#60a5fa"],
    labels: ["ASD", "ADHD", "SPD", "SPEECH", "OTHER"],
    dataLabels: { enabled: false },
    legend: { show: false },
    stroke: { width: 2, colors: ["#fff"] },
    tooltip: { theme: "light" }
  };

  const diagnosisDonutSeries = [4, 3, 2, 2, 1];

  const diagnosisLegend = [
    { count: 4, label: "ASD", bg: "#818cf8" },
    { count: 3, label: "ADHD", bg: "#e879f9" },
    { count: 2, label: "SPD", bg: "#fb923c" },
    { count: 2, label: "SPEECH", bg: "#4ade80" },
    { count: 1, label: "OTHER", bg: "#60a5fa" }
  ];

  // ── Chart 3: Goal Achievement (Area) ──────────────────────────────────────
  const goalAchievementOptions: ApexOptions = {
    chart: {
      type: "area",
      toolbar: { show: false },
      fontFamily: "Outfit, sans-serif",
      parentHeightOffset: 0
    },
    colors: ["#f472b6", "#818cf8"],
    stroke: {
      curve: "smooth",
      width: 2.5,
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.25,
        opacityTo: 0.01,
        stops: [0, 100]
      }
    },
    dataLabels: { enabled: false },
    grid: {
      borderColor: "#f1f5f9",
      strokeDashArray: 3,
      padding: { top: -15, bottom: -5, left: 10, right: 10 },
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } }
    },
    xaxis: {
      categories: ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: { colors: "#94a3b8", fontSize: "10px" }
      }
    },
    yaxis: {
      min: 0,
      max: 100,
      tickAmount: 4,
      labels: {
        style: { colors: "#94a3b8", fontSize: "10px" }
      }
    },
    legend: { show: false },
    tooltip: {
      theme: "light",
      style: { fontSize: "11px", fontFamily: "Outfit" }
    }
  };

  const goalAchievementSeries = [
    {
      name: "Achieved",
      data: [35, 25, 45, 38, 32, 71, 55, 45, 48, 55, 62, 90],
    },
    {
      name: "Active",
      data: [45, 55, 48, 58, 62, 54, 48, 52, 58, 64, 70, 55],
    }
  ];

  // ── Chart 4: Session By Therapy (Grouped Bar) ─────────────────────────────
  const therapyBarOptions: ApexOptions = {
    chart: {
      type: "bar",
      toolbar: { show: false },
      fontFamily: "Outfit, sans-serif",
      parentHeightOffset: 0
    },
    colors: ["#22d3ee", "#3b82f6", "#6366f1", "#ec4899"],
    plotOptions: {
      bar: {
        columnWidth: "55%",
        borderRadius: 2,
        grouped: true
      }
    },
    dataLabels: { enabled: false },
    grid: {
      borderColor: "#f1f5f9",
      strokeDashArray: 3,
      padding: { top: -15, bottom: -5, left: 10, right: 10 },
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } }
    },
    xaxis: {
      categories: ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan"],
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: { colors: "#94a3b8", fontSize: "10px" }
      }
    },
    yaxis: {
      min: 0,
      max: 1000,
      tickAmount: 4,
      labels: {
        style: { colors: "#94a3b8", fontSize: "10px" }
      }
    },
    legend: { show: false },
    tooltip: {
      theme: "light",
      style: { fontSize: "11px", fontFamily: "Outfit" }
    }
  };

  const therapyBarSeries = [
    { name: "OT", data: [350, 420, 230, 310, 280, 400] },
    { name: "Speech", data: [220, 310, 240, 290, 260, 320] },
    { name: "ABA", data: [450, 510, 330, 480, 430, 520] },
    { name: "Psych", data: [110, 150, 110, 180, 140, 190] }
  ];

  // ── Chart 5: Goal Progress By Child (Horizontal Bar) ─────────────────────
  const progressChildOptions: ApexOptions = {
    chart: {
      type: "bar",
      toolbar: { show: false },
      fontFamily: "Outfit, sans-serif",
      parentHeightOffset: 0
    },
    colors: ["#6366f1", "#22d3ee"],
    plotOptions: {
      bar: {
        horizontal: true,
        barHeight: "50%",
        borderRadius: 2,
        grouped: true
      }
    },
    dataLabels: { enabled: false },
    grid: {
      borderColor: "#f1f5f9",
      strokeDashArray: 3,
      padding: { top: -15, bottom: -5, left: 5, right: 10 },
      xaxis: { lines: { show: true } },
      yaxis: { lines: { show: false } }
    },
    xaxis: {
      categories: [0, 3, 5, 7, 9, 11, 13],
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: { colors: "#94a3b8", fontSize: "10px" }
      }
    },
    yaxis: {
      categories: ["Priya Sharma", "Amit Kumar", "Kavita Reddy", "Rajan Pillai", "Aashriya"],
      labels: {
        style: { colors: "#64748b", fontSize: "10px", fontWeight: 500 }
      }
    },
    legend: { show: false },
    tooltip: {
      theme: "light",
      style: { fontSize: "11px", fontFamily: "Outfit" }
    }
  };

  const progressChildSeries = [
    { name: "Achieved", data: [11, 9, 7, 11, 10] },
    { name: "Active", data: [5, 4, 3, 4, 3] }
  ];

  // ── Chart 6: Outcomes Trend (Line) ────────────────────────────────────────
  const outcomesTrendOptions: ApexOptions = {
    chart: {
      type: "line",
      toolbar: { show: false },
      fontFamily: "Outfit, sans-serif",
      sparkline: { enabled: false },
      parentHeightOffset: 0
    },
    colors: ["#eab308", "#3b82f6", "#ef4444"],
    stroke: {
      curve: "smooth",
      width: 2,
    },
    dataLabels: { enabled: false },
    grid: {
      borderColor: "#f8fafc",
      strokeDashArray: 3,
      padding: { top: -15, bottom: -5, left: 10, right: 10 }
    },
    xaxis: {
      categories: ["Aug", "Sep", "Oct", "Nov"],
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: { colors: "#94a3b8", fontSize: "10px" },
        offsetY: -3
      }
    },
    yaxis: {
      min: 0,
      max: 36,
      tickAmount: 4,
      labels: {
        style: { colors: "#94a3b8", fontSize: "10px" },
        offsetX: -5
      }
    },
    legend: { show: false },
    tooltip: {
      theme: "light",
      x: { show: false },
      style: {
        fontSize: "11px",
        fontFamily: "Outfit"
      }
    }
  };

  const outcomesTrendSeries = [
    { name: "Goal Rate", data: [15, 20, 18, 25] },
    { name: "Session Rate", data: [25, 22, 28, 20] },
    { name: "Parent Satisfaction", data: [18, 24, 22, 28] }
  ];

  // ── Stat cards data ────────────────────────────────────────────────────────
  const statCards = [
    { label: "Active Staff", value: "12", sub: "3 therapists, 2 psychologists", icon: <UsersIcon className="w-[18px] h-[18px]" /> },
    { label: "Children Enrolled", value: "89", sub: "+4 this week", icon: <UsersIcon className="w-[18px] h-[18px]" /> },
    { label: "Sessions Today", value: "24", sub: "6 pending start", icon: <TargetIcon className="w-[18px] h-[18px]" /> },
    { label: "Consent Compliance", value: "94%", sub: "5 renewals due", icon: <TargetIcon className="w-[18px] h-[18px]" /> },
  ];

  // ── Alerts data ────────────────────────────────────────────────────────────
  const alerts = [
    { id: 1, title: "Dhruv Kapoor", desc: "Consent expired", time: "2h ago" },
    { id: 2, title: "Kabir Bose", desc: "Awaiting consent approval", time: "1d ago" },
    { id: 3, title: "Low IOA Flag", desc: "On Arjun's last session", time: "2h ago" }
  ];

  // ── Staff Caseload data ────────────────────────────────────────────────────
  const staffCaseload = [
    { staff: "Priya Sharma", spec: "BCBA, ABA", children: 8, sessions: 8, load: "40%" },
    { staff: "Amit Kumar", spec: "BCBA, ABA", children: 9, sessions: 9, load: "60%" },
    { staff: "Kavita Reddy", spec: "BCBA, ABA", children: 10, sessions: 10, load: "70%" },
    { staff: "Dr. Rajan Pillai", spec: "BCBA, ABA", children: 4, sessions: 4, load: "33%" }
  ];

  // ── Child Progress data ────────────────────────────────────────────────────
  const childProgress = [
    { name: "Priya Sharma", achieved: 5, active: 2 },
    { name: "Amit Kumar", achieved: 9, active: 6 },
    { name: "Kavita Reddy", achieved: 10, active: 10 },
    { name: "Rajan Pillai", achieved: 4, active: 1 },
    { name: "Aashriya", achieved: 5, active: 3 }
  ];

  return (
    <>
      <PageMeta title="Clinic Dashboard | NeuroDiverse" description="Clinic administrator analytics dashboard for NeuroDiverse" />

      <div className="min-h-screen bg-[#f8fafc] -mx-4 md:-mx-6 -my-4 md:-my-6 p-[20px]" style={{ fontFamily: "Outfit, sans-serif" }}>

        {/* ── Page Header ───────────────────────────────────────────────── */}
        <div className="mb-4">
          <h1 className="text-[18px] font-bold text-gray-900 leading-tight">Clinic Dashboard</h1>
          <p className="text-[11px] text-gray-500 mt-0.5">Bright Minds Developmental Clinic</p>
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            MAIN RESPONSIVE GRID (Page Shell with Left/Right columns + full-width bottom table)
        ══════════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-12 gap-4 items-start">

          {/* ────────────────────────────────────────────────────────────────
              LEFT COLUMN (4 columns wide on desktop / lg screens)
          ──────────────────────────────────────────────────────────────── */}
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">

            {/* 1. Clinic Summary — parent white card wrapping 2×2 compact metrics */}
            <div className="bg-white border border-slate-100 rounded-xl shadow-[0_2px_12px_rgba(15,23,42,0.015)] p-4 h-[155px]">
              <div className="grid grid-cols-2 gap-2 h-full">
                {statCards.map((card) => (
                  <div
                    key={card.label}
                    className="bg-slate-50/60 border border-slate-100 rounded-lg p-2.5 flex flex-col justify-between"
                  >
                    <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider leading-none">{card.label}</span>
                    <div>
                      <p className="text-[26px] font-bold text-gray-800 leading-none tracking-tight">{card.value}</p>
                      <p className="text-[9px] text-gray-400 mt-1 font-medium leading-none">{card.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Sessions This Week — height calibrated so Summary(155) + gap(16) + Sessions(204) = 375px = Neuro Progress */}
            <div className="bg-white border border-slate-100 rounded-xl shadow-[0_2px_12px_rgba(15,23,42,0.015)] p-3 h-[204px] flex flex-col">
              <div className="mb-1">
                <h3 className="text-[13px] font-bold text-gray-800 leading-tight">Sessions This Week</h3>
                <span className="text-[10px] text-gray-400">Weekly breakdown</span>
              </div>
              <div className="flex-1 w-full min-h-0">
                <Chart options={sessionsWeekOptions} series={sessionsWeekSeries} type="line" height="100%" />
              </div>
            </div>

            {/* 3. Diagnosis Distribution — h-[230px] matches Goal Achievement */}
            <div className="bg-white border border-slate-100 rounded-xl shadow-[0_2px_12px_rgba(15,23,42,0.015)] p-3.5 h-[230px] flex flex-col">
              <div className="mb-1">
                <h3 className="text-[13px] font-bold text-gray-800 leading-tight">Diagnosis Distribution</h3>
                <p className="text-[10px] text-gray-400">Across all children</p>
              </div>
              <div className="flex items-center justify-between gap-4 flex-1">
                {/* Donut chart on left */}
                <div className="w-[120px] h-[120px] flex-shrink-0 flex items-center justify-center">
                  <Chart options={diagnosisDonutOptions} series={diagnosisDonutSeries} type="donut" width="100%" height="100%" />
                </div>
                {/* Legend list on right */}
                <div className="flex-1 flex flex-col justify-center gap-2">
                  {diagnosisLegend.map((item) => (
                    <div key={item.label} className="flex items-center justify-between text-[10px] font-medium text-gray-500">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-sm flex-shrink-0" style={{ backgroundColor: item.bg }} />
                        <span>{item.label}</span>
                      </div>
                      <span className="text-gray-700 font-bold">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 4. Alerts & Flags — h-[230px] matches Session By Therapy */}
            <div className="bg-white border border-slate-100 rounded-xl shadow-[0_2px_12px_rgba(15,23,42,0.015)] p-3.5 h-[230px] flex flex-col">
              <div className="mb-2">
                <h3 className="text-[13px] font-bold text-gray-800 leading-tight">Alerts & Flags</h3>
              </div>
              <div className="flex flex-col flex-1 gap-2">
                {alerts.map((item) => (
                  <div key={item.id} className="flex-1 bg-white rounded-lg border border-slate-100 px-2.5 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-6 h-6 rounded bg-amber-50 flex items-center justify-center flex-shrink-0 text-amber-500 border border-amber-100/30">
                        <AlertTriangleIcon className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold text-gray-800 leading-none">{item.title}</p>
                        <p className="text-[9px] text-gray-400 mt-1 leading-none truncate">{item.desc}</p>
                      </div>
                    </div>
                    <span className="text-[9px] text-gray-400 flex-shrink-0 ml-2 font-medium">{item.time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 5. Outcomes Trend — h-[220px] matches Goal Progress By Child */}
            <div className="bg-white border border-slate-100 rounded-xl shadow-[0_2px_12px_rgba(15,23,42,0.015)] p-3.5 h-[220px] flex flex-col">
              <div className="flex items-center justify-between mb-1">
                <div>
                  <h3 className="text-[13px] font-bold text-gray-800 leading-tight">Outcomes Trend</h3>
                  <span className="text-[10px] text-gray-400">Satisfaction metrics</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-[9px] font-semibold text-gray-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#eab308]" />
                    <span>Goal</span>
                  </div>
                  <div className="flex items-center gap-1 text-[9px] font-semibold text-gray-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#3b82f6]" />
                    <span>Session</span>
                  </div>
                  <div className="flex items-center gap-1 text-[9px] font-semibold text-gray-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444]" />
                    <span>Parent</span>
                  </div>
                </div>
              </div>
              <div className="flex-1 w-full min-h-0">
                <Chart options={outcomesTrendOptions} series={outcomesTrendSeries} type="line" height="100%" />
              </div>
            </div>

          </div>

          {/* ────────────────────────────────────────────────────────────────
              RIGHT COLUMN (8 columns wide on desktop / lg screens)
          ──────────────────────────────────────────────────────────────── */}
          <div className="col-span-12 lg:col-span-8 flex flex-col gap-4">

            {/* 1. Large Neuro Progress Overview Card */}
            <div className="bg-white border border-slate-100 rounded-xl shadow-[0_2px_12px_rgba(15,23,42,0.015)] flex flex-col justify-between h-[375px] overflow-hidden">
              {/* Top Section: Images */}
              <div className="flex justify-between items-stretch gap-3 p-3 pb-0 h-[180px]">
                {/* Large Brain Image centered (68% width) */}
                <div className="w-[68%] flex items-center justify-center">
                  <img
                    src="/images/brain_main.png"
                    alt="Brain Anatomy"
                    className="max-h-[160px] object-contain"
                  />
                </div>

                {/* Staked Anatomical Cross-sections (32% width, max-w 70px) */}
                <div className="w-[32%] flex flex-col gap-1.5 justify-center max-w-[70px] flex-shrink-0">
                  {["/images/brain_cross3.png", "/images/brain_cross1.png", "/images/brain_cross2.png"].map((src, idx) => (
                    <div key={idx} className="rounded-lg overflow-hidden border border-slate-100 bg-gray-50 h-[46px] shadow-sm flex items-center justify-center">
                      <img src={src} alt={`Anatomical cross section ${idx + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Section: Info and metric cards */}
              <div className="p-3 pt-2 border-t border-slate-50 flex flex-col justify-end flex-1">
                <div className="mb-2">
                  <h2 className="text-[14px] font-bold text-gray-900 leading-tight">Neuro Progress Overview</h2>
                  <p className="text-[10px] text-gray-400 mt-0.5">Overall Platform Health</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "Total Children Under Monitoring", value: "2,486" },
                    { label: "Average Development Progress", value: "72.8%" },
                    { label: "Goals Achieved This Month", value: "1,842" },
                    { label: "Active Therapy Plans", value: "1,126" }
                  ].map((item) => (
                    <div key={item.label} className="border border-slate-100 rounded-lg p-2 bg-white flex flex-col justify-between shadow-sm">
                      <p className="text-[9px] text-gray-400 font-semibold uppercase tracking-wider leading-tight">{item.label}</p>
                      <p className="text-[18px] font-bold text-gray-800 mt-1 leading-none">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 2. Goal Achievement (approx. 230px height, Area Chart) */}
            <div className="bg-white border border-slate-100 rounded-xl shadow-[0_2px_12px_rgba(15,23,42,0.015)] p-3.5 h-[230px] flex flex-col justify-between">
              <div className="flex items-center justify-between mb-1">
                <div>
                  <h3 className="text-[13px] font-bold text-gray-800 leading-tight">Goal Achievement</h3>
                  <span className="text-[10px] text-gray-400 font-medium">Achieved vs active</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-[9px] font-semibold text-gray-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#f472b6]" />
                    <span>Achieved</span>
                  </div>
                  <div className="flex items-center gap-1 text-[9px] font-semibold text-gray-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#818cf8]" />
                    <span>Active</span>
                  </div>
                </div>
              </div>
              <div className="h-[160px] w-full">
                <Chart options={goalAchievementOptions} series={goalAchievementSeries} type="area" height="100%" />
              </div>
            </div>

            {/* 3. Session By Therapy (approx. 230px height, Grouped Bar Chart) */}
            <div className="bg-white border border-slate-100 rounded-xl shadow-[0_2px_12px_rgba(15,23,42,0.015)] p-3.5 h-[230px] flex flex-col justify-between">
              <div className="flex items-center justify-between mb-1">
                <div>
                  <h3 className="text-[13px] font-bold text-gray-800 leading-tight">Session By Therapy</h3>
                  <p className="text-[10px] text-gray-400">Monthly breakdown</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-[9px] font-semibold text-gray-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#22d3ee]" />
                    <span>OT</span>
                  </div>
                  <div className="flex items-center gap-1 text-[9px] font-semibold text-gray-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#3b82f6]" />
                    <span>Speech</span>
                  </div>
                  <div className="flex items-center gap-1 text-[9px] font-semibold text-gray-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#6366f1]" />
                    <span>ABA</span>
                  </div>
                  <div className="flex items-center gap-1 text-[9px] font-semibold text-gray-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ec4899]" />
                    <span>Psych</span>
                  </div>
                </div>
              </div>
              <div className="h-[160px] w-full">
                <Chart options={therapyBarOptions} series={therapyBarSeries} type="bar" height="100%" />
              </div>
            </div>

            {/* 4. Goal Progress By Child (approx. 220px height, Horizontal progress bars) */}
            <div className="bg-white border border-slate-100 rounded-xl shadow-[0_2px_12px_rgba(15,23,42,0.015)] p-3.5 h-[220px] flex flex-col justify-between">
              <div className="flex items-center justify-between mb-1">
                <div>
                  <h3 className="text-[13px] font-bold text-gray-800 leading-tight">Goal Progress By Child</h3>
                  <p className="text-[10px] text-gray-400">Achieved vs active goals</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-[9px] font-semibold text-gray-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#6366f1]" />
                    <span>Achieved</span>
                  </div>
                  <div className="flex items-center gap-1 text-[9px] font-semibold text-gray-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#22d3ee]" />
                    <span>Active</span>
                  </div>
                </div>
              </div>
              <div className="flex-1 flex flex-col justify-between py-2">
                {childProgress.map((row) => {
                  const total = row.achieved + row.active;
                  const pct = total > 0 ? (row.achieved / total) * 100 : 0;
                  return (
                    <div key={row.name} className="flex items-center gap-3 text-[10px] leading-none">
                      <span className="w-[84px] font-semibold text-gray-600 truncate">{row.name}</span>
                      <div className="flex-1 h-[6px] bg-slate-50 border border-slate-100 rounded-full overflow-hidden flex items-center">
                        <div className="bg-[#6366f1] h-full" style={{ width: `${pct}%` }} />
                        <div className="bg-[#22d3ee] h-full" style={{ width: `${100 - pct}%` }} />
                      </div>
                      <span className="w-[30px] text-right font-bold text-gray-700">{row.achieved}</span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* ────────────────────────────────────────────────────────────────
              STAFF CASELOAD TABLE (Full Width, spanning the bottom under both columns)
          ──────────────────────────────────────────────────────────────── */}
          <div className="col-span-12">
            <div className="bg-white border border-slate-100 rounded-xl shadow-[0_2px_12px_rgba(15,23,42,0.015)] p-3.5 overflow-hidden">
              <div className="mb-3">
                <h3 className="text-[13px] font-bold text-gray-800 leading-tight">Staff Caseload</h3>
              </div>
              <div className="overflow-x-auto rounded-lg border border-slate-100">
                <Table className="w-full border-collapse" style={{ minWidth: "500px" }}>
                  <TableHeader>
                    <TableRow className="bg-[#e0f2fe]/40 border-b border-slate-105">
                      {["Staff", "Specialization", "Children", "Sessions/Wk", "Load"].map((col, i) => (
                        <TableCell
                          key={col}
                          isHeader
                          className="py-2.5 px-3.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider"
                          style={{ textAlign: i === 0 ? "left" : i === 4 ? "right" : "left" }}
                        >
                          {col}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {staffCaseload.map((row, idx) => (
                      <TableRow key={idx} className="hover:bg-slate-50/55 border-b border-slate-50 last:border-b-0 transition-colors">
                        <TableCell className="px-3.5 py-2.5 text-[11px] font-semibold text-slate-700">{row.staff}</TableCell>
                        <TableCell className="px-3.5 py-2.5 text-[11px] text-slate-500">{row.spec}</TableCell>
                        <TableCell className="px-3.5 py-2.5 text-[11px] text-slate-500">{row.children}</TableCell>
                        <TableCell className="px-3.5 py-2.5 text-[11px] text-slate-500">{row.sessions}</TableCell>
                        <TableCell className="px-3.5 py-2.5 text-[11px] text-right font-bold text-slate-700">{row.load}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>

        </div>

      </div>
    </>
  );
}
