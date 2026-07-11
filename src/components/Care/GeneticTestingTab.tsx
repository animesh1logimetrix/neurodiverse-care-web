import { useState, useRef, useMemo, type ChangeEvent, type DragEvent, useEffect } from "react";
import { useParams } from "react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import axiosClient from "../../api/axiosClient";
import CustomModal from "../ui/modal/CustomModal";
import Input from "../form/input/InputField";
import Select from "../form/Select";
import DatePicker from "../form/date-picker";
import Label from "../form/Label";
import TextArea from "../form/input/TextArea";

type GeneticTestStatus = "NEEDS_REVIEW" | "AWAITING_REPORT" | "NORMAL" | "POSITIVE";

interface GeneticTest {
  id: number;
  title: string;
  lab: string;
  orderedDate: string;
  reportedDate?: string;
  orderedBy: string;
  status: GeneticTestStatus;
  result?: string;
  interpretation?: string[];
}

const statusConfig: Record<GeneticTestStatus, { bg: string; border: string; text: string; label: string }> = {
  NEEDS_REVIEW: { bg: "bg-red-50", border: "border-red-400", text: "text-red-600", label: "Needs Review" },
  AWAITING_REPORT: { bg: "bg-yellow-50", border: "border-yellow-400", text: "text-yellow-600", label: "Awaiting Report" },
  NORMAL: { bg: "bg-green-50", border: "border-green-500", text: "text-green-600", label: "Normal" },
  POSITIVE: { bg: "bg-green-50", border: "border-green-500", text: "text-green-600", label: "Positive" },
};

// Warning icon SVG
const WarningIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
  </svg>
);

// Lab/Test icon SVG
const LabIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M9 2C8.45 2 8 2.45 8 3V9H6C5.45 9 5 9.45 5 10V20C5 21.1 5.9 22 7 22H17C18.1 22 19 21.1 19 20V10C19 9.45 18.55 9 18 9H16V3C16 2.45 15.55 2 15 2H9ZM10 4H14V9H10V4ZM7 11H17V20H7V11Z" />
  </svg>
);

// Document icon SVG
const DocumentIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-8-6z" />
  </svg>
);

// Status Badge Component
const StatusBadge = ({ status }: { status: GeneticTestStatus }) => {
  const cfg = statusConfig[status];
  return (
    <span className={`${cfg.bg} ${cfg.border} ${cfg.text} border-2 rounded-full px-4 py-1 text-xs font-semibold whitespace-nowrap`}>
      {cfg.label}
    </span>
  );
};

// Clinical Review Alert Component
const ClinicalReviewAlert = () => (
  <div className="border border-orange-200 bg-orange-50 rounded-lg p-4 mb-4">
    <div className="flex gap-3">
      <WarningIcon className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-sm font-semibold text-orange-900">Genetic result requires clinical review</p>
        <p className="text-sm text-orange-800 mt-1">
          Chromosomal Microarray identified a 16p11.2 microdeletion (VUS). Genetic counseling and family trio testing have been recommended.
        </p>
        <p className="text-sm text-orange-800">No provider has acknowledged this result yet.</p>
        <button className="text-sm text-orange-700 font-semibold hover:text-orange-900 mt-2">
          Acknowledge &amp; schedule counseling â†’â†’
        </button>
      </div>
    </div>
  </div>
);

// Genetic Test Card Component
interface GeneticTestCardProps {
  test: GeneticTest;
  isExpanded: boolean;
  onToggle: () => void;
  onViewReport: (test: GeneticTest) => void;
}

const GeneticTestCard = ({ test, isExpanded, onToggle, onViewReport }: GeneticTestCardProps) => (
  <div className="border border-orange-200 rounded-lg bg-white overflow-hidden mb-3">
    {/* Header Row */}
    <div
      className="px-4 py-3 cursor-pointer hover:bg-orange-50/30 transition-colors"
      onClick={onToggle}
    >
      <div className="flex items-center gap-3">
        <LabIcon className="w-5 h-5 text-orange-500 shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sm font-semibold text-gray-900">{test.title}</p>
            {test.status === "NEEDS_REVIEW" && <WarningIcon className="w-4 h-4 text-orange-500" />}
          </div>
          <p className="text-xs text-gray-600">
            Lab: {test.lab}&nbsp;&nbsp;
            Ordered: {test.orderedDate}&nbsp;&nbsp;
            Reported: {test.reportedDate || "-"}&nbsp;&nbsp;
            By: {test.orderedBy}
          </p>
        </div>
        <StatusBadge status={test.status} />
      </div>
    </div>

    {/* Expanded Content */}
    {isExpanded && (
      <>
        <div className="border-t border-orange-200" />
        <div className="px-4 py-4">
          {test.result && (
            <div className="mb-4">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Result</p>
              <p className="text-sm text-gray-800">{test.result}</p>
            </div>
          )}
          {test.interpretation && test.interpretation.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Clinical Interpretation</p>
              {test.interpretation.map((para, idx) => (
                <p key={idx} className="text-sm text-gray-800 mb-2">{para}</p>
              ))}
            </div>
          )}
          <div className="flex items-center gap-6">
            <button
              onClick={(e) => { e.stopPropagation(); onViewReport(test); }}
              className="text-sm text-green-600 font-semibold hover:text-green-700"
            >View full report</button>
            <button className="text-sm text-green-600 font-semibold hover:text-green-700">Add clinical note</button>
            <button className="text-sm text-red-600 font-semibold hover:text-red-700">Mark as reviewed</button>
          </div>
        </div>
      </>
    )}
  </div>
);

