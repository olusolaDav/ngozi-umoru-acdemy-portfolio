"use client";

import Image from "next/image";
import Link from "next/link";
import { Calendar, Clock3, Eye, Heart, Instagram, Link2, Reply, Share2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { NewsletterSection } from "@/components/sections/newsletter-section";
import { estimateReadTimeFromContent, formatBlogDate, normalizeBlogHtmlForRender, type BlogComment, type BlogSummary } from "@/lib/blog";
import { getJson, postJson } from "@/lib/http";

type BlogSlugPageProps = {
  post: BlogSummary;
  comments: BlogComment[];
};

type SessionUser = {
  id: string;
  fullName: string;
  email: string;
  role: "ADMIN" | "MODERATOR" | "BLOGGER" | "MEMBER";
};

export function BlogSlugPage({ post, comments }: BlogSlugPageProps) {
  const [commentList, setCommentList] = useState<BlogComment[]>(comments);
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);
  const [sessionResolved, setSessionResolved] = useState(false);
  const [likes, setLikes] = useState(post.likes ?? 0);
  const [shares, setShares] = useState(post.shares ?? 0);
  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  const shareMenuRef = useRef<HTMLDivElement | null>(null);
  const views = useState(() => {
    if (typeof window === "undefined") {
      return post.views ?? 0;
    }
    const alreadyViewed = localStorage.getItem(`blog_viewed_${post.slug}`) === "1";
    return (post.views ?? 0) + (alreadyViewed ? 0 : 1);
  })[0];
  const [liked, setLiked] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }
    return localStorage.getItem(`blog_like_${post.id}`) === "1";
  });
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isAuthenticated = Boolean(sessionUser);

  async function refreshComments() {
    try {
      const freshComments = await getJson<BlogComment[]>(`/api/blog/${post.slug}/comments`);
      setCommentList(freshComments);
    } catch {
      // Keep the current UI state if refresh fails.
    }
  }

  useEffect(() => {
    const key = `blog_viewed_${post.slug}`;
    const alreadyViewed = localStorage.getItem(key) === "1";
    if (!alreadyViewed) {
      localStorage.setItem(key, "1");
      void postJson(`/api/blog/${post.slug}/engagement`, { action: "VIEW" });
    }
  }, [post.slug]);

  useEffect(() => {
    let active = true;

    async function loadSession() {
      try {
        const response = await fetch("/api/auth/session", { cache: "no-store" });
        if (!active) {
          return;
        }

        if (!response.ok) {
          setSessionUser(null);
          return;
        }

        const payload = (await response.json()) as SessionUser;
        setSessionUser(payload);
      } catch {
        if (active) {
          setSessionUser(null);
        }
      } finally {
        if (active) {
          setSessionResolved(true);
        }
      }
    }

    void loadSession();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    function onOutsideClick(event: MouseEvent) {
      if (!shareMenuRef.current) {
        return;
      }
      if (!shareMenuRef.current.contains(event.target as Node)) {
        setShareMenuOpen(false);
      }
    }

    if (shareMenuOpen) {
      window.addEventListener("mousedown", onOutsideClick);
    }

    return () => {
      window.removeEventListener("mousedown", onOutsideClick);
    };
  }, [shareMenuOpen]);

  async function submitComment(event: React.FormEvent) {
    event.preventDefault();
    if (!sessionUser) {
      toast.error("Please sign in to post a comment.");
      return;
    }

    setSubmitting(true);
    try {
      const created = await postJson<BlogComment>(`/api/blog/${post.slug}/comments`, {
        name: sessionUser.fullName,
        email: sessionUser.email,
        message,
      });
      setMessage("");
      if (created.status === "PUBLISHED") {
        setCommentList((prev) => [created, ...prev]);
        void refreshComments();
      }
      toast.success(
        created.status === "PUBLISHED"
          ? "Comment posted successfully."
          : "Comment submitted. It will appear after approval.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function togglePostLike() {
    const likeKey = `blog_like_${post.id}`;
    const nextLiked = !liked;
    setLiked(nextLiked);
    setLikes((value) => Math.max(0, value + (nextLiked ? 1 : -1)));

    try {
      await postJson(`/api/blog/${post.slug}/engagement`, {
        action: nextLiked ? "LIKE" : "UNLIKE",
      });
      if (nextLiked) {
        localStorage.setItem(likeKey, "1");
      } else {
        localStorage.removeItem(likeKey);
      }
    } catch {
      setLiked(!nextLiked);
      setLikes((value) => Math.max(0, value + (nextLiked ? -1 : 1)));
    }
  }

  function markShare() {
    setShares((value) => value + 1);
    void postJson(`/api/blog/${post.slug}/engagement`, { action: "SHARE" }).catch(() => {
      setShares((value) => Math.max(0, value - 1));
    });
    setShareMenuOpen(false);
  }

  function shareUrl() {
    return window.location.href;
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl());
      toast.success("Link copied to clipboard!");
      markShare();
    } catch {
      // Clipboard blocked by browser.
      toast.error("Unable to copy link.");
    }
  }

  function shareOnX() {
    const text = encodeURIComponent(`${post.title}\n\n`);
    const url = encodeURIComponent(shareUrl());
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, "_blank", "noopener,noreferrer,width=600,height=420");
    markShare();
  }

  function shareOnFacebook() {
    const url = encodeURIComponent(shareUrl());
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, "_blank", "noopener,noreferrer,width=600,height=420");
    markShare();
  }

  function shareOnLinkedIn() {
    const url = encodeURIComponent(shareUrl());
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, "_blank", "noopener,noreferrer,width=600,height=420");
    markShare();
  }

  function shareOnInstagram() {
    const textToCopy = `${post.title}\n\nRead more: ${shareUrl()}`;
    navigator.clipboard
      .writeText(textToCopy)
      .then(() => {
        window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");
        markShare();
      })
      .catch(() => {
        // No-op when clipboard permission is denied.
      });
  }

  async function sharePost() {
    setShareMenuOpen((value) => !value);
  }

  return (
    <>
      <article className="mx-auto mt-12 w-full max-w-[1320px] px-4 md:mt-14 md:px-6 lg:px-8 xl:mt-16 xl:px-10 2xl:mt-20">
        <header className="mx-auto max-w-[760px] text-center">
          <span className="inline-flex rounded-full bg-[var(--avad-gold)] px-4 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
            AVAD- A Verse A Day
          </span>
          <h1 className="mt-4 font-serif text-[clamp(2.5rem,5vw,4.4rem)] font-bold leading-[1.04] text-[var(--avad-text-strong)]">{post.title}</h1>
          <p className="mt-3 text-[14px] leading-6 text-[var(--avad-text-soft)]">
            {post.excerpt || post.metaDescription}
          </p>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-[12px] text-[var(--avad-text)]">
            <span className="rounded-full bg-[#311048] px-3 py-1 text-[var(--avad-gold)]">{post.tags[0] ?? "Faith"}</span>
            <span className="inline-flex items-center gap-1"><Clock3 size={13} /> {estimateReadTimeFromContent(post.content)} Min</span>
            <span className="inline-flex items-center gap-1"><Calendar size={13} /> {formatBlogDate(post.publishedAt ?? post.createdAt)}</span>
            <button
              type="button"
              onClick={() => void togglePostLike()}
              className="inline-flex cursor-pointer items-center gap-1 text-red-500 dark:text-red-300"
            >
              <Heart size={13} className={liked ? "fill-current" : undefined} /> {likes} Likes
            </button>
            <div className="relative" ref={shareMenuRef}>
              <button type="button" onClick={() => void sharePost()} className="inline-flex cursor-pointer items-center gap-1">
                <Share2 size={13} /> {shares} Shares
              </button>
              {shareMenuOpen ? (
                <div className="absolute right-0 z-30 mt-2 w-52 max-w-[calc(100vw-2rem)] rounded-xl border border-[var(--avad-border)] bg-[var(--avad-bg-elevated)] p-1.5 text-left shadow-xl sm:left-1/2 sm:right-auto sm:-translate-x-1/2">
                  <button type="button" onClick={() => void copyLink()} className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-[var(--avad-text)] hover:bg-[var(--avad-bg-soft)]">
                    <Link2 size={15} /> Copy link
                  </button>
                  <button type="button" onClick={() => shareOnX()} className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-[var(--avad-text)] hover:bg-[var(--avad-bg-soft)]">
                    <svg className="size-[15px]" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                    Share on X
                  </button>
                  <button type="button" onClick={() => shareOnFacebook()} className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-[var(--avad-text)] hover:bg-[var(--avad-bg-soft)]">
                    <svg className="size-[15px]" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12S0 5.446 0 12.073c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    Share on Facebook
                  </button>
                  <button type="button" onClick={() => shareOnLinkedIn()} className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-[var(--avad-text)] hover:bg-[var(--avad-bg-soft)]">
                    <svg className="size-[15px]" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                    Share on LinkedIn
                  </button>
                  <button type="button" onClick={() => shareOnInstagram()} className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-[var(--avad-text)] hover:bg-[var(--avad-bg-soft)]">
                    <Instagram size={15} /> Share on Instagram
                  </button>
                </div>
              ) : null}
            </div>
            <span className="inline-flex items-center gap-1"><Eye size={13} /> {views} Views</span>
          </div>
        </header>

        <div className="mx-auto mt-8 max-w-[1040px]">
          <div className="blog-article-content" dangerouslySetInnerHTML={{ __html: normalizeBlogHtmlForRender(post.content) }} />

          <div className="mt-12 border-t border-[var(--avad-border)] pt-8">
            <h3 className="font-serif text-[clamp(2.2rem,3.8vw,3rem)] font-bold text-[var(--avad-text-strong)]">{commentList.length} Comments</h3>
            <div className="mt-6 space-y-4">
              {commentList.map((comment) => (
                <CommentNode
                  key={comment.id}
                  comment={comment}
                  depth={0}
                  isAuthenticated={isAuthenticated}
                  currentUserName={sessionUser?.fullName}
                  currentUserEmail={sessionUser?.email}
                  onThreadUpdated={() => void refreshComments()}
                />
              ))}
            </div>

            {sessionResolved ? (
              isAuthenticated ? (
                <form className="mt-7" onSubmit={(event) => void submitComment(event)}>
                  <div className="grid grid-cols-[50px_1fr] gap-4 border-t border-[var(--avad-border)] pt-8">
                    <div className="grid size-12 place-items-center overflow-hidden rounded-xl border border-[var(--avad-border)] bg-[var(--avad-bg-elevated)] text-sm font-semibold text-[var(--avad-text-strong)]">
                      {initialsFromName(sessionUser?.fullName ?? "AV")}
                    </div>
                    <div>
                      <textarea
                        data-writing-assistance
                        maxLength={3000}
                        value={message}
                        onChange={(event) => setMessage(event.target.value)}
                        placeholder="Write your message here"
                        className="h-36 w-full rounded-3xl border border-[var(--avad-border)] bg-transparent px-4 py-3 text-sm text-[var(--avad-text)] outline-none focus:border-[var(--avad-ring)]"
                        required
                      />
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-[11px] text-[var(--avad-text-soft)]">{message.length}/3000</span>
                        <button
                          type="submit"
                          disabled={submitting || !message.trim()}
                          className="h-10 cursor-pointer rounded-xl bg-[#311048] px-6 text-sm font-semibold text-[var(--avad-gold)] disabled:cursor-not-allowed disabled:opacity-70"
                        >
                          {submitting ? "Submitting..." : "Post Comment"}
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="mt-10 overflow-hidden rounded-[26px] bg-[var(--avad-purple)]">
                  <div className="grid md:grid-cols-2">
                    <div className="p-7 md:p-9">
                      <h4 className="max-w-[430px] font-serif text-[clamp(1.6rem,2.7vw,2.5rem)] font-bold leading-[1.08] text-[var(--avad-gold)]">
                        Join Our Community to Be Able to Interact on Threads and Posts
                      </h4>
                      <p className="mt-3 max-w-[430px] text-sm leading-6 text-[#f0e8f6] md:text-base">
                        Become part of a Christ-centered community focused on righteousness, devotion, and kingdom impact.
                      </p>
                      <Link href={`/auth/sign-up?next=${encodeURIComponent(`/blog/${post.slug}`)}`} className="mt-6 inline-flex h-10 items-center rounded-xl bg-[var(--avad-gold)] px-5 text-sm font-semibold text-[#2d0f43]">
                        Become a Member
                      </Link>
                    </div>
                    <div className="relative min-h-[220px]">
                      <Image src="/placeholders/community.png" alt="Community members" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
                    </div>
                  </div>
                </div>
              )
            ) : null}
          </div>
        </div>
      </article>

      <NewsletterSection className="mt-14 md:mt-16 xl:mt-20 2xl:mt-24" />
    </>
  );
}

