export type DailyScriptureStatus = "DRAFT" | "SCHEDULED" | "PUBLISHED";

export type DailyScriptureSummary = {
  id: string;
  verse: string;
  content: string;
  excerpt: string;
  scriptureDate: string;
  status: DailyScriptureStatus;
  views: number;
  likes: number;
  shares: number;
  publishedAt: string | null;
  scheduledAt: string | null;
  createdAt: string;
  updatedAt: string;
  authorId: string | null;
  authorName: string;
};

export type DailyScriptureFeed = {
  date: string;
  hasAdminScripture: boolean;
  rotationWindowMinutes: number;
  activeIndex: number;
  activeScripture: DailyScriptureSummary | null;
  items: DailyScriptureSummary[];
};

export type PaginatedResponse<T> = {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export function formatScriptureDate(value?: string | null) {
  if (!value) {
    return "";
  }

  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
