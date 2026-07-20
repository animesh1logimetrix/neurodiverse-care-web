import { FormEvent, useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { Link } from "react-router";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import axiosClient from "../../api/axiosClient";
import PageMeta from "../../components/common/PageMeta";
import { PlusIcon, UserIcon, CheckLineIcon, AlertIcon, TimeIcon } from "../../icons";
import { CustomModal } from "../../components/ui/modal/CustomModal";
import DatePicker from "../../components/form/date-picker";
import Select from "../../components/form/Select";
import { useAuth } from "../../context/AuthContext";
import { isParentGuardian } from "../../utils/roles";

// Mock Data for the Cards
const baseChild = {
  name: "Sana Iyer",
  ageLoc: "5 yrs Hyderabad, TS",
  mrn: "NC-2025-00501",
  status: "Active",
  pendingAction: "Genetic test pending review",
  tags: [
    { label: "ASD (Level 2)", color: "bg-blue-100 text-[#2DA0FF]" },
    { label: "ADHD-Combined", color: "bg-purple-100 text-purple-500" },
    { label: "Sensory Processing Disorder", color: "bg-green-100 text-green-500" },
  ],
  metrics: { activeGoals: 6, achieved: 3, providers: 4 },
  nextAppointment: "Today, 11:00 AM",
};
const childrenData = Array.from({ length: 6 }, (_, i) => ({ ...baseChild, id: i + 1 }));
// Dynamic Data Mapping

export default function Children() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("All Categories");
  const [isModalOpen, setIsModalOpen] = useState(false);
  // const [children, setChildren] = useState(childrenData);
  const [childForm, setChildForm] = useState({
    fullName: "",
    age: "",
    gender: "",
    address: "",
    // diagnoses: "",
    bloodGroup: "",
    motherName: "",
    fatherName: "",
    allergies: "",
    school: "",
    notes: "",
  });
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [submitStatus, setSubmitStatus] = useState<"success" | "error" | null>(null);

  const queryClient = useQueryClient();

  const { data: childrenRaw = [], isLoading: isLoadingChildren } = useQuery({
    queryKey: ["children"],
    queryFn: async () => {
      const res = await axiosClient.get("/child");
      return res.data;
    },
  });

  const children = childrenRaw.map((child: any) => ({
    id: child.id,
    name: child.full_name,
    ageLoc: `${child.age} yrs ${child.address}`,
    mrn: child.child_code || 'NA',
    status: "Active",
    pendingAction: child.notes !== "NA" && child.notes ? child.notes : "No pending action",
    tags: child.diagnoses && Array.isArray(child.diagnoses) && child.diagnoses.length > 0
      ? child.diagnoses.map((diag: any, index: number) => {
          const colors = [
            "bg-blue-100 text-[#2DA0FF]",
            "bg-purple-100 text-purple-500",
            "bg-green-100 text-green-500",
            "bg-orange-100 text-orange-500",
            "bg-pink-100 text-pink-500",
            "bg-teal-100 text-teal-500",
            "bg-indigo-100 text-indigo-500",
          ];
          
          const label = diag.category?.short_name || diag.category?.full_category_name || "Diagnosis";
          
          // Consistent pseudo-random color based on label string to prevent flickering on re-renders
          let hash = 0;
          for (let i = 0; i < label.length; i++) {
            hash = label.charCodeAt(i) + ((hash << 5) - hash);
          }
          const color = colors[Math.abs(hash) % colors.length];

          return { label, color };
        })
      : child.diagnosis 
        ? [{ label: child.diagnosis, color: "bg-blue-100 text-[#2DA0FF]" }] 
        : [{ label: "No Diagnosis", color: "bg-gray-100 text-gray-500" }],
    metrics: { activeGoals: 0, achieved: 0, providers: 1 },
    nextAppointment: "Not scheduled",
    profileImageUrl: child.profile_picture && child.profile_picture.length > 0 ? child.profile_picture[0].file_url : null,
  }));

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file); // Changed from 'files' to 'file'
      formData.append("folder", "uploads");
      const res = await axiosClient.post("/media/upload", formData, { // Changed from '/media/uploads' to '/media/upload'
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    },
  });

  const createChildMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await axiosClient.post("/child", payload);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Child added successfully");
      queryClient.invalidateQueries({ queryKey: ["children"] });
      setIsModalOpen(false);
      setChildForm({
        fullName: "",
        age: "",
        gender: "",
        address: "",
        // diagnoses: "",
        bloodGroup: "",
        motherName: "",
        fatherName: "",
        allergies: "",
        school: "",
        notes: "",
      });
      setSelectedPhoto(null);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to add child");
    },
  });

  const tabs = ["All", "ASD", "ADHD", "Speech", "Alerts"];

  // Filter children based on selected category
  const filteredChildren = children.filter((child) => {
    if (activeTab === "All Categories") return true;
    if (activeTab === "Alerts") return child.pendingAction.length > 0;
    // Match category keyword against any tag label (case-insensitive)
    return child.tags.some((tag) =>
      tag.label.toLowerCase().includes(activeTab.toLowerCase())
    );
  });

  const totalGoals = filteredChildren.reduce((sum, c) => sum + c.metrics.activeGoals, 0);
  const needAttention = filteredChildren.filter((c) => c.pendingAction.length > 0).length;

  const validateChildForm = () => {
    const errors: Record<string, string> = {};
    if (!childForm.fullName.trim()) errors.fullName = "Full name is required.";
    if (!childForm.age.trim()) errors.age = "Date of birth is required.";
    if (!childForm.gender) errors.gender = "Gender is required.";
    if (!childForm.address.trim()) errors.address = "Address is required.";
    // if (!childForm.diagnoses) errors.diagnoses = "Diagnoses is required.";
    if (!childForm.bloodGroup) errors.bloodGroup = "Blood group is required.";
    if (!childForm.motherName.trim()) errors.motherName = "Mother's name is required.";
    if (!childForm.fatherName.trim()) errors.fatherName = "Father's name is required.";
    if (!childForm.school.trim()) errors.school = "School is required.";
    return errors;
  };

  const handleChildFormChange = (field: string, value: string) => {
    setChildForm((prev) => ({ ...prev, [field]: value }));
    setFormErrors((prev) => ({ ...prev, [field]: "" }));
    setSubmitMessage(null);
    setSubmitStatus(null);
  };

  const handlePhotoChange = (file: File | null) => {
    if (file) {
      const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
      if (!validTypes.includes(file.type)) {
        toast.error("Please upload a valid image file (JPEG, PNG, GIF, WEBP)");
        return;
      }
    }
    setSelectedPhoto(file);
    setSubmitMessage(null);
    setSubmitStatus(null);
  };

  const handleAddChildSubmit = async (_formData?: Record<string, any>) => {
    const errors = validateChildForm();
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      setSubmitMessage(null);
      setSubmitStatus("error");
      return false;
    }

    let fileIds: number[] = [];
    if (selectedPhoto) {
      try {
        const uploadRes = await uploadMutation.mutateAsync(selectedPhoto);
        if (uploadRes && uploadRes.file && uploadRes.file.id) {
          fileIds = [uploadRes.file.id];
        } else if (uploadRes && uploadRes.data && uploadRes.data.file && uploadRes.data.file.id) {
          fileIds = [uploadRes.data.file.id];
        } else if (Array.isArray(uploadRes)) {
          fileIds = uploadRes.map((f: any) => typeof f === "object" ? f.id : f).filter(Boolean);
        } else if (uploadRes && uploadRes.fileIds) {
          fileIds = uploadRes.fileIds;
        } else if (uploadRes && uploadRes.data && Array.isArray(uploadRes.data)) {
          fileIds = uploadRes.data.map((f: any) => typeof f === "object" ? f.id : f).filter(Boolean);
        } else if (uploadRes && uploadRes.data && uploadRes.data.id) {
          fileIds = [uploadRes.data.id];
        } else if (uploadRes && uploadRes.id) {
          fileIds = [uploadRes.id];
        }
      } catch (error) {
        toast.error("Failed to upload photo");
        return false;
      }
    }

    let calculatedAge = 0;
    if (childForm.age) {
      const dobDate = new Date(childForm.age);
      const today = new Date();
      calculatedAge = today.getFullYear() - dobDate.getFullYear();
      const m = today.getMonth() - dobDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < dobDate.getDate())) {
        calculatedAge--;
      }
    }

    const mapGender = (g: string) => {
      if (g === "Male") return "MALE";
      if (g === "Female") return "FEMALE";
      if (g === "Other") return "OTHER";
      return g;
    };

    const mapBloodGroup = (bg: string) => {
      const mapping: Record<string, string> = {
        "A+": "A_POSITIVE",
        "A-": "A_NEGATIVE",
        "B+": "B_POSITIVE",
        "B-": "B_NEGATIVE",
        "AB+": "AB_POSITIVE",
        "AB-": "AB_NEGATIVE",
        "O+": "O_POSITIVE",
        "O-": "O_NEGATIVE",
      };
      return mapping[bg] || bg;
    };

    const payload = {
      full_name: childForm.fullName,
      age: Math.max(0, calculatedAge),
      gender: mapGender(childForm.gender),
      address: childForm.address,
      // diagnosis: childForm.diagnoses,
      blood_group: mapBloodGroup(childForm.bloodGroup),
      mother_name: childForm.motherName,
      father_name: childForm.fatherName,
      allergies: childForm.allergies,
      school: childForm.school,
      notes: childForm.notes,
      dob: childForm.age ? new Date(childForm.age).toISOString() : "", // Convert date string to ISO
      referred_by: "",
      fileIds: fileIds,
    };

    try {
      await createChildMutation.mutateAsync(payload);
      return undefined;
    } catch (error) {
      return false;
    }
  };

  return (
    <>
      <PageMeta
        title="Children | Care"
        description="Children management dashboard"
      />

      {/* <PageBreadcrumb pageTitle="Children" hideTitle /> */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-550 dark:text-white">Children</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {filteredChildren.length} children · {needAttention} need attention
          </p>
        </div>
          {isParentGuardian(user?.role?.name) && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#2DA0FF] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#2DA0FF] transition-colors"
            >
              <PlusIcon className="w-4 h-4 fill-current" />
              Add Child
            </button>
          )}
        </div>

      {/* Category Dropdown Filter & Alerts */}
      <div className="flex items-center gap-6 border-b border-gray-200 mb-4 pb-0">
        <div className="relative w-full sm:w-[220px] mb-3">
          <Select
            value={activeTab === "Alerts" ? "All Categories" : activeTab}
            onChange={(val) => setActiveTab(val)}
            className="w-full rounded-xl"
            options={[
              { value: "All Categories", label: "All Categories" },
              { value: "ASD", label: "ASD" },
              { value: "ADHD", label: "ADHD" },
              { value: "Speech", label: "Speech" }
            ]}
          />
        </div>

        <button
          onClick={() => setActiveTab("Alerts")}
          className={`mb-3 h-[48px] px-6 border rounded-xl text-[14px] font-medium transition-all flex items-center justify-center ${
            activeTab === "Alerts" 
              ? "bg-[#e5f5e8] border-[#16a34a] text-[#16a34a]" 
              : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
          }`}
        >
          Alerts
        </button>
      </div>

      {/* Summary Statistics */}
      <div className="flex flex-wrap items-center gap-8 mb-6 text-sm text-gray-600 font-medium">
        <div className="flex items-center gap-2">
          <UserIcon className="w-5 h-5 text-gray-500" />
          <span className="text-gray-900 font-semibold">{filteredChildren.length}</span> Total Active
        </div>
        <div className="flex items-center gap-2">
          <CheckLineIcon className="w-5 h-5 text-gray-500" />
          <span className="text-gray-900 font-semibold">{totalGoals}</span> Goals Active
        </div>
        <div className="flex items-center gap-2">
          <AlertIcon className="w-5 h-5 text-gray-500" />
          <span className="text-gray-900 font-semibold">{needAttention}</span> Need Attention
        </div>
        <div className="flex items-center gap-2">
          <TimeIcon className="w-5 h-5 text-gray-500" />
          <span className="text-gray-900 font-semibold">3</span> Sessions Today
        </div>
      </div>

      {/* Divider if needed (The image shows a light gray line under the summary row) */}
      <hr className="border-gray-200 mb-6" />

      {/* Children Cards Grid */}
      {isLoadingChildren ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredChildren.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-gray-50 rounded-[20px] border border-dashed border-gray-300">
          <UserIcon className="w-12 h-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-1">No children found</h3>
          <p className="text-gray-500 text-sm max-w-sm mb-4">
            Get started by adding a new child to your care roster.
          </p>
          {isParentGuardian(user?.role?.name) && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#2DA0FF] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#2DA0FF] transition-colors"
            >
              <PlusIcon className="w-4 h-4 fill-current" />
              Add Child
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredChildren.map((child) => (
          <Link
            to={`/care/children/${child.id}`}
            key={child.id}
            className="bg-white rounded-[20px] border border-gray-100 shadow-[0px_4px_16px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col hover:shadow-lg transition-shadow cursor-pointer block"
          >
            {/* Top Row: Avatar and Details */}
            <div className="p-5 pb-4 relative">
              <div className="flex items-start gap-3">
                {/* Avatar */}
                {child.profileImageUrl ? (
                  <img src={child.profileImageUrl} alt={child.name} className="w-[50px] h-[50px] rounded-full object-cover shrink-0 border border-gray-200" />
                ) : (
                  <div className="w-[50px] h-[50px] rounded-full bg-[#fdf3e7] shrink-0" />
                )}
                
                {/* Details */}
                <div className="flex-1">
                  <h3 className="text-[#ea580c] font-bold text-[17px] leading-tight mb-1">
                    {child.name}
                  </h3>
                  <p className="text-[#ea580c] text-sm font-medium leading-tight mb-1">
                    {child.ageLoc}
                  </p>
                  <p className="text-gray-500 text-xs font-medium">
                    MRN: {child.mrn}
                  </p>
                </div>

                {/* Active Badge */}
                <div className="absolute top-5 right-5">
                  <span className="bg-[#e5f5e8] text-[#16a34a] px-3 py-1 rounded-md text-xs font-bold tracking-wide uppercase">
                    {child.status}
                  </span>
                </div>
              </div>

              {/* Status Bar */}
              <div className="mt-4">
                <div className="border border-[#fed7aa] bg-[#fff7ed] rounded-md px-3 py-1.5 inline-block">
                  <span className="text-[#ea580c] text-xs font-medium">
                    {child.pendingAction}
                  </span>
                </div>
              </div>

              {/* Tags */}
              <div className="mt-3 flex flex-wrap gap-2">
                {child.tags.map((tag: { label: string; color: string }, i: number) => (
                  <span
                    key={i}
                    className={`px-2 py-1 rounded-[4px] text-[11px] font-bold ${tag.color}`}
                  >
                    {tag.label}
                  </span>
                ))}
              </div>

              {/* Bottom Metrics */}
              <div className="mt-5 flex items-center justify-between px-2">
                <div className="flex flex-col items-center">
                  <span className="text-gray-800 font-bold text-sm">
                    {child.metrics.activeGoals}
                  </span>
                  <span className="text-gray-500 text-[11px] font-medium uppercase tracking-wider">
                    Active Goals
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-gray-800 font-bold text-sm">
                    {child.metrics.achieved}
                  </span>
                  <span className="text-gray-500 text-[11px] font-medium uppercase tracking-wider">
                    Achieved
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-gray-800 font-bold text-sm">
                    {child.metrics.providers}
                  </span>
                  <span className="text-gray-500 text-[11px] font-medium uppercase tracking-wider">
                    Providers
                  </span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-100 bg-white p-4 flex items-center gap-2">
              <TimeIcon className="w-4 h-4 text-gray-400" />
              <span className="text-gray-500 text-xs font-medium">
                Next: {child.nextAppointment}
              </span>
            </div>
          </Link>
        ))}
      </div>
      )}

      {/* Add New Child Modal using CustomModal component */}
      <CustomModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Child"
        size="lg"
        footerAlign="center"
        asteriskColor="black"
        overlayBlur={false}
        submitText="Add Child"
        maxBodyHeight="70vh"
        modalClassName="max-h-[90vh]"
        onSubmit={handleAddChildSubmit}
        customFooter={
          <div className="flex items-center justify-center gap-3 px-8 py-5 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-6 py-2.5 rounded-lg bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors text-sm cursor-pointer min-w-[120px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createChildMutation.isPending || uploadMutation.isPending}
              className="px-6 py-2.5 rounded-lg bg-brand-500 text-white font-semibold hover:bg-brand-600 transition-colors text-sm cursor-pointer min-w-[120px] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {(createChildMutation.isPending || uploadMutation.isPending) ? "Adding..." : "Add Child"}
            </button>
          </div>
        }
      >
          <div className="grid grid-cols-2 gap-x-6 gap-y-5 mb-5">
            {/* Full Name */}
            <div className="col-span-2 sm:col-span-1 flex flex-col gap-1.5">
              <label className="block text-xs font-bold text-black">
                Full Name <span className="text-black">*</span>
              </label>
              <input
                type="text"
                value={childForm.fullName}
                onChange={(e) => handleChildFormChange("fullName", e.target.value)}
                // required
                placeholder="Enter full name"
                className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
              />
              {formErrors.fullName && <p className="mt-1 text-xs text-red-600">{formErrors.fullName}</p>}
            </div>

            {/* Age */}
            <div className="col-span-2 sm:col-span-1 flex flex-col gap-1.5">
              <label className="block text-xs font-bold text-black">
                Age <span className="text-black">*</span>
              </label>
              <div>
              <DatePicker
                id="add-child-dob"
                placeholder="Select date"
                defaultDate={childForm.age || undefined}
                maxDate="today"
                onChange={([dates], currentDateString) =>
                  handleChildFormChange("age", currentDateString || "")
                }
              />
              {formErrors.age && <p className="mt-1 text-xs text-red-600">{formErrors.age}</p>}
            </div>
            </div>

            {/* Gender */}
            <div className="col-span-2 sm:col-span-1 flex flex-col gap-1.5">
              <label className="block text-xs font-bold text-black">
                Gender<span className="text-black">*</span>
              </label>
              <Select
                value={childForm.gender}
                onChange={(val) => handleChildFormChange("gender", val)}
                placeholder="Select gender"
                options={[
                  { value: "Male", label: "Male" },
                  { value: "Female", label: "Female" },
                  { value: "Other", label: "Other" }
                ]}
                className="w-full"
              />
              {formErrors.gender && <p className="mt-1 text-xs text-red-600">{formErrors.gender}</p>}
            </div>

            {/* Address */}
            <div className="col-span-2 sm:col-span-1 flex flex-col gap-1.5">
              <label className="block text-xs font-bold text-black">
                Address <span className="text-black">*</span>
              </label>
              <input
                type="text"
                value={childForm.address}
                onChange={(e) => handleChildFormChange("address", e.target.value)}
                // required
                placeholder="Enter address"
                className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
              />
              {formErrors.address && <p className="mt-1 text-xs text-red-600">{formErrors.address}</p>}
            </div>

            {/* Diagnoses */}
            {/* <div className="col-span-2 sm:col-span-1 flex flex-col gap-1.5">
              <label className="block text-xs font-bold text-black">
                Diagnoses<span className="text-black">*</span>
              </label>
              <Select
                value={childForm.diagnoses}
                onChange={(val) => handleChildFormChange("diagnoses", val)}
                placeholder="Select diagnoses"
                options={[
                  { value: "ADHD", label: "ADHD" },
                  { value: "ASD", label: "ASD" },
                  { value: "Sensory Processing Disorder", label: "Sensory Processing Disorder" },
                  { value: "Speech Impairment", label: "Speech Impairment" }
                ]}
                className="w-full"
              />
              {formErrors.diagnoses && <p className="mt-1 text-xs text-red-600">{formErrors.diagnoses}</p>}
            </div> */}

            {/* Blood Group */}
            <div className="col-span-2 sm:col-span-1 flex flex-col gap-1.5">
              <label className="block text-xs font-bold text-black">
                Blood Group<span className="text-black">*</span>
              </label>
              <Select
                value={childForm.bloodGroup}
                onChange={(val) => handleChildFormChange("bloodGroup", val)}
                placeholder="Select blood group"
                options={[
                  { value: "A+", label: "A+" },
                  { value: "A-", label: "A-" },
                  { value: "B+", label: "B+" },
                  { value: "B-", label: "B-" },
                  { value: "AB+", label: "AB+" },
                  { value: "AB-", label: "AB-" },
                  { value: "O+", label: "O+" },
                  { value: "O-", label: "O-" }
                ]}
                className="w-full"
              />
              {formErrors.bloodGroup && <p className="mt-1 text-xs text-red-600">{formErrors.bloodGroup}</p>}
            </div>

            {/* Mother's Name */}
            <div className="col-span-2 sm:col-span-1 flex flex-col gap-1.5">
              <label className="block text-xs font-bold text-black">
                Mother's Name<span className="text-black">*</span>
              </label>
              <input
                type="text"
                value={childForm.motherName}
                onChange={(e) => handleChildFormChange("motherName", e.target.value)}
                // required
                placeholder="Enter mother's name"
                className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
              />
              {formErrors.motherName && <p className="mt-1 text-xs text-red-600">{formErrors.motherName}</p>}
            </div>

            {/* Father's Name */}
            <div className="col-span-2 sm:col-span-1 flex flex-col gap-1.5">
              <label className="block text-xs font-bold text-black">
                Father's Name<span className="text-black">*</span>
              </label>
              <input
                type="text"
                value={childForm.fatherName}
                onChange={(e) => handleChildFormChange("fatherName", e.target.value)}
                // required
                placeholder="Enter father's name"
                className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
              />
              {formErrors.fatherName && <p className="mt-1 text-xs text-red-600">{formErrors.fatherName}</p>}
            </div>

            {/* Allergies */}
            <div className="col-span-2 sm:col-span-1 flex flex-col gap-1.5">
              <label className="block text-xs font-bold text-black">
                Allergies
              </label>
              <input
                type="text"
                value={childForm.allergies}
                onChange={(e) => handleChildFormChange("allergies", e.target.value)}
                placeholder="Enter allergies"
                className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
              />
            </div>

            {/* School */}
            <div className="col-span-2 sm:col-span-1 flex flex-col gap-1.5">
              <label className="block text-xs font-bold text-black">
                School<span className="text-black">*</span>
              </label>
              <input
                type="text"
                value={childForm.school}
                onChange={(e) => handleChildFormChange("school", e.target.value)}
                // required
                placeholder="Enter school"
                className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
              />
              {formErrors.school && <p className="mt-1 text-xs text-red-600">{formErrors.school}</p>}
            </div>
          </div>

          {/* Notes (Full Width) */}
          <div className="flex flex-col gap-1.5 mb-5">
            <label className="block text-xs font-bold text-black">
              Notes
            </label>
            <input
              type="text"
              value={childForm.notes}
              onChange={(e) => handleChildFormChange("notes", e.target.value)}
              placeholder="Enter notes"
              className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
            />
          </div>
          {submitMessage && isModalOpen && (
            <div className={`mb-4 rounded-lg px-4 py-3 text-sm ${submitStatus === "success" ? "bg-emerald-50 border border-emerald-100 text-emerald-800" : "bg-red-50 border border-red-100 text-red-800"}`}>
              {submitMessage}
            </div>
          )}

          {/* Upload Photo (Full Width) */}
          <div className="flex flex-col gap-1.5">
            <label className="block text-xs font-bold text-black">
              Upload Photo
            </label>
            {selectedPhoto ? (
              <div className="relative inline-block w-fit">
                <img
                  src={URL.createObjectURL(selectedPhoto)}
                  alt="Selected preview"
                  className="h-24 w-24 object-cover rounded-lg border border-gray-300"
                />
                <button
                  type="button"
                  onClick={() => handlePhotoChange(null)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 focus:outline-none transition-colors"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="border border-dashed border-gray-300 rounded-lg min-h-[88px] bg-white hover:bg-gray-50 transition-colors cursor-pointer relative flex items-center justify-center gap-2 px-4 py-4">
                <input
                  type="file"
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={(e) => handlePhotoChange(e.target.files?.[0] ?? null)}
                />
                <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <p className="text-sm text-gray-500 leading-none">
                  Drag & drop or <span className="text-brand-500 font-semibold">browse files</span> Jpeg, Png, Gif, Webp
                </p>
              </div>
            )}
          </div>
      </CustomModal>
    </>
  );
}
