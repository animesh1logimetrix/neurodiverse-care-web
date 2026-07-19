import React, { useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import { Dropdown } from "../../components/ui/dropdown/Dropdown";
import { DropdownItem } from "../../components/ui/dropdown/DropdownItem";
import CustomModal from "../../components/ui/modal/CustomModal";
import { PlusIcon } from "../../icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosClient from "../../api/axiosClient";
import toast from "react-hot-toast";

export default function RoleManagement() {
  const queryClient = useQueryClient();

  const { data: apiRolesData, isLoading: rolesLoading } = useQuery({
    queryKey: ["role"],
    queryFn: async () => {
      const res = await axiosClient.get("/role");
      return res.data;
    },
  });

  const { data: apiPermissionsData } = useQuery({
    queryKey: ["permission"],
    queryFn: async () => {
      const res = await axiosClient.get("/permission");
      return res.data;
    },
  });

  const roles = Array.isArray(apiRolesData) ? apiRolesData : (apiRolesData?.roles || apiRolesData?.data || []);
  const permissionsList = Array.isArray(apiPermissionsData) ? apiPermissionsData : apiPermissionsData?.data || [];

  const [searchQuery, setSearchQuery] = useState("");
  const [openMenuRoleId, setOpenMenuRoleId] = useState<number | null>(null);

  // Invite/Edit Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<any | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<any | null>(null);

  // Form state
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<number[]>([]);
  const [isPermissionsDropdownOpen, setIsPermissionsDropdownOpen] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const createRoleMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await axiosClient.post("/role", payload);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Role created successfully");
      queryClient.invalidateQueries({ queryKey: ["role"] });
      setIsModalOpen(false);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to create role");
    }
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: number, payload: any }) => {
      const res = await axiosClient.patch(`/role/${id}`, payload);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Role updated successfully");
      queryClient.invalidateQueries({ queryKey: ["role"] });
      setIsModalOpen(false);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update role");
    }
  });

  const deleteRoleMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await axiosClient.delete(`/role/${id}`);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Role deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["role"] });
      setIsDeleteModalOpen(false);
      setSelectedRole(null);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to delete role");
    }
  });

  const handleOpenAddModal = () => {
    setEditingRole(null);
    setFormName("");
    setFormDescription("");
    setSelectedPermissionIds([]);
    setFormErrors({});
    setIsModalOpen(true);
    setIsPermissionsDropdownOpen(false);
  };

  const handleOpenEditModal = (role: any) => {
    setEditingRole(role);
    setFormName(role.name || "");
    setFormDescription(role.description || "");
    
    // Extract existing permission IDs
    const existingPermIds = (role.permissions || []).map((p: any) => p.id || p);
    setSelectedPermissionIds(existingPermIds);
    setFormErrors({});

    setIsModalOpen(true);
    setOpenMenuRoleId(null);
    setIsPermissionsDropdownOpen(false);
  };

  const handleOpenDeleteModal = (role: any) => {
    setSelectedRole(role);
    setIsDeleteModalOpen(true);
    setOpenMenuRoleId(null);
  };

  const handleDeleteConfirm = () => {
    if (selectedRole) {
      deleteRoleMutation.mutate(selectedRole.id);
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formName.trim()) {
      errors.name = "Role Name is required.";
    }
    if (!formDescription.trim()) {
      errors.description = "Description is required.";
    }
    if (selectedPermissionIds.length === 0) {
      errors.permissions = "Please select at least one permission.";
    }
    return errors;
  };

  const handleCustomModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const payload = {
      name: formName.trim(),
      description: formDescription.trim(),
      permissionIds: selectedPermissionIds,
    };

    if (editingRole) {
      updateRoleMutation.mutate({ id: editingRole.id, payload });
    } else {
      createRoleMutation.mutate(payload);
    }
  };

  const filteredRoles = roles.filter((role: any) => {
    const query = searchQuery.toLowerCase();
    const roleName = role.name || "";
    const roleDesc = role.description || "";
    return roleName.toLowerCase().includes(query) || roleDesc.toLowerCase().includes(query);
  });

  // Calculate if a role has across its permissions the CRUD actions
  const getRoleActions = (rolePermissions: any[]) => {
    const permissions = rolePermissions || [];
    let create = false;
    let read = false;
    let update = false;
    let del = false;

    permissions.forEach((perm: any) => {
      const actions = perm.action || [];
      if (actions.includes("create")) create = true;
      if (actions.includes("read")) read = true;
      if (actions.includes("update")) update = true;
      if (actions.includes("delete")) del = true;
      
      // Also fallback if action array is not present but instead they have booleans (just in case)
      if (perm.create) create = true;
      if (perm.read) read = true;
      if (perm.update) update = true;
      if (perm.delete) del = true;
    });

    return { create, read, update, delete: del };
  };

  const selectedPermissionsModels = selectedPermissionIds.map((id) => 
    permissionsList.find((p: any) => p.id === id)
  ).filter(Boolean);

  return (
    <>
      <PageMeta
        title="Role Management | Administration"
        description="Configure client roles, modules and permission controls"
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div className="max-w-[70%]">
          <h1 className="text-2xl font-semibold text-gray-550 dark:text-white ">
            Role Management
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {roles.length} roles configured · Use "Permissions" to edit module access per role
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-theme-xs hover:bg-brand-600 focus:outline-hidden transition-all duration-200 shrink-0 cursor-pointer"
        >
          <PlusIcon className="size-4 text-white fill-current" />
          Add Role
        </button>
      </div>

      <div className="relative mb-6">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <svg className="size-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
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

      <div className="space-y-6">
        <div className="rounded-2xl border border-gray-200 bg-white shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden">
          {rolesLoading ? (
            <div className="py-12 flex flex-col items-center justify-center text-gray-500">
              <svg className="animate-spin h-8 w-8 text-[#2DA0FF] mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-sm font-medium">Loading roles...</p>
            </div>
          ) : (
            <div className="max-w-full overflow-visible">
              <Table className="min-w-full divide-y divide-gray-100 dark:divide-gray-800">
                <TableHeader className="bg-[#EBEAEA] dark:bg-gray-900/50">
                  <TableRow>
                    <TableCell isHeader className="px-6 py-4.5 text-left text-xs font-medium uppercase tracking-wider text-gray-550 dark:text-gray-400">Role Name</TableCell>
                    <TableCell isHeader className="px-6 py-4.5 text-left text-xs font-medium uppercase tracking-wider text-gray-550 dark:text-gray-400">Description</TableCell>
                    <TableCell isHeader className="px-6 py-4.5 text-left text-xs font-medium uppercase tracking-wider text-gray-550 dark:text-gray-400">Permissions</TableCell>
                    <TableCell isHeader className="px-4 py-4.5 text-center text-xs font-medium uppercase tracking-wider text-gray-550 dark:text-gray-400">Create</TableCell>
                    <TableCell isHeader className="px-4 py-4.5 text-center text-xs font-medium uppercase tracking-wider text-gray-550 dark:text-gray-400">Read</TableCell>
                    <TableCell isHeader className="px-4 py-4.5 text-center text-xs font-medium uppercase tracking-wider text-gray-550 dark:text-gray-400">Update</TableCell>
                    <TableCell isHeader className="px-4 py-4.5 text-center text-xs font-medium uppercase tracking-wider text-gray-550 dark:text-gray-400">Delete</TableCell>
                    <TableCell isHeader className="px-6 py-4.5 text-center text-xs font-medium uppercase tracking-wider text-gray-550 dark:text-gray-400">Actions</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {filteredRoles.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="px-6 py-8 text-center text-sm text-gray-550 dark:text-gray-400">
                        No roles found matching the search query.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRoles.map((role: any) => {
                      const { create, read, update, delete: del } = getRoleActions(role.permissions);
                      return (
                      <TableRow key={role.id} className="hover:bg-gray-50/40 dark:hover:bg-white/[0.01] transition-colors duration-155">
                        <TableCell className="px-6 py-4.5 whitespace-nowrap text-sm font-medium text-gray-550 dark:text-white align-middle">
                          {role.name}
                        </TableCell>
                        <TableCell className="px-6 py-4.5 text-sm text-[#475467] dark:text-gray-400 max-w-xs md:max-w-md leading-relaxed align-middle font-normal">
                          {role.description}
                        </TableCell>
                        <TableCell className="px-6 py-4.5 text-sm align-middle">
                          <div className="flex flex-wrap gap-2">
                            {(role.permissions || []).map((perm: any, idx: number) => {
                              const permName = perm.title || perm.name || `Perm ${perm.id}`;
                              const isGreen = permName.toLowerCase().includes("admin");
                              return (
                                <span key={idx} className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-semibold ${isGreen ? 'bg-[#ECFDF3] text-[#027A48] border border-[#D1FADF]/50' : 'bg-[#FFFAEB] text-[#B54708] border border-[#FEF0C7]/50'}`}>
                                  {permName}
                                </span>
                              );
                            })}
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-4.5 text-center whitespace-nowrap align-middle">
                          {create ? (
                            <span className="inline-flex items-center justify-center w-5 h-5 text-[#12B76A]">
                              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M13.3333 4L6 11.3333L2.66667 8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            </span>
                          ) : (
                            <span className="inline-flex items-center justify-center w-5 h-5 text-[#F04438]">
                              <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="px-4 py-4.5 text-center whitespace-nowrap align-middle">
                          {read ? (
                            <span className="inline-flex items-center justify-center w-5 h-5 text-[#12B76A]">
                              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M13.3333 4L6 11.3333L2.66667 8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            </span>
                          ) : (
                            <span className="inline-flex items-center justify-center w-5 h-5 text-[#F04438]">
                              <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="px-4 py-4.5 text-center whitespace-nowrap align-middle">
                          {update ? (
                            <span className="inline-flex items-center justify-center w-5 h-5 text-[#12B76A]">
                              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M13.3333 4L6 11.3333L2.66667 8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            </span>
                          ) : (
                            <span className="inline-flex items-center justify-center w-5 h-5 text-[#F04438]">
                              <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="px-4 py-4.5 text-center whitespace-nowrap align-middle">
                          {del ? (
                            <span className="inline-flex items-center justify-center w-5 h-5 text-[#12B76A]">
                              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M13.3333 4L6 11.3333L2.66667 8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            </span>
                          ) : (
                            <span className="inline-flex items-center justify-center w-5 h-5 text-[#F04438]">
                              <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="px-6 py-4.5 whitespace-nowrap text-center text-sm align-middle">
                          <div className="relative inline-block text-left">
                            <button
                              onClick={() => setOpenMenuRoleId(openMenuRoleId === role.id ? null : role.id)}
                              className="p-2 text-[#98A2B3] hover:text-[#475467] rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
                            >
                              <svg width="16" height="4" viewBox="0 0 16 4" fill="none"><path d="M2 2C2 2.55228 1.55228 3 1 3C0.447715 3 0 2.55228 0 2C0 1.44772 0.447715 1 1 1C1.55228 1 2 1.44772 2 2Z" fill="currentColor" /><path d="M9 2C9 2.55228 8.55228 3 8 3C7.44772 3 7 2.55228 7 2C7 1.44772 7.44772 1 8 1C8.55228 1 9 1.44772 9 2Z" fill="currentColor" /><path d="M16 2C16 2.55228 15.5523 3 15 3C14.4477 3 14 2.55228 14 2C14 1.44772 14.4477 1 15 1C15.5523 1 16 1.44772 16 2Z" fill="currentColor" /></svg>
                            </button>
                            <Dropdown
                              isOpen={openMenuRoleId === role.id}
                              onClose={() => setOpenMenuRoleId(null)}
                              className="w-40 right-0 mt-1 shadow-lg border border-[#E4E7EC] dark:border-gray-800 rounded-xl"
                            >
                              <div className="py-1">
                                <DropdownItem onClick={() => handleOpenEditModal(role)}>
                                  Edit Role
                                </DropdownItem>
                                <DropdownItem
                                  onClick={() => handleOpenDeleteModal(role)}
                                  className="text-error-600 hover:bg-error-50 dark:hover:bg-error-950/20 font-medium"
                                >
                                  Delete
                                </DropdownItem>
                              </div>
                            </Dropdown>
                          </div>
                        </TableCell>
                      </TableRow>
                    )})
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-[#B9E6FE] bg-[#F0F9FF] p-4.5 dark:border-blue-950/30 dark:bg-blue-950/20">
          <p className="text-xs sm:text-[13px] text-[#026AA2] dark:text-blue-300 font-medium leading-relaxed font-outfit">
            Tip: System roles cannot be deleted, but their permissions can be customized in the Permissions module. Custom roles inherit no permissions by default — configure them after creation.
          </p>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-transparent transition-opacity" onClick={() => setIsModalOpen(false)}></div>
          
          <div className="relative w-full max-w-[650px] rounded-[12px] bg-white dark:bg-gray-900 shadow-xl border border-gray-100 dark:border-gray-800 overflow-visible z-10">
            <form onSubmit={handleCustomModalSubmit} className="flex flex-col">
              <div className="flex items-center justify-between px-8 py-5 border-b border-[#F2F4F7] dark:border-gray-800">
                <h2 className="text-[16px] font-bold text-[#111928] dark:text-white">
                  {editingRole ? "Edit Role" : "Create New Role"}
                </h2>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="text-[#6B7280] hover:text-[#374151] dark:hover:text-gray-300 transition-colors"
                  aria-label="Close"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>

              <div className="p-8 flex flex-col gap-6 overflow-visible">
                <div className="flex flex-col gap-2">
                  <label className="text-[13px] font-bold text-[#111928] dark:text-gray-300">
                    Role Name *
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 rounded-lg border border-[#D1D5DB] dark:border-gray-700 bg-white dark:bg-[#0c111d] text-[14px] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2DA0FF]/50 focus:border-[#2DA0FF] transition-all"
                    value={formName}
                    onChange={(e) => {
                      setFormName(e.target.value);
                      setFormErrors((prev) => ({ ...prev, name: "" }));
                    }}
                  />
                  {formErrors.name && <p className="text-xs text-red-500">{formErrors.name}</p>}
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[13px] font-bold text-[#111928] dark:text-gray-300">
                    Description *
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 rounded-lg border border-[#D1D5DB] dark:border-gray-700 bg-white dark:bg-[#0c111d] text-[14px] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2DA0FF]/50 focus:border-[#2DA0FF] transition-all"
                    value={formDescription}
                    onChange={(e) => {
                      setFormDescription(e.target.value);
                      setFormErrors((prev) => ({ ...prev, description: "" }));
                    }}
                  />
                  {formErrors.description && <p className="text-xs text-red-500">{formErrors.description}</p>}
                </div>

                <div className="flex flex-col gap-2 relative">
                  <label className="text-[13px] font-bold text-[#111928] dark:text-gray-300">
                    Permissions *
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsPermissionsDropdownOpen(!isPermissionsDropdownOpen)}
                    className="w-full px-4 py-2.5 rounded-lg border border-[#D1D5DB] dark:border-gray-700 bg-white dark:bg-[#0c111d] text-[14px] text-left text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2DA0FF]/50 focus:border-[#2DA0FF] flex items-center justify-between transition-all"
                  >
                    <span className={selectedPermissionsModels.length === 0 ? "text-[#6B7280]" : "truncate mr-2 text-gray-900 dark:text-white"}>
                      {selectedPermissionsModels.length === 0 ? "Select" : selectedPermissionsModels.map(p => p.title || p.name).join(", ")}
                    </span>
                    <svg className={`size-5 text-[#6B7280] transition-transform duration-200 ${isPermissionsDropdownOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {formErrors.permissions && <p className="text-xs text-red-500">{formErrors.permissions}</p>}
                  
                  {isPermissionsDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-20" onClick={() => setIsPermissionsDropdownOpen(false)}></div>
                      <div className="absolute top-[calc(100%+4px)] left-0 w-full max-h-60 overflow-y-auto bg-white dark:bg-gray-950 border border-[#E4E7EC] dark:border-gray-800 rounded-lg shadow-lg p-2 z-30 flex flex-col gap-1">
                        {permissionsList.length > 0 ? (
                          permissionsList.map((perm: any) => {
                            const isChecked = selectedPermissionIds.includes(perm.id);
                            const permTitle = perm.title || perm.name || `Permission ${perm.id}`;
                            return (
                              <label
                                key={perm.id}
                                className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer text-sm text-[#344054] dark:text-gray-300 select-none"
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  className="w-4 h-4 rounded border-[#D1D5DB] text-[#2DA0FF] focus:ring-[#2DA0FF]/30 focus:ring-offset-0"
                                  onChange={() => {
                                    if (isChecked) {
                                      setSelectedPermissionIds(selectedPermissionIds.filter(id => id !== perm.id));
                                    } else {
                                      setSelectedPermissionIds([...selectedPermissionIds, perm.id]);
                                    }
                                    setFormErrors((prev) => ({ ...prev, permissions: "" }));
                                  }}
                                />
                                {permTitle}
                              </label>
                            );
                          })
                        ) : (
                          <div className="px-3 py-2 text-sm text-gray-500">No permissions found</div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="border-t border-[#F2F4F7] dark:border-gray-800 px-8 py-6 flex items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2.5 rounded-lg bg-[#E5E7EB] hover:bg-[#D1D5DB] text-[#4B5563] font-semibold text-[14px] transition-colors min-w-[120px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createRoleMutation.isPending || updateRoleMutation.isPending}
                  className="px-6 py-2.5 rounded-lg bg-[#2DA0FF] hover:bg-[#6AA8E7] text-white font-semibold text-[14px] transition-colors min-w-[120px] disabled:opacity-50"
                >
                  {createRoleMutation.isPending || updateRoleMutation.isPending ? "Saving..." : (editingRole ? "Save Changes" : "Create Role")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <CustomModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedRole(null);
        }}
        title="Delete Role"
        showOverlay
        maxWidth="max-w-[480px]"
        padding="px-8 py-6"
        showCloseIcon
        customFooter={
          <div className="flex justify-end items-center gap-3 px-8 py-5 border-t border-gray-100 w-full">
            <button
              type="button"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setSelectedRole(null);
              }}
              className="px-6 py-2.5 rounded-lg bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors text-sm cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDeleteConfirm}
              disabled={deleteRoleMutation.isPending}
              className="px-6 py-2.5 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors text-sm cursor-pointer disabled:opacity-50"
            >
              {deleteRoleMutation.isPending ? "Deleting..." : "Delete"}
            </button>
          </div>
        }
      >
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          Are you sure you want to delete this role? This action cannot be undone.
        </p>
      </CustomModal>
    </>
  );
}
