export type ContactMessageStatus = "UNREAD" | "READ" | "REPLIED";

export type ContactMessageReply = {
  id: string;
  contactMessageId: string;
  responderId: string | null;
  responderName: string;
  responderEmail: string;
  subject: string;
  bodyHtml: string;
  bodyText: string;
  createdAt: string;
};

export type ContactMessageSummary = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  messagePreview: string;
  status: ContactMessageStatus;
  readAt: string | null;
  repliedAt: string | null;
  repliesCount: number;
  createdAt: string;
  updatedAt: string;
};

export type ContactMessageDetail = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  status: ContactMessageStatus;
  readAt: string | null;
  repliedAt: string | null;
  createdAt: string;
  updatedAt: string;
  lastRepliedById: string | null;
  lastRepliedBy: {
    id: string;
    fullName: string;
    email: string;
  } | null;
  replies: ContactMessageReply[];
};

export type ContactMessagesResponse = {
  items: ContactMessageSummary[];
  stats: {
    total: number;
    unread: number;
    read: number;
    replied: number;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export function formatContactDateTime(value: string | null | undefined) {
  if (!value) {
    return "";
  }

  return new Date(value).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function statusPillClasses(status: ContactMessageStatus) {
  if (status === "UNREAD") {
    return "bg-[#fdecec] text-[#b42318]";
  }

  if (status === "REPLIED") {
    return "bg-[#e8f5ea] text-[#0f7b44]";
  }

  return "bg-[#e8f0ff] text-[#1f4d99]";
}

export function buildMailtoReplyLink(message: {
  email: string;
  name: string;
  subject: string;
}) {
  const subject = `Re: ${message.subject}`;
  const body = `Hello ${message.name},\n\n`;

  return `mailto:${encodeURIComponent(message.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
