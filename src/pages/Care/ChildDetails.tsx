import { useState, useRef } from "react";
import { useParams, Link } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import axiosClient from "../../api/axiosClient";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { PencilIcon, UserIcon, ArrowUpIcon } from "../../icons";
import { CustomModal } from "../../components/ui/modal/CustomModal";
import DatePicker from "../../components/form/date-picker";
import OverviewTab from "../../components/Care/OverviewTab";
import DiagnosesTab from "../../components/Care/DiagnosesTab";
import MedicationsTab from "../../components/Care/MedicationsTab";
import GeneticTestingTab from "../../components/Care/GeneticTestingTab";
import AssessmentsTab from "../../components/Care/AssessmentsTab";
import IEPGoalsTab from "../../components/Care/IEPGoalsTab";
import SessionNotesTab from "../../components/Care/SessionNotesTab";
import Select from "../../components/form/Select";

export default function ChildDetails() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("Overview");
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [childForm, setChildForm] = useState({
    fullName: "",
    age: "",
    gender: "",
    address: "",
    diagnoses: "",
    bloodGroup: "",
    motherName: "",
    fatherName: "",
    allergies: "",
    school: "",
    notes: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [submitStatus, setSubmitStatus] = useState<"success" | "error" | null>(null);

  const { data: child, isLoading } = useQuery({
    queryKey: ["child", id],
    queryFn: async () => {
      const res = await axiosClient.get(`/child/${id}`);
      return res.data;
    },
    enabled: !!id,
  });

  const uploadPhotoMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "uploads");
      const res = await axiosClient.post("/media/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
          }
        },
      });
      return res.data;
    },
  });

  const updateChildPhotoMutation = useMutation({
    mutationFn: async ({ childId, payload }: { childId: string, payload: any }) => {
      const res = await axiosClient.patch(`/child/${childId}`, payload, {
        headers: { "Content-Type": "application/json" },
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success("Photo updated successfully");
      queryClient.invalidateQueries({ queryKey: ["child", id] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update child photo");
    },
  });

  const updateChildDetailsMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await axiosClient.patch(`/child/${id}`, payload, {
        headers: { "Content-Type": "application/json" },
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success("Child details updated successfully");
      queryClient.invalidateQueries({ queryKey: ["child", id] });
      setIsEditModalOpen(false);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update child details");
    },
  });

  const handleChildFormChange = (field: string, value: string) => {
    setChildForm((prev) => ({ ...prev, [field]: value }));
    setFormErrors((prev) => ({ ...prev, [field]: "" }));
    setSubmitMessage(null);
    setSubmitStatus(null);
  };

  const validateChildForm = () => {
    const errors: Record<string, string> = {};
    if (!childForm.fullName.trim()) errors.fullName = "Full name is required.";
    if (!childForm.age.trim()) errors.age = "Date of birth is required.";
    if (!childForm.gender) errors.gender = "Gender is required.";
    if (!childForm.address.trim()) errors.address = "Address is required.";
    if (!childForm.diagnoses) errors.diagnoses = "Diagnoses is required.";
    if (!childForm.bloodGroup) errors.bloodGroup = "Blood group is required.";
    if (!childForm.motherName.trim()) errors.motherName = "Mother's name is required.";
    if (!childForm.fatherName.trim()) errors.fatherName = "Father's name is required.";
    if (!childForm.school.trim()) errors.school = "School is required.";
    return errors;
  };

  const handleEditChildSubmit = async (_formData?: Record<string, any>) => {
    const errors = validateChildForm();
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      setSubmitMessage(null);
      setSubmitStatus("error");
      return false;
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
      diagnosis: childForm.diagnoses,
      blood_group: mapBloodGroup(childForm.bloodGroup),
      mother_name: childForm.motherName,
      father_name: childForm.fatherName,
      allergies: childForm.allergies,
      school: childForm.school,
      notes: childForm.notes,
      dob: childForm.age ? new Date(childForm.age).toISOString() : "", 
      referred_by: child?.referred_by || "", 
    };

    try {
      await updateChildDetailsMutation.mutateAsync(payload);
      return undefined;
    } catch (error) {
      return false;
    }
  };

  const openEditModal = () => {
    if (child) {
      // Reverse map gender
      const reverseGender = (g: string) => {
        if (!g) return "";
        const lg = g.toLowerCase();
        if (lg === "male") return "Male";
        if (lg === "female") return "Female";
        if (lg === "other") return "Other";
        return g;
      };

      // Reverse map blood group
      const reverseBloodGroup = (bg: string) => {
        if (!bg) return "";
        const mapping: Record<string, string> = {
          "A_POSITIVE": "A+",
          "A_NEGATIVE": "A-",
          "B_POSITIVE": "B+",
          "B_NEGATIVE": "B-",
          "AB_POSITIVE": "AB+",
          "AB_NEGATIVE": "AB-",
          "O_POSITIVE": "O+",
          "O_NEGATIVE": "O-",
        };
        return mapping[bg] || bg;
      };

      setChildForm({
        fullName: child.full_name || "",
        age: child.dob ? new Date(child.dob).toISOString().split('T')[0] : "",
        gender: reverseGender(child.gender),
        address: child.address || "",
        diagnoses: child.diagnosis || "",
        bloodGroup: reverseBloodGroup(child.blood_group),
        motherName: child.mother_name || "",
        fatherName: child.father_name || "",
        allergies: child.allergies || "",
        school: child.school || "",
        notes: child.notes || "",
      });
      setFormErrors({});
      setIsEditModalOpen(true);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error("Please upload a valid image file (JPEG, PNG, GIF, WEBP)");
      return;
    }

    setIsUploadingPhoto(true);
    setUploadProgress(0);
    try {
      const uploadRes = await uploadPhotoMutation.mutateAsync(file);
      
      let fileId = null;
      if (uploadRes?.file?.id) {
        fileId = uploadRes.file.id;
      } else if (uploadRes?.data?.file?.id) {
        fileId = uploadRes.data.file.id;
      } else if (Array.isArray(uploadRes) && uploadRes[0]?.id) {
        fileId = uploadRes[0].id;
      } else if (uploadRes?.fileIds?.[0]) {
        fileId = uploadRes.fileIds[0];
      } else if (Array.isArray(uploadRes?.data) && uploadRes.data[0]?.id) {
        fileId = uploadRes.data[0].id;
      } else if (uploadRes?.data?.id) {
        fileId = uploadRes.data.id;
      } else if (uploadRes?.id) {
        fileId = uploadRes.id;
      }

      if (!fileId) {
         throw new Error("Could not extract file ID from upload response");
      }

      if (!child) throw new Error("Child data not loaded");
      
      const payload = {
        fileIds: [fileId]
      };
      
      await updateChildPhotoMutation.mutateAsync({ childId: id as string, payload });
      
    } catch (error) {
       console.error("Upload error:", error);
       toast.error("Failed to upload and update photo");
    } finally {
       setIsUploadingPhoto(false);
       if (fileInputRef.current) {
          fileInputRef.current.value = "";
       }
    }
  };

  const documents = [
    { name: "Prescription J", date: "18:2023", size: "p120 0" },
    { name: "Side Effects Info Sheet", date: "Jun 15 2027", size: "DM-310KB" },
    { name: "Ah 15:2003 Parent Information Sheet", date: "pdf-180 KB", size: "" },
    { name: "Medication Guide", date: "Jun 15.2073", size: "pat-450 Kn" },
  ];

  const historyItems = [
    {
      dot: "bg-emerald-500",
      date: "Sep 15, 2022",
      event: "Diagnosis confirmed",
      detail: "By Dr. Reena Kapoor",
    },
    {
      dot: "bg-red-500",
      date: "Aug 28, 2022",
      event: "Reports added",
      detail: "MRI Brain Scan, EEG Report",
    },
    {
      dot: "bg-blue-700",
      date: "Jul 10, 2022",
      event: "Initial assessment completed",
      detail: "Developmental Assessment uploaded",
    },
  ];

  const tabs = [
    "Overview",
    "Diagnoses",
    "Medications",
    "Genetic Testing",
    "Assessments",
    "IEP Goals",
    "Session Notes",
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title="Child Details | Care"
        description="Detailed view of a child's profile and progress"
      />

      {/* Header Section */}
      <div className="mb-4">
        {/* Breadcrumb */}
        {/* <PageBreadcrumb pageTitle="Child Details" hideTitle /> */}

        {/* Title Area */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 leading-tight">
              Children
            </h1>
            {/* <p className="text-sm text-gray-500 mt-1">
              6 children 3 need attention
            </p> */}
          </div>
          {/* <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#2DA0FF] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#2DA0FF] transition-colors">
            + Add Child
          </button> */}
        </div>
      </div>

      {/* Main Profile Section */}
      <div className="flex flex-col md:flex-row gap-8 mb-8 items-stretch">
        {/* Avatar (Left) */}
        <div className="w-full max-w-[240px] aspect-square mx-auto md:mx-0 md:max-w-none md:w-48 lg:w-56 md:h-auto rounded-[28px] bg-[#fdf3e7] overflow-hidden shrink-0 flex items-center justify-center shadow-sm border border-[#ffedd5] relative">
          {/* Photo */}
          {isUploadingPhoto && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
              <span className="text-3xl font-bold text-brand-600 mb-1">{uploadProgress}%</span>
              <span className="text-sm font-medium text-gray-600">Uploading...</span>
              <div className="w-24 h-1.5 bg-orange-100 rounded-full mt-3 overflow-hidden">
                <div 
                  className="h-full bg-brand-600 transition-all duration-300 ease-out" 
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
          {child?.profile_picture?.[0]?.file_url ? (
            <img src={child.profile_picture[0].file_url} alt={child.full_name} className="w-full h-full object-cover" />
          ) : (
            <UserIcon className="w-24 h-24 text-[#fed7aa]" />
          )}
        </div>

        {/* Right Side (Details + Actions + Note) */}
        <div className="flex-1 flex flex-col justify-between gap-6 lg:gap-0 w-full h-auto">
          
          {/* Top: Details & Actions */}
          <div className="flex flex-col md:flex-row gap-6 items-start justify-between w-full">
            
            {/* Details */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h2 className="text-2xl font-bold text-gray-800 leading-none">{child?.full_name || "Loading..."}</h2>
                <span className="bg-[#e5f5e8] text-[#16a34a] px-3 py-1 rounded-md text-xs font-bold tracking-wide capitalize leading-none">
                  Active
                </span>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-y-3 gap-x-4">
                <div className="flex flex-col">
                  <p className="text-sm text-gray-500 mb-0.5">Child Code</p>
                  <p className="font-bold text-gray-800 text-sm truncate">
                    {child?.id ? `NC-2025-${String(child.id).padStart(5, '0')}` : "N/A"}
                  </p>
                </div>
                <div className="flex flex-col">
                  <p className="text-sm text-gray-500 mb-0.5">DOB</p>
                  <p className="font-bold text-gray-800 text-sm truncate">
                    {child?.dob ? new Date(child.dob).toLocaleDateString() : "N/A"}
                  </p>
                </div>
                <div className="flex flex-col">
                  <p className="text-sm text-gray-500 mb-0.5">Gender</p>
                  <p className="font-bold text-gray-800 text-sm capitalize truncate">{child?.gender?.toLowerCase() || "N/A"}</p>
                </div>
                <div className="flex flex-col">
                  <p className="text-sm text-gray-500 mb-0.5">Blood Group</p>
                  <p className="font-bold text-gray-800 text-sm truncate">{child?.blood_group?.replace("_", " ") || "N/A"}</p>
                </div>
                
                <div className="flex flex-col">
                  <p className="text-sm text-gray-500 mb-0.5">Primary Diagnosis</p>
                  <p className="font-bold text-gray-800 text-sm truncate">{child?.diagnosis || "N/A"}</p>
                </div>
                <div className="flex flex-col">
                  <p className="text-sm text-gray-500 mb-0.5">Referred By</p>
                  <p className="font-bold text-gray-800 text-sm truncate">{child?.referred_by || "N/A"}</p>
                </div>
                <div className="flex flex-col">
                  <p className="text-sm text-gray-500 mb-0.5">Address</p>
                  <p className="font-bold text-gray-800 text-sm break-words line-clamp-2">{child?.address || "N/A"}</p>
                </div>
                <div className="flex flex-col">
                  <p className="text-sm text-gray-500 mb-0.5">Allergies</p>
                  <p className="font-bold text-gray-800 text-sm truncate">{child?.allergies || "N/A"}</p>
                </div>
                
                <div className="flex flex-col col-span-2 lg:col-span-4">
                  <p className="text-sm text-gray-500 mb-0.5">Parents</p>
                  <p className="font-bold text-gray-800 text-sm truncate">
                    {child?.childUsers?.filter((cu: any) => cu.relation === "PARENT").map((cu: any) => cu.user?.name).join(", ") || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions (Right) */}
            <div className="flex flex-col shrink-0 w-full md:w-48 lg:w-[200px] border border-[#fed7aa] rounded-xl bg-white overflow-hidden">
              <button 
                onClick={openEditModal}
                className="flex items-center gap-3 w-full px-4 py-3.5 text-gray-600 text-sm hover:bg-orange-50 transition-colors border-b border-gray-100"
              >
                <PencilIcon className="w-4 h-4 fill-current text-gray-400" />
                Edit Child Details
              </button>
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingPhoto}
                className="flex items-center gap-3 w-full px-4 py-3.5 text-gray-600 text-sm hover:bg-orange-50 transition-colors border-b border-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowUpIcon className="w-4 h-4 fill-current text-gray-400" />
                {isUploadingPhoto ? "Uploading..." : "Upload Photo"}
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handlePhotoUpload} 
              />
              {/* <button className="flex items-center gap-3 w-full px-4 py-3.5 text-gray-600 text-sm hover:bg-orange-50 transition-colors">
                <UserIcon className="w-4 h-4 fill-current text-gray-400" />
                View Profile
              </button> */}
            </div>
          </div>
          
          {/* Bottom Row: Note Field */}
          <div className="mt-3 flex items-center gap-2 bg-[#fff7ed] border border-[#fed7aa] rounded-md px-3 py-2 w-full">
            <span className="text-gray-500 text-sm shrink-0">Note :</span>
            <input 
              type="text" 
              readOnly
              value={child?.notes || ""}
              className="flex-1 bg-transparent text-sm focus:outline-none text-gray-800"
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-gray-200 mb-6 overflow-x-auto custom-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`transition-all whitespace-nowrap pb-3 text-sm font-semibold ${
                activeTab === tab
                  ? "text-white"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <span className={`inline-flex items-center rounded-md px-4 py-1.5 ${
                activeTab === tab 
                ? "bg-[#2DA0FF]"
                : "bg-transparent"
              }`}>
                {tab}
              </span>
            </button>
          ))}
      </div>

      {/* Overview Content */}
      {activeTab === "Overview" && <OverviewTab />}

      {/* Diagnoses Content */}
      {activeTab === "Diagnoses" && <DiagnosesTab />}

      {/* Medications Content */}
      {activeTab === "Medications" && <MedicationsTab />}

      {/* Genetic Testing Content */}
      {activeTab === "Genetic Testing" && <GeneticTestingTab />}

      {/* Assessments Content */}
      {activeTab === "Assessments" && <AssessmentsTab />}

      {/* IEP Goals Content */}
      {activeTab === "IEP Goals" && <IEPGoalsTab />}

      {/* Session Notes Content */}
      {activeTab === "Session Notes" && <SessionNotesTab />}

      {/* Edit Child Details Modal */}
      <CustomModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Child Details"
        size="lg"
        footerAlign="center"
        asteriskColor="black"
        overlayBlur={false}
        submitText="Save Changes"
        maxBodyHeight="70vh"
        modalClassName="max-h-[90vh]"
        onSubmit={handleEditChildSubmit}
        customFooter={
          <div className="flex items-center justify-center gap-3 px-8 py-5 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-6 py-2.5 rounded-lg bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors text-sm cursor-pointer min-w-[120px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateChildDetailsMutation.isPending}
              className="px-6 py-2.5 rounded-lg bg-brand-500 text-white font-semibold hover:bg-brand-600 transition-colors text-sm cursor-pointer min-w-[120px] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updateChildDetailsMutation.isPending ? "Saving..." : "Save Changes"}
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
                placeholder="Enter full name"
                className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
              />
              {formErrors.fullName && <p className="mt-1 text-xs text-red-600">{formErrors.fullName}</p>}
            </div>

            {/* Age */}
            <div className="col-span-2 sm:col-span-1 flex flex-col gap-1.5">
              <label className="block text-xs font-bold text-black">
                DOB <span className="text-black">*</span>
              </label>
              <div>
              <DatePicker
                id="edit-child-dob"
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
                placeholder="Enter address"
                className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
              />
              {formErrors.address && <p className="mt-1 text-xs text-red-600">{formErrors.address}</p>}
            </div>

            {/* Diagnoses */}
            <div className="col-span-2 sm:col-span-1 flex flex-col gap-1.5">
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
            </div>

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
          {submitMessage && isEditModalOpen && (
            <div className={`mb-4 rounded-lg px-4 py-3 text-sm ${submitStatus === "success" ? "bg-emerald-50 border border-emerald-100 text-emerald-800" : "bg-red-50 border border-red-100 text-red-800"}`}>
              {submitMessage}
            </div>
          )}
      </CustomModal>
    </>
  );
}