function initialsFromName(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase())
    .slice(0, 2)
    .join("") || "AV";
}

function CommentNode({
  comment,
  depth,
  isAuthenticated,
  currentUserName,
  currentUserEmail,
  onThreadUpdated,
}: {
  comment: BlogComment;
  depth: number;
  isAuthenticated: boolean;
  currentUserName?: string;
  currentUserEmail?: string;
  onThreadUpdated?: () => void;
}) {
  const [likes, setLikes] = useState(comment.likes ?? 0);
  const [liked, setLiked] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }
    return localStorage.getItem(`comment_like_${comment.id}`) === "1";
  });
  const [replies, setReplies] = useState<BlogComment[]>(comment.replies ?? []);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyEmail, setReplyEmail] = useState("");
  const [replyMessage, setReplyMessage] = useState("");
  const [replying, setReplying] = useState(false);
  const [showReplies, setShowReplies] = useState(true);

  async function toggleLike() {
    const nextLiked = !liked;
    const key = `comment_like_${comment.id}`;
    setLiked(nextLiked);
    setLikes((value) => Math.max(0, value + (nextLiked ? 1 : -1)));

    try {
      await postJson(`/api/blog/comments/${comment.id}/like`, {
        action: nextLiked ? "LIKE" : "UNLIKE",
      });
      if (nextLiked) {
        localStorage.setItem(key, "1");
      } else {
        localStorage.removeItem(key);
      }
    } catch {
      setLiked(!nextLiked);
      setLikes((value) => Math.max(0, value + (nextLiked ? -1 : 1)));
    }
  }

  async function submitReply(event: React.FormEvent) {
    event.preventDefault();
    if (!isAuthenticated || !currentUserName) {
      toast.error("Please sign in to reply.");
      return;
    }

    setReplying(true);
    try {
      const created = await postJson<BlogComment>(`/api/blog/comments/${comment.id}/replies`, {
        name: currentUserName,
        email: currentUserEmail || replyEmail || undefined,
        message: replyMessage,
      });
      setReplyEmail("");
      setReplyMessage("");
      setShowReplyForm(false);
      if (created.status === "PUBLISHED") {
        setReplies((prev) => [...prev, created]);
        onThreadUpdated?.();
      }
      toast.success(
        created.status === "PUBLISHED"
          ? "Reply posted successfully."
          : "Reply submitted. It will appear after approval.",
      );
    } finally {
      setReplying(false);
    }
  }

  return (
    <article className={["border-b border-[var(--avad-border)] pb-5", depth > 0 ? "ml-5 mt-3 border-l border-[var(--avad-border)] pl-4" : ""].join(" ")}>
      <div className="grid grid-cols-[44px_1fr] gap-3">
        <div className="grid size-11 place-items-center rounded-xl bg-[var(--avad-gold)]/35 text-xs font-bold text-[var(--avad-text-strong)]">
          {initialsFromName(comment.authorName)}
        </div>
        <div>
          <h4 className="font-serif text-[1.35rem] font-bold text-[var(--avad-text-strong)]">{comment.authorName}</h4>
          <p className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-[var(--avad-text-soft)]"><Calendar size={11} /> {formatBlogDate(comment.createdAt)}</p>
          <p className="mt-2 text-[13px] leading-6 text-[var(--avad-text)]">{comment.message}</p>
          <div className="mt-2 flex items-center gap-4 text-xs text-[var(--avad-text)]">
            <button type="button" onClick={() => void toggleLike()} className="inline-flex cursor-pointer items-center gap-1">
              <Heart size={12} className={liked ? "fill-current text-red-500 dark:text-red-300" : undefined} /> {likes} Likes
            </button>
            <button
              type="button"
              onClick={() => {
                if (!isAuthenticated) {
                  toast.error("Please sign in to reply.");
                  return;
                }
                setShowReplyForm((value) => !value);
              }}
              className="inline-flex cursor-pointer items-center gap-1"
            >
              <Reply size={12} /> Reply
            </button>
            {replies.length ? (
              <button type="button" onClick={() => setShowReplies((value) => !value)} className="inline-flex cursor-pointer items-center gap-1">
                {showReplies ? "Hide Replies" : `Show Replies (${replies.length})`}
              </button>
            ) : null}
          </div>

          {showReplyForm ? (
            <form className="mt-3 space-y-2" onSubmit={(event) => void submitReply(event)}>
              <div className="grid gap-2 sm:grid-cols-2">
                <input value={currentUserName ?? ""} readOnly className="rounded-xl border border-[var(--avad-border)] bg-[var(--avad-bg-soft)] px-3 py-2 text-sm text-[var(--avad-text-soft)] outline-none" />
                <input
                  value={replyEmail}
                  onChange={(event) => setReplyEmail(event.target.value)}
                  placeholder="Email (optional)"
                  className="rounded-xl border border-[var(--avad-border)] bg-transparent px-3 py-2 text-sm text-[var(--avad-text)] outline-none"
                />
              </div>
              <textarea
                data-writing-assistance
                value={replyMessage}
                onChange={(event) => setReplyMessage(event.target.value)}
                placeholder="Reply message"
                className="h-28 w-full rounded-xl border border-[var(--avad-border)] bg-transparent px-3 py-2 text-sm text-[var(--avad-text)] outline-none"
                required
              />
              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  disabled={replying}
                  className="h-9 cursor-pointer rounded-xl bg-[#311048] px-4 text-xs font-semibold text-[var(--avad-gold)] disabled:opacity-70"
                >
                  {replying ? "Posting..." : "Post Reply"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowReplyForm(false)}
                  className="h-9 cursor-pointer rounded-xl border border-[var(--avad-border)] px-4 text-xs text-[var(--avad-text)]"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : null}

          {replies.length && showReplies ? (
            <div className="mt-3 space-y-3">
              {replies.map((reply) => (
                <CommentNode
                  key={reply.id}
                  comment={reply}
                  depth={depth + 1}
                  isAuthenticated={isAuthenticated}
                  currentUserName={currentUserName}
                  currentUserEmail={currentUserEmail}
                  onThreadUpdated={onThreadUpdated}
                />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}
