import { useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import { PlusIcon, UserIcon, CheckLineIcon, AlertIcon, TimeIcon } from "../../icons";
import { CustomModal } from "../../components/ui/modal/CustomModal";

// Mock Data for the Cards
const baseChild = {
  name: "Sana Iyer",
  ageLoc: "5 yrs Hyderabad, TS",
  mrn: "NC-2025-00501",
  status: "Active",
  pendingAction: "Genetic test pending review",
  tags: [
    { label: "ASD (Level 2)", color: "bg-blue-100 text-blue-500" },
    { label: "ADHD-Combined", color: "bg-purple-100 text-purple-500" },
    { label: "Sensory Processing Disorder", color: "bg-green-100 text-green-500" },
  ],
  metrics: { activeGoals: 6, achieved: 3, providers: 4 },
  nextAppointment: "Today, 11:00 AM",
};
const childrenData = Array.from({ length: 6 }, (_, i) => ({ ...baseChild, id: i + 1 }));

export default function Children() {
  const [activeTab, setActiveTab] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const tabs = ["All", "ASD", "ADHD", "Speech", "Alerts"];

  // Filter children based on selected tab
  const filteredChildren = childrenData.filter((child) => {
    if (activeTab === "All") return true;
    if (activeTab === "Alerts") return child.pendingAction.length > 0;
    // Match tab keyword against any tag label (case-insensitive)
    return child.tags.some((tag) =>
      tag.label.toLowerCase().includes(activeTab.toLowerCase())
    );
  });

  const totalGoals = filteredChildren.reduce((sum, c) => sum + c.metrics.activeGoals, 0);
  const needAttention = filteredChildren.filter((c) => c.pendingAction.length > 0).length;

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
              {filteredChildren.length} children {needAttention} need attention
            </p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#60a5fa] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-colors"
          >
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
          <span className="text-gray-900 font-semibold">{filteredChildren.length}</span> Total Active
        </div>
        <div className="flex items-center gap-2">
          <CheckLineIcon className="w-5 h-5 text-gray-500" />
          <span className="text-gray-900 font-semibold">{totalGoals}</span> Goals Active
        </div>
        <div className="flex items-center gap-2">
          <AlertIcon className="w-5 h-5 text-gray-500" />
          <span className="text-gray-900 font-semibold">{needAttention}</span> Need Attention
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
        {filteredChildren.map((child) => (
          <div
            key={child.id}
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

      {/* Add New Child Modal using CustomModal component */}
      <CustomModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Child"
        size="lg"
        footerAlign="center"
        asteriskColor="black"
        overlayBlur={false}
        submitText="Add Child"
        maxBodyHeight="70vh"
        modalClassName="max-h-[90vh]"
        customFooter={
          <div className="flex items-center justify-center gap-3 px-8 py-5 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-6 py-2.5 rounded-lg bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors text-sm cursor-pointer min-w-[120px]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-6 py-2.5 rounded-lg bg-brand-500 text-white font-semibold hover:bg-brand-600 transition-colors text-sm cursor-pointer min-w-[120px]"
            >
              Add Child
            </button>
          </div>
        }
      >
        <form onSubmit={(e) => { e.preventDefault(); setIsModalOpen(false); }}>
          <div className="grid grid-cols-2 gap-x-6 gap-y-5 mb-5">
            {/* Full Name */}
            <div className="col-span-2 sm:col-span-1 flex flex-col gap-1.5">
              <label className="block text-xs font-bold text-black">
                Full Name <span className="text-black">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Enter full name"
                className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
              />
            </div>

            {/* Age */}
            <div className="col-span-2 sm:col-span-1 flex flex-col gap-1.5">
              <label className="block text-xs font-bold text-black">
                Age <span className="text-black">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="DD/MM/YYYY"
                  className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 pr-10 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                />
                <svg className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
            </div>

            {/* Gender */}
            <div className="col-span-2 sm:col-span-1 flex flex-col gap-1.5">
              <label className="block text-xs font-bold text-black">
                Gender<span className="text-black">*</span>
              </label>
              <div className="relative">
                <select
                  required
                  className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-white px-4 py-2.5 pr-10 text-sm text-gray-900 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </div>
            </div>

            {/* Address */}
            <div className="col-span-2 sm:col-span-1 flex flex-col gap-1.5">
              <label className="block text-xs font-bold text-black">
                Address <span className="text-black">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Enter address"
                className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
              />
            </div>

            {/* Diagnoses */}
            <div className="col-span-2 sm:col-span-1 flex flex-col gap-1.5">
              <label className="block text-xs font-bold text-black">
                Diagnoses<span className="text-black">*</span>
              </label>
              <div className="relative">
                <select
                  required
                  className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-white px-4 py-2.5 pr-10 text-sm text-gray-900 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                >
                  <option value="">Select diagnoses</option>
                  <option value="ADHD">ADHD</option>
                  <option value="ASD">ASD</option>
                  <option value="Sensory Processing Disorder">Sensory Processing Disorder</option>
                  <option value="Speech Impairment">Speech Impairment</option>
                </select>
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </div>
            </div>

            {/* Blood Group */}
            <div className="col-span-2 sm:col-span-1 flex flex-col gap-1.5">
              <label className="block text-xs font-bold text-black">
                Blood Group<span className="text-black">*</span>
              </label>
              <div className="relative">
                <select
                  required
                  className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-white px-4 py-2.5 pr-10 text-sm text-gray-900 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                >
                  <option value="">Select blood group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </div>
            </div>

            {/* Mother's Name */}
            <div className="col-span-2 sm:col-span-1 flex flex-col gap-1.5">
              <label className="block text-xs font-bold text-black">
                Mother's Name<span className="text-black">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Enter mother's name"
                className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
              />
            </div>

            {/* Father's Name */}
            <div className="col-span-2 sm:col-span-1 flex flex-col gap-1.5">
              <label className="block text-xs font-bold text-black">
                Father's Name<span className="text-black">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Enter father's name"
                className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
              />
            </div>

            {/* Allergies */}
            <div className="col-span-2 sm:col-span-1 flex flex-col gap-1.5">
              <label className="block text-xs font-bold text-black">
                Allergies
              </label>
              <input
                type="text"
                placeholder="Enter allergies"
                className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
              />
            </div>

            {/* School */}
            <div className="col-span-2 sm:col-span-1 flex flex-col gap-1.5">
              <label className="block text-xs font-bold text-black">
                School<span className="text-black">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Enter school"
                className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
              />
            </div>
          </div>

          {/* Notes (Full Width) */}
          <div className="flex flex-col gap-1.5 mb-5">
            <label className="block text-xs font-bold text-black">
              Notes
            </label>
            <input
              type="text"
              placeholder="Enter notes"
              className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
            />
          </div>

          {/* Upload Photo (Full Width) */}
          <div className="flex flex-col gap-1.5">
            <label className="block text-xs font-bold text-black">
              Upload Photo
            </label>
            <div className="border border-dashed border-gray-300 rounded-lg h-11 bg-white hover:bg-gray-50 transition-colors cursor-pointer relative flex items-center justify-center gap-2 px-4">
              <input type="file" className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" accept="image/jpeg,image/png" />
              <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              <p className="text-sm text-gray-500 leading-none">
                Drag & drop or <span className="text-brand-500 font-semibold">browse files</span> Jpeg, Png
              </p>
            </div>
          </div>
        </form>
      </CustomModal>
    </>
  );
}
