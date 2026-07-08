import { useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import { PlusIcon, UserIcon, CheckLineIcon, AlertIcon, TimeIcon } from "../../icons";

// Mock Data for the Cards
const childrenData = Array(6).fill({
  id: 1,
  name: "Sana Iyer",
  ageLoc: "5 yrs Hyderabad, TS",
  mrn: "NC-2025-00501",
  status: "Active",
  pendingAction: "Genetic test pending review",
  tags: [
    { label: "ASD (Level 2) r", color: "bg-blue-100 text-blue-500" },
    { label: "ADHD-Combined", color: "bg-purple-100 text-purple-500" },
    { label: "Sensory Processing Disorder", color: "bg-green-100 text-green-500" },
  ],
  metrics: {
    activeGoals: 6,
    achieved: 3,
    providers: 4,
  },
  nextAppointment: "Today, 11:00 AM",
});

export default function Children() {
  const [activeTab, setActiveTab] = useState("All");

  const tabs = ["All", "ASD", "ADHD", "Speech", "Alerts"];

  return (
    <>
      <PageMeta
        title="Children | Care"
        description="Children management dashboard"
      />

      {/* Header Section */}
      <div className="mb-4">
        {/* Breadcrumb */}
        <div className="text-sm mb-3">
          <span className="text-gray-400">NeuroDiverse</span>
          <span className="text-gray-400 mx-2">&lt;</span>
          <span className="text-gray-500 font-medium">Administration</span>
        </div>

        {/* Title and Subtitle Area */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-[28px] font-bold text-gray-900 leading-tight">
              Children
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              6 children 3 need attention
            </p>
          </div>
          <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#60a5fa] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-colors">
            <PlusIcon className="w-4 h-4 fill-current" />
            Add Child
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-6 border-b border-gray-200 mb-4 pb-0">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-sm font-semibold transition-all relative ${
              activeTab === tab
                ? "text-gray-900"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {/* The Figma shows "All" with a green background inside the tab, 
                let's mimic the exact visual of the green background badge. */}
            <span className={`px-3 py-1 rounded-md ${
              activeTab === tab 
              ? "bg-[#e5f5e8] text-[#16a34a]" 
              : "bg-transparent text-gray-600"
            }`}>
              {tab}
            </span>
            {/* If underline is needed in Figma, uncomment below:
            {activeTab === tab && (
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-green-500 rounded-t-md" />
            )} */}
          </button>
        ))}
      </div>

      {/* Summary Statistics */}
      <div className="flex flex-wrap items-center gap-8 mb-6 text-sm text-gray-600 font-medium">
        <div className="flex items-center gap-2">
          <UserIcon className="w-5 h-5 text-gray-500" />
          <span className="text-gray-900 font-semibold">6</span> Total Active
        </div>
        <div className="flex items-center gap-2">
          <CheckLineIcon className="w-5 h-5 text-gray-500" />
          <span className="text-gray-900 font-semibold">30</span> Goals Active
        </div>
        <div className="flex items-center gap-2">
          <AlertIcon className="w-5 h-5 text-gray-500" />
          <span className="text-gray-900 font-semibold">3</span> Need Attention
        </div>
        <div className="flex items-center gap-2">
          <TimeIcon className="w-5 h-5 text-gray-500" />
          <span className="text-gray-900 font-semibold">3</span> Sessions Today
        </div>
      </div>

      {/* Divider if needed (The image shows a light gray line under the summary row) */}
      <hr className="border-gray-200 mb-6" />

      {/* Children Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {childrenData.map((child, index) => (
          <div
            key={index}
            className="bg-white rounded-[20px] border border-gray-100 shadow-[0px_4px_16px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col"
          >
            {/* Top Row: Avatar and Details */}
            <div className="p-5 pb-4 relative">
              <div className="flex items-start gap-3">
                {/* Avatar Placeholder */}
                <div className="w-[50px] h-[50px] rounded-full bg-[#fdf3e7] shrink-0" />
                
                {/* Details */}
                <div className="flex-1">
                  <h3 className="text-[#ea580c] font-bold text-[17px] leading-tight mb-1">
                    {child.name}
                  </h3>
                  <p className="text-[#ea580c] text-sm font-medium leading-tight mb-1">
                    {child.ageLoc}
                  </p>
                  <p className="text-gray-500 text-xs font-medium">
                    MRN: {child.mrn}
                  </p>
                </div>

                {/* Active Badge */}
                <div className="absolute top-5 right-5">
                  <span className="bg-[#e5f5e8] text-[#16a34a] px-3 py-1 rounded-md text-xs font-bold tracking-wide uppercase">
                    {child.status}
                  </span>
                </div>
              </div>

              {/* Status Bar */}
              <div className="mt-4">
                <div className="border border-[#fed7aa] bg-[#fff7ed] rounded-md px-3 py-1.5 inline-block">
                  <span className="text-[#ea580c] text-xs font-medium">
                    {child.pendingAction}
                  </span>
                </div>
              </div>

              {/* Tags */}
              <div className="mt-3 flex flex-wrap gap-2">
                {child.tags.map((tag: { label: string; color: string }, i: number) => (
                  <span
                    key={i}
                    className={`px-2 py-1 rounded-[4px] text-[11px] font-bold ${tag.color}`}
                  >
                    {tag.label}
                  </span>
                ))}
              </div>

              {/* Bottom Metrics */}
              <div className="mt-5 flex items-center justify-between px-2">
                <div className="flex flex-col items-center">
                  <span className="text-gray-800 font-bold text-sm">
                    {child.metrics.activeGoals}
                  </span>
                  <span className="text-gray-500 text-[11px] font-medium uppercase tracking-wider">
                    Active Goals
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-gray-800 font-bold text-sm">
                    {child.metrics.achieved}
                  </span>
                  <span className="text-gray-500 text-[11px] font-medium uppercase tracking-wider">
                    Achieved
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-gray-800 font-bold text-sm">
                    {child.metrics.providers}
                  </span>
                  <span className="text-gray-500 text-[11px] font-medium uppercase tracking-wider">
                    Providers
                  </span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-100 bg-white p-4 flex items-center gap-2">
              <TimeIcon className="w-4 h-4 text-gray-400" />
              <span className="text-gray-500 text-xs font-medium">
                Next: {child.nextAppointment}
              </span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
