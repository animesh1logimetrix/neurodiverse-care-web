import { useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import Badge from "../../components/ui/badge/Badge";
import { Dropdown } from "../../components/ui/dropdown/Dropdown";
import { DropdownItem } from "../../components/ui/dropdown/DropdownItem";
import { CustomModal, FieldConfig } from "../../components/ui/modal/CustomModal";
import { HorizontaLDots, PlusIcon } from "../../icons";

interface User {
  id: number;
  name: string;
  email: string;
  role: string; // "Super Admin" | "Clinic Admin" | "Therapist" | "Psychologist" | "School Staff" | "Parent"
  status: "Active" | "Pending" | "Inactive";
  lastActive: string;
  createdAt: string;
  image?: string;
}

const initialUsers: User[] = [
  {
    id: 1,
    name: "Vikram Nair",
    email: "vikram@neurotrack.in",
    role: "Super Admin",
    status: "Active",
    lastActive: "2 hours ago",
    createdAt: "2023-03-12",
    image: "/images/user/user-17.jpg",
  },
  {
    id: 2,
    name: "Dr. Ananya Mehta",
    email: "ananya@brightminds.com",
    role: "Clinic Admin",
    status: "Inactive",
    lastActive: "1 hours ago",
    createdAt: "2023-03-12",
    image: "/images/user/user-18.jpg",
  },
  {
    id: 3,
    name: "Rajeev Pillai",
    email: "rajeev@hopewell.com",
    role: "Therapist",
    status: "Active",
    lastActive: "6 hours ago",
    createdAt: "2023-03-12",
    image: "/images/user/user-20.jpg",
  },
  {
    id: 4,
    name: "Dr. Ananya Mehta",
    email: "ananya@brightminds.com",
    role: "Psychologist",
    status: "Pending",
    lastActive: "Never",
    createdAt: "2023-03-12",
    image: "/images/user/user-21.jpg",
  },
  {
    id: 5,
    name: "Dr. Ananya Mehta",
    email: "ananya@brightminds.com",
    role: "School Staff",
    status: "Active",
    lastActive: "9 hours ago",
    createdAt: "2023-03-12",
    image: "/images/user/user-22.jpg",
  },
  {
    id: 6,
    name: "Sunita Sharma",
    email: "sunita@gmail.com",
    role: "Parent",
    status: "Active",
    lastActive: "1 day ago",
    createdAt: "2023-04-10",
  },
  {
    id: 7,
    name: "Rajesh Patel",
    email: "rajesh@yahoo.com",
    role: "Parent",
    status: "Active",
    lastActive: "3 days ago",
    createdAt: "2023-04-12",
  },
  {
    id: 8,
    name: "Amit Verma",
    email: "amit@hotmail.com",
    role: "Parent",
    status: "Inactive",
    lastActive: "5 days ago",
    createdAt: "2023-04-15",
  },
  {
    id: 9,
    name: "Priya Rao",
    email: "priya@gmail.com",
    role: "Parent",
    status: "Active",
    lastActive: "12 hours ago",
    createdAt: "2023-04-18",
  },
  {
    id: 10,
    name: "Rohan Deshmukh",
    email: "rohan@gmail.com",
    role: "Parent",
    status: "Active",
    lastActive: "4 days ago",
    createdAt: "2023-04-20",
  },
  {
    id: 11,
    name: "Kavita Joshi",
    email: "kavita@outlook.com",
    role: "Parent",
    status: "Active",
    lastActive: "1 week ago",
    createdAt: "2023-04-22",
  },
  {
    id: 12,
    name: "Sanjay Nair",
    email: "sanjay@nair.com",
    role: "Parent",
    status: "Active",
    lastActive: "2 days ago",
    createdAt: "2023-04-25",
  },
  {
    id: 13,
    name: "Neha Gupta",
    email: "neha@gupta.com",
    role: "Parent",
    status: "Active",
    lastActive: "3 hours ago",
    createdAt: "2023-04-28",
  },
  {
    id: 14,
    name: "Anil Mehta",
    email: "anil@mehta.org",
    role: "Parent",
    status: "Active",
    lastActive: "10 hours ago",
    createdAt: "2023-05-01",
  },
  {
    id: 15,
    name: "Divya Teja",
    email: "divya@teja.in",
    role: "Parent",
    status: "Active",
    lastActive: "5 mins ago",
    createdAt: "2023-05-05",
  },
];

export default function StaffParents() {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [openMenuUserId, setOpenMenuUserId] = useState<number | null>(null);

  // Invite/Edit Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Count variables for subtitle
  const totalUsers = users.length;
  const pendingInvitations = users.filter((u) => u.status === "Pending").length;

  const handleInviteOrEditSubmit = (formData: Record<string, any>) => {
    if (editingUser) {
      // Edit logic
      setUsers((prevUsers) =>
        prevUsers.map((u) =>
          u.id === editingUser.id
            ? {
                ...u,
                name: formData.name || u.name,
                email: formData.email || u.email,
                role: formData.role || u.role,
                status: formData.status || u.status,
              }
            : u
        )
      );
      setEditingUser(null);
    } else {
      // Add/Invite logic
      const newUser: User = {
        id: Date.now(),
        name: formData.name,
        email: formData.email,
        role: formData.role,
        status: formData.status || "Pending",
        lastActive: "Never",
        createdAt: new Date().toISOString().split("T")[0],
      };
      setUsers((prevUsers) => [newUser, ...prevUsers]);
    }
    setIsModalOpen(false);
  };

  const handleOpenInviteModal = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
    setOpenMenuUserId(null);
  };

  const handleOpenDeleteModal = (user: User) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
    setOpenMenuUserId(null);
  };

  const handleDeleteConfirm = () => {
    if (selectedUser) {
      setUsers((prevUsers) => prevUsers.filter((u) => u.id !== selectedUser.id));
      setIsDeleteModalOpen(false);
      setSelectedUser(null);
    }
  };

  // Helper to filter users list
  const filteredUsers = users.filter((user) => {
    // Search query match
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    // Role type match
    if (activeFilter !== "all") {
      return user.role === activeFilter;
    }
    return true;
  });

  // Modal configuration fields
  const fieldsConfig: FieldConfig[] = [
    {
      name: "name",
      label: "Full Name",
      type: "text",
      required: true,
      placeholder: "Enter full name",
      colSpan: 2,
    },
    {
      name: "email",
      label: "Email Address",
      type: "email",
      required: true,
      placeholder: "Enter email address",
      colSpan: 1,
    },
    {
      name: "role",
      label: "Role",
      type: "select",
      required: true,
      placeholder: "Select user role",
      options: [
        { label: "Super Admin", value: "Super Admin" },
        { label: "Clinic Admin", value: "Clinic Admin" },
        { label: "Therapist", value: "Therapist" },
        { label: "Psychologist", value: "Psychologist" },
        { label: "School Staff", value: "School Staff" },
        { label: "Parent", value: "Parent" },
      ],
      colSpan: 1,
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      required: true,
      placeholder: "Select status",
      options: [
        { label: "Active", value: "Active" },
        { label: "Pending", value: "Pending" },
        { label: "Inactive", value: "Inactive" },
      ],
      colSpan: 1,
      // Only show Status field when editing an existing user
      condition: () => !!editingUser,
    },
  ];

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "Super Admin":
        return <Badge color="primary">{role}</Badge>;
      case "Clinic Admin":
        return <Badge color="success">{role}</Badge>;
      case "Therapist":
        return <Badge color="warning">{role}</Badge>;
      case "Psychologist":
        return (
          <Badge className="bg-[#f3e8ff] text-[#9333ea] dark:bg-[#9333ea]/15 dark:text-[#a855f7]" color="light">
            {role}
          </Badge>
        );
      case "School Staff":
        return (
          <Badge className="bg-[#ffe4e6] text-[#e11d48] dark:bg-[#e11d48]/15 dark:text-[#f43f5e]" color="light">
            {role}
          </Badge>
        );
      default:
        return <Badge color="light">{role}</Badge>;
    }
  };

  const getStatusPill = (status: "Active" | "Pending" | "Inactive") => {
    switch (status) {
      case "Active":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-success-50 text-success-700 dark:bg-success-500/10 dark:text-success-400">
            Active
          </span>
        );
      case "Pending":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-warning-50 text-warning-700 dark:bg-warning-500/10 dark:text-warning-400">
            Pending
          </span>
        );
      case "Inactive":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-error-50 text-error-700 dark:bg-error-500/10 dark:text-error-400">
            Inactive
          </span>
        );
    }
  };

  // Helper to return initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <>
      <PageMeta
        title="User Management | Administration"
        description="Administration Staff and Parents management dashboard"
      />

      {/* Custom Figma Header Breadcrumb */}
      <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
        <span className="text-gray-400 dark:text-gray-500">NeuroDiverse</span> &lt;{" "}
        <span className="text-gray-700 dark:text-gray-300 font-medium">Administration</span>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
            User Management
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {totalUsers} users • {pendingInvitations} pending invitation
            {pendingInvitations !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={handleOpenInviteModal}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-theme-xs hover:bg-brand-600 focus:outline-hidden transition-all duration-200"
        >
          <PlusIcon className="size-4 text-white fill-current" />
          Invite User
        </button>
      </div>

      {/* Search and Filters Layout */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div className="relative flex-1 max-w-sm">
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
            className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-500 focus:outline-hidden focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white dark:placeholder:text-gray-500"
            placeholder="Search anything here..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
          {[
            { label: "All Roles", value: "all" },
            { label: "Super Admin", value: "Super Admin" },
            { label: "Clinic Admin", value: "Clinic Admin" },
            { label: "Therapist", value: "Therapist" },
            { label: "Psychologist", value: "Psychologist" },
            { label: "School Staff", value: "School Staff" },
          ].map((filter) => (
            <button
              key={filter.value}
              onClick={() => setActiveFilter(filter.value)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                activeFilter === filter.value
                  ? "bg-brand-500 text-white shadow-theme-xs"
                  : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 dark:bg-gray-950 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-900"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table Card */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <Table className="min-w-full divide-y divide-gray-100 dark:divide-gray-800">
            <TableHeader className="bg-gray-50 dark:bg-gray-900/50">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400"
                >
                  User
                </TableCell>
                <TableCell
                  isHeader
                  className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400"
                >
                  Role
                </TableCell>
                <TableCell
                  isHeader
                  className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400"
                >
                  Status
                </TableCell>
                <TableCell
                  isHeader
                  className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400"
                >
                  Last Active
                </TableCell>
                <TableCell
                  isHeader
                  className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400"
                >
                  Created At
                </TableCell>
                <TableCell
                  isHeader
                  className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400"
                >
                  Action
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="bg-white divide-y divide-gray-100 dark:bg-transparent dark:divide-gray-800">
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                    No users found matching the query.
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.01]">
                    {/* User profile with avatar and details */}
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        {user.image ? (
                          <div className="size-10 overflow-hidden rounded-full border border-gray-100 dark:border-gray-800">
                            <img
                              width={40}
                              height={40}
                              src={user.image}
                              alt={user.name}
                              className="size-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="flex size-10 items-center justify-center rounded-full bg-brand-50 text-brand-600 font-semibold text-sm dark:bg-brand-500/10 dark:text-brand-400">
                            {getInitials(user.name)}
                          </div>
                        )}
                        <div>
                          <span className="block font-semibold text-gray-900 text-sm dark:text-white">
                            {user.name}
                          </span>
                          <span className="block text-gray-500 text-xs dark:text-gray-400 mt-0.5">
                            {user.email}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    {/* Role badge */}
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm">
                      {getRoleBadge(user.role)}
                    </TableCell>

                    {/* Status Pill */}
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm">
                      {getStatusPill(user.status)}
                    </TableCell>

                    {/* Last Active */}
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {user.lastActive}
                    </TableCell>

                    {/* Created At */}
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {user.createdAt}
                    </TableCell>

                    {/* Interactive Dropdown Actions */}
                    <TableCell className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <div className="relative inline-block text-left">
                        <button
                          onClick={() => setOpenMenuUserId(openMenuUserId === user.id ? null : user.id)}
                          className="dropdown-toggle p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-all"
                        >
                          <HorizontaLDots className="size-5" />
                        </button>
                        <Dropdown
                          isOpen={openMenuUserId === user.id}
                          onClose={() => setOpenMenuUserId(null)}
                          className="w-36 right-0 mt-1 shadow-theme-md"
                        >
                          <div className="py-1">
                            <DropdownItem onClick={() => handleOpenEditModal(user)}>
                              Edit User
                            </DropdownItem>
                            <DropdownItem
                              onClick={() => handleOpenDeleteModal(user)}
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

      {/* Invite User Modal */}
      <CustomModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? "Edit User Details" : "Invite User"}
        submitText={editingUser ? "Save Changes" : "Send Invitation"}
        fields={fieldsConfig}
        onSubmit={handleInviteOrEditSubmit}
        initialValues={editingUser ? {
          name: editingUser.name,
          email: editingUser.email,
          role: editingUser.role,
          status: editingUser.status,
        } : undefined}
        infoAlert={!editingUser
          ? "An invitation email will be sent with a secure setup link.Access is granted only after email verification."
          : undefined
        }
        size="lg"
        footerAlign="center"
        asteriskColor="black"
        overlayBlur={false}
      />

      <CustomModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedUser(null);
        }}
        title="Delete User"
        showOverlay
        backdropBlur={false}
        width="max-w-[480px]"
        padding="px-8 py-6"
        showCloseIcon
        customFooter={
          <div className="flex justify-end items-center gap-3 px-8 py-5 border-t border-gray-100 w-full">
            <button
              type="button"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setSelectedUser(null);
              }}
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
          Are you sure you want to delete this user? This action cannot be undone.
        </p>
      </CustomModal>
    </>
  );
}
