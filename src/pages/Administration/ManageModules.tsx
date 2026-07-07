import { useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import { Dropdown } from "../../components/ui/dropdown/Dropdown";
import { DropdownItem } from "../../components/ui/dropdown/DropdownItem";
import { CustomModal } from "../../components/ui/modal/CustomModal";
import { HorizontaLDots, PlusIcon } from "../../icons";

interface Module {
  id: number;
  name: string;
  description: string;
}

const initialModules: Module[] = [
  {
    id: 1,
    name: "Super Admin",
    description: "Full platform access across all organizations and modules",
  },
  {
    id: 2,
    name: "Org Admin",
    description: "Full clinical control within their organization; manages staff and compliance",
  },
  {
    id: 3,
    name: "Therapist / Clinician",
    description: "Manages caseload, conducts sessions, writes notes and reports",
  },
  {
    id: 4,
    name: "Psychologist",
    description: "Conducts psychometric assessments and confirms diagnoses",
  },
  {
    id: 5,
    name: "School Staff",
    description: "Tracks IEP goals for shared students; consent-scoped view only",
  },
];

export default function ManageModules() {
  const [modules, setModules] = useState<Module[]>(initialModules);
  const [searchQuery, setSearchQuery] = useState("");
  const [openMenuModuleId, setOpenMenuModuleId] = useState<number | null>(null);

  // Modals state
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);

  // Form state
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");

  const getModuleColor = (name: string) => {
    if (name.toLowerCase().includes("super admin")) return "text-[#10b981] font-semibold";
    if (name.toLowerCase().includes("org admin")) return "text-[#f59e0b] font-semibold";
    if (name.toLowerCase().includes("therapist") || name.toLowerCase().includes("clinician")) return "text-[#3b82f6] font-semibold";
    if (name.toLowerCase().includes("psychologist")) return "text-[#8b5cf6] font-semibold";
    if (name.toLowerCase().includes("school staff")) return "text-[#ef4444] font-semibold";
    return "text-gray-900 dark:text-white font-semibold";
  };

  const handleOpenAddModal = () => {
    setSelectedModule(null);
    setFormName("");
    setFormDescription("");
    setIsAddEditOpen(true);
  };

  const handleOpenEditModal = (mod: Module) => {
    setSelectedModule(mod);
    setFormName(mod.name);
    setFormDescription(mod.description);
    setIsAddEditOpen(true);
    setOpenMenuModuleId(null);
  };

  const handleOpenDeleteModal = (mod: Module) => {
    setSelectedModule(mod);
    setIsDeleteOpen(true);
    setOpenMenuModuleId(null);
  };

  const handleSaveModule = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedModule) {
      // Edit
      setModules((prev) =>
        prev.map((m) =>
          m.id === selectedModule.id
            ? { ...m, name: formName, description: formDescription }
            : m
        )
      );
    } else {
      // Add
      const newModule: Module = {
        id: Date.now(),
        name: formName,
        description: formDescription,
      };
      setModules((prev) => [...prev, newModule]);
    }
    setIsAddEditOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (selectedModule) {
      setModules((prev) => prev.filter((m) => m.id !== selectedModule.id));
      setIsDeleteOpen(false);
      setSelectedModule(null);
    }
  };

  const filteredModules = modules.filter((m) =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <PageMeta
        title="Manage Modules | Administration"
        description="Administration module management dashboard"
      />

      {/* Custom Figma Header Breadcrumb */}
      <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
        <span className="text-gray-400 dark:text-gray-500">NeuroDiverse</span> &lt;{" "}
        <span className="text-gray-700 dark:text-gray-300 font-medium">Administration</span>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div className="max-w-[70%]">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
            Manage Modules
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            lets administrators assign modules to users based on roles and permissions. Only
            assigned modules appear in the user's sidebar.
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-theme-xs hover:bg-brand-600 focus:outline-hidden transition-all duration-200 shrink-0 cursor-pointer"
        >
          <PlusIcon className="size-4 text-white fill-current" />
          Add Module
        </button>
      </div>

      {/* Search Input Wrapper */}
      <div className="relative mb-6">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <svg
            className="size-5 text-gray-400 dark:text-gray-500"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </span>
        <input
          type="text"
          className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 shadow-premium-soft focus:border-brand-500 focus:outline-hidden focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white dark:placeholder:text-gray-500"
          placeholder="Search anything here....."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Modules Table Card */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-premium-soft dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <Table className="min-w-full divide-y divide-gray-100 dark:divide-gray-800">
            <TableHeader className="bg-gray-50 dark:bg-gray-900/50">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 w-[25%]"
                >
                  Name
                </TableCell>
                <TableCell
                  isHeader
                  className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 w-[60%]"
                >
                  Description
                </TableCell>
                <TableCell
                  isHeader
                  className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 w-[15%]"
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="bg-white divide-y divide-gray-100 dark:bg-transparent dark:divide-gray-800">
              {filteredModules.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                    No modules found matching the query.
                  </TableCell>
                </TableRow>
              ) : (
                filteredModules.map((mod) => (
                  <TableRow key={mod.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.01]">
                    {/* Name */}
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={getModuleColor(mod.name)}>{mod.name}</span>
                    </TableCell>

                    {/* Description */}
                    <TableCell className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      <span className="line-clamp-2">{mod.description}</span>
                    </TableCell>

                    {/* Actions dropdown */}
                    <TableCell className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <div className="relative inline-block text-left">
                        <button
                          onClick={() => setOpenMenuModuleId(openMenuModuleId === mod.id ? null : mod.id)}
                          className="dropdown-toggle p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-all"
                        >
                          <HorizontaLDots className="size-5" />
                        </button>
                        <Dropdown
                          isOpen={openMenuModuleId === mod.id}
                          onClose={() => setOpenMenuModuleId(null)}
                          className="w-36 right-0 mt-1 shadow-theme-md"
                        >
                          <div className="py-1">
                            <DropdownItem onClick={() => handleOpenEditModal(mod)}>
                              Edit Module
                            </DropdownItem>
                            <DropdownItem
                              onClick={() => handleOpenDeleteModal(mod)}
                              className="text-error-600 hover:bg-error-50 dark:hover:bg-error-950/20"
                            >
                              Delete
                            </DropdownItem>
                          </div>
                        </Dropdown>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Add/Edit Module Modal */}
      <CustomModal
        isOpen={isAddEditOpen}
        onClose={() => setIsAddEditOpen(false)}
        title={selectedModule ? "Edit Module Details" : "Add Module"}
        showOverlay
        backdropBlur={false}
        width="max-w-[720px]"
        padding="px-8 py-6"
        showCloseIcon
        customFooter={
          <div className="flex justify-center items-center gap-3 px-8 py-5 border-t border-gray-100 w-full">
            <button
              type="button"
              onClick={() => setIsAddEditOpen(false)}
              className="px-6 py-2.5 rounded-lg bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors text-sm cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="add-edit-module-form"
              className="px-6 py-2.5 rounded-lg bg-brand-500 text-white font-semibold hover:bg-brand-600 transition-colors text-sm cursor-pointer min-w-[120px] flex items-center justify-center"
            >
              Save Module
            </button>
          </div>
        }
      >
        <form id="add-edit-module-form" onSubmit={handleSaveModule} className="grid grid-cols-2 gap-x-6 gap-y-5">
          {/* Module Name */}
          <div className="col-span-2 flex flex-col gap-1.5">
            <label className="block text-xs font-bold text-black">
              Module Name <span className="text-black">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Enter module name"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
            />
          </div>

          {/* Description */}
          <div className="col-span-2 flex flex-col gap-1.5">
            <label className="block text-xs font-bold text-black">
              Description <span className="text-black">*</span>
            </label>
            <textarea
              required
              placeholder="Enter description"
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all resize-none"
            />
          </div>
        </form>
      </CustomModal>

      {/* Delete Confirmation Modal */}
      <CustomModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Delete Module"
        showOverlay
        backdropBlur={false}
        width="max-w-[480px]"
        padding="px-8 py-6"
        showCloseIcon
        customFooter={
          <div className="flex justify-end items-center gap-3 px-8 py-5 border-t border-gray-100 w-full">
            <button
              type="button"
              onClick={() => setIsDeleteOpen(false)}
              className="px-6 py-2.5 rounded-lg bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors text-sm cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDeleteConfirm}
              className="px-6 py-2.5 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors text-sm cursor-pointer"
            >
              Delete
            </button>
          </div>
        }
      >
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          Are you sure you want to delete this module? This action cannot be undone.
        </p>
      </CustomModal>
    </>
  );
}
