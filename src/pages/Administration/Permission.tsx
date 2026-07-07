import React, { useState } from 'react';
import CustomModal from "../../components/ui/modal/CustomModal";
import { Dropdown } from "../../components/ui/dropdown/Dropdown";
import { DropdownItem } from "../../components/ui/dropdown/DropdownItem";
import { PlusIcon, HorizontaLDots } from '../../icons';

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

const initialPermissionsList = [
  {
    id: 1,
    title: 'Super Admin',
    description: 'Full platform access across all\norganizations and modules',
    modules: [{ name: 'Super Admin', color: 'green' }, { name: 'Upload File', color: 'orange' }],
    create: true, read: false, update: true, delete: true,
  },
  {
    id: 2,
    title: 'Org Admin',
    description: 'Full clinical control within their\norganization; manages staff and\ncompliance',
    modules: [{ name: 'Super Admin', color: 'green' }, { name: 'Upload File', color: 'orange' }],
    create: true, read: false, update: true, delete: true,
  },
  {
    id: 3,
    title: 'Therapist / Clinician',
    description: 'Manages caseload, conducts\nsessions, writes notes and\nreports',
    modules: [{ name: 'Super Admin', color: 'green' }, { name: 'Upload File', color: 'orange' }],
    create: true, read: true, update: true, delete: false,
  },
  {
    id: 4,
    title: 'Psychologist',
    description: 'Conducts psychometric\nassessments and confirms\ndiagnoses',
    modules: [{ name: 'Super Admin', color: 'green' }, { name: 'Upload File', color: 'orange' }],
    create: true, read: false, update: true, delete: true,
  },
  {
    id: 5,
    title: 'School Staff',
    description: 'Tracks IEP goals for shared\nstudents; consent-scoped view\nonly',
    modules: [{ name: 'Super Admin', color: 'green' }, { name: 'Upload File', color: 'orange' }],
    create: true, read: true, update: false, delete: true,
  },
];

