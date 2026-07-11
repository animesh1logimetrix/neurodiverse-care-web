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

  // Queries
  const { data: usersData } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const res = await axiosClient.get("/user");
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
      let fileIds: number[] = [];
      if (uploadedFiles.length > 0) {
        const uploadRes = await uploadFilesMutation.mutateAsync(uploadedFiles);
        const filesArray = uploadRes?.files || [];
        fileIds = filesArray.map((item: any) => item.file?.id).filter(Boolean);
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
        fileIds: fileIds,
        score: scores,
      };

      await createAssessmentMutation.mutateAsync(payload);
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
    setScores([]);
    setFormErrors({});
    setModalMode('add');
  };

  const closeModal = () => {
    setModalMode(null);
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
          className="inline-flex items-center gap-2 rounded-lg bg-[#60a5fa] px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 transition-colors w-fit"
        >
          <PlusIcon className="w-4 h-4" />
          Add Assessment
        </button>
      </div>

      {/* Assessments List */}
      <div className="space-y-4">
        {isAssessmentsLoading ? (
          <div className="py-12 flex flex-col items-center justify-center text-gray-500">
            <svg className="animate-spin h-8 w-8 text-blue-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
                      <h3 className="font-bold text-sm text-gray-900">
                        {assessment.assesment_name} {assessment.module ? `(${assessment.module})` : ''}
                      </h3>
                      <div className="bg-green-50 border-green-200 border px-3 py-1 rounded-sm text-xs font-semibold text-green-700 whitespace-nowrap">
                        {assessment.status?.replace("_", " ")}
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
                          <button className="text-gray-600 hover:text-gray-900">
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

      {/* Add Assessment Modal */}
      <CustomModal
        isOpen={modalMode === 'add'}
        onClose={closeModal}
        title="Add Assessment"
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
              disabled={createAssessmentMutation.isPending || uploadFilesMutation.isPending}
              className="px-6 py-2 bg-[#60a5fa] text-white font-semibold rounded-lg hover:bg-blue-500 transition-colors disabled:opacity-50"
            >
              {createAssessmentMutation.isPending ? "Saving..." : "Save Assessment"}
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
                Drag & drop files here or <span className="text-[#60a5fa] font-medium">click to upload</span><br/>
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
        </div>
      </CustomModal>
    </div>
  );
}
