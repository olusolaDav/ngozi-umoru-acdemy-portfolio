export type VideoItem = {
  id: string;
  title: string;
  description: string;
  publishedAgo: string;
  category: string;
  embedUrl?: string;
  thumbnail?: string;
  watchUrl?: string;
};

export type DevotionalItem = {
  id: string;
  title: string;
  excerpt: string;
  authorName?: string;
  likes: number;
  comments: number;
  bookmarks: number;
  shares: number;
};

export type BlogItem = {
  id: string;
  title: string;
  excerpt: string;
  authorName?: string;
  likes: number;
  comments: number;
  bookmarks: number;
  shares: number;
  postedAgo: string;
};

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  topic: string;
  content: string[];
  bulletPoints: string[];
  tag: string;
  readTime: string;
  publishedDate: string;
  likes: number;
  shares: number;
  imageSrc: string;
};

export type BlogComment = {
  id: string;
  author: string;
  date: string;
  message: string;
  likes: number;
};