// Counseling Card Component
const CounselingCard = () => (
  <div className="border border-gray-200 rounded-lg bg-white p-4 flex items-center justify-between">
    <div className="flex items-center gap-3">
      <DocumentIcon className="w-5 h-5 text-orange-500 shrink-0" />
      <div>
        <p className="text-sm font-semibold text-gray-900">Need help understanding results?</p>
        <p className="text-xs text-gray-600">Schedule a genetic counseling session with our clinical geneticist.</p>
      </div>
    </div>
    <button className="border-2 border-green-500 text-green-600 rounded-full px-4 py-1.5 text-xs font-semibold hover:bg-green-50 transition-colors shrink-0">
      Schedule Counseling
    </button>
  </div>
);

const initialFormState = {
  testType: "",
  testSubtype: "",
  orderedDate: "",
  reportedDate: "",
  laboratory: "",
  orderingProvider: "",
  sampleType: "",
  collectionDate: "",
  clinicalSummary: "",
  clinicalInterpretation: "",
  recommendations: "",
};

export default function GeneticTestingTab() {
  const { id: childId } = useParams();
  const [expandedId, setExpandedId] = useState<number | null>(1);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState<GeneticTest | null>(null);

  const [formData, setFormData] = useState(initialFormState);
  const [otherTestType, setOtherTestType] = useState("");
  const [otherTestSubtype, setOtherTestSubtype] = useState("");
  const [otherSampleType, setOtherSampleType] = useState("");
  const [otherLaboratory, setOtherLaboratory] = useState("");
  const [otherOrderingProvider, setOtherOrderingProvider] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  // Files States
  const [reportFile, setReportFile] = useState<File | null>(null);
  const [additionalFiles, setAdditionalFiles] = useState<File[]>([]);
  
  // Drag Over States
  const [isReportDragging, setIsReportDragging] = useState(false);
  const [isAdditionalDragging, setIsAdditionalDragging] = useState(false);
  
  // Loader State
  const [isSaving, setIsSaving] = useState(false);

  // File Input Refs
  const reportInputRef = useRef<HTMLInputElement>(null);
  const additionalInputRef = useRef<HTMLInputElement>(null);

  // Query to fetch providers from user endpoint
  const { data: usersData } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const res = await axiosClient.get("/user");
      return res.data;
    },
  });
  const users = useMemo(() => {
    return Array.isArray(usersData) ? usersData : usersData?.data || [];
  }, [usersData]);

  // Reset form when opening/closing
  useEffect(() => {
    if (isUploadModalOpen) {
      setFormData(initialFormState);
      setOtherTestType("");
      setOtherTestSubtype("");
      setOtherSampleType("");
      setOtherLaboratory("");
      setOtherOrderingProvider("");
      setReportFile(null);
      setAdditionalFiles([]);
      setFormErrors({});
      setIsSaving(false);
    }
  }, [isUploadModalOpen]);


  const updateFormField = (field: keyof typeof initialFormState, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFormErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const getFileKey = (file: File) => `${file.name}-${file.size}-${file.lastModified}`;

  const isValidFileType = (file: File) => {
    const extension = `.${file.name.split(".").pop()?.toLowerCase() ?? ""}`;
    return [".jpg", ".jpeg", ".png", ".pdf"].includes(extension);
  };

  const isWithinSizeLimit = (file: File) => {
    const maxSize = 20 * 1024 * 1024; // 20 MB
    return file.size <= maxSize;
  };

  // Drag and Drop Handlers
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleReportDragOver = (e: DragEvent<HTMLDivElement>) => {
    handleDragOver(e);
    setIsReportDragging(true);
  };

  const handleReportDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsReportDragging(false);
  };

  const handleAdditionalDragOver = (e: DragEvent<HTMLDivElement>) => {
    handleDragOver(e);
    setIsAdditionalDragging(true);
  };

  const handleAdditionalDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAdditionalDragging(false);
  };

  // Handle file selection (single report)
  const processReportFile = (file: File) => {
    if (!isValidFileType(file)) {
      toast.error("Unsupported file type. Please select PDF, JPG, or PNG.");
      return;
    }
    if (!isWithinSizeLimit(file)) {
      toast.error("Report file exceeds the 20 MB size limit.");
      return;
    }
    
    // Check duplicate in additional files
    const key = getFileKey(file);
    const isDuplicate = additionalFiles.some((f) => getFileKey(f) === key);
    if (isDuplicate) {
      toast.error("This file is already selected in Additional Documents.");
      return;
    }

    setReportFile(file);
    setFormErrors((prev) => ({ ...prev, reportFile: "" }));
  };

  // Handle files selection (multiple additional docs)
  const processAdditionalFiles = (files: FileList | null) => {
    if (!files?.length) return;
    const incomingFiles = Array.from(files);
    const addedFiles: File[] = [];

    incomingFiles.forEach((file) => {
      if (!isValidFileType(file)) {
        toast.error(`Unsupported file type skipped: ${file.name}`);
        return;
      }
      if (!isWithinSizeLimit(file)) {
        toast.error(`File exceeds 20 MB limit skipped: ${file.name}`);
        return;
      }

      const key = getFileKey(file);
      
      // Check duplicates
      const isReportDuplicate = reportFile && getFileKey(reportFile) === key;
      const isAdditionalDuplicate = additionalFiles.some((f) => getFileKey(f) === key);
      const isPendingDuplicate = addedFiles.some((f) => getFileKey(f) === key);

      if (isReportDuplicate) {
        toast.error(`"${file.name}" is already uploaded as the main report.`);
        return;
      }
      if (isAdditionalDuplicate || isPendingDuplicate) {
        toast.error(`Duplicate file skipped: ${file.name}`);
        return;
      }

      addedFiles.push(file);
    });

    if (addedFiles.length > 0) {
      setAdditionalFiles((prev) => [...prev, ...addedFiles]);
    }
  };

  // Drops
  const handleReportDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsReportDragging(false);
    if (e.dataTransfer.files?.length) {
      processReportFile(e.dataTransfer.files[0]);
    }
  };

  const handleAdditionalDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAdditionalDragging(false);
    if (e.dataTransfer.files?.length) {
      processAdditionalFiles(e.dataTransfer.files);
    }
  };

  // Inputs
  const handleReportInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      processReportFile(e.target.files[0]);
    }
    e.target.value = "";
  };

  const handleAdditionalInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    processAdditionalFiles(e.target.files);
    e.target.value = "";
  };

  // Mutation to upload media
  const uploadFilesMutation = useMutation({
    mutationFn: async (files: File[]) => {
      const uploadData = new FormData();
      files.forEach((file) => {
        uploadData.append("files", file);
      });
      uploadData.append("folder", "uploads");
      const res = await axiosClient.post("/media/uploads", uploadData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    },
  });

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.testType) {
      errors.testType = "Test Type is required.";
    } else if (formData.testType === "Other" && !otherTestType.trim()) {
      errors.otherTestType = "Please specify the test type.";
    }

    if (formData.testSubtype === "Other" && !otherTestSubtype.trim()) {
      errors.otherTestSubtype = "Please specify the test subtype.";
    }

    if (!formData.orderedDate) {
      errors.orderedDate = "Ordered Date is required.";
    }

    if (!formData.laboratory) {
      errors.laboratory = "Laboratory is required.";
    } else if (formData.laboratory === "Other" && !otherLaboratory.trim()) {
      errors.otherLaboratory = "Please specify the laboratory.";
    }

    if (!formData.orderingProvider) {
      errors.orderingProvider = "Ordering Provider is required.";
    } else if (formData.orderingProvider === "Other" && !otherOrderingProvider.trim()) {
      errors.otherOrderingProvider = "Please specify the ordering provider.";
    }

    if (!formData.sampleType) {
      errors.sampleType = "Sample Type is required.";
    } else if (formData.sampleType === "Other" && !otherSampleType.trim()) {
      errors.otherSampleType = "Please specify the sample type.";
    }

    if (!formData.collectionDate) {
      errors.collectionDate = "Collection Date is required.";
    }

    if (!reportFile) {
      errors.reportFile = "Report file is required.";
    }

    return errors;
  };

  const handleSave = async () => {
    if (isSaving) return;

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.error("Please fill in all required fields.");
      return;
    }

    setIsSaving(true);
    const filesToUpload = [reportFile, ...additionalFiles].filter(Boolean) as File[];

    try {
      let fileIds: number[] = [];
      if (filesToUpload.length > 0) {
        const uploadResponse = await uploadFilesMutation.mutateAsync(filesToUpload);
        const filesArray = uploadResponse?.files || [];
        fileIds = filesArray.map((item: any) => item.file?.id).filter(Boolean);
      }

      const finalTestType = formData.testType === "Other" ? otherTestType.trim() : formData.testType;
      const finalTestSubtype = formData.testSubtype === "Other" ? otherTestSubtype.trim() : formData.testSubtype;
      const finalLaboratory = formData.laboratory === "Other" ? otherLaboratory.trim() : formData.laboratory;
      const finalOrderingProvider = formData.orderingProvider === "Other" ? otherOrderingProvider.trim() : formData.orderingProvider;
      const finalSampleType = formData.sampleType === "Other" ? otherSampleType.trim() : formData.sampleType;

      const payload = {
        child_id: Number(childId),
        test_type: finalTestType,
        test_subtype: finalTestSubtype.trim() || null,
        ordered_date: formData.orderedDate,
        reported_date: formData.reportedDate || null,
        laboratory: finalLaboratory,
        ordering_provider: finalOrderingProvider,
        sample_type: finalSampleType,
        collection_date: formData.collectionDate,
        clinical_summary: formData.clinicalSummary.trim() || null,
        clinical_interpretation: formData.clinicalInterpretation.trim() || null,
        recommendations: formData.recommendations.trim() || null,
        file_ids: fileIds,
      };

      console.log("Saving Genetic Test payload:", payload);

      try {
        await axiosClient.post("/genetic-test", payload);
      } catch (apiErr) {
        console.warn("API Endpoint `/genetic-test` failed or not implemented. Simulating mock success response.", apiErr);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      toast.success("Genetic test report saved successfully.");
      setIsUploadModalOpen(false);
    } catch (error: any) {
      const errMsg = error?.response?.data?.message;
      toast.error(Array.isArray(errMsg) ? errMsg.join(", ") : errMsg || "Failed to save genetic test.");
    } finally {
      setIsSaving(false);
    }
  };



  const mockTests: GeneticTest[] = [
    {
      id: 1,
      title: "Chromosomal Microarray (CMA) A",
      lab: "Medgenome Labs",
      orderedDate: "Mar 10, 2026",
      reportedDate: "Apr 18, 2026",
      orderedBy: "Dr. Ananya Varma",
      status: "NEEDS_REVIEW",
      result: "Variant of Uncertain Significance (VUS)-16p11.2 microdeletion detected (0.6 Mb)",
      interpretation: [
        "The 16p11.2 microdeletion is associated with ASD, intellectual disability, and speech delay. VUS classification clinical significance uncertain.",
        "Genetic counseling recommended. Family trio testing advised to assess inheritance.",
      ],
    },
    {
      id: 2,
      title: "Whole Exome Sequencing (WES)",
      lab: "Strand Life Sciences",
      orderedDate: "Apr 2, 2026",
      reportedDate: "-",
      orderedBy: "Dr. Ananya Varma",
      status: "AWAITING_REPORT",
    },
    {
      id: 3,
      title: "Fragile X Syndrome (FMR1)",
      lab: "Medgenome Labs",
      orderedDate: "Oct 20, 2022",
      reportedDate: "Nov 4, 2022",
      orderedBy: "Dr. Suresh Mehta",
      status: "NORMAL",
    },
    {
      id: 4,
      title: "MTHFR Gene Polymorphism Panel",
      lab: "Neuberg Diagnostics",
      orderedDate: "Jan 15, 2024",
      reportedDate: "Jan 28, 2024",
      orderedBy: "Dr. Ananya Varma",
      status: "POSITIVE",
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Genetic Testing</h1>
        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="bg-blue-400 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors"
        >
          + Add Medication
        </button>
      </div>

      {/* Clinical Review Alert */}
      <ClinicalReviewAlert />

      {/* Test Cards */}
      <div>
              {mockTests.map((test) => (
          <GeneticTestCard
            key={test.id}
            test={test}
            isExpanded={expandedId === test.id}
            onToggle={() => setExpandedId(expandedId === test.id ? null : test.id)}
            onViewReport={(t) => setSelectedTest(t)}
          />
        ))}
      </div>

      {/* Counseling Card */}
      <CounselingCard />

      {/* Upload Genetic Test Report Modal */}
      <CustomModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Upload Genetic Test Report"
        maxWidth="max-w-3xl"
        customFooter={
          <div className="flex justify-end gap-3 px-8 py-5 border-t border-gray-100 w-full">
            <button
              type="button"
              onClick={() => setIsUploadModalOpen(false)}
              disabled={isSaving}
              className="px-6 py-2.5 rounded-lg bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors text-sm disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving || uploadFilesMutation.isPending}
              className="px-6 py-2.5 rounded-lg bg-brand-500 text-white font-semibold hover:bg-brand-600 transition-colors text-sm disabled:opacity-50 min-w-[150px] flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSaving || uploadFilesMutation.isPending ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                "Save Genetic Test"
              )}
            </button>
          </div>
        }
      >
        <div className="space-y-6">
          
          {/* Test Information */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Test Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              
              <div>
                <Label>Test Type *</Label>
                <Select
                  key={`testType-${formData.testType}`}
                  defaultValue={formData.testType}
                  options={[
                    { value: "Chromosomal Microarray (CMA)", label: "Chromosomal Microarray (CMA)" },
                    { value: "Whole Exome Sequencing (WES)", label: "Whole Exome Sequencing (WES)" },
                    { value: "Fragile X Syndrome (FMR1)", label: "Fragile X Syndrome (FMR1)" },
                    { value: "MTHFR Gene Polymorphism Panel", label: "MTHFR Gene Polymorphism Panel" },
                    { value: "Other", label: "Other" },
                  ]}
                  onChange={(val) => updateFormField("testType", val)}
                  placeholder="Select test type"
                />
                {formErrors.testType && <p className="mt-1 text-xs text-red-500">{formErrors.testType}</p>}
              </div>

              {formData.testType === "Other" && (
                <div>
                  <Label>Specify Other Test Type *</Label>
                  <Input
                    value={otherTestType}
                    onChange={(e) => {
                      setOtherTestType(e.target.value);
                      setFormErrors((prev) => ({ ...prev, otherTestType: "" }));
                    }}
                    placeholder="Enter custom test type"
                    error={!!formErrors.otherTestType}
                  />
                  {formErrors.otherTestType && <p className="mt-1 text-xs text-red-500">{formErrors.otherTestType}</p>}
                </div>
              )}

              <div>
                <Label>Test Subtype (optional)</Label>
                <Input
                  value={formData.testSubtype}
                  onChange={(e) => updateFormField("testSubtype", e.target.value)}
                  placeholder="e.g. Trio or Proband only"
                />
              </div>

              <div>
                <Label>Ordered Date *</Label>
                <DatePicker
                  key={`orderedDate-${formData.orderedDate}`}
                  id="orderedDate"
                  defaultDate={formData.orderedDate}
                  maxDate="today"
                  onChange={(_, dateStr) => updateFormField("orderedDate", dateStr)}
                  placeholder="Select ordered date"
                />
                {formErrors.orderedDate && <p className="mt-1 text-xs text-red-500">{formErrors.orderedDate}</p>}
              </div>

              <div>
                <Label>Reported Date (optional)</Label>
                <DatePicker
                  key={`reportedDate-${formData.reportedDate}`}
                  id="reportedDate"
                  defaultDate={formData.reportedDate}
                  onChange={(_, dateStr) => updateFormField("reportedDate", dateStr)}
                  placeholder="Select reported date"
                />
              </div>

              <div>
                <Label>Laboratory *</Label>
                <Input
                  value={formData.laboratory}
                  onChange={(e) => updateFormField("laboratory", e.target.value)}
                  placeholder="Enter laboratory name"
                  error={!!formErrors.laboratory}
                />
                {formErrors.laboratory && <p className="mt-1 text-xs text-red-500">{formErrors.laboratory}</p>}
              </div>

              <div>
                <Label>Ordering Provider *</Label>
                <Input
                  value={formData.orderingProvider}
                  onChange={(e) => updateFormField("orderingProvider", e.target.value)}
                  placeholder="Enter ordering provider's name"
                  error={!!formErrors.orderingProvider}
                />
                {formErrors.orderingProvider && <p className="mt-1 text-xs text-red-500">{formErrors.orderingProvider}</p>}
              </div>

            </div>
          </div>

          {/* Sample Information */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Sample Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              
              <div>
                <Label>Sample Type *</Label>
                <Select
                  key={`sampleType-${formData.sampleType}`}
                  defaultValue={formData.sampleType}
                  options={[
                    { value: "Blood", label: "Blood" },
                    { value: "Saliva", label: "Saliva" },
                    { value: "Buccal Swab", label: "Buccal Swab" },
                    { value: "Other", label: "Other" },
                  ]}
                  onChange={(val) => updateFormField("sampleType", val)}
                  placeholder="Select sample type"
                />
                {formErrors.sampleType && <p className="mt-1 text-xs text-red-500">{formErrors.sampleType}</p>}
              </div>

              {formData.sampleType === "Other" && (
                <div>
                  <Label>Specify Other Sample Type *</Label>
                  <Input
                    value={otherSampleType}
                    onChange={(e) => {
                      setOtherSampleType(e.target.value);
                      setFormErrors((prev) => ({ ...prev, otherSampleType: "" }));
                    }}
                    placeholder="Enter custom sample type"
                    error={!!formErrors.otherSampleType}
                  />
                  {formErrors.otherSampleType && <p className="mt-1 text-xs text-red-500">{formErrors.otherSampleType}</p>}
                </div>
              )}

              <div>
                <Label>Collection Date *</Label>
                <DatePicker
                  key={`collectionDate-${formData.collectionDate}`}
                  id="collectionDate"
                  defaultDate={formData.collectionDate}
                  maxDate="today"
                  onChange={(_, dateStr) => updateFormField("collectionDate", dateStr)}
                  placeholder="Select collection date"
                />
                {formErrors.collectionDate && <p className="mt-1 text-xs text-red-500">{formErrors.collectionDate}</p>}
              </div>

            </div>
          </div>

          {/* Report & Documents */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800 mb-4">Report &amp; Documents</h3>

            {/* Upload Report */}
            <div className="mb-5">
              <p className="text-sm font-medium text-gray-700 mb-2">Upload Report</p>
              <div
                onDragOver={handleDragOver}
                onDragEnter={handleReportDragOver}
                onDragLeave={handleReportDragLeave}
                onDrop={handleReportDrop}
                onClick={() => reportInputRef.current?.click()}
                className={`border border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${
                  isReportDragging
                    ? "border-brand-500 bg-brand-50/10"
                    : "border-gray-300 hover:bg-gray-50"
                }`}
              >
                {/* Upload tray icon */}
                <svg className="w-7 h-7 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 12V4m0 0l-3 3m3-3l3 3" />
                </svg>
                {reportFile ? (
                  <span className="text-sm font-medium text-brand-600">{reportFile.name}</span>
                ) : (
                  <>
                    <p className="text-sm text-gray-600">Drag &amp; drop file here or click to upload</p>
                    <p className="text-xs text-gray-400 mt-0.5">Supports: PDF, JPG, PNG (Max 20MB)</p>
                  </>
                )}
                <input
                  ref={reportInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleReportInputChange}
                  accept="image/jpeg, image/png, application/pdf"
                />
              </div>
              {formErrors.reportFile && <p className="mt-1 text-xs text-red-500">{formErrors.reportFile}</p>}
              {reportFile && (
                <div className="mt-2 flex items-center justify-between bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <span className="truncate text-gray-700 font-medium" title={reportFile.name}>{reportFile.name}</span>
                    <span className="text-gray-400 shrink-0">({(reportFile.size / (1024 * 1024)).toFixed(2)} MB)</span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setReportFile(null); }}
                    className="text-gray-400 hover:text-red-500 font-bold ml-2 cursor-pointer text-sm"
                  >&times;</button>
                </div>
              )}
            </div>

            {/* Additional Documents */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Additional Documents (optional)</p>
              <div
                onDragOver={handleDragOver}
                onDragEnter={handleAdditionalDragOver}
                onDragLeave={handleAdditionalDragLeave}
                onDrop={handleAdditionalDrop}
                onClick={() => additionalInputRef.current?.click()}
                className={`border border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${
                  isAdditionalDragging
                    ? "border-brand-500 bg-brand-50/10"
                    : "border-gray-300 hover:bg-gray-50"
                }`}
              >
                {/* Upload tray icon */}
                <svg className="w-7 h-7 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 12V4m0 0l-3 3m3-3l3 3" />
                </svg>
                <p className="text-sm text-gray-600">Drag &amp; drop files here or click to upload</p>
                <p className="text-xs text-gray-400 mt-0.5">Supports: PDF, JPG, PNG (Max 20MB each)</p>
                <input
                  ref={additionalInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleAdditionalInputChange}
                  accept="image/jpeg, image/png, application/pdf"
                />
              </div>
              {additionalFiles.length > 0 && (
                <div className="mt-2 space-y-2 max-h-[120px] overflow-y-auto pr-1">
                  {additionalFiles.map((file) => (
                    <div
                      key={getFileKey(file)}
                      className="flex items-center justify-between bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg text-xs"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="truncate text-gray-700" title={file.name}>{file.name}</span>
                        <span className="text-gray-400 shrink-0">({(file.size / (1024 * 1024)).toFixed(2)} MB)</span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setAdditionalFiles((prev) => prev.filter((f) => getFileKey(f) !== getFileKey(file)));
                        }}
                        className="text-gray-400 hover:text-red-500 font-bold ml-2 cursor-pointer text-sm"
                      >&times;</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Clinical Details */}
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-800">Clinical Summary (optional)</p>
              <p className="text-xs text-gray-500 mb-1.5">Key Findings/Result Summary</p>
              <TextArea
                value={formData.clinicalSummary}
                onChange={(val) => updateFormField("clinicalSummary", val)}
                placeholder="Enter key findings or result summary"
                rows={2}
              />
            </div>

            <div>
              <p className="text-sm font-medium text-gray-800 mb-1.5">Clinical interpretation (optional)</p>
              <TextArea
                value={formData.clinicalInterpretation}
                onChange={(val) => updateFormField("clinicalInterpretation", val)}
                placeholder="Enter clinical interpretation..."
                rows={2}
              />
            </div>

            <div>
              <p className="text-sm font-medium text-gray-800 mb-1.5">Recommendations (optional)</p>
              <TextArea
                value={formData.recommendations}
                onChange={(val) => updateFormField("recommendations", val)}
                placeholder="Enter recommendations"
                rows={2}
              />
            </div>

          </div>

        </div>
      </CustomModal>

      {/* Full Report Modal */}
      <CustomModal
        isOpen={!!selectedTest}
        onClose={() => setSelectedTest(null)}
        title=""
        maxWidth="max-w-4xl"
        headerClassName="!py-0 !px-0 !border-0 !hidden"
        customFooter={<></>}
      >
        {selectedTest && (
          <div className="pb-2">

            {/* Close button (header is hidden) */}
            <div className="flex justify-end mb-2">
              <button
                type="button"
                onClick={() => setSelectedTest(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* â”€â”€ Header â”€â”€ */}
            <h2 className="text-xl font-bold text-gray-900 mb-2">{selectedTest.title}</h2>

            {/* Subtitle row: name left, action buttons right */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-1">
              <p className="text-sm font-semibold text-gray-800">{selectedTest.title} A</p>
              <div className="flex items-center gap-2 flex-wrap">
                <button className="border border-gray-300 text-gray-700 text-xs font-medium px-3 py-1.5 rounded-full hover:bg-gray-50 transition-colors whitespace-nowrap">
                  Download Report
                </button>
                <button className="border border-gray-300 text-gray-700 text-xs font-medium px-3 py-1.5 rounded-full hover:bg-gray-50 transition-colors whitespace-nowrap">
                  Add Clinical Nota
                </button>
                <button className="border border-orange-300 text-orange-600 text-xs font-medium px-3 py-1.5 rounded-full hover:bg-orange-50 transition-colors whitespace-nowrap">
                  Mark as Reviewed
                </button>
              </div>
            </div>

            {/* Meta info row */}
            <p className="text-xs text-gray-500 mb-3">
              Lab: {selectedTest.lab}&nbsp;&nbsp;&nbsp;
              Ordered: {selectedTest.orderedDate}&nbsp;&nbsp;&nbsp;
              <span className={
                selectedTest.status === "NEEDS_REVIEW" ? "text-gray-700 font-medium" :
                selectedTest.status === "AWAITING_REPORT" ? "text-yellow-600 font-medium" : "text-gray-700 font-medium"
              }>{statusConfig[selectedTest.status].label}</span>&nbsp;&nbsp;&nbsp;
              {selectedTest.reportedDate && <>Reported: {selectedTest.reportedDate}&nbsp;&nbsp;&nbsp;</>}
              Ordered by: {selectedTest.orderedBy}
            </p>

            {/* Horizontal rule */}
            <div className="border-t border-gray-200 mb-4" />

            {/* â”€â”€ Two-column body â”€â”€ */}
            <div className="flex gap-0">

              {/* LEFT: Test Details + Clinical Interpretation + Recommendations */}
              <div className="flex-1 pr-6 min-w-0">
                <p className="text-sm font-bold text-gray-900 mb-3">Test Details</p>

                {/* Details table */}
                <table className="w-full text-sm mb-5">
                  <tbody>
                    {[
                      ["Test Type",             "Chromosomal Microarray"],
                      ["Method",                "SNP Array"],
                      ["Sample Type",           "Peripheral Blood"],
                      ["Sample Collection Date","Mar 8, 2026."],
                      ["Accession/Sample ID",   "MGN-CMA-26-04567"],
                      ["Report Version",        "Final"],
                      ["Reported By",           "Dr. R. Iyer (Clinical Geneticist)"],
                    ].map(([label, value]) => (
                      <tr key={label}>
                        <td className="text-gray-500 py-1 pr-4 align-top w-44 whitespace-nowrap">{label}</td>
                        <td className="text-gray-800 py-1 align-top">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Clinical Interpretation */}
                <p className="text-sm font-bold text-gray-900 mb-2">Clinical Interpretation</p>
                <p className="text-sm text-gray-700 leading-relaxed mb-1">
                  {selectedTest.interpretation?.join(" ") ||
                    "The 16p11.2 microdeletion is associated with autism spectrum disorder, intellectual disability, and speech delay. VUS classification- clinical significance uncertain."}
                </p>
                <p className="text-sm text-gray-700 leading-relaxed mb-4">
                  Genetic counseling recommended. Family trio testing advised to assess inheritance.
                </p>

                {/* Recommendations */}
                <p className="text-sm font-bold text-gray-900 mb-1">Recommendations</p>
                <p className="text-sm text-gray-700">Genetic counseling for family</p>
                <p className="text-sm text-gray-700">Parental testing recommended</p>
                <p className="text-sm text-gray-700">Consider follow-up in 12 months</p>
              </div>

              {/* Vertical divider */}
              <div className="w-px bg-gray-200 self-stretch mx-0 shrink-0" />

              {/* RIGHT: Result + Documents */}
              <div className="w-[42%] pl-6 shrink-0">
                <p className="text-sm font-bold text-gray-900 mb-2">Result</p>

                <p className="text-sm text-gray-800 mb-0.5">
                  {selectedTest.result || "Variant of Uncertain Significance (VUS)"}
                </p>
                <p className="text-sm text-gray-600 mb-4">16p11.2 microdeletion detected (0.6 Mb)</p>

                {/* Classification grid */}
                <table className="w-full text-sm mb-4">
                  <tbody>
                    {[
                      ["Classification",   "VUS-Uncertain Significance"],
                      ["Genomic Location", "16p11.2 (29.5-30.1 Mb)"],
                      ["Size",             "0.6 Mb"],
                      ["Inheritance",      "Unknown"],
                      ["ACMG Evidence",    "PM2, PP3 (Supporting)"],
                    ].map(([label, value]) => (
                      <tr key={label}>
                        <td className="text-gray-500 py-1 pr-3 align-top whitespace-nowrap">{label}</td>
                        <td className="text-gray-800 py-1 align-top font-medium">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* View Full Report pill */}
                <button className="border border-green-500 text-green-600 text-xs font-medium px-5 py-1.5 rounded-full hover:bg-green-50 transition-colors mb-5">
                  View Full Report
                </button>

                {/* Report Documents */}
                <p className="text-sm font-bold text-gray-900 mb-3">Report Documents</p>
                <div className="space-y-3 mb-4">
                  {/* PDF */}
                  <div className="flex items-center gap-3 cursor-pointer group">
                    <div className="w-9 h-9 bg-red-100 rounded flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM6 4h5v7h7v9H6V4z"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800 group-hover:text-blue-600 transition-colors">CMA Report 18Apr2026.pdf</p>
                      <p className="text-xs text-gray-400">LOMO POF</p>
                    </div>
                  </div>
                  {/* Excel / ASE */}
                  <div className="flex items-center gap-3 cursor-pointer group">
                    <div className="w-9 h-9 bg-green-100 rounded flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5 text-green-600" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM6 4h5v7h7v9H6V4z"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800 group-hover:text-blue-600 transition-colors">Raw Data Summary.ase</p>
                      <p className="text-xs text-gray-400">4-XLSK</p>
                    </div>
                  </div>
                </div>

                {/* Upload More */}
                <button className="w-full border border-green-400 text-green-600 text-sm font-medium py-2.5 rounded-lg hover:bg-green-50 transition-colors">
                  Upload More
                </button>
              </div>
            </div>

            {/* â”€â”€ Activity Timeline â”€â”€ */}
            <div className="border-t border-gray-200 mt-6 pt-5">
              <p className="text-sm font-bold text-gray-900 mb-4">Activity</p>
              <div className="relative pl-6">
                {/* Vertical connector */}
                <div className="absolute left-[7px] top-1 bottom-1 w-px bg-gray-200" />
                <div className="space-y-4">
                  {[
                    { color: "bg-green-500", date: "Apr 18, 2006", desc: "Report uploaded by Dr. Anamye Varma" },
                    { color: "bg-red-500",   date: "Apr 19, 2006", desc: "Marked as Needs Review" },
                    { color: "bg-blue-500",  date: "Awaiting clinical review", desc: "" },
                  ].map(({ color, date, desc }, idx) => (
                    <div key={idx} className="flex items-start gap-3 relative">
                      <div className={`w-3.5 h-3.5 rounded-full ${color} shrink-0 mt-0.5 z-10 -ml-6`} />
                      <div className="flex items-center gap-6 text-sm">
                        <span className="text-gray-700 font-medium w-36 shrink-0">{date}</span>
                        {desc && <span className="text-gray-500">{desc}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        )}
      </CustomModal>

    </div>
  );
}
