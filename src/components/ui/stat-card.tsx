"use client";

import React from "react";
import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "./card";

interface StatCardProps {
  title: string;
  value: React.ReactNode;
  subtitle?: string;
  icon: LucideIcon;
  variant?: "indigo" | "teal" | "gold" | "emerald" | "rose" | "purple";
  trend?: {
    value: string;
    isPositive: boolean;
  };
  className?: string;
}

const variantStyles = {
  indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
  teal: "bg-teal-50 text-teal-600 border-teal-100",
  gold: "bg-amber-50 text-amber-600 border-amber-100",
  emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
  rose: "bg-rose-50 text-rose-600 border-rose-100",
  purple: "bg-purple-50 text-purple-600 border-purple-100",
};

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = "indigo",
  trend,
  className = "",
}: StatCardProps) {
  return (
    <Card className={`overflow-hidden border-slate-200/80 shadow-xs hover:shadow-sm transition-all bg-white ${className}`}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
            {title}
          </p>
          <div className={`flex items-center justify-center w-9 h-9 rounded-xl border ${variantStyles[variant]}`}>
            <Icon className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2.5">
          <div className="text-2xl font-bold tracking-tight text-navy-950">
            {value}
          </div>
          {(subtitle || trend) && (
            <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
              {trend && (
                <span
                  className={`font-semibold px-1.5 py-0.5 rounded text-[11px] ${
                    trend.isPositive ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                  }`}
                >
                  {trend.isPositive ? "+" : ""}{trend.value}
                </span>
              )}
              {subtitle && <span className="text-slate-400 text-[11px]">{subtitle}</span>}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
