"use client";

import {
  Eye,
  Mail,
  MailCheck,
  MailOpen,
  RefreshCw,
  Reply,
  Search,
  Trash2,
  X,
} from "lucide-react";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { WritingLanguageControl } from "@/components/writing-assistance-provider";
import { WritingSuggestions } from "@/components/writing-suggestions";
import { useConfirmationDialog } from "@/components/ui/confirmation-dialog-provider";
import { professionalErrorMessage } from "@/lib/error-messages";
import { deleteJson, getJson, patchJson, postJson } from "@/lib/http";
import { labelRichEditorToolbar } from "@/lib/rich-editor-toolbar";
import {
  buildMailtoReplyLink,
  formatContactDateTime,
  statusPillClasses,
  type ContactMessageDetail,
  type ContactMessageStatus,
  type ContactMessageSummary,
  type ContactMessagesResponse,
} from "@/lib/contact";

import "react-quill-new/dist/quill.snow.css";

const ReactQuillEditor = dynamic(() => import("react-quill-new"), { ssr: false });

type StatusFilter = "ALL" | ContactMessageStatus;

type ContactStatusAction = "MARK_READ" | "MARK_UNREAD";

type ContactActionResponse = {
  message?: string;
  contactMessage: {
    status: ContactMessageStatus;
    readAt: string | null;
    repliedAt: string | null;
  };
};

type ContactDeleteResponse = {
  message?: string;
  deleted: boolean;
};

type ContactReplyResponse = {
  message?: string;
};

const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["blockquote", "link"],
    ["clean"],
  ],
};

const quillFormats = ["header", "bold", "italic", "underline", "strike", "list", "bullet", "blockquote", "link"];

