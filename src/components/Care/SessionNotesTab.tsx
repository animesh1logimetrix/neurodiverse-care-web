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
  "All",
  "ABA",
  "Speech",
  "OT",
  "Psychology",
];

const SessionNotesTab = () => {
  const [activeDomain, setActiveDomain] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
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
    queryKey: ["user"],
    queryFn: async () => {
      const res = await axiosClient.get("/user");
      return res.data;
    },
  });

  const children = Array.isArray(childrenData) ? childrenData : childrenData?.data || [];
  const users = Array.isArray(usersData) ? usersData : usersData?.data || [];

  const createSessionMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await axiosClient.post("/session", payload);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Session note added successfully");
      queryClient.invalidateQueries({ queryKey: ["session"] });
      setIsModalOpen(false);
      setFormData({
        childId: "", therapistId: "", sessionType: "", date: "",
        startTime: "", duration: "", location: "", status: "",
        relatedGoals: "", preSessionNotes: "", postSessionNotes: ""
      });
      setFormErrors({});
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to add session note");
    }
  });

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

    const payload = {
      child_id: Number(formData.childId),
      therapist_id: Number(formData.therapistId),
      session_type: formData.sessionType,
      sessionDate: formData.date,
      startTime: formData.startTime,
      duration: Number(formData.duration),
      status: "COMPLETED",
      location: formData.location,
      pre_session_notes: formData.preSessionNotes,
      post_session_notes: formData.postSessionNotes,
      session_notes: formData.relatedGoals
    };
    
    createSessionMutation.mutate(payload);
  };

  const filteredNotes = activeDomain === "All" 
    ? mockNotes 
    : mockNotes.filter(note => note.type === activeDomain);

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Session Notes</h2>
          <p className="text-sm text-gray-500 mt-1">
            6 notes this month
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#60a5fa] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-colors"
        >
          + Add Note
        </button>
      </div>

      {/* Domain Filters */}
      <div className="flex items-center gap-4 border-b border-gray-100 overflow-x-auto pb-1 custom-scrollbar">
        {domains.map((domain) => (
          <button
            key={domain}
            onClick={() => setActiveDomain(domain)}
            className={`whitespace-nowrap px-4 py-2 text-sm font-medium transition-colors ${
              activeDomain === domain
                ? "text-orange-500 border-b-2 border-orange-500 bg-orange-50/50 rounded-t-lg"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-t-lg"
            }`}
          >
            {domain}
          </button>
        ))}
      </div>

      {/* Notes List */}
      <div className="space-y-4">
        {filteredNotes.map((note) => (
          <div key={note.id} className="bg-white rounded-xl shadow-sm border border-orange-200/60 p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center font-bold text-sm shrink-0">
              {note.initials}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-bold text-gray-900">
                  {note.therapist} <span className="font-normal text-gray-600">{note.role} {note.type} - {note.duration}</span>
                </h3>
              </div>
              
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs text-gray-500">{note.datetime}</span>
                
                <div className="flex items-center gap-2">
                  {note.goals.map((goal, idx) => (
                    <span key={idx} className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium">
                      {goal}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
        {filteredNotes.length === 0 && (
          <div className="py-12 flex flex-col items-center justify-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <p className="text-gray-600 font-medium">No notes found for this category</p>
          </div>
        )}
      </div>

      {/* Add Session Note Modal */}
      <CustomModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Log Session Note (Create)"
        maxWidth="max-w-3xl"
        customFooter={
          <div className="flex justify-center gap-4 px-8 py-5 border-t border-gray-100 w-full">
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-8 py-2 text-sm font-bold text-gray-600 bg-[#e2e8f0] rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={createSessionMutation.isPending}
              className="px-8 py-2 text-sm font-bold text-white bg-[#60a5fa] rounded-lg hover:bg-blue-500 transition-colors disabled:opacity-50"
            >
              {createSessionMutation.isPending ? "Saving..." : "Save Session Note"}
            </button>
          </div>
        }
      >
        <div>
          <h3 className="text-gray-800 font-semibold mb-6">Session Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 mb-6">
            <div>
              <Label>Child*</Label>
              <Select 
                key={`childId-${formData.childId}`}
                defaultValue={formData.childId}
                options={children.map((c: any) => ({ value: String(c.id), label: c.child_name || c.name || `Child ${c.id}` }))}
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
    </div>
  );
};

export default SessionNotesTab;
