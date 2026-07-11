import { useState, useRef, useMemo, type ChangeEvent, type DragEvent, useEffect } from "react";
import { useParams } from "react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import axiosClient from "../../api/axiosClient";
import CustomModal from "../ui/modal/CustomModal";
import Input from "../form/input/InputField";
import Select from "../form/Select";
import DatePicker from "../form/date-picker";
import Label from "../form/Label";
import TextArea from "../form/input/TextArea";

type GeneticTestStatus = "NEEDS_REVIEW" | "AWAITING_REPORT" | "NORMAL" | "POSITIVE" | "REVIEWED" | "NEGATIVE";

interface GeneticTest {
  id: number;
  title: string;
  subtitle: string;
  lab: string;
  orderedDate: string;
  reportedDate?: string;
  orderedBy: string;
  status: GeneticTestStatus;
  result?: string;
  interpretation?: string[];
  recommendations?: string;
  sampleType?: string;
  collectionDate?: string;
  reports?: any[];
}

const statusConfig: Record<GeneticTestStatus, { bg: string; border: string; text: string; label: string }> = {
  NEEDS_REVIEW: { bg: "bg-red-50", border: "border-red-400", text: "text-red-600", label: "Needs Review" },
  AWAITING_REPORT: { bg: "bg-yellow-50", border: "border-yellow-400", text: "text-yellow-600", label: "Awaiting Report" },
  NORMAL: { bg: "bg-green-50", border: "border-green-500", text: "text-green-600", label: "Normal" },
  POSITIVE: { bg: "bg-green-50", border: "border-green-500", text: "text-green-600", label: "Positive" },
  REVIEWED: { bg: "bg-blue-50", border: "border-blue-400", text: "text-blue-600", label: "Reviewed" },
  NEGATIVE: { bg: "bg-gray-50", border: "border-gray-400", text: "text-gray-600", label: "Negative" },
};

// Warning icon SVG
const WarningIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    <path d="M12 9v4" />
    <path d="M12 17h.01" />
  </svg>
);

// Lab/Test icon SVG
const LabIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.55a2.46 2.46 0 0 0 2.15 3.45h10.26a2.46 2.46 0 0 0 2.15-3.45L14.211 10.423A2 2 0 0 1 14 9.527V2" />
    <path d="M8.5 2h7" />
    <path d="M14 16H5.36" />
  </svg>
);

// Document icon SVG
const DocumentIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <line x1="10" y1="9" x2="8" y2="9" />
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
      <WarningIcon className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-700">Genetic result requires clinical review</p>
        <div className="mt-4 space-y-1">
          <p className="text-sm text-gray-600">
            Chromosomal Microarray identified a 16p11.2 microdeletion (VUS). Genetic counseling and family trio testing have been recommended.
          </p>
          <p className="text-sm text-gray-600">No provider has acknowledged this result yet.</p>
        </div>
        <button className="text-sm text-gray-600 font-medium hover:text-gray-900 mt-1 flex items-center gap-1">
          Acknowledge &amp; schedule counseling &rarr;
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
  onAddClinicalNote: (test: GeneticTest) => void;
  onUpdateStatus: (id: number, status: GeneticTestStatus) => void;
  onEdit: (test: GeneticTest) => void;
  onDelete: (id: number) => void;
}

