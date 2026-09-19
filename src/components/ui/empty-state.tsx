"use client";

import React from "react";
import Link from "next/link";
import { LucideIcon } from "lucide-react";
import { Button } from "./button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  actionHref,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-10 text-center border border-dashed border-slate-200/90 rounded-2xl bg-white shadow-xs ${className}`}
    >
      <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 mb-3.5 ring-8 ring-indigo-50/50">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-bold text-navy-950 mb-1">{title}</h3>
      <p className="text-xs text-slate-500 max-w-sm mb-5 leading-relaxed">
        {description}
      </p>
      {actionLabel && (
        actionHref ? (
          <Button asChild size="sm" className="h-8 text-xs bg-primary hover:bg-primary/90 text-white rounded-lg">
            <Link href={actionHref}>{actionLabel}</Link>
          </Button>
        ) : (
          <Button
            onClick={onAction}
            size="sm"
            className="h-8 text-xs bg-primary hover:bg-primary/90 text-white rounded-lg"
          >
            {actionLabel}
          </Button>
        )
      )}
    </div>
  );
}
