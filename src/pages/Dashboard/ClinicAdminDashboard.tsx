import React from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import axiosClient from "../../api/axiosClient";
import { useAuth } from "../../context/AuthContext";
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
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: invitations } = useQuery({
    queryKey: ['invitations', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      const res = await axiosClient.get("/invitation", {
        params: { email: user.email, status: 'PENDING' }
      });
      return res.data;
    },
    enabled: !!user?.email
  });

  const acceptInviteMutation = useMutation({
    mutationFn: async (token: string) => {
      const response = await axiosClient.post("/invitation/accept", { token });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Invitation accepted successfully!");
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to process invitation.");
    }
  });

  // ── Chart 1: Sessions This Week (Area) ────────────────────────────────────
  const sessionsWeekOptions: ApexOptions = {
    chart: {
      type: "area",
      toolbar: { show: false },
      fontFamily: "Outfit, sans-serif",
      sparkline: { enabled: false },
      parentHeightOffset: 0
    },
    colors: ["#2DA0FF"],
    stroke: {
      curve: "smooth",
      width: 2.5,
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.35,
        opacityTo: 0.05,
        stops: [0, 100]
      }
    },
    markers: {
      size: 0,
      hover: { size: 5 }
    },
    dataLabels: { enabled: false },
    grid: {
      show: true,
      borderColor: "#f1f5f9",
      strokeDashArray: 3,
      xaxis: { lines: { show: true } },
      yaxis: { lines: { show: false } },
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
    colors: ["#818cf8", "#e879f9", "#fb923c", "#4ade80", "#2DA0FF"],
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
    { count: 1, label: "OTHER", bg: "#2DA0FF" }
  ];

  // ── Chart 3: Goal Achievement (Area) ──────────────────────────────────────
  const goalAchievementOptions: ApexOptions = {
    chart: {
      type: "area",
      toolbar: { show: false },
      fontFamily: "Outfit, sans-serif",
      parentHeightOffset: 0
    },
    colors: ["#f472b6", "#a78bfa"],
    stroke: {
      curve: "smooth",
      width: 0,
    },
    fill: {
      type: "solid",
      opacity: 0.6
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

      <div className="min-h-screen  -mx-4 md:-mx-6 -my-4 md:-my-6 p-[32px]" style={{ fontFamily: "Outfit, sans-serif" }}>

        {/* ── Page Header ───────────────────────────────────────────────── */}
        <div className="mb-6">
          <h1 className="text-[20px] font-bold text-gray-900 leading-tight">Therapist Dashboard</h1>
          <p className="text-[12px] text-gray-500 mt-1">Bright Minds Developmental Clinic</p>
        </div>

        {/* ── Pending Invitations ─────────────────────────────────────── */}
        {invitations && invitations.length > 0 && (
          <div className="mb-6 flex flex-col gap-4">
            <div className="bg-white border border-[#2DA0FF] rounded-[16px] p-5 flex items-center justify-between shadow-[0_2px_12px_rgba(45,160,255,0.1)] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-2 h-full bg-[#2DA0FF]"></div>
              <div className="pl-2">
                <h3 className="text-[16px] font-bold text-gray-900 mb-1 flex items-center gap-3">
                  You've been invited to collaborate 👥
                  {invitations.length > 1 && (
                    <a href="#pending-invitations-table" className="text-[12px] bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-medium hover:bg-slate-200 transition-colors">
                      View All ({invitations.length})
                    </a>
                  )}
                </h3>
                <p className="text-[14px] text-gray-600 mt-1">
                  <span className="font-semibold text-gray-800">{invitations[0].invitedBy?.name || "A Parent"}</span> has invited you to view and manage the progress of their child <span className="font-semibold text-[#2DA0FF]">{invitations[0].child?.full_name || "their child"}</span>.
                </p>
              </div>
              <div>
                <button 
                  onClick={() => acceptInviteMutation.mutate(invitations[0].token)}
                  disabled={acceptInviteMutation.isPending}
                  className="px-6 py-2.5 bg-[#2DA0FF] hover:bg-[#1a8ce8] text-white font-bold rounded-xl transition-colors text-[14px] shadow-sm disabled:opacity-70 whitespace-nowrap"
                >
                  {acceptInviteMutation.isPending && acceptInviteMutation.variables === invitations[0].token ? "Accepting..." : "Accept Invitation"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            MAIN RESPONSIVE GRID (Page Shell with Left/Right columns + full-width bottom table)
        ══════════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-12 gap-8 items-start">

          {/* ────────────────────────────────────────────────────────────────
              LEFT COLUMN (4 columns wide on desktop / lg screens)
          ──────────────────────────────────────────────────────────────── */}
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-8">

            {/* 1. Clinic Summary — Master white card wrapping 4 distinct inner cards */}
            <div className="bg-white border border-slate-100 rounded-[28px] shadow-[0_2px_12px_rgba(0,0,0,0.02)] p-4 h-auto lg:h-[300px]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-full">
                {statCards.map((card, idx) => (
                  <div
                    key={card.label}
                    className={`rounded-[20px] px-4 py-4 lg:py-3 flex flex-col justify-center ${
                      idx === 0 ? "bg-[#f3f9ff]" : "bg-[#f8f9fa]"
                    }`}
                  >
                    <span className="text-[13px] font-semibold text-slate-700 leading-tight pr-2">{card.label}</span>
                    <p className="text-[32px] font-extrabold text-slate-900 leading-none mt-2 tracking-tight">{card.value}</p>
                    <p className="text-[11px] text-slate-500 mt-1.5 font-medium leading-snug" dangerouslySetInnerHTML={{ __html: card.sub.replace(", ", ",<br/>") }}></p>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Sessions This Week */}
            <div className="bg-white border border-slate-100 rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.02)] p-6 h-auto lg:h-[298px] flex flex-col">
              <div className="mb-2">
                <h3 className="text-[15px] font-bold text-gray-800 leading-tight">Sessions This Week</h3>
              </div>
              <div className="flex-1 w-full min-h-[220px] lg:min-h-0 -ml-2 mt-2">
                <Chart options={sessionsWeekOptions} series={sessionsWeekSeries} type="area" height="100%" />
              </div>
            </div>

            {/* 3. Diagnosis Distribution */}
            <div className="bg-white border border-slate-100 rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.02)] p-6 min-h-[340px] flex flex-col">
              <div className="mb-2">
                <h3 className="text-[15px] font-bold text-gray-800 leading-tight">Diagnosis Distribution</h3>
                <p className="text-[12px] text-gray-400 mt-1">Across all children</p>
              </div>
              <div className="flex items-center justify-between gap-6 flex-1 mt-2">
                {/* Donut chart on left */}
                <div className="w-[150px] h-[150px] flex-shrink-0 flex items-center justify-center">
                  <Chart options={diagnosisDonutOptions} series={diagnosisDonutSeries} type="donut" width="100%" height="100%" />
                </div>
                {/* Legend list on right */}
                <div className="flex-1 flex flex-col justify-center gap-4">
                  {diagnosisLegend.map((item) => (
                    <div key={item.label} className="flex items-center justify-between text-[12px]">
                      <span className="text-gray-600 font-medium w-6 text-center">{item.count}</span>
                      <span 
                        className="px-3 py-1.5 font-bold text-white rounded w-[84px] text-center tracking-wide" 
                        style={{ backgroundColor: item.bg, fontSize: "11px" }}
                      >
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 4. Alerts & Flags */}
            <div className="bg-white border border-slate-100 rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.02)] p-6 min-h-[340px] flex flex-col">
              <div className="mb-3">
                <h3 className="text-[15px] font-bold text-gray-800 leading-tight">Alerts & Flags</h3>
              </div>
              <div className="flex flex-col flex-1 gap-3">
                {alerts.map((item) => (
                  <div key={item.id} className="flex-1 bg-white rounded-xl border border-slate-100 px-4 py-3 flex items-start gap-3 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                    <div className="mt-0.5 w-7 h-7 rounded flex items-center justify-center flex-shrink-0 text-orange-500">
                      <AlertTriangleIcon className="w-5 h-5 stroke-[2.5]" />
                    </div>
                    <div className="min-w-0 flex flex-col justify-center">
                      <p className="text-[13px] text-gray-600 leading-snug">
                        <span className="font-bold text-gray-800 text-[13px]">{item.title}</span> — {item.desc.toLowerCase()}
                      </p>
                      <p className="text-[11px] text-gray-400 mt-1 font-medium">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 5. Outcomes Trend */}
            <div className="bg-white border border-slate-100 rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.02)] p-6 min-h-[340px] flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-[15px] font-bold text-gray-800 leading-tight">Outcomes Trend</h3>
                  <span className="text-[11px] text-gray-400 mt-1 block">Satisfaction metrics</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-[12px] font-semibold text-gray-500">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#eab308]" />
                    <span>Goal</span>
                  </div>
                  <div className="flex items-center gap-2 text-[12px] font-semibold text-gray-500">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#3b82f6]" />
                    <span>Session</span>
                  </div>
                  <div className="flex items-center gap-2 text-[12px] font-semibold text-gray-500">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" />
                    <span>Parent</span>
                  </div>
                </div>
              </div>
              <div className="flex-1 w-full min-h-0 mt-3">
                <Chart options={outcomesTrendOptions} series={outcomesTrendSeries} type="line" height="100%" />
              </div>
            </div>

          </div>

          {/* ────────────────────────────────────────────────────────────────
              RIGHT COLUMN (8 columns wide on desktop / lg screens)
          ──────────────────────────────────────────────────────────────── */}
          <div className="col-span-12 lg:col-span-8 flex flex-col gap-8">

            {/* 1. Large Neuro Progress Overview Card */}
            <div className="bg-white border border-slate-100 rounded-[28px] shadow-[0_2px_12px_rgba(0,0,0,0.02)] h-auto lg:h-[630px] p-6 lg:p-8 flex flex-col lg:flex-row gap-8">
              
              {/* Left Side: Main Brain + Metrics */}
              <div className="flex-1 flex flex-col justify-between h-full min-w-0">
                
                {/* Big Brain Image */}
                <div className="flex-1 flex items-center justify-center min-h-[240px] lg:min-h-0 relative">
                  <img
                    src="/images/brain_main.png"
                    alt="Brain Anatomy"
                    className="max-h-[240px] lg:max-h-[320px] max-w-full object-contain drop-shadow-xl"
                  />
                </div>

                {/* Bottom Section: Info and metric cards */}
                <div className="mt-8 flex-shrink-0">
                  <div className="mb-5 text-center lg:text-left">
                    <h2 className="text-[20px] lg:text-[24px] font-bold text-slate-700 leading-tight">Neuro Progress Overview</h2>
                    <p className="text-[14px] text-slate-500 mt-1">Overall Platform Health</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { label: "Total Children Under Monitoring", value: "2,486" },
                      { label: "Average Development Progress", value: "72.8%" },
                      { label: "Goals Achieved This Month", value: "1,842" },
                      { label: "Active Therapy Plans", value: "1,126" }
                    ].map((item) => (
                      <div key={item.label} className="border border-slate-300 rounded-[16px] px-5 py-4 bg-white flex flex-col justify-center">
                        <p className="text-[12px] text-slate-500 font-medium leading-tight mb-2">{item.label}</p>
                        <p className="text-[22px] font-bold text-slate-700 leading-none">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Side: Staked Anatomical Cross-sections */}
              <div className="w-full lg:w-[150px] flex flex-row lg:flex-col justify-center lg:justify-between items-center lg:h-full flex-shrink-0 gap-4 lg:gap-0 py-2">
                {["/images/brain_cross3.png", "/images/brain_cross1.png", "/images/brain_cross2.png"].map((src, idx) => (
                  <img 
                    key={idx} 
                    src={src} 
                    alt={`Anatomical cross section ${idx + 1}`} 
                    className="w-[80px] lg:w-[140px] max-h-[80px] lg:max-h-[160px] object-contain drop-shadow-md" 
                  />
                ))}
              </div>

            </div>

            {/* 2. Goal Achievement */}
            <div className="bg-white border border-slate-100 rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.02)] p-6 min-h-[340px] flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-[15px] font-bold text-gray-800 leading-tight">Goal Achievement</h3>
                  <span className="text-[11px] text-gray-400 font-medium mt-1 block">Achieved vs active</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-500">
                    <span className="w-2 h-2 rounded-full bg-[#f472b6]" />
                    <span>Achieved</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-500">
                    <span className="w-2 h-2 rounded-full bg-[#818cf8]" />
                    <span>Active</span>
                  </div>
                </div>
              </div>
              <div className="flex-1 w-full min-h-0 mt-2">
                <Chart options={goalAchievementOptions} series={goalAchievementSeries} type="area" height="100%" />
              </div>
            </div>

            {/* 3. Session By Therapy */}
            <div className="bg-white border border-slate-100 rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.02)] p-6 min-h-[340px] flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-[15px] font-bold text-gray-800 leading-tight">Session By Therapy</h3>
                  <p className="text-[11px] text-gray-400 mt-1">Monthly breakdown</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-500">
                    <span className="w-2 h-2 rounded-full bg-[#22d3ee]" />
                    <span>OT</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-500">
                    <span className="w-2 h-2 rounded-full bg-[#3b82f6]" />
                    <span>Speech</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-500">
                    <span className="w-2 h-2 rounded-full bg-[#6366f1]" />
                    <span>ABA</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-500">
                    <span className="w-2 h-2 rounded-full bg-[#ec4899]" />
                    <span>Psych</span>
                  </div>
                </div>
              </div>
              <div className="flex-1 w-full min-h-0 mt-2">
                <Chart options={therapyBarOptions} series={therapyBarSeries} type="bar" height="100%" />
              </div>
            </div>

            {/* 4. Goal Progress By Child */}
            <div className="bg-white border border-slate-100 rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.02)] p-6 min-h-[340px] flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-[15px] font-bold text-gray-800 leading-tight">Goal Progress By Child</h3>
                  <p className="text-[11px] text-gray-400 mt-1">Achieved vs active goals</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-500">
                    <span className="w-2 h-2 rounded-full bg-[#6366f1]" />
                    <span>Achieved</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-500">
                    <span className="w-2 h-2 rounded-full bg-[#22d3ee]" />
                    <span>Active</span>
                  </div>
                </div>
              </div>
              <div className="flex-1 flex flex-col justify-between py-2">
                {childProgress.map((row) => {
                  const total = row.achieved + row.active;
                  const pct = total > 0 ? (row.achieved / total) * 100 : 0;
                  return (
                    <div 
                      key={row.name} 
                      className="relative flex items-center gap-4 text-[12px] leading-none py-1.5 px-2 -mx-2 rounded-lg hover:bg-slate-50/80 group cursor-pointer transition-colors"
                    >
                      <span className="w-[100px] font-bold text-gray-600 truncate group-hover:text-gray-900 transition-colors">{row.name}</span>
                      <div className="flex-1 h-[8px] bg-slate-100 rounded-full overflow-hidden flex items-center shadow-inner group-hover:h-[10px] transition-all duration-300">
                        <div className="bg-[#6366f1] h-full transition-all duration-500 group-hover:brightness-110" style={{ width: `${pct}%` }} />
                        <div className="bg-[#22d3ee] h-full transition-all duration-500 group-hover:brightness-110" style={{ width: `${100 - pct}%` }} />
                      </div>
                      <span className="w-[30px] text-right font-bold text-gray-700 group-hover:text-gray-900 transition-colors">{row.achieved}</span>
                      
                      {/* Custom Tooltip */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 bg-white border border-slate-100 text-slate-700 text-[11px] font-medium py-1.5 px-3 rounded shadow-[0_2px_8px_rgba(0,0,0,0.08)] whitespace-nowrap">
                        <span className="font-bold text-[#6366f1]">{row.achieved}</span> Achieved <span className="mx-1 text-slate-300">|</span> <span className="font-bold text-[#22d3ee]">{row.active}</span> Active
                      </div>
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
            <div className="bg-white border border-slate-100 rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.02)] p-8 overflow-hidden">
              <div className="mb-4">
                <h3 className="text-[18px] font-bold text-gray-800 leading-tight">Staff Caseload</h3>
              </div>
              <div className="overflow-x-auto rounded-xl border border-slate-100 shadow-sm">
                <Table className="w-full border-collapse" style={{ minWidth: "500px" }}>
                  <TableHeader>
                    <TableRow className="bg-[#e0f2fe] border-b border-slate-200">
                      {["Staff", "Specialization", "Children", "Sessions/Wk", "Load"].map((col, i) => (
                        <TableCell
                          key={col}
                          isHeader
                          className="py-4 px-6 text-[14px] font-bold text-gray-800"
                          style={{ textAlign: i === 0 ? "left" : "center" }}
                        >
                          {col}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {staffCaseload.map((row, idx) => (
                      <TableRow key={idx} className="hover:bg-slate-50/70 border-b border-slate-100 last:border-b-0 transition-colors">
                        <TableCell className="px-6 py-4 text-[14px] font-semibold text-slate-700 text-center">{row.staff}</TableCell>
                        <TableCell className="px-6 py-4 text-[14px] text-slate-500 text-center">{row.spec}</TableCell>
                        <TableCell className="px-6 py-4 text-[14px] text-slate-500 text-center font-medium">{row.children}</TableCell>
                        <TableCell className="px-6 py-4 text-[14px] text-slate-500 text-center font-medium">{row.sessions}</TableCell>
                        <TableCell className="px-6 py-4 text-[14px] text-slate-600 text-center font-bold">{row.load}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>

          {/* ────────────────────────────────────────────────────────────────
              PENDING INVITATIONS TABLE 
          ──────────────────────────────────────────────────────────────── */}
          {invitations && invitations.length > 1 && (
            <div id="pending-invitations-table" className="col-span-12 scroll-mt-6">
              <div className="bg-white border border-slate-100 rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.02)] p-8 overflow-hidden">
                <div className="mb-4">
                  <h3 className="text-[18px] font-bold text-gray-800 leading-tight">All Pending Invitations</h3>
                </div>
                <div className="overflow-x-auto rounded-xl border border-slate-100 shadow-sm">
                  <Table className="w-full border-collapse" style={{ minWidth: "500px" }}>
                    <TableHeader>
                      <TableRow className="bg-[#e0f2fe] border-b border-slate-200">
                        <TableCell isHeader className="py-4 px-6 text-[14px] font-bold text-gray-800 text-left">Invited By</TableCell>
                        <TableCell isHeader className="py-4 px-6 text-[14px] font-bold text-gray-800 text-center">Child</TableCell>
                        <TableCell isHeader className="py-4 px-6 text-[14px] font-bold text-gray-800 text-center">Date</TableCell>
                        <TableCell isHeader className="py-4 px-6 text-[14px] font-bold text-gray-800 text-right">Action</TableCell>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invitations.map((inv: any, idx: number) => (
                        <TableRow key={inv.id} className="hover:bg-slate-50/70 border-b border-slate-100 last:border-b-0 transition-colors">
                          <TableCell className="px-6 py-4 text-[14px] font-semibold text-slate-700 text-left">{inv.invitedBy?.name || "A Parent"}</TableCell>
                          <TableCell className="px-6 py-4 text-[14px] text-slate-500 text-center font-medium">{inv.child?.full_name || "N/A"}</TableCell>
                          <TableCell className="px-6 py-4 text-[14px] text-slate-500 text-center font-medium">
                            {new Date(inv.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="px-6 py-4 text-right">
                            <button 
                              onClick={() => acceptInviteMutation.mutate(inv.token)}
                              disabled={acceptInviteMutation.isPending}
                              className="px-4 py-1.5 bg-[#2DA0FF] hover:bg-[#1a8ce8] text-white font-bold rounded-lg transition-colors text-[13px] shadow-sm disabled:opacity-70"
                            >
                              {acceptInviteMutation.isPending && acceptInviteMutation.variables === inv.token ? "Accepting..." : "Accept"}
                            </button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </>
  );
}
