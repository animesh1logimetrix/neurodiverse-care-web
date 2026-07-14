import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosClient from "../../api/axiosClient";
import toast from "react-hot-toast";
import PageMeta from "../../components/common/PageMeta";
import CustomModal from "../../components/ui/modal/CustomModal";
import InputField from "../../components/form/input/InputField";
import DatePicker from "../../components/form/date-picker";
import Select from "../../components/form/Select";
// ─── SVG Icons ──────────────────────────────────────────────────────────────

function PlusIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}
function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}
function ChevronDownIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}
function ChevronRightIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}
function PaperclipIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
    </svg>
  );
}
function UserIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  );
}
function EyeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
  );
}

// Stat Icons
function HomeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}
function ClockIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
function CheckCircleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
function CalendarIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

// Category Icons
function LightningIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}
function BookIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}
function PulseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );
}
function UsersIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
function MortarboardIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" />
    </svg>
  );
}
function BrainIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.5 2A2.5 2.5 0 0 0 7 4.5v15a2.5 2.5 0 0 0 5 0v-15A2.5 2.5 0 0 0 9.5 2z"/><path d="M14.5 2A2.5 2.5 0 0 1 17 4.5v15a2.5 2.5 0 0 1-5 0v-15A2.5 2.5 0 0 1 14.5 2z"/>
    </svg>
  );
}
function ImageIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
    </svg>
  );
}
function VideoIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
    </svg>
  );
}
function FileIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
    </svg>
  );
}

// ─── Data ────────────────────────────────────────────────────────────────────
const stats = [
  { label: "Total Submitted", value: "5", icon: <HomeIcon />, color: "#7db9fb", bg: "#f0f6fe" },
  { label: "Pending Review", value: "1", icon: <ClockIcon />, color: "#f79009", bg: "#fffaeb" },
  { label: "Actioned", value: "2", icon: <CheckCircleIcon />, color: "#12b76a", bg: "#ecfdf3" },
  { label: "This Month", value: "0", icon: <CalendarIcon />, color: "#7a5af8", bg: "#f4f3ff" },
];

const observations = [
  {
    title: "Increased meltdowns during transitions",
    category: "Behavior",
    date: "Jun 28, 2025",
    daysAgo: "375 days ago",
    description: "Aiden had three significant meltdowns today when transitioning between activities — from breakfast to getting dressed, from the car to school, and from school to home. Each lasted about 10–15 minutes. He was inconsolable until we provided deep pressure via a weighted blanket.",
    attachments: 1,
    status: "Acknowledged",
    icon: <LightningIcon />,
    iconColor: "#f79009",
    iconBg: "#fffaeb",
    statusBadge: "bg-[#f4f3ff] text-[#7a5af8]",
    statusIcon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
    )
  },
  {
    title: "Spontaneous two-word phrases at dinner",
    category: "Communication",
    date: "Jun 25, 2025",
    daysAgo: "378 days ago",
    description: 'For the first time, Aiden used two-word combinations spontaneously during dinner: "more juice" and "all done" without prompting. He made eye contact while saying it and smiled when we responded. This is a big step forward from his usual single-word requests.',
    attachments: 0,
    status: "Actioned",
    icon: <BookIcon />,
    iconColor: "#7db9fb",
    iconBg: "#f0f6fe",
    statusBadge: "bg-[#ecfdf3] text-[#12b76a]",
    statusIcon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
    )
  },
  {
    title: "Hypersensitivity to clothing tags",
    category: "Sensory Response",
    date: "Jun 22, 2025",
    daysAgo: "382 days ago",
    description: "Getting dressed has become a 30-minute battle every morning. Aiden refuses to wear any shirt with a tag and screams when fabric touches his neck. We have started buying tagless clothing but even seams on socks are causing distress.",
    attachments: 1,
    status: "Viewed",
    icon: <PulseIcon />,
    iconColor: "#f79009",
    iconBg: "#fffaeb",
    statusBadge: "bg-[#fffaeb] text-[#f79009]",
    statusIcon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
      </svg>
    )
  },
  {
    title: "Parallel play with neighbor child",
    category: "Social Interaction",
    date: "Jun 18, 2025",
    daysAgo: "385 days ago",
    description: "Aiden played in the backyard alongside our neighbor's son (age 6) for nearly 40 minutes without any intervention needed. While they were not directly interacting, he tolerated the proximity and even glanced at the other child several times. No aggression or withdrawal.",
    attachments: 1,
    status: "Actioned",
    icon: <UsersIcon />,
    iconColor: "#12b76a",
    iconBg: "#ecfdf3",
    statusBadge: "bg-[#ecfdf3] text-[#12b76a]",
    statusIcon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
    )
  },
  {
    title: "Difficulty with homework focus",
    category: "Learning",
    date: "Jun 15, 2025",
    daysAgo: "388 days ago",
    description: "Aiden could not sit for more than 3 minutes on his homework today. He kept getting up to spin or flap. We tried the visual timer strategy from the therapist but it did not help tonight. The homework itself was math — which he usually enjoys.",
    attachments: 0,
    status: "Submitted",
    icon: <MortarboardIcon />,
    iconColor: "#7a5af8",
    iconBg: "#f4f3ff",
    statusBadge: "bg-[#f0f6fe] text-[#7db9fb]",
    statusIcon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
    )
  }
];

