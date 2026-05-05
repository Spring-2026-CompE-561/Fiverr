"use client";

import { cn } from "@/lib/utils";

const sizes = {
  sm: "size-8 text-xs",
  md: "size-10 text-sm",
  lg: "size-20 text-xl",
};

type UserAvatarProps = {
  name: string;
  avatarUrl?: string | null;
  size?: keyof typeof sizes;
  className?: string;
};

export function UserAvatar({
  name,
  avatarUrl,
  size = "sm",
  className,
}: UserAvatarProps) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

  const container = cn(
    "relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted font-semibold text-muted-foreground ring-2 ring-border",
    sizes[size],
    className,
  );

  if (avatarUrl?.trim()) {
    return (
      <span className={container}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={avatarUrl.trim()}
          alt=""
          className="size-full object-cover"
          referrerPolicy="no-referrer"
        />
      </span>
    );
  }

  return <span className={container}>{initials || "?"}</span>;
}
