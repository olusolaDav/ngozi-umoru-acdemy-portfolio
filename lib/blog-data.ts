export interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  thumbnail?: string;
  status?: "published" | "draft" | "scheduled";
  tags?: string[];
}

export interface BlogComment {
  _id: string;
  postId: string;
  postSlug?: string;
  postTitle: string;
  author: {
    _id: string;
    name: string;
    avatar?: string;
  };
  content: string;
  status: "published" | "unpublished" | "pending";
  createdAt: string;
  updatedAt: string;
  likes?: number;
}

export type NotificationType = "form" | "response" | "review" | "comment" | "share" | "published";

export interface Notification {
  _id: string;
  type: NotificationType;
  actor: {
    name: string;
    avatar?: string;
    isCompany?: boolean;
  };
  action: string;
  target?: string;
  date: string;
  time: string;
}