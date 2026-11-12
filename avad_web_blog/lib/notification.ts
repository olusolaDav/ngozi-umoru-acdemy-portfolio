export type NotificationCategory =
  | "SYSTEM"
  | "FORM"
  | "BLOG"
  | "DEVOTIONAL"
  | "COMMUNITY"
  | "DAILY_SCRIPTURE"
  | "VIDEO"
  | "USER"
  | "AUTH";

export type NotificationItem = {
  id: string;
  userId: string;
  category: NotificationCategory;
  type: string;
  title: string;
  message: string;
  actionUrl: string | null;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type NotificationsListResponse = {
  items: NotificationItem[];
  unread: number;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type NotificationsRecentResponse = {
  items: NotificationItem[];
  unread: number;
};

export type NotificationCountResponse = {
  unread: number;
};

export const NOTIFICATION_TABS: Array<{ key: "ALL" | NotificationCategory; label: string }> = [
  { key: "ALL", label: "All" },
  { key: "FORM", label: "Form" },
  { key: "BLOG", label: "Blog" },
  { key: "DEVOTIONAL", label: "Devotionals" },
  { key: "COMMUNITY", label: "Community" },
];
