import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Account Access | Dr. Ngozi Blessing Umoru",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
