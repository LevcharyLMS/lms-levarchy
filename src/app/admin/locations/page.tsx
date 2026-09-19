"use client";

import React, { useState } from "react";
import { db } from "@/lib/data-store";
import { ClassLocation } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Plus, CheckCircle2 } from "lucide-react";

export default function AdminLocationsPage() {
  const [locations, setLocations] = useState<ClassLocation[]>(db.state.class_locations);
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("MA");
  const [postalCode, setPostalCode] = useState("");
  const [capacity, setCapacity] = useState(20);

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

    db.logAudit({
      actor_id: "usr-admin-1",
      actor_role: "ADMIN",
      action: "PHYSICAL_LOCATION_CREATED",
      entity_type: "CLASS_LOCATION",
      entity_id: newLoc.id,
      metadata: { name, city, capacity },
    });
  };

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-navy-950">
            Approved Physical Learning Hubs
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Admin-controlled classroom facilities for in-person 1-on-1 and group cohort sessions.
          </p>
        </div>

        <Button onClick={() => setShowAdd(true)} variant="default" size="sm" className="gap-1.5 shadow-xs">
          <Plus className="w-4 h-4" /> Add Academic Facility
        </Button>
      </div>

      {showAdd && (
        <Card className="border-slate-200 shadow-sm animate-accordion-down">
          <CardContent className="p-6">
            <h2 className="text-sm font-bold text-navy-950 mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-teal-600" /> New Approved Location Details
            </h2>

            <form onSubmit={handleAddLocation} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Facility Name</label>
                <Input placeholder="e.g. Levchary Back Bay Learning Suites" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Street Address</label>
                  <Input placeholder="200 Boylston Street, Floor 3" value={address} onChange={(e) => setAddress(e.target.value)} required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Max Room Capacity</label>
                  <Input type="number" value={capacity} onChange={(e) => setCapacity(Number(e.target.value))} min={5} required />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
                  <Input value={city} onChange={(e) => setCity(e.target.value)} required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">State</label>
                  <Input value={state} onChange={(e) => setState(e.target.value)} required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Postal Code</label>
                  <Input value={postalCode} onChange={(e) => setPostalCode(e.target.value)} required />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowAdd(false)}>Cancel</Button>
                <Button type="submit" variant="default" size="sm">Save Approved Facility</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Locations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {locations.map((loc) => (
          <Card key={loc.id} className="border-slate-200 shadow-xs flex flex-col justify-between">
            <CardContent className="p-6 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  Approved
                </span>
              </div>

              <div>
                <h3 className="font-bold text-sm text-navy-950">{loc.name}</h3>
                <p className="text-xs text-slate-600 mt-1">{loc.address}, {loc.city}, {loc.state} {loc.postal_code}</p>
              </div>

              <div className="pt-2 border-t border-slate-100 text-xs text-slate-500">
                Facility Capacity: <strong className="text-slate-800">{loc.capacity} seats</strong>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
