"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { AlertTriangle, Wrench, Shield } from "lucide-react";

export function MaintenanceBanner() {
  const pathname = usePathname();
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState(
    "Levchary is undergoing scheduled maintenance. Some features may be temporarily unavailable."
  );

  useEffect(() => {
    const checkMaintenance = async () => {
      try {
        const res = await fetch("/api/admin/settings");
        if (res.ok) {
          const data = await res.json();
          const info = data.settings?.platform_info;
          if (info && info.maintenance_mode) {
            setMaintenanceMode(true);
            if (info.maintenance_message) {
              setMaintenanceMessage(info.maintenance_message);
            }
          } else {
            setMaintenanceMode(false);
          }
        }
      } catch {}
    };

    checkMaintenance();
  }, [pathname]);

  if (!maintenanceMode) return null;

  // If in admin workspace, display an unobtrusive top warning bar so admins can still configure
  if (pathname.startsWith("/admin")) {
    return (
      <div className="bg-rose-600 text-white text-xs py-2 px-4 flex items-center justify-between sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-2 max-w-5xl mx-auto">
          <AlertTriangle className="w-4 h-4 shrink-0 animate-bounce" />
          <span className="font-semibold">
            MAINTENANCE MODE IS CURRENTLY ACTIVE: Non-admin users are blocked by the maintenance screen.
          </span>
        </div>
      </div>
    );
  }

  // Non-admin public/student/instructor view: Full-screen maintenance mode splash screen
  return (
    <div className="fixed inset-0 z-[9999] bg-navy-950 flex flex-col items-center justify-center p-6 text-center text-white">
      <div className="max-w-md space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto shadow-inner">
          <Wrench className="w-8 h-8 animate-pulse" />
        </div>
        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
            System Maintenance Underway
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-white pt-2">
            We'll Be Right Back
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            {maintenanceMessage}
          </p>
        </div>
        <div className="pt-4 border-t border-navy-800 text-xs text-slate-500 flex items-center justify-center gap-2">
          <Shield className="w-3.5 h-3.5 text-teal-500" />
          <span>Levchary Platform Operations</span>
        </div>
      </div>
    </div>
  );
}
