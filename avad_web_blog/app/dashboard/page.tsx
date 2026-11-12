"use client";

import Link from "next/link";
import { Activity, AlertTriangle, ArrowUpRight, BookOpen, CheckCircle2, Clock3, FileText, FolderKanban, Inbox, RefreshCw, Sparkles, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { getJson } from "@/lib/http";

type SessionUser = {
  id: string;
  fullName: string;
  role: "ADMIN" | "MODERATOR" | "BLOGGER" | "MEMBER";
  email: string;
};

type OptionalNumber = number | null;

type OverviewResponse = {
  generatedAt: string;
  user: SessionUser;
  trend: Array<{
    day: string;
    contentCreated: number;
    moderationQueueCreated: number;
  }>;
  availability: {
    videos: {
      available: boolean;
      reason?: string;
    };
    dailyScriptures: {
      available: boolean;
      reason?: string;
    };
    contacts: {
      available: boolean;
      reason?: string;
    };
    users: {
      available: boolean;
      reason?: string;
    };
  };
  metrics: {
    notificationsUnread: number;
    content: {
      blogs: {
        total: number;
        draft: number;
        scheduled: number;
        published: number;
      };
      devotionals: {
        total: number;
        draft: number;
        scheduled: number;
        published: number;
      };
      community: {
        total: number;
        draft: number;
        scheduled: number;
        unapproved: number;
        published: number;
        pendingSubmissions: number;
        disapprovedSubmissions: number;
      };
      videos: {
        total: OptionalNumber;
        recommended: OptionalNumber;
      };
      dailyScriptures: {
        total: OptionalNumber;
        draft: OptionalNumber;
        scheduled: OptionalNumber;
        published: OptionalNumber;
      };
    };
    moderation: {
      blogUnpublishedComments: number;
      devotionalUnpublishedComments: number;
      communityUnpublishedComments: number;
      totalUnpublishedComments: number;
      attentionItems: number;
    };
    operations: {
      contactsUnread: OptionalNumber;
      contactsTotal: OptionalNumber;
      usersTotal: OptionalNumber;
      usersActive: OptionalNumber;
      usersDisabled: OptionalNumber;
      usersAdmins: OptionalNumber;
      usersModerators: OptionalNumber;
      usersBloggers: OptionalNumber;
      usersMembers: OptionalNumber;
    };
  };
};

type QuickLink = {
  href: string;
  label: string;
};

type TrendChartProps = {
  title: string;
  subtitle: string;
  data: Array<{
    day: string;
    value: number;
  }>;
};

function formatMetric(value: number | null | undefined) {
  if (typeof value !== "number") {
    return "--";
  }

  return new Intl.NumberFormat("en-GB").format(value);
}

function lastUpdatedLabel(value?: string) {
  if (!value) {
    return "--";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "--";
  }

  return date.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function percentage(value: number, total: number) {
  if (!total) return 0;
  return Math.min(100, Math.round((value / total) * 100));
}

function roleLabel(role?: SessionUser["role"]) {
  return role ? role.charAt(0) + role.slice(1).toLowerCase() : "Workspace";
}

function TrendChartCard({ title, subtitle, data }: TrendChartProps) {
  const width = 420;
  const height = 140;
  const paddingX = 14;
  const paddingY = 14;
  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;

  const values = data.map((point) => point.value);
  const max = Math.max(1, ...values);
  const min = Math.min(...values);
  const range = Math.max(1, max - min);

  const points = data
    .map((point, index) => {
      const x = paddingX + (index / Math.max(1, data.length - 1)) * chartWidth;
      const y = paddingY + (1 - (point.value - min) / range) * chartHeight;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <article className="rounded-2xl border border-[var(--avad-border)] bg-[var(--avad-bg-soft)] p-5">
      <h2 className="text-sm font-semibold text-[var(--avad-text-strong)]">{title}</h2>
      <p className="mt-1 text-xs text-[var(--avad-text-soft)]">{subtitle}</p>
      <div className="mt-3 overflow-hidden rounded-xl border border-[var(--avad-border)] bg-[var(--avad-bg-elevated)] px-2 py-2">
        <svg viewBox={`0 0 ${width} ${height}`} className="h-[140px] w-full" role="img" aria-label={title}>
          <defs>
            <linearGradient id={`avad-trend-fill-${title.replace(/\s+/g, "-").toLowerCase()}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#c99556" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#c99556" stopOpacity="0.04" />
            </linearGradient>
          </defs>
          <polygon points={`${paddingX},${height - paddingY} ${points} ${width - paddingX},${height - paddingY}`} fill={`url(#avad-trend-fill-${title.replace(/\s+/g, "-").toLowerCase()})`} />
          <polyline
            points={points}
            fill="none"
            stroke="#c99556"
            strokeWidth="2.5"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {data.map((point, index) => {
            const x = paddingX + (index / Math.max(1, data.length - 1)) * chartWidth;
            const y = paddingY + (1 - (point.value - min) / range) * chartHeight;
            return <circle key={`${point.day}-${index}`} cx={x} cy={y} r="2.3" fill="#2f1248" />;
          })}
        </svg>
      </div>
      <div className="mt-2 flex items-center justify-between gap-2 text-[11px] text-[var(--avad-text-soft)]">
        {data.map((point) => (
          <span key={`${title}-${point.day}`}>{point.day}</span>
        ))}
      </div>
    </article>
  );
}

export default function DashboardOverviewPage() {
  const [data, setData] = useState<OverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadSession() {
    setLoading(true);
    setError(null);

    try {
      const response = await getJson<OverviewResponse>("/api/dashboard/overview");
      setData(response);
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Unable to load overview right now.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    queueMicrotask(() => void loadSession());
  }, []);

  const quickLinks = useMemo(() => {
    const role = data?.user.role;

    const shared: QuickLink[] = [
      { href: "/dashboard/blogs", label: "Blog Content" },
      { href: "/dashboard/community", label: "Community Content" },
      { href: "/dashboard/devotionals", label: "Devotionals" },
      { href: "/dashboard/notifications", label: "Notifications" },
    ];

    if (role === "ADMIN") {
      return [
        { href: "/dashboard/users", label: "Users" },
        { href: "/dashboard/contacts", label: "Contacts Inbox" },
        { href: "/dashboard/daily-scriptures", label: "Daily Scriptures" },
        { href: "/dashboard/videos", label: "Videos" },
        ...shared,
      ];
    }

    if (role === "MODERATOR") {
      return [
        { href: "/dashboard/users", label: "Users" },
        { href: "/dashboard/daily-scriptures", label: "Daily Scriptures" },
        { href: "/dashboard/videos", label: "Videos" },
        ...shared,
      ];
    }

    return shared;
  }, [data?.user.role]);

  const composite = useMemo(() => {
    if (!data) {
      return {
        totalContent: 0,
        totalDrafts: 0,
        totalPublished: 0,
      };
    }

    const totalContent =
      data.metrics.content.blogs.total
      + data.metrics.content.devotionals.total
      + data.metrics.content.community.total
      + (data.metrics.content.videos.total ?? 0)
      + (data.metrics.content.dailyScriptures.total ?? 0);

    const totalDrafts =
      data.metrics.content.blogs.draft
      + data.metrics.content.devotionals.draft
      + data.metrics.content.community.draft
      + (data.metrics.content.dailyScriptures.draft ?? 0);

    const totalPublished =
      data.metrics.content.blogs.published
      + data.metrics.content.devotionals.published
      + data.metrics.content.community.published
      + (data.metrics.content.dailyScriptures.published ?? 0);

    return {
      totalContent,
      totalDrafts,
      totalPublished,
    };
  }, [data]);

  const isAdminOrModerator = data?.user.role === "ADMIN" || data?.user.role === "MODERATOR";

  const availabilityNotices = useMemo(() => {
    if (!data) {
      return [] as string[];
    }

    const notices: string[] = [];
    if (!data.availability.videos.available && data.availability.videos.reason && data.availability.videos.reason !== "Role-restricted") {
      notices.push(`Videos metrics are ${data.availability.videos.reason.toLowerCase()}.`);
    }
    if (!data.availability.dailyScriptures.available && data.availability.dailyScriptures.reason && data.availability.dailyScriptures.reason !== "Role-restricted") {
      notices.push(`Daily scripture metrics are ${data.availability.dailyScriptures.reason.toLowerCase()}.`);
    }
    if (!data.availability.contacts.available && data.availability.contacts.reason && data.availability.contacts.reason !== "Role-restricted") {
      notices.push(`Contact inbox metrics are ${data.availability.contacts.reason.toLowerCase()}.`);
    }
    if (!data.availability.users.available && data.availability.users.reason && data.availability.users.reason !== "Role-restricted") {
      notices.push(`User base metrics are ${data.availability.users.reason.toLowerCase()}.`);
    }

    return notices;
  }, [data]);

  const contentTrend = (data?.trend ?? []).map((point) => ({ day: point.day, value: point.contentCreated }));
  const queueTrend = (data?.trend ?? []).map((point) => ({ day: point.day, value: point.moderationQueueCreated }));

  const publishedRate = percentage(composite.totalPublished, composite.totalContent);
  const attentionItems = data?.metrics.moderation.attentionItems ?? 0;

  return (
    <section className="space-y-6 rounded-[2rem] border border-[var(--avad-border)] bg-[var(--avad-bg-elevated)] p-4 shadow-[0_20px_70px_-42px_rgba(49,16,72,0.55)] sm:p-7 lg:p-9">
      <div className="relative overflow-hidden rounded-[1.6rem] bg-[var(--avad-purple)] px-6 py-7 text-white shadow-xl sm:px-8 sm:py-8">
        <div className="absolute -right-16 -top-24 h-64 w-64 rounded-full bg-[var(--avad-gold)] opacity-20 blur-3xl" />
        <div className="absolute bottom-[-5rem] right-24 h-40 w-40 rounded-full border border-white/10" />
        <div className="relative flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#f4d7ac]">
              <Sparkles size={13} /> Workspace overview
            </div>
            <h1 className="max-w-2xl font-serif text-3xl leading-tight sm:text-4xl">Good to see you, {data?.user.fullName ?? "there"}.</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-white/70">A clear view of your ministry workspace, content momentum, and the next actions that matter most.</p>
            <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-white/65">
              <span className="rounded-full bg-white/10 px-3 py-1.5 font-semibold text-white">{roleLabel(data?.user.role)} access</span>
              <span>Updated {lastUpdatedLabel(data?.generatedAt)}</span>
            </div>
          </div>
          <button type="button" onClick={() => void loadSession()} className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-full bg-white px-4 text-sm font-semibold text-[var(--avad-purple)] transition hover:bg-[#f8ead9] disabled:opacity-60" disabled={loading}>
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            {loading ? "Refreshing" : "Refresh data"}
          </button>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-[#f2c8be] bg-[#fff2ef] px-4 py-3 text-sm text-[#8f2f20]">{error}</div>
      ) : null}

      {availabilityNotices.length > 0 ? (
        <div className="rounded-2xl border border-[#eadfcd] bg-[#fffaf1] px-4 py-3 text-sm text-[#755222]">
          {availabilityNotices.map((notice) => (
            <p key={notice}>{notice}</p>
          ))}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Managed content", value: composite.totalContent, icon: FileText, detail: "Across all channels", tone: "purple" },
          { label: "Published", value: composite.totalPublished, icon: CheckCircle2, detail: `${publishedRate}% of total content`, tone: "green" },
          { label: "Draft backlog", value: composite.totalDrafts, icon: Clock3, detail: "Ready for review", tone: "gold" },
          { label: "Needs attention", value: attentionItems, icon: AlertTriangle, detail: attentionItems ? "Prioritise these items" : "Everything is up to date", tone: attentionItems ? "red" : "green" },
        ].map((item) => {
          const Icon = item.icon;
          return <article key={item.label} className="group rounded-2xl border border-[var(--avad-border)] bg-[var(--avad-bg-soft)] p-5 transition hover:-translate-y-0.5 hover:shadow-lg">
            <div className="flex items-start justify-between gap-3"><div className={`rounded-xl p-2.5 ${item.tone === "purple" ? "bg-[#efe5f7] text-[var(--avad-purple)]" : item.tone === "gold" ? "bg-[#f8ead9] text-[#9a652b]" : item.tone === "red" ? "bg-[#fff0ed] text-[#a64031]" : "bg-[#e8f5ed] text-[#2e7b50]"}`}><Icon size={17} /></div><ArrowUpRight size={16} className="text-[var(--avad-text-soft)] opacity-0 transition group-hover:opacity-100" /></div>
            <p className="mt-5 text-xs font-medium text-[var(--avad-text-soft)]">{item.label}</p><p className="mt-1 text-3xl font-semibold tracking-tight text-[var(--avad-text-strong)]">{loading ? "..." : formatMetric(item.value)}</p><p className="mt-2 text-xs text-[var(--avad-text-soft)]">{item.detail}</p>
          </article>;
        })}
      </div>

      <div className="flex items-center justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--avad-gold)]">At a glance</p><h2 className="mt-1 text-xl font-semibold text-[var(--avad-text-strong)]">Keep the momentum going</h2></div><div className="hidden items-center gap-2 text-xs text-[var(--avad-text-soft)] sm:flex"><Activity size={15} /> Live workspace signals</div></div>

      <div className="grid gap-4 lg:grid-cols-3">
        <article className="rounded-2xl border border-[var(--avad-border)] bg-[var(--avad-bg-soft)] p-5">
          <div className="flex items-center gap-2 text-[var(--avad-text-strong)]">
            <FolderKanban size={16} />
            <h2 className="text-sm font-semibold">Content Health</h2>
          </div>
          <div className="mt-5 space-y-4 text-sm">
            {[{ label: "Blogs", value: data?.metrics.content.blogs.total ?? 0, color: "bg-[#8f6ab7]" }, { label: "Community posts", value: data?.metrics.content.community.total ?? 0, color: "bg-[#c99556]" }, { label: "Devotionals", value: data?.metrics.content.devotionals.total ?? 0, color: "bg-[#5c9b7a]" }, { label: "Daily scriptures", value: data?.metrics.content.dailyScriptures.total ?? 0, color: "bg-[#d77b63]" }, { label: "Videos", value: data?.metrics.content.videos.total ?? 0, color: "bg-[#6e86b7]" }].map((item) => <div key={item.label}><div className="flex justify-between gap-3"><span className="text-[var(--avad-text)]">{item.label}</span><span className="font-semibold text-[var(--avad-text-strong)]">{formatMetric(item.value)}</span></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--avad-border)]"><div className={`h-full rounded-full ${item.color}`} style={{ width: `${percentage(item.value, composite.totalContent)}%` }} /></div></div>)}
          </div>
        </article>

        <article className="rounded-2xl border border-[var(--avad-border)] bg-[var(--avad-bg-soft)] p-5">
          <div className="flex items-center gap-2 text-[var(--avad-text-strong)]">
            <AlertTriangle size={16} />
            <h2 className="text-sm font-semibold">Moderation Queue</h2>
          </div>
          <div className="mt-5 space-y-2 text-sm">
            <p className="flex justify-between"><span>Unpublished Blog Comments</span><span>{formatMetric(data?.metrics.moderation.blogUnpublishedComments)}</span></p>
            <p className="flex justify-between"><span>Unpublished Devotional Comments</span><span>{formatMetric(data?.metrics.moderation.devotionalUnpublishedComments)}</span></p>
            <p className="flex justify-between"><span>Unpublished Community Comments</span><span>{formatMetric(data?.metrics.moderation.communityUnpublishedComments)}</span></p>
            <p className="flex justify-between"><span>Pending Community Submissions</span><span>{formatMetric(data?.metrics.content.community.pendingSubmissions)}</span></p>
            <p className="flex justify-between"><span>Disapproved Submissions</span><span>{formatMetric(data?.metrics.content.community.disapprovedSubmissions)}</span></p>
            <div className={`mt-4 flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-semibold ${attentionItems ? "bg-[#fff0ed] text-[#a64031]" : "bg-[#e8f5ed] text-[#2e7b50]"}`}><AlertTriangle size={14} />{attentionItems ? `${formatMetric(attentionItems)} items need review` : "No outstanding review items"}</div>
          </div>
        </article>

        <article className="rounded-2xl border border-[var(--avad-border)] bg-[var(--avad-bg-soft)] p-5">
          <div className="flex items-center gap-2 text-[var(--avad-text-strong)]">
            <Clock3 size={16} />
            <h2 className="text-sm font-semibold">Workflow</h2>
          </div>
          <div className="mt-5 space-y-2 text-sm">
            <p className="flex justify-between"><span>Blog Drafts</span><span>{formatMetric(data?.metrics.content.blogs.draft)}</span></p>
            <p className="flex justify-between"><span>Community Drafts</span><span>{formatMetric(data?.metrics.content.community.draft)}</span></p>
            <p className="flex justify-between"><span>Community Unapproved</span><span>{formatMetric(data?.metrics.content.community.unapproved)}</span></p>
            <p className="flex justify-between"><span>Devotional Drafts</span><span>{formatMetric(data?.metrics.content.devotionals.draft)}</span></p>
            <p className="flex justify-between"><span>Scheduled Content</span><span>{formatMetric((data?.metrics.content.blogs.scheduled ?? 0) + (data?.metrics.content.community.scheduled ?? 0) + (data?.metrics.content.devotionals.scheduled ?? 0) + (data?.metrics.content.dailyScriptures.scheduled ?? 0))}</span></p>
          </div>
        </article>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <TrendChartCard
          title="7-Day Content Creation"
          subtitle="Count of newly created dashboard content entries across accessible modules"
          data={contentTrend.length ? contentTrend : [{ day: "-", value: 0 }]}
        />
        <TrendChartCard
          title="7-Day Moderation Intake"
          subtitle="New comments entering moderation queue (unpublished state)"
          data={queueTrend.length ? queueTrend : [{ day: "-", value: 0 }]}
        />
      </div>

      {isAdminOrModerator ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <article className="rounded-2xl border border-[var(--avad-border)] bg-[var(--avad-bg-soft)] p-5">
            <div className="flex items-center gap-2 text-[var(--avad-text-strong)]">
              <Users size={16} />
              <h2 className="text-sm font-semibold">User Base</h2>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
              <p className="rounded-xl border border-[var(--avad-border)] bg-[var(--avad-bg-elevated)] px-3 py-2">Total: {formatMetric(data?.metrics.operations.usersTotal)}</p>
              <p className="rounded-xl border border-[var(--avad-border)] bg-[var(--avad-bg-elevated)] px-3 py-2">Active: {formatMetric(data?.metrics.operations.usersActive)}</p>
              <p className="rounded-xl border border-[var(--avad-border)] bg-[var(--avad-bg-elevated)] px-3 py-2">Admins: {formatMetric(data?.metrics.operations.usersAdmins)}</p>
              <p className="rounded-xl border border-[var(--avad-border)] bg-[var(--avad-bg-elevated)] px-3 py-2">Moderators: {formatMetric(data?.metrics.operations.usersModerators)}</p>
              <p className="rounded-xl border border-[var(--avad-border)] bg-[var(--avad-bg-elevated)] px-3 py-2">Bloggers: {formatMetric(data?.metrics.operations.usersBloggers)}</p>
              <p className="rounded-xl border border-[var(--avad-border)] bg-[var(--avad-bg-elevated)] px-3 py-2">Members: {formatMetric(data?.metrics.operations.usersMembers)}</p>
            </div>
          </article>

          <article className="rounded-2xl border border-[var(--avad-border)] bg-[var(--avad-bg-soft)] p-5">
            <div className="flex items-center gap-2 text-[var(--avad-text-strong)]">
              <Inbox size={16} />
              <h2 className="text-sm font-semibold">Ops Signals</h2>
            </div>
            <div className="mt-4 space-y-2 text-sm">
              <p className="flex justify-between"><span>Unread Notifications</span><span>{formatMetric(data?.metrics.notificationsUnread)}</span></p>
              <p className="flex justify-between"><span>Unread Contacts</span><span>{formatMetric(data?.metrics.operations.contactsUnread)}</span></p>
              <p className="flex justify-between"><span>Total Contacts</span><span>{formatMetric(data?.metrics.operations.contactsTotal)}</span></p>
              <p className="flex justify-between"><span>Recommended Videos</span><span>{formatMetric(data?.metrics.content.videos.recommended)}</span></p>
            </div>
          </article>
        </div>
      ) : (
        <article className="rounded-2xl border border-[var(--avad-border)] bg-[var(--avad-bg-soft)] p-5">
          <div className="flex items-center gap-2 text-[var(--avad-text-strong)]">
            <BookOpen size={16} />
            <h2 className="text-sm font-semibold">Creator Signals</h2>
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 text-sm">
            <p className="rounded-xl border border-[var(--avad-border)] bg-[var(--avad-bg-elevated)] px-3 py-2">Blog Published: {formatMetric(data?.metrics.content.blogs.published)}</p>
            <p className="rounded-xl border border-[var(--avad-border)] bg-[var(--avad-bg-elevated)] px-3 py-2">Blog Draft: {formatMetric(data?.metrics.content.blogs.draft)}</p>
            <p className="rounded-xl border border-[var(--avad-border)] bg-[var(--avad-bg-elevated)] px-3 py-2">Community Published: {formatMetric(data?.metrics.content.community.published)}</p>
            <p className="rounded-xl border border-[var(--avad-border)] bg-[var(--avad-bg-elevated)] px-3 py-2">Community Unapproved: {formatMetric(data?.metrics.content.community.unapproved)}</p>
            <p className="rounded-xl border border-[var(--avad-border)] bg-[var(--avad-bg-elevated)] px-3 py-2">Devotional Published: {formatMetric(data?.metrics.content.devotionals.published)}</p>
            <p className="rounded-xl border border-[var(--avad-border)] bg-[var(--avad-bg-elevated)] px-3 py-2">Unread Notifications: {formatMetric(data?.metrics.notificationsUnread)}</p>
          </div>
        </article>
      )}

      <div className="rounded-2xl border border-[var(--avad-border)] bg-[var(--avad-bg-soft)] p-5">
        <h2 className="text-sm font-semibold text-[var(--avad-text-strong)]">Quick Actions</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {quickLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="inline-flex h-9 items-center rounded-full border border-[var(--avad-border)] bg-[var(--avad-bg-elevated)] px-4 text-sm text-[var(--avad-text)] transition hover:border-[var(--avad-ring)]"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
