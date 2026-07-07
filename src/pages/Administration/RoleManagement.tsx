import { useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
// import Badge from "../../components/ui/badge/Badge";
import { Dropdown } from "../../components/ui/dropdown/Dropdown";
import { DropdownItem } from "../../components/ui/dropdown/DropdownItem";
// import { CustomModal, FieldConfig } from "../../components/ui/modal/CustomModal";
import NotificationDropdown from "../../components/header/NotificationDropdown";
import UserDropdown from "../../components/header/UserDropdown";
// import { PlusIcon, HorizontaLDots, CheckLineIcon, CloseLineIcon } from "../../icons";


interface Role {
  id: number;
  name: string;
  description: string;
  permissions: string[];
  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
}

const initialRoles: Role[] = [
  {
    id: 1,
    name: "Super Admin",
    description: "Full platform access across all organizations and modules",
    permissions: ["Super Admin", "Upload File"],
    create: true,
    read: false,
    update: true,
    delete: true,
  },
  {
    id: 2,
    name: "Org Admin",
    description: "Full clinical control within their organization; manages staff and compliance",
    permissions: ["Super Admin", "Upload File"],
    create: true,
    read: false,
    update: true,
    delete: true,
  },
  {
    id: 3,
    name: "Therapist / Clinician",
    description: "Manages caseload, conducts sessions, writes notes and reports",
    permissions: ["Super Admin", "Upload File"],
    create: true,
    read: true,
    update: true,
    delete: false,
  },
  {
    id: 4,
    name: "Psychologist",
    description: "Conducts psychometric assessments and confirms diagnoses",
    permissions: ["Super Admin", "Upload File"],
    create: true,
    read: false,
    update: true,
    delete: true,
  },
  {
    id: 5,
    name: "School Staff",
    description: "Tracks IEP goals for shared students; consent-scoped view only",
    permissions: ["Super Admin", "Upload File"],
    create: true,
    read: true,
    update: false,
    delete: true,
  },
];

export default function RoleManagement() {
  const [roles, setRoles] = useState<Role[]>(initialRoles);
  const [searchQuery, setSearchQuery] = useState("");
  const [openMenuRoleId, setOpenMenuRoleId] = useState<number | null>(null);

  // Invite/Edit Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  // Custom Form state for redesigned Modal
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formPermissions, setFormPermissions] = useState<string[]>(["Super Admin", "Upload File"]);
  const [formCreate, setFormCreate] = useState(false);
  const [formRead, setFormRead] = useState(false);
  const [formUpdate, setFormUpdate] = useState(false);
  const [formDelete, setFormDelete] = useState(false);

  const [isPermissionsDropdownOpen, setIsPermissionsDropdownOpen] = useState(false);

  const handleOpenAddModal = () => {
    setEditingRole(null);
    setFormName("");
    setFormDescription("");
    setFormPermissions(["Super Admin", "Upload File"]);
    setFormCreate(true);
    setFormRead(false);
    setFormUpdate(true);
    setFormDelete(true);
    setIsModalOpen(true);
    setIsPermissionsDropdownOpen(false);
  };

  const handleOpenEditModal = (role: Role) => {
    setEditingRole(role);
    setFormName(role.name);
    setFormDescription(role.description);
    setFormPermissions(role.permissions);
    setFormCreate(role.create);
    setFormRead(role.read);
    setFormUpdate(role.update);
    setFormDelete(role.delete);
    setIsModalOpen(true);
    setOpenMenuRoleId(null);
    setIsPermissionsDropdownOpen(false);
  };

  const handleDeleteRole = (roleId: number) => {
    setRoles((prevRoles) => prevRoles.filter((r) => r.id !== roleId));
    setOpenMenuRoleId(null);
  };

  const handleAddOrEditSubmit = (formData: Record<string, any>) => {
    if (editingRole) {
      // Edit logic
      setRoles((prevRoles) =>
        prevRoles.map((r) =>
          r.id === editingRole.id
            ? {
                ...r,
                name: formData.name || r.name,
                description: formData.description || r.description,
                permissions: formData.permissions || r.permissions,
                create: formData.create !== undefined ? formData.create : r.create,
                read: formData.read !== undefined ? formData.read : r.read,
                update: formData.update !== undefined ? formData.update : r.update,
                delete: formData.delete !== undefined ? formData.delete : r.delete,
              }
            : r
        )
      );
      setEditingRole(null);
    } else {
      // Add logic
      const newRole: Role = {
        id: Date.now(),
        name: formData.name,
        description: formData.description,
        permissions: formData.permissions || ["Super Admin", "Upload File"], // default static permissions
        create: !!formData.create,
        read: !!formData.read,
        update: !!formData.update,
        delete: !!formData.delete,
      };
      setRoles((prevRoles) => [...prevRoles, newRole]);
    }
    setIsModalOpen(false);
  };

  // Helper to filter roles list
  const filteredRoles = roles.filter((role) => {
    const query = searchQuery.toLowerCase();
    return (
      role.name.toLowerCase().includes(query) ||
      role.description.toLowerCase().includes(query)
    );
  });

  const handleCustomModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAddOrEditSubmit({
      name: formName,
      description: formDescription,
      permissions: formPermissions,
      create: formCreate,
      read: formRead,
      update: formUpdate,
      delete: formDelete,
    });
  };

  // Commented out to resolve unused declaration compilation errors
  /*
  const fieldsConfig: FieldConfig[] = [
    {
      name: "name",
      label: "Role Name",
      type: "text",
      required: true,
      placeholder: "Enter role name",
      colSpan: 2,
    },
    {
      name: "description",
      label: "Description",
      type: "text",
      required: true,
      placeholder: "Enter role description",
      colSpan: 2,
    },
    {
      name: "create",
      label: "Create Permission",
      type: "toggle",
      colSpan: 1,
    },
    {
      name: "read",
      label: "Read Permission",
      type: "toggle",
      colSpan: 1,
    },
    {
      name: "update",
      label: "Update Permission",
      type: "toggle",
      colSpan: 1,
    },
    {
      name: "delete",
      label: "Delete Permission",
      type: "toggle",
      colSpan: 1,
    },
  ];

  const getModalFieldsConfig = () => {
    if (!editingRole) return fieldsConfig;
    return fieldsConfig.map((field) => {
      if (field.name === "name") return { ...field, placeholder: editingRole.name };
      if (field.name === "description") return { ...field, placeholder: editingRole.description };
      return field;
    });
  };
  */


  return (
    <>
      <PageMeta
        title="Role Management | Administration"
        description="Configure client roles, modules and permission controls"
      />

      <div className="space-y-6">
        {/* Header Breadcrumb and Notification/User Area */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            <span className="text-[#98A2B3] dark:text-gray-500">NeuroDiverse</span> &nbsp;&lt;&nbsp;{" "}
            <span className="text-gray-750 dark:text-gray-300 font-medium">Administration</span>
          </div>

          {/* Desktop Only Bell and Profile Dropdowns */}
          <div className="hidden lg:flex items-center gap-4">
            <NotificationDropdown />
            <UserDropdown
              name="Leslie Alexa"
              fullName="Leslie Alexa"
              email="leslie.alexa@neurodiverse.care"
              avatar="/images/user/user-18.jpg"
            />
          </div>
        </div>

        {/* Page Title & Subtitle + Add Role Button */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-[28px] font-bold text-[#101828] dark:text-white">
              Role Management
            </h1>
            <p className="text-sm text-[#475467] dark:text-gray-400 mt-1">
              {roles.length} roles configured · Use "Permissions" to edit module access per role
            </p>
          </div>
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#7DB9FB] px-5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-[#6AA8E7] focus:outline-none transition-all duration-200"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-0.5">
              <path d="M7 1V13M1 7H13" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Add Role
          </button>
        </div>

        {/* Full-width Search Input Bar */}
        <div className="relative w-full">
          <span className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-[#98A2B3]">
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 19L13 13M15 8.5C15 12.0899 12.0899 15 8.5 15C4.91015 15 2 12.0899 2 8.5C2 4.91015 4.91015 2 8.5 2C12.0899 2 15 4.91015 15 8.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <input
            type="text"
            className="w-full rounded-2xl border border-[#E4E7EC] bg-white py-3.5 pl-12 pr-4 text-sm text-gray-900 placeholder-[#98A2B3] focus:border-[#7DB9FB] focus:outline-none focus:ring-4 focus:ring-[#7DB9FB]/10 dark:border-gray-800 dark:bg-gray-950 dark:text-white dark:placeholder-gray-500 shadow-sm"
            placeholder="Search anything here....."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Roles Table Card */}
        <div className="overflow-hidden rounded-2xl border border-[#E4E7EC] bg-white shadow-[0_8px_30px_rgb(0,0,0,0.02)] dark:border-gray-850 dark:bg-white/[0.02]">
          <div className="max-w-full overflow-x-auto">
            <Table className="min-w-full divide-y divide-gray-150 dark:divide-gray-800">
              <TableHeader className="bg-[#F2F4F7] dark:bg-gray-900/50">
                <TableRow>
                  <TableCell
                    isHeader
                    className="px-6 py-4.5 text-left text-xs font-semibold uppercase tracking-wider text-[#475467] dark:text-gray-400"
                  >
                    Role Name
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-6 py-4.5 text-left text-xs font-semibold uppercase tracking-wider text-[#475467] dark:text-gray-400"
                  >
                    Description
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-6 py-4.5 text-left text-xs font-semibold uppercase tracking-wider text-[#475467] dark:text-gray-400"
                  >
                    Permissions
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-4 py-4.5 text-center text-xs font-semibold uppercase tracking-wider text-[#475467] dark:text-gray-400"
                  >
                    Create
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-4 py-4.5 text-center text-xs font-semibold uppercase tracking-wider text-[#475467] dark:text-gray-400"
                  >
                    Read
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-4 py-4.5 text-center text-xs font-semibold uppercase tracking-wider text-[#475467] dark:text-gray-400"
                  >
                    Update
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-4 py-4.5 text-center text-xs font-semibold uppercase tracking-wider text-[#475467] dark:text-gray-400"
                  >
                    Delete
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-6 py-4.5 text-center text-xs font-semibold uppercase tracking-wider text-[#475467] dark:text-gray-400"
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="bg-white divide-y divide-gray-100 dark:bg-transparent dark:divide-gray-800">
                {filteredRoles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="px-6 py-8 text-center text-sm text-[#475467] dark:text-gray-400">
                      No roles found matching the search query.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRoles.map((role) => (
                    <TableRow key={role.id} className="hover:bg-gray-50/40 dark:hover:bg-white/[0.01] transition-colors duration-155">
                      {/* Role Name */}
                      <TableCell className="px-6 py-4.5 whitespace-nowrap text-sm font-semibold text-[#101828] dark:text-white align-middle">
                        {role.name}
                      </TableCell>

                      {/* Description */}
                      <TableCell className="px-6 py-4.5 text-sm text-[#475467] dark:text-gray-400 max-w-xs md:max-w-md leading-relaxed align-middle font-normal">
                        {role.description}
                      </TableCell>

                      {/* Permission Badges */}
                      <TableCell className="px-6 py-4.5 whitespace-nowrap text-sm align-middle">
                        <div className="flex flex-wrap gap-2">
                          {role.permissions.map((perm, idx) => {
                            const isGreen = perm.toLowerCase().includes("admin");
                            return isGreen ? (
                              <span key={idx} className="inline-flex items-center px-3 py-1 rounded-md text-xs font-semibold bg-[#ECFDF3] text-[#027A48] border border-[#D1FADF]/50">
                                {perm}
                              </span>
                            ) : (
                              <span key={idx} className="inline-flex items-center px-3 py-1 rounded-md text-xs font-semibold bg-[#FFFAEB] text-[#B54708] border border-[#FEF0C7]/50">
                                {perm}
                              </span>
                            );
                          })}
                        </div>
                      </TableCell>

                      {/* Create */}
                      <TableCell className="px-4 py-4.5 text-center whitespace-nowrap align-middle">
                        {role.create ? (
                          <span className="inline-flex items-center justify-center w-5 h-5 text-[#12B76A]">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M13.3333 4L6 11.3333L2.66667 8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center w-5 h-5 text-[#F04438]">
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </span>
                        )}
                      </TableCell>

                      {/* Read */}
                      <TableCell className="px-4 py-4.5 text-center whitespace-nowrap align-middle">
                        {role.read ? (
                          <span className="inline-flex items-center justify-center w-5 h-5 text-[#12B76A]">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M13.3333 4L6 11.3333L2.66667 8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center w-5 h-5 text-[#F04438]">
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </span>
                        )}
                      </TableCell>

                      {/* Update */}
                      <TableCell className="px-4 py-4.5 text-center whitespace-nowrap align-middle">
                        {role.update ? (
                          <span className="inline-flex items-center justify-center w-5 h-5 text-[#12B76A]">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M13.3333 4L6 11.3333L2.66667 8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center w-5 h-5 text-[#F04438]">
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </span>
                        )}
                      </TableCell>

                      {/* Delete */}
                      <TableCell className="px-4 py-4.5 text-center whitespace-nowrap align-middle">
                        {role.delete ? (
                          <span className="inline-flex items-center justify-center w-5 h-5 text-[#12B76A]">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M13.3333 4L6 11.3333L2.66667 8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center w-5 h-5 text-[#F04438]">
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </span>
                        )}
                      </TableCell>

                      {/* Dropdown Actions */}
                      <TableCell className="px-6 py-4.5 whitespace-nowrap text-center text-sm align-middle">
                        <div className="relative inline-block text-left">
                          <button
                            onClick={() => setOpenMenuRoleId(openMenuRoleId === role.id ? null : role.id)}
                            className="p-2 text-[#98A2B3] hover:text-[#475467] rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
                          >
                            <svg width="16" height="4" viewBox="0 0 16 4" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M2 2C2 2.55228 1.55228 3 1 3C0.447715 3 0 2.55228 0 2C0 1.44772 0.447715 1 1 1C1.55228 1 2 1.44772 2 2Z" fill="currentColor" />
                              <path d="M9 2C9 2.55228 8.55228 3 8 3C7.44772 3 7 2.55228 7 2C7 1.44772 7.44772 1 8 1C8.55228 1 9 1.44772 9 2Z" fill="currentColor" />
                              <path d="M16 2C16 2.55228 15.5523 3 15 3C14.4477 3 14 2.55228 14 2C14 1.44772 14.4477 1 15 1C15.5523 1 16 1.44772 16 2Z" fill="currentColor" />
                            </svg>
                          </button>
                          <Dropdown
                            isOpen={openMenuRoleId === role.id}
                            onClose={() => setOpenMenuRoleId(null)}
                            className="w-40 right-0 mt-1 shadow-lg border border-[#E4E7EC] dark:border-gray-800 rounded-xl"
                          >
                            <div className="py-1">
                              <DropdownItem onClick={() => handleOpenEditModal(role)}>
                                Edit Permissions
                              </DropdownItem>
                              <DropdownItem
                                onClick={() => handleDeleteRole(role.id)}
                                className="text-error-600 hover:bg-error-50 dark:hover:bg-error-950/20 font-medium"
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

        {/* Tip Information Card */}
        <div className="rounded-2xl border border-[#B9E6FE] bg-[#F0F9FF] p-4.5 dark:border-blue-950/30 dark:bg-blue-950/20">
          <p className="text-xs sm:text-[13px] text-[#026AA2] dark:text-blue-300 font-medium leading-relaxed font-outfit">
            Tip: System roles cannot be deleted, but their permissions can be customized in the Permissions module. Custom roles inherit no permissions by default — configure them after creation.
          </p>
        </div>
      </div>

      {/* Commented out original modal to comply with replacement instructions */}
      {/* 
      <CustomModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingRole ? "Edit Role Permissions" : "Add New Role"}
        submitText={editingRole ? "Save Changes" : "Create Role"}
        fields={getModalFieldsConfig()}
        onSubmit={handleAddOrEditSubmit}
      />
      */}

      {/* Redesigned Custom Add / Edit Role Modal matching Figma */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
          {/* Backdrop (No blur) */}
          <div className="fixed inset-0 bg-transparent transition-opacity" onClick={() => setIsModalOpen(false)}></div>
          
          {/* Modal Card */}
          <div className="relative w-full max-w-[650px] rounded-[12px] bg-white dark:bg-gray-900 shadow-xl border border-gray-100 dark:border-gray-800 overflow-visible z-10">
            <form onSubmit={handleCustomModalSubmit} className="flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between px-8 py-5 border-b border-[#F2F4F7] dark:border-gray-800">
                <h2 className="text-[16px] font-bold text-[#111928] dark:text-white">
                  {editingRole ? "Edit Role Permissions" : "Create New Role"}
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

              {/* Body */}
              <div className="p-8 flex flex-col gap-6 overflow-visible">
                {/* Role Name */}
                <div className="flex flex-col gap-2">
                  <label className="text-[13px] font-bold text-[#111928] dark:text-gray-300">
                    Role Name *
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 rounded-lg border border-[#D1D5DB] dark:border-gray-700 bg-white dark:bg-[#0c111d] text-[14px] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7DB9FB]/50 focus:border-[#7DB9FB] transition-all"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    required
                  />
                </div>

                {/* Description */}
                <div className="flex flex-col gap-2">
                  <label className="text-[13px] font-bold text-[#111928] dark:text-gray-300">
                    Description*
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 rounded-lg border border-[#D1D5DB] dark:border-gray-700 bg-white dark:bg-[#0c111d] text-[14px] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7DB9FB]/50 focus:border-[#7DB9FB] transition-all"
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    required
                  />
                </div>

                {/* Permissions Dropdown */}
                <div className="flex flex-col gap-2 relative">
                  <label className="text-[13px] font-bold text-[#111928] dark:text-gray-300">
                    Permissions*
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsPermissionsDropdownOpen(!isPermissionsDropdownOpen)}
                    className="w-full px-4 py-2.5 rounded-lg border border-[#D1D5DB] dark:border-gray-700 bg-white dark:bg-[#0c111d] text-[14px] text-left text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7DB9FB]/50 focus:border-[#7DB9FB] flex items-center justify-between transition-all"
                  >
                    <span className={formPermissions.length === 0 ? "text-[#6B7280]" : "truncate mr-2 text-gray-900 dark:text-white"}>
                      {formPermissions.length === 0 ? "Select" : formPermissions.join(", ")}
                    </span>
                    <svg className={`size-5 text-[#6B7280] transition-transform duration-200 ${isPermissionsDropdownOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {isPermissionsDropdownOpen && (
                    <>
                      {/* Clicking anywhere else closes dropdown */}
                      <div className="fixed inset-0 z-20" onClick={() => setIsPermissionsDropdownOpen(false)}></div>
                      <div className="absolute top-[calc(100%+4px)] left-0 w-full bg-white dark:bg-gray-950 border border-[#E4E7EC] dark:border-gray-800 rounded-lg shadow-lg p-2 z-30 flex flex-col gap-1">
                        {["Super Admin", "Upload File"].map((perm) => {
                          const isChecked = formPermissions.includes(perm);
                          return (
                            <label
                              key={perm}
                              className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer text-sm text-[#344054] dark:text-gray-300 select-none"
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                className="w-4 h-4 rounded border-[#D1D5DB] text-[#7DB9FB] focus:ring-[#7DB9FB]/30 focus:ring-offset-0"
                                onChange={() => {
                                  if (isChecked) {
                                    setFormPermissions(formPermissions.filter(p => p !== perm));
                                  } else {
                                    setFormPermissions([...formPermissions, perm]);
                                  }
                                }}
                              />
                              {perm}
                            </label>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Footer */}
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
                  className="px-6 py-2.5 rounded-lg bg-[#7DB9FB] hover:bg-[#6AA8E7] text-white font-semibold text-[14px] transition-colors min-w-[120px]"
                >
                  {editingRole ? "Save Changes" : "Create Role"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
