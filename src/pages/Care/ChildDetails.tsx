import { useState, useRef, type ChangeEvent, type DragEvent } from "react";
import { useParams, Link } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import { PencilIcon, DownloadIcon, UserIcon, ArrowUpIcon, PlusIcon, HorizontaLDots } from "../../icons";
import LineChartOne from "../../components/charts/line/LineChartOne";
import BarChartOne from "../../components/charts/bar/BarChartOne";
import DiagnosesTab from "../../components/Care/DiagnosesTab";
import CustomModal, { FieldConfig } from "../../components/ui/modal/CustomModal";
import { Dropdown } from "../../components/ui/dropdown/Dropdown";
import { DropdownItem } from "../../components/ui/dropdown/DropdownItem";

export default function ChildDetails() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("Overview");

  // ── Medication modal state ─────────────────────────────────────────────
  type Medication = {
    id: number;
    name: string;
    category: string;
    dose: string;
    frequency: string;
    prescribedBy: string;
    start: string;
    reviewDue: string;
    status: "Active" | "Inactive" | "Pending";
    instructions?: string;
  };

  const initialMedications: Medication[] = [
    { id: 1, name: "Methylphenidate HCI (Ritalin LA)", category: "Stimulant/ADHD", dose: "10 mg", frequency: "Once daily - morning", prescribedBy: "Dr. Suresh Mehta", start: "Feb 1, 2024", reviewDue: "Jun 1, 2026", status: "Active", instructions: "Give in the evening after food. Monitor for drowsiness, dizziness, or unusual movements." },
    { id: 2, name: "Methylphenidate HCI (Ritalin LA)", category: "Stimulant/ADHD", dose: "10 mg", frequency: "Once daily - morning", prescribedBy: "Dr. Suresh Mehta", start: "Feb 1, 2024", reviewDue: "Jun 1, 2026", status: "Inactive", instructions: "Give in the evening after food. Monitor for drowsiness, dizziness, or unusual movements." },
    { id: 3, name: "Methylphenidate HCI (Ritalin LA)", category: "Stimulant/ADHD", dose: "10 mg", frequency: "Once daily - morning", prescribedBy: "Dr. Suresh Mehta", start: "Feb 1, 2024", reviewDue: "Jun 1, 2026", status: "Inactive", instructions: "Give in the evening after food. Monitor for drowsiness, dizziness, or unusual movements." },
    { id: 4, name: "Methylphenidate HCI (Ritalin LA)", category: "Stimulant/ADHD", dose: "10 mg", frequency: "Once daily - morning", prescribedBy: "Dr. Suresh Mehta", start: "Feb 1, 2024", reviewDue: "Jun 1, 2026", status: "Inactive", instructions: "Give in the evening after food. Monitor for drowsiness, dizziness, or unusual movements." },
    { id: 5, name: "Methylphenidate HCI (Ritalin LA)", category: "Stimulant/ADHD", dose: "10 mg", frequency: "Once daily - morning", prescribedBy: "Dr. Suresh Mehta", start: "Feb 1, 2024", reviewDue: "Jun 1, 2026", status: "Inactive", instructions: "Give in the evening after food. Monitor for drowsiness, dizziness, or unusual movements." },
  ];

  const [medications, setMedications] = useState<Medication[]>(initialMedications);
  const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null);
  const [isMedicationModalOpen, setIsMedicationModalOpen] = useState(false);
  const [isAddMedicationOpen, setIsAddMedicationOpen] = useState(false);
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null);
  const [openMenuMedicationId, setOpenMenuMedicationId] = useState<number | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeletingMedication, setIsDeletingMedication] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const openMedicationModal = (med: Medication) => {
    setSelectedMedication(med);
    setIsMedicationModalOpen(true);
    setOpenMenuMedicationId(null);
  };

  const closeMedicationModal = () => {
    setIsMedicationModalOpen(false);
    setSelectedMedication(null);
  };

  const acceptedFileExtensions = [".jpg", ".jpeg", ".png", ".pdf"];

  const resetUploadState = () => {
    setSelectedFiles([]);
    setUploadError(null);
  };

  const handleOpenAddMedicationModal = () => {
    resetUploadState();
    setEditingMedication(null);
    setIsAddMedicationOpen(true);
  };

  const handleOpenEditMedicationModal = (med: Medication) => {
    resetUploadState();
    setEditingMedication(med);
    setIsAddMedicationOpen(true);
    setOpenMenuMedicationId(null);
  };

  const handleCloseAddMedicationModal = () => {
    resetUploadState();
    setEditingMedication(null);
    setIsAddMedicationOpen(false);
  };

  const handleOpenDeleteModal = (med: Medication) => {
    setSelectedMedication(med);
    setIsDeleteModalOpen(true);
    setOpenMenuMedicationId(null);
  };

  const handleDeleteMedication = async () => {
    if (!selectedMedication || isDeletingMedication) return;

    setIsDeletingMedication(true);
    await new Promise((resolve) => window.setTimeout(resolve, 300));
    setMedications((prev) => prev.filter((med) => med.id !== selectedMedication.id));
    setIsDeletingMedication(false);
    setIsDeleteModalOpen(false);
    setSelectedMedication(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const getFileKey = (file: File) => `${file.name}-${file.size}-${file.lastModified}`;

  const isValidFileType = (file: File) => {
    const extension = `.${file.name.split(".").pop()?.toLowerCase() ?? ""}`;
    return acceptedFileExtensions.includes(extension);
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files?.length) return;

    const incomingFiles = Array.from(files);
    const invalidFiles = incomingFiles.filter((file) => !isValidFileType(file));
    const validFiles = incomingFiles.filter((file) => isValidFileType(file));

    setSelectedFiles((prev) => {
      const existingKeys = new Set(prev.map((file) => getFileKey(file)));
      const freshFiles = validFiles.filter((file) => !existingKeys.has(getFileKey(file)));
      return [...prev, ...freshFiles];
    });

    if (invalidFiles.length) {
      setUploadError(`Unsupported file type skipped: ${invalidFiles.map((file) => file.name).join(", ")}`);
    } else {
      setUploadError(null);
    }
  };

  const handleFileInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(event.target.files);
    event.target.value = "";
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    handleFileSelect(event.dataTransfer.files);
  };

  const handleRemoveFile = (fileToRemove: File) => {
    setSelectedFiles((prev) => prev.filter((file) => getFileKey(file) !== getFileKey(fileToRemove)));
  };

  const formatDateValue = (value: unknown) => {
    if (!value) return "";
    if (value instanceof Date) {
      return value.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    }
    if (Array.isArray(value)) {
      return value[0] ? formatDateValue(value[0]) : "";
    }
    return String(value);
  };

  const getFrequencyLabel = (value: string) => {
    if (value === "once-daily") return "Once daily - morning";
    if (value === "once-daily-eve") return "Once daily - evening";
    return value;
  };

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
        "h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed",
    },
  ];

  const handleAddMedicationSubmit = (formData: Record<string, any>) => {
    const normalizedDose = [formData.dose, formData.unit].filter(Boolean).join(" ").trim();
    const medicationPayload: Medication = {
      id: editingMedication?.id ?? Date.now(),
      name: formData.medicationName,
      category: formData.category,
      dose: normalizedDose,
      frequency: getFrequencyLabel(formData.frequency),
      prescribedBy: formData.prescribedBy,
      start: formatDateValue(formData.startDate),
      reviewDue: formatDateValue(formData.reviewDue),
      status: formData.status ?? "Pending",
      instructions: formData.instructions ?? "",
      attachments: selectedFiles,
    };

    if (editingMedication) {
      setMedications((prev) =>
        prev.map((med) => (med.id === editingMedication.id ? medicationPayload : med))
      );
    } else {
      setMedications((prev) => [medicationPayload, ...prev]);
    }

    handleCloseAddMedicationModal();
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
              onClick={handleOpenAddMedicationModal}
              className="inline-flex items-center gap-2 rounded-lg bg-[#60a5fa] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-colors"
            >
              <PlusIcon className="w-4 h-4 text-white fill-current" />
              Add Medication
            </button>
          </div>

          {/* Table card */}
          <div className="w-full overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
            <div className="w-full overflow-x-hidden">
              <table className="w-full table-fixed border-collapse">
                {/* Header */}
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    {[
                      { label: "Medication", width: "w-[22%]" },
                      { label: "Category", width: "w-[12%]" },
                      { label: "Dose", width: "w-[8%]" },
                      { label: "Frequency", width: "w-[14%]" },
                      { label: "Prescribed By", width: "w-[15%]" },
                      { label: "Start", width: "w-[10%]" },
                      { label: "Review Due", width: "w-[10%]" },
                      { label: "Status", width: "w-[7%]" },
                      { label: "Actions", width: "w-[6%]" },
                    ].map((col) => (
                      <th
                        key={col.label}
                        className={`px-3 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500 ${col.width}`}
                      >
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>

                {/* Body */}
                <tbody>
                  {medications.map((med) => (
                    <tr
                      key={med.id}
                      className="border-b border-gray-50 last:border-b-0 transition-colors hover:bg-gray-50/50"
                    >
                      <td className="px-3 py-4 text-sm font-semibold leading-snug text-gray-800 whitespace-normal break-words">{med.name}</td>
                      <td className="px-3 py-4 text-sm leading-snug text-gray-600 whitespace-normal break-words">{med.category}</td>
                      <td className="px-3 py-4 text-sm leading-snug text-gray-600 whitespace-normal break-words">{med.dose}</td>
                      <td className="px-3 py-4 text-sm leading-snug text-gray-600 whitespace-normal break-words">{med.frequency}</td>
                      <td className="px-3 py-4 text-sm leading-snug text-gray-600 whitespace-normal break-words">{med.prescribedBy}</td>
                      <td className="px-3 py-4 text-sm leading-snug text-gray-600 whitespace-normal break-words">{med.start}</td>
                      <td className="px-3 py-4 text-sm leading-snug text-gray-600 whitespace-normal break-words">{med.reviewDue}</td>
                      <td className="px-3 py-4">
                        {med.status === "Active" ? (
                          <span className="inline-block rounded-md bg-emerald-50 px-3 py-1 text-xs font-bold whitespace-nowrap text-emerald-600">
                            Active
                          </span>
                        ) : (
                          <span className="inline-block h-5 w-16 rounded-md bg-emerald-100/50" />
                        )}
                      </td>
                      <td className="px-3 py-4">
                        <div className="relative inline-flex">
                          <button
                            onClick={() => setOpenMenuMedicationId(openMenuMedicationId === med.id ? null : med.id)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                            title="Medication actions"
                          >
                            <HorizontaLDots className="h-4 w-4" />
                          </button>
                          <Dropdown
                            isOpen={openMenuMedicationId === med.id}
                            onClose={() => setOpenMenuMedicationId(null)}
                            className="right-0 mt-1 w-32 shadow-theme-md"
                          >
                            <div className="py-1">
                              <DropdownItem onClick={() => openMedicationModal(med)}>View</DropdownItem>
                              <DropdownItem onClick={() => handleOpenEditMedicationModal(med)}>Edit</DropdownItem>
                              <DropdownItem
                                onClick={() => handleOpenDeleteModal(med)}
                                className="text-error-600 hover:bg-error-50 dark:hover:bg-error-950/20"
                              >
                                Delete
                              </DropdownItem>
                            </div>
                          </Dropdown>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Medication Details Modal (styled like Diagnosis Details) */}
      <CustomModal
        isOpen={isMedicationModalOpen}
        onClose={closeMedicationModal}
        title={selectedMedication?.name ?? "Medication Details"}
        maxWidth="max-w-3xl"
        maxBodyHeight="80vh"
        padding="p-0"
        customFooter={<></>}
      >
        {selectedMedication && (
          <div className="flex flex-col">
            <div className="p-6 pt-6">
              {/* Top summary under title (small gray lines) */}
              <div className="mb-4 px-0">
                <p className="text-sm text-gray-500">{selectedMedication.category} / {selectedMedication.status}</p>
                <p className="text-sm text-gray-500">{selectedMedication.dose} · {selectedMedication.frequency}</p>
                <p className="text-sm text-gray-500">Prescribed by {selectedMedication.prescribedBy}</p>
              </div>
              {/* Row 1: Details and Instructions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="grid grid-cols-[140px_1fr] gap-y-3">
                  <span className="text-[12px] text-gray-500">Category</span>
                  <span className="text-sm text-gray-800">{selectedMedication.category}</span>

                  <span className="text-[12px] text-gray-500">Dose</span>
                  <span className="text-sm text-gray-800">{selectedMedication.dose}</span>

                  <span className="text-[12px] text-gray-500">Frequency</span>
                  <span className="text-sm text-gray-800">{selectedMedication.frequency}</span>

                  <span className="text-[12px] text-gray-500">Start Date</span>
                  <span className="text-sm text-gray-800">{selectedMedication.start}</span>

                  <span className="text-[12px] text-gray-500">Review Due</span>
                  <span className="text-sm text-gray-800">{selectedMedication.reviewDue}</span>

                  <span className="text-[12px] text-gray-500">Status</span>
                  <div>
                    <span className="bg-[#e5f5e8] text-[#16a34a] px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider">
                      {selectedMedication.status}
                    </span>
                  </div>

                  <span className="text-[12px] text-gray-500">Prescribed By</span>
                  <span className="text-sm text-gray-800">{selectedMedication.prescribedBy}</span>
                </div>

                <div className="border-l border-gray-100 pl-8">
                  <p className="text-sm font-semibold text-gray-700 mb-3">Instructions for Care Team / Parents</p>
                  <div className="text-sm text-gray-600 leading-snug">
                    {selectedMedication.instructions ? (
                      <p>{selectedMedication.instructions}</p>
                    ) : (
                      <p className="text-gray-400">No instructions provided.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Row 2: Reports & Documents */}
              <div className="mb-8 pt-6 border-t border-gray-100">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Reports & Documents</h3>
                <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
                  {documents.map((doc, index) => (
                    <div key={index} className="w-40 shrink-0 border border-orange-200 rounded-xl p-4 flex flex-col justify-end h-40">
                      <p className="font-bold text-gray-800 text-sm mb-1">{doc.name}</p>
                      <p className="text-xs text-gray-500 mb-0.5">{doc.date}</p>
                      <p className="text-xs text-gray-500">{doc.size}</p>
                    </div>
                  ))}

                  <div className="w-40 shrink-0 border border-dashed rounded-xl p-4 flex flex-col items-center justify-center h-40 text-[12px] text-gray-500">
                    <DownloadIcon className="w-4 h-4 mb-2" />
                    <span>Upload More</span>
                  </div>
                </div>
              </div>

              {/* Row 3: Medication History */}
              <div className="pt-6 border-t border-gray-100">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Medication History</h3>
                <div className="relative pt-2 pl-1">
                  <div className="absolute left-[8px] top-4 bottom-4 w-px bg-gray-200" />
                  <div className="absolute left-[176px] top-4 bottom-4 w-px bg-gray-200" />

                  {historyItems.map((item, index) => (
                    <div key={index} className="flex items-center gap-8 mb-6 relative z-10">
                      <div className={`w-2 h-2 rounded-full ${item.dot} ring-4 ring-white shrink-0`} />
                      <div className="w-24 text-sm text-[#64748b] shrink-0">{item.date}</div>
                      <div className={`w-2 h-2 rounded-full ${item.dot} ring-4 ring-white shrink-0`} />
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <p className="text-sm text-[#334155]">{item.event}</p>
                        <p className="text-xs text-[#64748b]">{item.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </CustomModal>

      {/* Add Medication Modal */}
      <CustomModal
        isOpen={isAddMedicationOpen}
        onClose={handleCloseAddMedicationModal}
        title={editingMedication ? "Edit Medication" : "Add Medication"}
        bodyHeader={
          <div className="mb-3 px-0">
            <h4 className="text-sm font-semibold text-gray-900">Medication Information</h4>
          </div>
        }
        fields={addMedicationFields}
        onSubmit={handleAddMedicationSubmit}
        initialValues={editingMedication ? {
          medicationName: editingMedication.name,
          category: editingMedication.category,
          dose: editingMedication.dose.split(" ")[0] ?? "",
          unit: editingMedication.dose.split(" ")[1] ?? "mg",
          frequency: editingMedication.frequency === "Once daily - evening" ? "once-daily-eve" : "once-daily",
          administrationTime: "morning",
          startDate: editingMedication.start,
          reviewDue: editingMedication.reviewDue,
          prescribedBy: editingMedication.prescribedBy,
          status: editingMedication.status,
          instructions: editingMedication.instructions ?? "",
        } : undefined}
        submitText={editingMedication ? "Update Medication" : "Save Medication"}
        cancelText="Cancel"
        size="lg"
        footerAlign="center"
        overlayBlur={false}
        modalClassName="!w-[78vw] !max-w-[980px] !max-h-[78vh] !rounded-[10px] !bg-white !p-0 !shadow-[0_16px_40px_rgba(0,0,0,0.18)]"
      >
        <div className="pt-1 pb-3">
          <div className="mb-1.5">
            <label className="block text-xs font-bold text-black">
              Attach Reports / Documents
            </label>
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="flex h-[76px] w-full items-center justify-center rounded-[10px] border border-dashed border-gray-300 bg-gray-50/60 px-4 text-center text-[12px] text-gray-500 transition-colors hover:border-brand-400 hover:bg-blue-50/40"
          >
            <div className="flex items-center justify-center gap-2 leading-none">
              <DownloadIcon className="h-4 w-4 shrink-0" />
              <span>
                Drag & drop or <span className="font-medium text-blue-600">browse files</span> Jpeg, Png
              </span>
            </div>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.pdf"
            multiple
            className="hidden"
            onChange={handleFileInputChange}
          />
          {uploadError && <p className="mt-2 text-xs text-red-600">{uploadError}</p>}
          {selectedFiles.length > 0 && (
            <div className="mt-3 space-y-2">
              {selectedFiles.map((file) => (
                <div key={getFileKey(file)} className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-700">{file.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(file)}
                    className="ml-3 text-sm text-gray-400 transition-colors hover:text-red-500"
                    aria-label={`Remove ${file.name}`}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </CustomModal>

      <CustomModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedMedication(null);
        }}
        title="Delete Medication"
        showOverlay
        backdropBlur={false}
        maxWidth="max-w-[480px]"
        padding="px-8 py-6"
        showCloseIcon
        customFooter={
          <div className="flex w-full items-center justify-end gap-3 border-t border-gray-100 px-8 py-5">
            <button
              type="button"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setSelectedMedication(null);
              }}
              className="cursor-pointer rounded-lg bg-gray-100 px-6 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDeleteMedication}
              disabled={isDeletingMedication}
              className="cursor-pointer rounded-lg bg-red-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isDeletingMedication ? "Deleting..." : "Delete"}
            </button>
          </div>
        }
      >
        <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
          Are you sure you want to delete this medication? This action cannot be undone.
        </p>
        {selectedMedication && (
          <p className="mt-3 text-sm font-semibold text-gray-800">
            Medication: {selectedMedication.name}
          </p>
        )}
      </CustomModal>
    </>
  );
}
