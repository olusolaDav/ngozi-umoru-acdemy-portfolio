"use client";

import { MoreVertical } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type ActionMenuProps = {
  open: boolean;
  onToggle: () => void;
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  menuRootId?: string;
  triggerLabel?: string;
  containerClassName?: string;
  triggerClassName?: string;
  menuClassName?: string;
  iconSize?: number;
  children: ReactNode;
};

export function ActionMenu({
  open,
  onToggle,
  onClick,
  menuRootId,
  triggerLabel = "Open options",
  containerClassName,
  triggerClassName,
  menuClassName,
  iconSize = 15,
  children,
}: ActionMenuProps) {
  return (
    <div
      data-card-menu-root={menuRootId}
      onClick={onClick}
      className={cn("relative", open && "z-30", containerClassName)}
    >
      <button
        type="button"
        onClick={onToggle}
        className={cn("grid size-8 place-items-center rounded-full bg-gradient-to-b from-[#ca9758] to-[#3a1a56] text-white", triggerClassName)}
        aria-label={triggerLabel}
      >
        <MoreVertical size={iconSize} />
      </button>

      {open ? (
        <div
          className={cn(
            "absolute right-0 top-10 z-50 rounded-2xl border border-[var(--avad-border)] bg-[var(--avad-bg-elevated)] p-2 shadow-xl",
            menuClassName,
          )}
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}
