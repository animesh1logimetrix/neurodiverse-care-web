import React, { useState } from 'react';
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import CustomModal from "../../components/ui/modal/CustomModal";
import { Dropdown } from "../../components/ui/dropdown/Dropdown";
import { DropdownItem } from "../../components/ui/dropdown/DropdownItem";
import { PlusIcon, HorizontaLDots } from '../../icons';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosClient from "../../api/axiosClient";
import toast from "react-hot-toast";
import Select from "../../components/form/Select";

// Icons 
const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M12.9 14.32a8 8 0 111.414-1.414l4.387 4.387a1 1 0 01-1.414 1.414l-4.387-4.387zM8 14A6 6 0 108 2a6 6 0 000 12z" clipRule="evenodd" />
  </svg>
);

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);



export default function PermissionMatrix() {
  const queryClient = useQueryClient();
  
  const { data: apiModulesData } = useQuery({
    queryKey: ["module"],
    queryFn: async () => {
      const res = await axiosClient.get("/module");
      return res.data;
    },
  });

  const apiModules = Array.isArray(apiModulesData) ? apiModulesData : apiModulesData?.data || [];
  
  const { data: apiPermissions, isLoading } = useQuery({
    queryKey: ["permission"],
    queryFn: async () => {
      const res = await axiosClient.get("/permission");
      return res.data;
    },
  });

  const permissionsList = (Array.isArray(apiPermissions) ? apiPermissions : apiPermissions?.data || []).map((perm: any) => {
    const actions = perm.action || [];
    const create = actions.includes('create');
    const read = actions.includes('read');
    const update = actions.includes('update');
    const del = actions.includes('delete');
    
    // Extract module IDs whether the backend sends 'moduleIds' array of numbers, 
    // or 'modules' array of objects (from a join).
    let rawModuleIds: any[] = [];
    if (perm.moduleIds && Array.isArray(perm.moduleIds)) {
      rawModuleIds = perm.moduleIds;
    } else if (perm.modules && Array.isArray(perm.modules)) {
      rawModuleIds = perm.modules.map((m: any) => m?.id ?? m); 
    }

    const safeModuleIds = rawModuleIds.map(Number).filter(n => !isNaN(n));

    // Map module IDs to names safely
    const mappedModules = safeModuleIds.map((numId: number) => {
      const mod = apiModules.find((m: any) => Number(m.id) === numId);
      return { name: mod ? (mod.Name || mod.title || mod.name || `Module ${numId}`) : `Module ${numId}`, color: 'green' };
    });

    return {
      id: perm.id,
      title: perm.title,
      description: perm.description,
      modules: mappedModules,
      moduleIds: safeModuleIds,
      create, read, update, delete: del,
      action: actions
    };
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [openMenuPermissionId, setOpenMenuPermissionId] = useState<number | null>(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState<any | null>(null);
  
  // Modal state
  const [selectedModules, setSelectedModules] = useState<number[]>([]);
  const [toggles, setToggles] = useState({ create: true, read: false, update: false, delete: true });

  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const createPermissionMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await axiosClient.post("/permission", payload);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Permission created successfully");
      queryClient.invalidateQueries({ queryKey: ["permission"] });
      setIsModalOpen(false);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to create permission");
    }
  });

  const updatePermissionMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: number, payload: any }) => {
      const res = await axiosClient.patch(`/permission/${id}`, payload);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Permission updated successfully");
      queryClient.invalidateQueries({ queryKey: ["permission"] });
      setIsModalOpen(false);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update permission");
    }
  });

  const deletePermissionMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await axiosClient.delete(`/permission/${id}`);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Permission deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["permission"] });
      setIsDeleteOpen(false);
      setSelectedPermission(null);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to delete permission");
    }
  });

  const handleOpenAddModal = () => {
    setSelectedPermission(null);
    setFormTitle("");
    setFormDescription("");
    setFormErrors({});
    setSelectedModules([]); 
    setToggles({ create: true, read: false, update: false, delete: true });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (perm: any) => {
    setSelectedPermission(perm);
    setFormTitle(perm.title || "");
    setFormDescription(perm.description || "");
    setFormErrors({});
    setSelectedModules((perm.moduleIds || []).map(Number));
    setToggles({ create: perm.create, read: perm.read, update: perm.update, delete: perm.delete });
    setIsModalOpen(true);
    setOpenMenuPermissionId(null);
  };

  const handleOpenDeleteModal = (perm: any) => {
    setSelectedPermission(perm);
    setIsDeleteOpen(true);
    setOpenMenuPermissionId(null);
  };

  const handleDeleteConfirm = () => {
    if (selectedPermission) {
      deletePermissionMutation.mutate(selectedPermission.id);
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formTitle.trim()) {
      errors.formTitle = "Title is required.";
    }
    if (selectedModules.length === 0) {
      errors.modules = "Please select at least one module.";
    }
    return errors;
  };

  const handleSavePermission = (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const actionList: string[] = [];
    if (toggles.create) actionList.push("create");
    if (toggles.read) actionList.push("read");
    if (toggles.update) actionList.push("update");
    if (toggles.delete) actionList.push("delete");

    const payload = {
      title: formTitle.trim(),
      description: formDescription.trim(),
      moduleIds: selectedModules,
      action: actionList
    };

    if (selectedPermission) {
      updatePermissionMutation.mutate({ id: selectedPermission.id, payload });
    } else {
      createPermissionMutation.mutate(payload);
    }
  };

  const handleModuleToggle = (moduleIdStr: string) => {
    const moduleId = Number(moduleIdStr);
    if (selectedModules.includes(moduleId)) {
      setSelectedModules(selectedModules.filter(m => m !== moduleId));
    } else {
      setSelectedModules([...selectedModules, moduleId]);
    }
    setFormErrors((prev) => ({ ...prev, modules: "" }));
  };

  const getModuleChipColor = (index: number) => {
    const colors = [
      'bg-[#ccfbf1] text-[#115e59]', // Teal/Green-ish
      'bg-[#ffedd5] text-[#9a3412]', // Orange-ish
      'bg-[#dbeafe] text-[#1e40af]', // Blue-ish
      'bg-[#f3e8ff] text-[#6b21a8]', // Purple-ish
    ];
    return colors[index % colors.length];
  };

  return (
    <>
      <PageBreadcrumb pageTitle="Permissions" hideTitle />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
            Permission Matrix
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Configure granular module-level permissions per role</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-theme-xs hover:bg-brand-600 focus:outline-hidden transition-all duration-200"
        >
          <PlusIcon className="size-4 text-white fill-current" />
          Add Permission
        </button>
      </div>

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

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-visible mb-8">
        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center text-gray-500">
            <svg className="animate-spin h-8 w-8 text-[#2DA0FF] mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-sm font-medium">Loading permissions...</p>
          </div>
        ) : permissionsList.length === 0 ? (
          <div className="flex items-center justify-center h-48 text-sm text-gray-400">
            No permissions found.
          </div>
        ) : (
          <table className="min-w-full">
            <thead className="bg-[#f3f4f6]">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-[13px] font-semibold text-gray-600">
                  Title
                </th>
                <th scope="col" className="px-6 py-4 text-center text-[13px] font-semibold text-gray-600">
                  Description
                </th>
                <th scope="col" className="px-6 py-4 text-center text-[13px] font-semibold text-gray-600">
                  Modules
                </th>
                <th scope="col" className="px-4 py-4 text-center text-[13px] font-semibold text-gray-600">
                  Create
                </th>
                <th scope="col" className="px-4 py-4 text-center text-[13px] font-semibold text-gray-600">
                  Read
                </th>
                <th scope="col" className="px-4 py-4 text-center text-[13px] font-semibold text-gray-600">
                  Update
                </th>
                <th scope="col" className="px-4 py-4 text-center text-[13px] font-semibold text-gray-600">
                  Delete
                </th>
                <th scope="col" className="px-6 py-4 text-center text-[13px] font-semibold text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {permissionsList.filter((p: any) => p.title.toLowerCase().includes(searchQuery.toLowerCase())).map((permission: any) => (
                <tr key={permission.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-5 whitespace-nowrap align-top">
                    <div className="text-[13px] font-medium text-gray-900 mt-1">{permission.title}</div>
                  </td>
                  <td className="px-6 py-5 align-top">
                    <div className="text-[12px] text-gray-500 whitespace-pre-line text-center leading-snug">
                      {permission.description}
                    </div>
                  </td>
                  <td className="px-6 py-5 align-top text-center">
                    <div className="flex flex-wrap justify-center gap-2 mt-1">
                      {permission.modules.slice(0, 2).map((mod: any, i: number) => (
                        <span 
                          key={i} 
                          className={`inline-flex items-center px-2.5 py-1 rounded-[4px] text-[11px] font-bold ${getModuleChipColor(i)}`}
                        >
                          {mod.name}
                        </span>
                      ))}
                      {permission.modules.length > 2 && (
                        <span 
                          className="inline-flex items-center px-2.5 py-1 rounded-[4px] text-[11px] font-bold bg-gray-100 text-gray-700 cursor-help"
                          title={permission.modules.slice(2).map((m: any) => m.name).join(', ')}
                        >
                          +{permission.modules.length - 2} more
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-5 align-top">
                    <div className="mt-1">{permission.create ? <CheckIcon /> : <XIcon />}</div>
                  </td>
                  <td className="px-4 py-5 align-top">
                    <div className="mt-1">{permission.read ? <CheckIcon /> : <XIcon />}</div>
                  </td>
                  <td className="px-4 py-5 align-top">
                    <div className="mt-1">{permission.update ? <CheckIcon /> : <XIcon />}</div>
                  </td>
                  <td className="px-4 py-5 align-top">
                    <div className="mt-1">{permission.delete ? <CheckIcon /> : <XIcon />}</div>
                  </td>
                  <td className="px-6 py-5 align-top text-center">
                    <div className="relative inline-block text-left mt-1">
                      <button
                        onClick={() => setOpenMenuPermissionId(openMenuPermissionId === permission.id ? null : permission.id)}
                        className="dropdown-toggle p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-all"
                      >
                        <HorizontaLDots className="size-5" />
                      </button>
                      <Dropdown
                        isOpen={openMenuPermissionId === permission.id}
                        onClose={() => setOpenMenuPermissionId(null)}
                        className="w-36 right-0 mt-1 shadow-theme-md"
                      >
                        <div className="py-1">
                          <DropdownItem onClick={() => handleOpenEditModal(permission)}>
                            Edit Permission
                          </DropdownItem>
                          <DropdownItem
                            onClick={() => handleOpenDeleteModal(permission)}
                            className="text-error-600 hover:bg-error-50 dark:hover:bg-error-950/20"
                          >
                            Delete
                          </DropdownItem>
                        </div>
                      </Dropdown>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="bg-[#eaf5ff] border border-blue-100 rounded-xl p-4 text-[13px] text-slate-600 text-center shadow-sm">
        Tip: System roles cannot be deleted, but their permissions can be customized in the Permissions module. Custom roles inherit no permissions by default — configure them after creation.
      </div>

      <CustomModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedPermission ? "Edit Permission" : "Create New Permission"}
        showOverlay
        backdropBlur={false}
        maxWidth="max-w-[750px]"
        padding="px-8 py-6"
        showCloseIcon
        customFooter={
          <div className="flex justify-center items-center gap-3 px-8 py-5 border-t border-gray-100 w-full">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-6 py-2.5 rounded-lg bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors text-sm cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="add-edit-permission-form"
              disabled={createPermissionMutation.isPending || updatePermissionMutation.isPending}
              className="px-6 py-2.5 rounded-lg bg-[#2DA0FF] hover:bg-blue-400 text-sm font-semibold text-white transition-colors cursor-pointer min-w-[120px] flex items-center justify-center disabled:opacity-50"
            >
              {createPermissionMutation.isPending || updatePermissionMutation.isPending ? "Saving..." : (selectedPermission ? "Save Permission" : "Create Permission")}
            </button>
          </div>
        }
      >
        <form id="add-edit-permission-form" onSubmit={handleSavePermission} className="flex flex-col gap-5">
          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <label className="block text-xs font-bold text-black">
              Title <span className="text-black">*</span>
            </label>
            <input
              type="text"
              placeholder="Enter permission title"
              value={formTitle}
              onChange={(e) => {
                setFormTitle(e.target.value);
                setFormErrors((prev) => ({ ...prev, formTitle: "" }));
              }}
              className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
            />
            {formErrors.formTitle && <p className="text-xs text-red-500 mt-0.5">{formErrors.formTitle}</p>}
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="block text-xs font-bold text-black">
              Description
            </label>
            <textarea
              placeholder="Enter description (optional)"
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all resize-none"
            />
          </div>

          <div className="flex items-start gap-4 mt-2">
            <div className="flex flex-col w-48 shrink-0 gap-1.5">
              <label className="block text-xs font-bold text-black">
                Modules <span className="text-black">*</span>
              </label>
              <div className="relative">
                <Select
                  value=""
                  onChange={(val) => handleModuleToggle(val)}
                  placeholder="Select"
                  options={apiModules
                    .filter((m: any) => !selectedModules.includes(Number(m.id)))
                    .map((mod: any) => ({
                      value: String(mod.id),
                      label: mod.Name || mod.title || mod.name || `Module ${mod.id}`
                    }))}
                  className="w-full"
                />
              </div>
              {formErrors.modules && <p className="text-xs text-red-500 mt-0.5">{formErrors.modules}</p>}
            </div>
            
            <div className="flex flex-wrap gap-3 pt-6 w-full">
              {selectedModules.map((modId, idx) => {
                const numId = Number(modId);
                const mod = apiModules.find((m: any) => Number(m.id) === numId);
                if (!mod) return null;
                const modName = mod.Name || mod.title || mod.name || `Module ${mod.id}`;
                return (
                  <span 
                    key={modId} 
                    className={`inline-flex items-center px-3 py-1.5 rounded-[4px] text-xs font-semibold shadow-sm ${getModuleChipColor(idx)}`}
                  >
                    {modName}
                    <button 
                      type="button"
                      onClick={() => handleModuleToggle(String(mod.id))}
                      className="ml-2 text-gray-500 hover:text-red-500 cursor-pointer"
                    >
                      <CloseIcon />
                    </button>
                  </span>
                );
              })}
            </div>
          </div>

          <div className="mt-2">
            <h4 className="text-xs font-bold text-black mb-3">Permission Matrix <span className="text-black">*</span></h4>
            <div className="flex items-center gap-10">
              {Object.entries(toggles).map(([key, value]) => (
                <div key={key} className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-gray-900 capitalize">{key}</span>
                  <button 
                    type="button" 
                    className={`${value ? 'bg-[#4ade80]' : 'bg-gray-300'} relative inline-flex flex-shrink-0 h-[22px] w-[42px] border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none`}
                    onClick={() => setToggles({...toggles, [key]: !value})}
                  >
                    <span className="sr-only">Toggle {key}</span>
                    <span className={`${value ? 'translate-x-[20px]' : 'translate-x-0'} pointer-events-none inline-block h-[18px] w-[18px] rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200`} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </form>
      </CustomModal>

      <CustomModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Delete Permission"
        maxWidth="max-w-md"
        customFooter={
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
            <button
              onClick={() => setIsDeleteOpen(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors text-sm cursor-pointer"
              disabled={deletePermissionMutation.isPending}
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteConfirm}
              className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors text-sm cursor-pointer disabled:opacity-50"
              disabled={deletePermissionMutation.isPending}
            >
              {deletePermissionMutation.isPending ? "Deleting..." : "Delete"}
            </button>
          </div>
        }
      >
        <div className="p-2 -mx-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center shrink-0">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Confirm Deletion</h3>
              <p className="text-sm text-gray-600">
                Are you sure you want to delete this permission role? This action cannot be undone.
              </p>
            </div>
          </div>
        </div>
      </CustomModal>
    </>
  );
}
