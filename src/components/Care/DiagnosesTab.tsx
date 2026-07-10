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

  const [selectedIepGoals, setSelectedIepGoals] = useState<number[]>([]);

  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
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
      formData.append("folder", "diagnoses");
      const res = await axiosClient.post("/media/upload", formData, {
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
      let fileIds: number[] = [];
      if (uploadedFiles.length > 0) {
        const uploadRes = await uploadFilesMutation.mutateAsync(uploadedFiles);
        const filesData = Array.isArray(uploadRes) ? uploadRes : (uploadRes?.data || []);
        fileIds = filesData.map((f: any) => f.id);
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

      await createDiagnosisMutation.mutateAsync(payload);
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
      categoryId: "", // In a real scenario, map from item
      icd10: "F84.0",
      severityLevel: item.severity,
      status: item.status,
      diagnosisDate: item.diagnosedDate,
      reviewDate: "Sep 15, 2023",
      diagnosedById: "", // Map from item.by
      clinicalNotes: item.notes
    });
    setSelectedIepGoals([]);
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
    setModalMode('add');
  };

  const closeModal = () => {
    setModalMode(null);
    setActiveDiagnosisIndex(null);
  };

  const toggleAccordion = (index: number) => {
    setOpenStates((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const diagnoses = [
    {
      title: "Autism Spectrum Disorder",
      level: "(Level 2)",
      status: "Confirmed",
      severity: "Moderate",
      diagnosedDate: "Sep 15, 2022",
      by: "Dr. Reena Kapoor",
      iepGoals: 4,
      notes:
        "Requires substantial support. Significant deficits in social communication. Restricted, repetitive behaviors impacting daily function.",
      documents: 4,
    },
    {
      title: "Autism Spectrum Disorder",
      level: "(Level 2)",
      status: "Confirmed",
      severity: "Moderate",
      diagnosedDate: "Sep 15, 2022",
      by: "Dr. Reena Kapoor",
      iepGoals: 4,
      notes:
        "Requires substantial support. Significant deficits in social communication. Restricted, repetitive behaviors impacting daily function.",
      documents: 4,
    },
    {
      title: "Autism Spectrum Disorder",
      level: "(Level 2)",
      status: "Confirmed",
      severity: "Moderate",
      diagnosedDate: "Sep 15, 2022",
      by: "Dr. Reena Kapoor",
      iepGoals: 4,
      notes:
        "Requires substantial support. Significant deficits in social communication. Restricted, repetitive behaviors impacting daily function.",
      documents: 4,
    },
  ];

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
          {diagnoses.map((item, index) => {
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
                        {item.title}{" "}
                        <span className="font-normal">{item.level}</span>
                      </h3>
                      <span className="bg-[#e5f5e8] text-[#16a34a] px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                        {item.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>Severity: {item.severity}</span>
                      <span>Diagnosed: {item.diagnosedDate}</span>
                      <span>By: {item.by}</span>
                      <span className="bg-[#e5f5e8] text-[#16a34a] px-2 py-0.5 rounded text-[10px] font-bold">
                        {item.iepGoals} IEP goals
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
                    <p className="text-sm text-gray-600 mb-4">{item.notes}</p>

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
                      <button className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors">
                        Archive
                      </button>
                      <span className="px-3 py-1.5 text-xs font-medium text-gray-500 bg-gray-50 border border-gray-100 rounded-md">
                        {item.documents} Documents
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
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
                    <span className="text-gray-500">ICD-10 Code</span> <span className="text-gray-800">F84.0</span>
                    <span className="text-gray-500">Diagnosis Date</span> <span className="text-gray-800">{item.diagnosedDate}</span>
                    <span className="text-gray-500">Diagnosed By</span> <span className="text-gray-800">{item.by}</span>
                    <span className="text-gray-500">Severity</span> <span className="text-gray-800">{item.severity} {item.level}</span>
                    <span className="text-gray-500">Status</span> 
                    <div>
                      <span className="bg-[#e5f5e8] text-[#16a34a] px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                        {item.status}
                      </span>
                    </div>
                    <span className="text-gray-500">Review Date</span> <span className="text-gray-800">Sep 15, 2023</span>
                    <span className="text-gray-500">Last Updated</span> <span className="text-gray-800">Sep 15, 2022</span>
                  </div>

                  <div className="border-l border-gray-100 pl-8">
                    <p className="text-sm font-semibold text-gray-700 mb-3">Linked IEP Goals ({item.iepGoals})</p>
                    <ul className="text-sm text-gray-600 space-y-2 mb-4">
                      <li className="flex gap-2"><span>•</span> Improve social communication skills</li>
                      <li className="flex gap-2"><span>•</span> Increase independent play</li>
                      <li className="flex gap-2"><span>•</span> Reduce repetitive behaviors</li>
                      <li className="flex gap-2"><span>•</span> Enhance daily living skills</li>
                    </ul>
                    <button className="text-sm font-medium text-gray-600 border border-[#ea580c] rounded-md px-4 py-2 hover:bg-orange-50 transition-colors">
                      View All IEP Goals
                    </button>
                  </div>
                </div>

                {/* Row 2: Reports & Documents */}
                <div className="mb-8 pt-6 border-t border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-700 mb-4">Reports & Documents</h3>
                  <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
                    {/* Card 1 */}
                    <div className="w-40 shrink-0 border border-orange-200 rounded-xl p-4 flex flex-col justify-end h-40">
                      <p className="font-bold text-gray-800 text-sm mb-1">Diagnostic Report</p>
                      <p className="text-xs text-gray-500 mb-0.5">Sep 15, 2022</p>
                      <p className="text-xs text-gray-500">Dr. Reena Kapoor</p>
                      <p className="text-xs text-gray-400 mt-2">1.2 MB</p>
                    </div>
                    {/* Card 2 */}
                    <div className="w-40 shrink-0 border border-orange-200 rounded-xl p-4 flex flex-col justify-end h-40">
                      <p className="font-bold text-gray-800 text-sm mb-1">MRI Brain Scan</p>
                      <p className="text-xs text-gray-500 mb-0.5">Aug 28, 2022</p>
                      <p className="text-xs text-gray-500">Image</p>
                      <p className="text-xs text-gray-400 mt-2">2.4 MB</p>
                    </div>
                    {/* Card 3 */}
                    <div className="w-40 shrink-0 border border-orange-200 rounded-xl p-4 flex flex-col justify-end h-40">
                      <p className="font-bold text-gray-800 text-sm mb-1">EEG Report</p>
                      <p className="text-xs text-gray-500 mb-0.5">Aug 20, 2022</p>
                      <p className="text-xs text-gray-400 mt-2">pdf 1.1 MB</p>
                    </div>
                    {/* Card 4 */}
                    <div className="w-40 shrink-0 border border-orange-200 rounded-xl p-4 flex flex-col justify-end h-40">
                      <p className="font-bold text-gray-800 text-sm mb-1">Developmental Assessment</p>
                      <p className="text-xs text-gray-500 mb-0.5">Jul 10, 2022</p>
                      <p className="text-xs text-gray-400 mt-2">pdf 1.5 MB</p>
                    </div>
                    {/* Upload Card */}
                    <label className="w-40 shrink-0 border border-dashed border-gray-300 rounded-xl p-4 flex flex-col items-center justify-center h-40 hover:bg-gray-50 transition-colors text-gray-500 hover:text-gray-700 cursor-pointer">
                      <input type="file" className="hidden" multiple />
                      <svg className="w-6 h-6 mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                      <span className="text-sm font-medium">Upload More</span>
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
                  { value: 'Mild', label: 'Mild' },
                  { value: 'Moderate', label: 'Moderate' },
                  { value: 'Severe', label: 'Severe' }
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
                  { value: 'Confirmed', label: 'Confirmed' },
                  { value: 'Suspected', label: 'Suspected' }
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
            {uploadedFiles.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {uploadedFiles.map((file, idx) => (
                  <div key={idx} className="text-xs bg-gray-100 text-gray-700 border border-gray-200 px-3 py-1.5 rounded-md flex items-center gap-2">
                    {file.name}
                    <button 
                      type="button" 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        setUploadedFiles(prev => prev.filter((_, i) => i !== idx)); 
                      }} 
                      className="text-gray-400 hover:text-red-500 font-bold"
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
              disabled={createDiagnosisMutation.isPending || uploadFilesMutation.isPending}
              className="px-8 py-2 text-sm font-bold text-white bg-[#7dd3fc] rounded-lg hover:bg-[#38bdf8] transition-colors disabled:opacity-50"
            >
              {createDiagnosisMutation.isPending || uploadFilesMutation.isPending ? "Saving..." : "Save Diagnosis"}
            </button>
          </div>

        </div>
      </CustomModal>
    </div>
  );
}
