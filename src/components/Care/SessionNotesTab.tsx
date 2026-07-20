import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosClient from "../../api/axiosClient";
import toast from "react-hot-toast";
import CustomModal from "../ui/modal/CustomModal";
import Input from "../form/input/InputField";
import Select from "../form/Select";
import DatePicker from "../form/date-picker";
import Label from "../form/Label";
import { HorizontaLDots } from "../../icons";

interface SessionNote {
  id: string;
  initials: string;
  therapist: string;
  role: string;
  type: string;
  duration: string;
  datetime: string;
  goals: string[];
}

const mockNotes: SessionNote[] = [
  {
    id: "1",
    initials: "RS",
    therapist: "Rohit Sharma",
    role: "ABA Therapist",
    type: "ABA",
    duration: "60 min",
    datetime: "Apr 29, 2026 at 10:30 AM",
    goals: ["G-02-Name Response", "G-05-Emotional Regulation"],
  },
  {
    id: "2",
    initials: "PS",
    therapist: "Priya Sharma",
    role: "Speech Therapist",
    type: "Speech",
    duration: "45 min",
    datetime: "Apr 28, 2026 at 11:30 AM",
    goals: ["G-01-3-Word Phrases"],
  },
  {
    id: "3",
    initials: "RS",
    therapist: "Rohit Sharma",
    role: "ABA Therapist",
    type: "ABA",
    duration: "60 min",
    datetime: "Apr 28, 2026 at 10:30 AM",
    goals: ["G-02-Name Response", "G-05-Emotional Regulation"],
  }
];

const domains = [
  { value: "All", label: "All" },
  { value: "CONSULTATION", label: "Consultation" },
  { value: "ABA", label: "ABA" },
  { value: "SPEECH", label: "Speech" },
  { value: "OCCUPATIONAL", label: "Occupational" },
  { value: "PHYSIOTHERAPY", label: "Physiotherapy" },
  { value: "PSYCHOLOGY", label: "Psychology" },
  { value: "ASSESSMENT", label: "Assessment" },
  { value: "FOLLOW_UP", label: "Follow Up" }
];

