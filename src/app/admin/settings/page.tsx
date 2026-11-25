"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { AdminHubHeader } from "@/components/admin/admin-hub-header";
import { useAuth } from "@/context/auth-context";
import {
  Settings,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Mail,
  Phone,
  Power,
  DollarSign,
  Loader2,
  Sliders,
  Globe,
  Share2,
  MapPin
} from "lucide-react";

export default function AdminSettingsPage() {
  const { user: currentAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedAlert, setSavedAlert] = useState<string | null>(null);

  // Form State - Platform
  const [platformName, setPlatformName] = useState("Levchary LMS");
  const [supportEmail, setSupportEmail] = useState("support@levchary.com");
  const [emergencyPhone, setEmergencyPhone] = useState("+1 (800) 555-0199");
  const [cancelHours, setCancelHours] = useState(24);
  const [fullRefundHours, setFullRefundHours] = useState(48);
  const [minLeadTimeHours, setMinLeadTimeHours] = useState(2);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState(
    "Levchary is undergoing scheduled maintenance. We'll be back shortly."
  );

  // Form State - Landing Page & Social Media
  const [landingContactNumber, setLandingContactNumber] = useState("+1 (800) 555-0199");
  const [landingAddress, setLandingAddress] = useState("100 Innovation Way, Suite 400, Boston, MA 02110");
  const [socialInstagram, setSocialInstagram] = useState("https://instagram.com/levchary");
  const [socialYouTube, setSocialYouTube] = useState("https://youtube.com/@levchary");
  const [socialWhatsApp, setSocialWhatsApp] = useState("https://wa.me/18005550199");
  const [socialSpotify, setSocialSpotify] = useState("https://open.spotify.com/user/levchary");

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/settings");
      if (res.ok) {
        const data = await res.json();
        const info = data.settings?.platform_info;
        const refund = data.settings?.refund_policy;
        const landing = data.settings?.landing_info;

        if (info) {
          if (info.name) setPlatformName(info.name);
          if (info.support_email) setSupportEmail(info.support_email);
          if (info.emergency_phone) setEmergencyPhone(info.emergency_phone);
          if (info.maintenance_mode !== undefined) setMaintenanceMode(info.maintenance_mode);
          if (info.maintenance_message) setMaintenanceMessage(info.maintenance_message);
        }

        if (refund) {
          if (refund.cancellation_window_hours !== undefined)
            setCancelHours(refund.cancellation_window_hours);
          if (refund.full_refund_window_hours !== undefined)
            setFullRefundHours(refund.full_refund_window_hours);
          if (refund.min_lead_time_hours !== undefined)
            setMinLeadTimeHours(refund.min_lead_time_hours);
        }

        if (landing) {
          if (landing.contact_number) setLandingContactNumber(landing.contact_number);
          if (landing.address) setLandingAddress(landing.address);
          if (landing.social_links) {
            if (landing.social_links.instagram) setSocialInstagram(landing.social_links.instagram);
            if (landing.social_links.youtube) setSocialYouTube(landing.social_links.youtube);
            if (landing.social_links.whatsapp) setSocialWhatsApp(landing.social_links.whatsapp);
            if (landing.social_links.spotify) setSocialSpotify(landing.social_links.spotify);
          }
        }
      }
    } catch (err) {
      console.error("Failed to load settings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platformName,
          supportEmail,
          emergencyPhone,
          cancelHours,
          fullRefundHours,
          minLeadTimeHours,
          maintenanceMode,
          maintenanceMessage,
          socialInstagram,
          socialYouTube,
          socialWhatsApp,
          socialSpotify,
          landingContactNumber,
          landingAddress,
          adminId: currentAdmin?.id,
        }),
      });

      if (res.ok) {
        setSavedAlert("Platform configuration successfully saved and recorded in audit trail.");
        setTimeout(() => setSavedAlert(null), 4000);
      }
    } catch (err) {
      console.error("Failed to save settings:", err);
    } finally {
      setSaving(false);
    }
  };

  const settingsTabs = [
    { label: "Configuration", href: "/admin/settings" },
    { label: "Audit Trail", href: "/admin/audit-logs" },
    { label: "Legal Documents", href: "/admin/legal" },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <AdminHubHeader
        title="Settings & Audit Hub"
        badgeText="System Configuration"
        description="Global platform parameters, cancellation thresholds, refund time windows, landing page footer links, and emergency maintenance controls."
        tabs={settingsTabs}
      />

      {savedAlert && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{savedAlert}</span>
          </div>
          <button onClick={() => setSavedAlert(null)} className="underline font-semibold text-emerald-900">
            Dismiss
          </button>
        </div>
      )}

      {loading ? (
        <div className="p-16 text-center bg-white rounded-2xl border border-slate-200">
          <Loader2 className="w-6 h-6 animate-spin text-teal-600 mx-auto mb-2" />
          <p className="text-xs text-slate-400">Loading system configuration...</p>
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          {/* Section 1: General Platform Information */}
          <Card className="border-slate-200 shadow-xs">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2 text-navy-950 font-bold text-sm">
                  <Sliders className="w-4 h-4 text-teal-600" />
                  <span>Marketplace Identity & Support</span>
                </div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Platform Essentials</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1.5">
                    Platform Brand Name
                  </label>
                  <Input
                    value={platformName}
                    onChange={(e) => setPlatformName(e.target.value)}
                    className="h-9 text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1.5 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>Administrative Support Email</span>
                  </label>
                  <Input
                    type="email"
                    value={supportEmail}
                    onChange={(e) => setSupportEmail(e.target.value)}
                    className="h-9 text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1.5 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>Emergency Parent / Support Line</span>
                  </label>
                  <Input
                    type="text"
                    value={emergencyPhone}
                    onChange={(e) => setEmergencyPhone(e.target.value)}
                    className="h-9 text-xs"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Landing Page Contact & Social Media Links */}
          <Card className="border-slate-200 shadow-xs">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2 text-navy-950 font-bold text-sm">
                  <Share2 className="w-4 h-4 text-teal-600" />
                  <span>Landing Page Footer & Social Media Channels</span>
                </div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Public Front-End</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1.5 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>Public Contact Number (Shown on Landing Page & Footer)</span>
                  </label>
                  <Input
                    value={landingContactNumber}
                    onChange={(e) => setLandingContactNumber(e.target.value)}
                    className="h-9 text-xs"
                    placeholder="+1 (800) 555-0199"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1.5 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>Headquarters Office Address</span>
                  </label>
                  <Input
                    value={landingAddress}
                    onChange={(e) => setLandingAddress(e.target.value)}
                    className="h-9 text-xs"
                    placeholder="100 Innovation Way, Boston, MA"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs pt-2">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1.5">Instagram URL</label>
                  <Input
                    value={socialInstagram}
                    onChange={(e) => setSocialInstagram(e.target.value)}
                    className="h-9 text-xs"
                    placeholder="https://instagram.com/..."
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1.5">YouTube URL</label>
                  <Input
                    value={socialYouTube}
                    onChange={(e) => setSocialYouTube(e.target.value)}
                    className="h-9 text-xs"
                    placeholder="https://youtube.com/@..."
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1.5">WhatsApp Contact Link</label>
                  <Input
                    value={socialWhatsApp}
                    onChange={(e) => setSocialWhatsApp(e.target.value)}
                    className="h-9 text-xs"
                    placeholder="https://wa.me/..."
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1.5">Spotify Channel</label>
                  <Input
                    value={socialSpotify}
                    onChange={(e) => setSocialSpotify(e.target.value)}
                    className="h-9 text-xs"
                    placeholder="https://open.spotify.com/..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 3: Booking, Cancellation & Refund Policies */}
          <Card className="border-slate-200 shadow-xs">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2 text-navy-950 font-bold text-sm">
                  <Clock className="w-4 h-4 text-teal-600" />
                  <span>Session Scheduling & Cancellation Rules</span>
                </div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Policy Windows</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1.5">
                    Minimum Lead Time (Hours Prior)
                  </label>
                  <Input
                    type="number"
                    value={minLeadTimeHours}
                    onChange={(e) => setMinLeadTimeHours(Number(e.target.value))}
                    min={1}
                    max={24}
                    className="h-9 text-xs"
                    required
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Minimum advance notice students must give when booking a class session.
                  </p>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1.5">
                    Free Cancellation Window (Hours Prior)
                  </label>
                  <Input
                    type="number"
                    value={cancelHours}
                    onChange={(e) => setCancelHours(Number(e.target.value))}
                    min={6}
                    max={72}
                    className="h-9 text-xs"
                    required
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Hours before class where students can cancel with zero penalty.
                  </p>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1.5">
                    Automatic Full Refund Window (Hours Prior)
                  </label>
                  <Input
                    type="number"
                    value={fullRefundHours}
                    onChange={(e) => setFullRefundHours(Number(e.target.value))}
                    min={12}
                    max={96}
                    className="h-9 text-xs"
                    required
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Cut-off time for instant automated refunds without admin intervention.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 4: Platform Operational State & Maintenance Mode */}
          <Card className="border-slate-200 shadow-xs">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2 text-navy-950 font-bold text-sm">
                  <Power className="w-4 h-4 text-rose-600" />
                  <span>Platform Maintenance Mode</span>
                </div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Emergency Control</span>
              </div>

              <div className="space-y-4 text-xs">
                <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="space-y-0.5">
                    <p className="font-semibold text-navy-950">Enable Scheduled Maintenance Mode</p>
                    <p className="text-[11px] text-slate-500">
                      When activated, non-admin users see a temporary maintenance splash page and class bookings are paused.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={maintenanceMode}
                      onChange={(e) => setMaintenanceMode(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
                  </label>
                </div>

                {maintenanceMode && (
                  <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-2">
                    <div className="flex items-center gap-2 text-rose-900 font-bold">
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                      <span>Maintenance Broadcast Message</span>
                    </div>
                    <Textarea
                      value={maintenanceMessage}
                      onChange={(e) => setMaintenanceMessage(e.target.value)}
                      rows={2}
                      className="text-xs bg-white"
                      placeholder="Enter the notice shown to students and instructors..."
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Action Footer */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="submit"
              disabled={saving}
              className="bg-teal-600 hover:bg-teal-700 text-white font-medium text-xs h-9 px-5 gap-1.5"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
              <span>Save Platform Configuration</span>
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
