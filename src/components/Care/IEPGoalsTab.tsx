import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router";
import toast from "react-hot-toast";
import axiosClient from "../../api/axiosClient";
import { HorizontaLDots } from "../../icons";
import CustomModal from "../ui/modal/CustomModal";
import Input from "../form/input/InputField";
import Select from "../form/Select";
import DatePicker from "../form/date-picker";
import Label from "../form/Label";

interface IEPGoal {
  id: number;
  child_id: number;
  domain_id: number;
  goal_title: string;
  goal_description: string;
  mastery_criteria: string;
  priority: string;
  therapist_id: number;
  targets: any;
  status: string;
  start_date: string;
  target_date: string;
  completed_date: string;
  progress: number;
  code?: string;
  // Nested objects from API
  domain?: { id: number; name: string; full_category_name?: string; short_name?: string };
  therapist?: { id: number; name?: string; first_name?: string; last_name?: string };
}

// Mapped goal with display strings pre-computed
interface MappedGoal extends IEPGoal {
  domainName: string;
  therapistName: string;
  targetsArray: { title: string; subtitle: string; status: string }[];
}

function mapGoal(goal: IEPGoal, categories: any[], users: any[]): MappedGoal {
  // Resolve domain name from nested object or from categories list
  const domainName =
    goal.domain?.full_category_name ||
    goal.domain?.name ||
    categories.find((c: any) => (c.id || c.category_id) === goal.domain_id)
      ?.full_category_name ||
    categories.find((c: any) => (c.id || c.category_id) === goal.domain_id)
      ?.name ||
    "Unknown Domain";

  // Resolve therapist name from nested object or from users list
  const therapistName =
    (goal.therapist?.name ||
      `${goal.therapist?.first_name || ""} ${goal.therapist?.last_name || ""}`.trim()) ||
    users.find((u: any) => u.id === goal.therapist_id)?.name ||
    `${users.find((u: any) => u.id === goal.therapist_id)?.first_name || ""} ${users.find((u: any) => u.id === goal.therapist_id)?.last_name || ""}`.trim() ||
    "Unknown Therapist";

  // Parse targets safely - API may return object, array, or stringified JSON
  let targetsArray: { title: string; subtitle: string; status: string }[] = [];
  try {
    const raw = goal.targets;
    if (typeof raw === "string") {
      const parsed = JSON.parse(raw);
      targetsArray = Array.isArray(parsed) ? parsed : Object.values(parsed);
    } else if (Array.isArray(raw)) {
      targetsArray = raw;
    } else if (raw && typeof raw === "object") {
      targetsArray = Object.values(raw);
    }
  } catch {}

  return { ...goal, domainName, therapistName, targetsArray };
}

// Document icon SVG
const DocumentPdfIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
    <path d="M10 18v-4" />
    <path d="M14 18v-4" />
    <path d="M10 14h4" />
  </svg>
);

const DocumentExcelIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
    <path d="M8 13l4 4" />
    <path d="M8 17l4-4" />
    <path d="M16 13h-4" />
    <path d="M16 17h-4" />
  </svg>
);

const TargetIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <circle cx="12" cy="12" r="6"></circle>
    <circle cx="12" cy="12" r="2"></circle>
  </svg>
);

const defaultFormData = (childId: string | undefined) => ({
  child_id: Number(childId) || 0,
  domain_id: "" as string | number,
  goal_title: "",
  goal_description: "",
  mastery_criteria: "",
  priority: "MEDIUM",
  therapist_id: "" as string | number,
  targets: [] as { title: string; subtitle: string; status: string }[],
  status: "ACTIVE",
  start_date: "",
  target_date: "",
  completed_date: "",
  progress: 0,
  frequency_schedule: "",
});

