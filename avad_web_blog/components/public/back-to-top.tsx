"use client";

import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";

export function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setIsVisible(window.scrollY > 280);
    };

    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleScrollTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!isVisible) {
    return null;
  }

  return (
    <button
      onClick={handleScrollTop}
      className="fixed bottom-6 right-6 z-20 grid size-10 cursor-pointer place-items-center rounded-xl bg-[var(--avad-purple)] text-[var(--avad-gold)] shadow-lg"
      aria-label="Back to top"
    >
      <ArrowUp size={18} />
    </button>
  );
}
