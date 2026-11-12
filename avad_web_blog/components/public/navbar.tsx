"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { BrandLogo } from "@/components/public/brand-logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { useNotificationUnreadCount } from "@/lib/notification-queries";
import { navItems } from "@/lib/content";
import { buttonVariants } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

type SessionUser = {
  id: string;
  fullName: string;
  email: string;
  role: "ADMIN" | "MODERATOR" | "BLOGGER" | "MEMBER";
};

function initialsFromName(fullName: string) {
  return fullName
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase())
    .slice(0, 2)
    .join("") || "U";
}

export function PublicNavbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const { data: notificationsUnread = 0 } = useNotificationUnreadCount(Boolean(user));

  useEffect(() => {
    let active = true;

    async function loadSession() {
      try {
        const response = await fetch("/api/auth/session", { cache: "no-store" });
        if (!active) {
          return;
        }

        if (!response.ok) {
          setUser(null);
          return;
        }

        const payload = (await response.json()) as SessionUser;
        setUser(payload);
      } catch {
        if (active) {
          setUser(null);
        }
      }
    }

    void loadSession();

    return () => {
      active = false;
    };
  }, [pathname]);

  useEffect(() => {
    function onOutsideClick(event: MouseEvent) {
      if (!menuRef.current) {
        return;
      }

      if (!menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    if (menuOpen) {
      window.addEventListener("mousedown", onOutsideClick);
    }

    return () => {
      window.removeEventListener("mousedown", onOutsideClick);
    };
  }, [menuOpen]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setMenuOpen(false);
    setMobileOpen(false);
    setUser(null);
    router.push("/auth/sign-in");
  }

  return (
    <header className="fixed inset-x-0 top-9 z-50 border-b border-[var(--avad-border)] bg-[var(--avad-bg-soft)]/95 text-[var(--avad-text)] backdrop-blur">
      <div className="mx-auto flex h-[76px] w-full max-w-[1320px] items-center justify-between px-4 md:px-6 lg:px-8 xl:px-10">
        <BrandLogo compact />

        <nav className="hidden items-center gap-6 lg:flex">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "cursor-pointer text-xs text-[var(--avad-text-soft)] transition-colors hover:text-[var(--avad-text)]",
                  active && "border-b-2 border-[var(--avad-border)] pb-1 font-semibold text-[var(--avad-text-strong)]",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <ThemeToggle />
          {user ? (
            <>
              <NotificationBell viewAllHref={user.role === "MEMBER" ? "/notifications" : "/dashboard/notifications"} />
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setMenuOpen((value) => !value)}
                  className="cursor-pointer"
                  aria-label="Open user menu"
                  aria-expanded={menuOpen}
                >
                  <Avatar className="size-10 border border-[var(--avad-border)] bg-[var(--avad-bg-elevated)] shadow-sm">
                    <AvatarFallback className="text-xs font-semibold text-[var(--avad-text-strong)]">{initialsFromName(user.fullName)}</AvatarFallback>
                  </Avatar>
                </button>

                {menuOpen ? (
                  <div className="absolute right-0 z-40 mt-2 w-44 rounded-xl border border-[var(--avad-border)] bg-[var(--avad-bg-elevated)] p-1.5 shadow-xl">
                    <Link
                      href={user.role === "MEMBER" ? "/community" : "/dashboard"}
                      onClick={() => setMenuOpen(false)}
                      className="block rounded-lg px-3 py-2 text-sm text-[var(--avad-text)] transition-colors hover:bg-[var(--avad-bg-soft)]"
                    >
                      {user.role === "MEMBER" ? "Community" : "Dashboard"}
                    </Link>
                    <Link
                      href={user.role === "MEMBER" ? "/notifications" : "/dashboard/notifications"}
                      onClick={() => setMenuOpen(false)}
                      className="block rounded-lg px-3 py-2 text-sm text-[var(--avad-text)] transition-colors hover:bg-[var(--avad-bg-soft)]"
                    >
                      <span className="flex items-center justify-between gap-3">
                        Notifications
                        {notificationsUnread > 0 ? (
                          <span className="rounded-full bg-[#ef2b13] px-1.5 text-[10px] font-semibold text-white">
                            {notificationsUnread > 99 ? "99+" : notificationsUnread}
                          </span>
                        ) : null}
                      </span>
                    </Link>
                    {user.role === "MEMBER" ? (
                      <>
                        <Link
                          href="/profile"
                          onClick={() => setMenuOpen(false)}
                          className="block rounded-lg px-3 py-2 text-sm text-[var(--avad-text)] transition-colors hover:bg-[var(--avad-bg-soft)]"
                        >
                          Profile
                        </Link>
                        <Link
                          href="/settings"
                          onClick={() => setMenuOpen(false)}
                          className="block rounded-lg px-3 py-2 text-sm text-[var(--avad-text)] transition-colors hover:bg-[var(--avad-bg-soft)]"
                        >
                          Settings
                        </Link>
                      </>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => void logout()}
                      className="mt-1 block w-full cursor-pointer rounded-lg px-3 py-2 text-left text-sm text-[var(--avad-text)] transition-colors hover:bg-[var(--avad-bg-soft)]"
                    >
                      Logout
                    </button>
                  </div>
                ) : null}
              </div>
            </>
          ) : (
            <>
              <Link href="/auth/sign-in?next=%2Fcommunity" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "h-9 rounded-xl px-6 text-xs")}>
                Login
              </Link>
              <Link href="/auth/sign-up?next=%2Fcommunity" className={cn(buttonVariants({ variant: "default", size: "sm" }), "h-9 rounded-xl px-8 text-xs")}>
                Join Member
              </Link>
            </>
          )}
        </div>

        <button
          onClick={() => setMobileOpen((prev) => !prev)}
          className="grid size-9 place-items-center rounded-lg border border-[var(--avad-border)] bg-[var(--avad-bg-elevated)] lg:hidden"
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {mobileOpen ? (
        <div className="border-t border-[var(--avad-border)] bg-[var(--avad-bg-soft)] lg:hidden">
          <nav className="mx-auto flex w-full max-w-[1320px] flex-col gap-2 px-4 py-4 md:px-6 lg:px-8 xl:px-10">
            <div className="mb-1 flex justify-end">
              <ThemeToggle />
            </div>
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "cursor-pointer rounded-md px-2 py-2 text-sm text-[var(--avad-text)]",
                    active && "bg-[var(--avad-bg-elevated)] font-semibold text-[var(--avad-text-strong)]",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
            {user ? (
              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-2 rounded-xl border border-[var(--avad-border)] bg-[var(--avad-bg-elevated)] px-3 py-2">
                  <Avatar className="size-8 border border-[var(--avad-border)]">
                    <AvatarFallback className="text-[11px] font-semibold text-[var(--avad-text-strong)]">{initialsFromName(user.fullName)}</AvatarFallback>
                  </Avatar>
                  <p className="min-w-0 flex-1 break-words text-xs text-[var(--avad-text-soft)] [overflow-wrap:anywhere]">{user.fullName}</p>
                </div>
                <Link
                  href={user.role === "MEMBER" ? "/community" : "/dashboard"}
                  onClick={() => setMobileOpen(false)}
                  className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "h-9 w-full rounded-xl text-xs")}
                >
                  {user.role === "MEMBER" ? "Community" : "Dashboard"}
                </Link>
                <Link
                  href={user.role === "MEMBER" ? "/notifications" : "/dashboard/notifications"}
                  onClick={() => setMobileOpen(false)}
                  className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "h-9 w-full rounded-xl text-xs")}
                >
                  <span className="flex items-center justify-between gap-3">
                    Notifications
                    {notificationsUnread > 0 ? (
                      <span className="rounded-full bg-[#ef2b13] px-1.5 text-[10px] font-semibold text-white">
                        {notificationsUnread > 99 ? "99+" : notificationsUnread}
                      </span>
                    ) : null}
                  </span>
                </Link>
                {user.role === "MEMBER" ? (
                  <>
                    <Link
                      href="/profile"
                      onClick={() => setMobileOpen(false)}
                      className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "h-9 w-full rounded-xl text-xs")}
                    >
                      Profile
                    </Link>
                    <Link
                      href="/settings"
                      onClick={() => setMobileOpen(false)}
                      className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "h-9 w-full rounded-xl text-xs")}
                    >
                      Settings
                    </Link>
                  </>
                ) : null}
                <button
                  type="button"
                  onClick={() => void logout()}
                  className={cn(buttonVariants({ variant: "default", size: "sm" }), "h-9 w-full rounded-xl text-xs")}
                >
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link
                  href="/auth/sign-in?next=%2Fcommunity"
                  onClick={() => setMobileOpen(false)}
                  className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "mt-2 h-9 w-full rounded-xl text-xs")}
                >
                  Login
                </Link>
                <Link
                  href="/auth/sign-up?next=%2Fcommunity"
                  onClick={() => setMobileOpen(false)}
                  className={cn(buttonVariants({ variant: "default", size: "sm" }), "mt-2 h-9 w-full rounded-xl text-xs")}
                >
                  Join Member
                </Link>
              </>
            )}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
