import { useState, useRef } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import axiosClient from "../../api/axiosClient";
import PageMeta from "../../components/common/PageMeta";
import { CustomModal } from "../../components/ui/modal/CustomModal";
import { PlusIcon, PencilIcon, TrashBinIcon, EyeIcon, DownloadIcon } from "../../icons";

// ---------------------------------------------------------------------------
// Types & Interfaces
// ---------------------------------------------------------------------------

interface Resource {
  id: number;
  title: string;
  description: string;
  type: string;
  targetAudience: string;
  tags: string[];
  isBookmarked?: boolean;
  fileName?: string;
  isFeatured?: boolean;
  files?: any[];
}

export interface ApiContent {
  id: number;
  resource_type: string;
  audience: string;
  title: string;
  description: string;
  tags: string;
  is_featured: boolean;
  file?: any[];
}

// ---------------------------------------------------------------------------
// Inline Icons (Fallback for ones not in project library)
// ---------------------------------------------------------------------------

function BookmarkIcon({ className, filled }: { className?: string; filled?: boolean }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function HeartIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function GraduationCapIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
    </svg>
  );
}

function VideoCameraIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M23 7l-7 5 7 5V7z" />
      <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
    </svg>
  );
}

function DocumentIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

function BookOpenIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}

function BookBookmarkIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="5" y="3" width="14" height="18" rx="2" ry="2" />
      <path d="M10 3v6l2-1.5 2 1.5V3" />
    </svg>
  );
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

// Helper to assign tags color classes consistently (matching mockups with black text)
const getTagClass = (tag: string) => {
  const t = tag.toLowerCase();
  if (t === "aba") return "bg-[#fef9c3] text-black";
  if (t === "adhd") return "bg-[#dcfce7] text-black";
  if (t === "foundational") return "bg-[#e0f2fe] text-black";
  if (t === "sensory") return "bg-[#f3e8ff] text-black";
  if (t === "autism") return "bg-[#ffe4e6] text-black";
  if (t === "routine") return "bg-[#ccfbf1] text-black";
  return "bg-gray-100 text-black";
};

// ---------------------------------------------------------------------------
// Resource Card Component
// ---------------------------------------------------------------------------

interface ResourceCardProps {
  resource: Resource;
  onBookmark: (id: number) => void;
  onEdit: (res: Resource) => void;
  onDelete: (id: number) => void;
  onView: (res: Resource) => void;
}

