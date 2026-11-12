import { NextResponse } from "next/server";

import { unauthorizedJson } from "../../auth/_helpers";
import { callApi, safeErrorMessage } from "@/lib/server-api";
import { withBearerRetry } from "../blogs/_helpers";

type Role = "ADMIN" | "MODERATOR" | "BLOGGER" | "MEMBER";

type SessionUser = {
  id: string;
  fullName: string;
  email: string;
  role: Role;
};

type PaginatedResponse = {
  pagination: {
    total: number;
  };
};

type CommentTotalsResponse = {
  statusTotals?: {
    unpublished?: number;
    published?: number;
  };
};

type NotificationsUnreadResponse = {
  unread?: number;
};

type UsersResponse = {
  items: Array<{
    role: Role;
    isActive: boolean;
  }>;
  total?: number;
};

type ContactListResponse = {
  pagination?: {
    total?: number;
  };
};

type OptionalNumber = number | null;

type Availability = {
  available: boolean;
  reason?: string;
};

type TrendPoint = {
  day: string;
  contentCreated: number;
  moderationQueueCreated: number;
};

type OverviewResponse = {
  generatedAt: string;
  user: SessionUser;
  trend: TrendPoint[];
  availability: {
    videos: Availability;
    dailyScriptures: Availability;
    contacts: Availability;
    users: Availability;
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

async function apiGet<T>(path: string) {
  const { data } = await withBearerRetry((token) =>
    callApi<T>(path, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
  );

  return data;
}

async function getTotal(path: string) {
  const payload = await apiGet<PaginatedResponse>(path);
  return payload.pagination.total;
}

async function getOptionalNumber(request: () => Promise<number>): Promise<OptionalNumber> {
  try {
    return await request();
  } catch {
    return null;
  }
}

async function getCommentTotals(path: string) {
  try {
    const payload = await apiGet<CommentTotalsResponse>(path);
    return {
      unpublished: payload.statusTotals?.unpublished ?? 0,
      published: payload.statusTotals?.published ?? 0,
    };
  } catch {
    return {
      unpublished: 0,
      published: 0,
    };
  }
}

type ListItem = {
  createdAt?: string;
};

type ListResponse<T> = {
  items: T[];
};

function toDayLabel(date: Date) {
  return date.toLocaleDateString("en-GB", { weekday: "short" });
}

function isoDateOnly(date: Date) {
  return date.toISOString().slice(0, 10);
}

function buildLast7Days() {
  const now = new Date();
  const days: Array<{ key: string; label: string }> = [];

  for (let index = 6; index >= 0; index -= 1) {
    const day = new Date(now);
    day.setHours(0, 0, 0, 0);
    day.setDate(now.getDate() - index);
    days.push({
      key: isoDateOnly(day),
      label: toDayLabel(day),
    });
  }

  return days;
}

function buildTrendMap() {
  const dayEntries = buildLast7Days();
  const map = new Map<string, TrendPoint>();

  for (const day of dayEntries) {
    map.set(day.key, {
      day: day.label,
      contentCreated: 0,
      moderationQueueCreated: 0,
    });
  }

  return map;
}

function incrementTrendValue(
  trendMap: Map<string, TrendPoint>,
  createdAt: string | undefined,
  key: "contentCreated" | "moderationQueueCreated",
) {
  if (!createdAt) {
    return;
  }

  const dayKey = createdAt.slice(0, 10);
  const point = trendMap.get(dayKey);
  if (!point) {
    return;
  }

  point[key] += 1;
}

function toTrendSeries(trendMap: Map<string, TrendPoint>) {
  return Array.from(trendMap.entries()).map(([, point]) => point);
}

async function getListItems(path: string) {
  const payload = await apiGet<ListResponse<ListItem>>(path);
  return payload.items ?? [];
}

export async function GET() {
  try {
    const session = await apiGet<SessionUser>("/auth/me");
    const role = session.role;
    const isAdminOrModerator = role === "ADMIN" || role === "MODERATOR";

    const [
      blogsTotal,
      blogsDraft,
      blogsScheduled,
      blogsPublished,
      devotionalsTotal,
      devotionalsDraft,
      devotionalsScheduled,
      devotionalsPublished,
      notificationsUnread,
      blogComments,
      devotionalComments,
      communityComments,
    ] = await Promise.all([
      getTotal("/blogs/admin/list?page=1&limit=1"),
      getTotal("/blogs/admin/list?page=1&limit=1&status=DRAFT"),
      getTotal("/blogs/admin/list?page=1&limit=1&status=SCHEDULED"),
      getTotal("/blogs/admin/list?page=1&limit=1&status=PUBLISHED"),
      getTotal("/devotionals/admin/list?page=1&limit=1"),
      getTotal("/devotionals/admin/list?page=1&limit=1&status=DRAFT"),
      getTotal("/devotionals/admin/list?page=1&limit=1&status=SCHEDULED"),
      getTotal("/devotionals/admin/list?page=1&limit=1&status=PUBLISHED"),
      apiGet<NotificationsUnreadResponse>("/notifications/unread-count").then((data) => data.unread ?? 0).catch(() => 0),
      getCommentTotals("/blogs/admin/comments/list?page=1&limit=1&status=UNPUBLISHED"),
      getCommentTotals("/devotionals/admin/comments/list?page=1&limit=1&status=UNPUBLISHED"),
      getCommentTotals("/community/manage/comments/list?page=1&limit=1&status=UNPUBLISHED"),
    ]);

    const communityMetrics = isAdminOrModerator
      ? await Promise.all([
          getTotal("/community/manage/list?page=1&limit=1&scope=CONTENT"),
          getTotal("/community/manage/list?page=1&limit=1&scope=CONTENT&status=DRAFT"),
          getTotal("/community/manage/list?page=1&limit=1&scope=CONTENT&status=SCHEDULED"),
          getTotal("/community/manage/list?page=1&limit=1&scope=CONTENT&status=PUBLISHED"),
          getTotal("/community/manage/list?page=1&limit=1&scope=SUBMISSIONS&submissionState=PENDING"),
          getTotal("/community/manage/list?page=1&limit=1&scope=SUBMISSIONS&submissionState=DISAPPROVED"),
        ])
      : await Promise.all([
          getTotal("/community/manage/list?page=1&limit=1&scope=ALL"),
          getTotal("/community/manage/list?page=1&limit=1&scope=ALL&status=DRAFT"),
          getTotal("/community/manage/list?page=1&limit=1&scope=ALL&status=SCHEDULED"),
          getTotal("/community/manage/list?page=1&limit=1&scope=ALL&status=PUBLISHED"),
          getTotal("/community/manage/list?page=1&limit=1&scope=ALL&status=UNAPPROVED"),
          Promise.resolve(0),
        ]);

    const [
      communityTotal,
      communityDraft,
      communityScheduled,
      communityPublished,
      communitySubmissionA,
      communitySubmissionB,
    ] = communityMetrics;

    const communityUnapproved = isAdminOrModerator ? 0 : communitySubmissionA;
    const communityPendingSubmissions = isAdminOrModerator ? communitySubmissionA : 0;
    const communityDisapprovedSubmissions = isAdminOrModerator ? communitySubmissionB : 0;

    const [videosTotal, videosRecommended] = isAdminOrModerator
      ? await Promise.all([
          getOptionalNumber(() => getTotal("/videos/admin/list?page=1&limit=1")),
          getOptionalNumber(() => getTotal("/videos/admin/list?page=1&limit=1&recommended=true")),
        ])
      : [null, null];

    const [dailyTotal, dailyDraft, dailyScheduled, dailyPublished] = isAdminOrModerator
      ? await Promise.all([
          getOptionalNumber(() => getTotal("/daily-scriptures/admin/list?page=1&limit=1")),
          getOptionalNumber(() => getTotal("/daily-scriptures/admin/list?page=1&limit=1&status=DRAFT")),
          getOptionalNumber(() => getTotal("/daily-scriptures/admin/list?page=1&limit=1&status=SCHEDULED")),
          getOptionalNumber(() => getTotal("/daily-scriptures/admin/list?page=1&limit=1&status=PUBLISHED")),
        ])
      : [null, null, null, null];

    const contactsUnread = isAdminOrModerator
      ? await getOptionalNumber(() => apiGet<NotificationsUnreadResponse>("/contact/admin/unread-count").then((data) => data.unread ?? 0))
      : null;

    const contactsTotal = isAdminOrModerator
      ? await getOptionalNumber(() =>
          apiGet<ContactListResponse>("/contact/admin/list?page=1&limit=1").then((data) => data.pagination?.total ?? 0),
        )
      : null;

    const trendMap = buildTrendMap();

    const [blogItems, devotionalItems, communityItems] = await Promise.all([
      getListItems("/blogs/admin/list?page=1&limit=200").catch(() => []),
      getListItems("/devotionals/admin/list?page=1&limit=200").catch(() => []),
      getListItems(
        isAdminOrModerator
          ? "/community/manage/list?page=1&limit=200&scope=CONTENT"
          : "/community/manage/list?page=1&limit=200&scope=ALL",
      ).catch(() => []),
    ]);

    for (const item of blogItems) {
      incrementTrendValue(trendMap, item.createdAt, "contentCreated");
    }
    for (const item of devotionalItems) {
      incrementTrendValue(trendMap, item.createdAt, "contentCreated");
    }
    for (const item of communityItems) {
      incrementTrendValue(trendMap, item.createdAt, "contentCreated");
    }

    if (isAdminOrModerator) {
      const [videoItems, dailyItems] = await Promise.all([
        getListItems("/videos/admin/list?page=1&limit=200").catch(() => []),
        getListItems("/daily-scriptures/admin/list?page=1&limit=200").catch(() => []),
      ]);

      for (const item of videoItems) {
        incrementTrendValue(trendMap, item.createdAt, "contentCreated");
      }
      for (const item of dailyItems) {
        incrementTrendValue(trendMap, item.createdAt, "contentCreated");
      }
    }

    const [blogQueueItems, devotionalQueueItems, communityQueueItems] = await Promise.all([
      getListItems("/blogs/admin/comments/list?page=1&limit=200&status=UNPUBLISHED").catch(() => []),
      getListItems("/devotionals/admin/comments/list?page=1&limit=200&status=UNPUBLISHED").catch(() => []),
      getListItems("/community/manage/comments/list?page=1&limit=200&status=UNPUBLISHED").catch(() => []),
    ]);

    for (const item of blogQueueItems) {
      incrementTrendValue(trendMap, item.createdAt, "moderationQueueCreated");
    }
    for (const item of devotionalQueueItems) {
      incrementTrendValue(trendMap, item.createdAt, "moderationQueueCreated");
    }
    for (const item of communityQueueItems) {
      incrementTrendValue(trendMap, item.createdAt, "moderationQueueCreated");
    }

    let usersTotal: OptionalNumber = null;
    let usersActive: OptionalNumber = null;
    let usersDisabled: OptionalNumber = null;
    let usersAdmins: OptionalNumber = null;
    let usersModerators: OptionalNumber = null;
    let usersBloggers: OptionalNumber = null;
    let usersMembers: OptionalNumber = null;

    if (isAdminOrModerator) {
      try {
        const users = await apiGet<UsersResponse>("/users");
        const rows = users.items ?? [];

        usersTotal = users.total ?? rows.length;
        usersActive = rows.filter((row) => row.isActive).length;
        usersDisabled = rows.filter((row) => !row.isActive).length;
        usersAdmins = rows.filter((row) => row.role === "ADMIN").length;
        usersModerators = rows.filter((row) => row.role === "MODERATOR").length;
        usersBloggers = rows.filter((row) => row.role === "BLOGGER").length;
        usersMembers = rows.filter((row) => row.role === "MEMBER").length;
      } catch {
        usersTotal = null;
        usersActive = null;
        usersDisabled = null;
        usersAdmins = null;
        usersModerators = null;
        usersBloggers = null;
        usersMembers = null;
      }
    }

    const totalUnpublishedComments =
      blogComments.unpublished + devotionalComments.unpublished + communityComments.unpublished;

    const attentionItems =
      totalUnpublishedComments
      + communityUnapproved
      + communityPendingSubmissions
      + (contactsUnread ?? 0);

    const payload: OverviewResponse = {
      generatedAt: new Date().toISOString(),
      user: session,
      trend: toTrendSeries(trendMap),
      availability: {
        videos: {
          available: isAdminOrModerator && videosTotal !== null,
          reason: !isAdminOrModerator ? "Role-restricted" : videosTotal === null ? "Temporarily unavailable" : undefined,
        },
        dailyScriptures: {
          available: isAdminOrModerator && dailyTotal !== null,
          reason: !isAdminOrModerator ? "Role-restricted" : dailyTotal === null ? "Temporarily unavailable" : undefined,
        },
        contacts: {
          available: isAdminOrModerator && contactsUnread !== null && contactsTotal !== null,
          reason:
            !isAdminOrModerator
              ? "Role-restricted"
              : contactsUnread === null || contactsTotal === null
                ? "Temporarily unavailable"
                : undefined,
        },
        users: {
          available: isAdminOrModerator && usersTotal !== null,
          reason: !isAdminOrModerator ? "Role-restricted" : usersTotal === null ? "Temporarily unavailable" : undefined,
        },
      },
      metrics: {
        notificationsUnread,
        content: {
          blogs: {
            total: blogsTotal,
            draft: blogsDraft,
            scheduled: blogsScheduled,
            published: blogsPublished,
          },
          devotionals: {
            total: devotionalsTotal,
            draft: devotionalsDraft,
            scheduled: devotionalsScheduled,
            published: devotionalsPublished,
          },
          community: {
            total: communityTotal,
            draft: communityDraft,
            scheduled: communityScheduled,
            unapproved: communityUnapproved,
            published: communityPublished,
            pendingSubmissions: communityPendingSubmissions,
            disapprovedSubmissions: communityDisapprovedSubmissions,
          },
          videos: {
            total: videosTotal,
            recommended: videosRecommended,
          },
          dailyScriptures: {
            total: dailyTotal,
            draft: dailyDraft,
            scheduled: dailyScheduled,
            published: dailyPublished,
          },
        },
        moderation: {
          blogUnpublishedComments: blogComments.unpublished,
          devotionalUnpublishedComments: devotionalComments.unpublished,
          communityUnpublishedComments: communityComments.unpublished,
          totalUnpublishedComments,
          attentionItems,
        },
        operations: {
          contactsUnread,
          contactsTotal,
          usersTotal,
          usersActive,
          usersDisabled,
          usersAdmins,
          usersModerators,
          usersBloggers,
          usersMembers,
        },
      },
    };

    return NextResponse.json(payload, {
      headers: {
        "Cache-Control": "private, max-age=60, stale-while-revalidate=240",
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message.toLowerCase().includes("unauthorized")) {
      return unauthorizedJson();
    }

    return NextResponse.json({ message: safeErrorMessage(error) }, { status: 400 });
  }
}
