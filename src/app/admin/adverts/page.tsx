"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AdvertItem, AdvertMediaType } from "@/types";

export default function AdminAdvertsPage() {
  const [adverts, setAdverts] = useState<AdvertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

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
        // data has shape { adverts: AdvertItem[] }
        const advertList = Array.isArray(data) ? data : (data?.adverts || []);
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

  const handleToggleActive = async (advert: AdvertItem) => {
    try {
      const res = await fetch(`/api/adverts/${advert.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !advert.is_active }),
      });
      if (res.ok) {
        const updated = await res.json();
        const updatedItem = updated?.advert || updated;
        setAdverts((prev) => prev.map((a) => (a.id === updatedItem.id ? updatedItem : a)));
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
      }
    } catch (err) {
      console.error("Failed to delete advert:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!formData.title || !formData.media_url) {
      setErrorMessage("Please enter both a title and media URL.");
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
        label: "Paused",
        color: "bg-slate-100 text-slate-700 border-slate-300",
        icon: XCircle,
      };
    }

    const now = new Date();
    if (advert.start_date && new Date(advert.start_date) > now) {
      return {
        label: "Scheduled",
        color: "bg-blue-50 text-blue-700 border-blue-200",
        icon: Clock,
      };
    }

    if (advert.end_date && new Date(advert.end_date) <= now) {
      return {
        label: "Expired",
        color: "bg-amber-50 text-amber-700 border-amber-200",
        icon: AlertCircle,
      };
    }

    return {
      label: "Active",
      color: "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: CheckCircle2,
    };
  };

  const getRemainingTime = (endDate?: string | null) => {
    if (!endDate) return "Never expires";
    const end = new Date(endDate).getTime();
    const now = Date.now();
    const diff = end - now;

    if (diff <= 0) return "Expired";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days}d ${hours}h left`;
    return `${hours}h left`;
  };

  const filteredAdverts = adverts.filter((a) =>
    a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (a.description && a.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const activeCount = adverts.filter((a) => {
    const info = getStatusInfo(a);
    return info.label === "Active";
  }).length;

  const totalDownloads = adverts.reduce((sum, a) => sum + (a.download_count || 0), 0);
  const totalViews = adverts.reduce((sum, a) => sum + (a.view_count || 0), 0);

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-teal-50 border border-teal-200 text-teal-700 text-xs font-semibold mb-2">
            <Megaphone className="w-3.5 h-3.5" />
            Homepage Arc Advertisement Hub
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-950">
            Adverts & Flyers Manager
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Publish interactive flyers and short videos directly to the homepage arc carousel with custom duration timers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchAdverts}
            className="border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Button
            onClick={() => setIsModalOpen(true)}
            className="bg-teal-600 hover:bg-teal-700 text-white font-semibold shadow-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Advert
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
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

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Catalog
            </span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-navy-950">{adverts.length}</p>
          <span className="text-xs text-slate-400 mt-1 block">Flyers & videos saved</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
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

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Flyer Downloads
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Download className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-navy-950">{totalDownloads}</p>
          <span className="text-xs text-slate-400 mt-1 block">Shared on other platforms</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200/80">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search adverts by title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
          />
        </div>

        <div className="text-xs text-slate-500 flex items-center gap-2">
          <span>Client Booking Line:</span>
          <code className="bg-slate-100 text-teal-700 px-2 py-0.5 rounded font-mono">
            advert@levchary.com
          </code>
        </div>
      </div>

      {/* Adverts Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/75 border-b border-slate-200 text-xs uppercase tracking-wider font-semibold text-slate-500">
              <tr>
                <th className="py-4 px-6">Media Preview</th>
                <th className="py-4 px-6">Advert Details</th>
                <th className="py-4 px-6">Media Type</th>
                <th className="py-4 px-6">Timer / Expiry</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-center">Stats</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAdverts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Megaphone className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="font-medium text-slate-600">No adverts found</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Click &quot;Add New Advert&quot; above to upload promotional flyers or videos.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredAdverts.map((advert) => {
                  const status = getStatusInfo(advert);
                  const remaining = getRemainingTime(advert.end_date);
                  const StatusIcon = status.icon;

                  return (
                    <tr key={advert.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Thumbnail Preview */}
                      <td className="py-4 px-6">
                        <div className="relative w-16 h-20 rounded-lg overflow-hidden bg-slate-900 border border-slate-200 shrink-0 shadow-xs">
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
                      <td className="py-4 px-6 max-w-xs">
                        <p className="font-bold text-navy-950 text-sm truncate">{advert.title}</p>
                        {advert.description && (
                          <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">
                            {advert.description}
                          </p>
                        )}
                        {advert.target_url && (
                          <a
                            href={advert.target_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-teal-600 hover:text-teal-700 mt-1"
                          >
                            <ExternalLink className="w-3 h-3" />
                            Target link
                          </a>
                        )}
                      </td>

                      {/* Media Type */}
                      <td className="py-4 px-6">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
                          {advert.media_type === "VIDEO" ? (
                            <>
                              <Video className="w-3.5 h-3.5 text-teal-500" />
                              Video
                            </>
                          ) : (
                            <>
                              <ImageIcon className="w-3.5 h-3.5 text-teal-500" />
                              Flyer
                            </>
                          )}
                        </div>
                      </td>

                      {/* Duration / Timer */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-1.5 text-xs text-slate-700">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-medium">{remaining}</span>
                        </div>
                        {advert.end_date && (
                          <span className="text-[11px] text-slate-400 block mt-0.5">
                            Expires {new Date(advert.end_date).toLocaleDateString()}
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${status.color}`}
                        >
                          <StatusIcon className="w-3 h-3" />
                          {status.label}
                        </span>
                      </td>

                      {/* Stats */}
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-3 text-xs text-slate-600">
                          <span className="inline-flex items-center gap-1" title="Views">
                            <Eye className="w-3.5 h-3.5 text-slate-400" />
                            {advert.view_count || 0}
                          </span>
                          <span className="inline-flex items-center gap-1" title="Downloads">
                            <Download className="w-3.5 h-3.5 text-slate-400" />
                            {advert.download_count || 0}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleActive(advert)}
                            className={`text-xs h-8 px-2.5 ${
                              advert.is_active
                                ? "border-amber-200 text-amber-700 hover:bg-amber-50"
                                : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                            }`}
                          >
                            {advert.is_active ? "Pause" : "Activate"}
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(advert.id)}
                            className="text-red-600 hover:bg-red-50 h-8 w-8 p-0"
                            title="Delete Advert"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
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

      {/* CREATE ADVERT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-navy-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-navy-950 mb-1">Upload New Advert</h2>
            <p className="text-xs text-slate-500 mb-5">
              Add a flyer image or video to be displayed in the homepage arc film strip.
            </p>

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
                  className="w-full text-sm px-3.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Short Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Brief highlight of the event, discount, or announcement..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full text-sm px-3.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
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
                    className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="IMAGE">Flyer (Image)</option>
                    <option value="VIDEO">Short Video</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Duration / Timer
                  </label>
                  <select
                    value={formData.duration_hours}
                    onChange={(e) => setFormData({ ...formData, duration_hours: e.target.value })}
                    className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
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
                    className="w-full text-sm px-3.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Media URL (Flyer Image or MP4 Video) *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/... or cloud video URL"
                  value={formData.media_url}
                  onChange={(e) => setFormData({ ...formData, media_url: e.target.value })}
                  className="w-full text-sm px-3.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <span className="text-[11px] text-slate-400 block mt-1">
                  Direct link to flyer image (JPEG/PNG/WebP) or MP4 video file.
                </span>
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
                  className="w-full text-sm px-3.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
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
                  Allow visitors to download this flyer/video to share on social media
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-teal-600 hover:bg-teal-700 text-white font-semibold"
                  disabled={submitting}
                >
                  {submitting ? "Uploading..." : "Publish Advert"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}