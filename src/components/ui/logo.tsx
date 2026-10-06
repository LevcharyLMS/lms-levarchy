import React from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  variant?: "light" | "dark" | "icon-only" | "full";
  className?: string;
  imageClassName?: string;
  showBadge?: boolean;
  badgeText?: string;
  subtitle?: string;
  href?: string;
}

export function Logo({
  variant = "light",
  className,
  imageClassName,
  showBadge = false,
  badgeText = "LMS",
  subtitle,
  href = "/",
}: LogoProps) {
  // If variant is "dark", we use the white text version for dark backgrounds like the Footer
  // If variant is "light", we use the default transparent full logo
  // If variant is "icon-only", we use the standalone constellation mark
  const isDark = variant === "dark";
  const isIconOnly = variant === "icon-only";

  const content = (
    <div className={cn("inline-flex items-center gap-2.5 group", className)}>
      {isIconOnly ? (
        <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
          <Image
            src="/logo-icon.png"
            alt="Levchary"
            width={32}
            height={32}
            className={cn("w-auto h-8 object-contain transition-transform group-hover:scale-105", imageClassName)}
            priority
          />
        </div>
      ) : (
        <div className="relative flex items-center gap-2">
          <Image
            src={isDark ? "/logo-white.png" : "/logo-transparent.png"}
            alt="Levchary LMS"
            width={160}
            height={40}
            className={cn("h-8 w-auto object-contain transition-transform group-hover:scale-[1.02]", imageClassName)}
            priority
          />
          {showBadge && (
            <span
              className={cn(
                "text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded border self-center",
                isDark
                  ? "bg-teal-950/80 text-teal-300 border-teal-800/80"
                  : "bg-teal-50 text-teal-700 border-teal-200/50"
              )}
            >
              {badgeText}
            </span>
          )}
        </div>
      )}

      {subtitle && (
        <span
          className={cn(
            "text-[10px] font-medium block",
            isDark ? "text-slate-400" : "text-slate-400"
          )}
        >
          {subtitle}
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex focus:outline-none">
        {content}
      </Link>
    );
  }

  return content;
}