function ResourceCard({ resource, onBookmark, onEdit, onDelete, onView }: ResourceCardProps) {
  // Determine Type Icon
  const getResourceIcon = () => {
    switch (resource.type) {
      case "video":
        return <VideoCameraIcon className="size-6 text-orange-500" />;
      default:
        return <BookOpenIcon className="size-6 text-blue-500" />;
    }
  };

  // Determine Audience Badge colors (Matching mockups background and text)
  const getAudienceStyles = () => {
    if (resource.targetAudience === "Therapist") {
      return "bg-[#e0f2fe] text-[#0284c7]";
    }
    return "bg-[#f3e8ff] text-[#7e22ce]";
  };

  return (
    <div className="flex flex-col bg-white border border-gray-150 rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <div className="flex flex-col flex-1 p-5 gap-3.5 bg-white">
        {/* Header row */}
        <div className="flex items-center justify-between">
          <div className="shrink-0">
            {getResourceIcon()}
          </div>
          <button
            onClick={() => onBookmark(resource.id)}
            className={`p-1 rounded transition-colors cursor-pointer ${resource.isBookmarked ? "text-yellow-500" : "text-gray-800 hover:text-yellow-500"}`}
          >
            <BookmarkIcon className="size-5" filled={resource.isBookmarked} />
          </button>
        </div>

        {/* Audience Pill & Star */}
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className={`inline-flex items-center rounded px-2 py-0.5 text-[10px] font-semibold ${getAudienceStyles()}`}>
            {resource.targetAudience}
          </span>
          {resource.targetAudience === "Parents" && (
            <StarIcon className="size-2.5 text-yellow-500 fill-current ml-0.5" />
          )}
        </div>

        {/* Content Section */}
        <div className="flex flex-col gap-1.5">
          <h3 className="text-xs font-bold text-black leading-snug">
            {resource.title}
          </h3>
          <p className="text-[11px] text-black leading-relaxed line-clamp-3">
            {resource.description}
          </p>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2.5 mt-0.5">
          {resource.tags.map((tag) => (
            <span
              key={tag}
              className={`inline-flex items-center rounded px-2 py-0.5 text-[9px] font-semibold ${getTagClass(tag)}`}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Footer actions block */}
        <div className="flex items-center justify-between pt-3 mt-auto border-t border-gray-100">
          <div className="flex items-center gap-4">
            <button
              onClick={() => onView(resource)}
              title="Preview"
              className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            >
              <EyeIcon className="size-3.5" />
            </button>
            <button
              title="Download"
              className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            >
              <DownloadIcon className="size-3.5" />
            </button>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => onEdit(resource)}
              title="Edit"
              className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            >
              <PencilIcon className="size-3.5" />
            </button>
            <button
              onClick={() => onDelete(resource.id)}
              title="Delete"
              className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
            >
              <TrashBinIcon className="size-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default function ContentCMS() {
  const queryClient = useQueryClient();

  const { data: apiContents, isLoading } = useQuery({
    queryKey: ["contents"],
    queryFn: async () => {
      const res = await axiosClient.get("/content");
      return res.data as ApiContent[];
    },
  });

  const resources: Resource[] = (apiContents || []).map((c) => ({
    id: c.id,
    title: c.title,
    description: c.description,
    type: c.resource_type,
    targetAudience: c.audience,
    tags: c.tags ? c.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
    isBookmarked: c.is_featured,
    fileName: c.file && c.file.length > 0 ? c.file[0].original_file_name || c.file[0].file_name : undefined,
    files: c.file || [],
  }));

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [tagDropdownOpen, setTagDropdownOpen] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | null>(null);
  const [activeResourceIndex, setActiveResourceIndex] = useState<number | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewResource, setViewResource] = useState<Resource | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "DOCUMENT",
    targetAudience: "THERAPIST",
    tagsInput: "",
    isFeatured: false
  });
  
  const updateForm = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setFormErrors(prev => ({ ...prev, [field]: "" }));
  };

  const [existingFiles, setExistingFiles] = useState<any[]>([]);
  const [newTagInput, setNewTagInput] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  // Calculate statistics counts
  const totalCount = resources.length;
  const therapistCount = resources.filter((r) => r.targetAudience === "THERAPIST").length;
  const parentsCount = resources.filter((r) => r.targetAudience === "PARENT").length;
  const savedCount = resources.filter((r) => r.isBookmarked).length;

  // Derive unique tags list
  const allTags = Array.from(new Set(resources.flatMap((r) => r.tags)));

  // Mutations
  const uploadFilesMutation = useMutation({
    mutationFn: async (files: File[]) => {
      const formData = new FormData();
      files.forEach(file => formData.append("files", file));
      formData.append("folder", "uploads");
      const res = await axiosClient.post("/media/uploads", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    },
  });

  const createContentMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await axiosClient.post("/content", payload);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Content created successfully");
      queryClient.invalidateQueries({ queryKey: ["contents"] });
      setIsModalOpen(false);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to create content");
    },
  });

  const updateContentMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: any }) => {
      const res = await axiosClient.patch(`/content/${id}`, payload);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Content updated successfully");
      queryClient.invalidateQueries({ queryKey: ["contents"] });
      setIsModalOpen(false);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update content");
    },
  });

  const deleteContentMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await axiosClient.delete(`/content/${id}`);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Content deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["contents"] });
      setIsDeleteOpen(false);
      setDeleteTarget(null);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to delete content");
    },
  });

  // Handlers
  const handleOpenAdd = () => {
    setModalMode('add');
    setActiveResourceIndex(null);
    setFormData({
      title: "",
      description: "",
      type: "DOCUMENT",
      targetAudience: "THERAPIST",
      tagsInput: "",
      isFeatured: false
    });
    setExistingFiles([]);
    setNewTagInput("");
    setIsFeatured(false);
    setFormErrors({});
    setUploadedFiles([]);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (res: Resource) => {
    const idx = resources.findIndex(r => r.id === res.id);
    setActiveResourceIndex(idx !== -1 ? idx : null);
    setModalMode('edit');
    setFormData({
      title: res.title,
      description: res.description,
      type: res.type,
      targetAudience: res.targetAudience,
      tagsInput: res.tags.join(", "),
      isFeatured: res.isBookmarked || false
    });
    setExistingFiles(res.files || []);
    setNewTagInput("");
    setFormErrors({});
    setUploadedFiles([]);
    setIsModalOpen(true);
  };

  const handleDeleteOpen = (id: number) => {
    setDeleteTarget(id);
    setIsDeleteOpen(true);
  };

  const handleOpenView = (res: Resource) => {
    setViewResource(res);
    setIsViewModalOpen(true);
  };

  const handleBookmarkToggle = (id: number) => {
    const resource = resources.find((r) => r.id === id);
    if (!resource) return;
    
    updateContentMutation.mutate({
      id,
      payload: { is_featured: !resource.isBookmarked },
    });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!formData.title.trim()) errors.title = "Title is required";
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});

    try {
      // Collect IDs of existing files (including newly uploaded ones)
      let finalFileIds: number[] = existingFiles.map((f: any) => f.file?.id || f.id).filter(Boolean);

      if (uploadedFiles.length > 0) {
        const uploadRes = await uploadFilesMutation.mutateAsync(uploadedFiles);
        let filesArray: any[] = [];
        if (Array.isArray(uploadRes)) filesArray = uploadRes;
        else if (uploadRes?.files && Array.isArray(uploadRes.files)) filesArray = uploadRes.files;
        else if (uploadRes?.data && Array.isArray(uploadRes.data)) filesArray = uploadRes.data;
        
        const newFileIds = filesArray.map((item: any) => item.file?.id || item.id).filter(Boolean);
        finalFileIds = [...finalFileIds, ...newFileIds];
      }

      const payload: any = {
        resource_type: formData.type,
        audience: formData.targetAudience,
        title: formData.title.trim(),
        description: formData.description.trim(),
        tags: formData.tagsInput,
        is_featured: formData.isFeatured,
      };

      if (finalFileIds.length > 0) {
        payload.fileIds = finalFileIds;
      }

      if (modalMode === 'edit' && activeResourceIndex !== null) {
        const activeId = resources[activeResourceIndex].id;
        await updateContentMutation.mutateAsync({ id: activeId, payload });
      } else {
        await createContentMutation.mutateAsync(payload);
      }
    } catch (error) {
      console.error("Error saving resource:", error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploadedFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  // Filtered resources
  const filteredResources = resources.filter((res) => {
    const matchesSearch =
      (res.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (res.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (res.tags || []).some((t) => (t || "").toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesTag = selectedTag ? res.tags.includes(selectedTag) : true;

    return matchesSearch && matchesTag;
  });

  // Modal custom footer (centered, matching mockups)
  const modalFooter = (
    <div className="flex justify-center items-center gap-3 px-8 py-5 border-t border-gray-150 w-full bg-white">
      <button
        type="button"
        onClick={() => setIsModalOpen(false)}
        className="px-8 py-2.5 rounded bg-[#d1d5db] text-gray-700 font-semibold hover:bg-gray-300 transition-colors text-sm cursor-pointer"
      >
        Cancel
      </button>
      <button
        type="submit"
        form="upload-resource-form"
        className="px-8 py-2.5 rounded bg-[#60a5fa] text-white font-semibold hover:bg-blue-500 transition-colors text-sm cursor-pointer min-w-[140px]"
      >
        {modalMode === 'edit' ? "Save Changes" : "Upload Resource"}
      </button>
    </div>
  );

  return (
    <>
      <PageMeta
        title="Content & CMS | Masters"
        description="Manage guides, worksheets, videos, and references."
      />

      {/* Breadcrumb */}
      <PageBreadcrumb pageTitle="Content CMS" hideTitle />

      {/* Header section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-black">Content & Resources</h1>
          <p className="text-sm text-black mt-1">
            Guides, worksheets, videos and reference materials for your team and families.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#60a5fa] px-4 py-2.5 text-sm font-semibold text-white shadow-theme-xs hover:bg-blue-500 transition-all duration-200 shrink-0 cursor-pointer"
        >
          <PlusIcon className="size-4 fill-current text-white" />
          Upload Resource
        </button>
      </div>

      {/* Summary Statistics Cards Container */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-premium-soft p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {/* Card 1: Total Resources (Highlighted) */}
          <div className="flex items-start justify-between p-4 h-20 bg-[#eff6ff] border border-blue-100 rounded-lg">
            <div className="flex flex-col justify-between h-full">
              <span className="text-2xl font-bold text-black leading-none">{totalCount}</span>
              <span className="text-[11px] text-black font-medium leading-none">Total Resources</span>
            </div>
            <div className="shrink-0 self-start">
              <BookOpenIcon className="size-6 text-[#1e3a8a] stroke-[1.8]" />
            </div>
          </div>

          {/* Card 2: For Therapists */}
          <div className="flex items-start justify-between p-4 h-20 bg-[#f9fafb] border border-gray-100 rounded-lg">
            <div className="flex flex-col justify-between h-full">
              <span className="text-2xl font-bold text-black leading-none">{therapistCount}</span>
              <span className="text-[11px] text-black font-medium leading-none">For Therapists</span>
            </div>
            <div className="shrink-0 self-start">
              <GraduationCapIcon className="size-6 text-[#4b5563] stroke-[1.8]" />
            </div>
          </div>

          {/* Card 3: For Parents */}
          <div className="flex items-start justify-between p-4 h-20 bg-[#f9fafb] border border-gray-100 rounded-lg">
            <div className="flex flex-col justify-between h-full">
              <span className="text-2xl font-bold text-black leading-none">{parentsCount}</span>
              <span className="text-[11px] text-black font-medium leading-none">For Parents</span>
            </div>
            <div className="shrink-0 self-start">
              <HeartIcon className="size-6 text-[#4b5563] stroke-[1.8]" />
            </div>
          </div>

          {/* Card 4: Saved by You */}
          <div className="flex items-start justify-between p-4 h-20 bg-[#f9fafb] border border-gray-100 rounded-lg">
            <div className="flex flex-col justify-between h-full">
              <span className="text-2xl font-bold text-black leading-none">{savedCount}</span>
              <span className="text-[11px] text-black font-medium leading-none">Saved by You</span>
            </div>
            <div className="shrink-0 self-start">
              <BookBookmarkIcon className="size-6 text-[#4b5563] stroke-[1.8]" />
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg className="size-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 shadow-premium-soft focus:border-brand-500 focus:outline-hidden focus:ring-1 focus:ring-brand-500"
            placeholder="Search anything here....."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Tag Dropdown Filter */}
        <div className="relative shrink-0">
          <button
            onClick={() => setTagDropdownOpen(!tagDropdownOpen)}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-lg border border-gray-200 bg-white text-sm text-gray-700 shadow-premium-soft hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <svg className="size-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span>{selectedTag ? `Tag: ${selectedTag}` : "Filter by Tag"}</span>
          </button>

          {tagDropdownOpen && (
            <div className="absolute right-0 mt-1 w-48 rounded-lg bg-white shadow-lg border border-gray-100 py-1 z-50">
              <button
                onClick={() => {
                  setSelectedTag("");
                  setTagDropdownOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-xs transition-colors hover:bg-gray-50 ${!selectedTag ? "font-bold text-brand-600 bg-brand-50/30" : "text-gray-700"}`}
              >
                Clear Filter
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => {
                    setSelectedTag(tag);
                    setTagDropdownOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-xs transition-colors hover:bg-gray-50 ${selectedTag === tag ? "font-bold text-brand-600 bg-brand-50/30" : "text-gray-700"}`}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Grid listing */}
      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-brand-500 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-sm text-gray-500 font-medium">Loading contents...</span>
          </div>
        </div>
      ) : filteredResources.length === 0 ? (
        <div className="flex items-center justify-center h-48 text-sm text-gray-400">
          No resources match your search or filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredResources.map((res) => (
            <ResourceCard
              key={res.id}
              resource={res}
              onBookmark={handleBookmarkToggle}
              onEdit={handleOpenEdit}
              onDelete={handleDeleteOpen}
              onView={handleOpenView}
            />
          ))}
        </div>
      )}

      {/* ── Add / Edit Upload Resource Modal ────────────────────────────── */}
      <CustomModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === 'edit' ? "Edit Resource" : "Upload Resource"}
        size="lg"
        showOverlay
        customFooter={modalFooter}
      >
        <form id="upload-resource-form" onSubmit={handleFormSubmit} className="flex flex-col gap-4">
          {/* Resource Type & Audience row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1.5">
                Resource Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) => updateForm("type", e.target.value)}
                className={`h-11 w-full rounded-lg border ${formErrors.type ? "border-red-500" : "border-gray-250"} bg-white px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500`}
              >
                <option value="ARTICLE">Article</option>
                <option value="PDF">PDF</option>
                <option value="VIDEO">Video</option>
                <option value="AUDIO">Audio</option>
                <option value="IMAGE">Image</option>
                <option value="DOCUMENT">Document</option>
                <option value="LINK">Link</option>
                <option value="OTHER">Other</option>
              </select>
              {formErrors.type && <p className="mt-1 text-xs text-red-500">{formErrors.type}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1.5">
                Audience*
              </label>
              <select
                value={formData.targetAudience}
                onChange={(e) => updateForm("targetAudience", e.target.value)}
                className={`h-11 w-full rounded-lg border ${formErrors.audience ? "border-red-500" : "border-gray-250"} bg-white px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500`}
              >
                <option value="PARENT">Parent</option>
                <option value="THERAPIST">Therapist</option>
                <option value="DOCTOR">Doctor</option>
                <option value="STAFF">Staff</option>
                <option value="ADMIN">Admin</option>
                <option value="ALL">All</option>
              </select>
              {formErrors.audience && <p className="mt-1 text-xs text-red-500">{formErrors.audience}</p>}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-gray-800 mb-1.5">
              Title*
            </label>
            <input
              type="text"
              placeholder=""
              value={formData.title}
              onChange={(e) => updateForm("title", e.target.value)}
              className={`h-11 w-full rounded-lg border ${formErrors.title ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-gray-250 focus:border-brand-500 focus:ring-brand-500"} bg-white px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-1`}
            />
            {formErrors.title && <p className="mt-1 text-xs text-red-500">{formErrors.title}</p>}
          </div>

          {/* Description (Single line height input, no asterisk) */}
          <div>
            <label className="block text-xs font-bold text-gray-800 mb-1.5">
              Description
            </label>
            <input
              type="text"
              placeholder=""
              value={formData.description}
              onChange={(e) => updateForm("description", e.target.value)}
              className="h-11 w-full rounded-lg border border-gray-250 bg-white px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>

          {/* File Upload / Existing Files */}
          <div>
            <label className="block text-xs font-bold text-gray-800 mb-1.5">
              File Upload
            </label>
            <div className="flex flex-wrap gap-4 mb-4">
              {existingFiles.length > 0 &&
                existingFiles.map((fileRecord: any, idx: number) => {
                  const f = fileRecord.file || fileRecord;
                  return (
                    <div
                      key={idx}
                      onClick={() => f.file_url && window.open(f.file_url, '_blank')}
                      className="w-40 shrink-0 border border-gray-200 rounded-xl p-4 flex flex-col hover:border-brand-500 hover:shadow-sm transition-all bg-white cursor-pointer group relative"
                    >
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setExistingFiles(prev => prev.filter((_, i) => i !== idx));
                        }}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-gray-50 text-gray-400 opacity-0 group-hover:opacity-100 hover:text-red-500 hover:bg-red-50 transition-all cursor-pointer z-10"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                      <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center text-red-500 mb-3">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <p className="text-sm font-semibold text-gray-800 mb-1 truncate" title={f.original_file_name || f.file_name}>
                        {f.original_file_name || f.file_name || "Document"}
                      </p>
                      <p className="text-xs text-gray-500 mb-0.5">
                        {f.createdAt ? new Date(f.createdAt).toLocaleDateString() : ""}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">{f.file_type || "File"}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        {f.file_size ? `${(f.file_size / 1024 / 1024).toFixed(2)} MB` : "Unknown Size"}
                      </p>
                    </div>
                  );
                })}
              {uploadedFiles.length > 0 &&
                uploadedFiles.map((file: File, idx: number) => (
                  <div
                    key={`new-${idx}`}
                    className="w-40 shrink-0 border border-gray-200 rounded-xl p-4 flex flex-col transition-all bg-white relative group"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setUploadedFiles(prev => prev.filter((_, i) => i !== idx));
                      }}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-gray-50 text-gray-400 opacity-0 group-hover:opacity-100 hover:text-red-500 hover:bg-red-50 transition-all cursor-pointer"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500 mb-3">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-sm font-semibold text-gray-800 mb-1 truncate" title={file.name}>
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500 mb-0.5">
                      {new Date().toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">{file.type || "File"}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      {file.size ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : "Unknown Size"}
                    </p>
                  </div>
                ))}
              <label className="w-40 shrink-0 border border-dashed border-gray-300 rounded-xl p-4 flex flex-col items-center justify-center h-40 hover:bg-gray-50 transition-colors text-gray-500 hover:text-gray-700 cursor-pointer relative bg-white">
                {uploadFilesMutation.isPending ? (
                  <div className="flex flex-col items-center justify-center py-4 text-center">
                    <svg className="animate-spin h-6 w-6 text-blue-500 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-xs font-medium text-gray-600">Uploading...</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-4 text-center">
                    <svg className="w-5 h-5 mb-1.5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    <p className="text-xs text-gray-500">
                      <span className="text-blue-500 font-medium hover:underline">Browse</span> files
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Max 50 MB</p>
                  </div>
                )}
                <input 
                  type="file" 
                  multiple 
                  className="hidden" 
                  accept="image/jpeg, image/png, application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document, video/mp4"
                  disabled={uploadFilesMutation.isPending}
                  onChange={handleFileChange} 
                />
              </label>
            </div>
          </div>

          {/* Tags */}
          <div>
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <span className="text-xs font-bold text-gray-800">Tags</span>
              <div className="flex flex-wrap gap-2">
                {Array.from(new Set([
                  ...formData.tagsInput.split(",").map(t => t.trim()).filter(Boolean),
                  ...["ABAA", "SDADHD", "Sensory", "OT", "Speech", "Parenting"]
                ])).map((tag) => {
                  const isSelected = formData.tagsInput.split(",").map(t => t.trim().toLowerCase()).includes(tag.toLowerCase());
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        const currentTags = formData.tagsInput.split(",").map(t => t.trim()).filter(Boolean);
                        if (isSelected) {
                          updateForm("tagsInput", currentTags.filter(t => t.toLowerCase() !== tag.toLowerCase()).join(", "));
                        } else {
                          updateForm("tagsInput", [...currentTags, tag].join(", "));
                        }
                      }}
                      className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-blue-50 text-blue-600 border-blue-200"
                          : "bg-white text-gray-400 border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Add custom tag..."
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                className="h-9 flex-1 rounded-lg border border-gray-200 bg-white px-3 text-xs text-gray-900 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              />
              <button
                type="button"
                onClick={() => {
                  if (newTagInput.trim()) {
                    const currentTags = formData.tagsInput.split(",").map(t => t.trim()).filter(Boolean);
                    if (!currentTags.map(t => t.toLowerCase()).includes(newTagInput.trim().toLowerCase())) {
                      updateForm("tagsInput", [...currentTags, newTagInput.trim()].join(", "));
                    }
                    setNewTagInput("");
                  }
                }}
                className="h-9 px-4 rounded-lg bg-[#d1d5db] text-gray-700 font-semibold hover:bg-gray-300 transition-colors text-xs cursor-pointer"
              >
                Add
              </button>
            </div>
          </div>

          {/* Mark as Featured Toggle Switch */}
          <div className="flex items-center p-3 rounded-lg border border-gray-200 bg-white">
            <button
              type="button"
              onClick={() => updateForm("isFeatured", !formData.isFeatured)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                formData.isFeatured ? "bg-emerald-500" : "bg-gray-200"
              }`}
            >
              <span
                className={`pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  formData.isFeatured ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
            <span className="text-xs text-gray-500 ml-3">
              Mark as Featured (appears in the Featured tab)
            </span>
          </div>
        </form>
      </CustomModal>

      {/* Delete Confirmation Modal */}
      <CustomModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Delete Resource"
        maxWidth="max-w-md"
        customFooter={
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
            <button
              onClick={() => setIsDeleteOpen(false)}
              className="px-4 py-2 text-gray-700 bg-gray-100 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (deleteTarget) {
                  deleteContentMutation.mutate(deleteTarget);
                }
              }}
              disabled={deleteContentMutation.isPending}
              className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center min-w-[80px]"
            >
              {deleteContentMutation.isPending ? (
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
                Are you sure you want to delete this resource? This action cannot be undone and will permanently remove this record.
              </p>
            </div>
          </div>
        </div>
      </CustomModal>

      {/* View Resource Modal */}
      <CustomModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="View Resource"
        maxWidth="max-w-3xl"
        customFooter={
          <div className="flex justify-end px-8 py-5 border-t border-gray-150 bg-gray-50 rounded-b-xl w-full">
            <button
              type="button"
              onClick={() => setIsViewModalOpen(false)}
              className="px-8 py-2.5 rounded bg-white border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors text-sm cursor-pointer shadow-sm"
            >
              Close
            </button>
          </div>
        }
      >
        {viewResource && (
          <div className="flex flex-col gap-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold text-gray-900">{viewResource.title}</h2>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded bg-blue-50 text-blue-600 text-xs font-semibold border border-blue-100 uppercase tracking-wider">
                    {viewResource.type}
                  </span>
                  <span className="px-2.5 py-1 rounded bg-purple-50 text-purple-600 text-xs font-semibold border border-purple-100">
                    {viewResource.targetAudience}
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100 whitespace-pre-wrap">
                {viewResource.description || "No description provided."}
              </p>
            </div>

            {viewResource.tags.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <BookmarkIcon className="size-4 text-brand-500" /> Tags
                </h4>
                <div className="flex flex-wrap gap-2">
                  {viewResource.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200 shadow-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <DocumentIcon className="size-4 text-brand-500" /> Attached Files
              </h4>
              {viewResource.files && viewResource.files.length > 0 ? (
                <div className="flex flex-wrap gap-4">
                  {viewResource.files.map((fileRecord: any, idx: number) => {
                    const f = fileRecord.file || fileRecord;
                    return (
                      <div
                        key={idx}
                        onClick={() => f.file_url && window.open(f.file_url, '_blank')}
                        className="w-40 shrink-0 border border-gray-200 rounded-xl p-4 flex flex-col hover:border-brand-500 hover:shadow-sm transition-all bg-white cursor-pointer group relative"
                      >
                        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500 mb-3">
                          <DocumentIcon className="size-5" />
                        </div>
                        <p className="text-sm font-semibold text-gray-800 mb-1 truncate" title={f.original_file_name || f.file_name}>
                          {f.original_file_name || f.file_name || "Document"}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          {f.file_size ? `${(f.file_size / 1024 / 1024).toFixed(2)} MB` : "Unknown Size"}
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic bg-gray-50 p-4 rounded-xl border border-gray-100 text-center">
                  No files attached to this resource.
                </p>
              )}
            </div>
          </div>
        )}
      </CustomModal>
    </>
  );
}