const SessionNotesTab = () => {
  const [activeDomain, setActiveDomain] = useState("All");
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'view' | null>(null);
  const [activeSessionId, setActiveSessionId] = useState<number | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<number | null>(null);
  const queryClient = useQueryClient();

  // Form State
  const [formData, setFormData] = useState({
    childId: "",
    therapistId: "",
    sessionType: "",
    date: "",
    startTime: "",
    duration: "",
    location: "",
    status: "",
    relatedGoals: "",
    preSessionNotes: "",
    postSessionNotes: ""
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const updateForm = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setFormErrors(prev => ({ ...prev, [field]: "" }));
  };

  // Queries for dropdown data
  const { data: childrenData } = useQuery({
    queryKey: ["child"],
    queryFn: async () => {
      const res = await axiosClient.get("/child");
      return res.data;
    },
  });

  const { data: usersData } = useQuery({
    queryKey: ["user", "therapist"],
    queryFn: async () => {
      const res = await axiosClient.get("/user?roleName=therapist");
      return res.data;
    },
  });

  const children = Array.isArray(childrenData) ? childrenData : childrenData?.data || [];
  const users = Array.isArray(usersData) ? usersData : usersData?.data || [];

  const { data: sessionData, isLoading: isSessionsLoading } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const res = await axiosClient.get("/session");
      return res.data;
    },
  });

  const sessions = Array.isArray(sessionData) ? sessionData : sessionData?.data || [];

  const sessionNotesList = sessions.map((session: any) => {
    const therapistName = session.therapist?.name || "Unknown Therapist";
    let initials = "NA";
    if (therapistName !== "Unknown Therapist") {
      const parts = therapistName.split(' ').filter(Boolean);
      if (parts.length > 1) {
         initials = (parts[0][0] + parts[parts.length-1][0]).toUpperCase();
      } else if (parts.length === 1) {
         initials = parts[0].substring(0, 2).toUpperCase();
      }
    }

    const dateStr = session.sessionDate 
      ? new Date(session.sessionDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : "No Date";

    const timeStr = session.startTime 
      ? new Date(session.startTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
      : "";

    const datetimeStr = timeStr ? `${dateStr} at ${timeStr}` : dateStr;

    const typeObj = domains.find(d => d.value === session.session_type);
    const friendlyType = typeObj ? typeObj.label : session.session_type || "Unknown";

    return {
      id: String(session.id),
      initials,
      therapist: therapistName,
      role: session.therapist?.role?.name || "Therapist",
      type: session.session_type,
      displayType: friendlyType,
      duration: `${session.duration || 0} min`,
      datetime: datetimeStr,
      goals: session.session_notes ? session.session_notes.split(',').map((g: string) => g.trim()).filter(Boolean) : [],
    };
  });

  const createSessionMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await axiosClient.post("/session", payload);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Session note added successfully");
      queryClient.invalidateQueries({ queryKey: ["session"] });
      closeModal();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to add session note");
    }
  });

  const updateSessionMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: number, payload: any }) => {
      const res = await axiosClient.patch(`/session/${id}`, payload);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Session note updated successfully");
      queryClient.invalidateQueries({ queryKey: ["session"] });
      closeModal();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update session note");
    }
  });

  const deleteSessionMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await axiosClient.delete(`/session/${id}`);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Session note deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["session"] });
      setIsDeleteModalOpen(false);
      setSessionToDelete(null);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to delete session note");
    }
  });

  const openAddModal = () => {
    setFormData({
      childId: "", therapistId: "", sessionType: "", date: "",
      startTime: "", duration: "", location: "", status: "",
      relatedGoals: "", preSessionNotes: "", postSessionNotes: ""
    });
    setFormErrors({});
    setModalMode('add');
    setActiveSessionId(null);
  };

  const openEditModal = (id: string) => {
    const session = sessions.find((s: any) => String(s.id) === id);
    if (!session) return;
    
    setFormData({
      childId: String(session.child_id || ""),
      therapistId: String(session.therapist_id || ""),
      sessionType: session.session_type || "",
      date: session.sessionDate || "",
      startTime: session.startTime ? new Date(session.startTime).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }) : "",
      duration: String(session.duration || ""),
      location: session.location || "",
      status: session.status || "COMPLETED",
      relatedGoals: session.session_notes || "",
      preSessionNotes: session.pre_session_notes || "",
      postSessionNotes: session.post_session_notes || ""
    });
    setFormErrors({});
    setActiveSessionId(Number(id));
    setModalMode('edit');
  };

  const openViewModal = (id: string) => {
    setActiveSessionId(Number(id));
    setModalMode('view');
  };

  const closeModal = () => {
    setModalMode(null);
    setActiveSessionId(null);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.childId) errors.childId = "Child is required.";
    if (!formData.therapistId) errors.therapistId = "Therapist is required.";
    if (!formData.sessionType.trim()) errors.sessionType = "Session Type is required.";
    if (!formData.date) errors.date = "Date is required.";
    if (!formData.startTime.trim()) errors.startTime = "Start Time is required.";
    if (!formData.duration.trim()) errors.duration = "Duration is required.";
    else if (isNaN(Number(formData.duration))) errors.duration = "Duration must be a number.";
    return errors;
  };

  const handleSave = () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    let startDateTime = formData.startTime;
    if (formData.date && formData.startTime) {
      try {
        const dateObj = new Date(formData.date);
        const [hours, minutes] = formData.startTime.split(':');
        if (hours && minutes) {
          dateObj.setHours(Number(hours), Number(minutes), 0, 0);
          startDateTime = dateObj.toISOString();
        }
      } catch (e) {
        console.error("Error parsing date/time", e);
      }
    }

    const payload = {
      child_id: Number(formData.childId),
      therapist_id: Number(formData.therapistId),
      session_type: formData.sessionType,
      sessionDate: formData.date,
      startTime: startDateTime,
      duration: Number(formData.duration),
      status: "COMPLETED",
      location: formData.location,
      pre_session_notes: formData.preSessionNotes,
      post_session_notes: formData.postSessionNotes,
      session_notes: formData.relatedGoals
    };
    
    if (modalMode === 'edit' && activeSessionId) {
      updateSessionMutation.mutate({ id: activeSessionId, payload });
    } else {
      createSessionMutation.mutate(payload);
    }
  };

  const filteredNotes = activeDomain === "All" 
    ? sessionNotesList 
    : sessionNotesList.filter((note: any) => note.type === activeDomain);

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#575757]">Session Notes</h2>
          <p className="text-sm text-gray-500 mt-1">
            {sessionNotesList.length} notes available
          </p>
        </div>
        <button 
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#2DA0FF] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#2DA0FF] transition-colors"
        >
          + Add Note
        </button>
      </div>

      {/* Domain Filters */}
      <div className="flex items-center gap-4 border-b border-gray-100 overflow-x-auto pb-1 custom-scrollbar">
        {domains.map((domain) => (
          <button
            key={domain.value}
            onClick={() => setActiveDomain(domain.value)}
            className={`whitespace-nowrap px-4 py-2 text-sm font-medium transition-colors ${
              activeDomain === domain.value
                ? "text-orange-500 border-b-2 border-orange-500 bg-orange-50/50 rounded-t-lg"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-t-lg"
            }`}
          >
            {domain.label}
          </button>
        ))}
      </div>

      {/* Notes List */}
      <div className="space-y-4">
        {isSessionsLoading ? (
          <div className="py-12 flex flex-col items-center justify-center text-gray-500">
            <svg className="animate-spin h-8 w-8 text-[#2DA0FF] mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-sm font-medium">Loading sessions...</p>
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            <p className="text-gray-600 font-medium">No notes found for this category</p>
            <p className="text-sm mt-1">Click "Add Note" to create a new session record.</p>
          </div>
        ) : (
          filteredNotes.map((note: any) => (
            <div key={note.id} className="bg-white rounded-xl shadow-sm border border-orange-200/60 p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center font-bold text-sm shrink-0">
                {note.initials}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-bold text-[#575757]">
                    {note.therapist} <span className="font-normal text-gray-600">{note.role} {note.displayType} - {note.duration}</span>
                  </h3>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => openViewModal(note.id)}
                      className="p-1.5 text-gray-400 hover:text-green-500 hover:bg-green-50 rounded-md transition-colors"
                      title="View"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    </button>
                    <button 
                      onClick={() => openEditModal(note.id)}
                      className="p-1.5 text-gray-400 hover:text-[#2DA0FF] hover:bg-blue-50 rounded-md transition-colors"
                      title="Edit"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                    </button>
                    <button 
                      onClick={() => { setSessionToDelete(Number(note.id)); setIsDeleteModalOpen(true); }}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                      title="Delete"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                    </button>
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-xs text-gray-500">{note.datetime}</span>
                  
                  {note.goals.length > 0 && (
                    <div className="flex items-center gap-2">
                      {note.goals.map((goal: string, idx: number) => (
                        <span key={idx} className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium">
                          {goal}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Session Note Modal */}
      <CustomModal
        isOpen={modalMode === 'add' || modalMode === 'edit'}
        onClose={closeModal}
        title={modalMode === 'add' ? "Log Session Note (Create)" : "Edit Session Note"}
        maxWidth="max-w-3xl"
        customFooter={
          <div className="flex justify-center gap-4 px-8 py-5 border-t border-gray-100 w-full">
            <button
              onClick={closeModal}
              className="px-8 py-2 text-sm font-bold text-gray-600 bg-[#e2e8f0] rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={createSessionMutation.isPending || updateSessionMutation.isPending}
              className="px-8 py-2 text-sm font-bold text-white bg-[#2DA0FF] rounded-lg hover:bg-[#2DA0FF] transition-colors disabled:opacity-50"
            >
              {createSessionMutation.isPending || updateSessionMutation.isPending ? "Saving..." : "Save Session Note"}
            </button>
          </div>
        }
      >
        <div>
          <h3 className="text-[#575757] font-semibold mb-6">Session Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 mb-6">
            <div>
              <Label>Child*</Label>
              <Select 
                key={`childId-${formData.childId}`}
                defaultValue={formData.childId}
                options={children.map((c: any) => ({ value: String(c.id), label: c.full_name || c.child_name || c.name || `Child ${c.id}` }))}
                onChange={(val) => updateForm('childId', val)}
                placeholder="Select"
              />
              {formErrors.childId && <p className="mt-1 text-xs text-red-600">{formErrors.childId}</p>}
            </div>

            <div>
              <Label>Therapist*</Label>
              <Select 
                key={`therapistId-${formData.therapistId}`}
                defaultValue={formData.therapistId}
                options={users.map((u: any) => ({ value: String(u.id), label: u.name || `User ${u.id}` }))}
                onChange={(val) => updateForm('therapistId', val)}
                placeholder="Select"
              />
              {formErrors.therapistId && <p className="mt-1 text-xs text-red-600">{formErrors.therapistId}</p>}
            </div>

            <div>
              <Label>Session Type*</Label>
              <Select 
                key={`sessionType-${formData.sessionType}`}
                defaultValue={formData.sessionType}
                options={[
                  { value: 'CONSULTATION', label: 'Consultation' },
                  { value: 'ABA', label: 'ABA' },
                  { value: 'SPEECH', label: 'Speech' },
                  { value: 'OCCUPATIONAL', label: 'Occupational' },
                  { value: 'PHYSIOTHERAPY', label: 'Physiotherapy' },
                  { value: 'PSYCHOLOGY', label: 'Psychology' },
                  { value: 'ASSESSMENT', label: 'Assessment' },
                  { value: 'FOLLOW_UP', label: 'Follow Up' }
                ]}
                onChange={(val) => updateForm('sessionType', val)}
                placeholder="Select Session Type"
              />
              {formErrors.sessionType && <p className="mt-1 text-xs text-red-600">{formErrors.sessionType}</p>}
            </div>

            <div>
              <Label>Date*</Label>
              <DatePicker 
                key={`date-${formData.date}`}
                id="date"
                defaultDate={formData.date}
                maxDate="today"
                onChange={(dates) => updateForm('date', dates[0]?.toString() || '')} 
                placeholder="Select Date" 
              />
              {formErrors.date && <p className="mt-1 text-xs text-red-600">{formErrors.date}</p>}
            </div>

            <div>
              <Label>Start Time*</Label>
              <Input 
                type="time"
                value={formData.startTime} 
                onChange={(e) => updateForm('startTime', e.target.value)} 
                placeholder="Select" 
              />
              {formErrors.startTime && <p className="mt-1 text-xs text-red-600">{formErrors.startTime}</p>}
            </div>

            <div>
              <Label>Duration (mins)*</Label>
              <Input 
                type="number"
                value={formData.duration} 
                onChange={(e) => updateForm('duration', e.target.value)} 
                placeholder="e.g. 60" 
              />
              {formErrors.duration && <p className="mt-1 text-xs text-red-600">{formErrors.duration}</p>}
            </div>

            <div>
              <Label>Location</Label>
              <Input 
                value={formData.location} 
                onChange={(e) => updateForm('location', e.target.value)} 
                placeholder="Location" 
              />
            </div>

            <div className="md:col-span-2">
              <Label>Related Goals</Label>
              <p className="text-xs text-gray-500 mb-1">Select goals worked on (optional)</p>
              <Input 
                value={formData.relatedGoals} 
                onChange={(e) => updateForm('relatedGoals', e.target.value)} 
                placeholder="Write" 
              />
            </div>

            <div className="md:col-span-2">
              <Label>Pre-Session Notes</Label>
              <p className="text-xs text-gray-500 mb-1">Context, goals to focus on, or special instructions for this session</p>
              <textarea
                value={formData.preSessionNotes}
                onChange={(e) => updateForm('preSessionNotes', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm min-h-[80px]"
                placeholder="Write"
              />
            </div>

            <div className="md:col-span-2">
              <Label>Post-Session Notes</Label>
              <p className="text-xs text-gray-500 mb-1">Observations, data, outcomes, and next steps</p>
              <textarea
                value={formData.postSessionNotes}
                onChange={(e) => updateForm('postSessionNotes', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm min-h-[80px]"
                placeholder="Write"
              />
            </div>
          </div>
        </div>
      </CustomModal>

      {/* Delete Warning Modal */}
      <CustomModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSessionToDelete(null);
        }}
        title="Delete Session Note"
        size="sm"
        padding="p-0"
        customFooter={
          <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50/80 border-t border-gray-100 rounded-b-2xl">
            <button
              type="button"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setSessionToDelete(null);
              }}
              disabled={deleteSessionMutation.isPending}
              className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                if (sessionToDelete !== null) {
                  deleteSessionMutation.mutate(sessionToDelete);
                }
              }}
              disabled={deleteSessionMutation.isPending}
              className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-red-600 border border-transparent rounded-lg shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all disabled:opacity-70 min-w-[90px]"
            >
              {deleteSessionMutation.isPending ? "Deleting..." : "Delete"}
            </button>
          </div>
        }
      >
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#575757] mb-1">Are you sure?</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                This action cannot be undone. This will permanently delete the session note.
              </p>
            </div>
          </div>
        </div>
      </CustomModal>

      {/* View Session Note Modal */}
      <CustomModal
        isOpen={modalMode === 'view'}
        onClose={closeModal}
        title="Session Note Details"
        maxWidth="max-w-4xl"
        headerRightContent={
          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                if (activeSessionId) {
                  openEditModal(String(activeSessionId));
                }
              }}
              className="px-4 py-1 text-sm font-medium text-green-600 bg-green-50 border border-green-200 rounded-full hover:bg-green-100 transition-colors"
            >
              Edit Note
            </button>
            <button className="px-4 py-1 text-sm font-medium text-green-600 bg-green-50 border border-green-200 rounded-full hover:bg-green-100 transition-colors">
              Share with Team
            </button>
            <button className="px-4 py-1 text-sm font-medium text-green-600 bg-green-50 border border-green-200 rounded-full hover:bg-green-100 transition-colors">
              Download PDF
            </button>
          </div>
        }
        customFooter={<div className="hidden"></div>}
      >
        {activeSessionId && (() => {
          const session = sessions.find((s: any) => s.id === activeSessionId);
          const therapistName = session?.therapist?.name || "Unknown Therapist";
          const role = session?.therapist?.role?.name || "Therapist";
          const typeObj = domains.find(d => d.value === session?.session_type);
          const type = typeObj ? typeObj.label : session?.session_type || "Session";
          const duration = session?.duration ? `${session.duration} min` : "60 min";
          
          let initials = "NA";
          if (therapistName !== "Unknown Therapist") {
            const parts = therapistName.split(' ').filter(Boolean);
            if (parts.length > 1) {
               initials = (parts[0][0] + parts[parts.length-1][0]).toUpperCase();
            } else if (parts.length === 1) {
               initials = parts[0].substring(0, 2).toUpperCase();
            }
          }

          return (
            <div className="pt-2 pb-6">
              <div className="bg-blue-50/80 border border-blue-100 text-blue-700 p-3.5 rounded-lg text-sm mb-8 flex items-start gap-3 shadow-sm">
                <svg className="w-5 h-5 text-[#2DA0FF] mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="leading-relaxed">
                  <strong>Notice:</strong> Buttons like Shared With Team, Download PDF & Sections like Data Summary, Next Steps, Parent Report, and Timeline are currently displaying static placeholder data to match the intended UI design. These fields are not yet captured in the form.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-[1.5fr_2fr_2.5fr] gap-8 mb-10">
                {/* Left Column */}
                <div className="flex gap-4">
                  <div className="text-orange-400 font-bold text-xl mt-1">{initials}</div>
                  <div>
                    <div className="font-bold text-[#575757] text-sm">{therapistName}</div>
                    <div className="font-bold text-gray-600 text-[13px] mt-1">{role}</div>
                    <div className="font-bold text-gray-600 text-[13px] mt-0.5">{type} {duration}</div>
                  </div>
                </div>

                {/* Middle Column */}
                <div className="space-y-6">
                  <div>
                    <h4 className="font-bold text-[#575757] text-sm mb-2">Pre-Session Notes</h4>
                    <p className="text-[13px] text-gray-500 leading-relaxed">
                      {session?.pre_session_notes || "N/A"}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-bold text-[#575757] text-sm mb-2">Post-Session Notes</h4>
                    <p className="text-[13px] text-gray-500 leading-relaxed">
                      {session?.post_session_notes || "N/A"}
                    </p>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-5">
                  <div>
                    <h4 className="font-bold text-[#575757] text-sm mb-3">Data Summary</h4>
                    <div className="grid grid-cols-[2fr_1fr_1fr] gap-2 text-[13px] text-gray-700 font-bold mb-2">
                      <div>Goal</div>
                      <div className="text-center">Metric</div>
                      <div className="text-right">Score</div>
                    </div>
                    <div className="grid grid-cols-[2fr_1fr_1fr] gap-2 text-[13px] text-gray-500 mb-2">
                      <div>G-02-Name Response</div>
                      <div className="text-center">Trials</div>
                      <div className="text-right">4/5 (80%)</div>
                    </div>
                    <div className="grid grid-cols-[2fr_1fr_1fr] gap-2 text-[13px] text-gray-500">
                      <div>G-06-Emotional Regulation</div>
                      <div className="text-center">Independent ID</div>
                      <div className="text-right">2/3 (67%)</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-[#575757] text-sm mb-2">Next Steps</h4>
                    <p className="text-[13px] text-gray-500 leading-relaxed">
                      Introduce "worried" and "frustrated" cards next session. Increase name response trials to 8/session.
                    </p>
                  </div>

                  <div className="border border-orange-200/60 rounded-lg p-3 bg-white shadow-sm">
                    <h4 className="font-bold text-[#575757] text-[13px] mb-1">Parent Report</h4>
                    <p className="text-[13px] text-gray-500">
                      Parent reported improved sleep this week, No meltdowns in 4 days.
                    </p>
                  </div>
                </div>
              </div>

              {/* Bottom: Timeline */}
              <div>
                <h4 className="font-bold text-[#575757] text-sm mb-5">Session Timeline</h4>
                <div className="space-y-4">
                  <div className="flex items-center gap-12 text-[13px]">
                    <div className="flex items-center gap-3 w-48">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#10b981]"></div>
                      <span className="text-gray-600 font-medium">Note Created</span>
                    </div>
                    <span className="text-gray-500">Apr 29, 2026-10:15 AM By Rohit Sharma</span>
                  </div>
                  <div className="flex items-center gap-12 text-[13px]">
                    <div className="flex items-center gap-3 w-48">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#ef4444]"></div>
                      <span className="text-gray-600 font-medium">Shared with Care Team</span>
                    </div>
                    <span className="text-gray-500">Apr 29, 2026-10:20 AM By Rohit Sharma</span>
                  </div>
                  <div className="flex items-center gap-12 text-[13px]">
                    <div className="flex items-center gap-3 w-48">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#3b82f6]"></div>
                      <span className="text-gray-600 font-medium">Reviewed by Dr. Reena Kapoor</span>
                    </div>
                    <span className="text-gray-500">Apr 29, 2026-2:30 PM</span>
                  </div>
                  <div className="flex items-center gap-12 text-[13px]">
                    <div className="flex items-center gap-3 w-48">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#a855f7]"></div>
                      <span className="text-gray-600 font-medium">Parent Notified</span>
                    </div>
                    <span className="text-gray-500">Apr 29, 2026-3:00 PM</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
      </CustomModal>
    </div>
  );
};

export default SessionNotesTab;
