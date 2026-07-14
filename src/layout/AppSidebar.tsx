import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";

// Assume these icons are imported from an icon library
import {
  BoxCubeIcon,
  CalenderIcon,
  ChevronDownIcon,
  GridIcon,
  HorizontaLDots,
  ListIcon,
  PageIcon,
  PieChartIcon,
  PlugInIcon,
  TableIcon,
  UserCircleIcon,
  GroupIcon,
  DocsIcon,
  HomeIcon,
} from "../icons";
import { useSidebar } from "../context/SidebarContext";
import SidebarWidget from "./SidebarWidget";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

import { MODULE_CONFIG } from "../config/modulesConfig";

import { useAuth } from "../context/AuthContext";

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  "Administration": <GroupIcon />,
  "Masters": <DocsIcon />,
  "Care": <GroupIcon />,
  "Main": <GridIcon />
};

// dynamic backend based commented for now as modules are not finalized
// const getNavItems = (user: any): NavItem[] => {
//   let permissions: any[] = [];
//   try {
//     permissions = user?.role?.permissions || [];
//   } catch (e) {
//     console.error("Failed to parse user permissions for sidebar:", e);
//   }

//   const categoryMap: Record<string, NavItem> = {};

//   // For testing purposes, if permissions are empty, you could fallback to static menu, 
//   // but let's stick to dynamic parsing to ensure it strictly follows backend
//   permissions.forEach((perm: any) => {
//     const moduleName = perm.Name || perm.module; // Handle both cases for safety
//     const config = MODULE_CONFIG[moduleName];
//     if (!config) return;

//     if (config.category === "Main") {
//       categoryMap[moduleName] = {
//         name: config.label,
//         icon: config.icon,
//         path: config.path
//       };
//     } else {
//       if (!categoryMap[config.category]) {
//         categoryMap[config.category] = {
//           name: config.category,
//           icon: CATEGORY_ICONS[config.category] || <BoxCubeIcon />,
//           subItems: []
//         };
//       }
//       // Ensure no duplicates
//       if (!categoryMap[config.category].subItems?.some(s => s.name === config.label)) {
//         categoryMap[config.category].subItems!.push({
//           name: config.label,
//           path: config.path,
//           pro: false
//         });
//       }
//     }
//   });

//   return Object.values(categoryMap);
// };

const getNavItems = (role: string): NavItem[] => {
  const isParent = role === "Parent/Guardian" || role === "Parent / Guardian";

  if (isParent) {
    return [
      {
        name: "Dashboard",
        icon: <GridIcon />,
        path: "/dashboard"
      },
      {
        name: "Staff & Parents",
        icon: <GroupIcon />,
        path: "/administration/staff-parents"
      },
      {
        name: "Care",
        icon: <GroupIcon />,
        subItems: [
          { name: "Children", path: "/care/children", pro: false },
        ]
      },
      {
        name: "Home Observations",
        icon: <HomeIcon />,
        path: "/dashboard/home-observations"
      },
    ];
  }

  const isTherapist = role === "Therapist";
  
  if (isTherapist) {
    return [
      {
        name: "Dashboard",
        icon: <GridIcon />,
        path: "/dashboard"
      },
      {
        name: "Masters",
        icon: <DocsIcon />,
        subItems: [
          { name: "Category Master", path: "/masters/category-master", pro: false },
          { name: "Content & CMS", path: "/masters/content-cms", pro: false },
        ]
      },
      {
        name: "Care",
        icon: <GroupIcon />,
        subItems: [
          { name: "Children", path: "/care/children", pro: false },
        ]
      },
      {
        name: "Home Observations",
        icon: <HomeIcon />,
        path: "/dashboard/home-observations"
      }
    ];
  }

  // Otherwise Clinic Admin / Default
  return [
    {
      name: "Dashboard",
      icon: <GridIcon />,
      path: "/dashboard"
    },
    {
      name: "Administration",
      icon: <GroupIcon />,
      subItems: [
        { name: "Staff & Parents", path: "/administration/staff-parents", pro: false },
        { name: "Role Management", path: "/administration/role-management", pro: false },
        { name: "Modules", path: "/administration/modules", pro: false },
        { name: "Permissions", path: "/administration/permission", pro: false },
      ]
    },
    {
      name: "Masters",
      icon: <DocsIcon />,
      subItems: [
        { name: "Category Master", path: "/masters/category-master", pro: false },
        { name: "Content & CMS", path: "/masters/content-cms", pro: false },
      ]
    },
    {
      name: "Care",
      icon: <GroupIcon />,
      subItems: [
        { name: "Children", path: "/care/children", pro: false },
      ]
    },
    {
      name: "Home Observations",
      icon: <HomeIcon />,
      path: "/dashboard/home-observations"
    }
  ];
};