export default function PermissionMatrix() {
  const [permissionsList, setPermissionsList] = useState(initialPermissionsList);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [openMenuPermissionId, setOpenMenuPermissionId] = useState<number | null>(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState<any | null>(null);
  
  // Modal state
  const [selectedModules, setSelectedModules] = useState(['Dashboard', 'Observation', 'Appointment']);
  const availableModules = ['Dashboard', 'Observation', 'Appointment', 'Settings', 'Reports', 'Users'];
  const [toggles, setToggles] = useState({ create: true, read: false, update: false, delete: true });

  const handleOpenAddModal = () => {
    setSelectedPermission(null);
    setSelectedModules(['Dashboard', 'Observation', 'Appointment']);
    setToggles({ create: true, read: false, update: false, delete: true });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (perm: any) => {
    setSelectedPermission(perm);
    setSelectedModules(perm.modules.map((m: any) => m.name));
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
      setPermissionsList(prev => prev.filter(p => p.id !== selectedPermission.id));
      setIsDeleteOpen(false);
      setSelectedPermission(null);
    }
  };

  const handleModuleToggle = (moduleName: string) => {
    if (selectedModules.includes(moduleName)) {
      setSelectedModules(selectedModules.filter(m => m !== moduleName));
    } else {
      setSelectedModules([...selectedModules, moduleName]);
    }
  };

  const getModuleChipColor = (mod: string) => {
    if (mod === 'Dashboard') return 'bg-[#ffe6e6] text-[#c95d5d]';
    if (mod === 'Observation') return 'bg-[#cbf7d8] text-[#3e8a5b]';
    if (mod === 'Appointment') return 'bg-[#cce6ff] text-[#4b7aab]';
    return 'bg-gray-100 text-gray-700';
  };

  return (
    <>
      {/* Custom Figma Header Breadcrumb */}
      <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
        <span className="text-gray-400 dark:text-gray-500">NeuroDiverse</span> &lt;{" "}
        <span className="text-gray-700 dark:text-gray-300 font-medium">Administration</span>
      </div>

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

      {/* Main Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
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
            {permissionsList.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase())).map((permission) => (
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
                    {permission.modules.map((mod, i) => (
                      <span 
                        key={i} 
                        className={`inline-flex items-center px-2.5 py-1 rounded-[4px] text-[11px] font-bold ${
                          mod.color === 'green' 
                            ? 'bg-[#cbf7d8] text-green-800' 
                            : 'bg-[#ffe6c9] text-orange-800'
                        }`}
                      >
                        {mod.name}
                      </span>
                    ))}
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
      </div>

      {/* Info Tip */}
      <div className="bg-[#eaf5ff] border border-blue-100 rounded-xl p-4 text-[13px] text-slate-600 text-center shadow-sm">
        Tip: System roles cannot be deleted, but their permissions can be customized in the Permissions module. Custom roles inherit no permissions by default — configure them after creation.
      </div>

      {/* REPLACED WITH CustomModal 
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          ... old modal code ...
        </div>
      )}
      */}

      <CustomModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedPermission ? "Edit Permission" : "Create New Permission"}
        maxWidth="max-w-[750px]"
        footerAlign="center"
        submitText={selectedPermission ? "Save Permission" : "Create Permission"}
        cancelText="Cancel"
        submitButtonClassName="rounded-lg shadow-sm px-6 py-2.5 bg-[#6db3ff] hover:bg-blue-400 text-sm font-medium text-white transition-colors cursor-pointer ml-3"
        cancelButtonClassName="rounded-lg bg-[#dadada] shadow-sm px-6 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-300 transition-colors cursor-pointer"
        fields={[
          { name: "title", label: "Title", type: "text", required: true, colSpan: 2 },
          { name: "description", label: "Description", type: "text", required: true, colSpan: 2 }
        ]}
        initialValues={{
          title: selectedPermission?.title || '',
          description: selectedPermission?.description || ''
        }}
        onSubmit={(data) => {
          if (selectedPermission) {
            setPermissionsList(prev => prev.map(p => 
              p.id === selectedPermission.id 
                ? { 
                    ...p, 
                    title: data.title, 
                    description: data.description,
                    modules: selectedModules.map(m => ({ name: m, color: 'green' })),
                    ...toggles
                  }
                : p
            ));
          } else {
            const newPerm = {
              id: Date.now(),
              title: data.title,
              description: data.description,
              modules: selectedModules.map(m => ({ name: m, color: 'green' })),
              ...toggles
            };
            setPermissionsList([...permissionsList, newPerm]);
          }
          setIsModalOpen(false);
        }}
        bodyFooter={
          <div className="flex flex-col gap-6 -mt-2">
            {/* Modules Field */}
            <div className="flex items-start gap-4">
              <div className="flex flex-col w-48 shrink-0 gap-1.5">
                <label className="block text-xs font-bold text-black">
                  Modules *
                </label>
                <div className="relative">
                  <select
                    className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-brand-500 transition-all cursor-pointer"
                    onChange={(e) => handleModuleToggle(e.target.value)}
                    value="Select"
                  >
                    <option disabled value="Select">Select</option>
                    {availableModules.filter(m => !selectedModules.includes(m)).map((mod) => (
                      <option key={mod} value={mod}>{mod}</option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </div>
              </div>
              
              {/* Chips container */}
              <div className="flex flex-wrap gap-3 pt-6 w-full">
                {selectedModules.map(mod => (
                  <span 
                    key={mod} 
                    className={`inline-flex items-center px-3 py-1.5 rounded-[4px] text-xs font-semibold shadow-sm ${getModuleChipColor(mod)}`}
                  >
                    {mod}
                  </span>
                ))}
              </div>
            </div>

            {/* Permission Matrix */}
            <div>
              <h4 className="text-xs font-bold text-black mb-3">Permission Matrix*</h4>
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
          </div>
        }
      />

      {/* Delete Confirmation Modal */}
      <CustomModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Delete Permission"
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
          Are you sure you want to delete this permission role? This action cannot be undone.
        </p>
      </CustomModal>
    </>
  );
}
