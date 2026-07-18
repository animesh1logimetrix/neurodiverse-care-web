import { useMemo, useState, useRef, type ChangeEvent } from "react";
import { useParams } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import axiosClient from "../../api/axiosClient";
import CustomModal from "../ui/modal/CustomModal";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { HorizontaLDots } from "../../icons";
import Input from "../form/input/InputField";
import Select from "../form/Select";
import DatePicker from "../form/date-picker";
import Label from "../form/Label";

interface CreateMedicationPayload {
  child_id: number;
  category_id?: number;
  medication_name: string;
  dose: number;
  unit: string;
  frequency: string;
  administration_time: { time: string };
  start_date: string;
  review_due_date?: string;
  prescribedBy_id: number;
  status: string;
  instructions: { text: string };
  fileIds: number[];
}

type Medication = {
  id: number;
  medication_name: string;
  category?: string | { full_category_name?: string; name?: string };
  dose?: number;
  unit?: string;
  frequency?: string;
  prescribedBy?: { name?: string } | string;
  prescribedBy_id?: number;
  start_date?: string;
  review_due_date?: string;
  status?: string;
  instructions?: { text?: string };
  child_id?: number;
  category_id?: number;
  administration_time?: { time?: string };
  documents?: any[];
  files?: any[];
};

const formatDateValue = (value: unknown): string => {
  if (!value) return "";
  if (value instanceof Date) {
    return value.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }
  if (Array.isArray(value)) {
    return value[0] ? formatDateValue(value[0]) : "";
  }
  const parsed = new Date(String(value));
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }
  return String(value);
};

const getFrequencyLabel = (value: string) => {
  const labels: Record<string, string> = {
    ONCE_DAILY: "Once daily",
    TWICE_DAILY: "Twice daily",
    THREE_TIMES_DAILY: "Three times daily",
    FOUR_TIMES_DAILY: "Four times daily",
    EVERY_4_HOURS: "Every 4 hours",
    EVERY_6_HOURS: "Every 6 hours",
    EVERY_8_HOURS: "Every 8 hours",
    EVERY_12_HOURS: "Every 12 hours",
    WEEKLY: "Weekly",
    AS_NEEDED: "As needed",
  };
  return labels[value] ?? value;
};

const getFrequencyApiValue = (value: string) => {
  if (value === "once-daily" || value === "once-daily-eve") return "ONCE_DAILY";
  return value;
};

const getFrequencyFormValue = (value: string) => {
  const normalizedValue = value.trim().toLowerCase();
  const frequencies = [
    "ONCE_DAILY",
    "TWICE_DAILY",
    "THREE_TIMES_DAILY",
    "FOUR_TIMES_DAILY",
    "EVERY_4_HOURS",
    "EVERY_6_HOURS",
    "EVERY_8_HOURS",
    "EVERY_12_HOURS",
    "WEEKLY",
    "AS_NEEDED",
  ];
  const matchingFrequency = frequencies.find(
    (frequency) => frequency === value || getFrequencyLabel(frequency).toLowerCase() === normalizedValue
  );
  return matchingFrequency ?? "ONCE_DAILY";
};

const getMedicationStatusLabel = (value: string) =>
  value.toLowerCase().replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

const getCategoryLabel = (value: unknown) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    const category = value as { full_category_name?: string; name?: string };
    return category.full_category_name ?? category.name ?? "";
  }
  return String(value);
};

const getApiResponseData = (response: any) => {
  if (!response) return [];
  if (Array.isArray(response)) return response;
  if (Array.isArray(response.data)) return response.data;
  if (Array.isArray(response.data?.data)) return response.data.data;
  return [];
};

const normalizeMedicationDocument = (file: any) => {
  if (!file) return null;

  const normalizedId = file.id ?? file.file_id ?? file.fileId ?? file.file?.id ?? file.file?.file_id ?? file.document_id ?? file.documentId;
  if (!normalizedId && !file.file_url && !file.fileUrl && !file.path && !file.file_path && !file.url && !file.name && !file.original_file_name && !file.file_name) {
    return null;
  }

  return {
    ...file,
    id: normalizedId,
    file_url: file.file_url ?? file.fileUrl ?? file.path ?? file.file_path ?? file.url ?? file.file?.path ?? file.file?.file_url ?? "",
    original_file_name: file.original_file_name ?? file.file_name ?? file.name ?? file.file?.name ?? "Document",
    file_type: file.file_type ?? file.fileType ?? file.file?.type ?? "File",
    file_size: file.file_size ?? file.fileSize ?? file.size ?? file.file?.size,
    createdAt: file.createdAt ?? file.created_at ?? file.updatedAt ?? file.file?.createdAt ?? file.file?.created_at,
  };
};

const normalizeMedicationDocuments = (value: any) => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map(normalizeMedicationDocument).filter(Boolean);
  }
  if (Array.isArray(value.documents)) return value.documents.map(normalizeMedicationDocument).filter(Boolean);
  if (Array.isArray(value.files)) return value.files.map(normalizeMedicationDocument).filter(Boolean);
  if (Array.isArray(value.reports)) return value.reports.map(normalizeMedicationDocument).filter(Boolean);
  if (Array.isArray(value.attachments)) return value.attachments.map(normalizeMedicationDocument).filter(Boolean);
  if (Array.isArray(value.media)) return value.media.map(normalizeMedicationDocument).filter(Boolean);
  if (Array.isArray(value.data)) return value.data.map(normalizeMedicationDocument).filter(Boolean);
  return [];
};

const normalizeMedicationDetails = (details: any) => ({
  ...details,
  documents: normalizeMedicationDocuments(details?.documents ?? details?.files ?? details?.reports ?? details?.attachments ?? details?.media),
  files: normalizeMedicationDocuments(details?.files ?? details?.documents ?? details?.reports ?? details?.attachments ?? details?.media),
});

