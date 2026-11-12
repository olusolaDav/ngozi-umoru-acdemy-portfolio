"use client";

import { ChevronLeft, ChevronRight, Menu } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { BrandLogo } from "@/components/public/brand-logo";
import { useContactUnreadCount, useNotificationUnreadCount } from "@/lib/notification-queries";
import { cn } from "@/lib/utils";

type DashboardShellProps = {
  children: React.ReactNode;
};

type SessionUser = {
  id: string;
  fullName: string;
  email: string;
  role: "ADMIN" | "MODERATOR" | "BLOGGER" | "MEMBER";
};

type NavItem = {
  href: string;
  label: string;
  icon?: React.ComponentType<{ size?: number }>;
  customIcon?: string;
  roles: SessionUser["role"][];
};

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Overview", customIcon: "/icons/overview.svg", roles: ["ADMIN", "MODERATOR", "BLOGGER", "MEMBER"] },
  { href: "/dashboard/videos", label: "Videos", customIcon: "/icons/videos.svg", roles: ["ADMIN", "MODERATOR"] },
  { href: "/dashboard/daily-scriptures", label: "Daily Scripture", customIcon: "/icons/daily-scripture.svg", roles: ["ADMIN", "MODERATOR"] },
  { href: "/dashboard/devotionals", label: "Devotionals", customIcon: "/icons/devotionals.svg", roles: ["ADMIN", "MODERATOR", "BLOGGER"] },
  { href: "/dashboard/community", label: "Community", customIcon: "/icons/community.svg", roles: ["ADMIN", "MODERATOR", "BLOGGER"] },
  { href: "/dashboard/blogs", label: "Blog", customIcon: "/icons/blog.svg", roles: ["ADMIN", "MODERATOR", "BLOGGER"] },
  { href: "/dashboard/users", label: "Users", customIcon: "/icons/user.svg", roles: ["ADMIN", "MODERATOR"] },
  { href: "/dashboard/notifications", label: "Notifications", customIcon: "/icons/notifications.svg", roles: ["ADMIN", "MODERATOR", "BLOGGER"] },
  { href: "/dashboard/contacts", label: "Contacts", customIcon: "/icons/contact.svg", roles: ["ADMIN", "MODERATOR"] },
  { href: "/dashboard/settings", label: "Settings", customIcon: "/icons/settings.svg", roles: ["ADMIN", "MODERATOR", "BLOGGER", "MEMBER"] },
  ];