const IEPGoalsTab = () => {
  const { id: childId } = useParams();
  const queryClient = useQueryClient();

  const [activeDomain, setActiveDomain] = useState("All");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState<number | null>(null);
  const [selectedViewGoal, setSelectedViewGoal] = useState<MappedGoal | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [formData, setFormData] = useState(defaultFormData(childId));
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const updateForm = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFormErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.domain_id) errors.domain_id = "Domain is required.";
    if (!formData.goal_title.trim()) errors.goal_title = "Goal Title is required.";
    if (!formData.mastery_criteria.trim()) errors.mastery_criteria = "Mastery Criteria is required.";
    if (!formData.priority) errors.priority = "Priority is required.";
    if (!formData.therapist_id) errors.therapist_id = "Assigned Therapist is required.";
    if (!formData.status) errors.status = "Status is required.";
    return errors;
  };

  // ── Queries ──────────────────────────────────────────────────────────────
  const { data: childrenData } = useQuery({
    queryKey: ["child"],
    queryFn: async () => {
      const res = await axiosClient.get("/child");
      return res.data;
    },
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

  const { data: iepGoalsData, isLoading: isGoalsLoading } = useQuery({
    queryKey: ["iep-goal", childId],
    queryFn: async () => {
      const res = await axiosClient.get(`/iep-goal?childId=${childId}`);
      return res.data;
    },
    enabled: !!childId,
  });

  const children = Array.isArray(childrenData) ? childrenData : childrenData?.data || [];
  const categories = Array.isArray(categoriesData) ? categoriesData : categoriesData?.data || [];
  const users: any[] = Array.isArray(usersData) ? usersData : usersData?.data || [];
  const rawGoals: IEPGoal[] = Array.isArray(iepGoalsData)
    ? iepGoalsData
    : iepGoalsData?.data || [];
  const allIepGoals: MappedGoal[] = rawGoals.map((g) => mapGoal(g, categories, users));

  // ── Mutations ─────────────────────────────────────────────────────────────
  const buildPayload = (data: typeof formData) => {
    // targets: convert array to object {0: {...}, 1: {...}} or {} if empty
    const targetsObj: Record<string, any> =
      data.targets.length > 0
        ? data.targets.reduce((acc, t, i) => ({ ...acc, [i]: t }), {})
        : {};

    const payload: any = {
      child_id: Number(childId),
      domain_id: Number(data.domain_id),
      goal_title: data.goal_title,
      goal_description: data.goal_description || "",
      mastery_criteria: data.mastery_criteria,
      priority: data.priority,
      therapist_id: Number(data.therapist_id),
      targets: targetsObj,
      status: data.status,
      progress: Number(data.progress) || 0,
    };

    // Optional date fields — only include if set
    if (data.start_date) payload.start_date = data.start_date;
    if (data.target_date) payload.target_date = data.target_date;
    if (data.completed_date) payload.completed_date = data.completed_date;

    console.log("IEP Goal Payload", payload);
    return payload;
  };

  const createGoalMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await axiosClient.post("/iep-goal", payload);
      return res.data;
    },
    onSuccess: () => {
      toast.success("IEP Goal added successfully");
      queryClient.invalidateQueries({ queryKey: ["iep-goal", childId] });
      setIsAddModalOpen(false);
    },
    onError: (error: any) => {
      console.error(error.response?.data);
      toast.error(
        Array.isArray(error?.response?.data?.message)
          ? error.response.data.message.join(", ")
          : error?.response?.data?.message || "Failed to add goal"
      );
    },
  });

  const updateGoalMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: any }) => {
      const res = await axiosClient.patch(`/iep-goal/${id}`, payload);
      return res.data;
    },
    onSuccess: () => {
      toast.success("IEP Goal updated successfully");
      queryClient.invalidateQueries({ queryKey: ["iep-goal", childId] });
      setIsEditModalOpen(false);
    },
    onError: (error: any) => {
      console.error(error.response?.data);
      toast.error(
        Array.isArray(error?.response?.data?.message)
          ? error.response.data.message.join(", ")
          : error?.response?.data?.message || "Failed to update goal"
      );
    },
  });

  const deleteGoalMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await axiosClient.delete(`/iep-goal/${id}`);
      return res.data;
    },
    onSuccess: () => {
      toast.success("IEP Goal deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["iep-goal", childId] });
      setIsDeleteModalOpen(false);
    },
    onError: (error: any) => {
      console.error(error.response?.data);
      toast.error(error?.response?.data?.message || "Failed to delete goal");
    },
  });

  // ── Derived UI data ───────────────────────────────────────────────────────
  const filterDomains = [
    "All",
    ...Array.from(
      new Set(
        categories
          .map((c: any) => c.full_category_name || c.category_name || c.name || "")
          .filter(Boolean)
      )
    ),
  ];

  const filteredGoals =
    activeDomain === "All"
      ? allIepGoals
      : allIepGoals.filter((goal) => goal.domainName === activeDomain);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const openAddModal = () => {
    setFormData(defaultFormData(childId));
    setFormErrors({});
    setIsAddModalOpen(true);
  };

  const openEditModal = (goal: MappedGoal) => {
    setOpenMenuId(null);
    setFormData({
      child_id: goal.child_id,
      domain_id: String(goal.domain_id),
      goal_title: goal.goal_title || "",
      goal_description: goal.goal_description || "",
      mastery_criteria: goal.mastery_criteria || "",
      priority: goal.priority || "MEDIUM",
      therapist_id: String(goal.therapist_id),
      targets: goal.targetsArray,
      status: goal.status || "ACTIVE",
      start_date: goal.start_date || "",
      target_date: goal.target_date || "",
      completed_date: goal.completed_date || "",
      progress: goal.progress || 0,
      frequency_schedule: goal.frequency_schedule || "",
    });
    setFormErrors({});
    setSelectedViewGoal(goal);
    setIsEditModalOpen(true);
  };

  const openViewModal = (goal: MappedGoal) => {
    setOpenMenuId(null);
    setSelectedViewGoal(goal);
    setIsViewModalOpen(true);
  };

  // ── Shared form fields JSX builder ────────────────────────────────────────
  const renderFormFields = (prefix: string) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 mb-6">

      {/* Row 1: Child + Domain */}
      <div>
        <Label>Child*</Label>
        <Select
          key={`${prefix}-child-${formData.child_id}`}
          defaultValue={String(formData.child_id || childId)}
          options={children.map((c: any) => ({
            value: String(c.id),
            label: c.full_name || `Child ${c.id}`
          }))}
          onChange={(val) => setFormData((prev) => ({ ...prev, child_id: Number(val) }))}
          placeholder="Select Child"
        />
        {formErrors.child_id && <p className="mt-1 text-[13px] text-red-500">{formErrors.child_id}</p>}
      </div>

      <div>
        <Label>Domain*</Label>
        <Select
          key={`${prefix}-domain-${formData.domain_id}`}
          defaultValue={String(formData.domain_id)}
          options={categories.map((c: any) => ({
            value: String(c.id || c.category_id),
            label: c.full_category_name || c.category_name || c.name || `Category ${c.id || c.category_id}`,
          }))}
          onChange={(val) => updateForm("domain_id", val)}
          placeholder="Select"
        />
        {formErrors.domain_id && <p className="mt-1 text-xs text-red-600">{formErrors.domain_id}</p>}
      </div>

      {/* Row 2: Goal Title - full width */}
      <div className="md:col-span-2">
        <Label>Goal Title*</Label>
        <Input
          value={formData.goal_title}
          onChange={(e) => updateForm("goal_title", e.target.value)}
          placeholder="Enter goal title..."
        />
        {formErrors.goal_title && <p className="mt-1 text-xs text-red-600">{formErrors.goal_title}</p>}
      </div>

      {/* Row 3: Goal Description - full width */}
      <div className="md:col-span-2">
        <Label>Goal Description*</Label>
        <Input
          value={formData.goal_description}
          onChange={(e) => setFormData((prev) => ({ ...prev, goal_description: e.target.value }))}
          placeholder="Describe the observable behavior and context..."
        />
      </div>

      {/* Row 4: Priority + Assigned Therapist */}
      <div>
        <Label>Priority</Label>
        <Select
          key={`${prefix}-priority-${formData.priority}`}
          defaultValue={formData.priority}
          options={[
            { value: "LOW", label: "Low" },
            { value: "MEDIUM", label: "Medium" },
            { value: "HIGH", label: "High" },
          ]}
          onChange={(val) => updateForm("priority", val)}
          placeholder="Select"
        />
        {formErrors.priority && <p className="mt-1 text-xs text-red-600">{formErrors.priority}</p>}
      </div>

      <div>
        <Label>Assigned Therapist</Label>
        <Select
          key={`${prefix}-therapist-${formData.therapist_id}`}
          defaultValue={String(formData.therapist_id)}
          options={users.map((u: any) => ({
            value: String(u.id),
            label: u.name || `${u.first_name || ""} ${u.last_name || ""}`.trim(),
          }))}
          onChange={(val) => updateForm("therapist_id", val)}
          placeholder="Select"
        />
        {formErrors.therapist_id && <p className="mt-1 text-xs text-red-600">{formErrors.therapist_id}</p>}
      </div>

      {/* Row 5: Status + Start Date */}
      <div>
        <Label>Status</Label>
        <Select
          key={`${prefix}-status-${formData.status}`}
          defaultValue={formData.status}
          options={[
            { value: "ACTIVE", label: "Active" },
            { value: "IN_PROGRESS", label: "In Progress" },
            { value: "COMPLETED", label: "Completed" },
            { value: "ON_HOLD", label: "On Hold" },
            { value: "CANCELLED", label: "Cancelled" },
          ]}
          onChange={(val) => updateForm("status", val)}
          placeholder="Select"
        />
        {formErrors.status && <p className="mt-1 text-xs text-red-600">{formErrors.status}</p>}
      </div>

      <div>
        <Label>Start Date</Label>
        <DatePicker
          id={`${prefix}_start_date`}
          key={`${prefix}-start-${formData.start_date}`}
          defaultDate={formData.start_date || undefined}
          onChange={(dates) => setFormData((prev) => ({ ...prev, start_date: dates[0]?.toString() || "" }))}
          placeholder="Select"
        />
      </div>

      {/* Row 6: Target Date + Frequency/Schedule */}
      <div>
        <Label>Target Date</Label>
        <DatePicker
          id={`${prefix}_target_date`}
          key={`${prefix}-target-${formData.target_date}`}
          defaultDate={formData.target_date || undefined}
          onChange={(dates) => setFormData((prev) => ({ ...prev, target_date: dates[0]?.toString() || "" }))}
          placeholder="Select"
        />
      </div>

      <div>
        <Label>Frequency/Schedule</Label>
        <Select
          key={`${prefix}-freq-${formData.frequency_schedule}`}
          defaultValue={formData.frequency_schedule}
          options={[
            { value: "ONCE_DAILY",        label: "Once Daily" },
            { value: "TWICE_DAILY",       label: "Twice Daily" },
            { value: "THREE_TIMES_DAILY", label: "Three Times Daily" },
            { value: "FOUR_TIMES_DAILY",  label: "Four Times Daily" },
            { value: "EVERY_4_HOURS",     label: "Every 4 Hours" },
            { value: "EVERY_6_HOURS",     label: "Every 6 Hours" },
            { value: "EVERY_8_HOURS",     label: "Every 8 Hours" },
            { value: "EVERY_12_HOURS",    label: "Every 12 Hours" },
            { value: "WEEKLY",            label: "Weekly" },
            { value: "AS_NEEDED",         label: "As Needed" },
          ]}
          onChange={(val) => setFormData((prev) => ({ ...prev, frequency_schedule: val }))}
          placeholder="Select"
        />
      </div>

      {/* Row 7: Mastery Criteria - full width */}
      <div className="md:col-span-2">
        <Label>Mastery Criteria*</Label>
        <Input
          value={formData.mastery_criteria}
          onChange={(e) => updateForm("mastery_criteria", e.target.value)}
          placeholder="Add Mastery Criteria..."
        />
        {formErrors.mastery_criteria && <p className="mt-1 text-xs text-red-600">{formErrors.mastery_criteria}</p>}
      </div>

      {/* Progress slider - full width */}
      <div className="md:col-span-2">
        <div className="flex items-center justify-between mb-2">
          <Label>Progress</Label>
          <span className="text-sm font-semibold text-[#60a5fa]">{formData.progress}%</span>
        </div>
        <style>{`
          .iep-progress-slider { -webkit-appearance: none; appearance: none; width: 100%; height: 10px; border-radius: 9999px; outline: none; cursor: pointer; background: linear-gradient(to right, #60a5fa ${formData.progress}%, #e2e8f0 ${formData.progress}%); }
          .iep-progress-slider::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 22px; height: 22px; border-radius: 50%; background: #60a5fa; border: 3px solid #fff; box-shadow: 0 1px 4px rgba(0,0,0,0.25); cursor: pointer; }
          .iep-progress-slider::-moz-range-thumb { width: 22px; height: 22px; border-radius: 50%; background: #60a5fa; border: 3px solid #fff; box-shadow: 0 1px 4px rgba(0,0,0,0.25); cursor: pointer; }
        `}</style>
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={formData.progress}
          onChange={(e) => setFormData((prev) => ({ ...prev, progress: Number(e.target.value) }))}
          className="iep-progress-slider"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>0%</span>
          <span>25%</span>
          <span>50%</span>
          <span>75%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Teaching Targets - full width, no empty box */}
      <div className="md:col-span-2">
        <div className="flex justify-between items-center mb-4">
          <Label>Teaching Targets*</Label>
          <button
            type="button"
            onClick={() =>
              setFormData((prev) => ({
                ...prev,
                targets: [...prev.targets, { title: "", subtitle: "", status: "Not Started" }],
              }))
            }
            className="inline-flex items-center gap-1 text-sm font-semibold text-green-600 bg-green-50/50 border border-green-200 px-3 py-1.5 rounded-lg hover:bg-green-100 transition-colors"
          >
            + Add Target
          </button>
        </div>
        
        {formData.targets.length > 0 && (
          <div className="w-full">
            {/* Table Header */}
            <div className="hidden sm:grid grid-cols-[1fr_1fr_160px_60px] gap-4 mb-3 pb-3 border-b border-gray-100">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Target</span>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Description</span>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status</span>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">Actions</span>
            </div>
            
            <div className="space-y-3">
              {formData.targets.map((target, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_160px_60px] gap-4 items-center"
                >
                  <Input
                    value={target.title}
                    onChange={(e) => {
                      const newT = [...formData.targets];
                      newT[idx] = { ...newT[idx], title: e.target.value };
                      setFormData({ ...formData, targets: newT });
                    }}
                    placeholder="e.g. Target Name"
                  />
                  <Input
                    value={target.subtitle}
                    onChange={(e) => {
                      const newT = [...formData.targets];
                      newT[idx] = { ...newT[idx], subtitle: e.target.value };
                      setFormData({ ...formData, targets: newT });
                    }}
                    placeholder="e.g. Target Description"
                  />
                  <Select
                    options={[
                      { value: "Not Started", label: "Not Started" },
                      { value: "In Progress", label: "In Progress" },
                      { value: "Achieved",    label: "Achieved" },
                    ]}
                    onChange={(val) => {
                      const newT = [...formData.targets];
                      newT[idx] = { ...newT[idx], status: val };
                      setFormData({ ...formData, targets: newT });
                    }}
                    placeholder="Status"
                  />
                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={() => {
                        const newT = formData.targets.filter((_, i) => i !== idx);
                        setFormData({ ...formData, targets: newT });
                      }}
                      className="text-slate-400 hover:text-red-500 font-bold text-lg leading-none transition-colors"
                      title="Remove target"
                    >
                      X
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );



  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">IEP Goals</h2>
          <p className="text-sm text-gray-500 mt-1">
            {allIepGoals.filter((g) => g.status === "COMPLETED").length} mastered -{" "}
            {allIepGoals.filter((g) => g.status === "ACTIVE").length} active{" "}
            {allIepGoals.length} total
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#60a5fa] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-colors"
        >
          + Add Goal
        </button>
      </div>

      {/* Domain Filters */}
      <div className="flex items-center gap-4 border-b border-gray-100 overflow-x-auto pb-1 custom-scrollbar">
        {filterDomains.map((domain) => (
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

      {/* Goals List */}
      <div className="space-y-4">
        {isGoalsLoading && (
          <div className="py-12 text-center text-gray-500">Loading goals...</div>
        )}
        {filteredGoals.map((goal) => (
          <div
            key={goal.id}
            className="bg-white rounded-xl shadow-sm border border-orange-200/60 p-5"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="text-green-600">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <span className="text-sm font-bold text-gray-800">
                  {goal.code || `G-${goal.id}`}
                </span>
                <h3 className="font-bold text-gray-800 text-sm">{goal.domainName}</h3>
                <span className="text-sm font-semibold text-gray-800">{goal.status}</span>
              </div>
              <div className="relative">
                <button
                  onClick={() =>
                    setOpenMenuId(openMenuId === String(goal.id) ? null : String(goal.id))
                  }
                  className="text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  <HorizontaLDots className="w-5 h-5" />
                </button>
                {openMenuId === String(goal.id) && (
                  <div className="absolute right-0 mt-2 w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-10 py-1">
                    <button
                      onClick={() => openViewModal(goal)}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      View
                    </button>
                    <button
                      onClick={() => openEditModal(goal)}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        setOpenMenuId(null);
                        setGoalToDelete(goal.id);
                        setIsDeleteModalOpen(true);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>

            <p className="text-sm font-medium text-gray-800 mb-6 max-w-4xl">
              {goal.goal_description}
            </p>

            <div className="mb-4">
              <div className="flex items-center justify-between text-sm text-gray-500 mb-1">
                <span>Progress</span>
                <span>{goal.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{ width: `${goal.progress}%` }}
                ></div>
              </div>
            </div>

            <div className="flex items-center gap-8 text-xs font-medium text-gray-500">
              <div className="flex items-center gap-1.5">
                Therapist: {goal.therapistName}
              </div>
              <div className="flex items-center gap-1.5">
                Priority: {goal.priority || "Medium"}
              </div>
              <div className="flex items-center gap-1.5">
                Target Date:{" "}
                <span className="font-bold text-gray-800">{goal.target_date || "-"}</span>
              </div>
            </div>
          </div>
        ))}
        {!isGoalsLoading && filteredGoals.length === 0 && (
          <div className="py-12 flex flex-col items-center justify-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <p className="text-gray-600 font-medium">No goals found for this domain</p>
          </div>
        )}
      </div>

      {/* ── Add IEP Goal Modal ── */}
      <CustomModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add IEP Goal"
        maxWidth="max-w-3xl"
        customFooter={
          <div className="flex justify-center gap-4 px-8 py-5 border-t border-gray-100 w-full">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="px-8 py-2 text-sm font-bold text-gray-600 bg-[#e2e8f0] rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                const errors = validateForm();
                if (Object.keys(errors).length > 0) {
                  setFormErrors(errors);
                  return;
                }
                createGoalMutation.mutate(buildPayload(formData));
              }}
              disabled={createGoalMutation.isPending}
              className="px-8 py-2 text-sm font-bold text-white bg-[#60a5fa] rounded-lg hover:bg-blue-500 transition-colors disabled:opacity-50"
            >
              {createGoalMutation.isPending ? "Saving..." : "Save Goal"}
            </button>
          </div>
        }
      >
        <div>
          <h3 className="text-gray-800 font-semibold mb-6">Goal Information</h3>
          {renderFormFields("add")}
        </div>
      </CustomModal>

      {/* ── Edit IEP Goal Modal ── */}
      <CustomModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit IEP Goal"
        maxWidth="max-w-3xl"
        customFooter={
          <div className="flex justify-center gap-4 px-8 py-5 border-t border-gray-100 w-full">
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="px-8 py-2 text-sm font-bold text-gray-600 bg-[#e2e8f0] rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (selectedViewGoal) {
                  const errors = validateForm();
                  if (Object.keys(errors).length > 0) {
                    setFormErrors(errors);
                    return;
                  }
                  updateGoalMutation.mutate({
                    id: selectedViewGoal.id,
                    payload: buildPayload(formData),
                  });
                }
              }}
              disabled={updateGoalMutation.isPending}
              className="px-8 py-2 text-sm font-bold text-white bg-[#60a5fa] rounded-lg hover:bg-blue-500 transition-colors disabled:opacity-50"
            >
              {updateGoalMutation.isPending ? "Saving..." : "Save Goal"}
            </button>
          </div>
        }
      >
        <div>
          <h3 className="text-gray-800 font-semibold mb-6">Goal Information</h3>
          {renderFormFields("edit")}
        </div>
      </CustomModal>

      {/* ── Delete Confirmation Modal ── */}
      <CustomModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete IEP Goal"
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
                if (goalToDelete !== null) {
                  deleteGoalMutation.mutate(goalToDelete);
                }
              }}
              disabled={deleteGoalMutation.isPending}
              className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center min-w-[80px]"
            >
              {deleteGoalMutation.isPending ? (
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
                Are you sure you want to delete this IEP Goal? This action cannot be undone and will permanently remove this record.
              </p>
            </div>
          </div>
        </div>
      </CustomModal>

      {/* ── View IEP Goal Modal ── */}
      {selectedViewGoal && (
        <CustomModal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title="IEP Goal (View)"
          maxWidth="max-w-[900px]"
          customFooter={
            <div className="flex justify-center gap-4 px-8 py-5 border-t border-gray-200 w-full bg-white">
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="px-8 py-2.5 text-[15px] font-bold text-gray-700 bg-[#e5e7eb] rounded-lg hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setIsViewModalOpen(false);
                  openEditModal(selectedViewGoal);
                }}
                className="px-8 py-2.5 text-[15px] font-bold text-white bg-[#60a5fa] rounded-lg hover:bg-blue-500 transition-colors shadow-sm"
              >
                Edit Goal
              </button>
            </div>
          }
        >
          <div className="pb-4 relative bg-white">
            <p className="text-[15px] text-gray-500 mb-4 cursor-pointer hover:text-gray-700">
              Back to Assessments
            </p>

            {/* Header Box */}
            <div className="border border-gray-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-4 mb-3">
                <div className="text-green-600">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="12" cy="12" r="10" strokeWidth="2" />
                    <circle cx="12" cy="12" r="6" strokeWidth="2" />
                    <circle cx="12" cy="12" r="2" strokeWidth="2" fill="currentColor" />
                  </svg>
                </div>
                <span className="font-bold text-[13px] text-gray-800">
                  {selectedViewGoal.code || `G-${selectedViewGoal.id}`}
                </span>
                <span className="text-[13px] font-bold text-gray-600">
                  {selectedViewGoal.domainName}
                </span>
                <span className="text-[13px] font-bold text-gray-600">
                  {selectedViewGoal.status}
                </span>
              </div>
              <p className="text-[13px] font-bold text-gray-800 mb-4">
                {selectedViewGoal.goal_description}
              </p>
              <div className="flex flex-wrap items-center gap-8 text-[12px] text-gray-500">
                <span>Therapist: <span className="text-gray-600">{selectedViewGoal.therapistName}</span></span>
                <span>Freq: <span className="text-gray-600">{selectedViewGoal.frequency_schedule || "-"}</span></span>
                <span>Start: <span className="text-gray-600">{selectedViewGoal.start_date || "-"}</span></span>
                <span>Target: <span className="text-gray-600">{selectedViewGoal.target_date || "-"}</span></span>
                <span>Status: <span className="text-gray-600">{selectedViewGoal.status}</span></span>
              </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-[250px_320px_1fr] lg:grid-cols-[250px_350px_1fr] gap-6 mb-6">
              {/* Col 1: Progress */}
              <div className="w-full md:border-r border-gray-200 md:pr-4 py-1">
                <h4 className="text-[13px] font-bold text-gray-700 mb-6">Progress Overview</h4>
                <div className="flex items-start gap-4">
                  <div className="relative w-[90px] h-[90px] shrink-0 pt-2">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-gray-200"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3.5"
                      />
                      <path
                        className="text-[#16a34a]"
                        strokeDasharray={`${selectedViewGoal.progress}, 100`}
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3.5"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
                      <span className="text-[20px] font-medium text-gray-700 leading-none mb-1">
                        {selectedViewGoal.progress}%
                      </span>
                      <span className="text-[9px] text-gray-500 leading-tight text-center px-1">
                        Overall Progress
                      </span>
                    </div>
                  </div>
                  <div className="space-y-4 flex-1">
                    <div>
                      <p className="text-[12px] text-gray-500 leading-snug">Baseline</p>
                      <p className="text-[12px] text-gray-600 leading-snug">Single-word requests only (Nov 2025)</p>
                    </div>
                    <div>
                      <p className="text-[12px] text-gray-500 leading-snug">Target</p>
                      <p className="text-[12px] text-gray-600 leading-snug">80% accuracy across 3 sessions</p>
                    </div>
                    <div>
                      <p className="text-[12px] text-gray-500 leading-snug">Mastery Criteria</p>
                      <p className="text-[12px] text-gray-600 leading-snug">{selectedViewGoal.mastery_criteria || "-"}</p>
                    </div>
                    <div>
                      <p className="text-[12px] text-gray-500 leading-snug">Next Review</p>
                      <p className="text-[12px] text-gray-600 leading-snug">May 7, 2026</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Col 2: Details & Linked Goals */}
              <div className="w-full md:border-r border-gray-200 md:pr-4 py-1 flex flex-col">
                <h4 className="text-[13px] font-bold text-gray-700 mb-4">Goal Details</h4>
                <div className="space-y-1 text-[12px]">
                  <div className="flex">
                    <span className="text-gray-500 w-[135px] shrink-0">Domain</span>
                    <span className="text-gray-600">{selectedViewGoal.domainName}</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-500 w-[135px] shrink-0">Priority</span>
                    <span className="text-gray-600">{selectedViewGoal.priority || "Medium"}</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-500 w-[135px] shrink-0">Assigned Therapist</span>
                    <span className="text-gray-600">{selectedViewGoal.therapistName}</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-500 w-[135px] shrink-0">Frequency/Schedule</span>
                    <span className="text-gray-600">{selectedViewGoal.frequency_schedule || "-"}</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-500 w-[135px] shrink-0">Start Date</span>
                    <span className="text-gray-600">{selectedViewGoal.start_date || "-"}</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-500 w-[135px] shrink-0">Target Date</span>
                    <span className="text-gray-600">{selectedViewGoal.target_date || "-"}</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-500 w-[135px] shrink-0">Status</span>
                    <span className="text-gray-600">{selectedViewGoal.status}</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-500 w-[135px] shrink-0">Last Session</span>
                    <span className="text-gray-600">Apr 28, 2026</span>
                  </div>
                </div>

                <h4 className="text-[13px] font-bold text-gray-700 mt-6 mb-3">Linked IEP Goals (4)</h4>
                <div className="flex flex-wrap overflow-x-auto gap-2 pb-2 custom-scrollbar">
                  <span className="w-fit shrink-0 px-2 py-1 rounded-full border border-green-200 text-green-700 text-[11px] bg-green-50 whitespace-nowrap">Improve social communication skills &gt;</span>
                  <span className="w-fit shrink-0 px-2 py-1 rounded-full border border-green-200 text-green-700 text-[11px] bg-white whitespace-nowrap">Increase Independent play</span>
                  <span className="w-fit shrink-0 px-2 py-1 rounded-full border border-green-200 text-green-700 text-[11px] bg-white whitespace-nowrap">Enhance daily living skills</span>
                  <span className="w-fit shrink-0 px-2 py-1 rounded-full border border-green-200 text-green-700 text-[11px] bg-white whitespace-nowrap">Goal 4</span>
                </div>
              </div>

              {/* Col 3: Teaching Targets */}
              <div className="w-full py-1">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-[13px] font-bold text-gray-700">
                    Teaching Targets ({selectedViewGoal.targetsArray.length})
                  </h4>
                  <button className="text-green-600 font-bold text-[12px]">+Add Target</button>
                </div>
                <div className="space-y-3">
                  {selectedViewGoal.targetsArray.length === 0 ? (
                    <p className="text-[12px] text-gray-400 italic">No targets defined</p>
                  ) : (
                    selectedViewGoal.targetsArray.map((target, idx) => (
                      <div key={idx} className="flex justify-between items-center gap-4">
                        <div className="flex flex-col flex-1 pr-4">
                          <span className="text-[13px] text-gray-700">{target.title}</span>
                          {target.subtitle && <span className="text-[13px] text-gray-500">{target.subtitle}</span>}
                        </div>
                        <span
                          className={`px-2.5 py-0.5 rounded-full border text-[11px] font-medium whitespace-nowrap ${
                            target.status === "Achieved"
                              ? "bg-[#f0fdf4] border-[#86efac] text-[#16a34a]"
                              : target.status === "In Progress"
                              ? "bg-[#eff6ff] border-[#93c5fd] text-[#3b82f6]"
                              : "bg-white border-gray-400 text-gray-600"
                          }`}
                        >
                          {target.status}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Sections */}
            <div className="border-t-2  pt-6 mt-4">
              <h4 className="text-[14px] font-bold text-gray-700 mb-4">Clinical Summary/Notes</h4>
              <p className="text-[13px] text-gray-600 leading-relaxed">
                Arjun is showing improvement in combining 2-word phrases. Transitioning to 3-word targets this week. Motivated during play-based activities.
              </p>
            </div>

            <div className="border-t border-gray-200 pt-6 mt-6">
              <h4 className="text-[14px] font-bold text-gray-700 mb-4">Activity</h4>
              <div className="space-y-4">
                <div className="flex gap-4 items-start">
                  <div className="w-2 h-2 mt-1.5 rounded-full bg-green-500 shrink-0"></div>
                  <div className="w-24 shrink-0 text-[12px] text-gray-600">Apr 18, 2026</div>
                  <div className="text-[12px] text-gray-600">Report uploaded by Dr. Reena Kapoor</div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="w-2 h-2 mt-1.5 rounded-full bg-red-500 shrink-0"></div>
                  <div className="w-24 shrink-0 text-[12px] text-gray-600">Apr 18, 2026</div>
                  <div className="text-[12px] text-gray-600">Marked as Completed</div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="w-2 h-2 mt-1.5 rounded-full bg-blue-700 shrink-0"></div>
                  <div className="w-24 shrink-0 text-[12px] text-gray-600">Apr 12, 2026</div>
                  <div className="text-[12px] text-gray-600">Assessment scheduled</div>
                </div>
              </div>
            </div>
          </div>
        </CustomModal>
      )}
    </div>
  );
};

export default IEPGoalsTab;
