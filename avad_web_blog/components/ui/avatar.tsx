import * as React from "react";

import { cn } from "@/lib/utils";

type AvatarProps = React.HTMLAttributes<HTMLDivElement>;

type AvatarFallbackProps = React.HTMLAttributes<HTMLSpanElement>;

export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(function Avatar(
  { className, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn("relative inline-flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full", className)}
      {...props}
    />
  );
});

export const AvatarFallback = React.forwardRef<HTMLSpanElement, AvatarFallbackProps>(function AvatarFallback(
  { className, ...props },
  ref,
) {
  return (
    <span
      ref={ref}
      className={cn("inline-flex size-full items-center justify-center rounded-full bg-[var(--avad-bg-soft)] text-[var(--avad-text-strong)]", className)}
      {...props}
    />
  );
});
