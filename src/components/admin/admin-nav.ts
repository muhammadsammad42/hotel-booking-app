import {
  BuildingIcon,
  CalendarRangeIcon,
  ClipboardListIcon,
  GridIcon,
  LayoutDashboardIcon,
  SparklesIcon,
  type LucideIcon,
} from "lucide-react";

export type AdminNavItem = { href: string; label: string; icon: LucideIcon; description: string };

export const ADMIN_NAV: AdminNavItem[] = [
  { href: "/admin", label: "Overview", icon: LayoutDashboardIcon, description: "Revenue, occupancy and today at the desk" },
  { href: "/admin/reservations", label: "Reservations", icon: ClipboardListIcon, description: "Search, check in, cancel and export" },
  { href: "/admin/hotels", label: "Hotels", icon: BuildingIcon, description: "Hotels, room types and photos" },
  { href: "/admin/rates", label: "Rates", icon: CalendarRangeIcon, description: "Nightly prices and blocked rooms" },
  { href: "/admin/inventory", label: "Inventory", icon: GridIcon, description: "Occupancy heatmap" },
  { href: "/admin/amenities", label: "Amenities", icon: SparklesIcon, description: "The amenity list hotels pick from" },
];

export function isActiveNav(pathname: string, href: string) {
  return href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(`${href}/`);
}

/** Remembers whether the desktop sidebar is collapsed. Read on the server too. */
export const SIDEBAR_COOKIE = "sarai-admin-sidebar";
