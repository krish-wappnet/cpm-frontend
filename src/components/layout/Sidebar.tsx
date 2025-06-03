import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAppSelector } from "../../store/store";
import { cn } from "../../lib/utils";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  ChevronDown,
  Target,
  Tag,
  Target as OkrIcon,
  BarChart as AnalyticsIcon,
  MessageSquare,
  Calendar,
  Inbox,
  BarChart2,
} from "lucide-react";
import type { NavItem, SidebarNavProps } from "../../types/navigation";
import { selectAuthUser } from '../../store/slices/authSlice';

// Define navigation items
const navItems: NavItem[] = [
  {
    title: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
    roles: ["admin", "manager", "employee"],
  },
  {
    title: "Employees",
    path: "/employees",
    icon: Users,
    roles: ["admin", "manager", "employee"],
    children: [
      {
        title: "All Employees",
        path: "/employees",
        icon: Users,
        roles: ["admin", "manager"],
      },
      {
        title: "Add Employee",
        path: "/employees/new",
        icon: Users,
        roles: ["admin", "manager"],
      },
      {
        title: "My Department",
        path: "/department/employees",
        icon: Users,
        roles: ["employee", "manager"],
      },
    ],
  },
  {
    title: "Departments",
    path: "/departments",
    icon: Briefcase,
    roles: ["admin"],
    children: [
      {
        title: "All Departments",
        path: "/departments",
        icon: Briefcase,
        roles: ["admin"],
      },
      {
        title: "Add Department",
        path: "/departments/new",
        icon: Briefcase,
        roles: ["admin"],
      },
    ],
  },
  {
    title: "OKRs",
    path: "/okrs",
    icon: OkrIcon,
    roles: ["admin", "manager", "employee"],
    children: [
      {
        title: "All OKRs",
        path: "/okrs",
        icon: OkrIcon,
        roles: ["admin", "manager"],
      },
      {
        title: "Analytics",
        path: "/okr-analytics",
        icon: AnalyticsIcon,
        roles: ["admin", "manager","employee"],
      },
    ],
  },
  {
    title: "KPIs",
    path: "/kpis",
    icon: Target,
    roles: ["admin", "manager"],
    children: [
      {
        title: "All KPIs",
        path: "/kpis",
        icon: Target,
        roles: ["admin", "manager", "employee"],
      },
      {
        title: 'KPI Analytics',
        path: '/analytics/kpis',
        icon: BarChart2,
        roles: ['admin', 'manager','employee']
      }
    ],
  },
  {
    title: "Categories",
    path: "/categories",
    icon: Tag,
    roles: ["admin", "manager"],
    children: [
      {
        title: "All Categories",
        path: "/categories",
        icon: Tag,
        roles: ["admin", "manager"],
      },
      {
        title: "Add Category",
        path: "/categories/new",
        icon: Tag,
        roles: ["admin", "manager"],
      },
    ],
  },
  {
    title: "Feedback",
    path: "/feedback",
    icon: MessageSquare,
    roles: ["admin", "manager", "employee"],
    children: [
      {
        title: "My Feedback",
        path: "/feedback",
        icon: MessageSquare,
        roles: ["admin", "manager"],
      },
      // {
      //   title: "Give Feedback",
      //   path: "/feedback/new",
      //   icon: MessageSquare,
      //   roles: ["admin", "manager", "employee"],
      // },
      {
        title: "Feedback Requests",
        path: "/feedback/requests",
        icon: Inbox,
        roles: [ "manager",],
      },
      {
        title: "Manage Requests",
        path: "/admin/feedback/requests",
        icon: Inbox,
        roles: ["admin"],
      },
      {
        title: "Feedback Cycles",
        path: "/feedback/cycles",
        icon: Calendar,
        roles: ["admin", "manager"],
      },
      {
        title: "Feedback Received",
        path: "/feedback/received",
        icon: MessageSquare,
        roles: ["employee", "manager"],
      },
      {
        title: "All Feedback",
        path: "/feedback/all",
        icon: MessageSquare,
        roles: ["admin"],
      }
    ],
  },
];

