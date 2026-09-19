"use client";

import React from "react";
import { formatMoney } from "@/lib/utils";

interface MoneyDisplayProps {
  cents: number;
  currency?: string;
  className?: string;
  label?: string;
}

export function MoneyDisplay({ cents, currency = "USD", className = "", label }: MoneyDisplayProps) {
  const formatted = formatMoney(cents, currency);

  return (
    <div className={`inline-flex items-baseline gap-1 ${className}`}>
      {label && <span className="text-xs text-slate-500 font-normal">{label}</span>}
      <span className="font-bold tracking-tight text-slate-900">{formatted}</span>
    </div>
  );
}
