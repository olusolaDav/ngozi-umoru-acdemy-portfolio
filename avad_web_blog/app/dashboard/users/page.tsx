"use client";

import { Search, UserPlus } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { ActionMenu } from "@/components/ui/action-menu";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { Button } from "@/components/ui/button";
import { professionalErrorMessage } from "@/lib/error-messages";
import { getJson, patchJson, postJson } from "@/lib/http";
import { cn } from "@/lib/utils";

type UserRow = {
  id: string;
  fullName: string;
  email: string;
  role: "ADMIN" | "MODERATOR" | "BLOGGER" | "MEMBER";
  isActive: boolean;
  disabledAt?: string | null;
  mustChangePassword: boolean;
  createdAt: string;
};

type UserResponse = {
  items: UserRow[];
  total: number;
};

type SessionUser = {
  id: string;
  role: "ADMIN" | "MODERATOR" | "BLOGGER" | "MEMBER";
};

type ActionResponse = {
  message: string;
};

type ConfirmationIntent =
  | {
      type: "toggle-status";
      user: UserRow;
    }
  | {
      type: "delete-user";
      user: UserRow;
    }
  | null;

export default function DashboardUsersPage() {
  const PAGE_SIZE_OPTIONS = [10, 20, 30, 50, 100];
  const [users, setUsers] = useState<UserRow[]>([]);
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"ALL" | UserRow["role"]>("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "DISABLED">("ALL");
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);
  const [page, setPage] = useState(1);
  const [confirmationIntent, setConfirmationIntent] = useState<ConfirmationIntent>(null);

  const canManageUsers = sessionUser?.role === "ADMIN";

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const [usersResponse, sessionResponse] = await Promise.all([
        getJson<UserResponse>("/api/users"),
        getJson<SessionUser>("/api/auth/session"),
      ]);

      setUsers(usersResponse.items);
      setSessionUser(sessionResponse);
    } catch (caught) {
      toast.error(professionalErrorMessage(caught, "Unable to load users. Please try again."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadUsers();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadUsers]);

  async function onResendInvite(user: UserRow) {
    if (!user.mustChangePassword) {
      toast.info("This user has already completed onboarding.");
      return;
    }

    setBusyId(user.id);
    setOpenMenuId(null);
    const loadingToast = toast.loading("Resending onboarding email...");

    try {
      const response = await postJson<ActionResponse>(`/api/users/${user.id}/resend-invite`, {});
      toast.dismiss(loadingToast);
      toast.success(response.message);
      await loadUsers();
    } catch (caught) {
      toast.dismiss(loadingToast);
      toast.error(professionalErrorMessage(caught, "Unable to resend onboarding email. Please try again."));
    } finally {
      setBusyId(null);
    }
  }

  async function onToggleStatus(user: UserRow) {
    setConfirmationIntent({ type: "toggle-status", user });
  }

  async function executeToggleStatus(user: UserRow) {

    setBusyId(user.id);
    setOpenMenuId(null);
    setConfirmationIntent(null);
    const loadingToast = toast.loading(`${user.isActive ? "Disabling" : "Enabling"} user...`);

    try {
      const response = await patchJson<ActionResponse>(`/api/users/${user.id}/status`, {});
      toast.dismiss(loadingToast);
      toast.success(response.message);
      await loadUsers();
    } catch (caught) {
      toast.dismiss(loadingToast);
      toast.error(professionalErrorMessage(caught, "Unable to update user status. Please try again."));
    } finally {
      setBusyId(null);
    }
  }

  async function onDeleteUser(user: UserRow) {
    setConfirmationIntent({ type: "delete-user", user });
  }

  async function executeDeleteUser(user: UserRow) {

    setBusyId(user.id);
    setOpenMenuId(null);
    setConfirmationIntent(null);
    const loadingToast = toast.loading("Deleting user...");

    try {
      const response = await fetch(`/api/users/${user.id}`, { method: "DELETE" });
      const payload = (await response.json().catch(() => null)) as { message?: string } | null;

      if (!response.ok) {
        throw new Error(payload?.message ?? "Unable to delete user. Please try again.");
      }

      toast.dismiss(loadingToast);
      toast.success(payload?.message ?? "User deleted successfully.");
      await loadUsers();
    } catch (caught) {
      toast.dismiss(loadingToast);
      toast.error(professionalErrorMessage(caught, "Unable to delete user. Please try again."));
    } finally {
      setBusyId(null);
    }
  }

  const filteredUsers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return users.filter((user) => {
      const matchesQuery = !query
        || user.fullName.toLowerCase().includes(query)
        || user.email.toLowerCase().includes(query);

      const matchesRole = roleFilter === "ALL" || user.role === roleFilter;
      const matchesStatus =
        statusFilter === "ALL"
          || (statusFilter === "ACTIVE" && user.isActive)
          || (statusFilter === "DISABLED" && !user.isActive);

      return matchesQuery && matchesRole && matchesStatus;
    });
  }, [roleFilter, searchQuery, statusFilter, users]);

  const pageCount = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const pageItems = filteredUsers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  function roleBadge(role: UserRow["role"]) {
    const styles: Record<UserRow["role"], string> = {
      ADMIN: "bg-[#efe5ff] text-[#4b2b7d]",
      MODERATOR: "bg-[#e4f0ff] text-[#1e4f9c]",
      BLOGGER: "bg-[#fff2dd] text-[#9a5a00]",
      MEMBER: "bg-[#eaf8ef] text-[#1f7a45]",
    };

    return (
      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${styles[role]}`}>
        {role}
      </span>
    );
  }

  return (
    <>
      <ConfirmationModal
        open={Boolean(confirmationIntent)}
        loading={busyId === confirmationIntent?.user.id}
        title={
          confirmationIntent?.type === "toggle-status"
            ? confirmationIntent.user.isActive
              ? "Disable User"
              : "Enable User"
            : "Delete User"
        }
        description={
          confirmationIntent?.type === "toggle-status"
            ? confirmationIntent.user.isActive
              ? `Disable ${confirmationIntent.user.fullName}? They will not be able to sign in until re-enabled.`
              : `Enable ${confirmationIntent.user.fullName}? They will regain access immediately.`
            : `Delete ${confirmationIntent?.user.fullName ?? "this user"}? This action cannot be undone.`
        }
        confirmLabel={
          confirmationIntent?.type === "toggle-status"
            ? confirmationIntent.user.isActive
              ? "Disable"
              : "Enable"
            : "Delete"
        }
        destructive={confirmationIntent?.type === "delete-user"}
        onCancel={() => setConfirmationIntent(null)}
        onConfirm={() => {
          if (!confirmationIntent) {
            return;
          }

          if (confirmationIntent.type === "toggle-status") {
            void executeToggleStatus(confirmationIntent.user);
            return;
          }

          void executeDeleteUser(confirmationIntent.user);
        }}
      />

      <section className="space-y-5 rounded-3xl border border-[var(--avad-border)] bg-[var(--avad-bg-elevated)] p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl text-[var(--avad-text-strong)]">Users</h1>
          <p className="mt-2 text-sm text-[var(--avad-text-soft)]">Manage platform users and monitor access roles.</p>
        </div>

        {canManageUsers ? (
          <Link href="/dashboard/users/invite">
            <Button className="h-11 gap-2 px-5">
              <UserPlus size={16} />
              Add User
            </Button>
          </Link>
        ) : null}
        </div>

        <div className="grid gap-3 rounded-2xl border border-[var(--avad-border)] bg-[var(--avad-bg-soft)] p-3 md:grid-cols-[1.3fr_0.7fr_0.7fr]">
        <label className="relative block">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--avad-text-soft)]" />
          <input
            value={searchQuery}
            onChange={(event) => {
              setSearchQuery(event.target.value);
              setPage(1);
            }}
            placeholder="Search by name or email"
            className="h-11 w-full rounded-xl border border-[var(--avad-border)] bg-[var(--avad-bg-elevated)] pl-10 pr-3 text-sm text-[var(--avad-text)] outline-none focus:border-[var(--avad-ring)]"
          />
        </label>

        <select
          value={roleFilter}
          onChange={(event) => {
            setRoleFilter(event.target.value as "ALL" | UserRow["role"]);
            setPage(1);
          }}
          className="h-11 rounded-xl border border-[var(--avad-border)] bg-[var(--avad-bg-elevated)] px-3 text-sm text-[var(--avad-text)] outline-none focus:border-[var(--avad-ring)]"
        >
          <option value="ALL">All Roles</option>
          <option value="ADMIN">Admin</option>
          <option value="MODERATOR">Moderator</option>
          <option value="BLOGGER">Blogger</option>
          <option value="MEMBER">Member</option>
        </select>

        <select
          value={statusFilter}
          onChange={(event) => {
            setStatusFilter(event.target.value as "ALL" | "ACTIVE" | "DISABLED");
            setPage(1);
          }}
          className="h-11 rounded-xl border border-[var(--avad-border)] bg-[var(--avad-bg-elevated)] px-3 text-sm text-[var(--avad-text)] outline-none focus:border-[var(--avad-ring)]"
        >
          <option value="ALL">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="DISABLED">Disabled</option>
        </select>
        </div>

        <div className="max-w-full overflow-x-auto rounded-2xl" tabIndex={0} aria-label="Users table. Swipe horizontally to view more columns.">
        <table className="w-full min-w-[860px] border-separate border-spacing-y-2">
          <thead>
            <tr className="text-left text-xs uppercase tracking-[0.06em] text-[var(--avad-text-soft)]">
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Role</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Onboarding</th>
              <th className="px-3 py-2">Created</th>
              <th className="px-3 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.map((item) => (
              <tr key={item.id} className="rounded-2xl bg-[var(--avad-bg-soft)] text-sm text-[var(--avad-text)]">
                <td className="rounded-l-2xl px-3 py-3 font-medium">{item.fullName}</td>
                <td className="px-3 py-3">{item.email}</td>
                <td className="px-3 py-3">{roleBadge(item.role)}</td>
                <td className="px-3 py-3">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                      item.isActive ? "bg-[#eaf8ef] text-[#1f7a45]" : "bg-[#fdecec] text-[#b42318]"
                    }`}
                  >
                    {item.isActive ? "ACTIVE" : "DISABLED"}
                  </span>
                </td>
                <td className="px-3 py-3">{item.mustChangePassword ? "Pending" : "Complete"}</td>
                <td className="px-3 py-3">{new Date(item.createdAt).toLocaleDateString()}</td>
                <td className={cn("relative rounded-r-2xl px-3 py-3 text-right", openMenuId === item.id && "z-30")}>
                  {canManageUsers ? (
                    <>
                      <ActionMenu
                        open={openMenuId === item.id}
                        onToggle={() => setOpenMenuId((current) => (current === item.id ? null : item.id))}
                        triggerLabel="Open user actions"
                        triggerClassName="rounded-lg border border-[var(--avad-border)] bg-[var(--avad-bg-elevated)] text-[var(--avad-text)] hover:bg-[var(--avad-bg-soft)]"
                        menuClassName="right-3 top-12 w-44 rounded-xl p-1"
                      >
                        {item.mustChangePassword ? (
                          <button
                            type="button"
                            className="w-full rounded-lg px-3 py-2 text-left text-sm text-[var(--avad-text)] hover:bg-[var(--avad-bg-soft)]"
                            onClick={() => void onResendInvite(item)}
                          >
                            Resend Mail
                          </button>
                        ) : null}
                        <button
                          type="button"
                          className="w-full rounded-lg px-3 py-2 text-left text-sm text-[var(--avad-text)] hover:bg-[var(--avad-bg-soft)]"
                          onClick={() => void onToggleStatus(item)}
                        >
                          {item.isActive ? "Disable User" : "Enable User"}
                        </button>
                        <button
                          type="button"
                          className="w-full rounded-lg px-3 py-2 text-left text-sm text-[#b42318] hover:bg-[#fff1f1]"
                          onClick={() => void onDeleteUser(item)}
                        >
                          Delete User
                        </button>
                      </ActionMenu>
                    </>
                  ) : (
                    <span className="text-xs text-[var(--avad-text-soft)]">No actions</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {loading ? <p className="mt-3 text-sm text-[var(--avad-text-soft)]">Loading users...</p> : null}
        {!loading && filteredUsers.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--avad-text-soft)]">No users found for the selected filters.</p>
        ) : null}

        {!loading && filteredUsers.length > 0 ? (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-[var(--avad-text-soft)]">
            <p>
              Showing {(currentPage - 1) * pageSize + 1}-
              {Math.min(currentPage * pageSize, filteredUsers.length)} of {filteredUsers.length}
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-2 text-xs">
                Per page
                <select
                  value={pageSize}
                  onChange={(event) => {
                    setPageSize(Number(event.target.value));
                    setPage(1);
                  }}
                  className="rounded-full border border-[var(--avad-border)] bg-[var(--avad-bg-elevated)] px-3 py-1 text-xs text-[var(--avad-text)]"
                >
                  {PAGE_SIZE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={currentPage === 1}>
                Prev
              </Button>
              <span className="text-xs font-semibold text-[var(--avad-text)]">{currentPage} / {pageCount}</span>
              <Button size="sm" variant="ghost" onClick={() => setPage((value) => Math.min(pageCount, value + 1))} disabled={currentPage === pageCount}>
                Next
              </Button>
              </div>
            </div>
          </div>
        ) : null}
        </div>
      </section>
    </>
  );
}
