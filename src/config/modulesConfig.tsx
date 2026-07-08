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
    path: "/dashboard", 
    icon: <GridIcon />,
    category: "Main",
    label: "Dashboard",
  },
  "Organization": {
    path: "/administration/organization",
    icon: <GroupIcon />,
    category: "Administration",
    label: "Organization"
  },
  "User": {
    path: "/administration/users",
    icon: <UserCircleIcon />,
    category: "Administration",
    label: "User"
  },
  "Role": {
    path: "/administration/role-management",
    icon: <GroupIcon />,
    category: "Administration",
    label: "Role"
  },
  "Permission": {
    path: "/administration/permission",
    icon: <PlugInIcon />,
    category: "Administration",
    label: "Permission"
  },
  "Category": {
    path: "/masters/category",
    icon: <DocsIcon />,
    category: "Masters",
    label: "Category"
  },
  "Organization Type": {
    path: "/administration/organization-type",
    icon: <GroupIcon />,
    category: "Administration",
    label: "Organization Type"
  },
  "Content & CMS": {
    path: "/masters/content-cms",
    icon: <PageIcon />,
    category: "Masters",
    label: "Content & CMS"
  },
  "Subscription": {
    path: "/administration/subscription",
    icon: <PieChartIcon />,
    category: "Administration",
    label: "Subscription"
  },
  "Plans": {
    path: "/administration/plans",
    icon: <ListIcon />,
    category: "Administration",
    label: "Plans",
  },
  "Audit Logs": {
    path: "/administration/audit-logs",
    icon: <TableIcon />,
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
    icon: <ListIcon />,
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
  // Legacy backups just in case
  "Role Management": {
    path: "/administration/role-management",
    icon: <GroupIcon />,
    category: "Administration",
    label: "Role Management"
  },
  "Permissions": {
    path: "/administration/permission",
    icon: <PlugInIcon />,
    category: "Administration",
    label: "Permissions"
  },
  "Module": {
    path: "/administration/modules",
    icon: <BoxCubeIcon />,
    category: "Administration",
    label: "Module"
  },
  "Category Master": {
    path: "/masters/category-master",
    icon: <DocsIcon />,
    category: "Masters",
    label: "Category Master"
  }
};
