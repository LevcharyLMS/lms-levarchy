"use client";

import React, { useState } from "react";
import Link from "next/link";
import { db } from "@/lib/data-store";
import { useAuth } from "@/context/auth-context";
import { ClassLocation } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  MapPin,
  Plus,
  CheckCircle2,
  XCircle,
  Building2,
  Users,
  BookOpen,
  FileSpreadsheet,
} from "lucide-react";
import { AdminHubHeader } from "@/components/admin/admin-hub-header";

export default function AdminLocationsPage() {
  const { user: currentAdmin } = useAuth();
  const [locations, setLocations] = useState<ClassLocation[]>(db.state.class_locations);
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("MA");
  const [postalCode, setPostalCode] = useState("");
  const [capacity, setCapacity] = useState(20);
  const [notice, setNotice] = useState<string | null>(null);

  // Compute live classes assigned to locations
  const classes = db.state.classes || [];
  const getLocationClassCount = (locId: string) => {
    return classes.filter(
      (c) => c.location_id === locId || c.format.includes("PHYSICAL")
    ).length;
  };

  const handleAddLocation = (e: React.FormEvent) => {
    e.preventDefault();

    const newLoc: ClassLocation = {
      id: `loc-${Date.now()}`,
      name,
      address,
      city,
      state,
      postal_code: postalCode,
      country: "US",
      capacity: Number(capacity),
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    db.state.class_locations.push(newLoc);
    setLocations([...db.state.class_locations]);
    setShowAdd(false);
    setName("");
    setAddress("");
    setCity("");
    setPostalCode("");

    db.logAudit({
      actor_id: currentAdmin?.id || "usr-admin-1",
      actor_role: "ADMIN",
      action: "PHYSICAL_LOCATION_CREATED",
      entity_type: "CLASS_LOCATION",
      entity_id: newLoc.id,
      metadata: { name, city, capacity },
    });

    setNotice(`Academic facility "${name}" added to approved network.`);
    setTimeout(() => setNotice(null), 4000);
  };

  const handleToggleStatus = (locId: string) => {
    const loc = db.state.class_locations.find((l) => l.id === locId);
    if (!loc) return;

    loc.is_active = !loc.is_active;
    setLocations([...db.state.class_locations]);

    db.logAudit({
      actor_id: currentAdmin?.id || "usr-admin-1",
      actor_role: "ADMIN",
      action: loc.is_active ? "PHYSICAL_LOCATION_ACTIVATED" : "PHYSICAL_LOCATION_DEACTIVATED",
      entity_type: "CLASS_LOCATION",
      entity_id: locId,
      metadata: { name: loc.name, is_active: loc.is_active },
    });

    setNotice(`"${loc.name}" marked as ${loc.is_active ? "Active" : "Temporarily Offline"}.`);
    setTimeout(() => setNotice(null), 4000);
  };

  const bookingTabs = [
    { label: "Classes & Approvals", href: "/admin/classes" },
    { label: "Physical Venues", href: "/admin/locations" },
    { label: "Bookings Ledger", href: "/admin/bookings" },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <AdminHubHeader
        title="Classes & Bookings Hub"
        badgeText="Physical Venues"
        description="Admin-controlled classroom facilities and verified learning suites for in-person 1-on-1 and group cohort sessions."
        tabs={bookingTabs}
        actions={
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm" className="h-8 text-xs border-slate-200 gap-1.5 text-teal-700 hover:bg-teal-50">
              <Link href="/admin/reports">
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Reports Hub CSV</span>
              </Link>
            </Button>
            <Button
              onClick={() => setShowAdd(true)}
              size="sm"
              className="text-xs h-8 bg-teal-600 hover:bg-teal-700 text-white gap-1.5 shadow-2xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Academic Facility</span>
            </Button>
          </div>
        }
      />

      {notice && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{notice}</span>
          </div>
          <button onClick={() => setNotice(null)} className="underline font-semibold text-emerald-900">
            Dismiss
          </button>
        </div>
      )}

      {showAdd && (
        <Card className="border-slate-200 shadow-sm animate-accordion-down">
          <CardContent className="p-6">
            <h2 className="text-sm font-bold text-navy-950 mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-teal-600" /> New Approved Facility Details
            </h2>

            <form onSubmit={handleAddLocation} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Facility Name</label>
                <Input
                  placeholder="e.g. Levchary Back Bay Learning Suites"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="text-xs h-8.5"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Street Address</label>
                  <Input
                    placeholder="200 Boylston Street, Floor 3"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="text-xs h-8.5"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Max Room Capacity</label>
                  <Input
                    type="number"
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value))}
                    min={5}
                    className="text-xs h-8.5"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
                  <Input value={city} onChange={(e) => setCity(e.target.value)} className="text-xs h-8.5" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">State</label>
                  <Input value={state} onChange={(e) => setState(e.target.value)} className="text-xs h-8.5" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Postal Code</label>
                  <Input value={postalCode} onChange={(e) => setPostalCode(e.target.value)} className="text-xs h-8.5" required />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowAdd(false)} className="text-xs">
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold">
                  Save Approved Facility
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Locations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {locations.map((loc) => {
          const classCount = getLocationClassCount(loc.id);
          const isActive = loc.is_active !== false;

          return (
            <Card key={loc.id} className="border-slate-200 shadow-xs flex flex-col justify-between">
              <CardContent className="p-6 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    isActive ? "bg-teal-50 text-teal-700" : "bg-slate-100 text-slate-400"
                  }`}>
                    <Building2 className="w-5 h-5" />
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      isActive
                        ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                        : "bg-slate-100 text-slate-600 border-slate-200"
                    }`}
                  >
                    {isActive ? "Operational" : "Offline / Maintenance"}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-sm text-navy-950">{loc.name}</h3>
                  <p className="text-xs text-slate-600 mt-1">
                    {loc.address}, {loc.city}, {loc.state} {loc.postal_code}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>
                    Capacity: <strong className="text-slate-800">{loc.capacity} seats</strong>
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-teal-700 font-medium">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>In-person Venue</span>
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleStatus(loc.id)}
                    className={`h-7 px-2.5 text-xs font-medium ${
                      isActive
                        ? "text-slate-500 hover:text-amber-700 hover:bg-amber-50"
                        : "text-emerald-700 hover:bg-emerald-50"
                    }`}
                  >
                    {isActive ? "Mark Maintenance" : "Re-activate Facility"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