const othersItems: NavItem[] = [
  {
    icon: <PieChartIcon />,
    name: "Charts",
    subItems: [
      { name: "Line Chart", path: "/line-chart", pro: false },
      { name: "Bar Chart", path: "/bar-chart", pro: false },
    ],
  },
  {
    icon: <BoxCubeIcon />,
    name: "UI Elements",
    subItems: [
      { name: "Alerts", path: "/alerts", pro: false },
      { name: "Avatar", path: "/avatars", pro: false },
      { name: "Badge", path: "/badge", pro: false },
      { name: "Buttons", path: "/buttons", pro: false },
      { name: "Images", path: "/images", pro: false },
      { name: "Videos", path: "/videos", pro: false },
    ],
  },
  {
    icon: <PlugInIcon />,
    name: "Authentication",
    subItems: [
      { name: "Sign In", path: "/signin", pro: false },
      { name: "Sign Up", path: "/signup", pro: false },
    ],
  },
];

const AppSidebar: React.FC = () => {
  const { user } = useAuth();
  // let role = user?.role?.name || "";
  let role = user?.role?.name || "Clinic Admin";
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({});
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  // const currentNavItems = getNavItems(user);
  const currentNavItems = getNavItems(role);

  useEffect(() => {
    let submenuMatched = false;
    ["main", "others"].forEach((menuType) => {
      const items = menuType === "main" ? currentNavItems : othersItems;
      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({
                type: menuType as "main" | "others",
                index,
              });
              submenuMatched = true;
            }
          });
        }
      });
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [location, isActive]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  const renderMenuItems = (items: NavItem[], menuType: "main" | "others") => (
    <ul className="flex flex-col gap-4">
      {items.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`menu-item group ${
                openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "menu-item-active"
                  : "menu-item-inactive"
              } cursor-pointer ${
                !isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "lg:justify-start"
              }`}
            >
              <span
                className={`menu-item-icon-size  ${
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="menu-item-text">{nav.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDownIcon
                  className={`ml-auto w-5 h-5 transition-transform duration-200 ${
                    openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
                      ? "rotate-180 text-brand-500"
                      : ""
                  }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                to={nav.path}
                className={`menu-item group ${
                  isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                }`}
              >
                <span
                  className={`menu-item-icon-size ${
                    isActive(nav.path)
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                  }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{nav.name}</span>
                )}
              </Link>
            )
          )}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${menuType}-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="mt-2 space-y-1 ml-9">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      to={subItem.path}
                      className={`menu-dropdown-item ${
                        isActive(subItem.path)
                          ? "menu-dropdown-item-active"
                          : "menu-dropdown-item-inactive"
                      }`}
                    >
                      {subItem.name}
                      <span className="flex items-center gap-1 ml-auto">
                        {subItem.new && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                            } menu-dropdown-badge`}
                          >
                            new
                          </span>
                        )}
                        {subItem.pro && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                            } menu-dropdown-badge`}
                          >
                            pro
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-gray-50 dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`pt-6 pb-8 flex ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-center"
        }`}
      >
        <Link to="/" className="w-full">
          {isExpanded || isHovered || isMobileOpen ? (
            <div className="flex flex-col items-center gap-1 w-full">
              <img
                src="/images/logo/theraverse-logo.jpeg"
                alt="Logo"
                className="w-full max-w-[240px] h-36 object-contain mb-1 rounded-md"
              />
              <h1 className="text-lg font-bold text-gray-900 dark:text-white leading-tight text-center">NeuroCare</h1>
              <p className="text-sm text-gray-500 font-medium text-center">{role}</p>
            </div>
          ) : (
            <img
              src="/images/logo/theraverse-logo.jpeg"
              alt="Logo"
              className="w-10 h-10 rounded-md object-contain mx-auto block"
            />
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Menu"
                ) : (
                  <HorizontaLDots className="size-6" />
                )}
              </h2>
              {renderMenuItems(currentNavItems, "main")}
            </div>
            <div className="">
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Others"
                ) : (
                  <HorizontaLDots />
                )}
              </h2>
              {/* {renderMenuItems(othersItems, "others")} */}
            </div>
          </div>
        </nav>
        {/*isExpanded || isHovered || isMobileOpen ? <SidebarWidget /> : null*/}
      </div>
    </aside>
  );
};

export default AppSidebar;
