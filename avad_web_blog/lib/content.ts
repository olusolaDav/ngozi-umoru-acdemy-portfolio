import type {
  BlogComment,
  BlogItem,
  BlogPost,
  VideoItem,
} from "@/types/content";

export const navItems = [
  { label: "Home", href: "/" },
  { label: "Videos", href: "/videos" },
  { label: "Devotionals", href: "/devotionals" },
  { label: "Community", href: "/community" },
  { label: "Blog", href: "/blog" },
  { label: "About Us", href: "/about" },
  { label: "Contact Us", href: "/about#contact" }

] as const;

export const recommendedVideos: VideoItem[] = Array.from({ length: 6 }).map((_, index) => ({
  id: `rec-${index + 1}`,
  title: "Season 2 || AVAD Day 182|| Daily Bible Verse || Encouragement for Today",
  description: "",
  views: "5 views",
  publishedAgo: "16 hours ago",
  category: "All",
}));

export const devotionalsPrimaryTabs = ["ALL", "LIKED", "COMMENTED", "BOOKMARKED"] as const;

export const devotionalTags = [
  "All Tags",
  "Encouragement",
  "Courage",
  "Grace",
  "Hope",
  "Reflection",
] as const;

export const blogPosts: BlogPost[] = Array.from({ length: 8 }).map((_, index) => ({
  id: `blog-post-${index + 1}`,
  slug: `why-peter-could-not-walk-on-water-${index + 1}`,
  title: "Why Peter Could Not Walk on Water. Why Peter Could Not Walk on Water",
  excerpt:
    "Peter asked if he could join Jesus on the sea, but doubted his decision immediately he started focusing on the waves of the sea.",
  topic: ["Encouragement", "Courage", "Grace", "Hope", "Reflection"][index % 5],
  content: [
    "Un tableau de bord est un outil de gestion et d'evaluation de l'organisation d'une entreprise. Il est generalement constitue de plusieurs indicateurs de performance a des moments ou des periodes donnees.",
    "Le pilotage de la performance par Skello est une interface developpee specialement pour nos clients. L'objectif est d'obtenir une visibilite globale de la sante de son organisation et de ses etablissements.",
    "Voici le detail des indicateurs que les clients pourront analyser pour optimiser leur gestion et leur planification.",
    "Un tableau de bord est un outil de gestion et d'evaluation de l'organisation d'une entreprise. Il est generalement constitue de plusieurs indicateurs de performance afin d'optimiser sa performance.",
  ],
  bulletPoints: [
    "Chiffre d'affaires. Il correspond a la somme des ventes de biens ou de services hors taxes realisees par un etablissement.",
    "Chiffre d'affaires. Il correspond a la somme des ventes de biens ou de services hors taxes realisees par un etablissement.",
    "Chiffre d'affaires. Il correspond a la somme des ventes de biens ou de services hors taxes realisees par un etablissement.",
    "Chiffre d'affaires. Il correspond a la somme des ventes de biens ou de services hors taxes realisees par un etablissement.",
  ],
  tag: "Faith",
  readTime: "5 Min",
  publishedDate: "25 April 2023",
  likes: 18,
  shares: 18,
  imageSrc: "/placeholders/content-thumb.svg",
}));

export const blogItems: BlogItem[] = blogPosts.slice(0, 3).map((post) => ({
  id: post.id,
  title: post.title,
  excerpt: post.excerpt,
  likes: post.likes,
  comments: 5,
  bookmarks: 5,
  shares: post.shares,
  postedAgo: "16 hours ago",
}));

export const blogTags = [
  "All Tags",
  "Encouragement",
  "Courage",
  "Grace",
  "Hope",
  "Reflection",
] as const;

export const recommendedPosts = blogPosts.slice(0, 3);
export const popularPosts = blogPosts.slice(0, 5);

export const blogComments: BlogComment[] = [
  {
    id: "comment-1",
    author: "Emerson Septimus",
    date: "25 April 2023",
    message: "We enable data-driven transformation through advanced analytics and machine learning models tailored to your business.",
    likes: 18,
  },
  {
    id: "comment-2",
    author: "Emerson Septimus",
    date: "25 April 2023",
    message: "We bridge the gap between AI innovation and privacy while creating practical digital value for teams.",
    likes: 0,
  },
  {
    id: "comment-3",
    author: "Emerson Septimus",
    date: "25 April 2023",
    message: "We enable data-driven transformation through advanced analytics and machine learning models tailored to your business.",
    likes: 0,
  },
];

export function getBlogPostBySlug(slug: string) {
  return blogPosts.find((post) => post.slug === slug);
}

export const videoLibrary: VideoItem[] = Array.from({ length: 8 }).map((_, index) => ({
  id: `video-${index + 1}`,
  title: "Season 2 || AVAD Day 182|| Daily Bible Verse || Encouragement for Today",
  description: "",
  views: "5 views",
  publishedAgo: "16 hours ago",
  category: ["Health", "Prayer", "Deliverance", "Salvation", "Finance"][index % 5],
}));

export const playlistTags = [
  "All",
  "Health",
  "Salvation",
  "Deliverance",
  "Finance",
  "Prayer",
] as const;