const GeneticTestCard = ({ test, isExpanded, onToggle, onViewReport, onAddClinicalNote, onUpdateStatus, onEdit, onDelete }: GeneticTestCardProps) => (
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
        <div className="flex items-center gap-3">
          <StatusBadge status={test.status} />
          <button 
            onClick={(e) => { e.stopPropagation(); onEdit(test); }}
            className="text-gray-400 hover:text-blue-500 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(test.id); }}
            className="text-gray-400 hover:text-red-500 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
          </button>
        </div>
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
            <button 
              onClick={(e) => { e.stopPropagation(); onAddClinicalNote(test); }}
              className="text-sm text-green-600 font-semibold hover:text-green-700"
            >Add clinical note</button>
            {test.status === "NEEDS_REVIEW" && (
              <button 
                onClick={(e) => { e.stopPropagation(); onUpdateStatus(test.id, "REVIEWED"); }}
                className="text-sm text-red-600 font-semibold hover:text-red-700"
              >Mark as reviewed</button>
            )}
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
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | null>(null);
  const [activeTestId, setActiveTestId] = useState<number | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [testToDelete, setTestToDelete] = useState<number | null>(null);
  const [existingFiles, setExistingFiles] = useState<any[]>([]);
  const [selectedTest, setSelectedTest] = useState<GeneticTest | null>(null);

  const [formData, setFormData] = useState(initialFormState);
  const [otherTestType, setOtherTestType] = useState("");
  const [otherTestSubtype, setOtherTestSubtype] = useState("");
  const [otherSampleType, setOtherSampleType] = useState("");
  const [otherLaboratory, setOtherLaboratory] = useState("");
  const [otherOrderingProvider, setOtherOrderingProvider] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  // Files States
  const [reportFiles, setReportFiles] = useState<File[]>([]);
  
  // Drag Over States
  const [isReportDragging, setIsReportDragging] = useState(false);
  
  // Loader State
  const [isSaving, setIsSaving] = useState(false);

  // File Input Refs
  const reportInputRef = useRef<HTMLInputElement>(null);

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

  // Query to fetch genetic tests
  const { data: geneticTestsData, isLoading: isTestsLoading } = useQuery({
    queryKey: ["genetic-testing", childId],
    queryFn: async () => {
      const res = await axiosClient.get(`/genetic-testing?childId=${childId}`);
      return res.data;
    },
    enabled: !!childId,
  });

  const queryClient = useQueryClient();

  // Create Genetic Test Mutation
  const createTestMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await axiosClient.post("/genetic-testing", payload);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Genetic test report saved successfully.");
      queryClient.invalidateQueries({ queryKey: ["genetic-testing", childId] });
      setIsUploadModalOpen(false);
    },
    onError: (error: any) => {
      const errMsg = error?.response?.data?.message;
      toast.error(Array.isArray(errMsg) ? errMsg.join(", ") : errMsg || "Failed to save genetic test.");
    }
  });

  // Update Genetic Test Mutation
  const updateTestMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: any }) => {
      const res = await axiosClient.patch(`/genetic-testing/${id}`, payload);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Genetic test updated successfully.");
      queryClient.invalidateQueries({ queryKey: ["genetic-testing", childId] });
      setIsNoteModalOpen(false);
      setIsUploadModalOpen(false);
      setNoteForm({ text: "", status: "REVIEWED" });
    },
    onError: (error: any) => {
      const errMsg = error?.response?.data?.message;
      toast.error(Array.isArray(errMsg) ? errMsg.join(", ") : errMsg || "Failed to update genetic test.");
    }
  });

  // Delete Genetic Test Mutation
  const deleteTestMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await axiosClient.delete(`/genetic-testing/${id}`);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Genetic test deleted successfully.");
      queryClient.invalidateQueries({ queryKey: ["genetic-testing", childId] });
      setIsDeleteModalOpen(false);
      setTestToDelete(null);
    },
    onError: (error: any) => {
      const errMsg = error?.response?.data?.message;
      toast.error(Array.isArray(errMsg) ? errMsg.join(", ") : errMsg || "Failed to delete genetic test.");
    }
  });

  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [selectedNoteTest, setSelectedNoteTest] = useState<GeneticTest | null>(null);
  const [noteForm, setNoteForm] = useState({ text: "", status: "REVIEWED" as GeneticTestStatus });

  const handleOpenNoteModal = (test: GeneticTest) => {
    setSelectedNoteTest(test);
    setNoteForm({ text: "", status: test.status || "REVIEWED" });
    setIsNoteModalOpen(true);
  };

  const handleSaveNote = () => {
    if (!selectedNoteTest) return;
    const currentInterpretation = selectedNoteTest.interpretation?.join("\n") || "";
    const newInterpretation = currentInterpretation ? `${currentInterpretation}\n\n${noteForm.text}` : noteForm.text;
    
    updateTestMutation.mutate({
      id: selectedNoteTest.id,
      payload: {
        clinical_interpretation: newInterpretation,
        status: noteForm.status,
      }
    });
  };

  const handleMarkReviewed = (id: number, status: GeneticTestStatus) => {
    updateTestMutation.mutate({
      id,
      payload: { status }
    });
  };

  const handleOpenEditModal = (test: GeneticTest) => {
    setActiveTestId(test.id);
    setModalMode('edit');
    
    // Find the raw test to get original fields
    const rawTests = Array.isArray(geneticTestsData) ? geneticTestsData : geneticTestsData?.data || [];
    const raw = rawTests.find((t: any) => t.id === test.id);
    
    if (raw) {
      setFormData({
        testType: ["Whole Exome Sequencing (WES)", "Whole Genome Sequencing (WGS)", "Chromosomal Microarray (CMA)", "Fragile X Testing", "Targeted Gene Panel"].includes(raw.test_type) ? raw.test_type : "Other",
        testSubtype: ["Neurological Panel", "Autism Panel", "Developmental Delay Panel", "Epilepsy Panel"].includes(raw.test_subtype) ? raw.test_subtype : (raw.test_subtype ? "Other" : ""),
        orderedDate: raw.ordered_date || "",
        reportedDate: raw.reported_date || "",
        laboratory: ["Invitae", "GeneDx", "Fulgent Genetics", "PreventionGenetics", "Centogene"].includes(raw.laboratory) ? raw.laboratory : "Other",
        orderingProvider: raw.ordering_provider_id?.toString() || "",
        sampleType: ["Blood", "Saliva", "Buccal Swab"].includes(raw.sample_type) ? raw.sample_type : (raw.sample_type ? "Other" : ""),
        collectionDate: raw.collection_date || "",
        clinicalSummary: raw.clinical_summary || "",
        clinicalInterpretation: raw.clinical_interpretation || "",
        recommendations: raw.recommendations || "",
      });

      if (!["Whole Exome Sequencing (WES)", "Whole Genome Sequencing (WGS)", "Chromosomal Microarray (CMA)", "Fragile X Testing", "Targeted Gene Panel"].includes(raw.test_type)) {
        setOtherTestType(raw.test_type || "");
      }
      if (!["Neurological Panel", "Autism Panel", "Developmental Delay Panel", "Epilepsy Panel"].includes(raw.test_subtype)) {
        setOtherTestSubtype(raw.test_subtype || "");
      }
      if (!["Invitae", "GeneDx", "Fulgent Genetics", "PreventionGenetics", "Centogene"].includes(raw.laboratory)) {
        setOtherLaboratory(raw.laboratory || "");
      }
      if (!["Blood", "Saliva", "Buccal Swab"].includes(raw.sample_type)) {
        setOtherSampleType(raw.sample_type || "");
      }

      setReportFiles([]);
      setExistingFiles(raw.genetic_test_files || raw.files || raw.reports || []);
    }

    setIsUploadModalOpen(true);
  };

  const handleDeleteTest = (id: number) => {
    setTestToDelete(id);
    setIsDeleteModalOpen(true);
  };

  // Reset form when opening/closing
  useEffect(() => {
    if (isUploadModalOpen) {
      if (modalMode === 'add') {
        setFormData(initialFormState);
        setExistingFiles([]);
      }
      setOtherTestType("");
      setOtherTestSubtype("");
      setOtherSampleType("");
      setOtherLaboratory("");
      setOtherOrderingProvider("");
      setReportFiles([]);
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

  // Handle files selection
  const processReportFiles = (files: FileList | null) => {
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
      const isDuplicate = reportFiles.some((f) => getFileKey(f) === key) || addedFiles.some((f) => getFileKey(f) === key);

      if (isDuplicate) {
        toast.error(`Duplicate file skipped: ${file.name}`);
        return;
      }

      addedFiles.push(file);
    });

    if (addedFiles.length > 0) {
      setReportFiles((prev) => [...prev, ...addedFiles]);
      setFormErrors((prev) => ({ ...prev, reportFiles: "" }));
    }
  };

  // Drops
  const handleReportDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsReportDragging(false);
    if (e.dataTransfer.files?.length) {
      processReportFiles(e.dataTransfer.files);
    }
  };

  // Inputs
  const handleReportInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      processReportFiles(e.target.files);
    }
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

    const parsedProviderId = parseInt(formData.orderingProvider, 10);
    if (!formData.orderingProvider || isNaN(parsedProviderId)) {
      errors.orderingProvider = "Ordering Provider is required and must be valid.";
    }

    if (!formData.sampleType) {
      errors.sampleType = "Sample Type is required.";
    } else if (formData.sampleType === "Other" && !otherSampleType.trim()) {
      errors.otherSampleType = "Please specify the sample type.";
    }

    if (!formData.collectionDate) {
      errors.collectionDate = "Collection Date is required.";
    }

    if (reportFiles.length === 0 && modalMode === 'add' && existingFiles.length === 0) {
      errors.reportFiles = "At least one report file is required.";
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
    const filesToUpload = reportFiles;

    try {
      let fileIds: number[] = existingFiles.map((f: any) => f.id || f.file_id).filter(Boolean);
      
      if (filesToUpload.length > 0) {
        const uploadResponse = await uploadFilesMutation.mutateAsync(filesToUpload);
        const filesArray = uploadResponse?.files || [];
        fileIds = [...fileIds, ...filesArray.map((item: any) => item.file?.id).filter(Boolean)];
      }

      const finalTestType = formData.testType === "Other" ? otherTestType.trim() : formData.testType;
      const finalTestSubtype = formData.testSubtype === "Other" ? otherTestSubtype.trim() : formData.testSubtype;
      const finalLaboratory = formData.laboratory === "Other" ? otherLaboratory.trim() : formData.laboratory;
      const finalSampleType = formData.sampleType === "Other" ? otherSampleType.trim() : formData.sampleType;

      const payload = {
        childId: Number(childId),
        test_type: finalTestType,
        test_subtype: finalTestSubtype.trim() || "",
        ordered_date: formData.orderedDate,
        reported_date: formData.reportedDate || "",
        laboratory: finalLaboratory,
        ordering_provider_id: parseInt(formData.orderingProvider, 10),
        sample_type: finalSampleType,
        collection_date: formData.collectionDate,
        clinical_summary: formData.clinicalSummary.trim() || "",
        clinical_interpretation: formData.clinicalInterpretation.trim() || "",
        recommendations: formData.recommendations.trim() || "",
        status: (reportFiles.length > 0 || existingFiles.length > 0) ? "NEEDS_REVIEW" : "AWAITING_REPORT",
        fileIds: fileIds,
      };

      if (modalMode === 'edit' && activeTestId) {
        if (fileIds.length === 0) {
          delete (payload as any).fileIds;
          delete (payload as any).status;
        }
        await updateTestMutation.mutateAsync({ id: activeTestId, payload });
      } else {
        await createTestMutation.mutateAsync(payload);
      }
    } catch (error: any) {
      console.error("Error saving test:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const parsedTests: GeneticTest[] = useMemo(() => {
    const rawTests = Array.isArray(geneticTestsData) ? geneticTestsData : geneticTestsData?.data || [];
    return rawTests.map((t: any) => ({
      id: t.id,
      title: t.test_type,
      subtitle: t.test_subtype || "",
      lab: t.laboratory,
      orderedDate: t.ordered_date,
      reportedDate: t.reported_date,
      orderedBy: typeof t.ordering_provider === "string" ? t.ordering_provider : (t.ordering_provider?.name || t.orderingProvider?.name || users.find((u: any) => u.id === t.ordering_provider_id)?.name || "Unknown Provider"),
      status: t.status,
      result: t.clinical_summary || t.test_subtype || "",
      interpretation: t.clinical_interpretation ? t.clinical_interpretation.split("\n").filter((p: string) => p.trim()) : [],
      recommendations: t.recommendations,
      sampleType: t.sample_type,
      collectionDate: t.collection_date,
      reports: t.genetic_test_files || t.files || t.reports || [],
    }));
  }, [geneticTestsData, users]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Genetic Testing</h1>
        <button
          onClick={() => { setModalMode('add'); setIsUploadModalOpen(true); }}
          className="bg-[#2D8CFF] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-600 transition-colors shadow-sm flex items-center gap-2"
        >
          + Add Genetic Test
        </button>
      </div>

      {/* Clinical Review Alert */}
      <ClinicalReviewAlert />

      {/* Test Cards */}
      <div>
        {isTestsLoading ? (
          <div className="flex justify-center p-8">
            <svg className="animate-spin h-6 w-6 text-[#60a5fa]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : parsedTests.length === 0 ? (
          <div className="border-2 border-dashed border-gray-200 rounded-lg bg-gray-50 p-8 flex flex-col items-center justify-center text-center mb-4">
            <p className="text-sm font-semibold text-gray-700 mb-1">No Genetic Tests</p>
            <p className="text-xs text-gray-500 max-w-sm">There are no genetic tests recorded for this patient. Click "Add Genetic Test" to record one.</p>
          </div>
        ) : (
          parsedTests.map((test) => (
            <GeneticTestCard
              key={test.id}
              test={test}
              isExpanded={expandedId === test.id}
              onToggle={() => setExpandedId(expandedId === test.id ? null : test.id)}
              onViewReport={(t) => setSelectedTest(t)}
              onAddClinicalNote={handleOpenNoteModal}
              onUpdateStatus={handleMarkReviewed}
              onEdit={handleOpenEditModal}
              onDelete={handleDeleteTest}
            />
          ))
        )}
      </div>

      {/* Counseling Card */}
      <CounselingCard />

      {/* Upload/Edit Genetic Test Report Modal */}
      <CustomModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title={modalMode === 'edit' ? "Edit Genetic Test Report" : "Upload Genetic Test Report"}
        maxWidth="max-w-3xl"
        customFooter={
          <div className="flex justify-center gap-4 px-8 py-5 w-full border-t border-gray-100">
            <button
              type="button"
              onClick={() => setIsUploadModalOpen(false)}
              disabled={isSaving}
              className="px-6 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving || uploadFilesMutation.isPending}
              className="px-6 py-2 bg-[#2D8CFF] text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 min-w-[150px] flex items-center justify-center gap-2 cursor-pointer"
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
            <h3 className="text-gray-800 font-semibold mb-6">Test Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 mb-6">
              
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
                <Select
                  key={`orderingProvider-${formData.orderingProvider}`}
                  defaultValue={formData.orderingProvider}
                  options={users.map((u: any) => ({ value: String(u.id), label: u.name || `User ${u.id}` }))}
                  onChange={(val) => updateFormField("orderingProvider", val)}
                  placeholder="Select provider"
                />
                {formErrors.orderingProvider && <p className="mt-1 text-xs text-red-500">{formErrors.orderingProvider}</p>}
              </div>

            </div>
          </div>

          {/* Sample Information */}
          <div>
            <h3 className="text-gray-800 font-semibold mb-6">Sample Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 mb-6">
              
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
            <h3 className="text-gray-800 font-semibold mb-6">Report &amp; Documents</h3>

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
                <p className="text-sm text-gray-600">Drag &amp; drop files here or click to upload</p>
                <p className="text-xs text-gray-400 mt-0.5">Supports: PDF, JPG, PNG (Max 20MB)</p>
                <input
                  ref={reportInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleReportInputChange}
                  accept="image/jpeg, image/png, application/pdf"
                />
              </div>
              {formErrors.reportFiles && <p className="mt-1 text-xs text-red-500">{formErrors.reportFiles}</p>}
              
              {(reportFiles.length > 0 || existingFiles.length > 0) && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {existingFiles.map((doc: any, idx: number) => (
                    <div key={`exist-${idx}`} className="text-xs bg-gray-100 text-gray-700 border border-gray-200 px-3 py-1.5 rounded-md flex items-center gap-2">
                      <a href={doc.file_url} target="_blank" rel="noreferrer" className="hover:underline">
                        {doc.original_file_name || doc.file_name || `Document ${idx + 1}`}
                      </a>
                      <button 
                        type="button" 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          setExistingFiles(prev => prev.filter((_, i) => i !== idx)); 
                        }} 
                        className="text-gray-400 hover:text-red-500 font-bold ml-1"
                      >
                        X
                      </button>
                    </div>
                  ))}
                  {reportFiles.map((file, idx) => (
                    <div key={`new-${idx}`} className="text-xs bg-gray-100 text-gray-700 border border-gray-200 px-3 py-1.5 rounded-md flex items-center gap-2">
                      <span className="truncate max-w-[200px]" title={file.name}>{file.name}</span>
                      <button 
                        type="button" 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          setReportFiles(prev => prev.filter((_, i) => i !== idx)); 
                        }} 
                        className="text-gray-400 hover:text-red-500 font-bold ml-1"
                      >
                        X
                      </button>
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

      {/* Delete Confirmation Modal */}
      <CustomModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Genetic Test"
        maxWidth="max-w-md"
        customFooter={
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
              disabled={deleteTestMutation.isPending}
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (testToDelete) deleteTestMutation.mutate(testToDelete);
              }}
              className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
              disabled={deleteTestMutation.isPending}
            >
              {deleteTestMutation.isPending ? "Deleting..." : "Delete Test"}
            </button>
          </div>
        }
      >
        <div className="p-2">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center shrink-0">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Confirm Deletion</h3>
              <p className="text-sm text-gray-600">
                Are you sure you want to delete this genetic test record? This action cannot be undone.
              </p>
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

            {/* ── Header ── */}
            <h2 className="text-[17px] font-bold text-gray-900 mb-1">{selectedTest.title}</h2>

            {/* Subtitle row: name left, action buttons right */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-1.5">
              <p className="text-[13px] font-semibold text-gray-800">{selectedTest.subtitle || `${selectedTest.title} A`}</p>
              <div className="flex items-center gap-2 flex-wrap">
                <button className="border border-gray-200 text-gray-600 text-[12px] font-medium px-3.5 py-1 rounded-full hover:bg-gray-50 transition-colors whitespace-nowrap">
                  Download Report
                </button>
                <button 
                  onClick={() => handleOpenNoteModal(selectedTest)}
                  className="border border-gray-200 text-gray-600 text-[12px] font-medium px-3.5 py-1 rounded-full hover:bg-gray-50 transition-colors whitespace-nowrap"
                >
                  Add Clinical Note
                </button>
                {selectedTest.status === "NEEDS_REVIEW" && (
                  <button 
                    onClick={() => {
                      handleMarkReviewed(selectedTest.id, "REVIEWED");
                      setSelectedTest(null);
                    }}
                    className="border border-gray-200 text-gray-600 text-[12px] font-medium px-3.5 py-1 rounded-full hover:bg-gray-50 transition-colors whitespace-nowrap"
                  >
                    Mark as Reviewed
                  </button>
                )}
              </div>
            </div>

            {/* Meta info row */}
            <p className="text-[12px] text-gray-500 mb-4">
              Lab: {selectedTest.lab}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              Ordered: {selectedTest.orderedDate}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              <span className={
                selectedTest.status === "NEEDS_REVIEW" ? "text-gray-700 font-medium" :
                selectedTest.status === "AWAITING_REPORT" ? "text-yellow-600 font-medium" : "text-gray-700 font-medium"
              }>{statusConfig[selectedTest.status].label}</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              {selectedTest.reportedDate && <>Reported: {selectedTest.reportedDate}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</>}
              Ordered by: {selectedTest.orderedBy}
            </p>

            {/* Horizontal rule */}
            <div className="border-t border-gray-200 -mx-8" />

            {/* ── Two-column body ── */}
            <div className="flex gap-0">

              {/* LEFT: Test Details + Clinical Interpretation + Recommendations */}
              <div className="flex-1 pr-6 pt-4 pb-6 min-w-0">
                <p className="text-[13px] font-bold text-gray-800 mb-3">Test Details</p>

                {/* Details table */}
                <table className="w-full text-[13px] mb-6 border-separate" style={{ borderSpacing: '0 6px' }}>
                  <tbody>
                    {[
                      ["Test Type",             selectedTest.title],
                      ["Method",                selectedTest.subtitle || "SNP Array"],
                      ["Sample Type",           selectedTest.sampleType || "Peripheral Blood"],
                      ["Sample Collection Date",selectedTest.collectionDate || "N/A"],
                      ["Accession/Sample ID",   "MGN-CMA-26-04567"],
                      ["Report Version",        "Final"],
                      ["Reported By",           selectedTest.orderedBy],
                    ].map(([label, value]) => (
                      <tr key={label}>
                        <td className="text-gray-500 py-0.5 pr-4 align-top w-48 whitespace-nowrap">{label}</td>
                        <td className="text-gray-700 py-0.5 align-top">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Clinical Interpretation */}
                <p className="text-[13px] font-bold text-gray-800 mb-2">Clinical Interpretation</p>
                {selectedTest.interpretation && selectedTest.interpretation.length > 0 ? (
                  selectedTest.interpretation.map((para, idx) => (
                    <p key={idx} className="text-[13px] text-gray-600 leading-relaxed mb-2 pr-4">{para}</p>
                  ))
                ) : (
                  <p className="text-[13px] text-gray-500 italic mb-4">No clinical interpretation provided.</p>
                )}

                {/* Recommendations */}
                <p className="text-[13px] font-bold text-gray-800 mb-2 mt-4">Recommendations</p>
                <p className="text-[13px] text-gray-600 whitespace-pre-line leading-relaxed pr-4">
                  {selectedTest.recommendations || "No recommendations provided."}
                </p>
              </div>

              {/* Vertical divider */}
              <div className="w-px bg-gray-200 self-stretch mx-0 shrink-0" />

              {/* RIGHT: Result + Documents */}
              <div className="w-[45%] pl-6 pt-4 pb-6 shrink-0">
                <p className="text-[13px] font-bold text-gray-800 mb-3">Result</p>

                <p className="text-[13px] text-gray-600 mb-3 leading-relaxed">
                  {selectedTest.result || "Variant of Uncertain Significance (VUS)\n16p11.2 microdeletion detected (0.6 Mb)"}
                </p>
                
                {/* Result metadata table */}
                <table className="w-full text-[12px] mb-4 border-separate" style={{ borderSpacing: '0 4px' }}>
                  <tbody>
                    {[
                      ["Classification",   "VUS-Uncertain Significance"],
                      ["Genomic Location", "16p11.2 (29.5-30.1 Mb)"],
                      ["Size",             "0.6 Mb"],
                      ["Inheritance",      "Unknown"],
                      ["ACMG Evidence",    "PM2, PP3 (Supporting)"],
                    ].map(([label, value]) => (
                      <tr key={label}>
                        <td className="text-gray-500 py-0.5 pr-2 align-top w-32 whitespace-nowrap">{label}</td>
                        <td className="text-gray-700 py-0.5 align-top">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {/* View Full Report pill */}
                {selectedTest.reports && selectedTest.reports.length > 0 && (
                  <div className="mb-6 flex justify-end pr-4">
                    <a 
                      href={selectedTest.reports[0].file_url || "#"} 
                      target="_blank" 
                      rel="noreferrer"
                      className="inline-block border border-green-300 text-green-700 bg-green-50/30 text-[12px] font-medium px-4 py-1 rounded-full hover:bg-green-50 transition-colors"
                    >
                      View Full Report
                    </a>
                  </div>
                )}

                {/* Report Documents */}
                <p className="text-[13px] font-bold text-gray-800 mb-3">Report Documents</p>
                <div className="space-y-4 mb-4">
                  {selectedTest.reports && selectedTest.reports.length > 0 ? (
                    selectedTest.reports.map((doc: any, idx: number) => {
                      const isExcel = doc.original_file_name?.toLowerCase().endsWith('.xls') || doc.original_file_name?.toLowerCase().endsWith('.xlsx');
                      return (
                        <a key={idx} href={doc.file_url} target="_blank" rel="noreferrer" className="flex items-start gap-3 group">
                          {isExcel ? (
                            <svg className="w-5 h-5 text-green-600 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM8.5 16.5l-1.3-1.6-1.5 1.6H3.6l2.3-2.5-2.2-2.5h2l1.2 1.6 1.3-1.6h2.1l-2.3 2.5 2.4 2.5H8.5zM19 16.5h-5v-1.5h5v1.5zm0-4h-5v-1.5h5v1.5zm0-4h-5v-1.5h5v1.5z"/>
                            </svg>
                          ) : (
                            <svg className="w-5 h-5 text-red-500 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8.5 7.5c0 .83-.67 1.5-1.5 1.5H9v2H7.5V7H10c.83 0 1.5.67 1.5 1.5v1zm5 2c0 .83-.67 1.5-1.5 1.5h-2.5V7H15c.83 0 1.5.67 1.5 1.5v3zm4-3H19v1.5h1.5V13H19v2h-1.5V7h3v1.5zM9 9.5h1v-1H9v1zM4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm10 5.5h1v-3h-1v3z"/>
                            </svg>
                          )}
                          <div className="-mt-0.5">
                            <p className="text-[13px] font-medium text-gray-700 group-hover:text-blue-600 transition-colors truncate max-w-[200px]">
                              {doc.original_file_name || doc.file_name || `Document ${idx+1}`}
                            </p>
                            <p className="text-[11px] text-gray-500 uppercase mt-0.5">{isExcel ? 'XLSX' : 'PDF'}</p>
                          </div>
                        </a>
                      );
                    })
                  ) : (
                    <p className="text-[13px] text-gray-500 italic">No documents attached.</p>
                  )}
                </div>
                
                <button 
                  onClick={() => {
                    setSelectedTest(null);
                    handleOpenEditModal(selectedTest);
                  }}
                  className="w-full border border-green-300 text-green-700 bg-green-50/20 text-[12px] font-medium py-2 rounded flex items-center justify-center hover:bg-green-50 transition-colors mt-2"
                >
                  Upload More
                </button>
              </div>
            </div>

            {/* ── Activity Timeline ── */}
            <div className="border-t border-gray-200 pt-5 -mx-8 px-8">
              <p className="text-[13px] font-bold text-gray-800 mb-4">Activity</p>
              <div className="relative pl-6">
                {/* Vertical connector */}
                <div className="absolute left-[7px] top-1.5 bottom-3 w-px bg-gray-200" />
                <div className="space-y-5">
                  <div className="flex items-start gap-4 relative">
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500 shrink-0 mt-[3px] z-10 -ml-[23.5px]" />
                    <div className="flex items-center gap-8 text-[12px]">
                      <span className="text-gray-500 w-32 shrink-0">{selectedTest.orderedDate || "Apr 18, 2026"}</span>
                      <span className="text-gray-600">Report uploaded by {selectedTest.orderedBy}</span>
                    </div>
                  </div>
                  {selectedTest.reportedDate && (
                    <div className="flex items-start gap-4 relative">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0 mt-[3px] z-10 -ml-[23.5px]" />
                      <div className="flex items-center gap-8 text-[12px]">
                        <span className="text-gray-500 w-32 shrink-0">{selectedTest.reportedDate || "Apr 19, 2026"}</span>
                        <span className="text-gray-600">Marked as Needs Review</span>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start gap-4 relative">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0 mt-[3px] z-10 -ml-[23.5px]" />
                    <div className="flex items-center gap-8 text-[12px]">
                      <span className="text-gray-500 w-32 shrink-0">Current Status</span>
                      <span className="text-gray-600">Awaiting clinical review</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}
      </CustomModal>
      {/* Add Clinical Note Modal */}
      <CustomModal
        isOpen={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        title="Add Clinical Note"
        width="600px"
        customFooter={
          <div className="flex justify-center gap-4 px-8 py-5 w-full border-t border-gray-100">
            <button
              onClick={() => setIsNoteModalOpen(false)}
              className="px-6 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveNote}
              disabled={updateTestMutation.isPending}
              className="px-6 py-2 bg-[#60a5fa] text-white font-semibold rounded-lg hover:bg-blue-500 transition-colors disabled:opacity-50 min-w-[150px] flex items-center justify-center gap-2 cursor-pointer"
            >
              {updateTestMutation.isPending ? "Saving..." : "Save Note"}
            </button>
          </div>
        }
      >
        <div className="p-6 pb-2">
          <div className="mb-4">
            <Label>Status</Label>
            <Select
              defaultValue={noteForm.status}
              options={[
                { value: "AWAITING_REPORT", label: "Awaiting Report" },
                { value: "NEEDS_REVIEW", label: "Needs Review" },
                { value: "REVIEWED", label: "Reviewed" },
                { value: "NORMAL", label: "Normal" },
                { value: "POSITIVE", label: "Positive" },
                { value: "NEGATIVE", label: "Negative" },
              ]}
              onChange={(val) => setNoteForm(prev => ({ ...prev, status: val as GeneticTestStatus }))}
              placeholder="Select status"
            />
          </div>
          <div className="mb-4">
            <Label>Clinical Note</Label>
            <TextArea
              value={noteForm.text}
              onChange={(e) => setNoteForm(prev => ({ ...prev, text: e.target.value }))}
              placeholder="Enter clinical note or interpretation..."
              rows={4}
            />
          </div>
        </div>
      </CustomModal>

    </div>
  );
}