const Sidebar: React.FC<SidebarNavProps> = ({ isOpen, onClose }) => {
  const user = useAppSelector(selectAuthUser);
  const location = useLocation();
  const [openItems, setOpenItems] = React.useState<Record<string, boolean>>({});

  // Toggle submenu
  const toggleItem = (path: string) => {
    setOpenItems((prev) => ({
      ...prev,
      [path]: !prev[path],
    }));
  };

  // Filter top-level navigation items based on user role
  const filteredNavItems = navItems.filter((item) => {
    if (!item.roles) return true;
    return item.roles.some((role) => user?.roles?.includes(role));
  });

  // Check if a nav item is active
  const isActive = (path: string, exact: boolean = false) => {
    return exact
      ? location.pathname === path
      : location.pathname.startsWith(path);
  };

  // Check if any child is active
  const hasActiveChild = (children: NavItem[] = []) => {
    return children.some((child) => isActive(child.path, true));
  };

  // Filter navigation items based on user role
  const filterItemsByRole = (items: NavItem[]) => {
    return items.filter((item) => {
      if (!item.roles) return true;
      return item.roles.some((role) => user?.roles?.includes(role));
    });
  };

  // Render navigation items
  const renderNavItems = (items: NavItem[], level: number = 0) => {
    const filteredItems = filterItemsByRole(items);

    return filteredItems.map((item) => {
      const filteredChildren = item.children
        ? filterItemsByRole(item.children)
        : [];
      const hasChildren = filteredChildren.length > 0;
      const isItemActive = isActive(item.path, !hasChildren);
      const isChildActive = hasChildren && hasActiveChild(filteredChildren);
      const isSubmenuOpen = openItems[item.path] || isChildActive;

      return (
        <div key={item.path} className="space-y-1">
          <NavLink
            to={hasChildren ? "#" : item.path}
            onClick={(e) => {
              if (hasChildren) {
                e.preventDefault();
                toggleItem(item.path);
              } else {
                onClose?.();
              }
            }}
            className={cn(
              "flex items-center px-4 py-2 text-sm font-medium rounded-md transition-all",
              "hover:bg-gray-100 hover:text-accent",
              isItemActive || isChildActive
                ? "bg-blue-50 text-secondary"
                : "text-gray-700",
              level > 0 ? `pl-${level * 4 + 4}` : ""
            )}
            aria-label={item.title}
          >
            <item.icon
              className={cn(
                "mr-3 h-5 w-5 flex-shrink-0",
                isItemActive || isChildActive
                  ? "text-secondary"
                  : "text-gray-500"
              )}
            />
            <span className="flex-1">{item.title}</span>
            {hasChildren && (
              <ChevronDown
                className={cn(
                  "h-4 w-4 transform transition-transform",
                  isSubmenuOpen ? "rotate-180" : ""
                )}
                aria-expanded={isSubmenuOpen}
              />
            )}
          </NavLink>

          {hasChildren && (
            <div
              className={cn(
                "overflow-hidden transition-all duration-300",
                isSubmenuOpen ? "max-h-96" : "max-h-0"
              )}
            >
              <div className="py-1 pl-4">
                {renderNavItems(filteredChildren, level + 1)}
              </div>
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div
      className={cn(
        "fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200",
        "transform transition-transform duration-300 ease-in-out",
        "flex flex-col h-screen overflow-y-auto",
        // Apply translate-x based on isOpen only for mobile (<md)
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}
    >
      <div className="flex flex-col flex-1">
        <div className="flex items-center h-16 px-4 border-b border-gray-200 flex-shrink-0">
          <h1 className="text-xl font-bold text-primary">HR Analytics</h1>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {renderNavItems(filteredNavItems)}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