export function DashboardShell({ children }: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [confirmSignOut, setConfirmSignOut] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const { data: notificationsUnread = 0 } = useNotificationUnreadCount();
  const { data: contactsUnread = 0 } = useContactUnreadCount(
    user?.role === "ADMIN" || user?.role === "MODERATOR",
  );

  useEffect(() => {
    async function loadSession() {
      const response = await fetch("/api/auth/session");

      if (!response.ok) {
        router.push("/auth/sign-in");
        return;
      }

      const payload = (await response.json()) as SessionUser;
      setUser(payload);
    }

    void loadSession();
  }, [router]);

  const allowedNav = useMemo(() => {
    if (!user) {
      return [];
    }

    return navItems.filter((item) => item.roles.includes(user.role));
  }, [user]);

  async function signOut() {
    setSigningOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    setSigningOut(false);
    setConfirmSignOut(false);
    router.push("/auth/sign-in");
  }

  return (
    <div className="dashboard-theme-scope min-h-screen bg-[var(--avad-bg)] text-[var(--avad-text)]">
      <ConfirmationModal
        open={confirmSignOut}
        loading={signingOut}
        title="Sign Out"
        description="Are you sure you want to sign out of your account?"
        confirmLabel="Sign Out"
        onCancel={() => setConfirmSignOut(false)}
        onConfirm={() => {
          void signOut();
        }}
      />

      <button
        onClick={() => setOpen((value) => !value)}
        className="fixed left-4 top-4 z-40 rounded-xl border border-[var(--avad-border)] bg-[var(--avad-bg-elevated)] p-2 shadow-sm lg:hidden"
        aria-label="Toggle dashboard menu"
      >
        <Menu size={20} />
      </button>

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 flex flex-col overflow-visible border-r border-[var(--avad-border)] bg-[var(--avad-bg-soft)] pb-6 pt-6 transition-[width,transform] lg:translate-x-0",
          collapsed ? "w-[76px] px-3" : "w-[250px] px-4",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className={cn("relative flex min-h-10 items-center", collapsed ? "justify-center" : "px-2")}>
          <BrandLogo compact withText={!collapsed} />
          <button
            type="button"
            onClick={() => setCollapsed((value) => !value)}
            className={cn(
              "absolute top-1/2 hidden size-9 -translate-y-1/2 items-center justify-center rounded-xl border-2 border-[var(--avad-border)] bg-[var(--avad-bg-elevated)] text-[var(--avad-text-strong)] shadow-md transition hover:border-[var(--avad-ring)] hover:bg-[var(--avad-bg)] lg:flex",
              collapsed ? "right-[-48px]" : "right-[-17px]",
            )}
            aria-label={collapsed ? "Expand dashboard sidebar" : "Collapse dashboard sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight size={22} strokeWidth={2.5} /> : <ChevronLeft size={22} strokeWidth={2.5} />}
          </button>
        </div>

        <nav className="mt-7 min-h-0 flex-1 space-y-1 overflow-y-auto">
          {allowedNav.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                title={collapsed ? item.label : undefined}
                className={cn(
                  "flex items-center rounded-xl py-2.5 text-sm text-[var(--avad-text)] transition",
                  collapsed ? "justify-center px-2" : "gap-2 px-3",
                  active
                    ? "bg-[var(--avad-bg-elevated)] font-semibold text-[var(--avad-text-strong)] shadow-sm"
                    : "hover:bg-[var(--avad-bg-elevated)]",
                )}
              >
                {item.customIcon ? (
                  <Image src={item.customIcon} alt="" width={16} height={16} className="h-4 w-4 shrink-0" />
                ) : Icon ? <Icon size={16} /> : null}
                <span className={cn("flex-1", collapsed && "sr-only")}>{item.label}</span>
                {!collapsed && item.href === "/dashboard/notifications" && notificationsUnread > 0 ? (
                  <span className="min-w-5 rounded-full bg-[#ef2b13] px-1.5 text-center text-[10px] font-semibold text-white">
                    {notificationsUnread > 99 ? "99+" : notificationsUnread}
                  </span>
                ) : null}
                {!collapsed && item.href === "/dashboard/contacts" && contactsUnread > 0 ? (
                  <span className="min-w-5 rounded-full bg-[#ef2b13] px-1.5 text-center text-[10px] font-semibold text-white">
                    {contactsUnread > 99 ? "99+" : contactsUnread}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        <button
          onClick={() => setConfirmSignOut(true)}
          title={collapsed ? "Sign Out" : undefined}
          className={cn(
            "mt-8 inline-flex w-full shrink-0 items-center rounded-xl py-2.5 text-sm text-[var(--avad-text)] transition hover:bg-[var(--avad-bg-elevated)]",
            collapsed ? "justify-center px-2" : "gap-2 px-3",
          )}
        >
          <Image src="/icons/signout.svg" alt="" width={16} height={16} className="h-4 w-4 shrink-0" />
          <span className={cn(collapsed && "sr-only")}>Sign Out</span>
        </button>
      </aside>

      <div className={cn("min-w-0 transition-[padding]", collapsed ? "lg:pl-[76px]" : "lg:pl-[250px]")}>
        <header className="sticky top-0 z-20 flex h-[74px] shrink-0 items-center justify-end gap-3 border-b border-[var(--avad-border)] bg-[var(--avad-bg-soft)]/95 px-5 backdrop-blur lg:px-8">
          <NotificationBell viewAllHref="/dashboard/notifications" />
          <ThemeToggle />
          <div className="flex items-center gap-2 rounded-full border border-[var(--avad-border)] bg-[var(--avad-bg-elevated)] px-3 py-1.5 text-xs text-[var(--avad-text-soft)]">
            {user?.role ?? "Loading..."}
          </div>
        </header>

        <main className="min-w-0 overflow-x-hidden p-4 pt-20 sm:p-6 sm:pt-20 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
