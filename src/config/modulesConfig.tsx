import {
  GridIcon,
  GroupIcon,
  DocsIcon,
  PieChartIcon,
  BoxCubeIcon,
  ListIcon,
  TableIcon,
  PageIcon,
  CalenderIcon,
  UserCircleIcon,
  PlugInIcon
} from "../icons";

export type ModuleConfig = {
  path: string;
  icon: React.ReactNode;
  category: string;
  label: string;
};

// Maps backend module string to frontend path, icon, and sidebar category
export const MODULE_CONFIG: Record<string, ModuleConfig> = {
  "Dashboard": {
    // Both Parent and Clinic Admin get Dashboard, logic in Sidebar will use current URL if needed
    // but typically we can point Dashboard to "/" and let ProtectedRoute handle it.
    path: "/", 
    icon: <GridIcon />,
    category: "Main",
    label: "Dashboard",
  },
  "Plans": {
    path: "/administration/plans", // Guessing paths based on App.tsx, adjust as needed
    icon: <DocsIcon />,
    category: "Administration",
    label: "Plans",
  },
  "Audit Logs": {
    path: "/administration/audit-logs",
    icon: <ListIcon />,
    category: "Administration",
    label: "Audit Logs",
  },
  "Ticket": {
    path: "/administration/ticket",
    icon: <BoxCubeIcon />,
    category: "Administration",
    label: "Ticket",
  },
  "Complaints": {
    path: "/administration/complaints",
    icon: <PieChartIcon />,
    category: "Administration",
    label: "Complaints",
  },
  "Children": {
    path: "/care/children",
    icon: <GroupIcon />,
    category: "Care",
    label: "Children",
  },
  "Health Records": {
    path: "/care/health-records",
    icon: <DocsIcon />,
    category: "Care",
    label: "Health Records",
  },
  "Assessment": {
    path: "/care/assessment",
    icon: <ListIcon />,
    category: "Care",
    label: "Assessment",
  },
  "Goals": {
    path: "/care/goals",
    icon: <PieChartIcon />,
    category: "Care",
    label: "Goals",
  },
  "Medication": {
    path: "/care/medication",
    icon: <BoxCubeIcon />,
    category: "Care",
    label: "Medication",
  },
  "Diagnosis": {
    path: "/care/diagnosis",
    icon: <PageIcon />,
    category: "Care",
    label: "Diagnosis",
  },
  "Genetic Testing": {
    path: "/care/genetic-testing",
    icon: <PlugInIcon />,
    category: "Care",
    label: "Genetic Testing",
  },
  "Session Notes": {
    path: "/care/session-notes",
    icon: <DocsIcon />,
    category: "Care",
    label: "Session Notes",
  },
  "Appointment": {
    path: "/care/appointment",
    icon: <CalenderIcon />,
    category: "Care",
    label: "Appointment",
  },
  "Consent": {
    path: "/care/consent",
    icon: <PageIcon />,
    category: "Care",
    label: "Consent",
  },
  "Observation": {
    path: "/care/observation",
    icon: <UserCircleIcon />,
    category: "Care",
    label: "Observation",
  },
  // Adding the missing ones from the old static sidebar so Clinic Admins don't lose them if they get them dynamically
  "Staff & Parents": {
    path: "/administration/staff-parents",
    icon: <GroupIcon />,
    category: "Administration",
    label: "Staff & Parents"
  },
  "Role Management": {
    path: "/administration/role-management",
    icon: <GroupIcon />,
    category: "Administration",
    label: "Role Management"
  },
  "Permissions": {
    path: "/administration/permission",
    icon: <GroupIcon />,
    category: "Administration",
    label: "Permissions"
  },
  "Module": {
    path: "/administration/modules",
    icon: <GroupIcon />,
    category: "Administration",
    label: "Module"
  },
  "Category Master": {
    path: "/masters/category-master",
    icon: <DocsIcon />,
    category: "Masters",
    label: "Category Master"
  },
  "Content & CMS": {
    path: "/masters/content-cms",
    icon: <DocsIcon />,
    category: "Masters",
    label: "Content & CMS"
  }
};
