"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  ListChecks,
  Link2,
  MessageSquare,
  Settings,
  Key,
  CreditCard,
  Wallet,
  User,
  LogOut,
  ShieldAlert,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { SidebarProfile } from "@/components/dashboard/sidebar-profile";
import { ServiceStatus } from "@/components/dashboard/service-status";
import { clearAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/documents", label: "Documents", icon: FileText },
  { href: "/criteria", label: "Criteria", icon: ListChecks },
  { href: "/signatures", label: "Blockchain", icon: Link2 },
  { href: "/assistant", label: "Assistant", icon: MessageSquare },
];

const SETTINGS = [
  { href: "/settings/profile", label: "Profile", icon: User },
  { href: "/settings/spoofing", label: "Spoofing", icon: ShieldAlert },
  { href: "/settings/balance", label: "Balance", icon: Wallet },
  { href: "/settings/api-keys", label: "API Keys", icon: Key },
  { href: "/settings/payments", label: "Payments", icon: CreditCard },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === href;
    if (href === "/documents") return pathname === href || pathname.startsWith("/documents/");
    return pathname.startsWith(href);
  };

  const logout = () => {
    clearAuth();
    router.push("/login");
  };

  return (
    <aside className="dash-sidebar">
      <div className="dash-sidebar-brand">
        <Logo />
      </div>

      <nav className="dash-nav">
        <div className="dash-nav-group">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`sidebar-link${isActive(href) ? " active" : ""}`}
            >
              <Icon size={16} strokeWidth={1.75} />
              {label}
            </Link>
          ))}
        </div>

        <div className="dash-nav-group dash-nav-group--settings">
          <p className="dash-nav-label">Settings</p>
          {SETTINGS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`sidebar-link${isActive(href) ? " active" : ""}`}
            >
              <Icon size={16} strokeWidth={1.75} />
              {label}
            </Link>
          ))}
        </div>
      </nav>

      <div className="dash-sidebar-foot">
        <ServiceStatus />
        <SidebarProfile />
        <button type="button" className="sidebar-link dash-logout" onClick={logout}>
          <LogOut size={16} strokeWidth={1.75} />
          Log out
        </button>
      </div>
    </aside>
  );
}
