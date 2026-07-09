import { useState } from "react";
import { useParams, Link } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import { PencilIcon, DownloadIcon, UserIcon, ArrowUpIcon, PlusIcon } from "../../icons";
import LineChartOne from "../../components/charts/line/LineChartOne";
import BarChartOne from "../../components/charts/bar/BarChartOne";
import DiagnosesTab from "../../components/Care/DiagnosesTab";
import CustomModal, { FieldConfig } from "../../components/ui/modal/CustomModal";

export default function ChildDetails() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("Overview");

  // ── Medication modal state ─────────────────────────────────────────────
  type Medication = {
    name: string;
    category: string;
    dose: string;
    frequency: string;
    prescribedBy: string;
    start: string;
    reviewDue: string;
    status: "Active" | "Inactive" | "Pending";
  };
  const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null);
  const [isMedicationModalOpen, setIsMedicationModalOpen] = useState(false);
  const [isAddMedicationOpen, setIsAddMedicationOpen] = useState(false);

  

  const openMedicationModal = (med: Medication) => {
    setSelectedMedication(med);
    setIsMedicationModalOpen(true);
  };
  const closeMedicationModal = () => {
    setIsMedicationModalOpen(false);
    setSelectedMedication(null);
  };

  // ── Medications data ───────────────────────────────────────────────────
  const medications: Medication[] = [
    { name: "Methylphenidate HCI (Ritalin LA)", category: "Stimulant/ADHD", dose: "10 mg", frequency: "Once daily - morning", prescribedBy: "Dr. Suresh Mehta", start: "Feb 1, 2024", reviewDue: "Jun 1, 2026", status: "Active" },
    { name: "Methylphenidate HCI (Ritalin LA)", category: "Stimulant/ADHD", dose: "10 mg", frequency: "Once daily - morning", prescribedBy: "Dr. Suresh Mehta", start: "Feb 1, 2024", reviewDue: "Jun 1, 2026", status: "Inactive" },
    { name: "Methylphenidate HCI (Ritalin LA)", category: "Stimulant/ADHD", dose: "10 mg", frequency: "Once daily - morning", prescribedBy: "Dr. Suresh Mehta", start: "Feb 1, 2024", reviewDue: "Jun 1, 2026", status: "Inactive" },
    { name: "Methylphenidate HCI (Ritalin LA)", category: "Stimulant/ADHD", dose: "10 mg", frequency: "Once daily - morning", prescribedBy: "Dr. Suresh Mehta", start: "Feb 1, 2024", reviewDue: "Jun 1, 2026", status: "Inactive" },
    { name: "Methylphenidate HCI (Ritalin LA)", category: "Stimulant/ADHD", dose: "10 mg", frequency: "Once daily - morning", prescribedBy: "Dr. Suresh Mehta", start: "Feb 1, 2024", reviewDue: "Jun 1, 2026", status: "Inactive" },
  ];

  // Add Medication form fields (defined after `medications` so options can reference it)
  const addMedicationFields: FieldConfig[] = [
    { name: "medicationName", label: "Medication Name", type: "select", required: true, placeholder: "Select medication", options: medications.map((m) => ({ label: m.name, value: m.name })), colSpan: 1 },
    { name: "category", label: "Category", type: "select", required: true, placeholder: "Select category", options: [{ label: "Stimulant/ADHD", value: "Stimulant/ADHD" }, { label: "Antipsychotic", value: "Antipsychotic" }], colSpan: 1 },
    { name: "dose", label: "Dose", type: "text", placeholder: "e.g. 10", colSpan: 1 },
    { name: "unit", label: "Unit", type: "select", placeholder: "Select unit", options: [{ label: "mg", value: "mg" }, { label: "ml", value: "ml" }], colSpan: 1 },
    { name: "frequency", label: "Frequency", type: "select", required: true, placeholder: "Select frequency", options: [{ label: "Once daily - morning", value: "once-daily" }, { label: "Once daily - evening", value: "once-daily-eve" }], colSpan: 1 },
    { name: "administrationTime", label: "Administration Time", type: "select", required: true, placeholder: "Select time", options: [{ label: "Morning", value: "morning" }, { label: "Evening", value: "evening" }], colSpan: 1 },
    { name: "startDate", label: "Start Date", type: "date", required: true, placeholder: "Select start date", colSpan: 1 },
    { name: "reviewDue", label: "Review Due Date", type: "date", required: true, placeholder: "Select review date", colSpan: 1 },
    { name: "prescribedBy", label: "Prescribed By", type: "select", required: true, placeholder: "Select prescriber", options: [{ label: "Dr. Suresh Mehta", value: "Dr. Suresh Mehta" }], colSpan: 1 },
    { name: "status", label: "Status", type: "select", required: true, placeholder: "Select status", options: [{ label: "Active", value: "Active" }, { label: "Pending", value: "Pending" }, { label: "Inactive", value: "Inactive" }], colSpan: 1 },
    {
      name: "instructions",
      label: "Instructions for Care Team / Parents",
      type: "text",
      colSpan: 2,
      placeholder: "Enter instructions",
      inputClassName:
        "h-8 w-full rounded-[10px] border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed",
    },
  ];

  const handleAddMedicationSubmit = (formData: Record<string, any>) => {
    console.log("Add medication submitted:", formData);
    setIsAddMedicationOpen(false);
  };

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
            <p className="text-sm text-gray-500 mt-1">
              6 children 3 need attention
            </p>
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
          {/* Placeholder for Photo */}
          <UserIcon className="w-24 h-24 text-[#fed7aa]" />
        </div>

        {/* Right Side (Details + Actions + Note) */}
        <div className="flex-1 flex flex-col justify-between py-1">
          
          {/* Top: Details & Actions */}
          <div className="flex flex-col xl:flex-row gap-6 items-start">
            
            {/* Details */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Sana Iyer</h2>
                <span className="bg-[#e5f5e8] text-[#16a34a] px-3 py-1 rounded-md text-xs font-bold tracking-wide capitalize">
                  Active
                </span>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-5 gap-x-4">
                <div>
                  <p className="text-sm text-gray-500 mb-0.5">Child Code</p>
                  <p className="font-bold text-gray-800 text-sm">ABCD</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-0.5">DOB</p>
                  <p className="font-bold text-gray-800 text-sm">ABCD</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-0.5">Gender</p>
                  <p className="font-bold text-gray-800 text-sm">ABCD</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-0.5">Blood Group</p>
                  <p className="font-bold text-gray-800 text-sm">ABCD</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-0.5">Primary Diagnosis</p>
                  <p className="font-bold text-gray-800 text-sm">ABCD</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-0.5">Referred By</p>
                  <p className="font-bold text-gray-800 text-sm">ABCD</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-0.5">Address</p>
                  <p className="font-bold text-gray-800 text-sm">ABCD</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-0.5">Allergies</p>
                  <p className="font-bold text-gray-800 text-sm">ABCD</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-500 mb-0.5">Parents</p>
                  <p className="font-bold text-gray-800 text-sm">ABCD</p>
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
              <button className="flex items-center gap-3 w-full px-5 py-4 text-gray-600 text-sm hover:bg-orange-50 transition-colors rounded-b-xl">
                <UserIcon className="w-4 h-4 fill-current text-gray-400" />
                View Profile
              </button>
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
            className={`pb-3 text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === tab
                ? "text-white"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <span className={`px-4 py-1.5 rounded-md ${
              activeTab === tab 
              ? "bg-[#60a5fa]" 
              : "bg-transparent"
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
      {activeTab === "Diagnoses" && (
        <DiagnosesTab />
      )}

      {/* Medications Content */}
      {activeTab === "Medications" && (
        <div>
          {/* Top row: title + Add button */}
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-gray-900">Medications</h2>
            <button
              onClick={() => setIsAddMedicationOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-[#60a5fa] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-colors"
            >
              <PlusIcon className="w-4 h-4 text-white fill-current" />
              Add Medication
            </button>
          </div>

          {/* Table card */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full border-collapse">
              {/* Header */}
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {["Medication", "Category", "Dose", "Frequency", "Prescribed By", "Start", "Review Due", "Status", "Actions"].map((col) => (
                    <th
                      key={col}
                      className="px-5 py-3.5 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>

              {/* Body */}
              <tbody>
                {medications.map((med, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-gray-50 last:border-b-0 hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-5 py-4 text-sm font-semibold text-gray-800 whitespace-nowrap">{med.name}</td>
                    <td className="px-5 py-4 text-sm text-gray-600 whitespace-nowrap">{med.category}</td>
                    <td className="px-5 py-4 text-sm text-gray-600">{med.dose}</td>
                    <td className="px-5 py-4 text-sm text-gray-600 whitespace-nowrap">{med.frequency}</td>
                    <td className="px-5 py-4 text-sm text-gray-600 whitespace-nowrap">{med.prescribedBy}</td>
                    <td className="px-5 py-4 text-sm text-gray-600 whitespace-nowrap">{med.start}</td>
                    <td className="px-5 py-4 text-sm text-gray-600 whitespace-nowrap">{med.reviewDue}</td>
                    <td className="px-5 py-4">
                      {med.status === "Active" ? (
                        <span className="inline-block px-3 py-1 rounded-md text-xs font-bold bg-emerald-50 text-emerald-600 whitespace-nowrap">
                          Active
                        </span>
                      ) : (
                        <span className="inline-block w-16 h-5 rounded-md bg-emerald-100/50" />
                      )}
                    </td>
                    <td className="px-5 py-4">
                      {/* Three-dot action button — only this triggers the modal */}
                      <button
                        onClick={() => openMedicationModal(med)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                        title="View details"
                      >
                        <span className="text-lg font-bold leading-none tracking-widest">···</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Medication Details Modal (inlined using CustomModal) */}
      <CustomModal
        isOpen={isMedicationModalOpen}
        onClose={closeMedicationModal}
        title={selectedMedication?.name ?? "Medication Details"}
        modalClassName="!w-[78vw] !max-w-[980px] !max-h-[78vh] !rounded-[10px] !bg-white !p-0 !shadow-[0_16px_40px_rgba(0,0,0,0.18)]"
      >
        <div className="px-8 pt-4 pb-4">
          <div className="mt-2 space-y-1">
            <p className="text-[12px] text-gray-500">Antipsychotic / Behcnonsi</p>
            <p className="text-[12px] text-gray-500">0.25 mg Once daily evening</p>
            <p className="text-[12px] text-gray-500">Prescribed by Dr. Suresh Mehta</p>
          </div>
        </div>

        <div className="border-t border-gray-200" />

        <div className="grid grid-cols-[1fr_1fr] px-8 py-4">
          <div className="pr-8">
            <h3 className="text-[12px] font-bold text-gray-700 mb-4">Medication Details</h3>

            <div className="space-y-2">
              {[
                ["Category", "Antipsychotic/Betuvional"],
                ["Dose", "0.25 mg"],
                ["Frequency", "Once daily evening"],
                ["Start Date", "Jun 15, 2023"],
                ["Review Due", "Jun 15, 2024"],
                ["Stut", "On Holu"],
                ["Prescribed By", "Dr. Suresh Mehta"],
                ["Lust Updated", "May 20, 2024 by Dr. Reena Kapoor"],
              ].map(([label, value]) => (
                <div key={label} className="grid grid-cols-[180px_1fr] text-[12px] leading-tight">
                  <span className="text-gray-500">{label}</span>
                  <span className="text-gray-600">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-l border-gray-200 pl-8">
            <h3 className="text-[12px] font-normal text-gray-600 mt-8 mb-6">Instructions for Care Team/Parenta</h3>

            <div className="space-y-2 text-[12px] text-gray-600 leading-snug">
              <p>Give in the evening after food.</p>
              <p>Monitor for drowsiness, dizziness, or unusual movements</p>
              <p>Do not stand suddenly Consult the doctor before any change.</p>
              <p>Report immediately if any swelling, fever, or stiff muscles occur</p>
              <p>Keep a record of mood, sleep, and behavior changes.</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 mx-8" />

        <div className="px-8 py-5">
          <h3 className="text-[12px] font-bold text-gray-700 mb-4">Reports &amp; Documents</h3>

          <div className="grid grid-cols-5 gap-4">
            {documents.map((doc, index) => (
              <div key={index} className="h-[128px] rounded-[7px] border border-orange-300 px-4 pb-4 flex flex-col justify-end text-[12px]">
                <p className="font-bold text-gray-700 leading-tight">{doc.name}</p>
                <p className="text-gray-600 mt-1">{doc.date}</p>
                {doc.size && <p className="text-gray-600">{doc.size}</p>}
              </div>
            ))}

            <div className="h-[128px] rounded-[7px] border border-dashed border-gray-300 flex flex-col items-center justify-center gap-2 text-[12px] text-gray-500 cursor-pointer">
              <DownloadIcon className="w-4 h-4" />
              <span>Upload More</span>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200" />

        <div className="px-8 py-6">
          <h3 className="text-[12px] font-bold text-gray-700 mb-6">Medication History</h3>

          <div className="space-y-4">
            {historyItems.map((item, index) => (
              <div key={index} className="grid grid-cols-[18px_130px_18px_190px_1fr] items-center text-[12px] text-gray-600">
                <span className={`w-2 h-2 rounded-full ${item.dot}`} />
                <span>{item.date}</span>
                <span className={`w-2 h-2 rounded-full ${item.dot}`} />
                <span>{item.event}</span>
                <span className="text-[11px]">{item.detail}</span>
              </div>
            ))}
          </div>
        </div>
      </CustomModal>

      {/* Add Medication Modal */}
      <CustomModal
        isOpen={isAddMedicationOpen}
        onClose={() => setIsAddMedicationOpen(false)}
        title="Add Medication"
        bodyHeader={
          <div className="mb-3 px-0">
            <h4 className="text-sm font-semibold text-gray-900">Medication Information</h4>
          </div>
        }
        fields={addMedicationFields}
        onSubmit={handleAddMedicationSubmit}
        submitText="Save Medication"
        cancelText="Cancel"
        size="lg"
        footerAlign="center"
        overlayBlur={false}
        modalClassName="!w-[78vw] !max-w-[980px] !max-h-[78vh] !rounded-[10px] !bg-white !p-0 !shadow-[0_16px_40px_rgba(0,0,0,0.18)]"
      >
        <div className="px-8 pt-1 pb-3">
          <div className="mb-1.5">
            <label className="block text-xs font-bold text-black">
              Attach Reports / Documents
            </label>
          </div>
          <div className="w-full h-[76px] rounded-[10px] border border-dashed border-gray-300 flex items-center justify-center gap-2 text-[12px] text-gray-500 cursor-pointer">
            <DownloadIcon className="w-4 h-4 shrink-0" />
            <div className="text-left leading-5">
              <span>Drag & drop or </span>
              <span className="text-blue-600 font-medium">browse files</span>
              <span> Jpeg, Png</span>
            </div>
          </div>
        </div>
      </CustomModal>
    </>
  );
}
