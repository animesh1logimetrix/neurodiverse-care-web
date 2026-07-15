import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import axiosClient from "../../api/axiosClient";
import PageMeta from "../../components/common/PageMeta";
import { CustomModal } from "../../components/ui/modal/CustomModal";
import { PlusIcon, PencilIcon, TrashBinIcon } from "../../icons";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Subcategory {
  id: number;
  name: string;
  icdCode: string;
}

export interface ApiCategory {
  id: number;
  full_category_name: string;
  short_name: string;
  icd_code: string;
  dsm_tr_code: string;
  description: string;
  sub_category: Subcategory[];
}

/** Color theme for each card */
type CardTheme = {
  /** Light tinted card background */
  cardBg: string;
  /** Badge pill styles */
  badge: string;
  /** Accent text color (description + links) */
  text: string;
  /** Bullet dot color */
  dot: string;
  /** Add button background */
  addBtn: string;
};

interface Category {
  id: number;
  name: string; // Short Name / Abbreviation
  fullName?: string;
  icd11Code?: string;
  dsm5trCode?: string;
  description: string;
  theme: CardTheme;
  subcategories: Subcategory[];
}

// ---------------------------------------------------------------------------
// Theme palette — maps a theme name to Tailwind classes
// ---------------------------------------------------------------------------

const THEMES: Record<string, CardTheme> = {
  orange: {
    cardBg: "bg-orange-50",
    badge: "bg-orange-100 text-orange-500 border border-orange-200",
    text: "text-orange-500",
    dot: "bg-orange-400",
    addBtn: "bg-orange-400 hover:bg-orange-500 text-white",
  },
  blue: {
    cardBg: "bg-blue-50",
    badge: "bg-blue-100 text-blue-500 border border-blue-200",
    text: "text-blue-500",
    dot: "bg-blue-400",
    addBtn: "bg-blue-400 hover:bg-blue-500 text-white",
  },
  purple: {
    cardBg: "bg-purple-50",
    badge: "bg-purple-100 text-purple-500 border border-purple-200",
    text: "text-purple-500",
    dot: "bg-purple-400",
    addBtn: "bg-purple-400 hover:bg-purple-500 text-white",
  },
  red: {
    cardBg: "bg-red-50",
    badge: "bg-red-100 text-red-500 border border-red-200",
    text: "text-red-500",
    dot: "bg-red-400",
    addBtn: "bg-red-400 hover:bg-red-500 text-white",
  },
  teal: {
    cardBg: "bg-teal-50",
    badge: "bg-teal-100 text-teal-600 border border-teal-200",
    text: "text-teal-600",
    dot: "bg-teal-400",
    addBtn: "bg-teal-400 hover:bg-teal-500 text-white",
  },
  indigo: {
    cardBg: "bg-indigo-50",
    badge: "bg-indigo-100 text-indigo-500 border border-indigo-200",
    text: "text-indigo-500",
    dot: "bg-indigo-400",
    addBtn: "bg-indigo-400 hover:bg-indigo-500 text-white",
  },
  yellow: {
    cardBg: "bg-yellow-50",
    badge: "bg-yellow-100 text-yellow-600 border border-yellow-200",
    text: "text-yellow-600",
    dot: "bg-yellow-400",
    addBtn: "bg-yellow-400 hover:bg-yellow-500 text-white",
  },
  pink: {
    cardBg: "bg-pink-50",
    badge: "bg-pink-100 text-pink-500 border border-pink-200",
    text: "text-pink-500",
    dot: "bg-pink-400",
    addBtn: "bg-pink-400 hover:bg-pink-500 text-white",
  },
  green: {
    cardBg: "bg-green-50",
    badge: "bg-green-100 text-green-600 border border-green-200",
    text: "text-green-600",
    dot: "bg-green-400",
    addBtn: "bg-green-400 hover:bg-green-500 text-white",
  },
};

const THEME_KEYS = Object.keys(THEMES);

const TOTAL_CHILDREN = 284;

// ---------------------------------------------------------------------------
// Category Card
// ---------------------------------------------------------------------------

interface CategoryCardProps {
  category: Category;
  onEdit: (cat: Category) => void;
  onDelete: (cat: Category) => void;
  onAddSub: (catId: number, name: string, icdCode: string) => void;
  onDeleteSub: (catId: number, subId: number) => void;
}

