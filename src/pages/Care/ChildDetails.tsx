import { useState } from "react";
import { useParams, Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import axiosClient from "../../api/axiosClient";
import PageMeta from "../../components/common/PageMeta";
import { PencilIcon, UserIcon, ArrowUpIcon } from "../../icons";
import LineChartOne from "../../components/charts/line/LineChartOne";
import BarChartOne from "../../components/charts/bar/BarChartOne";
import DiagnosesTab from "../../components/Care/DiagnosesTab";
import MedicationsTab from "../../components/Care/MedicationsTab";
import GeneticTestingTab from "../../components/Care/GeneticTestingTab";

export default function ChildDetails() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("Overview");

  const { data: child, isLoading } = useQuery({
    queryKey: ["child", id],
    queryFn: async () => {
      const res = await axiosClient.get(`/child/${id}`);
      return res.data;
    },
    enabled: !!id,
  });

  const documents = [
    { name: "Prescription J", date: "18:2023", size: "p120 0" },
    { name: "Side Effects Info Sheet", date: "Jun 15 2027", size: "DM-310KB" },
    { name: "Ah 15:2003 Parent Information Sheet", date: "pdf-180 KB", size: "" },
    { name: "Medication Guide", date: "Jun 15.2073", size: "pat-450 Kn" },
  ];

  const historyItems = [
    {
      dot: "bg-emerald-500",
      date: "Sep 15, 2022",
      event: "Diagnosis confirmed",
      detail: "By Dr. Reena Kapoor",
    },
    {
      dot: "bg-red-500",
      date: "Aug 28, 2022",
      event: "Reports added",
      detail: "MRI Brain Scan, EEG Report",
    },
    {
      dot: "bg-blue-700",
      date: "Jul 10, 2022",
      event: "Initial assessment completed",
      detail: "Developmental Assessment uploaded",
    },
  ];

  const tabs = [
    "Overview",
    "Diagnoses",
    "Medications",
    "Genetic Testing",
    "Assessments",
    "IEP Goals",
    "Session Notes",
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title="Child Details | Care"
        description="Detailed view of a child's profile and progress"
      />

      {/* Header Section */}
      <div className="mb-4">
        {/* Breadcrumb */}
        <div className="text-sm mb-3">
          <span className="text-gray-400">NeuroDiverse</span>
          <span className="text-gray-400 mx-2">&lt;</span>
          <span className="text-gray-500 font-medium">Administration</span>
        </div>

        {/* Title Area */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 leading-tight">
              Children
            </h1>
            {/* <p className="text-sm text-gray-500 mt-1">
              6 children 3 need attention
            </p> */}
          </div>
          <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#60a5fa] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-colors">
            + Add Child
          </button>
        </div>
      </div>

      {/* Main Profile Section */}
      <div className="flex flex-col md:flex-row gap-8 mb-8 items-start">
        {/* Avatar (Left) */}
        <div className="w-52 h-52 rounded-[28px] bg-[#fdf3e7] overflow-hidden shrink-0 flex items-center justify-center shadow-sm border border-[#ffedd5]">
          {/* Photo */}
          {child?.profile_picture?.[0]?.file_url ? (
            <img src={child.profile_picture[0].file_url} alt={child.full_name} className="w-full h-full object-cover" />
          ) : (
            <UserIcon className="w-24 h-24 text-[#fed7aa]" />
          )}
        </div>

        {/* Right Side (Details + Actions + Note) */}
        <div className="flex-1 flex flex-col justify-between py-1">
          
          {/* Top: Details & Actions */}
          <div className="flex flex-col xl:flex-row gap-6 items-start">
            
            {/* Details */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-2xl font-bold text-gray-800">{child?.full_name || "Loading..."}</h2>
                <span className="bg-[#e5f5e8] text-[#16a34a] px-3 py-1 rounded-md text-xs font-bold tracking-wide capitalize">
                  Active
                </span>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-5 gap-x-4">
                <div>
                  <p className="text-sm text-gray-500 mb-0.5">Child Code</p>
                  <p className="font-bold text-gray-800 text-sm">
                    {child?.id ? `NC-2025-${String(child.id).padStart(5, '0')}` : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-0.5">DOB</p>
                  <p className="font-bold text-gray-800 text-sm">
                    {child?.dob ? new Date(child.dob).toLocaleDateString() : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-0.5">Gender</p>
                  <p className="font-bold text-gray-800 text-sm capitalize">{child?.gender?.toLowerCase() || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-0.5">Blood Group</p>
                  <p className="font-bold text-gray-800 text-sm">{child?.blood_group?.replace("_", " ") || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-0.5">Primary Diagnosis</p>
                  <p className="font-bold text-gray-800 text-sm">{child?.diagnosis || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-0.5">Referred By</p>
                  <p className="font-bold text-gray-800 text-sm">{child?.referred_by || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-0.5">Address</p>
                  <p className="font-bold text-gray-800 text-sm">{child?.address || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-0.5">Allergies</p>
                  <p className="font-bold text-gray-800 text-sm">{child?.allergies || "N/A"}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-500 mb-0.5">Parents</p>
                  <p className="font-bold text-gray-800 text-sm">
                    {child?.childUsers?.filter((cu: any) => cu.relation === "PARENT").map((cu: any) => cu.user?.name).join(", ") || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions (Right) */}
            <div className="flex flex-col shrink-0 min-w-56 w-56 border border-[#fed7aa] rounded-xl bg-white">
              <button className="flex items-center gap-3 w-full px-5 py-4 text-gray-600 text-sm hover:bg-orange-50 transition-colors border-b border-gray-100 rounded-t-xl">
                <PencilIcon className="w-4 h-4 fill-current text-gray-400" />
                Edit Child Details
              </button>
              <button className="flex items-center gap-3 w-full px-5 py-4 text-gray-600 text-sm hover:bg-orange-50 transition-colors border-b border-gray-100">
                <ArrowUpIcon className="w-4 h-4 fill-current text-gray-400" />
                Upload Photo
              </button>
              {/* <button className="flex items-center gap-3 w-full px-5 py-4 text-gray-600 text-sm hover:bg-orange-50 transition-colors rounded-b-xl">
                <UserIcon className="w-4 h-4 fill-current text-gray-400" />
                View Profile
              </button> */}
            </div>
          </div>
          
          {/* Bottom: Note Field */}
          <div className="mt-6 flex items-center gap-2 bg-[#fff7ed] border border-[#fed7aa] rounded-md px-3 py-2 w-full">
            <span className="text-gray-500 text-sm">Note :</span>
            <input 
              type="text" 
              className="flex-1 bg-transparent text-sm focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-gray-200 mb-6 overflow-x-auto custom-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`transition-all whitespace-nowrap ${
              activeTab === tab
                ? "w-fit p-0 text-[14px] font-semibold text-white"
                : "pb-3 text-sm font-semibold text-gray-600 hover:text-gray-900"
            }`}
          >
            <span className={`${
              activeTab === tab 
              ? "inline-flex w-fit items-center rounded-[6px] bg-[#7CC3FF] px-[11px] py-[5px]"
              : "rounded-md bg-transparent px-4 py-1.5"
            }`}>
              {tab}
            </span>
          </button>
        ))}
      </div>

      {/* Overview Content */}
      {activeTab === "Overview" && (
        <div className="space-y-6">
          {/* Top Widgets Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* 4 Stat Boxes (2x2 Grid) */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 grid grid-cols-2 gap-3 min-w-0">
              <div className="bg-[#f0f7ff] rounded-xl p-4 flex flex-col justify-center">
                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">IEP GOAL MASTERY</p>
                <h3 className="text-3xl font-bold text-gray-900 mb-1">62%</h3>
                <p className="text-xs text-gray-500 leading-tight">8 of 13 goals on track<br/><span className="text-gray-500">+8% this month</span></p>
              </div>
              <div className="bg-[#f8fafc] rounded-xl p-4 flex flex-col justify-center">
                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">SESSIONS THIS MONTH</p>
                <h3 className="text-3xl font-bold text-gray-900 mb-1">14</h3>
                <p className="text-xs text-gray-500 leading-tight">OT: 6 Speech: 5 ABA: 3<br/>vs 11 last month</p>
              </div>
              <div className="bg-[#f8fafc] rounded-xl p-4 flex flex-col justify-center">
                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">PENDING REVIEWS</p>
                <h3 className="text-3xl font-bold text-gray-900 mb-1">3</h3>
                <p className="text-xs text-gray-500 leading-tight">2 labs 1 genetic result<br/>Needs attention</p>
              </div>
              <div className="bg-[#f8fafc] rounded-xl p-4 flex flex-col justify-center">
                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">LAST ASSESSMENT</p>
                <h3 className="text-3xl font-bold text-gray-900 mb-1">18 days</h3>
                <p className="text-xs text-gray-500 leading-tight">ADOS-2-Apr 12, 2026<br/>Next due Jun 2026</p>
              </div>
            </div>

            {/* Session Frequency Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 min-w-0 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">Session Frequency</h3>
                  <p className="text-xs text-gray-500">Weekly sessions across all therapies</p>
                </div>
                <span className="text-xs font-medium text-[#ea580c] bg-[#fff7ed] px-2 py-1 rounded">Last 8 Weeks</span>
              </div>
              <div className="flex-1 -ml-2 -mb-2">
                <LineChartOne />
              </div>
            </div>
          </div>

          {/* IEP Goal Progress Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div>
              <h3 className="font-bold text-gray-900 text-lg">IEP Goal Progress by Domain</h3>
              <p className="text-xs text-gray-500 mb-4">% of goals on track per domain</p>
            </div>
            <div className="h-[250px]">
              <BarChartOne />
            </div>
          </div>

          {/* Bottom Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Upcoming Appointments */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h3 className="font-bold text-gray-900 text-lg mb-4">Upcoming Appointments</h3>
              <div className="space-y-3">
                {[
                  { time: "10:30 AM", title: "Arjun Krishnamurthy", subtitle: "OT Session Dr. Priya Lal" },
                  { time: "11:30 AM", title: "Myra Iyer Speech", subtitle: "Therapy Nandita Kumar" },
                  { time: "12:30 AM", title: "Vivaan Singh", subtitle: "Psychology Session Dr. Reena Kapoor" },
                ].map((apt, i) => (
                  <div key={i} className="flex items-center gap-4 border border-gray-100 rounded-lg p-3">
                    <div className="w-20 text-xs font-semibold text-gray-500 border-r border-gray-100 pr-3">{apt.time}</div>
                    <div className="w-8 h-8 rounded-full bg-gray-200 shrink-0"></div>
                    <div>
                      <p className="text-sm font-bold text-gray-900 leading-tight">{apt.title}</p>
                      <p className="text-xs text-gray-500">{apt.subtitle}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Consent Requests */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h3 className="font-bold text-gray-900 text-lg mb-4">Consent Requests</h3>
              <div className="space-y-3">
                {[1, 2, 3].map((_, i) => (
                  <div key={i} className="flex items-center gap-4 border border-gray-100 rounded-lg p-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200 shrink-0"></div>
                    <div>
                      <p className="text-sm font-bold text-gray-900 leading-tight">Arjun Krishnamurthy</p>
                      <p className="text-xs text-gray-500">Requested on May 18, 2026</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h3 className="font-bold text-gray-900 text-lg mb-4">Recent Activity</h3>
            <div className="space-y-0">
              {[
                { title: "Session note submitted for Communication goal C-04", subtitle: "Nandita Kumar Speech Therapist", time: "2h ago" },
                { title: "Organic acids panel results uploaded", subtitle: "Dr. Ananya Varma Biomedical", time: "2h ago" },
                { title: "IEP goal C-07 (Emotional Regulation) status updated to In Progress", subtitle: "Dr. Reena Kapoor Clin. Psychologist", time: "2h ago" },
                { title: "New message from Dr. Suresh Mehta re: medication review", subtitle: "Dr. Suresh Mehta Pediatrician", time: "2h ago" },
                { title: "Chromosomal microarray report flagged for review", subtitle: "Dr. Ananya Varma Biomedical", time: "2h ago" },
                { title: "OT session note: Improved pencil grip, fine motor baseline updated", subtitle: "Priya Lal OT Therapist", time: "2h ago" },
              ].map((activity, i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-semibold text-gray-900 leading-tight">{activity.title}</p>
                    <p className="text-xs text-gray-500">{activity.subtitle}</p>
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap">{activity.time}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Diagnoses Content */}
      {activeTab === "Diagnoses" && <DiagnosesTab />}

      {/* Medications Content */}
      {activeTab === "Medications" && <MedicationsTab />}

      {/* Genetic Testing Content */}
      {activeTab === "Genetic Testing" && <GeneticTestingTab />}
    </>
  );
}