const MedicationsTab = () => {
  const { id: childId } = useParams();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const viewModalUploadInputRef = useRef<HTMLInputElement>(null);

  const [openMenuMedicationId, setOpenMenuMedicationId] = useState<string | null>(null);
  const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null);
  const [isMedicationModalOpen, setIsMedicationModalOpen] = useState(false);
  const [isAddMedicationOpen, setIsAddMedicationOpen] = useState(false);
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [existingFiles, setExistingFiles] = useState<any[]>([]);
  const [filesToRemove, setFilesToRemove] = useState<number[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isLoadingMedicationDetails, setIsLoadingMedicationDetails] = useState(false);
  const [isSubmittingMedication, setIsSubmittingMedication] = useState(false);
  const [isUploadingMoreDocuments, setIsUploadingMoreDocuments] = useState(false);
  const [isDeletingMedication, setIsDeletingMedication] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    medicationName: "",
    category: "",
    dose: "",
    unit: "mg",
    frequency: "",
    administrationTime: "morning",
    startDate: "",
    reviewDue: "",
    prescribedBy: "",
    status: "ACTIVE",
    instructions: "",
  });

  const { data: medicationData = [], isLoading: isLoadingMedications } = useQuery({
    queryKey: ["medications", childId],
    queryFn: async () => {
      const res = await axiosClient.get("/medication", { params: { childId } });
      return res.data;
    },
    enabled: !!childId,
    staleTime: 1000 * 60 * 2,
  });

  const { data: categoriesData } = useQuery({
    queryKey: ["category"],
    queryFn: async () => {
      const res = await axiosClient.get("/category");
      return res.data;
    },
  });

  const { data: usersData } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const res = await axiosClient.get("/user");
      return res.data;
    },
  });

  const categories = Array.isArray(categoriesData) ? categoriesData : categoriesData?.data || [];
  const users = Array.isArray(usersData) ? usersData : usersData?.data || [];

  const medications = useMemo(() => {
    const rawMedications = getApiResponseData(medicationData);
    return rawMedications.map((medication: any) => ({
      ...medication,
      documents: normalizeMedicationDocuments(medication.documents ?? medication.files ?? medication.reports ?? medication.attachments ?? medication.media),
      files: normalizeMedicationDocuments(medication.files ?? medication.documents ?? medication.reports ?? medication.attachments ?? medication.media),
    }));
  }, [medicationData]);

  const uploadFilesMutation = useMutation({
    mutationFn: async (files: File[]) => {
      const formData = new FormData();
      files.forEach(file => {
        formData.append("files", file);
      });
      formData.append("folder", "uploads");
      const res = await axiosClient.post("/media/uploads", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    },
  });

  const closeAddMedicationModal = () => {
    setIsAddMedicationOpen(false);
    setSelectedFiles([]);
    setExistingFiles([]);
    setFilesToRemove([]);
    setEditingMedication(null);
    setFormErrors({});
  };

  const resetMedicationModalState = () => {
    setIsAddMedicationOpen(false);
    setSelectedFiles([]);
    setExistingFiles([]);
    setFilesToRemove([]);
    setEditingMedication(null);
  };

  const createMedicationMutation = useMutation({
    mutationFn: async (payload: CreateMedicationPayload) => {
      const response = await axiosClient.post("/medication", payload);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Medication added successfully.");
      queryClient.invalidateQueries({ queryKey: ["medications", childId] });
      resetMedicationModalState();
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message;
      toast.error(Array.isArray(message) ? message.join(", ") : message || "Failed to add medication.");
    },
  });

  const updateMedicationMutation = useMutation({
    mutationFn: async ({ medicationId, payload }: { medicationId: number; payload: CreateMedicationPayload }) => {
      const response = await axiosClient.patch(`/medication/${medicationId}`, payload);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Medication updated successfully.");
      queryClient.invalidateQueries({ queryKey: ["medications", childId] });
      resetMedicationModalState();
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message;
      toast.error(Array.isArray(message) ? message.join(", ") : message || "Failed to update medication.");
    },
  });

  const deleteMedicationMutation = useMutation({
    mutationFn: async (medicationId: number) => {
      const response = await axiosClient.delete(`/medication/${medicationId}`);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Medication deleted successfully.");
      queryClient.invalidateQueries({ queryKey: ["medications", childId] });
      closeDeleteModal();
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message;
      toast.error(Array.isArray(message) ? message.join(", ") : message || "Failed to delete medication.");
    },
  });

  const openMedicationModal = async (med: Medication) => {
    if (isLoadingMedicationDetails) return;

    setOpenMenuMedicationId(null);
    setIsLoadingMedicationDetails(true);
    setExistingFiles([]);
    try {
      const response = await axiosClient.get(`/medication/${med.id}`);
      const details = response.data?.data ?? response.data;
      const normalizedDetails = normalizeMedicationDetails(details);
      setSelectedMedication(normalizedDetails);
      setExistingFiles(normalizedDetails.documents || normalizedDetails.files || []);
      setIsMedicationModalOpen(true);
    } catch (error) {
      const message = (error as any)?.response?.data?.message;
      toast.error(Array.isArray(message) ? message.join(", ") : message || "Failed to load medication details.");
    } finally {
      setIsLoadingMedicationDetails(false);
    }
  };

  const closeMedicationModal = () => {
    setIsMedicationModalOpen(false);
    setSelectedMedication(null);
    setExistingFiles([]);
  };

  const resetUploadState = () => {
    setSelectedFiles([]);
    setExistingFiles([]);
    setFilesToRemove([]);
    setUploadError(null);
  };

  const handleOpenAddMedicationModal = () => {
    resetUploadState();
    setEditingMedication(null);
    setFormData({
      medicationName: "",
      category: "",
      dose: "",
      unit: "mg",
      frequency: "",
      administrationTime: "morning",
      startDate: "",
      reviewDue: "",
      prescribedBy: "",
      status: "ACTIVE",
      instructions: "",
    });
    setFormErrors({});
    setFilesToRemove([]);
    setIsAddMedicationOpen(true);
  };

  const updateFormField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setFormErrors(prev => ({ ...prev, [field]: "" }));
  };

  const validateAddMedicationForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.medicationName?.trim()) errors.medicationName = "Medication name is required.";
    if (!formData.category) errors.category = "Category is required.";
    if (!formData.dose) errors.dose = "Dose is required.";
    if (!formData.unit) errors.unit = "Unit is required.";
    if (!formData.frequency) errors.frequency = "Frequency is required.";
    if (!formData.administrationTime) errors.administrationTime = "Administration time is required.";
    if (!formData.startDate) errors.startDate = "Start date is required.";
    if (!formData.prescribedBy) errors.prescribedBy = "Prescriber is required.";
    if (!formData.status) errors.status = "Status is required.";
    return errors;
  };

  const handleOpenEditMedicationModal = async (med: Medication) => {
    resetUploadState();
    try {
      const response = await axiosClient.get(`/medication/${med.id}`);
      const details = response.data?.data ?? response.data;
      const normalizedDetails = normalizeMedicationDetails(details);
      const detailDocuments = normalizedDetails.documents || normalizedDetails.files || [];
      setExistingFiles(detailDocuments);
      setFormData({
        medicationName: normalizedDetails.medication_name || med.medication_name || "",
        category: normalizedDetails.category_id ? String(normalizedDetails.category_id) : med.category_id ? String(med.category_id) : "",
        dose: normalizedDetails.dose?.toString() ?? med.dose?.toString() ?? "",
        unit: normalizedDetails.unit ?? med.unit ?? "mg",
        frequency: getFrequencyFormValue(normalizedDetails.frequency ?? med.frequency ?? ""),
        administrationTime: normalizedDetails.administration_time?.time ?? med.administration_time?.time ?? "morning",
        startDate: normalizedDetails.start_date || med.start_date || "",
        reviewDue: normalizedDetails.review_due_date || med.review_due_date || "",
        prescribedBy: normalizedDetails.prescribedBy_id ? String(normalizedDetails.prescribedBy_id) : med.prescribedBy_id ? String(med.prescribedBy_id) : "",
        status: normalizedDetails.status ?? med.status ?? "ACTIVE",
        instructions: normalizedDetails.instructions?.text ?? med.instructions?.text ?? "",
      });
      setFormErrors({});
      setEditingMedication(normalizedDetails as Medication);
      setIsAddMedicationOpen(true);
      setOpenMenuMedicationId(null);
    } catch (error) {
      const message = (error as any)?.response?.data?.message;
      toast.error(Array.isArray(message) ? message.join(", ") : message || "Failed to load medication details for edit.");
    }
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedMedication(null);
    setOpenMenuMedicationId(null);
  };

  const handleOpenDeleteModal = (med: Medication) => {
    setSelectedMedication(med);
    setIsDeleteModalOpen(true);
    setOpenMenuMedicationId(null);
  };

  const handleDeleteMedication = async () => {
    if (!selectedMedication || isDeletingMedication) return;
    setIsDeletingMedication(true);
    try {
      await deleteMedicationMutation.mutateAsync(selectedMedication.id);
    } finally {
      setIsDeletingMedication(false);
    }
  };

  const isValidFileType = (file: File) => {
    const extension = `.${file.name.split(".").pop()?.toLowerCase() ?? ""}`;
    return [".jpg", ".jpeg", ".png", ".pdf"].includes(extension);
  };

  const getFileKey = (file: File) => `${file.name}-${file.size}-${file.lastModified}`;

  const handleFileSelect = (files: FileList | null) => {
    if (!files?.length) return;
    const incomingFiles = Array.from(files);
    const validFiles = incomingFiles.filter(isValidFileType);
    const existingKeys = new Set(selectedFiles.map((file) => getFileKey(file)));
    const freshFiles = validFiles.filter((file) => !existingKeys.has(getFileKey(file)));
    setSelectedFiles((prev) => [...prev, ...freshFiles]);

    const invalidFiles = incomingFiles.filter((file) => !isValidFileType(file));
    if (invalidFiles.length) {
      setUploadError(`Unsupported file type skipped: ${invalidFiles.map((file) => file.name).join(", ")}`);
    } else {
      setUploadError(null);
    }
  };

  const handleUploadMoreDocuments = async (e: ChangeEvent<HTMLInputElement>) => {
    if (isUploadingMoreDocuments || !e.target.files?.length || !selectedMedication) return;

    setIsUploadingMoreDocuments(true);
    const newFiles = Array.from(e.target.files);
    try {
      const uploadRes = await uploadFilesMutation.mutateAsync(newFiles);
      const filesArray = uploadRes?.files || [];
      const uploadedDocuments = filesArray
        .map((item: any) => item.file)
        .filter(Boolean)
        .map((file: any) => ({
          id: file.id,
          file_url: file.path || file.file_url,
          original_file_name: file.name || file.original_file_name,
          file_type: file.type || file.file_type,
          file_size: file.size || file.file_size,
          file: file,
        }));

      const existingFileIds = existingFiles?.map((r: any) => r.id ?? r.file_id ?? r.fileId ?? r.file?.id ?? r.file?.file_id ?? r.document_id ?? r.documentId).filter(Boolean) || [];
      const newFileIds = uploadedDocuments.map((item: any) => item.id).filter(Boolean);
      const allFileIds = [...new Set([...existingFileIds, ...newFileIds])];

      const payload: CreateMedicationPayload = {
        child_id: Number((selectedMedication as any).child_id ?? selectedMedication.child_id ?? childId ?? 0),
        category_id: Number((selectedMedication as any).category_id ?? selectedMedication.category_id),
        medication_name: (selectedMedication as any).medication_name ?? selectedMedication.medication_name ?? "",
        dose: Number((selectedMedication as any).dose ?? selectedMedication.dose ?? 0),
        unit: (selectedMedication as any).unit ?? selectedMedication.unit ?? "",
        frequency: (selectedMedication as any).frequency ?? selectedMedication.frequency ?? "",
        administration_time: { time: (selectedMedication as any).administration_time?.time ?? selectedMedication.administration_time?.time ?? "morning" },
        start_date: (selectedMedication as any).start_date ?? selectedMedication.start_date ?? "",
        review_due_date: (selectedMedication as any).review_due_date ?? selectedMedication.review_due_date,
        prescribedBy_id: Number((selectedMedication as any).prescribedBy_id ?? selectedMedication.prescribedBy_id ?? 0),
        status: (selectedMedication as any).status ?? selectedMedication.status ?? "",
        instructions: { text: (selectedMedication as any).instructions?.text ?? selectedMedication.instructions?.text ?? "" },
        fileIds: allFileIds,
      };

      await axiosClient.patch(`/medication/${selectedMedication.id}`, payload);
      setExistingFiles((prev) => [...prev, ...uploadedDocuments]);
      setSelectedMedication((prev) =>
        prev
          ? {
              ...prev,
              documents: [...(prev.documents || []), ...uploadedDocuments],
              files: [...(prev.files || []), ...uploadedDocuments],
            }
          : prev
      );
      toast.success("Documents uploaded successfully");
      queryClient.invalidateQueries({ queryKey: ["medications", childId] });
    } catch (err) {
      const message = (err as any)?.response?.data?.message;
      toast.error(Array.isArray(message) ? message.join(", ") : message || "Failed to upload documents");
    } finally {
      setIsUploadingMoreDocuments(false);
      if (viewModalUploadInputRef.current) {
        viewModalUploadInputRef.current.value = "";
      }
    }
  };

  const handleFileInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(event.target.files);
    event.target.value = "";
  };

  const handleAddMedicationSubmit = async () => {
    if (isSubmittingMedication) return;

    const errors = validateAddMedicationForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmittingMedication(true);
    let uploadedFileIds: number[] = [];
    
    // Include existing file IDs from edit mode (excluding removed files)
    if (existingFiles.length > 0) {
      uploadedFileIds = existingFiles
        .filter((f: any) => !filesToRemove.includes(f.id ?? f.file_id ?? f.fileId ?? f.file?.id ?? f.file?.file_id ?? f.document_id ?? f.documentId))
        .map((f: any) => f.id ?? f.file_id ?? f.fileId ?? f.file?.id ?? f.file?.file_id ?? f.document_id ?? f.documentId)
        .filter(Boolean);
    }
    
    // Upload new files if any
    if (selectedFiles.length > 0) {
      try {
        const uploadResponse = await uploadFilesMutation.mutateAsync(selectedFiles);
        const filesArray = uploadResponse?.files || [];
        const newFileIds = filesArray.map((item: any) => item.file?.id).filter(Boolean);
        uploadedFileIds = [...new Set([...uploadedFileIds, ...newFileIds])];
      } catch (error) {
        const message = (error as any)?.response?.data?.message;
        toast.error(Array.isArray(message) ? message.join(", ") : message || "Failed to upload attachments.");
        return false;
      }
    }

    const payload: CreateMedicationPayload = {
      child_id: Number(childId),
      category_id: formData.category ? Number(formData.category) : undefined,
      medication_name: formData.medicationName?.trim() || "",
      dose: Number(formData.dose),
      unit: formData.unit,
      frequency: getFrequencyApiValue(formData.frequency),
      administration_time: { time: formData.administrationTime },
      start_date: formData.startDate,
      review_due_date: formData.reviewDue || undefined,
      prescribedBy_id: Number(formData.prescribedBy),
      status: formData.status,
      instructions: { text: formData.instructions || "" },
      fileIds: uploadedFileIds,
    };

    if (editingMedication) {
      try {
        await updateMedicationMutation.mutateAsync({ medicationId: editingMedication.id, payload });
        return true;
      } catch {
        return false;
      } finally {
        setIsSubmittingMedication(false);
      }
    }

    try {
      await createMedicationMutation.mutateAsync(payload);
      return true;
    } catch {
      return false;
    } finally {
      setIsSubmittingMedication(false);
    }
  };

  const documents = existingFiles.map((file: any) => {
    const normalizedFile = normalizeMedicationDocument(file);
    const displayName = normalizedFile?.original_file_name || "Document";
    const displayDate = normalizedFile?.createdAt || "";
    const displaySize = normalizedFile?.file_size;
    const displayType = normalizedFile?.file_type || "File";
    const displayUrl = normalizedFile?.file_url || "";

    return {
      id: normalizedFile?.id,
      name: displayName,
      date: displayDate ? new Date(displayDate).toLocaleDateString() : "Unknown",
      size: displaySize ? `${(Number(displaySize) / 1024 / 1024).toFixed(2)} MB` : "Unknown Size",
      type: displayType,
      url: displayUrl,
    };
  });

  const historyItems = [
    { dot: "bg-[#10b981]", date: "Sep 15, 2022", event: "Medication prescribed", detail: "Initial dose created" },
    { dot: "bg-[#ef4444]", date: "Aug 28, 2022", event: "Medication record updated", detail: "Dose adjusted" },
    { dot: "bg-[#2563eb]", date: "Jul 10, 2022", event: "Medication review completed", detail: "No adverse effects" },
  ];

  return (
    <>
      <div className="space-y-4">
        {/* Action Bar */}
        <div className="flex justify-end">
        <button 
          onClick={handleOpenAddMedicationModal}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#2DA0FF] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#2DA0FF] transition-colors"
        >
          + Add Medication
        </button>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800">Medications</h2>
          <p className="text-sm text-gray-500 mt-1">
            {medications.length} Active Medications on Record
          </p>
        </div>

        {/* Loading State */}
        {isLoadingMedications ? (
          <div className="py-12 flex flex-col items-center justify-center text-gray-500">
            <svg className="animate-spin h-8 w-8 text-[#2DA0FF] mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-sm font-medium">Loading medications...</p>
          </div>
        ) : medications.length === 0 ? (
          /* Empty State */
          <div className="py-12 flex flex-col items-center justify-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            <p className="text-gray-600 font-medium">No medications found</p>
            <p className="text-sm mt-1">Click "Add Medication" to create a new record.</p>
          </div>
        ) : (
          /* Medications Table */
          <div className="w-full overflow-x-auto custom-scrollbar">
            {/* Desktop & Tablet Table */}
            <table className="hidden md:table w-full min-w-[900px] table-fixed border-collapse">
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
              <tbody>
                {medications.map((med: any, medicationIndex: number) => {
                  const medicationMenuKey = `${med.id}-${medicationIndex}`;
                  const categoryLabel = getCategoryLabel(med.category);
                  const doseLabel = [med.dose, med.unit].filter(Boolean).join(" ");
                  const prescribedByLabel = typeof med.prescribedBy === "string"
                    ? med.prescribedBy
                    : med.prescribedBy?.name ?? "";

                  return (
                    <tr key={medicationMenuKey} className="border-b border-gray-50 last:border-b-0 transition-colors hover:bg-gray-50/50">
                      <td className="px-3 py-4 text-sm font-semibold leading-snug text-gray-800 whitespace-normal break-words">
                        {med.medication_name}
                      </td>
                      <td className="px-3 py-4 text-sm leading-snug text-gray-600 whitespace-normal break-words">
                        {categoryLabel}
                      </td>
                      <td className="px-3 py-4 text-sm leading-snug text-gray-600 whitespace-normal break-words">
                        {doseLabel}
                      </td>
                      <td className="px-3 py-4 text-sm leading-snug text-gray-600 whitespace-normal break-words">
                        {getFrequencyLabel(med.frequency ?? "")}
                      </td>
                      <td className="px-3 py-4 text-sm leading-snug text-gray-600 whitespace-normal break-words">
                        {prescribedByLabel}
                      </td>
                      <td className="px-3 py-4 text-sm leading-snug text-gray-600 whitespace-normal break-words">
                        {formatDateValue(med.start_date)}
                      </td>
                      <td className="px-3 py-4 text-sm leading-snug text-gray-600 whitespace-normal break-words">
                        {formatDateValue(med.review_due_date)}
                      </td>
                      <td className="px-3 py-4">
                        <span className={`inline-block rounded-md px-3 py-1 text-xs font-bold whitespace-nowrap ${med.status === "ACTIVE" ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-600"}`}>
                          {getMedicationStatusLabel(med.status ?? "")}
                        </span>
                      </td>
                      <td className="px-3 py-4">
                        <div className="relative inline-flex">
                          <button
                            type="button"
                            onClick={() => setOpenMenuMedicationId(openMenuMedicationId === medicationMenuKey ? null : medicationMenuKey)}
                            className="dropdown-toggle flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                            title="Medication actions"
                            aria-label={`Actions for ${med.medication_name}`}
                            aria-expanded={openMenuMedicationId === medicationMenuKey}
                          >
                            <HorizontaLDots className="h-4 w-4" />
                          </button>
                          <Dropdown isOpen={openMenuMedicationId === medicationMenuKey} onClose={() => setOpenMenuMedicationId(null)} className="right-0 top-full mt-1 w-32 shadow-theme-md z-50">
                            <div className="py-1">
                              <DropdownItem onClick={() => openMedicationModal(med)}>
                                {isLoadingMedicationDetails ? "Loading..." : "View"}
                              </DropdownItem>
                              <DropdownItem onClick={() => handleOpenEditMedicationModal(med)}>Edit</DropdownItem>
                              <DropdownItem onClick={() => handleOpenDeleteModal(med)} className="text-error-600 hover:bg-error-50 dark:hover:bg-error-950/20">
                                Delete
                              </DropdownItem>
                            </div>
                          </Dropdown>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Mobile Cards */}
            <div className="flex flex-col gap-4 md:hidden pb-1">
              {medications.map((med: any, medicationIndex: number) => {
                const medicationMenuKey = `mobile-${med.id}-${medicationIndex}`;
                const categoryLabel = getCategoryLabel(med.category);
                const doseLabel = [med.dose, med.unit].filter(Boolean).join(" ");
                const prescribedByLabel = typeof med.prescribedBy === "string"
                  ? med.prescribedBy
                  : med.prescribedBy?.name ?? "";

                return (
                  <div key={medicationMenuKey} className="flex flex-col gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm relative">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Medication</p>
                        <h3 className="text-sm font-bold text-gray-900 break-words leading-tight">{med.medication_name}</h3>
                      </div>
                      <div className="flex items-start gap-2 shrink-0">
                        <span className={`inline-block rounded-md px-2 py-1 text-[10px] font-bold whitespace-nowrap mt-0.5 ${med.status === "ACTIVE" ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-600"}`}>
                          {getMedicationStatusLabel(med.status ?? "")}
                        </span>
                        <div className="relative inline-flex">
                          <button
                            type="button"
                            onClick={() => setOpenMenuMedicationId(openMenuMedicationId === medicationMenuKey ? null : medicationMenuKey)}
                            className="dropdown-toggle flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                            title="Medication actions"
                          >
                            <HorizontaLDots className="h-4 w-4" />
                          </button>
                          <Dropdown isOpen={openMenuMedicationId === medicationMenuKey} onClose={() => setOpenMenuMedicationId(null)} className="right-0 top-full mt-1 w-32 shadow-theme-md z-50">
                            <div className="py-1">
                              <DropdownItem onClick={() => openMedicationModal(med)}>
                                {isLoadingMedicationDetails ? "Loading..." : "View"}
                              </DropdownItem>
                              <DropdownItem onClick={() => handleOpenEditMedicationModal(med)}>Edit</DropdownItem>
                              <DropdownItem onClick={() => handleOpenDeleteModal(med)} className="text-error-600 hover:bg-error-50 dark:hover:bg-error-950/20">
                                Delete
                              </DropdownItem>
                            </div>
                          </Dropdown>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-x-3 gap-y-4 mt-2">
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Category</p>
                        <p className="text-sm text-gray-700 break-words font-medium">{categoryLabel || "-"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Dose</p>
                        <p className="text-sm text-gray-700 break-words font-medium">{doseLabel || "-"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Frequency</p>
                        <p className="text-sm text-gray-700 break-words font-medium">{getFrequencyLabel(med.frequency ?? "") || "-"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Prescribed By</p>
                        <p className="text-sm text-gray-700 break-words font-medium">{prescribedByLabel || "-"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Start</p>
                        <p className="text-sm text-gray-700 break-words font-medium">{formatDateValue(med.start_date) || "-"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Review Due</p>
                        <p className="text-sm text-gray-700 break-words font-medium">{formatDateValue(med.review_due_date) || "-"}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>

    <CustomModal
        isOpen={isMedicationModalOpen}
        onClose={closeMedicationModal}
        title=""
        maxWidth="max-w-4xl"
        maxBodyHeight="80vh"
        padding="p-0"
        headerClassName="!py-0 !px-0 !border-0 !hidden"
        customFooter={<></>}
      >
        {selectedMedication && (
          <div className="pb-2">
            
            {/* Close button */}
            <div className="flex justify-end mb-2 pt-2 pr-2">
              <button
                type="button"
                onClick={closeMedicationModal}
                className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="px-8 pb-6">
              {/* ── Header ── */}
              <h2 className="text-[17px] font-bold text-gray-900 mb-2">{selectedMedication?.medication_name ?? "Medication Details"}</h2>
              
              <div className="flex flex-col gap-1 mb-6">
                <p className="text-[13px] text-gray-500">{getCategoryLabel(selectedMedication.category)} / {getMedicationStatusLabel(selectedMedication.status ?? "")}</p>
                <p className="text-[13px] text-gray-500">{[selectedMedication.dose, selectedMedication.unit].filter(Boolean).join(" ")} · {getFrequencyLabel(selectedMedication.frequency ?? "")}</p>
                <p className="text-[13px] text-gray-500">Prescribed by {typeof selectedMedication.prescribedBy === "string" ? selectedMedication.prescribedBy : selectedMedication.prescribedBy?.name ?? "N/A"}</p>
              </div>

              {/* Horizontal rule */}
              <div className="border-t border-gray-200 -mx-8 mb-6" />

              {/* ── Two-column body ── */}
              <div className="flex flex-col md:flex-row gap-0 mb-8">
                {/* Left Column: Details */}
                <div className="flex-1 pr-8">
                  <p className="text-[13px] font-bold text-gray-800 mb-4">Medication Details</p>
                  
                  <table className="w-full text-[13px] border-separate" style={{ borderSpacing: '0 8px' }}>
                    <tbody>
                      {[
                        ["Category", getCategoryLabel(selectedMedication.category)],
                        ["Dose", [selectedMedication.dose, selectedMedication.unit].filter(Boolean).join(" ")],
                        ["Frequency", getFrequencyLabel(selectedMedication.frequency ?? "")],
                        ["Start Date", formatDateValue(selectedMedication.start_date)],
                        ["Review Due", formatDateValue(selectedMedication.review_due_date)],
                        ["Status", getMedicationStatusLabel(selectedMedication.status ?? "")],
                        ["Prescribed By", typeof selectedMedication.prescribedBy === "string" ? selectedMedication.prescribedBy : selectedMedication.prescribedBy?.name ?? "N/A"],
                        ["Last Updated", formatDateValue(selectedMedication.updated_at) + (selectedMedication.updatedBy ? ` by ${selectedMedication.updatedBy}` : '')],
                      ].map(([label, value]) => (
                        <tr key={label}>
                          <td className="text-gray-500 py-0.5 pr-4 align-top w-40 whitespace-nowrap">{label}</td>
                          <td className="text-gray-700 py-0.5 align-top">{value || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Vertical divider */}
                <div className="w-px bg-gray-200 self-stretch hidden md:block shrink-0" />

                {/* Right Column: Instructions */}
                <div className="flex-1 md:pl-8 pt-4 md:pt-0">
                  <p className="text-[13px] font-bold text-gray-800 mb-4">Instructions for Care Team/Parents</p>
                  
                  <div className="text-[13px] text-gray-600 leading-relaxed pl-4">
                    {selectedMedication.instructions?.text ? (
                      selectedMedication.instructions.text.split('\n').map((line: string, i: number) => (
                        <p key={i} className="mb-2">{line}</p>
                      ))
                    ) : (
                      <p className="text-gray-400 italic">No instructions provided.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Horizontal rule */}
              <div className="border-t border-gray-200 -mx-8 mb-6" />

              {/* Reports & Documents */}
              <div className="mb-8">
                <h3 className="text-[13px] font-bold text-gray-800 mb-4">Reports & Documents</h3>
                <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
                  {documents.length > 0 ? (
                    documents.map((doc) => (
                      <a
                        key={doc.id}
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-48 shrink-0 border border-orange-200 rounded-xl p-4 flex flex-col h-40 hover:bg-orange-50 transition-colors"
                      >
                        <div className="mt-auto">
                          <p className="font-bold text-gray-800 text-[13px] mb-1 line-clamp-2" title={doc.name}>{doc.name}</p>
                          <p className="text-[12px] text-gray-500 mb-0.5">{doc.date}</p>
                          <p className="text-[12px] text-gray-500">{doc.size}</p>
                        </div>
                      </a>
                    ))
                  ) : (
                    <div className="w-48 shrink-0 border border-gray-200 rounded-xl p-4 flex flex-col justify-center items-center h-40 text-center">
                      <p className="text-[12px] text-gray-400">No reports found</p>
                    </div>
                  )}

                  <label className="w-48 shrink-0 border-2 border-dashed border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center h-40 hover:bg-gray-50 transition-colors text-gray-500 hover:text-gray-700 cursor-pointer relative">
                    <input
                      ref={viewModalUploadInputRef}
                      type="file"
                      className="hidden"
                      multiple
                      accept="image/jpeg, image/png, application/pdf"
                      disabled={uploadFilesMutation.isPending || updateMedicationMutation.isPending || isUploadingMoreDocuments}
                      onChange={handleUploadMoreDocuments}
                    />
                    {(uploadFilesMutation.isPending || updateMedicationMutation.isPending) ? (
                      <div className="flex flex-col items-center">
                        <svg className="animate-spin h-5 w-5 text-[#2DA0FF] mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="text-[12px] font-medium">Uploading...</span>
                      </div>
                    ) : (
                      <>
                        <svg className="w-5 h-5 mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                        <span className="text-[13px] font-medium">Upload More</span>
                      </>
                    )}
                  </label>
                </div>
              </div>

              {/* Horizontal rule */}
              <div className="border-t border-gray-200 -mx-8 mb-6" />

              {/* Medication History */}
              <div>
                <h3 className="text-[13px] font-bold text-gray-800 mb-6">Medication History</h3>
                <div className="relative pt-2 pl-2">
                  <div className="absolute left-[12px] top-4 bottom-4 w-px bg-gray-200" />
                  <div className="absolute left-[176px] top-4 bottom-4 w-px bg-gray-200" />

                  {historyItems.map((item, index) => (
                    <div key={index} className="flex items-center gap-8 mb-6 relative z-10">
                      <div className={`w-2 h-2 rounded-full ${item.dot} ring-4 ring-white shrink-0`} />
                      <div className="w-24 text-[13px] text-gray-500 shrink-0">{item.date}</div>
                      <div className={`w-2 h-2 rounded-full ${item.dot} ring-4 ring-white shrink-0`} />
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <p className="text-[13px] text-gray-700">{item.event}</p>
                        <p className="text-[12px] text-gray-500">{item.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}
      </CustomModal>

      <CustomModal
        isOpen={isAddMedicationOpen}
        onClose={closeAddMedicationModal}
        title={editingMedication ? "Edit Medication" : "Add Medication"}
        maxWidth="max-w-3xl"
        customFooter={
          <div className="flex justify-center gap-4 px-8 py-5 border-t border-gray-100 w-full">
            <button
              onClick={closeAddMedicationModal}
              className="px-8 py-2 text-sm font-bold text-gray-600 bg-[#e2e8f0] rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAddMedicationSubmit}
              disabled={isSubmittingMedication || createMedicationMutation.isPending || updateMedicationMutation.isPending || uploadFilesMutation.isPending}
              className="px-8 py-2 text-sm font-bold text-white bg-[#2DA0FF] rounded-lg hover:bg-[#2DA0FF] transition-colors disabled:opacity-50"
            >
              {createMedicationMutation.isPending || updateMedicationMutation.isPending || uploadFilesMutation.isPending ? editingMedication ? "Updating..." : "Creating..." : editingMedication ? "Update Medication" : "Save Medication"}
            </button>
          </div>
        }
      >
        <div>
          <h3 className="text-gray-800 font-semibold mb-6">Medication Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 mb-6">
            <div>
              <Label>Medication Name *</Label>
              <Input 
                value={formData.medicationName} 
                onChange={(e) => updateFormField('medicationName', e.target.value)} 
                placeholder="Enter medication name" 
              />
              {formErrors.medicationName && <p className="mt-1 text-xs text-red-600">{formErrors.medicationName}</p>}
            </div>

            <div>
              <Label>Category *</Label>
              <Select 
                key={`category-${formData.category}`}
                defaultValue={formData.category}
                options={categories.map((c: any) => ({ value: String(c.id), label: c.full_category_name || `Category ${c.id}` }))}
                onChange={(val) => updateFormField('category', val)}
                placeholder="Select category"
              />
              {formErrors.category && <p className="mt-1 text-xs text-red-600">{formErrors.category}</p>}
            </div>

            <div>
              <Label>Dose *</Label>
              <Input 
                type="number" 
                value={formData.dose} 
                onChange={(e) => updateFormField('dose', e.target.value)} 
                placeholder="e.g. 10" 
              />
              {formErrors.dose && <p className="mt-1 text-xs text-red-600">{formErrors.dose}</p>}
            </div>

            <div>
              <Label>Unit *</Label>
              <Select 
                key={`unit-${formData.unit}`}
                defaultValue={formData.unit}
                options={[
                  { value: "mg", label: "mg" },
                  { value: "ml", label: "ml" },
                ]}
                onChange={(val) => updateFormField('unit', val)}
                placeholder="Select unit"
              />
              {formErrors.unit && <p className="mt-1 text-xs text-red-600">{formErrors.unit}</p>}
            </div>

            <div>
              <Label>Frequency *</Label>
              <Select 
                key={`frequency-${formData.frequency}`}
                defaultValue={formData.frequency}
                options={[
                  { value: "ONCE_DAILY", label: "Once daily" },
                  { value: "TWICE_DAILY", label: "Twice daily" },
                  { value: "THREE_TIMES_DAILY", label: "Three times daily" },
                  { value: "FOUR_TIMES_DAILY", label: "Four times daily" },
                  { value: "EVERY_4_HOURS", label: "Every 4 hours" },
                  { value: "EVERY_6_HOURS", label: "Every 6 hours" },
                  { value: "EVERY_8_HOURS", label: "Every 8 hours" },
                  { value: "EVERY_12_HOURS", label: "Every 12 hours" },
                  { value: "WEEKLY", label: "Weekly" },
                  { value: "AS_NEEDED", label: "As needed" },
                ]}
                onChange={(val) => updateFormField('frequency', val)}
                placeholder="Select frequency"
              />
              {formErrors.frequency && <p className="mt-1 text-xs text-red-600">{formErrors.frequency}</p>}
            </div>

            <div>
              <Label>Administration Time *</Label>
              <Select 
                key={`adminTime-${formData.administrationTime}`}
                defaultValue={formData.administrationTime}
                options={[
                  { value: "morning", label: "Morning" },
                  { value: "evening", label: "Evening" },
                ]}
                onChange={(val) => updateFormField('administrationTime', val)}
                placeholder="Select time"
              />
              {formErrors.administrationTime && <p className="mt-1 text-xs text-red-600">{formErrors.administrationTime}</p>}
            </div>

            <div>
              <Label>Start Date *</Label>
              <DatePicker 
                key={`startDate-${formData.startDate}`}
                id="startDate"
                defaultDate={formData.startDate}
                maxDate="today"
                onChange={(dates) => updateFormField('startDate', dates[0]?.toString() || '')} 
                placeholder="Select date" 
              />
              {formErrors.startDate && <p className="mt-1 text-xs text-red-600">{formErrors.startDate}</p>}
            </div>

            <div>
              <Label>Review Due Date</Label>
              <DatePicker 
                key={`reviewDue-${formData.reviewDue}`}
                id="reviewDue"
                defaultDate={formData.reviewDue}
                onChange={(dates) => updateFormField('reviewDue', dates[0]?.toString() || '')} 
                placeholder="Select date" 
              />
            </div>

            <div>
              <Label>Prescribed By *</Label>
              <Select 
                key={`prescribedBy-${formData.prescribedBy}`}
                defaultValue={formData.prescribedBy}
                options={users.map((u: any) => ({ value: String(u.id), label: u.name || `User ${u.id}` }))}
                onChange={(val) => updateFormField('prescribedBy', val)}
                placeholder="Select prescriber"
              />
              {formErrors.prescribedBy && <p className="mt-1 text-xs text-red-600">{formErrors.prescribedBy}</p>}
            </div>

            <div>
              <Label>Status *</Label>
              <Select 
                key={`status-${formData.status}`}
                defaultValue={formData.status}
                options={[
                  { value: "ACTIVE", label: "Active" },
                  { value: "PENDING", label: "Pending" },
                  { value: "COMPLETED", label: "Completed" },
                  { value: "DISCONTINUED", label: "Discontinued" },
                  { value: "ON_HOLD", label: "On Hold" },
                ]}
                onChange={(val) => updateFormField('status', val)}
                placeholder="Select status"
              />
              {formErrors.status && <p className="mt-1 text-xs text-red-600">{formErrors.status}</p>}
            </div>
          </div>

          <div className="mb-8">
            <Label>Instructions for Care Team / Parents</Label>
            <Input 
              type="text" 
              value={formData.instructions} 
              onChange={(e) => updateFormField('instructions', e.target.value)} 
              placeholder="Enter instructions" 
            />
          </div>

          <div className="mb-8">
            <h3 className="text-sm font-bold text-gray-800 mb-3">Reports & Documents</h3>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <svg className="w-6 h-6 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
              <p className="text-sm text-gray-500">
                Drag & drop or <span className="text-[#2DA0FF] font-medium">browse files</span> Jpeg, Png, Pdf
              </p>
            </div>
            <input 
              type="file" 
              multiple 
              ref={fileInputRef} 
              className="hidden" 
              onChange={handleFileInputChange} 
              accept="image/jpeg, image/png, application/pdf"
            />
            {uploadError && <p className="mt-2 text-xs text-red-600">{uploadError}</p>}
            {selectedFiles.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {selectedFiles.map((file) => (
                  <div key={getFileKey(file)} className="text-xs bg-gray-100 text-gray-700 border border-gray-200 px-3 py-1.5 rounded-md flex items-center gap-2">
                    {file.name}
                    <button 
                      type="button" 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        setSelectedFiles(prev => prev.filter((f) => getFileKey(f) !== getFileKey(file))); 
                      }} 
                      className="text-gray-400 hover:text-red-500 font-bold"
                    >
                      X
                    </button>
                  </div>
                ))}
              </div>
            )}
            {existingFiles.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {existingFiles.map((file, idx) => {
                  const fileUrl = file.file_url || file.url || file.path || file.file?.file_url || "";
                  const fileName = file.original_file_name || file.file_name || file.name || file.file?.name || "Document";
                  const fileId = file.id ?? file.file_id ?? file.fileId ?? file.file?.id ?? file.file?.file_id ?? file.document_id ?? file.documentId;
                  const isMarkedForRemoval = filesToRemove.includes(fileId);

                  return (
                    <div key={`exist-${idx}`} className={`text-xs border px-3 py-1.5 rounded-md flex items-center gap-2 ${
                      isMarkedForRemoval
                        ? "bg-red-50 text-red-700 border-red-200 opacity-50"
                        : "bg-blue-50 text-blue-700 border-blue-200"
                    }`}>
                      {fileUrl && !isMarkedForRemoval ? (
                        <a href={fileUrl} target="_blank" rel="noreferrer" className="hover:underline">
                          {fileName}
                        </a>
                      ) : (
                        <span>{fileName}</span>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isMarkedForRemoval) {
                            setFilesToRemove(prev => prev.filter(id => id !== fileId));
                          } else {
                            setFilesToRemove(prev => [...prev, fileId]);
                          }
                        }}
                        className="ml-1 font-bold hover:text-red-600"
                        title={isMarkedForRemoval ? "Undo removal" : "Remove file"}
                      >
                        {isMarkedForRemoval ? "↶" : "×"}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </CustomModal>

      <CustomModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        title="Delete Medication"
        showOverlay
        maxWidth="max-w-[480px]"
        padding="px-8 py-6"
        showCloseIcon
        customFooter={
          <div className="flex w-full items-center justify-end gap-3 border-t border-gray-100 px-8 py-5">
            <button
              type="button"
              onClick={closeDeleteModal}
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
            Medication: {selectedMedication.medication_name}
          </p>
        )}
      </CustomModal>
    </>
  );
};

export default MedicationsTab;