const CATEGORIES = [
  { id: "Behavior", label: "Behavior", icon: <LightningIcon />, color: "#f79009", bg: "#fffaeb" },
  { id: "Communication", label: "Communication", icon: <BookIcon />, color: "#3b82f6", bg: "#eff6ff" },
  { id: "Learning", label: "Learning", icon: <MortarboardIcon />, color: "#a855f7", bg: "#faf5ff" },
  { id: "Social Interaction", label: "Social Interaction", icon: <UsersIcon />, color: "#10b981", bg: "#ecfdf5" },
  { id: "Sensory Response", label: "Sensory Response", icon: <PulseIcon />, color: "#ef4444", bg: "#fef2f2" },
  { id: "Emotional Regulation", label: "Emotional Regulation", icon: <BrainIcon />, color: "#6366f1", bg: "#eef2ff" },
  { id: "Daily Living", label: "Daily Living", icon: <HomeIcon />, color: "#14b8a6", bg: "#f0fdfa" },
  { id: "Motor Skills", label: "Motor Skills", icon: <PulseIcon />, color: "#f97316", bg: "#fff7ed" },
];

const RECIPIENTS = [
  { id: "Therapist", label: "Therapist", icon: <UserIcon />, color: "#3b82f6", bg: "#eff6ff" },
  { id: "Psychologist", label: "Psychologist", icon: <BrainIcon />, color: "#a855f7", bg: "#faf5ff" },
  { id: "School", label: "School", icon: <MortarboardIcon />, color: "#0ea5e9", bg: "#f0f9ff" },
];

const getCategoryTheme = (label: string) => {
  const cat = CATEGORIES.find(c => c.label === label);
  return cat ? { icon: cat.icon, iconColor: cat.color, iconBg: cat.bg } : { icon: <LightningIcon />, iconColor: "#f79009", iconBg: "#fffaeb" };
};

const getStatusTheme = (status: string) => {
  switch (status) {
    case "PENDING":
      return { statusBadge: "bg-[#fffaeb] text-[#f79009]", statusIcon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> };
    case "ACTIONED":
      return { statusBadge: "bg-[#ecfdf3] text-[#12b76a]", statusIcon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> };
    case "ACKNOWLEDGED":
      return { statusBadge: "bg-[#f4f3ff] text-[#7a5af8]", statusIcon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> };
    case "VIEWED":
      return { statusBadge: "bg-[#f0f6fe] text-[#7db9fb]", statusIcon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg> };
    default:
      return { statusBadge: "bg-[#f0f6fe] text-[#7db9fb]", statusIcon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><polyline points="20 6 9 17 4 12"/></svg> };
  }
};