function CategoryCard({
  category,
  onEdit,
  onDelete,
  onAddSub,
  onDeleteSub,
}: CategoryCardProps) {
  const { theme } = category;
  const [showAddRow, setShowAddRow] = useState(false);
  const [subName, setSubName] = useState("");
  const [subIcd, setSubIcd] = useState("");

  const handleAddSub = () => {
    if (!subName.trim()) return;
    onAddSub(category.id, subName.trim(), subIcd.trim());
    setSubName("");
    setSubIcd("");
    setShowAddRow(false);
  };

  const handleCancelSub = () => {
    setSubName("");
    setSubIcd("");
    setShowAddRow(false);
  };

  return (
    <div
      className="flex flex-col bg-white border border-gray-100 rounded-lg shadow-sm overflow-hidden"
    >
      {/* Lightly tinted header strip */}
      <div className={`relative flex items-center justify-center py-2 px-3.5 ${theme.cardBg}`}>
        {/* Centered category badge */}
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold tracking-wide ${theme.badge}`}
        >
          {category.name}
        </span>
        {/* Top-right action icons */}
        <div className="absolute right-2 top-1.5 flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => onEdit(category)}
            className="p-1 rounded text-blue-500 hover:bg-white/60 transition-all cursor-pointer"
            aria-label={`Edit ${category.name}`}
          >
            <PencilIcon className="size-3.5" />
          </button>
          <button
            onClick={() => onDelete(category)}
            className="p-1 rounded text-red-500 hover:bg-white/60 transition-all cursor-pointer"
            aria-label={`Delete ${category.name}`}
          >
            <TrashBinIcon className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Card body - white background with reduced padding */}
      <div className="flex flex-col flex-1 p-4 gap-3 bg-white">
        {/* Description in accent color with smaller font */}
        <p className={`text-[11px] font-medium leading-relaxed ${theme.text}`}>
          {category.description}
        </p>

        {/* Subcategory list with reduced spacing and font sizes */}
        <ul className="flex flex-col gap-2">
          {category.subcategories.map((sub) => (
            <li key={sub.id} className="flex items-start gap-2 group">
              <span
                className={`mt-1.5 size-1.5 rounded-full shrink-0 ${theme.dot}`}
              />
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold text-gray-800 leading-snug">
                  {sub.name}
                </p>
                <p className="text-[10px] text-gray-400 font-normal mt-0.5">
                  {sub.icdCode}
                </p>
              </div>
              <button
                onClick={() => onDeleteSub(category.id, sub.id)}
                className="opacity-0 group-hover:opacity-100 p-0.5 text-gray-300 hover:text-red-500 transition-all shrink-0 cursor-pointer"
                aria-label="Remove subcategory"
              >
                <svg className="size-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </li>
          ))}
        </ul>

        {/* Compact inline add-subcategory section */}
        {showAddRow ? (
          <div className="flex items-center gap-1.5 pt-2 border-t border-gray-100 flex-nowrap w-full">
            <input
              type="text"
              placeholder="Sub-category name"
              value={subName}
              onChange={(e) => setSubName(e.target.value)}
              className="flex-1 min-w-0 h-7 rounded border border-gray-200 bg-white px-2 text-[10px] text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
            <input
              type="text"
              placeholder="IDC Code"
              value={subIcd}
              onChange={(e) => setSubIcd(e.target.value)}
              className="w-16 h-7 rounded border border-gray-200 bg-white px-2 text-[10px] text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
            <button
              onClick={handleAddSub}
              className={`inline-flex items-center justify-center h-7 px-2.5 rounded text-[10px] font-semibold shrink-0 transition-colors cursor-pointer ${theme.addBtn}`}
            >
              + Add
            </button>
            <button
              onClick={handleCancelSub}
              className="h-7 w-7 flex items-center justify-center rounded text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors shrink-0 cursor-pointer"
            >
              <svg className="size-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowAddRow(true)}
            className={`mt-auto pt-2 border-t border-gray-100 text-[11px] font-semibold hover:opacity-80 text-left transition-opacity cursor-pointer ${theme.text}`}
          >
            + Add Sub-category
          </button>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Add / Edit modal body
// ---------------------------------------------------------------------------

interface CategoryFormProps {
  formId: string;
  fullName: string;
  setFullName: (v: string) => void;
  shortName: string;
  setShortName: (v: string) => void;
  icd11Code: string;
  setIcd11Code: (v: string) => void;
  dsm5trCode: string;
  setDsm5trCode: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  errors: Record<string, string>;
}

function CategoryForm({
  formId,
  fullName,
  setFullName,
  shortName,
  setShortName,
  icd11Code,
  setIcd11Code,
  dsm5trCode,
  setDsm5trCode,
  description,
  setDescription,
  onSubmit,
  errors,
}: CategoryFormProps) {
  const inputCls =
    "h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all";
  const labelCls = "block text-xs font-semibold text-gray-700 mb-1.5";

  return (
    <form id={formId} onSubmit={onSubmit} className="grid grid-cols-3 gap-y-4 gap-x-4">
      {/* Full Category Name */}
      <div className="col-span-3">
        <label className={labelCls}>
          Full Category Name *
        </label>
        <input
          type="text"
          placeholder=""
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className={`${inputCls} ${errors.fullName ? "border-error-500 text-error-700 bg-error-50" : ""}`}
        />
        {errors.fullName && <p className="text-error-500 text-xs mt-1">{errors.fullName}</p>}
      </div>

      {/* Short Name / Abbreviation */}
      <div className="col-span-1">
        <label className={labelCls}>
          Short Name / Abbreviation *
        </label>
        <input
          type="text"
          placeholder=""
          value={shortName}
          onChange={(e) => setShortName(e.target.value)}
          className={`${inputCls} ${errors.shortName ? "border-error-500 text-error-700 bg-error-50" : ""}`}
        />
        {errors.shortName && <p className="text-error-500 text-xs mt-1">{errors.shortName}</p>}
      </div>

      {/* ICD-11 Code */}
      <div className="col-span-1">
        <label className={labelCls}>
          ICD-11 Code *
        </label>
        <input
          type="text"
          placeholder=""
          value={icd11Code}
          onChange={(e) => setIcd11Code(e.target.value)}
          className={`${inputCls} ${errors.icd11Code ? "border-error-500 text-error-700 bg-error-50" : ""}`}
        />
        {errors.icd11Code && <p className="text-error-500 text-xs mt-1">{errors.icd11Code}</p>}
      </div>

      {/* DSM-5-TR Code */}
      <div className="col-span-1">
        <label className={labelCls}>
          DSM-5-TR Code
        </label>
        <input
          type="text"
          placeholder=""
          value={dsm5trCode}
          onChange={(e) => setDsm5trCode(e.target.value)}
          className={inputCls}
        />
      </div>

      {/* Description */}
      <div className="col-span-3">
        <label className={labelCls}>
          Description
        </label>
        <input
          type="text"
          placeholder=""
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={inputCls}
        />
      </div>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function CategoryMaster() {
  const queryClient = useQueryClient();

  const { data: apiCategories, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await axiosClient.get("/category");
      return res.data as ApiCategory[];
    },
  });

  const categories = (apiCategories || []).map((apiCat, index) => {
    const nextThemeKey = THEME_KEYS[index % THEME_KEYS.length];
    
    // Safety check if sub_category is stored as a JSON string
    let parsedSubcategories = [];
    if (typeof apiCat.sub_category === 'string') {
      try {
        parsedSubcategories = JSON.parse(apiCat.sub_category);
      } catch (e) {
        parsedSubcategories = [];
      }
    } else if (Array.isArray(apiCat.sub_category)) {
      parsedSubcategories = apiCat.sub_category;
    } else if (apiCat.sub_category && typeof apiCat.sub_category === 'object') {
      // In case it's an object with keys mapped to values
      parsedSubcategories = Object.values(apiCat.sub_category);
    }
    
    return {
      id: apiCat.id,
      name: apiCat.short_name,
      fullName: apiCat.full_category_name,
      icd11Code: apiCat.icd_code,
      dsm5trCode: apiCat.dsm_tr_code,
      description: apiCat.description,
      theme: THEMES[nextThemeKey],
      subcategories: parsedSubcategories,
    };
  });

  const [searchQuery, setSearchQuery] = useState("");

  // Add
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addFullName, setAddFullName] = useState("");
  const [addShortName, setAddShortName] = useState("");
  const [addIcd11Code, setAddIcd11Code] = useState("");
  const [addDsm5trCode, setAddDsm5trCode] = useState("");
  const [addDesc, setAddDesc] = useState("");
  const [addErrors, setAddErrors] = useState<Record<string, string>>({});

  // Edit
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Category | null>(null);
  const [editFullName, setEditFullName] = useState("");
  const [editShortName, setEditShortName] = useState("");
  const [editIcd11Code, setEditIcd11Code] = useState("");
  const [editDsm5trCode, setEditDsm5trCode] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});

  // Delete
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  // ── API Mutations ─────────────────────────────────────────────────────────

  const createMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await axiosClient.post("/category", payload);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Category created successfully");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setIsAddOpen(false);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to create category");
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: number, payload: any }) => {
      const res = await axiosClient.patch(`/category/${id}`, payload);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Category updated successfully");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setIsEditOpen(false);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update category");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await axiosClient.delete(`/category/${id}`);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Category deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setIsDeleteOpen(false);
      setDeleteTarget(null);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to delete category");
    }
  });

  // ── CRUD Handlers ─────────────────────────────────────────────────────────

  const handleOpenAdd = () => {
    setAddFullName("");
    setAddShortName("");
    setAddIcd11Code("");
    setAddDsm5trCode("");
    setAddDesc("");
    setIsAddOpen(true);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!addFullName.trim()) errors.fullName = "Full Category Name is required";
    if (!addShortName.trim()) errors.shortName = "Short Name is required";
    if (!addIcd11Code.trim()) errors.icd11Code = "ICD-11 Code is required";
    
    if (Object.keys(errors).length > 0) {
      setAddErrors(errors);
      return;
    }
    setAddErrors({});
    
    createMutation.mutate({
      full_category_name: addFullName.trim(),
      short_name: addShortName.trim(),
      icd_code: addIcd11Code.trim(),
      dsm_tr_code: addDsm5trCode.trim(),
      description: addDesc.trim(),
      sub_category: {}
    });
  };

  const handleOpenEdit = (cat: Category) => {
    setEditTarget(cat);
    setEditFullName(cat.fullName ?? "");
    setEditShortName(cat.name);
    setEditIcd11Code(cat.icd11Code ?? "");
    setEditDsm5trCode(cat.dsm5trCode ?? "");
    setEditDesc(cat.description);
    setIsEditOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;

    const errors: Record<string, string> = {};
    if (!editFullName.trim()) errors.fullName = "Full Category Name is required";
    if (!editShortName.trim()) errors.shortName = "Short Name is required";
    if (!editIcd11Code.trim()) errors.icd11Code = "ICD-11 Code is required";
    
    if (Object.keys(errors).length > 0) {
      setEditErrors(errors);
      return;
    }
    setEditErrors({});

    updateMutation.mutate({
      id: editTarget.id,
      payload: {
        full_category_name: editFullName.trim(),
        short_name: editShortName.trim(),
        icd_code: editIcd11Code.trim(),
        dsm_tr_code: editDsm5trCode.trim(),
        description: editDesc.trim(),
        sub_category: { ...editTarget.subcategories }
      }
    });
  };

  const handleOpenDelete = (cat: Category) => {
    setDeleteTarget(cat);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (deleteTarget) {
      deleteMutation.mutate(deleteTarget.id);
    }
  };

  const handleAddSub = (catId: number, name: string, icdCode: string) => {
    const cat = categories.find((c) => c.id === catId);
    if (!cat) return;
    
    // Add the new subcategory
    const newSubcategories = [
      ...cat.subcategories,
      { id: Date.now(), name, icdCode },
    ];
    
    // Save to server
    updateMutation.mutate({
      id: catId,
      payload: {
        full_category_name: cat.fullName || "",
        short_name: cat.name,
        icd_code: cat.icd11Code || "",
        dsm_tr_code: cat.dsm5trCode || "",
        description: cat.description || "",
        sub_category: { ...newSubcategories }
      }
    });
  };

  const handleDeleteSub = (catId: number, subId: number) => {
    const cat = categories.find((c) => c.id === catId);
    if (!cat) return;
    
    // Filter out the deleted subcategory
    const newSubcategories = cat.subcategories.filter((s) => s.id !== subId);
    
    // Save to server
    updateMutation.mutate({
      id: catId,
      payload: {
        full_category_name: cat.fullName || "",
        short_name: cat.name,
        icd_code: cat.icd11Code || "",
        dsm_tr_code: cat.dsm5trCode || "",
        description: cat.description || "",
        sub_category: { ...newSubcategories }
      }
    });
  };

  // ── Search filter ─────────────────────────────────────────────────────────

  const filtered = searchQuery.trim()
    ? categories.filter(
        (c) =>
          (c.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          (c.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          (c.subcategories || []).some((s) =>
            (s?.name || "").toLowerCase().includes(searchQuery.toLowerCase())
          )
      )
    : categories;

  // ── Modal footers ─────────────────────────────────────────────────────────

  const addFooter = (
    <div className="flex justify-center items-center gap-3 px-8 py-5 border-t border-gray-100 w-full">
      <button
        type="button"
        onClick={() => setIsAddOpen(false)}
        className="px-6 py-2.5 rounded-lg bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors text-sm cursor-pointer"
      >
        Cancel
      </button>
      <button
        type="submit"
        form="add-cat-form"
        className="px-6 py-2.5 rounded-lg bg-brand-500 text-white font-semibold hover:bg-brand-600 transition-colors text-sm cursor-pointer"
      >
        Create Category
      </button>
    </div>
  );

  const editFooter = (
    <div className="flex justify-center items-center gap-3 px-8 py-5 border-t border-gray-100 w-full">
      <button
        type="button"
        onClick={() => setIsEditOpen(false)}
        className="px-6 py-2.5 rounded-lg bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors text-sm cursor-pointer"
      >
        Cancel
      </button>
      <button
        type="submit"
        form="edit-cat-form"
        className="px-6 py-2.5 rounded-lg bg-brand-500 text-white font-semibold hover:bg-brand-600 transition-colors text-sm cursor-pointer"
      >
        Save Changes
      </button>
    </div>
  );

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      <PageMeta
        title="Category Master | Masters"
        description="Manage diagnosis categories and subcategories."
      />

      {/* Breadcrumb */}
      <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
        <span className="text-gray-400 dark:text-gray-500">NeuroDiverse</span> &lt;{" "}
        <span className="text-gray-700 dark:text-gray-300 font-medium">Administration</span>
      </div>

      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Category Master
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {categories.length} diagnosis categories · {TOTAL_CHILDREN} children
            across all categories
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-theme-xs hover:bg-brand-600 transition-all duration-200 shrink-0 cursor-pointer"
        >
          <PlusIcon className="size-4 fill-current text-white" />
          Add Category
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <svg
            className="size-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </span>
        <input
          type="text"
          className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 shadow-premium-soft focus:border-brand-500 focus:outline-hidden focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white dark:placeholder:text-gray-500"
          placeholder="Search anything here..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Cards grid */}
      {isLoading ? (
        <div className="py-12 flex flex-col items-center justify-center text-gray-500">
          <svg className="animate-spin h-8 w-8 text-[#60a5fa] mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-sm font-medium">Loading categories...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex items-center justify-center h-40 text-sm text-gray-400">
          No categories match your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {filtered.map((cat) => (
            <CategoryCard
              key={cat.id}
              category={cat}
              onEdit={handleOpenEdit}
              onDelete={handleOpenDelete}
              onAddSub={handleAddSub}
              onDeleteSub={handleDeleteSub}
            />
          ))}
        </div>
      )}

      {/* ── Add Category Modal ───────────────────────────────────────── */}
      <CustomModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add Diagnosis Category"
        size="lg"
        showOverlay
        customFooter={addFooter}
      >
        <CategoryForm
          formId="add-cat-form"
          fullName={addFullName}
          setFullName={setAddFullName}
          shortName={addShortName}
          setShortName={setAddShortName}
          icd11Code={addIcd11Code}
          setIcd11Code={setAddIcd11Code}
          dsm5trCode={addDsm5trCode}
          setDsm5trCode={setAddDsm5trCode}
          description={addDesc}
          setDescription={setAddDesc}
          onSubmit={handleAddSubmit}
          errors={addErrors}
        />
      </CustomModal>

      {/* ── Edit Category Modal ──────────────────────────────────────── */}
      <CustomModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Diagnosis Category"
        size="lg"
        showOverlay
        customFooter={editFooter}
      >
        <CategoryForm
          formId="edit-cat-form"
          fullName={editFullName}
          setFullName={setEditFullName}
          shortName={editShortName}
          setShortName={setEditShortName}
          icd11Code={editIcd11Code}
          setIcd11Code={setEditIcd11Code}
          dsm5trCode={editDsm5trCode}
          setDsm5trCode={setEditDsm5trCode}
          description={editDesc}
          setDescription={setEditDesc}
          onSubmit={handleEditSubmit}
          errors={editErrors}
        />
      </CustomModal>

      {/* ── Delete Confirm Modal ─────────────────────────────────────── */}
      <CustomModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Delete Category"
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
              onClick={handleDeleteConfirm}
              disabled={deleteMutation.isPending}
              className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center min-w-[80px]"
            >
              {deleteMutation.isPending ? (
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
                Are you sure you want to delete this category? This action cannot be undone and will permanently remove this record.
              </p>
            </div>
          </div>
        </div>
      </CustomModal>
    </>
  );
}
