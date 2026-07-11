import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router";
import toast from "react-hot-toast";
import axiosClient from "../../api/axiosClient";
import CustomModal from "../ui/modal/CustomModal";
import Input from "../form/input/InputField";
import Select from "../form/Select";
import DatePicker from "../form/date-picker";
import Label from "../form/Label";

export default function DiagnosesTab() {
  const { id: childId } = useParams();
  const [openStates, setOpenStates] = useState<Record<number, boolean>>({
    0: true, // First item open by default based on image
  });
  const [modalMode, setModalMode] = useState<'view' | 'edit' | 'add' | null>(null);
  const [activeDiagnosisIndex, setActiveDiagnosisIndex] = useState<number | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [diagnosisToDelete, setDiagnosisToDelete] = useState<number | null>(null);
  
  const queryClient = useQueryClient();

  // Queries for dropdown data
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

  const { data: iepGoalsData } = useQuery({
    queryKey: ["iep-goal"],
    queryFn: async () => {
      const res = await axiosClient.get("/iep-goal");
      return res.data;
    },
  });

  const categories = Array.isArray(categoriesData) ? categoriesData : categoriesData?.data || [];
  const users = Array.isArray(usersData) ? usersData : usersData?.data || [];
  const allIepGoals = Array.isArray(iepGoalsData) ? iepGoalsData : iepGoalsData?.data || [];

  const { data: childDiagnosesData, isLoading: isDiagnosesLoading } = useQuery({
    queryKey: ["diagnoses", childId],
    queryFn: async () => {
      const res = await axiosClient.get(`/diagnosis?childId=${childId}`);
      return res.data;
    },
    enabled: !!childId,
  });

  const diagnoses = Array.isArray(childDiagnosesData) ? childDiagnosesData : childDiagnosesData?.data || [];

  const { data: allFilesData } = useQuery({
    queryKey: ["files"],
    queryFn: async () => {
      const res = await axiosClient.get("/file");
      return res.data;
    },
  });
  const allFiles = Array.isArray(allFilesData) ? allFilesData : allFilesData?.data || [];

  const [selectedIepGoals, setSelectedIepGoals] = useState<number[]>([]);

  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [existingFiles, setExistingFiles] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGoalSelect = (val: string) => {
    const goalId = Number(val);
    if (goalId && !selectedIepGoals.includes(goalId)) {
      setSelectedIepGoals(prev => [...prev, goalId]);
    }
  };

  const removeGoal = (goalId: number) => {
    setSelectedIepGoals(prev => prev.filter(id => id !== goalId));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploadedFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const [formData, setFormData] = useState({
    categoryId: "",
    icd10: "",
    severityLevel: "",
    status: "",
    diagnosisDate: "",
    reviewDate: "",
    diagnosedById: "",
    clinicalNotes: ""
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const updateForm = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setFormErrors(prev => ({ ...prev, [field]: "" }));
  };

  const uploadFilesMutation = useMutation({
    mutationFn: async (files: File[]) => {
      const formData = new FormData();
      files.forEach(file => {
        formData.append("files", file); // Adjust to 'files' for multiple or 'file' if API is different
      });
      formData.append("folder", "uploads");
      const res = await axiosClient.post("/media/uploads", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    },
  });

  const createDiagnosisMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await axiosClient.post("/diagnosis", payload);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Diagnosis added successfully");
      queryClient.invalidateQueries({ queryKey: ["child", childId] });
      queryClient.invalidateQueries({ queryKey: ["diagnoses", childId] });
      closeModal();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to add diagnosis");
    }
  });

  const updateDiagnosisMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: number, payload: any }) => {
      const res = await axiosClient.patch(`/diagnosis/${id}`, payload);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Diagnosis updated successfully");
      queryClient.invalidateQueries({ queryKey: ["child", childId] });
      queryClient.invalidateQueries({ queryKey: ["diagnoses", childId] });
      closeModal();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update diagnosis");
    }
  });

  const deleteDiagnosisMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await axiosClient.delete(`/diagnosis/${id}`);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Diagnosis deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["diagnoses", childId] });
      setIsDeleteModalOpen(false);
      setDiagnosisToDelete(null);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to delete diagnosis");
    }
  });

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.categoryId) errors.categoryId = "Diagnosis Name is required.";
    if (!formData.icd10.trim()) errors.icd10 = "ICD-10 Code is required.";
    if (!formData.severityLevel) errors.severityLevel = "Severity Level is required.";
    if (!formData.status) errors.status = "Status is required.";
    if (!formData.diagnosisDate) errors.diagnosisDate = "Diagnosis Date is required.";
    if (!formData.diagnosedById) errors.diagnosedById = "Diagnosed By is required.";
    if (!formData.clinicalNotes.trim()) errors.clinicalNotes = "Clinical Notes is required.";
    return errors;
  };

  const handleSave = async () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      let fileIds: number[] = existingFiles ? existingFiles.map((f: any) => f.id) : [];
      if (uploadedFiles.length > 0) {
        const uploadRes = await uploadFilesMutation.mutateAsync(uploadedFiles);
        const filesArray = uploadRes?.files || [];
        const newFileIds = filesArray.map((item: any) => item.file?.id).filter(Boolean);
        fileIds = [...fileIds, ...newFileIds];
      }

      const payload = {
        childId: Number(childId),
        categoryId: Number(formData.categoryId),
        diagnosisDate: formData.diagnosisDate,
        reviewDate: formData.reviewDate,
        severityLevel: formData.severityLevel,
        status: formData.status,
        diagnosedById: Number(formData.diagnosedById),
        clinicalNotes: formData.clinicalNotes,
        linkedGoals: selectedIepGoals,
        fileIds: fileIds,
      };

      if (modalMode === 'edit' && activeDiagnosisIndex !== null) {
        const activeId = diagnoses[activeDiagnosisIndex].id;
        await updateDiagnosisMutation.mutateAsync({ id: activeId, payload });
      } else {
        await createDiagnosisMutation.mutateAsync(payload);
      }
    } catch (error) {
      console.error("Error saving diagnosis:", error);
    }
  };

  const openViewModal = (index: number) => {
    setActiveDiagnosisIndex(index);
    setModalMode('view');
  };

  const openEditModal = (index: number) => {
    setActiveDiagnosisIndex(index);
    const item = diagnoses[index];
    setFormData({
      categoryId: String(item.categoryId || ""),
      icd10: item.category?.icd_code || "",
      severityLevel: item.severityLevel || "",
      status: item.status || "",
      diagnosisDate: item.diagnosisDate || "",
      reviewDate: item.reviewDate || "",
      diagnosedById: String(item.diagnosedById || ""),
      clinicalNotes: item.clinicalNotes || ""
    });
    setSelectedIepGoals(item.linkedGoals ? item.linkedGoals.map((g: any) => g.goal_id) : []);
    setExistingFiles(item.reports || []);
    setUploadedFiles([]);
    setModalMode('edit');
  };

  const openAddModal = () => {
    setActiveDiagnosisIndex(null);
    setFormData({
      categoryId: "",
      icd10: "",
      severityLevel: "",
      status: "",
      diagnosisDate: "",
      reviewDate: "",
      diagnosedById: "",
      clinicalNotes: ""
    });
    setSelectedIepGoals([]);
    setUploadedFiles([]);
    setExistingFiles([]);
    setModalMode('add');
  };

  const closeModal = () => {
    setModalMode(null);
    setActiveDiagnosisIndex(null);
  };

  const toggleAccordion = (index: number) => {
    setOpenStates((prev) => ({ [index]: !prev[index] }));
  };

  return (
    <div className="space-y-4">
      {/* Action Bar */}
      <div className="flex justify-end">
        <button 
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#60a5fa] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-colors"
        >
          + Add Diagnoses
        </button>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800">Diagnoses</h2>
          <p className="text-sm text-gray-500 mt-1">
            {diagnoses.length} Confirm Diagnoses on Record
          </p>
        </div>

        <div className="space-y-0">
          {isDiagnosesLoading ? (
            <div className="py-12 flex flex-col items-center justify-center text-gray-500">
              <svg className="animate-spin h-8 w-8 text-blue-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-sm font-medium">Loading diagnoses...</p>
            </div>
          ) : diagnoses.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              <p className="text-gray-600 font-medium">No diagnoses found</p>
              <p className="text-sm mt-1">Click "Add Diagnoses" to create a new record.</p>
            </div>
          ) : (
            diagnoses.map((item: any, index: number) => {
              const isOpen = openStates[index];
              return (
              <div
                key={index}
                className="border-t border-gray-100 py-4 first:border-t-0"
              >
                <div
                  className="flex items-start justify-between cursor-pointer"
                  onClick={() => toggleAccordion(index)}
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-gray-800 text-sm">
                        {item.category?.full_category_name || "Unknown Diagnosis"}{" "}
                        <span className="font-normal">{item.category?.short_name ? `(${item.category.short_name})` : ""}</span>
                      </h3>
                      <span className="bg-[#e5f5e8] text-[#16a34a] px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                        {item.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>Severity: {item.severityLevel}</span>
                      <span>Diagnosed: {item.diagnosisDate ? new Date(item.diagnosisDate).toLocaleDateString() : 'N/A'}</span>
                      <span>By: {item.diagnosedBy?.name || 'Unknown'}</span>
                      <span className="bg-[#e5f5e8] text-[#16a34a] px-2 py-0.5 rounded text-[10px] font-bold">
                        {item.linkedGoals?.length || 0} IEP goals
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-gray-400">
                    <button 
                      className="hover:text-gray-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        openViewModal(index);
                      }}
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        ></path>
                      </svg>
                    </button>
                    <button className="hover:text-gray-600">
                      <svg
                        className={`w-5 h-5 transition-transform ${
                          isOpen ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 9l-7 7-7-7"
                        ></path>
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Expanded Content */}
                {isOpen && (
                  <div className="mt-4 pt-4 border-t border-dashed border-gray-100">
                    <p className="text-sm font-semibold text-gray-700 mb-1">
                      Clinical Notes
                    </p>
                    <p className="text-sm text-gray-600 mb-4">{item.clinicalNotes || 'No clinical notes provided.'}</p>

                    <div className="flex items-center gap-3">
                      <button 
                        className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditModal(index);
                        }}
                      >
                        Edit diagnosis
                      </button>
                      <button 
                        className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          openViewModal(index);
                        }}
                      >
                        View linked IEP goals
                      </button>
                      <button 
                        className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDiagnosisToDelete(item.id);
                          setIsDeleteModalOpen(true);
                        }}
                      >
                        Archive
                      </button>
                      <span className="px-3 py-1.5 text-xs font-medium text-gray-500 bg-gray-50 border border-gray-100 rounded-md">
                        {item.reports?.length || 0} Documents
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })
          )}
        </div>
      </div>

      {/* Diagnosis Details Modal */}
      <CustomModal 
        isOpen={modalMode === 'view' && activeDiagnosisIndex !== null} 
        onClose={closeModal}
        title="Diagnosis Details"
        maxWidth="max-w-3xl"
        maxBodyHeight="80vh"
        padding="p-0"
        customFooter={<></>}
      >
        {modalMode === 'view' && activeDiagnosisIndex !== null && (() => {
          const item = diagnoses[activeDiagnosisIndex];
          return (
            <div className="flex flex-col">
              <div className="p-6 pt-8">
                {/* Row 1: Details and IEP Goals */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <div className="grid grid-cols-[140px_1fr] gap-y-3 text-sm">
                    <span className="text-gray-500">ICD-10 Code</span> <span className="text-gray-800">{item.category?.icd_code || "N/A"}</span>
                    <span className="text-gray-500">Diagnosis Date</span> <span className="text-gray-800">{item.diagnosisDate ? new Date(item.diagnosisDate).toLocaleDateString() : 'N/A'}</span>
                    <span className="text-gray-500">Diagnosed By</span> <span className="text-gray-800">{item.diagnosedBy?.name || "N/A"}</span>
                    <span className="text-gray-500">Severity</span> <span className="text-gray-800">{item.severityLevel || "N/A"}</span>
                    <span className="text-gray-500">Status</span> 
                    <div>
                      <span className="bg-[#e5f5e8] text-[#16a34a] px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                        {item.status || "N/A"}
                      </span>
                    </div>
                    <span className="text-gray-500">Review Date</span> <span className="text-gray-800">{item.reviewDate ? new Date(item.reviewDate).toLocaleDateString() : 'N/A'}</span>
                    <span className="text-gray-500">Last Updated</span> <span className="text-gray-800">{item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : 'N/A'}</span>
                  </div>

                  <div className="border-l border-gray-100 pl-8">
                    <p className="text-sm font-semibold text-gray-700 mb-3">Linked IEP Goals ({item.linkedGoals?.length || 0})</p>
                    <ul className="text-sm text-gray-600 space-y-2 mb-4">
                      {item.linkedGoals?.map((link: any, idx: number) => (
                        <li key={idx} className="flex gap-2"><span>•</span> {link.goal?.goal_title || 'Unknown Goal'}</li>
                      ))}
                      {(!item.linkedGoals || item.linkedGoals.length === 0) && (
                         <li className="text-gray-400 italic text-xs">No linked goals</li>
                      )}
                    </ul>
                  </div>
                </div>

                {/* Row 2: Reports & Documents */}
                <div className="mb-8 pt-6 border-t border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-700 mb-4">Reports & Documents</h3>
                  <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
                    {item.reports && item.reports.length > 0 ? (
                      item.reports.map((report: any) => (
                        <a 
                          key={report.id} 
                          href={report.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-40 shrink-0 border border-orange-200 rounded-xl p-4 flex flex-col justify-end h-40 hover:bg-orange-50 transition-colors"
                        >
                          <p className="font-bold text-gray-800 text-sm mb-1 line-clamp-2" title={report.original_file_name}>
                            {report.original_file_name || "Document"}
                          </p>
                          <p className="text-xs text-gray-500 mb-0.5">
                            {new Date(report.createdAt).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-500 capitalize">{report.file_type || "File"}</p>
                          <p className="text-xs text-gray-400 mt-2">
                            {report.file_size ? `${(report.file_size / 1024 / 1024).toFixed(2)} MB` : "Unknown Size"}
                          </p>
                        </a>
                      ))
                    ) : (
                      <div className="w-40 shrink-0 border border-gray-200 rounded-xl p-4 flex flex-col justify-center items-center h-40 text-center">
                        <p className="text-xs text-gray-400">No reports found</p>
                      </div>
                    )}
                    {/* Upload Card */}
                    <label className="w-40 shrink-0 border border-dashed border-gray-300 rounded-xl p-4 flex flex-col items-center justify-center h-40 hover:bg-gray-50 transition-colors text-gray-500 hover:text-gray-700 cursor-pointer relative">
                      <input 
                        type="file" 
                        className="hidden" 
                        multiple 
                        accept="image/jpeg, image/png, application/pdf"
                        disabled={uploadFilesMutation.isPending || updateDiagnosisMutation.isPending}
                        onChange={async (e) => {
                          if (e.target.files && e.target.files.length > 0) {
                            const newFiles = Array.from(e.target.files);
                            try {
                              const uploadRes = await uploadFilesMutation.mutateAsync(newFiles);
                              const filesArray = uploadRes?.files || [];
                              const newFileIds = filesArray.map((i: any) => i.file?.id).filter(Boolean);
                              
                              const existingFileIds = item.reports?.map((r: any) => r.id) || [];
                              const allFileIds = [...existingFileIds, ...newFileIds];

                              const payload = {
                                childId: Number(childId),
                                categoryId: Number(item.categoryId),
                                diagnosisDate: item.diagnosisDate,
                                reviewDate: item.reviewDate,
                                severityLevel: item.severityLevel,
                                status: item.status,
                                diagnosedById: Number(item.diagnosedById),
                                clinicalNotes: item.clinicalNotes,
                                linkedGoals: item.linkedGoals ? item.linkedGoals.map((g: any) => g.goal_id) : [],
                                fileIds: allFileIds,
                              };
                              await updateDiagnosisMutation.mutateAsync({ id: item.id, payload });
                            } catch (err) {
                               console.error("Upload more error:", err);
                            }
                          }
                        }}
                      />
                      {(uploadFilesMutation.isPending || updateDiagnosisMutation.isPending) ? (
                        <div className="flex flex-col items-center">
                          <svg className="animate-spin h-6 w-6 text-blue-500 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span className="text-sm font-medium">Uploading...</span>
                        </div>
                      ) : (
                        <>
                          <svg className="w-6 h-6 mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                          <span className="text-sm font-medium">Upload More</span>
                        </>
                      )}
                    </label>
                  </div>
                </div>

                {/* Row 3: History */}
                <div className="pt-6 border-t border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-700 mb-4">History</h3>
                  <div className="relative pt-2 pl-1">
                    <div className="absolute left-[8px] top-4 bottom-4 w-px bg-gray-200" />
                    <div className="absolute left-[176px] top-4 bottom-4 w-px bg-gray-200" />
                    
                    <div className="flex items-center gap-8 mb-6 relative z-10">
                      <div className="w-2 h-2 rounded-full bg-[#10b981] ring-4 ring-white shrink-0" />
                      <div className="w-24 text-sm text-[#64748b] shrink-0">Sep 15, 2022</div>
                      <div className="w-2 h-2 rounded-full bg-[#10b981] ring-4 ring-white shrink-0" />
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <p className="text-sm text-[#334155]">Diagnosis confirmed</p>
                        <p className="text-xs text-[#64748b]">By Dr. Reena Kapoor</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-8 mb-6 relative z-10">
                      <div className="w-2 h-2 rounded-full bg-[#ef4444] ring-4 ring-white shrink-0" />
                      <div className="w-24 text-sm text-[#64748b] shrink-0">Aug 28, 2022</div>
                      <div className="w-2 h-2 rounded-full bg-[#ef4444] ring-4 ring-white shrink-0" />
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <p className="text-sm text-[#334155]">Reports added</p>
                        <p className="text-xs text-[#64748b]">MRI Brain Scan, EEG Report</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-8 relative z-10">
                      <div className="w-2 h-2 rounded-full bg-[#2563eb] ring-4 ring-white shrink-0" />
                      <div className="w-24 text-sm text-[#64748b] shrink-0">Jul 10, 2022</div>
                      <div className="w-2 h-2 rounded-full bg-[#2563eb] ring-4 ring-white shrink-0" />
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <p className="text-sm text-[#334155]">Initial assessment completed</p>
                        <p className="text-xs text-[#64748b]">Developmental Assessment uploaded</p>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          );
        })()}
      </CustomModal>

      {/* Add / Edit Diagnosis Modal */}
      <CustomModal
        isOpen={modalMode === 'add' || modalMode === 'edit'}
        onClose={closeModal}
        title={modalMode === 'add' ? "Add Diagnosis" : "Edit Diagnosis"}
        maxWidth="max-w-3xl"
        customFooter={<></>}
      >
        <div>
          <h3 className="text-gray-800 font-semibold mb-6">Diagnosis Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 mb-6">
            <div>
              <Label>Diagnosis Name *</Label>
              <Select 
                key={`categoryId-${formData.categoryId}`}
                defaultValue={formData.categoryId}
                options={categories.map((c: any) => ({ value: String(c.id), label: c.full_category_name || `Category ${c.id}` }))}
                onChange={(val) => updateForm('categoryId', val)}
                placeholder="Select Category"
              />
              {formErrors.categoryId && <p className="mt-1 text-xs text-red-600">{formErrors.categoryId}</p>}
            </div>
            
            <div>
              <Label>ICD-10 Code *</Label>
              <Input value={formData.icd10} onChange={(e) => updateForm('icd10', e.target.value)} placeholder="Enter code" />
              {formErrors.icd10 && <p className="mt-1 text-xs text-red-600">{formErrors.icd10}</p>}
            </div>

            <div>
              <Label>Severity Level *</Label>
              <Select 
                key={`severityLevel-${formData.severityLevel}`}
                defaultValue={formData.severityLevel}
                options={[
                  { value: 'MILD', label: 'Mild' },
                  { value: 'MODERATE', label: 'Moderate' },
                  { value: 'SEVERE', label: 'Severe' }
                ]}
                onChange={(val) => updateForm('severityLevel', val)}
                placeholder="Select Severity"
              />
              {formErrors.severityLevel && <p className="mt-1 text-xs text-red-600">{formErrors.severityLevel}</p>}
            </div>

            <div>
              <Label>Status*</Label>
              <Select 
                key={`status-${formData.status}`}
                defaultValue={formData.status}
                options={[
                  { value: 'ACTIVE', label: 'Active' },
                  { value: 'CONFIRMED', label: 'Confirmed' },
                  { value: 'IMPROVED', label: 'Improved' },
                  { value: 'RESOLVED', label: 'Resolved' },
                  { value: 'UNDER_REVIEW', label: 'Under Review' }
                ]}
                onChange={(val) => updateForm('status', val)}
                placeholder="Select Status"
              />
              {formErrors.status && <p className="mt-1 text-xs text-red-600">{formErrors.status}</p>}
            </div>

            <div>
              <Label>Diagnosis Date*</Label>
              <DatePicker 
                key={`diag-date-${formData.diagnosisDate}`}
                id="diagnosisDate"
                defaultDate={formData.diagnosisDate}
                maxDate="today"
                onChange={(dates) => updateForm('diagnosisDate', dates[0]?.toString() || '')} 
                placeholder="Select Date" 
              />
              {formErrors.diagnosisDate && <p className="mt-1 text-xs text-red-600">{formErrors.diagnosisDate}</p>}
            </div>

            <div>
              <Label>Review Date</Label>
              <DatePicker 
                key={`rev-date-${formData.reviewDate}`}
                id="reviewDate"
                defaultDate={formData.reviewDate}
                maxDate="today"
                onChange={(dates) => updateForm('reviewDate', dates[0]?.toString() || '')} 
                placeholder="Select Date" 
              />
            </div>

            <div>
              <Label>Diagnosed By*</Label>
              <Select 
                key={`diagnosedById-${formData.diagnosedById}`}
                defaultValue={formData.diagnosedById}
                options={users.map((u: any) => ({ value: String(u.id), label: u.name || `User ${u.id}` }))}
                onChange={(val) => updateForm('diagnosedById', val)}
                placeholder="Select Doctor"
              />
              {formErrors.diagnosedById && <p className="mt-1 text-xs text-red-600">{formErrors.diagnosedById}</p>}
            </div>
          </div>

          <div className="mb-8">
            <Label>Clinical Notes*</Label>
            <Input type="text" value={formData.clinicalNotes} onChange={(e) => updateForm('clinicalNotes', e.target.value)} placeholder="Enter Note" />
            {formErrors.clinicalNotes && <p className="mt-1 text-xs text-red-600">{formErrors.clinicalNotes}</p>}
          </div>

          <div className="mb-8">
            <Label>Select IEP Goals to link with this diagnosis</Label>
            <div className="mb-4">
              <Select 
                key={selectedIepGoals.length}
                options={allIepGoals
                  .filter((g: any) => !selectedIepGoals.includes(g.id))
                  .map((g: any) => ({ value: String(g.id), label: g.goal_title || `Goal ${g.id}` }))}
                onChange={handleGoalSelect}
                placeholder="Select an IEP Goal"
              />
            </div>
            {selectedIepGoals.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {selectedIepGoals.map((goalId, idx) => {
                  const goalObj = allIepGoals.find((g: any) => g.id === goalId);
                  const goalLabel = goalObj ? (goalObj.goal_title || `Goal ${goalId}`) : `Goal ${goalId}`;
                  return (
                    <div key={idx} className="bg-[#e5fcf0] text-[#16a34a] text-xs font-semibold px-4 py-2 rounded-md flex justify-between items-center">
                      {goalLabel}
                      <button type="button" onClick={() => removeGoal(goalId)} className="text-[#16a34a] hover:text-green-700 font-bold ml-2">X</button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mb-8">
            <h3 className="text-sm font-bold text-gray-800 mb-3">Reports & Documents</h3>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <svg className="w-6 h-6 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
              <p className="text-sm text-gray-500">
                Drag & drop or <span className="text-[#60a5fa] font-medium">browse files</span> Jpeg, Png, Pdf
              </p>
            </div>
            <input 
              type="file" 
              multiple 
              ref={fileInputRef} 
              className="hidden" 
              onChange={handleFileSelect} 
              accept="image/jpeg, image/png, application/pdf"
            />
            {(existingFiles.length > 0 || uploadedFiles.length > 0) && (
              <div className="mt-4 flex flex-wrap gap-2">
                {existingFiles.map((file, idx) => (
                  <div key={`exist-${idx}`} className="text-xs bg-gray-100 text-gray-700 border border-gray-200 px-3 py-1.5 rounded-md flex items-center gap-2">
                    <a href={file.file_url} target="_blank" rel="noreferrer" className="hover:underline">
                      {file.original_file_name || file.file_name}
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
                {uploadedFiles.map((file, idx) => (
                  <div key={`new-${idx}`} className="text-xs bg-gray-100 text-gray-700 border border-gray-200 px-3 py-1.5 rounded-md flex items-center gap-2">
                    {file.name}
                    <button 
                      type="button" 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        setUploadedFiles(prev => prev.filter((_, i) => i !== idx)); 
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

          <div className="flex justify-center gap-4 mt-10">
            <button
              onClick={closeModal}
              className="px-8 py-2 text-sm font-bold text-gray-600 bg-[#e2e8f0] rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={createDiagnosisMutation.isPending || updateDiagnosisMutation.isPending || uploadFilesMutation.isPending}
              className="px-8 py-2 text-sm font-bold text-white bg-[#7dd3fc] rounded-lg hover:bg-[#38bdf8] transition-colors disabled:opacity-50"
            >
              {createDiagnosisMutation.isPending || updateDiagnosisMutation.isPending || uploadFilesMutation.isPending ? "Saving..." : "Save Diagnosis"}
            </button>
          </div>

        </div>
      </CustomModal>

      <CustomModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDiagnosisToDelete(null);
        }}
        title="Delete Diagnosis"
        showOverlay
        backdropBlur={false}
        maxWidth="max-w-md"
        padding="px-8 py-6"
        showCloseIcon
        customFooter={
          <div className="flex justify-end items-center gap-3 px-8 py-5 border-t border-gray-100 w-full">
            <button
              type="button"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setDiagnosisToDelete(null);
              }}
              className="px-6 py-2.5 rounded-lg bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors text-sm cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                if (diagnosisToDelete) {
                  deleteDiagnosisMutation.mutate(diagnosisToDelete);
                }
              }}
              disabled={deleteDiagnosisMutation.isPending}
              className="px-6 py-2.5 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors text-sm cursor-pointer disabled:opacity-50"
            >
              {deleteDiagnosisMutation.isPending ? "Deleting..." : "Delete"}
            </button>
          </div>
        }
      >
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          Are you sure you want to delete this diagnosis? This action cannot be undone.
        </p>
      </CustomModal>
    </div>
  );
}
