"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Megaphone,
  Plus,
  Clock,
  Eye,
  Download,
  Trash2,
  ExternalLink,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Video,
  Image as ImageIcon,
  RefreshCw,
  Search,
  Sparkles,
  Calendar,
  Layers,
  Upload,
  Cloud,
  FileSpreadsheet,
  Filter,
  Loader2,
  Info,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AdvertItem, AdvertMediaType } from "@/types";
import { AdminHubHeader } from "@/components/admin/admin-hub-header";
import { DetailDrawer } from "@/components/shared/detail-drawer";
import { useAuth } from "@/context/auth-context";

export default function AdminAdvertsPage() {
  const { user: currentAdmin } = useAuth();
  const [adverts, setAdverts] = useState<AdvertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "EXPIRED" | "PAUSED">("ALL");
  const [mediaTypeFilter, setMediaTypeFilter] = useState<"ALL" | "IMAGE" | "VIDEO">("ALL");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Cloudinary / File Upload State
  const [uploadMode, setUploadMode] = useState<"FILE" | "URL">("FILE");
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadedStorageType, setUploadedStorageType] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Selected advert for detail drawer
  const [selectedAdvert, setSelectedAdvert] = useState<AdvertItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Create Form State
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    media_type: "IMAGE" as AdvertMediaType,
    media_url: "",
    thumbnail_url: "",
    target_url: "",
    downloadable: true,
    duration_hours: "168", // Default 7 days
    custom_end_date: "",
  });

  const fetchAdverts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/adverts?all=true");
      if (res.ok) {
        const data = await res.json();
        const advertList = Array.isArray(data) ? data : data?.adverts || [];
        setAdverts(advertList);
      }
    } catch (err) {
      console.error("Failed to load adverts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdverts();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    setErrorMessage("");
    try {
      const body = new FormData();
      body.append("file", file);
      body.append("mediaType", formData.media_type);

      const res = await fetch("/api/admin/adverts/upload", {
        method: "POST",
        body,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "File upload failed");
      }

      const data = await res.json();
      setFormData((prev) => ({
        ...prev,
        media_url: data.fileUrl,
        thumbnail_url: prev.thumbnail_url || data.fileUrl,
      }));
      setUploadedStorageType(data.storage === "CLOUDINARY" ? "Cloudinary Cloud Storage" : "Local Server Storage");
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to upload file to cloud storage.");
    } finally {
      setUploadingFile(false);
    }
  };

  const handleToggleActive = async (advert: AdvertItem) => {
    try {
      const res = await fetch(`/api/adverts/${advert.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          is_active: !advert.is_active,
          admin_id: currentAdmin?.id,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        const updatedItem = updated?.advert || updated;
        setAdverts((prev) => prev.map((a) => (a.id === updatedItem.id ? updatedItem : a)));
        if (selectedAdvert?.id === advert.id) {
          setSelectedAdvert(updatedItem);
        }
      }
    } catch (err) {
      console.error("Failed to toggle status:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this advert?")) return;
    try {
      const res = await fetch(`/api/adverts/${id}`, { method: "DELETE" });
      if (res.ok) {
        setAdverts((prev) => prev.filter((a) => a.id !== id));
        if (selectedAdvert?.id === id) {
          setIsDrawerOpen(false);
          setSelectedAdvert(null);
        }
      }
    } catch (err) {
      console.error("Failed to delete advert:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!formData.title || !formData.media_url) {
      setErrorMessage("Please enter both a title and upload or provide a media URL.");
      return;
    }

    setSubmitting(true);
    try {
      const payload: any = {
        title: formData.title,
        description: formData.description,
        media_type: formData.media_type,
        media_url: formData.media_url,
        thumbnail_url: formData.thumbnail_url || formData.media_url,
        target_url: formData.target_url || undefined,
        downloadable: formData.downloadable,
        admin_id: currentAdmin?.id,
      };

      if (formData.duration_hours === "custom" && formData.custom_end_date) {
        payload.end_date = new Date(formData.custom_end_date).toISOString();
      } else if (formData.duration_hours !== "custom") {
        payload.duration_hours = parseInt(formData.duration_hours, 10);
      }

      const res = await fetch("/api/adverts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create advert");
      }

      const created = await res.json();
      const newAdvert = created?.advert || created;
      setAdverts((prev) => [newAdvert, ...(Array.isArray(prev) ? prev : [])]);
      setIsModalOpen(false);
      setFormData({
        title: "",
        description: "",
        media_type: "IMAGE",
        media_url: "",
        thumbnail_url: "",
        target_url: "",
        downloadable: true,
        duration_hours: "168",
        custom_end_date: "",
      });
      setUploadedStorageType(null);
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  // Helper for status tag & timer display
  const getStatusInfo = (advert: AdvertItem) => {
    if (!advert.is_active) {
      return {
        key: "PAUSED",
        label: "Paused",
        color: "bg-slate-100 text-slate-700 border-slate-300",
        icon: XCircle,
      };
    }

    const now = new Date();
    if (advert.start_date && new Date(advert.start_date) > now) {
      return {
        key: "SCHEDULED",
        label: "Scheduled",
        color: "bg-blue-50 text-blue-700 border-blue-200",
        icon: Clock,
      };
    }

    if (advert.end_date && new Date(advert.end_date) <= now) {
      return {
        key: "EXPIRED",
        label: "Expired (Archived)",
        color: "bg-amber-50 text-amber-700 border-amber-200",
        icon: AlertCircle,
      };
    }

    return {
      key: "ACTIVE",
      label: "Active",
      color: "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: CheckCircle2,
    };
  };

  const getRemainingTime = (endDateStr: string | null | undefined) => {
    if (!endDateStr) return "Permanent / No Expiry";
    const end = new Date(endDateStr).getTime();
    const now = new Date().getTime();
    const diff = end - now;

    if (diff <= 0) return "Expired (Off Homepage)";

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    const remHours = hours % 24;

    if (days > 0) return `${days}d ${remHours}h remaining`;
    return `${hours}h remaining`;
  };

  // Filter pipeline
  const filteredAdverts = adverts.filter((a) => {
    // 1. Text Search
    const matchesSearch =
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.description && a.description.toLowerCase().includes(searchTerm.toLowerCase()));
    if (!matchesSearch) return false;

    // 2. Media Type Filter
    if (mediaTypeFilter !== "ALL" && a.media_type !== mediaTypeFilter) return false;

    // 3. Status Filter
    const status = getStatusInfo(a);
    if (statusFilter === "ACTIVE" && status.key !== "ACTIVE") return false;
    if (statusFilter === "EXPIRED" && status.key !== "EXPIRED") return false;
    if (statusFilter === "PAUSED" && status.key !== "PAUSED") return false;

    return true;
  });

  const activeCount = adverts.filter((a) => getStatusInfo(a).key === "ACTIVE").length;
  const expiredCount = adverts.filter((a) => getStatusInfo(a).key === "EXPIRED").length;
  const totalDownloads = adverts.reduce((sum, a) => sum + (a.download_count || 0), 0);
  const totalViews = adverts.reduce((sum, a) => sum + (a.view_count || 0), 0);

  const marketingTabs = [
    { label: "Adverts & Flyers", href: "/admin/adverts" },
    { label: "Marketplace Analytics", href: "/admin/analytics" },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <AdminHubHeader
        title="Marketing & Analytics Hub"
        badgeText="Homepage Arc & Intelligence"
        description="Publish interactive flyers, promotional short videos, manage cloud storage media, and track engagement."
        tabs={marketingTabs}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchAdverts}
              className="h-8 text-xs border-slate-200 gap-1.5"
              disabled={loading}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </Button>
            <Button
              onClick={() => setIsModalOpen(true)}
              className="h-8 px-3 text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-1.5 shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Advert</span>
            </Button>
          </div>
        }
      />

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Active on Homepage
            </span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <Megaphone className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-navy-950">{activeCount}</p>
          <span className="text-xs text-slate-400 mt-1 block">Live in curved arc dock</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Expired / Archived
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-navy-950">{expiredCount}</p>
          <span className="text-xs text-slate-400 mt-1 block">Auto-hidden from visitors</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Impressions
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-navy-950">{totalViews}</p>
          <span className="text-xs text-slate-400 mt-1 block">Lightbox views recorded</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Flyer Downloads
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Download className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-navy-950">{totalDownloads}</p>
          <span className="text-xs text-slate-400 mt-1 block">Shared on social channels</span>
        </div>
      </div>

      {/* Search & Status Filter Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search adverts by title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
            />
          </div>

          {/* Status Dropdown Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-400">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active Only</option>
              <option value="EXPIRED">Expired Only</option>
              <option value="PAUSED">Paused Only</option>
            </select>
          </div>

          {/* Media Type Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-400">Type:</span>
            <select
              value={mediaTypeFilter}
              onChange={(e) => setMediaTypeFilter(e.target.value as any)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="ALL">All Media</option>
              <option value="IMAGE">Flyers (Images)</option>
              <option value="VIDEO">Short Videos</option>
            </select>
          </div>
        </div>

        {/* Informative Link to Reports Tab */}
        <div className="flex items-center gap-2 text-xs text-slate-500 self-end md:self-center">
          <Button asChild variant="outline" size="sm" className="h-7 text-xs border-slate-200 gap-1.5 text-teal-700">
            <Link href="/admin/reports">
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Full Analytics CSV in Reports</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Adverts Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/75 border-b border-slate-200 uppercase tracking-wider font-semibold text-slate-500">
              <tr>
                <th className="py-3.5 px-5">Preview</th>
                <th className="py-3.5 px-5">Advert Details</th>
                <th className="py-3.5 px-5">Media Type</th>
                <th className="py-3.5 px-5">Schedule & Expiry</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5 text-center">Engagement</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAdverts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Megaphone className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
                    <p className="font-semibold text-slate-700">No matching adverts found</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Try adjusting filters or upload new promotional flyers via Cloudinary.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredAdverts.map((advert) => {
                  const status = getStatusInfo(advert);
                  const remaining = getRemainingTime(advert.end_date);
                  const StatusIcon = status.icon;

                  return (
                    <tr
                      key={advert.id}
                      onClick={() => {
                        setSelectedAdvert(advert);
                        setIsDrawerOpen(true);
                      }}
                      className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                    >
                      {/* Thumbnail Preview */}
                      <td className="py-3.5 px-5">
                        <div className="relative w-14 h-18 rounded-lg overflow-hidden bg-slate-900 border border-slate-200 shrink-0 shadow-xs">
                          <Image
                            src={advert.thumbnail_url || advert.media_url}
                            alt={advert.title}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                          {advert.media_type === "VIDEO" && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                              <Video className="w-4 h-4 text-white drop-shadow" />
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Advert Details */}
                      <td className="py-3.5 px-5 max-w-xs">
                        <p className="font-bold text-navy-950 text-xs truncate group-hover:text-teal-700 transition-colors">
                          {advert.title}
                        </p>
                        {advert.description && (
                          <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                            {advert.description}
                          </p>
                        )}
                        {advert.target_url && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-teal-600 mt-1">
                            <ExternalLink className="w-2.5 h-2.5" />
                            <span>Destination link</span>
                          </span>
                        )}
                      </td>

                      {/* Media Type */}
                      <td className="py-3.5 px-5">
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700">
                          {advert.media_type === "VIDEO" ? (
                            <>
                              <Video className="w-3 h-3 text-teal-600" />
                              Video
                            </>
                          ) : (
                            <>
                              <ImageIcon className="w-3 h-3 text-teal-600" />
                              Flyer
                            </>
                          )}
                        </div>
                      </td>

                      {/* Duration / Timer */}
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-1.5 text-xs text-slate-700">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span className="font-medium">{remaining}</span>
                        </div>
                        {advert.end_date && (
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            Ends: {new Date(advert.end_date).toLocaleDateString()}
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-5">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${status.color}`}
                        >
                          <StatusIcon className="w-3 h-3" />
                          {status.label}
                        </span>
                      </td>

                      {/* Stats */}
                      <td className="py-3.5 px-5 text-center">
                        <div className="flex items-center justify-center gap-3 text-xs text-slate-600">
                          <span className="inline-flex items-center gap-1" title="Views">
                            <Eye className="w-3 h-3 text-slate-400" />
                            {advert.view_count || 0}
                          </span>
                          <span className="inline-flex items-center gap-1" title="Downloads">
                            <Download className="w-3 h-3 text-slate-400" />
                            {advert.download_count || 0}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-5 text-right">
                        <div
                          className="flex items-center justify-end gap-1.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleActive(advert)}
                            className={`h-7 px-2 text-xs font-medium ${
                              advert.is_active
                                ? "text-amber-700 hover:bg-amber-50"
                                : "text-emerald-700 hover:bg-emerald-50"
                            }`}
                          >
                            {advert.is_active ? "Pause" : "Activate"}
                          </Button>

                          <button
                            type="button"
                            onClick={() => handleDelete(advert.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                            title="Delete Advert"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Advert Detail Inspector Drawer */}
      {selectedAdvert && (
        <DetailDrawer
          isOpen={isDrawerOpen}
          onClose={() => {
            setIsDrawerOpen(false);
            setSelectedAdvert(null);
          }}
          title={selectedAdvert.title}
          subtitle={`Promotional ${selectedAdvert.media_type === "VIDEO" ? "Video" : "Flyer"} • Added on ${new Date(
            selectedAdvert.created_at
          ).toLocaleDateString()}`}
        >
          <div className="space-y-6">
            {/* Visual Media Preview */}
            <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-900 flex items-center justify-center max-h-80">
              {selectedAdvert.media_type === "VIDEO" ? (
                <video
                  src={selectedAdvert.media_url}
                  controls
                  className="w-full h-auto max-h-80"
                />
              ) : (
                <div className="relative w-full h-80">
                  <Image
                    src={selectedAdvert.media_url}
                    alt={selectedAdvert.title}
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>
              )}
            </div>

            {/* Performance Snapshot */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Impressions</span>
                <span className="text-lg font-bold text-navy-950 mt-0.5 block">{selectedAdvert.view_count || 0}</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Flyer Downloads</span>
                <span className="text-lg font-bold text-navy-950 mt-0.5 block">{selectedAdvert.download_count || 0}</span>
              </div>
            </div>

            {/* Details & Target */}
            <div className="space-y-3">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  Description
                </span>
                <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
                  {selectedAdvert.description || "No promotional description provided."}
                </p>
              </div>

              {selectedAdvert.target_url && (
                <div>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                    Call To Action Destination URL
                  </span>
                  <a
                    href={selectedAdvert.target_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-teal-700 hover:underline flex items-center gap-1.5 break-all"
                  >
                    <span>{selectedAdvert.target_url}</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                </div>
              )}

              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  Hosting & Media Asset URL
                </span>
                <div className="text-[11px] font-mono text-slate-600 bg-slate-100 p-2.5 rounded-lg break-all">
                  {selectedAdvert.media_url}
                </div>
              </div>
            </div>

            {/* Drawer Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleToggleActive(selectedAdvert)}
                className="text-xs"
              >
                {selectedAdvert.is_active ? "Pause Visibility" : "Activate on Homepage"}
              </Button>

              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(selectedAdvert.id)}
                className="text-xs gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Advert</span>
              </Button>
            </div>
          </div>
        </DetailDrawer>
      )}

      {/* Create Advert Modal (With Cloudinary Upload & Direct URL Options) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-navy-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-lg font-bold text-navy-950">Upload New Promotional Advert</h2>
                <p className="text-xs text-slate-500">
                  Display high-impact flyers or short reels in the homepage curved arc dock.
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
                  Advert Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Masterclass Bootcamp: Cambridge Prep"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Short Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Brief highlight of the event, tutor spotlight, or announcement..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Media Type
                  </label>
                  <select
                    value={formData.media_type}
                    onChange={(e) =>
                      setFormData({ ...formData, media_type: e.target.value as AdvertMediaType })
                    }
                    className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="IMAGE">Flyer (Image)</option>
                    <option value="VIDEO">Short Video (MP4)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Duration / Timer
                  </label>
                  <select
                    value={formData.duration_hours}
                    onChange={(e) => setFormData({ ...formData, duration_hours: e.target.value })}
                    className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="24">24 Hours (1 Day)</option>
                    <option value="72">72 Hours (3 Days)</option>
                    <option value="168">7 Days (1 Week)</option>
                    <option value="720">30 Days (1 Month)</option>
                    <option value="custom">Custom Date & Time</option>
                  </select>
                </div>
              </div>

              {formData.duration_hours === "custom" && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Custom Expiration Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.custom_end_date}
                    onChange={(e) => setFormData({ ...formData, custom_end_date: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              )}

              {/* Cloudinary Upload & Media Choice */}
              <div className="space-y-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                    <Cloud className="w-3.5 h-3.5 text-teal-600" />
                    <span>Media Asset Source</span>
                  </label>
                  <div className="flex items-center gap-1 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setUploadMode("FILE")}
                      className={`px-2 py-0.5 rounded ${
                        uploadMode === "FILE"
                          ? "bg-teal-600 text-white font-medium"
                          : "text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => setUploadMode("URL")}
                      className={`px-2 py-0.5 rounded ${
                        uploadMode === "URL"
                          ? "bg-teal-600 text-white font-medium"
                          : "text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      Enter URL
                    </button>
                  </div>
                </div>

                {uploadMode === "FILE" ? (
                  <div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept={formData.media_type === "VIDEO" ? "video/mp4,video/webm" : "image/*"}
                      className="hidden"
                    />
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center cursor-pointer hover:border-teal-500 hover:bg-teal-50/30 transition-all bg-white"
                    >
                      {uploadingFile ? (
                        <div className="flex flex-col items-center gap-1.5 text-slate-500 py-2">
                          <Loader2 className="w-5 h-5 animate-spin text-teal-600" />
                          <span className="text-xs font-medium">Uploading to Cloud Storage...</span>
                        </div>
                      ) : formData.media_url ? (
                        <div className="flex flex-col items-center gap-1 text-emerald-700 py-1">
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                          <span className="text-xs font-semibold">Media Successfully Stored!</span>
                          <span className="text-[10px] text-slate-400 truncate max-w-xs">{formData.media_url}</span>
                          {uploadedStorageType && (
                            <span className="text-[10px] bg-teal-50 text-teal-700 px-2 py-0.5 rounded font-medium border border-teal-200 mt-1">
                              {uploadedStorageType}
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-1.5 text-slate-500 py-2">
                          <Upload className="w-5 h-5 text-slate-400" />
                          <span className="text-xs font-semibold text-slate-700">
                            Click to select from device or cloud
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {formData.media_type === "VIDEO"
                              ? "MP4 or WebM video (up to 50MB)"
                              : "PNG, JPG, WebP image (up to 10MB)"}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div>
                    <input
                      type="url"
                      required
                      placeholder="https://res.cloudinary.com/... or https://images.unsplash.com/..."
                      value={formData.media_url}
                      onChange={(e) => setFormData({ ...formData, media_url: e.target.value })}
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Website URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/event-registration"
                  value={formData.target_url}
                  onChange={(e) => setFormData({ ...formData, target_url: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="downloadable-toggle"
                  checked={formData.downloadable}
                  onChange={(e) => setFormData({ ...formData, downloadable: e.target.checked })}
                  className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                />
                <label htmlFor="downloadable-toggle" className="text-xs text-slate-700 font-medium">
                  Allow visitors to download flyer for offline sharing
                </label>
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
                  className="bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs"
                  disabled={submitting || uploadingFile}
                >
                  {submitting ? "Publishing..." : "Publish Advert"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
