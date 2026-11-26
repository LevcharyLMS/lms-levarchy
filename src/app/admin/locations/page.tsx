"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/auth-context";
import { ClassLocation } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DetailDrawer } from "@/components/shared/detail-drawer";
import {
  MapPin,
  Plus,
  CheckCircle2,
  XCircle,
  Building2,
  Users,
  BookOpen,
  FileSpreadsheet,
  QrCode,
  Download,
  Printer,
  Edit2,
  Trash2,
  RefreshCw,
  Search,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { AdminHubHeader } from "@/components/admin/admin-hub-header";

export default function AdminLocationsPage() {
  const { user: currentAdmin } = useAuth();
  const [locations, setLocations] = useState<ClassLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "MAINTENANCE">("ALL");

  // Create / Edit Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<ClassLocation | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    state: "MA",
    postal_code: "",
    country: "US",
    capacity: 20,
    directions: "",
  });

  // Selected Location for QR & Inspector Drawer
  const [selectedLocation, setSelectedLocation] = useState<ClassLocation | null>(null);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/locations?all=true");
      if (res.ok) {
        const data = await res.json();
        setLocations(data.locations || []);
      }
    } catch (err) {
      console.error("Failed to load locations:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const openCreateModal = () => {
    setEditingLocation(null);
    setFormData({
      name: "",
      address: "",
      city: "",
      state: "MA",
      postal_code: "",
      country: "US",
      capacity: 20,
      directions: "",
    });
    setErrorMessage("");
    setIsModalOpen(true);
  };

  const openEditModal = (loc: ClassLocation) => {
    setEditingLocation(loc);
    setFormData({
      name: loc.name,
      address: loc.address,
      city: loc.city,
      state: loc.state,
      postal_code: loc.postal_code,
      country: loc.country || "US",
      capacity: loc.capacity,
      directions: loc.directions || "",
    });
    setErrorMessage("");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage("");

    try {
      if (editingLocation) {
        // Update existing facility
        const res = await fetch("/api/admin/locations", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingLocation.id,
            updates: {
              name: formData.name,
              address: formData.address,
              city: formData.city,
              state: formData.state,
              postal_code: formData.postal_code,
              country: formData.country,
              capacity: Number(formData.capacity),
              directions: formData.directions || null,
            },
            adminId: currentAdmin?.id,
          }),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Failed to update location");
        }

        setNotice(`Facility "${formData.name}" successfully updated.`);
      } else {
        // Create new facility
        const res = await fetch("/api/admin/locations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            capacity: Number(formData.capacity),
            adminId: currentAdmin?.id,
          }),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Failed to create location");
        }

        setNotice(`New facility "${formData.name}" added to approved network.`);
      }

      setIsModalOpen(false);
      await fetchLocations();
      setTimeout(() => setNotice(null), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (loc: ClassLocation) => {
    try {
      const res = await fetch("/api/admin/locations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: loc.id,
          updates: { is_active: !loc.is_active },
          adminId: currentAdmin?.id,
        }),
      });

      if (res.ok) {
        setNotice(`"${loc.name}" marked as ${!loc.is_active ? "Operational" : "Temporarily Offline"}.`);
        await fetchLocations();
        setTimeout(() => setNotice(null), 4000);
      }
    } catch (err) {
      console.error("Failed to toggle status:", err);
    }
  };

  const handleDeleteLocation = async (loc: ClassLocation) => {
    if (!confirm(`Are you sure you want to permanently remove "${loc.name}" from approved venues?`)) return;

    try {
      const res = await fetch(`/api/admin/locations?id=${loc.id}&adminId=${currentAdmin?.id || "usr-admin-1"}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Failed to delete venue");
        return;
      }

      setNotice(`Facility "${loc.name}" deleted successfully.`);
      if (selectedLocation?.id === loc.id) setSelectedLocation(null);
      await fetchLocations();
      setTimeout(() => setNotice(null), 4000);
    } catch (err: any) {
      alert("Error deleting location: " + err.message);
    }
  };

  const downloadQRCode = (loc: ClassLocation) => {
    if (!loc.qr_code_url) return;
    const link = document.createElement("a");
    link.href = loc.qr_code_url;
    link.download = `levchary_qr_${loc.name.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const printQRCode = (loc: ClassLocation) => {
    if (!loc.qr_code_url) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>${loc.name} - Levchary Classroom Check-In</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; text-align: center; padding: 40px; color: #0f172a; }
            .badge { display: inline-block; background: #0d9488; color: #fff; font-size: 12px; font-weight: 700; padding: 4px 12px; border-radius: 999px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 16px; }
            h1 { font-size: 24px; margin: 0 0 8px 0; }
            p { font-size: 14px; color: #64748b; margin: 0 0 24px 0; }
            img { width: 280px; height: 280px; border: 1px solid #e2e8f0; border-radius: 16px; padding: 12px; }
            .instructions { margin-top: 24px; font-size: 13px; color: #334155; line-height: 1.6; max-width: 400px; margin-left: auto; margin-right: auto; }
            .footer { margin-top: 40px; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 16px; }
          </style>
        </head>
        <body>
          <div class="badge">Levchary Verified Facility</div>
          <h1>${loc.name}</h1>
          <p>${loc.address}, ${loc.city}, ${loc.state} ${loc.postal_code}</p>
          <img src="${loc.qr_code_url}" alt="Classroom QR Code" />
          <div class="instructions">
            <strong>Scan to Check-In</strong><br />
            Students and instructors: scan this permanent QR code using your smartphone camera upon arrival to record session attendance.
          </div>
          <div class="footer">
            Room Capacity: ${loc.capacity} seats • System Generated by Levchary Learning Management System
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const filteredLocations = locations.filter((loc) => {
    const matchesSearch =
      loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.state.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (statusFilter === "ACTIVE" && !loc.is_active) return false;
    if (statusFilter === "MAINTENANCE" && loc.is_active) return false;

    return true;
  });

  const operationalCount = locations.filter((l) => l.is_active).length;
  const maintenanceCount = locations.filter((l) => !l.is_active).length;
  const totalCapacity = locations.reduce((sum, l) => sum + (l.capacity || 0), 0);

  const bookingTabs = [
    { label: "Classes & Approvals", href: "/admin/classes" },
    { label: "Physical Venues", href: "/admin/locations" },
    { label: "Bookings Ledger", href: "/admin/bookings" },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <AdminHubHeader
        title="Classes & Bookings Hub"
        badgeText="Physical Venues & QR Check-in"
        description="Admin-controlled physical classroom suites, unique attendance QR codes, and capacity monitoring for in-person learning."
        tabs={bookingTabs}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchLocations}
              className="h-8 text-xs border-slate-200 gap-1.5"
              disabled={loading}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </Button>
            <Button asChild variant="outline" size="sm" className="h-8 text-xs border-slate-200 gap-1.5 text-teal-700 hover:bg-teal-50">
              <Link href="/admin/reports">
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Venues CSV in Reports</span>
              </Link>
            </Button>
            <Button
              onClick={openCreateModal}
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
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{notice}</span>
          </div>
          <button onClick={() => setNotice(null)} className="underline font-semibold text-emerald-900">
            Dismiss
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1">
              Operational Facilities
            </span>
            <p className="text-2xl font-bold text-navy-950">{operationalCount}</p>
            <span className="text-[11px] text-emerald-600 font-medium mt-0.5 block">Ready for in-person classes</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1">
              Total Seat Capacity
            </span>
            <p className="text-2xl font-bold text-navy-950">{totalCapacity}</p>
            <span className="text-[11px] text-slate-400 font-medium mt-0.5 block">Approved classroom desks</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1">
              Offline / Maintenance
            </span>
            <p className="text-2xl font-bold text-navy-950">{maintenanceCount}</p>
            <span className="text-[11px] text-amber-600 font-medium mt-0.5 block">Temporarily closed suites</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search venue name, address, or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all text-navy-950 font-medium"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <span className="text-xs text-slate-400 font-medium">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-700 font-semibold"
          >
            <option value="ALL">All Venues</option>
            <option value="ACTIVE">Operational Only</option>
            <option value="MAINTENANCE">Offline / Maintenance</option>
          </select>

          {(searchQuery || statusFilter !== "ALL") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("ALL");
              }}
              className="text-xs text-teal-700 hover:underline px-2 py-1 font-semibold"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Locations Grid */}
      {loading ? (
        <div className="p-16 text-center text-slate-400 text-xs bg-white rounded-2xl border border-slate-200">
          <Loader2 className="w-6 h-6 animate-spin text-teal-600 mx-auto mb-2" />
          Loading approved physical learning suites...
        </div>
      ) : filteredLocations.length === 0 ? (
        <div className="p-16 text-center text-slate-400 text-xs bg-white rounded-2xl border border-slate-200">
          <Building2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="font-semibold text-slate-700 text-sm">No physical venues found</p>
          <p className="text-xs text-slate-400 mt-1">
            Click &quot;Add Academic Facility&quot; above to create and generate QR credentials for physical learning centers.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLocations.map((loc) => {
            const isActive = loc.is_active !== false;

            return (
              <Card
                key={loc.id}
                className="border-slate-200 shadow-xs flex flex-col justify-between hover:border-teal-300 transition-all group"
              >
                <CardContent className="p-6 space-y-4">
                  {/* Top Bar: Icon + Status + QR Quick Trigger */}
                  <div className="flex items-start justify-between gap-2">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isActive ? "bg-teal-50 text-teal-700" : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      <Building2 className="w-5 h-5" />
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedLocation(loc);
                          setIsQRModalOpen(true);
                        }}
                        title="View & Print Attendance QR Code"
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-teal-50 hover:border-teal-300 text-slate-600 hover:text-teal-700 transition-colors flex items-center gap-1 text-[11px] font-semibold"
                      >
                        <QrCode className="w-3.5 h-3.5 text-teal-600" />
                        <span>QR Code</span>
                      </button>

                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                          isActive
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                            : "bg-slate-100 text-slate-600 border-slate-200"
                        }`}
                      >
                        {isActive ? "Operational" : "Offline"}
                      </span>
                    </div>
                  </div>

                  {/* Facility Details */}
                  <div>
                    <h3 className="font-bold text-sm text-navy-950 group-hover:text-teal-700 transition-colors">
                      {loc.name}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {loc.address}, {loc.city}, {loc.state} {loc.postal_code}
                    </p>
                    {loc.directions && (
                      <p className="text-[11px] text-slate-400 italic mt-1 line-clamp-2">
                        {loc.directions}
                      </p>
                    )}
                  </div>

                  {/* Capacity & Venue Type */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>
                      Room Capacity: <strong className="text-slate-800">{loc.capacity} seats</strong>
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-teal-700 font-medium">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Verified In-Person</span>
                    </span>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleStatus(loc)}
                      className={`h-7 px-2.5 text-xs font-medium ${
                        isActive
                          ? "text-slate-500 hover:text-amber-700 hover:bg-amber-50"
                          : "text-emerald-700 hover:bg-emerald-50"
                      }`}
                    >
                      {isActive ? "Mark Maintenance" : "Re-activate Facility"}
                    </Button>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openEditModal(loc)}
                        title="Edit Facility"
                        className="p-1.5 text-slate-400 hover:text-navy-950 rounded-lg hover:bg-slate-100 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteLocation(loc)}
                        title="Delete Facility"
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* QR Code Presentation Modal */}
      {isQRModalOpen && selectedLocation && (
        <div className="fixed inset-0 bg-navy-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl text-center space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Official Classroom QR Code
              </span>
              <button
                onClick={() => {
                  setIsQRModalOpen(false);
                  setSelectedLocation(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <div>
              <h2 className="text-base font-bold text-navy-950">{selectedLocation.name}</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {selectedLocation.address}, {selectedLocation.city}, {selectedLocation.state}
              </p>
            </div>

            {/* QR Image Container */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 inline-block mx-auto">
              {selectedLocation.qr_code_url ? (
                <div className="relative w-56 h-56 mx-auto bg-white p-2 rounded-xl border border-slate-100 shadow-xs">
                  <Image
                    src={selectedLocation.qr_code_url}
                    alt={selectedLocation.name}
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="w-56 h-56 flex items-center justify-center text-slate-400 text-xs">
                  Generating QR Code...
                </div>
              )}
            </div>

            <p className="text-xs text-slate-600 leading-relaxed px-2">
              Display this unique QR placard inside the room. Students and instructors scan it with their phone camera to instantly verify classroom presence.
            </p>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadQRCode(selectedLocation)}
                className="flex-1 text-xs gap-1.5 border-slate-200"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PNG</span>
              </Button>
              <Button
                size="sm"
                onClick={() => printQRCode(selectedLocation)}
                className="flex-1 text-xs gap-1.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Placard</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Facility Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-navy-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
              <div>
                <h2 className="text-base font-bold text-navy-950">
                  {editingLocation ? "Edit Academic Facility" : "Add New Academic Facility"}
                </h2>
                <p className="text-xs text-slate-500">
                  Approved in-person venue with permanent QR check-in capabilities.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            {errorMessage && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Facility / Center Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Levchary Back Bay Learning Lab - Suite 400"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 200 Boylston Street, Floor 4"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Room Capacity *
                  </label>
                  <input
                    type="number"
                    required
                    min={2}
                    max={200}
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">City *</label>
                  <input
                    type="text"
                    required
                    placeholder="Boston"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">State *</label>
                  <input
                    type="text"
                    required
                    placeholder="MA"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Postal Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="02116"
                    value={formData.postal_code}
                    onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Arrival Directions & Security Access Instructions (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Check in with security guard on ground floor. Keycard required for elevator to 4th floor."
                  value={formData.directions}
                  onChange={(e) => setFormData({ ...formData, directions: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                  disabled={submitting}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={submitting}
                  className="bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs gap-1.5"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingLocation ? "Save Changes" : "Create Facility"}</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
