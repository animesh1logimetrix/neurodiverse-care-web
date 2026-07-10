import { useMemo, useState, useRef, type ChangeEvent, type DragEvent } from "react";
import { useParams } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import axiosClient from "../../api/axiosClient";
import CustomModal, { FieldConfig } from "../ui/modal/CustomModal";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { PlusIcon, HorizontaLDots, DownloadIcon } from "../../icons";

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
  start_date?: string;
  review_due_date?: string;
  status?: string;
  instructions?: { text?: string };
  child_id?: number;
};

const uploadMultipleFiles = async (files: File[], folder: string) => {
  const uploadData = new FormData();
  files.forEach((file) => uploadData.append("files", file));
  uploadData.append("folder", folder);

  return axiosClient.post("/media/uploads", uploadData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

const formatDateValue = (value: unknown) => {
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

const extractUploadedFileIds = (responseData: any): number[] => {
  const candidates = Array.isArray(responseData?.data)
    ? responseData.data
    : Array.isArray(responseData)
      ? responseData
      : Array.isArray(responseData?.files)
        ? responseData.files
        : Array.isArray(responseData?.data?.data)
          ? responseData.data.data
          : [];

  return candidates
    .map((item: any) => Number(typeof item === "object" ? item.file?.id ?? item.id : item))
    .filter((fileId: number) => Number.isFinite(fileId) && fileId > 0);
};

const getApiResponseData = (response: any) => {
  if (!response) return [];
  if (Array.isArray(response)) return response;
  if (Array.isArray(response.data)) return response.data;
  if (Array.isArray(response.data?.data)) return response.data.data;
  return [];
};

const MedicationsTab = () => {
  const { id: childId } = useParams();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [openMenuMedicationId, setOpenMenuMedicationId] = useState<string | null>(null);
  const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null);
  const [isMedicationModalOpen, setIsMedicationModalOpen] = useState(false);
  const [isAddMedicationOpen, setIsAddMedicationOpen] = useState(false);
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isLoadingMedicationDetails, setIsLoadingMedicationDetails] = useState(false);
  const [isDeletingMedication, setIsDeletingMedication] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const { data: medicationData = [], isLoading: isLoadingMedications } = useQuery({
    queryKey: ["medications", childId],
    queryFn: async () => {
      const res = await axiosClient.get("/medication", { params: { child_id: childId } });
      return res.data;
    },
    enabled: !!childId,
    staleTime: 1000 * 60 * 2,
  });

  const { data: medicationOptionsData = [] } = useQuery({
    queryKey: ["medicationOptions"],
    queryFn: async () => {
      const res = await axiosClient.get("/medication");
      return res.data;
    },
    staleTime: 1000 * 60 * 5,
  });

  const medications = useMemo(() => getApiResponseData(medicationData), [medicationData]);
  const medicationOptions = useMemo(() => {
    const optionsSource = getApiResponseData(medicationOptionsData);
    const names = Array.from(
      new Set(
        optionsSource
          .map((item: any) => item.medication_name ?? item.name ?? "")
          .filter((name: string) => typeof name === "string" && name.trim() !== "")
      )
    ).sort((a, b) => a.localeCompare(b));

    return names.map((name: string) => ({ label: name, value: name }));
  }, [medicationOptionsData]);

  const uploadMedicationFilesMutation = useMutation({
    mutationFn: (files: File[]) => uploadMultipleFiles(files, "uploads"),
  });

  const createMedicationMutation = useMutation({
    mutationFn: async (payload: CreateMedicationPayload) => {
      const response = await axiosClient.post("/medication", payload);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Medication added successfully.");
      queryClient.invalidateQueries({ queryKey: ["medications", childId] });
      setIsAddMedicationOpen(false);
      setSelectedFiles([]);
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
      setIsAddMedicationOpen(false);
      setSelectedFiles([]);
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
      setIsDeleteModalOpen(false);
      setSelectedMedication(null);
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
    try {
      const response = await axiosClient.get(`/medication/${med.id}`);
      const details = response.data?.data ?? response.data;
      setSelectedMedication(details);
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
  };

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

  const medicationNameOptions = useMemo(() => {
    if (medicationOptions.length > 0) return medicationOptions;
    return medications
      .map((item: any) => item.medication_name ?? item.name ?? "")
      .filter((value: string) => value.trim() !== "")
      .map((value: string) => ({ label: value, value }));
  }, [medicationOptions, medications]);

  const addMedicationFields: FieldConfig[] = useMemo(() => [
    {
      name: "medicationName",
      label: "Medication Name",
      type: "select",
      required: true,
      placeholder: "Select medication",
      options: medicationNameOptions,
      colSpan: 1,
    },
    {
      name: "category",
      label: "Category",
      type: "select",
      placeholder: "Select category",
      options: [
        { label: "Stimulant/ADHD", value: "1" },
        { label: "Antipsychotic", value: "2" },
      ],
      colSpan: 1,
    },
    { name: "dose", label: "Dose", type: "number", required: true, placeholder: "e.g. 10", colSpan: 1 },
    {
      name: "unit",
      label: "Unit",
      type: "select",
      required: true,
      placeholder: "Select unit",
      options: [
        { label: "mg", value: "mg" },
        { label: "ml", value: "ml" },
      ],
      colSpan: 1,
    },
    {
      name: "frequency",
      label: "Frequency",
      type: "select",
      required: true,
      placeholder: "Select frequency",
      options: [
        { label: "Once daily", value: "ONCE_DAILY" },
        { label: "Twice daily", value: "TWICE_DAILY" },
        { label: "Three times daily", value: "THREE_TIMES_DAILY" },
        { label: "Four times daily", value: "FOUR_TIMES_DAILY" },
        { label: "Every 4 hours", value: "EVERY_4_HOURS" },
        { label: "Every 6 hours", value: "EVERY_6_HOURS" },
        { label: "Every 8 hours", value: "EVERY_8_HOURS" },
        { label: "Every 12 hours", value: "EVERY_12_HOURS" },
        { label: "Weekly", value: "WEEKLY" },
        { label: "As needed", value: "AS_NEEDED" },
      ],
      colSpan: 1,
    },
    {
      name: "administrationTime",
      label: "Administration Time",
      type: "select",
      required: true,
      placeholder: "Select time",
      options: [
        { label: "Morning", value: "morning" },
        { label: "Evening", value: "evening" },
      ],
      colSpan: 1,
    },
    { name: "startDate", label: "Start Date", type: "date", required: true, placeholder: "Select start date", colSpan: 1 },
    { name: "reviewDue", label: "Review Due Date", type: "date", placeholder: "Select review date", colSpan: 1 },
    {
      name: "prescribedBy",
      label: "Prescribed By",
      type: "select",
      required: true,
      placeholder: "Select prescriber",
      options: [
        { label: "Dr. Suresh Mehta", value: "1" },
      ],
      colSpan: 1,
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      required: true,
      placeholder: "Select status",
      options: [
        { label: "Active", value: "ACTIVE" },
        { label: "Pending", value: "PENDING" },
        { label: "Completed", value: "COMPLETED" },
        { label: "Discontinued", value: "DISCONTINUED" },
        { label: "On Hold", value: "ON_HOLD" },
      ],
      colSpan: 1,
    },
    {
      name: "instructions",
      label: "Instructions for Care Team / Parents",
      type: "text",
      colSpan: 2,
      placeholder: "Enter instructions",
      inputClassName:
        "h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed",
    },
  ], [medicationNameOptions]);

  const handleAddMedicationSubmit = async (formData: Record<string, any>) => {
    if (createMedicationMutation.isPending || updateMedicationMutation.isPending || uploadMedicationFilesMutation.isPending) return false;

    const requiredFields = [
      [childId, "Child"],
      [formData.medicationName?.trim(), "Medication name"],
      [formData.dose, "Dose"],
      [formData.unit, "Unit"],
      [formData.frequency, "Frequency"],
      [formData.administrationTime, "Administration time"],
      [formData.startDate, "Start date"],
      [formData.prescribedBy, "Prescriber"],
      [formData.status, "Status"],
    ];
    const missingField = requiredFields.find(([value]) => value === undefined || value === null || String(value).trim() === "");
    if (missingField) {
      toast.error(`${missingField[1]} is required.`);
      return false;
    }

    let uploadedFileIds: number[] = [];
    if (selectedFiles.length > 0) {
      try {
        const uploadResponse = await uploadMedicationFilesMutation.mutateAsync(selectedFiles);
        uploadedFileIds = extractUploadedFileIds(uploadResponse.data);
        if (uploadedFileIds.length !== selectedFiles.length) {
          toast.error("Upload completed without media IDs. The backend must return an ID for each uploaded file.");
          return false;
        }
      } catch (error) {
        const message = (error as any)?.response?.data?.message;
        toast.error(Array.isArray(message) ? message.join(", ") : message || "Failed to upload attachments.");
        return false;
      }
    }

    const payload: CreateMedicationPayload = {
      child_id: Number(childId),
      category_id: formData.category ? Number(formData.category) : undefined,
      medication_name: formData.medicationName.trim(),
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
        return;
      } catch {
        return false;
      }
    }

    try {
      await createMedicationMutation.mutateAsync(payload);
      return;
    } catch {
      return false;
    }
  };

  const documents = [
    { name: "Prescription J", date: "18:2023", size: "p120 0" },
    { name: "Side Effects Info Sheet", date: "Jun 15 2027", size: "DM-310KB" },
    { name: "Ah 15:2003 Parent Information Sheet", date: "pdf-180 KB", size: "" },
    { name: "Medication Guide", date: "Jun 15.2073", size: "pat-450 Kn" },
  ];

  const historyItems = [
    { dot: "bg-emerald-500", date: "Sep 15, 2022", event: "Medication prescribed", detail: "Initial dose created" },
    { dot: "bg-red-500", date: "Aug 28, 2022", event: "Medication record updated", detail: "Dose adjusted" },
    { dot: "bg-blue-700", date: "Jul 10, 2022", event: "Medication review completed", detail: "No adverse effects" },
  ];

  return (
    <div>
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

      <div className="w-full overflow-visible rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="w-full overflow-visible">
          <table className="w-full table-fixed border-collapse">
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
              {medications.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-3 py-10 text-center text-sm text-gray-500">
                    {isLoadingMedications ? "Loading medications..." : "No medication records found."}
                  </td>
                </tr>
              ) : (
                medications.map((med: any, medicationIndex: number) => {
                  const medicationMenuKey = `${med.id}-${medicationIndex}`;
                  const categoryLabel =
                    med.category?.full_category_name ?? med.category?.name ?? String(med.category ?? "");
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
                          <Dropdown isOpen={openMenuMedicationId === medicationMenuKey} onClose={() => setOpenMenuMedicationId(null)} className="right-0 top-full mt-1 w-32 shadow-theme-md">
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
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CustomModal
        isOpen={isMedicationModalOpen}
        onClose={closeMedicationModal}
        title={selectedMedication?.medication_name ?? "Medication Details"}
        maxWidth="max-w-3xl"
        maxBodyHeight="80vh"
        padding="p-0"
        customFooter={<></>}
      >
        {selectedMedication && (
          <div className="flex flex-col">
            <div className="p-6 pt-6">
              <div className="mb-4 px-0">
                <p className="text-sm text-gray-500">{selectedMedication.category?.toString()} / {getMedicationStatusLabel(selectedMedication.status ?? "")}</p>
                <p className="text-sm text-gray-500">{[selectedMedication.dose, selectedMedication.unit].filter(Boolean).join(" ")} · {getFrequencyLabel(selectedMedication.frequency ?? "")}</p>
                <p className="text-sm text-gray-500">Prescribed by {typeof selectedMedication.prescribedBy === "string" ? selectedMedication.prescribedBy : selectedMedication.prescribedBy?.name ?? "N/A"}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="grid grid-cols-[140px_1fr] gap-y-3">
                  <span className="text-[12px] text-gray-500">Category</span>
                  <span className="text-sm text-gray-800">{selectedMedication.category?.toString()}</span>

                  <span className="text-[12px] text-gray-500">Dose</span>
                  <span className="text-sm text-gray-800">{[selectedMedication.dose, selectedMedication.unit].filter(Boolean).join(" ")}</span>

                  <span className="text-[12px] text-gray-500">Frequency</span>
                  <span className="text-sm text-gray-800">{getFrequencyLabel(selectedMedication.frequency ?? "")}</span>

                  <span className="text-[12px] text-gray-500">Start Date</span>
                  <span className="text-sm text-gray-800">{formatDateValue(selectedMedication.start_date)}</span>

                  <span className="text-[12px] text-gray-500">Review Due</span>
                  <span className="text-sm text-gray-800">{formatDateValue(selectedMedication.review_due_date)}</span>

                  <span className="text-[12px] text-gray-500">Status</span>
                  <div>
                    <span className="bg-[#e5f5e8] text-[#16a34a] px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider">
                      {getMedicationStatusLabel(selectedMedication.status ?? "")}
                    </span>
                  </div>

                  <span className="text-[12px] text-gray-500">Prescribed By</span>
                  <span className="text-sm text-gray-800">{typeof selectedMedication.prescribedBy === "string" ? selectedMedication.prescribedBy : selectedMedication.prescribedBy?.name ?? "N/A"}</span>
                </div>

                <div className="border-l border-gray-100 pl-8">
                  <p className="text-sm font-semibold text-gray-700 mb-3">Instructions for Care Team / Parents</p>
                  <div className="text-sm text-gray-600 leading-snug">
                    {selectedMedication.instructions?.text ? (
                      <p>{selectedMedication.instructions.text}</p>
                    ) : (
                      <p className="text-gray-400">No instructions provided.</p>
                    )}
                  </div>
                </div>
              </div>

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

              <div className="pt-6 border-t border-gray-100">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Medication History</h3>
                <div className="relative pt-2 pl-1">
                  <div className="absolute left-[8px] top-4 bottom-4 w-px bg-gray-200" />
                  <div className="absolute left-[176px] top-4 bottom-4 w-px bg-gray-200" />

                  {historyItems.map((item, index) => (
                    <div key={index} className="flex items-center gap-8 mb-6 relative z-10">
                      <div className={`w-2 h-2 rounded-full ${item.dot} ring-4 ring-white shrink-0`} />
                      <div className="w-24 text-sm text-[#64748b] shrink-0">{item.date}</div>
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

      <CustomModal
        isOpen={isAddMedicationOpen}
        onClose={() => setIsAddMedicationOpen(false)}
        title={editingMedication ? "Edit Medication" : "Add Medication"}
        bodyHeader={
          <div className="mb-3 px-0">
            <h4 className="text-sm font-semibold text-gray-900">Medication Information</h4>
          </div>
        }
        fields={addMedicationFields}
        onSubmit={handleAddMedicationSubmit}
        initialValues={editingMedication ? {
          medicationName: editingMedication.medication_name,
          category: String(editingMedication.category?.full_category_name || editingMedication.category?.name || ""),
          dose: editingMedication.dose?.toString() ?? "",
          unit: editingMedication.unit ?? "mg",
          frequency: getFrequencyFormValue(editingMedication.frequency ?? ""),
          administrationTime: "morning",
          startDate: editingMedication.start_date || "",
          reviewDue: editingMedication.review_due_date || "",
          prescribedBy: typeof editingMedication.prescribedBy === "string" ? editingMedication.prescribedBy : String(editingMedication.prescribedBy?.name ?? ""),
          status: editingMedication.status ?? "ACTIVE",
          instructions: editingMedication.instructions?.text ?? "",
        } : undefined}
        submitText={editingMedication ? "Update Medication" : "Save Medication"}
        submittingText={editingMedication ? "Updating..." : "Creating..."}
        isLoading={createMedicationMutation.isPending || updateMedicationMutation.isPending || uploadMedicationFilesMutation.isPending}
        cancelText="Cancel"
        size="lg"
        footerAlign="center"
        overlayBlur={false}
        modalClassName="!w-[78vw] !max-w-[980px] !max-h-[78vh] !rounded-[10px] !bg-white !p-0 !shadow-[0_16px_40px_rgba(0,0,0,0.18)]"
      >
        <div className="pt-1 pb-3">
          <div className="mb-1.5">
            <label className="block text-xs font-bold text-black">Attach Reports / Documents</label>
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
              <span>Drag & drop or <span className="font-medium text-blue-600">browse files</span> Jpeg, Png</span>
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
                    <p className="text-xs text-gray-500">{file.size} bytes</p>
                  </div>
                  <button type="button" onClick={() => setSelectedFiles((prev) => prev.filter((f) => getFileKey(f) !== getFileKey(file)))} className="ml-3 text-sm text-gray-400 transition-colors hover:text-red-500" aria-label={`Remove ${file.name}`}>
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
            Medication: {selectedMedication.medication_name}
          </p>
        )}
      </CustomModal>
    </div>
  );
};

export default MedicationsTab;