// ─── Component ───────────────────────────────────────────────────────────────
export default function HomeObservations() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [childId, setChildId] = useState("");
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [reviewedById, setReviewedById] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All Statuses");
  const [filterCategory, setFilterCategory] = useState("All Categories");
  const [detail, setDetail] = useState<any>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [activeObservationId, setActiveObservationId] = useState<number | null>(null);
  const [existingFiles, setExistingFiles] = useState<any[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [observationToDelete, setObservationToDelete] = useState<number | null>(null);
  
  const queryClient = useQueryClient();

  // API Queries
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

  const children = Array.isArray(childrenData) ? childrenData : childrenData?.data || [];
  const categoriesList = Array.isArray(categoriesData) ? categoriesData : categoriesData?.data || [];
  const users = Array.isArray(usersData) ? usersData : usersData?.data || [];

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

  const createObservationMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await axiosClient.post("/home-observation", payload);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Observation added successfully");
      queryClient.invalidateQueries({ queryKey: ["home-observation"] });
      setIsModalOpen(false);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to add observation");
    }
  });

  const updateObservationMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: any }) => {
      const res = await axiosClient.patch(`/home-observation/${id}`, payload);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Observation updated successfully");
      queryClient.invalidateQueries({ queryKey: ["home-observation"] });
      setIsModalOpen(false);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update observation");
    }
  });

  const deleteObservationMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await axiosClient.delete(`/home-observation/${id}`);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Observation deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["home-observation"] });
      setIsDeleteModalOpen(false);
      setObservationToDelete(null);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to delete observation");
    }
  });

  const { data: homeObservationsData, isLoading: isObservationsLoading } = useQuery({
    queryKey: ["home-observation"],
    queryFn: async () => {
      const res = await axiosClient.get("/home-observation");
      return res.data;
    },
  });

  const { data: allFilesData } = useQuery({
    queryKey: ["files"],
    queryFn: async () => {
      const res = await axiosClient.get("/file");
      return res.data;
    },
  });
  const allFiles = Array.isArray(allFilesData) ? allFilesData : allFilesData?.data || [];

  const rawObservations = Array.isArray(homeObservationsData) ? homeObservationsData : homeObservationsData?.data || [];
  
  const observationsList = rawObservations.map((obs: any) => {
    const categoryName = obs.category?.full_category_name || "Category";
    const theme = getCategoryTheme(categoryName);
    const statusTheme = getStatusTheme(obs.status);
    
    const diffTime = new Date().getTime() - new Date(obs.observation_date).getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    return {
      ...obs,
      title: obs.title,
      category: categoryName,
      date: new Date(obs.observation_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      daysAgo: diffDays <= 0 ? "Today" : `${diffDays} days ago`,
      description: obs.observation,
      attachments: obs.files?.length || 0,
      status: obs.status ? obs.status.charAt(0).toUpperCase() + obs.status.slice(1).toLowerCase() : "Pending",
      icon: theme.icon,
      iconColor: theme.iconColor,
      iconBg: theme.iconBg,
      statusBadge: statusTheme.statusBadge,
      statusIcon: statusTheme.statusIcon,
    };
  });

  const filteredObservations = observationsList.filter((obs: any) => {
    if (filterStatus !== "All Statuses" && obs.status !== filterStatus) return false;
    if (filterCategory !== "All Categories" && obs.category !== filterCategory) return false;
    if (search && !obs.title.toLowerCase().includes(search.toLowerCase()) && !obs.description.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // Reset state when opened
  React.useEffect(() => {
    if (isModalOpen && modalMode === 'create') {
      setStep(1);
      setChildId("");
      setTitle("");
      setDate("");
      setCategory("");
      setDescription("");
      setReviewedById("");
      setUploadedFiles([]);
      setExistingFiles([]);
      setErrors({});
    }
  }, [isModalOpen, modalMode]);

  const openCreateModal = () => {
    setModalMode('create');
    setIsModalOpen(true);
  };

  const openEditModal = (obs: any) => {
    setModalMode('edit');
    setActiveObservationId(obs.id);
    setStep(1);
    
    // Convert observation date to YYYY-MM-DD
    const dateObj = new Date(obs.observation_date);
    const yyyy = dateObj.getFullYear();
    const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
    const dd = String(dateObj.getDate()).padStart(2, '0');

    setChildId(String(obs.child_id || ""));
    setTitle(obs.title || "");
    setDate(`${yyyy}-${mm}-${dd}`);
    setCategory(String(obs.category_id || ""));
    setDescription(obs.observation || "");
    setReviewedById(String(obs.reviewedBy_id || ""));

    setExistingFiles(obs.files || []);

    setUploadedFiles([]);
    setErrors({});
    setIsModalOpen(true);
  };

  const openDeleteModal = (id: number) => {
    setObservationToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleNext = () => {
    const newErrors: Record<string, string> = {};
    if (!childId) newErrors.childId = "Please select a child";
    if (!category) newErrors.category = "Please select a category";
    if (description.length < 20) newErrors.description = "Please provide more detail (at least 20 characters)";
    if (!title.trim()) newErrors.title = "Please provide a title";
    if (!date) newErrors.date = "Please provide a date";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    setStep(2);
  };

  const handleSubmit = async () => {
    if (!reviewedById) {
      setErrors({ reviewedById: "Select a recipient" });
      return;
    }
    
    try {
      let fileIds: number[] = existingFiles ? existingFiles.map((f: any) => f.id) : [];
      if (uploadedFiles.length > 0) {
        const uploadRes = await uploadFilesMutation.mutateAsync(uploadedFiles);
        const filesArray = uploadRes?.files || [];
        const newFileIds = filesArray.map((item: any) => Number(item.file?.id)).filter(Boolean);
        fileIds = [...fileIds, ...newFileIds];
      }

      const userStr = localStorage.getItem('user');
      const userObj = userStr ? JSON.parse(userStr) : null;
      const parentId = userObj?.id ? Number(userObj.id) : 1;

      const payload = {
        child_id: Number(childId),
        parent_id: parentId,
        category_id: Number(category),
        title,
        observation: description,
        observation_date: date,
        status: "PENDING",
        reviewedBy_id: Number(reviewedById),
        reviewedAt: new Date().toISOString(),
        remarks: "",
        fileIds: fileIds
      };
      
      if (modalMode === 'edit' && activeObservationId !== null) {
        await updateObservationMutation.mutateAsync({ id: activeObservationId, payload });
      } else {
        await createObservationMutation.mutateAsync(payload);
      }
    } catch (error) {
      console.error("Error submitting observation", error);
    }
  };

  const imageInputRef = React.useRef<HTMLInputElement>(null);
  const videoInputRef = React.useRef<HTMLInputElement>(null);
  const documentInputRef = React.useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number) => {
    const kb = bytes / 1024;
    return kb > 1024 ? (kb / 1024).toFixed(1) + " MB" : Math.round(kb) + " KB";
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setUploadedFiles(prev => [...prev, ...newFiles]);
    }
    e.target.value = "";
  };

  const removeAttachment = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Custom modal footer to match standard designs and multi-step flow
  const customFooter = (
    <div className="flex items-center justify-between px-8 py-5 border-t border-gray-100 w-full bg-gray-50/50">
      {step === 1 ? (
        <>
          <button type="button" onClick={handleCloseModal} className="px-5 py-2.5 rounded-lg text-gray-700 bg-white border border-gray-200 text-sm font-semibold hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button type="button" onClick={handleNext} className="flex items-center gap-1.5 px-6 py-2.5 rounded-lg text-white bg-[#7db9fb] hover:opacity-90 text-sm font-semibold shadow-sm transition-all active:scale-[0.98]">
            Continue <ChevronRightIcon />
          </button>
        </>
      ) : (
        <>
          <button type="button" onClick={() => setStep(1)} className="px-5 py-2.5 rounded-lg text-gray-700 bg-white border border-gray-200 text-sm font-semibold hover:bg-gray-50 transition-colors">
            ← Back
          </button>
          <button type="button" onClick={handleSubmit} disabled={createObservationMutation.isPending || uploadFilesMutation.isPending} className="px-6 py-2.5 rounded-lg text-white bg-[#7db9fb] hover:opacity-90 text-sm font-semibold shadow-sm transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed">
            {createObservationMutation.isPending || uploadFilesMutation.isPending ? "Submitting..." : "Submit Observation"}
          </button>
        </>
      )}
    </div>
  );

  return (
    <>
      <PageMeta
        title="Home Observations | NeuroCare"
        description="Record and share what you notice at home with your child's care team."
      />

      <div
        className="min-h-screen bg-[#f8fafc] -mx-4 md:-mx-6 -my-4 md:-my-6 p-[32px]"
        style={{ fontFamily: "Outfit, sans-serif" }}
      >
        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-[32px] gap-4">
          <div>
            <h1 className="text-[32px] font-bold text-gray-900 leading-tight">
              Home Observations
            </h1>
            <p className="text-[16px] text-gray-500 mt-1">
              Record and share what you notice at home with your child's care team.
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-[#60a5fa] px-5 py-2.5 rounded-lg text-white text-[15px] font-semibold transition-all duration-150 hover:opacity-90 active:scale-[0.98] shadow-sm"
            // style={{ backgroundColor: "#7db9fb" }}
          >
            <PlusIcon />
            New Observation
          </button>
        </div>

        {/* ── Stat Cards ──────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[24px] mb-[24px]">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgba(15,23,42,0.04)] p-[20px] flex flex-row items-center gap-[16px]">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: stat.bg, color: stat.color }}
              >
                {stat.icon}
              </div>
              <div>
                <div className="text-[24px] font-bold text-gray-900 leading-none mb-1">{stat.value}</div>
                <div className="text-[14px] text-gray-500 font-medium">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── List Section ─────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgba(15,23,42,0.08)]">
          
          {/* Filters */}
          <div className="p-[20px] border-b border-gray-100 flex flex-col sm:flex-row items-center gap-4">
            <div className="relative w-full sm:max-w-xs">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <SearchIcon />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search observations..."
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7db9fb]/20 focus:border-[#7db9fb] text-[14px] transition-colors"
              />
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-auto">
                <select 
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="block w-full sm:w-[140px] pl-3 pr-10 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#7db9fb]/20 focus:border-[#7db9fb] text-[14px] appearance-none cursor-pointer transition-colors"
                >
                  <option value="All Statuses">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Viewed">Viewed</option>
                  <option value="Acknowledged">Acknowledged</option>
                  <option value="Actioned">Actioned</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                  <ChevronDownIcon />
                </div>
              </div>
              <div className="relative w-full sm:w-auto">
                <select 
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="block w-full sm:w-[160px] pl-3 pr-10 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#7db9fb]/20 focus:border-[#7db9fb] text-[14px] appearance-none cursor-pointer transition-colors"
                >
                  <option value="All Categories">All Categories</option>
                  {categoriesList.map((c: any) => <option key={c.id} value={c.full_category_name}>{c.full_category_name}</option>)}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                  <ChevronDownIcon />
                </div>
              </div>
            </div>
          </div>

          {/* List Items */}
          {isObservationsLoading ? (
            <div className="flex flex-col items-center justify-center p-16 text-center gap-4">
              <div className="w-10 h-10 border-4 border-gray-200 border-t-[#7db9fb] rounded-full animate-spin"></div>
              <p className="text-sm text-gray-500 font-medium animate-pulse">Loading observations...</p>
            </div>
          ) : filteredObservations.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-100">
                <HomeIcon />
              </div>
              <div>
                <p className="font-medium text-gray-900">No observations found</p>
                <p className="text-sm text-gray-500 mt-1">Try adjusting your filters or submit a new observation.</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-gray-100">
              {filteredObservations.map((obs, idx) => (
                <div 
                  key={idx} 
                  onClick={() => setDetail(obs)}
                  className="p-[20px] sm:p-[24px] hover:bg-gray-50/50 transition-colors flex gap-[16px] sm:gap-[24px] cursor-pointer group"
                >
                <div 
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0 mt-1"
                  style={{ backgroundColor: obs.iconBg, color: obs.iconColor }}
                >
                  {obs.icon}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-1.5">
                    <div>
                      <h3 className="text-[16px] sm:text-[18px] font-semibold text-gray-900 leading-snug group-hover:text-[#7db9fb] transition-colors">
                        {obs.title}
                      </h3>
                      <div className="flex items-center flex-wrap gap-2 text-[14px] text-gray-500 mt-1">
                        <span className="font-medium text-gray-600">{obs.category}</span>
                        <span>·</span>
                        <span>{obs.date}</span>
                        <span className="hidden sm:inline">·</span>
                        <span className="hidden sm:inline text-gray-400">{obs.daysAgo}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[12px] font-medium ${obs.statusBadge}`}>
                        {obs.statusIcon}
                        {obs.status}
                      </span>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={(e) => { e.stopPropagation(); openEditModal(obs); }}
                          className="p-1.5 text-gray-400 hover:text-[#7db9fb] hover:bg-blue-50 rounded-md transition-colors"
                          title="Edit"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); openDeleteModal(obs.id); }}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                          title="Delete"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                        </button>
                      </div>
                      <div className="text-gray-300 group-hover:text-gray-400 transition-colors hidden sm:block">
                        <ChevronRightIcon />
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-[14px] text-gray-600 mt-3 leading-relaxed">
                    {obs.description}
                  </p>
                  
                  <div className="flex items-center gap-4 mt-4">
                    {obs.attachments > 0 && (
                      <div className="flex items-center gap-1.5 text-[13px] text-gray-500 font-medium">
                        <PaperclipIcon />
                        {obs.attachments} attachment{obs.attachments !== 1 ? 's' : ''}
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      {/* Placeholder for staff interaction icons */}
                      {idx !== 1 && idx !== 4 && (
                        <>
                          <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                            <UserIcon />
                          </div>
                          {idx === 0 || idx === 2 || idx === 3 ? (
                            <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                              <EyeIcon />
                            </div>
                          ) : null}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          )}
          
        </div>
      </div>

      <CustomModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="New Home Observation"
        subtitle={`Step ${step} of 2 — ${step === 1 ? "Observation Details" : "Recipients & Attachments"}`}
        size="md"
        padding="p-0"
        customFooter={customFooter}
      >
        <div className="px-6 py-4 flex-1">
          {/* Progress Bar */}
          <div className="pb-4 flex gap-2 flex-shrink-0">
            <div className={`h-1 flex-1 rounded-full ${step >= 1 ? 'bg-[#7db9fb]' : 'bg-gray-200'}`}></div>
            <div className={`h-1 flex-1 rounded-full ${step >= 2 ? 'bg-[#7db9fb]' : 'bg-gray-200'}`}></div>
          </div>

          {step === 1 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-black mb-1.5">Child <span className="text-red-500">*</span></label>
                <Select
                  key={`childId-${childId}`}
                  placeholder="Select Child"
                  options={children.map((c: any) => ({ value: String(c.id), label: c.full_name }))}
                  defaultValue={childId}
                  onChange={(val) => setChildId(val)}
                />
                {errors.childId && <p className="mt-1 text-[13px] text-red-500">{errors.childId}</p>}
              </div>

              <div>
                <label className="block text-sm font-bold text-black mb-1.5">Observation Title <span className="text-red-500">*</span></label>
                <InputField
                  type="text"
                  placeholder="e.g., Increased aggression during transitions"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                {errors.title && <p className="mt-1 text-[13px] text-red-500">{errors.title}</p>}
              </div>

              <div>
                <label className="block text-sm font-bold text-black mb-1.5">Observation Date <span className="text-red-500">*</span></label>
                <div>
                  <DatePicker
                    id="observation-date"
                    placeholder="Select date"
                    defaultDate={date || undefined}
                    maxDate="today"
                    onChange={(_, currentDateString) =>
                      setDate(currentDateString || "")
                    }
                  />
                  {errors.date && <p className="mt-1 text-[13px] text-red-500">{errors.date}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-black mb-1.5">Category <span className="text-red-500">*</span></label>
                <Select
                  key={`category-${category}`}
                  placeholder="Select Category"
                  options={categoriesList.map((c: any) => ({ value: String(c.id), label: c.full_category_name || `Category ${c.id}` }))}
                  defaultValue={category}
                  onChange={(val) => setCategory(val)}
                />
                {errors.category && <p className="mt-1 text-[13px] text-red-500">{errors.category}</p>}
              </div>

              <div>
                <label className="block text-sm font-bold text-black mb-1.5">Detailed Description <span className="text-red-500">*</span></label>
                <textarea
                  placeholder="Describe what you observed — include context, triggers, duration, and any strategies you tried..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="block w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 focus:outline-none text-sm resize-none text-gray-900 bg-transparent"
                />
                <div className="flex justify-between items-center mt-1.5">
                  {errors.description ? (
                    <p className="text-red-500 text-xs">{errors.description}</p>
                  ) : (
                    <div></div>
                  )}
                  <span className="text-xs text-gray-400 font-medium">{description.length} chars</span>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-[15px] font-semibold text-gray-900 mb-1.5">Send To <span className="text-red-500">*</span></label>
                <Select
                  key={`reviewedById-${reviewedById}`}
                  placeholder="Select Recipient"
                  options={users.map((u: any) => ({ value: String(u.id), label: u.name }))}
                  defaultValue={reviewedById}
                  onChange={(val) => setReviewedById(val)}
                />
                {errors.reviewedById && <p className="mt-1 text-[13px] text-red-500">{errors.reviewedById}</p>}
                <p className="text-[13px] text-gray-500 mt-1.5">This observation will be sent to the selected recipient.</p>
              </div>

              <div>
                <label className="block text-[15px] font-semibold text-gray-900 mb-2">Attachments <span className="font-normal text-gray-500">(optional)</span></label>
                <div className="flex flex-wrap gap-3">
                  <input type="file" ref={imageInputRef} className="hidden" accept="image/*" multiple onChange={handleFileChange} />
                  <input type="file" ref={videoInputRef} className="hidden" accept="video/*" multiple onChange={handleFileChange} />
                  <input type="file" ref={documentInputRef} className="hidden" accept=".pdf,.doc,.docx,.txt" multiple onChange={handleFileChange} />
                  
                  <button type="button" onClick={() => imageInputRef.current?.click()} className="flex items-center gap-2 px-4 py-2 border border-gray-200 border-dashed rounded-lg text-gray-600 text-sm font-medium hover:bg-gray-50 hover:border-gray-300 transition-colors">
                    <ImageIcon /> Image
                  </button>
                  <button type="button" onClick={() => videoInputRef.current?.click()} className="flex items-center gap-2 px-4 py-2 border border-gray-200 border-dashed rounded-lg text-gray-600 text-sm font-medium hover:bg-gray-50 hover:border-gray-300 transition-colors">
                    <VideoIcon /> Video
                  </button>
                  <button type="button" onClick={() => documentInputRef.current?.click()} className="flex items-center gap-2 px-4 py-2 border border-gray-200 border-dashed rounded-lg text-gray-600 text-sm font-medium hover:bg-gray-50 hover:border-gray-300 transition-colors">
                    <FileIcon /> Document
                  </button>
                </div>
                {(existingFiles.length > 0 || uploadedFiles.length > 0) && (
                  <div className="space-y-2 mt-4">
                    {existingFiles.map((file, i) => (
                      <div key={`existing-${i}`} className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-gray-200 bg-white shadow-sm">
                        <div className="w-8 h-8 rounded-md bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-400">
                           <FileIcon />
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col">
                          <a href={file.file_url} target="_blank" rel="noreferrer" className="text-[13px] font-medium text-[#7db9fb] hover:underline truncate">
                            {file.original_file_name || file.file_name || `File ${file.id}`}
                          </a>
                          {file.file_size && <div className="text-[11px] text-gray-500">{formatFileSize(file.file_size)}</div>}
                        </div>
                        <button type="button" onClick={() => setExistingFiles(prev => prev.filter((_, idx) => idx !== i))} className="text-gray-400 hover:text-gray-600 px-2 transition-colors">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </button>
                      </div>
                    ))}
                    {uploadedFiles.map((file, i) => (
                      <div key={`new-${i}`} className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-gray-200 bg-white shadow-sm">
                        <div className="w-8 h-8 rounded-md bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-400">
                           {file.type.startsWith('image') ? <ImageIcon /> : file.type.startsWith('video') ? <VideoIcon /> : <FileIcon />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[13px] font-medium text-gray-900 truncate">{file.name}</div>
                          <div className="text-[11px] text-gray-500">{formatFileSize(file.size)}</div>
                        </div>
                        <button type="button" onClick={() => removeAttachment(i)} className="text-gray-400 hover:text-gray-600 px-2 transition-colors">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-[#f8fafc] rounded-xl p-5 border border-gray-100">
                <h4 className="text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-4">OBSERVATION SUMMARY</h4>
                <div className="space-y-2.5">
                  <div className="grid grid-cols-[100px_1fr] text-sm">
                    <span className="text-gray-500">Title</span>
                    <span className="text-gray-900 font-medium truncate">{title || "—"}</span>
                  </div>
                  <div className="grid grid-cols-[100px_1fr] text-sm">
                    <span className="text-gray-500">Date</span>
                    <span className="text-gray-900 font-medium">{date ? new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "—"}</span>
                  </div>
                  <div className="grid grid-cols-[100px_1fr] text-sm">
                    <span className="text-gray-500">Child</span>
                    <span className="text-gray-900 font-medium">{childId ? children.find((c: any) => String(c.id) === childId)?.full_name || "—" : "—"}</span>
                  </div>
                  <div className="grid grid-cols-[100px_1fr] text-sm">
                    <span className="text-gray-500">Category</span>
                    <span className="text-gray-900 font-medium">{category ? categoriesList.find((c: any) => String(c.id) === category)?.full_category_name || "—" : "—"}</span>
                  </div>
                  <div className="grid grid-cols-[100px_1fr] text-sm">
                    <span className="text-gray-500">Recipient</span>
                    <span className="text-gray-900 font-medium">{reviewedById ? users.find((u: any) => String(u.id) === reviewedById)?.name || "—" : "—"}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CustomModal>

      {/* Detail View Modal */}
      {detail && (
        <CustomModal
          isOpen={!!detail}
          onClose={() => setDetail(null)}
          title={detail.title}
          subtitle={`${detail.category} · ${detail.date}`}
          size="md"
          padding="p-0"
          customFooter={
            <div className="flex items-center justify-end px-8 py-4 border-t border-gray-100 w-full bg-gray-50/50">
              <button 
                type="button" 
                onClick={() => setDetail(null)} 
                className="px-5 py-2 rounded-lg text-gray-700 bg-white border border-gray-200 text-sm font-semibold hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          }
        >
          <div className="px-6 py-5">
            {/* Status + meta */}
            <div className="flex items-center gap-3 flex-wrap mb-5">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-medium ${detail.statusBadge}`}>
                {detail.statusIcon}
                {detail.status}
              </span>
              <span className="text-[12px] text-gray-500">{detail.daysAgo}</span>
            </div>

            {/* Description */}
            <div className="mb-6">
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Observation</p>
              <p className="text-[14px] text-gray-800 leading-relaxed">{detail.description}</p>
            </div>

            {/* Recipients (dynamic) */}
            <div className="mb-6">
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Shared With</p>
              <div className="flex items-center gap-2 flex-wrap">
                {detail.reviewedBy ? (
                   <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 bg-gray-50">
                     <span className="text-gray-500 w-4 h-4"><UserIcon /></span>
                     <span className="text-[12px] font-medium text-gray-700">{detail.reviewedBy.name}</span>
                   </div>
                ) : (
                   <div className="text-[12px] text-gray-500">Not shared yet</div>
                )}
              </div>
            </div>

            {/* Attachments */}
            {detail.attachments > 0 && (
              <div>
                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Attachments</p>
                <div className="space-y-2">
                  {detail.files?.map((file: any, i: number) => (
                    <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-gray-50 border border-gray-100">
                      <div className="w-8 h-8 rounded-md bg-white border border-gray-200 flex items-center justify-center text-gray-400">
                         <FileIcon />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-medium text-gray-900 truncate">
                          {file.original_file_name || file.file_name || `File ${file.id}`}
                        </div>
                        {file.file_size && <div className="text-[11px] text-gray-500">{formatFileSize(file.file_size)}</div>}
                      </div>
                      <a href={file.file_url} target="_blank" rel="noreferrer" className="text-[12px] font-medium text-[#7db9fb] hover:underline px-2">
                        View
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CustomModal>
      )}
      
      {/* Delete Warning Modal */}
      <CustomModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setObservationToDelete(null);
        }}
        title="Delete Observation"
        size="sm"
        padding="p-0"
        customFooter={
          <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50/80 border-t border-gray-100 rounded-b-2xl">
            <button
              type="button"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setObservationToDelete(null);
              }}
              disabled={deleteObservationMutation.isPending}
              className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                if (observationToDelete !== null) {
                  deleteObservationMutation.mutate(observationToDelete);
                }
              }}
              disabled={deleteObservationMutation.isPending}
              className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-red-600 border border-transparent rounded-lg shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all disabled:opacity-70 min-w-[90px]"
            >
              {deleteObservationMutation.isPending ? "Deleting..." : "Delete"}
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
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Are you sure?</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                This action cannot be undone. This will permanently delete the observation and remove its attachments from our servers.
              </p>
            </div>
          </div>
        </div>
      </CustomModal>
    </>
  );
}
