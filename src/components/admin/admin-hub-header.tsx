"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export interface HubTab {
  label: string;
  href: string;
  badge?: string | number;
}

export interface AdminHubHeaderProps {
  title: string;
  badgeText?: string;
  description: string;
  tabs: HubTab[];
  actions?: React.ReactNode;
}

export function AdminHubHeader({
  title,
  badgeText,
  description,
  tabs,
  actions,
}: AdminHubHeaderProps) {
  const pathname = usePathname();

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs mb-6 overflow-hidden">
      {/* Top Title & Actions Row */}
      <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold tracking-tight text-navy-950">{title}</h1>
            {badgeText && (
              <span className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[10px] font-bold">
                {badgeText}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 max-w-2xl">{description}</p>
        </div>

        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </div>

      {/* Horizontal Sub-Navigation Tabs */}
      <div className="px-5 bg-slate-50/50 flex items-center gap-1 overflow-x-auto scrollbar-none">
        {tabs.map((tab) => {
          const isActive =
            pathname === tab.href ||
            (tab.href !== "/admin/dashboard" && pathname.startsWith(tab.href));

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`relative px-3.5 py-2.5 text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 border-b-2 ${
                isActive
                  ? "border-primary text-primary bg-white shadow-2xs rounded-t-lg -mb-px"
                  : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
              }`}
            >
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                    isActive
                      ? "bg-primary text-white"
                      : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
