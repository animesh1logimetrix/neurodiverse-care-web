import { useState, useRef } from "react";
import { PlusIcon } from "../../icons";
import CustomModal from "../ui/modal/CustomModal";
import Input from "../form/input/InputField";
import Select from "../form/Select";
import DatePicker from "../form/date-picker";
import Label from "../form/Label";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosClient from "../../api/axiosClient";
import toast from "react-hot-toast";
import { useParams } from "react-router";

interface Assessment {
  id: string;
  title: string;
  date: string;
  doctor: string;
  linkedGoals: number;
  status: string;
  scores?: {
    label: string;
    score: string | number;
    description: string;
  }[];
  summary?: string;
}

export default function AssessmentsTab() {
  const { id: childId } = useParams();
  const queryClient = useQueryClient();

  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [modalMode, setModalMode] = useState<'view' | 'edit' | 'add' | null>(null);
  const [activeAssessmentIndex, setActiveAssessmentIndex] = useState<number | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [assessmentToDelete, setAssessmentToDelete] = useState<number | null>(null);

  // Queries
  const { data: usersData } = useQuery({
    queryKey: ["user", "therapist"],
    queryFn: async () => {
      const res = await axiosClient.get("/user?roleName=therapist");
      return res.data;
    },
  });
  const users = Array.isArray(usersData) ? usersData : usersData?.data || [];

  const { data: iepGoalsData } = useQuery({
    queryKey: ["iep-goal"],
    queryFn: async () => {
      const res = await axiosClient.get("/iep-goal");
      return res.data;
    },
  });
  const allIepGoals = Array.isArray(iepGoalsData) ? iepGoalsData : iepGoalsData?.data || [];

  const { data: childAssessmentsData, isLoading: isAssessmentsLoading } = useQuery({
    queryKey: ["assessments", childId],
    queryFn: async () => {
      const res = await axiosClient.get(`/assessment?childId=${childId}`);
      return res.data;
    },
    enabled: !!childId,
  });

  const fetchedAssessments = Array.isArray(childAssessmentsData) ? childAssessmentsData : childAssessmentsData?.data || [];

  // Mutations
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

  const createAssessmentMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await axiosClient.post("/assessment", payload);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Assessment added successfully");
      queryClient.invalidateQueries({ queryKey: ["child", childId] });
      queryClient.invalidateQueries({ queryKey: ["assessments", childId] });
      closeModal();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to add assessment");
    }
  });

  const updateAssessmentMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: number, payload: any }) => {
      const res = await axiosClient.patch(`/assessment/${id}`, payload);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Assessment updated successfully");
      queryClient.invalidateQueries({ queryKey: ["assessments", childId] });
      closeModal();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update assessment");
    }
  });

  const deleteAssessmentMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await axiosClient.delete(`/assessment/${id}`);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Assessment deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["assessments", childId] });
      setIsDeleteModalOpen(false);
      setAssessmentToDelete(null);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to delete assessment");
    }
  });

  // Form State
  const [formData, setFormData] = useState({
    assesment_name: "",
    module: "",
    assesment_type: "",
    assesment_date: "",
    psychologist_id: "",
    location: "",
    status: "",
    clinical_summary: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [selectedIepGoals, setSelectedIepGoals] = useState<number[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [existingFiles, setExistingFiles] = useState<any[]>([]);
  
  // Scores state
  const [scores, setScores] = useState<{domain: string, score: string, interpretation: string, percentile: string}[]>([]);

  const updateForm = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setFormErrors(prev => ({ ...prev, [field]: "" }));
  };

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

  const handleAddScore = () => {
    setScores(prev => [...prev, { domain: "", score: "", interpretation: "", percentile: "" }]);
  };

  const handleScoreChange = (index: number, field: string, value: string) => {
    const newScores = [...scores];
    newScores[index] = { ...newScores[index], [field]: value };
    setScores(newScores);
  };

  const removeScore = (index: number) => {
    setScores(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.assesment_name.trim()) errors.assesment_name = "Assessment Name is required.";
    if (!formData.assesment_type.trim()) errors.assesment_type = "Type is required.";
    if (!formData.assesment_date) errors.assesment_date = "Date of Assessment is required.";
    if (!formData.psychologist_id) errors.psychologist_id = "Assigned Psychologist is required.";
    if (!formData.status) errors.status = "Status is required.";
    return errors;
  };

  const handleSave = async () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      let finalFileIds: number[] = existingFiles.map((f: any) => f.id);
      if (uploadedFiles.length > 0) {
        const uploadRes = await uploadFilesMutation.mutateAsync(uploadedFiles);
        const filesArray = uploadRes?.files || [];
        const newIds = filesArray.map((item: any) => item.file?.id).filter(Boolean);
        finalFileIds = [...finalFileIds, ...newIds];
      }

      const payload = {
        child_id: Number(childId),
        assesment_name: formData.assesment_name,
        module: formData.module,
        assesment_type: formData.assesment_type,
        assesment_date: formData.assesment_date,
        psychologist_id: Number(formData.psychologist_id),
        location: formData.location,
        status: formData.status,
        clinical_summary: formData.clinical_summary,
        linkedGoals: selectedIepGoals,
        fileIds: finalFileIds,
        score: scores,
      };

      if (modalMode === 'edit' && activeAssessmentIndex !== null) {
        const item = fetchedAssessments[activeAssessmentIndex];
        await updateAssessmentMutation.mutateAsync({ id: item.id, payload });
      } else {
        await createAssessmentMutation.mutateAsync(payload);
      }
    } catch (error) {
      console.error("Error saving assessment:", error);
    }
  };

  const openAddModal = () => {
    setFormData({
      assesment_name: "",
      module: "",
      assesment_type: "",
      assesment_date: "",
      psychologist_id: "",
      location: "",
      status: "",
      clinical_summary: "",
    });
    setSelectedIepGoals([]);
    setUploadedFiles([]);
    setExistingFiles([]);
    setScores([]);
    setFormErrors({});
    setModalMode('add');
  };

  const openEditModal = (index: number) => {
    const item = fetchedAssessments[index];
    setActiveAssessmentIndex(index);
    setFormData({
      assesment_name: item.assesment_name || "",
      module: item.module || "",
      assesment_type: item.assesment_type || "",
      assesment_date: item.assesment_date ? item.assesment_date.split('T')[0] : "",
      psychologist_id: item.psychologist_id || "",
      location: item.location || "",
      status: item.status || "",
      clinical_summary: item.clinical_summary || "",
    });
    setSelectedIepGoals(item.linkedGoals ? item.linkedGoals.map((g: any) => g.goal_id) : []);
    setScores(item.score || []);
    setExistingFiles(item.reports || []);
    setUploadedFiles([]);
    setModalMode('edit');
  };

  const openViewModal = (index: number) => {
    setActiveAssessmentIndex(index);
    setModalMode('view');
  };

  const closeModal = () => {
    setModalMode(null);
    setActiveAssessmentIndex(null);
  };

  const handleDelete = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setAssessmentToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Assessments</h2>
          <p className="text-sm text-gray-500 mt-1">
            {fetchedAssessments.length} assessments on record
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 rounded-lg bg-[#2DA0FF] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2DA0FF] transition-colors w-fit"
        >
          <PlusIcon className="w-4 h-4" />
          Add Assessment
        </button>
      </div>

      {/* Assessments List */}
      <div className="space-y-4">
        {isAssessmentsLoading ? (
          <div className="py-12 flex flex-col items-center justify-center text-gray-500">
            <svg className="animate-spin h-8 w-8 text-[#2DA0FF] mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-sm font-medium">Loading assessments...</p>
          </div>
        ) : fetchedAssessments.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            <p className="text-gray-600 font-medium">No assessments found</p>
            <p className="text-sm mt-1">Click "Add Assessment" to create a new record.</p>
          </div>
        ) : (
          fetchedAssessments.map((assessment: any, index: number) => {
            const isOpen = openIndex === index;
            const linkedGoalsCount = assessment.linkedGoals ? assessment.linkedGoals.length : 0;

            return (
              <div
                key={assessment.id}
                className="w-full bg-white border border-orange-200 rounded-lg p-4 cursor-pointer transition-colors"
                onClick={() => handleToggle(index)}
              >
                {/* Header */}
                <div className="flex items-start gap-3">
                  <div className="mt-1 flex-shrink-0 text-orange-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="font-bold text-sm text-gray-900">
                          {assessment.assesment_name} {assessment.module ? `(${assessment.module})` : ''}
                        </h3>
                        {assessment.status && (
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            assessment.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                            assessment.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                            assessment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {assessment.status.replace("_", " ")}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={(e) => { e.stopPropagation(); openEditModal(index); }}
                          className="text-gray-400 hover:text-[#2DA0FF] transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                        </button>
                        <button 
                          onClick={(e) => handleDelete(e, assessment.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                      <span>Date: {assessment.assesment_date ? new Date(assessment.assesment_date).toLocaleDateString() : 'N/A'}</span>
                      <span>By: {assessment.psychologist?.name || 'Unknown'}</span>
                      <span className="ml-2">{linkedGoalsCount} linked goal{linkedGoalsCount !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                </div>

                {/* Expanded Content */}
                {isOpen && (
                  <div 
                    className="mt-4 pt-4 border-t border-gray-100"
                    onClick={(e) => e.stopPropagation()} 
                  >
                    {assessment.score && assessment.score.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        {assessment.score.map((scoreObj: any, idx: number) => (
                          <div key={idx} className="border border-orange-100 rounded-md p-3">
                            <p className="text-xs text-gray-600 mb-1">{scoreObj.domain}</p>
                            <p className="text-lg font-bold text-gray-900 mb-1">{scoreObj.score}</p>
                            <p className="text-xs text-gray-500">{scoreObj.interpretation}</p>
                            {scoreObj.percentile && <p className="text-xs text-gray-400 mt-1">{scoreObj.percentile}</p>}
                          </div>
                        ))}
                      </div>
                    )}

                    {assessment.clinical_summary && (
                      <div className="bg-orange-50/50 rounded-md p-4 border border-orange-100">
                        <p className="text-xs font-bold text-gray-800 mb-1">Clinical Summary</p>
                        <p className="text-xs text-gray-600 leading-relaxed mb-4">
                          {assessment.clinical_summary}
                        </p>
                        
                        <div className="flex items-center gap-4 text-xs font-semibold">
                          <button 
                            className="text-gray-600 hover:text-gray-900"
                            onClick={(e) => { e.stopPropagation(); openViewModal(index); }}
                          >
                            View linked IEP goals
                          </button>
                        </div>
                      </div>
                    )}

                    {assessment.reports && assessment.reports.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-dashed border-gray-100">
                        <p className="text-xs font-bold text-gray-800 mb-3">Uploaded Documents</p>
                        <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
                          {assessment.reports.map((report: any) => (
                            <a 
                              key={report.id} 
                              href={report.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-40 shrink-0 border border-orange-200 rounded-xl p-4 flex flex-col justify-end h-32 hover:bg-orange-50 transition-colors"
                            >
                              <p className="font-bold text-gray-800 text-sm mb-1 line-clamp-2" title={report.original_file_name}>
                                {report.original_file_name || "Document"}
                              </p>
                              <p className="text-xs text-gray-500 capitalize">{report.file_type || "File"}</p>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* View Assessment Modal */}
      <CustomModal 
        isOpen={modalMode === 'view' && activeAssessmentIndex !== null} 
        onClose={closeModal}
        title="Assessment Details (View)"
        maxWidth="max-w-4xl"
        maxBodyHeight="80vh"
        padding="p-0"
        customFooter={<></>}
      >
        {modalMode === 'view' && activeAssessmentIndex !== null && (() => {
          const item = fetchedAssessments[activeAssessmentIndex];
          return (
            <div className="flex flex-col">
              <div className="p-6 pt-8">
                {/* Header Card */}
                <div className="border border-orange-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 flex-shrink-0 text-orange-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-sm text-gray-900">
                        {item.assesment_name} {item.module ? `(${item.module})` : ''}
                      </h3>
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                        <span>Date: {item.assesment_date ? new Date(item.assesment_date).toLocaleDateString() : 'N/A'}</span>
                        <span>By: {item.psychologist?.name || 'Unknown'}</span>
                        <span className="ml-2">{item.linkedGoals ? item.linkedGoals.length : 0} linked goal(s)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-8">
                  {/* Left Column - Scores */}
                  <div className="md:col-span-4 space-y-4">
                    {item.score && item.score.length > 0 ? (
                      item.score.map((scoreObj: any, idx: number) => (
                        <div key={idx} className="border border-gray-200 rounded-md p-4 bg-white">
                          <p className="text-sm text-gray-600 mb-1">{scoreObj.domain}</p>
                          <p className="text-xl font-bold text-gray-900 mb-1">{scoreObj.score}</p>
                          <p className="text-sm text-gray-500">{scoreObj.interpretation}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-400 italic">No scores recorded.</p>
                    )}
                  </div>

                  {/* Right Column - Details */}
                  <div className="md:col-span-8">
                    <div className="grid grid-cols-2 gap-8">
                      {/* Clinical Summary */}
                      <div>
                        <h4 className="font-bold text-sm text-gray-900 mb-2">Clinical Summary</h4>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {item.clinical_summary || "No summary provided."}
                        </p>
                      </div>

                      {/* Assessment Information */}
                      <div>
                        <h4 className="font-bold text-sm text-gray-900 mb-2">Assessment Information</h4>
                        <div className="grid grid-cols-[140px_1fr] gap-y-2 text-sm">
                          <span className="text-gray-500">Type</span>
                          <span className="text-gray-900">{item.assesment_type?.replace("_", " ")}</span>
                          <span className="text-gray-500">Module/Subte</span>
                          <span className="text-gray-900">{item.module || "-"}</span>
                          <span className="text-gray-500">Assigned Psychologist</span>
                          <span className="text-gray-900">{item.psychologist?.name}</span>
                          <span className="text-gray-500">Location</span>
                          <span className="text-gray-900">{item.location || "-"}</span>
                          <span className="text-gray-500">Status</span>
                          <span className="text-gray-900">{item.status?.replace("_", " ")}</span>
                          <span className="text-gray-500">Last Updated</span>
                          <span className="text-gray-900">{item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : "-"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Linked IEP Goals */}
                    <div className="mt-8">
                      <h4 className="font-bold text-sm text-gray-900 mb-3">Linked IEP Goals ({item.linkedGoals?.length || 0})</h4>
                      <div className="flex flex-wrap gap-3">
                        {item.linkedGoals?.map((link: any, idx: number) => (
                          <div key={idx} className="bg-[#e5fcf0] text-[#16a34a] border border-[#bbf7d0] px-3 py-1.5 rounded-full text-xs font-semibold flex items-center">
                            {link.goal?.goal_title || `Goal ${link.goal_id}`}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Documents & Reports */}
                <div className="pt-6 border-t border-gray-100 mb-8">
                  <h3 className="text-sm font-semibold text-gray-700 mb-4">Report Documents</h3>
                  <div className="flex flex-col gap-4 mb-4">
                    {item.reports && item.reports.map((report: any) => (
                      <a 
                        key={report.id} 
                        href={report.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-4 p-2 hover:bg-gray-50 rounded-lg transition-colors w-fit pr-10"
                      >
                        <div className="w-10 h-10 flex-shrink-0 bg-blue-50 text-[#2DA0FF] rounded flex items-center justify-center">
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-bold text-gray-800 text-sm">{report.original_file_name || "Document"}</p>
                          <p className="text-xs text-gray-500 uppercase mt-0.5">
                            {report.file_size ? `${(report.file_size / 1024).toFixed(0)} KB` : ''} {report.file_type || "FILE"}
                          </p>
                        </div>
                      </a>
                    ))}
                  </div>
                  
                  {/* Upload Button */}
                  <label className="block w-full max-w-xs border border-[#86efac] bg-[#f0fdf4] text-[#16a34a] rounded-full py-2 flex flex-col items-center justify-center hover:bg-[#dcfce7] transition-colors cursor-pointer relative font-semibold text-sm text-center">
                    <input 
                      type="file" 
                      className="hidden" 
                      multiple 
                      accept="image/jpeg, image/png, application/pdf"
                      disabled={uploadFilesMutation.isPending || updateAssessmentMutation.isPending}
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
                              child_id: Number(childId),
                              assesment_name: item.assesment_name,
                              module: item.module,
                              assesment_type: item.assesment_type,
                              assesment_date: item.assesment_date,
                              psychologist_id: Number(item.psychologist_id),
                              location: item.location,
                              status: item.status,
                              clinical_summary: item.clinical_summary,
                              linkedGoals: item.linkedGoals ? item.linkedGoals.map((g: any) => g.goal_id) : [],
                              fileIds: allFileIds,
                              score: item.score,
                            };
                            await updateAssessmentMutation.mutateAsync({ id: item.id, payload });
                          } catch (err) {
                             console.error("Upload more error:", err);
                          }
                        }
                      }}
                    />
                    {(uploadFilesMutation.isPending || updateAssessmentMutation.isPending) ? (
                      <span>Uploading...</span>
                    ) : (
                      <span>Upload More</span>
                    )}
                  </label>
                </div>

                {/* Activity History */}
                <div className="pt-6 border-t border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-700 mb-4">Activity</h3>
                  <div className="relative pt-2 pl-1">
                    <div className="absolute left-[8px] top-4 bottom-4 w-px bg-gray-200" />
                    
                    <div className="flex items-center gap-8 mb-6 relative z-10">
                      <div className="w-2 h-2 rounded-full bg-[#10b981] ring-4 ring-white shrink-0" />
                      <div className="w-24 text-sm text-[#64748b] shrink-0">
                        {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : "-"}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <p className="text-sm text-[#334155]">Last updated</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-8 relative z-10">
                      <div className="w-2 h-2 rounded-full bg-[#2563eb] ring-4 ring-white shrink-0" />
                      <div className="w-24 text-sm text-[#64748b] shrink-0">
                        {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "-"}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <p className="text-sm text-[#334155]">Assessment scheduled</p>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          );
        })()}
      </CustomModal>

      {/* Add Assessment Modal */}

      <CustomModal
        isOpen={modalMode === 'add' || modalMode === 'edit'}
        onClose={closeModal}
        title={modalMode === 'edit' ? "Edit Assessment" : "Add Assessment"}
        maxWidth="max-w-3xl"
        customFooter={
          <div className="flex justify-center gap-4 px-8 py-5 w-full border-t border-gray-100">
            <button
              onClick={closeModal}
              className="px-6 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={createAssessmentMutation.isPending || updateAssessmentMutation.isPending || uploadFilesMutation.isPending}
              className="px-6 py-2 bg-[#2DA0FF] text-white font-semibold rounded-lg hover:bg-[#2DA0FF] transition-colors disabled:opacity-50"
            >
              {createAssessmentMutation.isPending || updateAssessmentMutation.isPending ? "Saving..." : "Save Assessment"}
            </button>
          </div>
        }
      >
        <div>
          <h3 className="text-gray-800 font-semibold mb-6">Assessment Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 mb-6">
            <div>
              <Label>Assessment Name*</Label>
              <Input value={formData.assesment_name} onChange={(e) => updateForm('assesment_name', e.target.value)} placeholder="Enter Assessment Name" />
              {formErrors.assesment_name && <p className="mt-1 text-xs text-red-600">{formErrors.assesment_name}</p>}
            </div>
            
            <div>
              <Label>Module/Subtest (optional)</Label>
              <Input value={formData.module} onChange={(e) => updateForm('module', e.target.value)} placeholder="Enter Module" />
            </div>

            <div>
              <Label>Type*</Label>
              <Select 
                key={`type-${formData.assesment_type}`}
                defaultValue={formData.assesment_type}
                options={[
                  { value: 'OBSERVATION_BASED', label: 'Observation Based' },
                  { value: 'QUESTIONNAIRE', label: 'Questionnaire' },
                  { value: 'SCREENING', label: 'Screening' },
                  { value: 'DIAGNOSTIC', label: 'Diagnostic' },
                  { value: 'DEVELOPMENTAL', label: 'Developmental' }
                ]}
                onChange={(val) => updateForm('assesment_type', val)}
                placeholder="Select Type"
              />
              {formErrors.assesment_type && <p className="mt-1 text-xs text-red-600">{formErrors.assesment_type}</p>}
            </div>

            <div>
              <Label>Date of Assessment*</Label>
              <DatePicker 
                key={`assess-date-${formData.assesment_date}`}
                id="assesment_date"
                defaultDate={formData.assesment_date}
                maxDate="today"
                onChange={(dates) => updateForm('assesment_date', dates[0]?.toString() || '')} 
                placeholder="Select Date" 
              />
              {formErrors.assesment_date && <p className="mt-1 text-xs text-red-600">{formErrors.assesment_date}</p>}
            </div>

            <div>
              <Label>Assigned Psychologist*</Label>
              <Select 
                key={`psychologistId-${formData.psychologist_id}`}
                defaultValue={formData.psychologist_id}
                options={users.map((u: any) => ({ value: String(u.id), label: u.name || `User ${u.id}` }))}
                onChange={(val) => updateForm('psychologist_id', val)}
                placeholder="Select Psychologist"
              />
              {formErrors.psychologist_id && <p className="mt-1 text-xs text-red-600">{formErrors.psychologist_id}</p>}
            </div>
            
            <div>
              <Label>Location (optional)</Label>
              <Input value={formData.location} onChange={(e) => updateForm('location', e.target.value)} placeholder="Enter Location" />
            </div>

            <div>
              <Label>Status*</Label>
              <Select 
                key={`status-${formData.status}`}
                defaultValue={formData.status}
                options={[
                  { value: 'PENDING', label: 'Pending' },
                  { value: 'IN_PROGRESS', label: 'In Progress' },
                  { value: 'COMPLETED', label: 'Completed' },
                  { value: 'CANCELLED', label: 'Cancelled' }
                ]}
                onChange={(val) => updateForm('status', val)}
                placeholder="Select Status"
              />
              {formErrors.status && <p className="mt-1 text-xs text-red-600">{formErrors.status}</p>}
            </div>

            <div>
              <Label>Linked IEP Goals (optional)*</Label>
              <Select 
                key={selectedIepGoals.length}
                options={allIepGoals
                  .filter((g: any) => !selectedIepGoals.includes(g.id))
                  .map((g: any) => ({ value: String(g.id), label: g.goal_title || `Goal ${g.id}` }))}
                onChange={handleGoalSelect}
                placeholder="Select an IEP Goal"
              />
              {selectedIepGoals.length > 0 && (
                <div className="mt-3 grid grid-cols-1 gap-2">
                  {selectedIepGoals.map((goalId, idx) => {
                    const goalObj = allIepGoals.find((g: any) => g.id === goalId);
                    const goalLabel = goalObj ? (goalObj.goal_title || `Goal ${goalId}`) : `Goal ${goalId}`;
                    return (
                      <div key={idx} className="bg-[#e5fcf0] text-[#16a34a] text-xs font-semibold px-3 py-1.5 rounded-md flex justify-between items-center">
                        <span className="truncate">{goalLabel}</span>
                        <button type="button" onClick={() => removeGoal(goalId)} className="text-[#16a34a] hover:text-green-700 font-bold ml-2">X</button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
          
          <div className="mb-8">
            <div className="flex justify-between items-center mb-3">
              <Label className="mb-0">Scores/Results (optional)</Label>
              <button 
                type="button" 
                onClick={handleAddScore}
                className="text-xs font-semibold text-green-600 bg-green-50 border border-green-200 px-3 py-1.5 rounded hover:bg-green-100 transition-colors flex items-center gap-1"
              >
                + Add Score
              </button>
            </div>
            
            {scores.length > 0 && (
              <div className="mb-4 overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead>
                    <tr className="border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wider">
                      <th className="pb-3 font-semibold pr-4">Domain/Metric</th>
                      <th className="pb-3 font-semibold pr-4">Score</th>
                      <th className="pb-3 font-semibold pr-4">Interpretation</th>
                      <th className="pb-3 font-semibold pr-4">Percentile/Range</th>
                      <th className="pb-3 font-semibold text-center w-10">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {scores.map((score, idx) => (
                      <tr key={idx}>
                        <td className="py-2 pr-4">
                          <input 
                            type="text" 
                            className="w-full text-sm outline-none border border-gray-200 rounded px-2 py-1.5 focus:border-blue-400" 
                            placeholder="e.g. Social Affect" 
                            value={score.domain} 
                            onChange={(e) => handleScoreChange(idx, 'domain', e.target.value)}
                          />
                        </td>
                        <td className="py-2 pr-4">
                          <input 
                            type="text" 
                            className="w-full text-sm outline-none border border-gray-200 rounded px-2 py-1.5 focus:border-blue-400" 
                            placeholder="e.g. 12" 
                            value={score.score} 
                            onChange={(e) => handleScoreChange(idx, 'score', e.target.value)}
                          />
                        </td>
                        <td className="py-2 pr-4">
                          <input 
                            type="text" 
                            className="w-full text-sm outline-none border border-gray-200 rounded px-2 py-1.5 focus:border-blue-400" 
                            placeholder="e.g. Moderate concern" 
                            value={score.interpretation} 
                            onChange={(e) => handleScoreChange(idx, 'interpretation', e.target.value)}
                          />
                        </td>
                        <td className="py-2 pr-4">
                          <input 
                            type="text" 
                            className="w-full text-sm outline-none border border-gray-200 rounded px-2 py-1.5 focus:border-blue-400" 
                            placeholder="e.g. 10th percentile" 
                            value={score.percentile} 
                            onChange={(e) => handleScoreChange(idx, 'percentile', e.target.value)}
                          />
                        </td>
                        <td className="py-2 text-center align-middle">
                          <button type="button" onClick={() => removeScore(idx)} className="text-gray-400 hover:text-red-500 font-bold p-1">
                            X
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {scores.length === 0 && (
              <p className="text-xs text-gray-400 italic">Add key scores or results</p>
            )}
          </div>

          <div className="mb-8">
            <Label>Clinical Summary/Notes</Label>
            <textarea 
              rows={4}
              className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:border-blue-400 resize-none"
              placeholder="Enter clinical summary, observations, key findings..."
              value={formData.clinical_summary}
              onChange={(e) => updateForm('clinical_summary', e.target.value)}
            />
          </div>

          <div className="mb-4">
            <Label>Upload Report/Documents (optional)</Label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <svg className="w-6 h-6 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
              <p className="text-sm text-gray-500">
                Drag & drop files here or <span className="text-[#2DA0FF] font-medium">click to upload</span><br/>
                <span className="text-xs text-gray-400">Supports: PDF, JPG, PNG (Max 20MB each)</span>
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
                {existingFiles.map((f: any, idx: number) => (
                  <div key={`existing-${idx}`} className="text-xs bg-gray-100 text-gray-700 border border-gray-200 px-3 py-1.5 rounded-md flex items-center gap-2">
                    <a href={f.file_url} target="_blank" rel="noreferrer" className="hover:underline">
                      {f.original_file_name || f.file_name}
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
                      className="text-gray-400 hover:text-red-500 font-bold"
                    >
                      X
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CustomModal>

      {/* Delete Confirmation Modal */}
      <CustomModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Assessment"
        maxWidth="max-w-md"
        customFooter={
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 text-gray-700 bg-gray-100 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (assessmentToDelete) deleteAssessmentMutation.mutate(assessmentToDelete);
              }}
              disabled={deleteAssessmentMutation.isPending}
              className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center min-w-[80px]"
            >
              {deleteAssessmentMutation.isPending ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                "Delete"
              )}
            </button>
          </div>
        }
      >
        <div>
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 text-red-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
              </svg>
            </div>
            <div>
              <h4 className="text-gray-900 font-semibold mb-1">Are you sure?</h4>
              <p className="text-sm text-gray-500">
                Are you sure you want to delete this assessment? This action cannot be undone and will permanently remove this record.
              </p>
            </div>
          </div>
        </div>
      </CustomModal>
    </div>
  );
}