export default function DashboardContactsPage() {
  const confirmation = useConfirmationDialog();
  const [messages, setMessages] = useState<ContactMessageSummary[]>([]);
  const [stats, setStats] = useState({ total: 0, unread: 0, read: 0, replied: 0 });
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [detailLoading, setDetailLoading] = useState(false);
  const [activeMessage, setActiveMessage] = useState<ContactMessageDetail | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const [composerOpen, setComposerOpen] = useState(false);
  const [composerSubject, setComposerSubject] = useState("");
  const [composerBody, setComposerBody] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const composerRef = useRef<HTMLDivElement | null>(null);
  const composerStickyRef = useRef<HTMLDivElement | null>(null);

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const isTransientLoadError = useCallback((error: unknown) => {
    if (!(error instanceof Error)) {
      return false;
    }

    const message = error.message.toLowerCase();
    return (
      message.includes("unauthorized") ||
      message.includes("401") ||
      message.includes("request failed") ||
      message.includes("failed to fetch") ||
      message.includes("network") ||
      message.includes("unexpected api response")
    );
  }, []);

  const delay = useCallback((ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms)), []);

  const broadcastUnreadContacts = useCallback((unread: number) => {
    if (typeof window === "undefined") {
      return;
    }

    window.dispatchEvent(new CustomEvent("contacts-unread-count-updated", { detail: { unread } }));
  }, []);

  const loadMessages = useCallback(
    async (nextPage: number, nextStatus = statusFilter, nextSearch = search) => {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(nextPage),
        limit: String(pagination.limit),
      });

      const trimmedSearch = nextSearch.trim();
      if (trimmedSearch) {
        params.set("search", trimmedSearch);
      }

      if (nextStatus !== "ALL") {
        params.set("status", nextStatus);
      }

      const maxAttempts = 3;

      for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
        try {
          const payload = await getJson<ContactMessagesResponse>(`/api/dashboard/contacts?${params.toString()}`);
          setMessages(payload.items);
          setStats(payload.stats);
          setPagination(payload.pagination);
          setSelectedIds([]);
          broadcastUnreadContacts(payload.stats.unread);
          setLoading(false);
          return;
        } catch (error) {
          const shouldRetry = attempt < maxAttempts && isTransientLoadError(error);
          if (shouldRetry) {
            await delay(250 * attempt);
            continue;
          }

          toast.error(professionalErrorMessage(error, "Unable to load contact submissions right now."));
          setLoading(false);
          return;
        }
      }

      setLoading(false);
    },
    [broadcastUnreadContacts, delay, isTransientLoadError, pagination.limit, search, statusFilter],
  );

  useEffect(() => {
    queueMicrotask(() => void loadMessages(1, statusFilter, search));
  }, [loadMessages, search, statusFilter]);

  useEffect(() => {
    if (!composerOpen) {
      return;
    }

    const timer = window.setTimeout(() => {
      const toolbar = composerRef.current?.querySelector<HTMLElement>(".ql-toolbar");
      if (toolbar) {
        labelRichEditorToolbar(toolbar);
      }
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [composerOpen]);

  useEffect(() => {
    if (!composerOpen) {
      return;
    }

    const timer = window.setTimeout(() => {
      const target = composerRef.current;
      if (!target) {
        return;
      }

      const scrollContainer = target.closest(".contact-modal-scroll");
      if (scrollContainer instanceof HTMLElement) {
        const offsetTop = target.offsetTop;
        scrollContainer.scrollTo({ top: Math.max(0, offsetTop), behavior: "smooth" });
        return;
      }

      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);

    return () => {
      window.clearTimeout(timer);
    };
  }, [composerOpen]);

  useEffect(() => {
    if (!composerOpen) {
      return;
    }

    const wrapper = composerRef.current;
    const sticky = composerStickyRef.current;
    if (!wrapper || !sticky) {
      return;
    }

    const syncOffset = () => {
      const height = sticky.offsetHeight;
      wrapper.style.setProperty("--contact-composer-sticky-offset", `${Math.max(56, height)}px`);
    };

    syncOffset();
    window.addEventListener("resize", syncOffset);
    return () => {
      window.removeEventListener("resize", syncOffset);
    };
  }, [composerOpen]);

  async function refresh() {
    await loadMessages(pagination.page, statusFilter, search);
  }

  function toggleSelectAll(checked: boolean) {
    if (!checked) {
      setSelectedIds([]);
      return;
    }

    setSelectedIds(messages.map((item) => item.id));
  }

  function toggleSelectOne(id: string, checked: boolean) {
    setSelectedIds((current) => {
      if (checked) {
        return Array.from(new Set([...current, id]));
      }

      return current.filter((value) => value !== id);
    });
  }

  async function updateStatus(messageId: string, action: ContactStatusAction, silent = false) {
    try {
      const response = await patchJson<ContactActionResponse>(`/api/dashboard/contacts/${messageId}/status`, { action });
      const updated = response.contactMessage;

      setActiveMessage((current) => {
        if (!current || current.id !== messageId) {
          return current;
        }

        return {
          ...current,
          status: updated.status,
          readAt: updated.readAt,
          repliedAt: updated.repliedAt,
        };
      });

      if (!silent) {
        toast.success(response.message ?? (action === "MARK_UNREAD" ? "Marked as unread." : "Marked as read."));
      }
      await loadMessages(pagination.page, statusFilter, search);
    } catch (error) {
      if (!silent) {
        toast.error(professionalErrorMessage(error, "Unable to update message status right now."));
      }
    }
  }

  async function openMessageDetail(messageId: string) {
    setModalOpen(true);
    setDetailLoading(true);

    try {
      const detail = await getJson<ContactMessageDetail>(`/api/dashboard/contacts/${messageId}`);
      setActiveMessage(detail);

      if (detail.status === "UNREAD") {
        await updateStatus(detail.id, "MARK_READ", true);
        setActiveMessage({
          ...detail,
          status: "READ",
          readAt: detail.readAt ?? new Date().toISOString(),
        });
      }
    } catch (error) {
      setModalOpen(false);
      toast.error(professionalErrorMessage(error, "Unable to open this contact message right now."));
    } finally {
      setDetailLoading(false);
    }
  }

  function closeModal() {
    setModalOpen(false);
    setActiveMessage(null);
    setComposerOpen(false);
    setComposerSubject("");
    setComposerBody("");
  }

  async function deleteMessage(messageId: string) {
    const confirmed = await confirmation.confirm({
      title: "Delete contact message?",
      description: "This contact submission and reply history will be permanently deleted.",
      confirmLabel: "Delete",
      destructive: true,
    });

    if (!confirmed) {
      return;
    }

    try {
      const response = await deleteJson<ContactDeleteResponse>(`/api/dashboard/contacts/${messageId}`);
      toast.success(response.message ?? "Message deleted.");
      if (activeMessage?.id === messageId) {
        closeModal();
      }
      await loadMessages(pagination.page, statusFilter, search);
    } catch (error) {
      toast.error(professionalErrorMessage(error, "Unable to delete message right now."));
    }
  }

  async function deleteSelected() {
    if (!selectedIds.length) {
      return;
    }

    const confirmed = await confirmation.confirm({
      title: "Delete selected messages?",
      description: "Selected contact submissions will be permanently deleted.",
      confirmLabel: "Delete All",
      destructive: true,
    });

    if (!confirmed) {
      return;
    }

    try {
      const results = await Promise.all(
        selectedIds.map((id) => deleteJson<ContactDeleteResponse>(`/api/dashboard/contacts/${id}`)),
      );
      const firstMessage = results[0]?.message;
      toast.success(firstMessage ? `${firstMessage} (${results.length} items)` : "Selected messages deleted.");
      await loadMessages(pagination.page, statusFilter, search);
    } catch (error) {
      toast.error(professionalErrorMessage(error, "Unable to delete selected messages right now."));
    }
  }

  function openComposer() {
    if (!activeMessage) {
      return;
    }

    setComposerSubject(`Re: ${activeMessage.subject}`);
    setComposerBody("");
    setComposerOpen(true);
  }

  async function sendReply() {
    if (!activeMessage) {
      return;
    }

    setSendingReply(true);

    try {
      const response = await postJson<ContactReplyResponse>(`/api/dashboard/contacts/${activeMessage.id}/reply`, {
        subject: composerSubject.trim(),
        bodyHtml: composerBody,
      });

      toast.success(response.message ?? "Reply sent successfully.");
      setComposerOpen(false);
      setComposerBody("");

      const refreshedDetail = await getJson<ContactMessageDetail>(`/api/dashboard/contacts/${activeMessage.id}`);
      setActiveMessage(refreshedDetail);
      await loadMessages(pagination.page, statusFilter, search);
    } catch (error) {
      toast.error(professionalErrorMessage(error, "Unable to send reply right now."));
    } finally {
      setSendingReply(false);
    }
  }

  const allSelected = messages.length > 0 && selectedIds.length === messages.length;

  return (
    <>
      <section className="space-y-6 rounded-3xl border border-[var(--avad-border)] bg-[var(--avad-bg-elevated)] p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-serif text-4xl text-[var(--avad-text-strong)]">Contact Submissions</h1>
            <p className="mt-1 text-sm text-[var(--avad-text-soft)]">Manage and respond to messages sent from the homepage contact form.</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            className="gap-2 border border-[var(--avad-border)] bg-[var(--avad-bg-elevated)]"
            onClick={() => void refresh()}
          >
            <RefreshCw size={15} />
            Refresh
          </Button>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Total Messages" value={stats.total} icon={Mail} iconClassName="bg-[#eef4ff] text-[#2756a8]" />
          <StatCard title="Unread" value={stats.unread} icon={MailOpen} iconClassName="bg-[#fdecec] text-[#b42318]" />
          <StatCard title="Read" value={stats.read} icon={MailCheck} iconClassName="bg-[#eef3ff] text-[#1f4d99]" />
          <StatCard title="Replied" value={stats.replied} icon={Reply} iconClassName="bg-[#e8f5ea] text-[#0f7b44]" />
        </div>

        <div className="grid gap-3 md:grid-cols-[1.4fr_0.8fr_auto]">
          <label className="relative block">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--avad-text-soft)]" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name, email or message"
              className="h-11 w-full rounded-xl border border-[var(--avad-border)] bg-[var(--avad-bg-elevated)] pl-10 pr-3 text-sm text-[var(--avad-text)] outline-none focus:border-[var(--avad-ring)]"
            />
          </label>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
            className="h-11 rounded-xl border border-[var(--avad-border)] bg-[var(--avad-bg-elevated)] px-3 text-sm text-[var(--avad-text)] outline-none focus:border-[var(--avad-ring)]"
          >
            <option value="ALL">All Status</option>
            <option value="UNREAD">Unread</option>
            <option value="READ">Read</option>
            <option value="REPLIED">Replied</option>
          </select>

          <Button
            type="button"
            variant="ghost"
            className="border border-[var(--avad-border)] bg-[var(--avad-bg-elevated)]"
            onClick={() => void loadMessages(1, statusFilter, search)}
          >
            Apply
          </Button>
        </div>

        <div className="max-w-full overflow-x-auto rounded-2xl" tabIndex={0} aria-label="Contacts table. Swipe horizontally to view more columns.">
          <table className="w-full min-w-[980px] border-collapse">
            <thead>
              <tr className="border-b border-[var(--avad-border)] text-left text-xs uppercase tracking-[0.06em] text-[var(--avad-text-soft)]">
                <th className="px-3 py-3">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={(event) => toggleSelectAll(event.target.checked)}
                    className="h-4 w-4 accent-[var(--avad-ring)]"
                  />
                </th>
                <th className="px-3 py-3">Sender</th>
                <th className="px-3 py-3">Email</th>
                <th className="px-3 py-3">Subject</th>
                <th className="px-3 py-3">Message Preview</th>
                <th className="px-3 py-3">Received</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {messages.map((item) => {
                const isUnread = item.status === "UNREAD";

                return (
                <tr
                  key={item.id}
                  onClick={() => void openMessageDetail(item.id)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      void openMessageDetail(item.id);
                    }
                  }}
                  tabIndex={0}
                  className={`border-b border-[var(--avad-border)] text-sm transition hover:bg-[var(--avad-bg-soft)] cursor-pointer ${
                    isUnread ? "font-semibold text-[var(--avad-text-strong)]" : "text-[var(--avad-text)]"
                  }`}
                >
                  <td className="px-3 py-3">
                    <input
                      type="checkbox"
                      checked={selectedSet.has(item.id)}
                      onChange={(event) => toggleSelectOne(item.id, event.target.checked)}
                      onClick={(event) => event.stopPropagation()}
                      className="h-4 w-4 accent-[var(--avad-ring)]"
                    />
                  </td>
                  <td className="px-3 py-3 font-medium">{item.name}</td>
                  <td className={`px-3 py-3 ${isUnread ? "text-[var(--avad-text-strong)]" : "text-[var(--avad-text-soft)]"}`}>{item.email}</td>
                  <td className="px-3 py-3">{item.subject}</td>
                  <td className={`px-3 py-3 ${isUnread ? "text-[var(--avad-text)]" : "text-[var(--avad-text-soft)]"}`}>{item.messagePreview}</td>
                  <td className={`px-3 py-3 ${isUnread ? "text-[var(--avad-text)]" : "text-[var(--avad-text-soft)]"}`}>{formatContactDateTime(item.createdAt)}</td>
                  <td className="px-3 py-3">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusPillClasses(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          void openMessageDetail(item.id);
                        }}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--avad-border)] text-[var(--avad-text-soft)] transition hover:text-[var(--avad-text)]"
                        aria-label="View message"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          void deleteMessage(item.id);
                        }}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#f5cecb] text-[#c43e34] transition hover:bg-[#fff4f4]"
                        aria-label="Delete message"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {!messages.length && !loading ? (
          <div className="rounded-2xl border border-dashed border-[var(--avad-border)] bg-[var(--avad-bg-soft)] p-8 text-center text-sm text-[var(--avad-text-soft)]">
            No contact submissions found for your current filters.
          </div>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-[var(--avad-text-soft)]">
          <p>Showing {messages.length} message(s) of {pagination.total}</p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              className="border border-[var(--avad-border)] bg-[var(--avad-bg-elevated)]"
              disabled={pagination.page <= 1}
              onClick={() => void loadMessages(pagination.page - 1, statusFilter, search)}
            >
              Back
            </Button>
            <span>Page {pagination.page} of {pagination.totalPages}</span>
            <Button
              type="button"
              variant="ghost"
              className="border border-[var(--avad-border)] bg-[var(--avad-bg-elevated)]"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => void loadMessages(pagination.page + 1, statusFilter, search)}
            >
              Next
            </Button>
          </div>
        </div>
      </section>

      {selectedIds.length ? (
        <div className="fixed bottom-4 left-1/2 z-40 flex max-w-[calc(100vw-2rem)] -translate-x-1/2 flex-wrap items-center justify-center gap-3 rounded-2xl border border-[#2d1046] bg-[#2d1046] px-4 py-3 text-center text-sm text-white shadow-xl sm:bottom-6 sm:flex-nowrap sm:gap-4 sm:rounded-full sm:px-5">
          <span>{selectedIds.length} selected</span>
          <button type="button" onClick={() => setSelectedIds([])} className="text-xs underline underline-offset-2">
            Clear
          </button>
          <button type="button" onClick={() => void deleteSelected()} className="rounded-full bg-[#f03d2f] px-3 py-1.5 text-xs font-semibold">
            Delete All
          </button>
        </div>
      ) : null}

      {modalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-3 md:p-6">
          <section className="flex h-[95vh] max-h-[calc(100dvh-1.5rem)] w-full max-w-[860px] flex-col overflow-hidden rounded-2xl border border-[var(--avad-border)] bg-[var(--avad-bg-elevated)]">
            <header className="flex min-w-0 items-start justify-between gap-4 border-b border-[var(--avad-border)] px-4 py-4 sm:px-5">
              <div className="min-w-0 flex-1">
                <h2 className="font-serif text-3xl text-[var(--avad-text-strong)]">{activeMessage?.name || "Loading..."}</h2>
                {activeMessage ? (
                  <div className="mt-1 flex items-center gap-2 text-xs text-[var(--avad-text-soft)]">
                    <span>{activeMessage.subject}</span>
                    <span className="text-[var(--avad-border)]">|</span>
                    <span className={`inline-flex rounded-full px-2 py-0.5 font-semibold ${statusPillClasses(activeMessage.status)}`}>
                      {activeMessage.status}
                    </span>
                  </div>
                ) : null}
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--avad-border)] text-[var(--avad-text-soft)]"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </header>

            <div className="contact-modal-scroll flex-1 overflow-y-auto px-5 pb-4 pt-0">
              {detailLoading || !activeMessage ? (
                <p className="text-sm text-[var(--avad-text-soft)]">Loading message details...</p>
              ) : (
                <>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <InfoCard label="Email Address" value={activeMessage.email} />
                    <InfoCard label="Phone Number" value={activeMessage.phone || "Not provided"} />
                    <InfoCard label="Subject" value={activeMessage.subject} />
                    <InfoCard label="Received" value={formatContactDateTime(activeMessage.createdAt)} />
                  </div>

                  <div className="mt-5">
                    <p className="mb-2 text-sm font-semibold text-[var(--avad-text-soft)]">Message</p>
                    <div className="rounded-2xl border border-[var(--avad-border)] bg-[var(--avad-bg-soft)] p-4 text-sm leading-7 whitespace-pre-wrap text-[var(--avad-text)]">
                      {activeMessage.message}
                    </div>
                  </div>

                  <div className="mt-5 space-y-2">
                    <p className="text-sm font-semibold text-[var(--avad-text-soft)]">Activity</p>
                    {activeMessage.readAt ? (
                      <p className="text-sm text-[var(--avad-text-soft)]">Read on {formatContactDateTime(activeMessage.readAt)}</p>
                    ) : (
                      <p className="text-sm text-[var(--avad-text-soft)]">Not read yet.</p>
                    )}
                    {activeMessage.repliedAt ? (
                      <p className="text-sm text-[var(--avad-text-soft)]">
                        Last reply on {formatContactDateTime(activeMessage.repliedAt)}
                        {activeMessage.lastRepliedBy ? ` by ${activeMessage.lastRepliedBy.fullName}` : ""}
                      </p>
                    ) : null}
                    {activeMessage.replies.length ? (
                      <div className="mt-2 space-y-2 rounded-2xl border border-[var(--avad-border)] bg-[var(--avad-bg-soft)] p-3">
                        {activeMessage.replies.map((reply) => (
                          <article key={reply.id} className="rounded-xl bg-[var(--avad-bg-elevated)] p-3">
                            <p className="text-xs font-semibold text-[var(--avad-text-soft)]">
                              {reply.responderName} • {formatContactDateTime(reply.createdAt)}
                            </p>
                            <p className="mt-1 text-sm text-[var(--avad-text)] line-clamp-4">{reply.bodyText}</p>
                          </article>
                        ))}
                      </div>
                    ) : null}
                  </div>

                  {composerOpen ? (
                    <div ref={composerRef} className="contact-composer-wrapper mt-2 rounded-2xl border border-[var(--avad-border)] bg-[var(--avad-bg-soft)] p-4">
                      <div ref={composerStickyRef} className="contact-composer-sticky">
                        <div className="flex items-center justify-between gap-3">
                          <h3 className="font-semibold text-[var(--avad-text-strong)]">Reply to {activeMessage.name}</h3>
                          <button
                            type="button"
                            onClick={() => setComposerOpen(false)}
                            className="text-xs text-[var(--avad-text-soft)] underline underline-offset-2"
                          >
                            Discard
                          </button>
                        </div>

                        <label className="mt-3 block text-xs font-semibold uppercase tracking-wide text-[var(--avad-text-soft)]">Subject</label>
                        <input
                          data-writing-assistance
                          value={composerSubject}
                          onChange={(event) => setComposerSubject(event.target.value)}
                          className="mt-1 h-10 w-full rounded-xl border border-[var(--avad-border)] bg-[var(--avad-bg-elevated)] px-3 text-sm text-[var(--avad-text)] outline-none focus:border-[var(--avad-ring)]"
                        />
                      </div>

                      <div className="mt-3 rounded-xl border border-[var(--avad-border)] bg-[var(--avad-bg-elevated)]">
                        <div data-writing-assistance className="relative dashboard-rich-editor dashboard-rich-editor--contact">
                          <div className="flex justify-end border-b border-[var(--avad-border)] px-3 py-2"><WritingLanguageControl /></div>
                          <ReactQuillEditor
                            theme="snow"
                            value={composerBody}
                            onChange={setComposerBody}
                            modules={quillModules}
                            formats={quillFormats}
                            placeholder="Please find our response below."
                            className="min-h-[220px]"
                          />
                          <WritingSuggestions
                            text={composerBody.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()}
                            onApply={({ problem, replacement, occurrence }) => {
                              setComposerBody((current) => {
                                const matches = [...current.matchAll(new RegExp(problem.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"))];
                                const index = matches[occurrence]?.index;
                                return index === undefined ? current : `${current.slice(0, index)}${replacement}${current.slice(index + problem.length)}`;
                              });
                            }}
                          />
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-end gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          className="border border-[var(--avad-border)] bg-[var(--avad-bg-elevated)]"
                          onClick={() => setComposerOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="button" disabled={sendingReply} onClick={() => void sendReply()}>
                          {sendingReply ? "Sending..." : "Send Reply"}
                        </Button>
                      </div>
                    </div>
                  ) : null}
                </>
              )}
            </div>

            {activeMessage ? (
              <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--avad-border)] px-5 py-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Button type="button" className="gap-2" onClick={openComposer}>
                    <Reply size={15} />
                    Reply
                  </Button>
                  <a href={buildMailtoReplyLink(activeMessage)} className="inline-flex h-9 items-center gap-2 rounded-xl border border-[var(--avad-border)] px-3 text-sm text-[var(--avad-text)]">
                    <Mail size={14} />
                    Reply via Email
                  </a>
                  <Button
                    type="button"
                    variant="ghost"
                    className="border border-[var(--avad-border)] bg-[var(--avad-bg-elevated)]"
                    onClick={() => void updateStatus(activeMessage.id, activeMessage.status === "UNREAD" ? "MARK_READ" : "MARK_UNREAD")}
                  >
                    {activeMessage.status === "UNREAD" ? "Mark as Read" : "Mark as Unread"}
                  </Button>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => void deleteMessage(activeMessage.id)}
                  className="gap-2 border border-[var(--avad-border)] text-[#c43e34]"
                >
                  <Trash2 size={14} />
                  Delete
                </Button>
              </footer>
            ) : null}
          </section>
        </div>
      ) : null}
    </>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  iconClassName,
}: {
  title: string;
  value: number;
  icon: React.ComponentType<{ size?: number }>;
  iconClassName: string;
}) {
  return (
    <article className="rounded-2xl border border-[var(--avad-border)] bg-[var(--avad-bg-soft)] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs text-[var(--avad-text-soft)]">{title}</p>
          <p className="mt-1 text-3xl font-semibold text-[var(--avad-text-strong)]">{value}</p>
        </div>
        <span className={`inline-flex h-9 w-9 items-center justify-center rounded-full ${iconClassName}`}>
          <Icon size={16} />
        </span>
      </div>
    </article>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-xl border border-[var(--avad-border)] bg-[var(--avad-bg-soft)] p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--avad-text-soft)]">{label}</p>
      <p className="mt-1 text-sm text-[var(--avad-text)]">{value}</p>
    </article>
  );
}
