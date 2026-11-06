"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { AdvertItem } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Download,
  Share2,
  ExternalLink,
  X,
  Play,
  Film,
  Mail,
  Copy,
  Check,
  ChevronRight,
  Maximize2,
  Volume2,
  Flame,
  ArrowUpRight,
  Eye,
} from "lucide-react";

interface ArcAdvertDockProps {
  initialAdverts?: AdvertItem[];
}

export function ArcAdvertDock({ initialAdverts = [] }: ArcAdvertDockProps) {
  const [adverts, setAdverts] = useState<AdvertItem[]>(initialAdverts);
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedAdvert, setSelectedAdvert] = useState<AdvertItem | null>(null);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [isMarqueePaused, setIsMarqueePaused] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Fetch live active adverts if not provided or to refresh
  useEffect(() => {
    async function loadAdverts() {
      try {
        const res = await fetch("/api/adverts");
        const data = await res.json();
        const list = Array.isArray(data) ? data : (data?.adverts || []);
        if (list.length > 0) {
          setAdverts(list);
        }
      } catch (err) {
        // use initial
      }
    }
    loadAdverts();
  }, []);

  const handleCopyEmail = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText("advert@levchary.com");
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2200);
  };

  const handleDownload = async (advert: AdvertItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setDownloadingId(advert.id);

    try {
      // 1. Increment download count in DB
      fetch(`/api/adverts/${advert.id}/download`, { method: "POST" }).catch(() => {});

      // 2. Trigger direct blob download
      const response = await fetch(advert.media_url, { mode: "cors" });
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      const extension = advert.media_type === "VIDEO" ? "mp4" : "jpg";
      link.download = `${advert.title.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase()}_flyer.${extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      // Fallback
      window.open(advert.media_url, "_blank");
    } finally {
      setTimeout(() => setDownloadingId(null), 1000);
    }
  };

  const handleShare = async (advert: AdvertItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const shareData = {
      title: advert.title,
      text: `${advert.title} — ${advert.description || "Check out this update on Levchary LMS!"}`,
      url: window.location.origin,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {}
    } else {
      navigator.clipboard.writeText(`${shareData.title}\n${shareData.url}`);
      alert("Link copied to clipboard!");
    }
  };

  if (!adverts || adverts.length === 0) {
    return null;
  }

  // Only duplicate for continuous marquee wrap when there are 3 or more adverts
  const shouldLoopMarquee = adverts.length >= 3;
  const marqueeItems = shouldLoopMarquee ? [...adverts, ...adverts] : adverts;

  return (
    <>
      {/* ============================================================ */}
      {/* PLAYFUL 3D RADIAL ARC DOCK (BOTTOM-RIGHT FLOATING TRIGGER)   */}
      {/* ============================================================ */}
      <aside
        aria-label="Promotions and Announcements Dock"
        className={`fixed bottom-6 right-0 z-40 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] select-none ${
          isExpanded
            ? "translate-x-0"
            : "translate-x-[calc(100%-76px)] sm:translate-x-[calc(100%-88px)]"
        }`}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
      >
        <div className="flex items-center">
          {/* ======================================================== */}
          {/* CURVED ARC TRIGGER PEAK (3D Depth + Playful Glow)        */}
          {/* ======================================================== */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            aria-label={isExpanded ? "Close promotional arc" : "Open promotional arc"}
            className="group relative flex flex-col items-center justify-center w-[76px] sm:w-[88px] h-[175px] sm:h-[195px] bg-gradient-to-l from-navy-950 via-slate-900 to-navy-900 text-white rounded-l-[50px] shadow-[0_10px_35px_-5px_rgba(20,184,166,0.45)] border-y-2 border-l-2 border-teal-400/80 hover:border-teal-300 cursor-pointer overflow-hidden transition-all duration-300 hover:w-[94px] active:scale-95"
          >
            {/* Ambient Animated Pulse Gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-teal-500/25 via-indigo-500/10 to-transparent pointer-events-none animate-pulse" />

            {/* Glowing Accent Ring Behind Arc */}
            <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-16 h-28 rounded-full bg-teal-400/20 blur-xl pointer-events-none group-hover:bg-teal-400/35 transition-colors" />

            {/* Layered Avatar Stack (Instagram 3D Depth Mechanics) */}
            <div className="relative w-13 h-13 mb-3 flex items-center justify-center">
              {/* Back Layer Avatar (Simulated Stack Depth) */}
              {adverts[1] && (
                <div className="absolute -left-2 top-0 w-8 h-8 rounded-full border-2 border-slate-900 overflow-hidden opacity-50 scale-75 shadow-md transition-transform duration-300 group-hover:-translate-x-1">
                  <img
                    src={adverts[1].thumbnail_url || adverts[1].media_url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Front Main Layer Avatar */}
              {adverts[0] && (
                <div className="relative w-11 h-11 rounded-full border-2 border-teal-300 overflow-hidden shadow-xl z-10 ring-2 ring-navy-950 transition-transform duration-300 group-hover:scale-105">
                  <img
                    src={adverts[0].thumbnail_url || adverts[0].media_url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Playful Floating Badge with Live Pulsing Dot */}
              <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-tr from-amber-400 to-amber-300 text-navy-950 flex items-center justify-center shadow-lg z-20 group-hover:rotate-12 transition-transform">
                <Flame className="w-3.5 h-3.5 fill-current text-amber-950" />
              </div>

              {/* Micro Ping Dot Indicator */}
              <span className="absolute -bottom-0.5 -left-0.5 flex h-3 w-3 z-20">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-teal-500 border border-navy-950"></span>
              </span>
            </div>

            {/* Vertical Peeking Label with Playful Typography */}
            <div className="flex items-center gap-1.5 text-xs font-black tracking-widest uppercase text-teal-300 group-hover:text-white transition-colors rotate-180 [writing-mode:vertical-lr]">
              <span className="group-hover:tracking-[0.2em] transition-all">Explore Arc</span>
              <Sparkles className="w-3 h-3 text-amber-300 -rotate-90 animate-bounce" />
            </div>
          </button>

          {/* ======================================================== */}
          {/* EXPANDED FILM STRIP CAPSULE (FANS OUT ON HOVER/CLICK)     */}
          {/* ======================================================== */}
          <div
            className={`transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] bg-navy-950/95 backdrop-blur-2xl border-y border-l border-teal-500/30 rounded-l-[36px] shadow-[0_20px_50px_rgba(0,0,0,0.8)] p-5 mr-[-2px] flex flex-col justify-between max-w-[92vw] sm:max-w-[720px] lg:max-w-[850px] ${
              isExpanded
                ? "opacity-100 scale-100 pointer-events-auto"
                : "opacity-0 scale-95 pointer-events-none"
            }`}
          >
            {/* Header: Playful Status Pill & Dismiss */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 gap-3">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-teal-500/20 to-indigo-500/20 border border-teal-400/40 text-teal-300 text-xs font-bold tracking-wide shadow-inner">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" style={{ animationDuration: "6s" }} />
                  <span>Featured Spotlights</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse ml-0.5" />
                </div>
                <span className="text-xs text-slate-400 hidden sm:inline">
                  Interactive film-strip • Hover to inspect & save flyers
                </span>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(false);
                }}
                className="w-7 h-7 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center transition-colors"
                title="Minimize arc"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* MARQUEE FILM STRIP SCROLLER */}
            <div
              className="relative overflow-hidden py-4 my-1 cursor-grab active:cursor-grabbing"
              onMouseEnter={() => setIsMarqueePaused(true)}
              onMouseLeave={() => setIsMarqueePaused(false)}
            >
              <div
                className={`flex gap-4 items-center w-max ${
                  shouldLoopMarquee && !isMarqueePaused ? "animate-marquee" : ""
                }`}
                style={{
                  animationDuration: `${Math.max(20, adverts.length * 10)}s`,
                }}
              >
                {marqueeItems.map((ad, idx) => (
                  <div
                    key={`${ad.id}-${idx}`}
                    onClick={() => setSelectedAdvert(ad)}
                    className="group/card relative w-[170px] sm:w-[200px] h-[230px] sm:h-[260px] rounded-2xl overflow-hidden bg-slate-900 border-2 border-slate-800 hover:border-teal-400 transition-all duration-300 shadow-xl hover:shadow-[0_10px_25px_-5px_rgba(20,184,166,0.3)] shrink-0 cursor-pointer flex flex-col justify-between hover:-translate-y-1.5"
                  >
                    {/* Media Thumbnail with Vibrant Zoom */}
                    <div className="absolute inset-0 z-0">
                      <img
                        src={ad.thumbnail_url || ad.media_url}
                        alt={ad.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-110"
                      />
                      {/* Gradient Vignette */}
                      <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/50 to-black/30" />
                    </div>

                    {/* Top Pill: Media Type badge + Quick Action */}
                    <div className="relative z-10 p-3 flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-navy-950/85 backdrop-blur-md text-teal-300 border border-teal-500/40 flex items-center gap-1 shadow-md">
                        {ad.media_type === "VIDEO" ? (
                          <>
                            <Play className="w-3 h-3 fill-current text-indigo-400" /> Video
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3 h-3 text-amber-300" /> Flyer
                          </>
                        )}
                      </span>

                      {/* Download quick icon on card */}
                      {ad.downloadable && (
                        <button
                          onClick={(e) => handleDownload(ad, e)}
                          title="Download flyer / video"
                          className="w-8 h-8 rounded-full bg-navy-950/85 backdrop-blur-md text-slate-300 hover:text-teal-300 hover:bg-teal-500/20 flex items-center justify-center border border-white/15 transition-all shadow-md active:scale-90"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Bottom Details with Glowing Hover Accent */}
                    <div className="relative z-10 p-3.5 space-y-1.5 bg-gradient-to-t from-navy-950 to-transparent">
                      <h4 className="text-xs font-extrabold text-white line-clamp-1 group-hover/card:text-teal-300 transition-colors">
                        {ad.title}
                      </h4>
                      <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed opacity-90">
                        {ad.description || "Click to inspect in fullscreen & download for sharing."}
                      </p>
                      <div className="pt-1 flex items-center justify-between text-xs text-teal-400 font-bold">
                        <span className="flex items-center gap-1 group-hover/card:underline">
                          View details <ArrowUpRight className="w-3.5 h-3.5" />
                        </span>
                        <span className="text-slate-400 text-xs font-normal flex items-center gap-1">
                          <Eye className="w-3 h-3" /> {ad.view_count || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ============================================================ */}
            {/* ADVERT BOOKING CONTACT FOOTNOTE (CLIENT REQUIREMENT)         */}
            {/* ============================================================ */}
            <div className="pt-3.5 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-extrabold text-xs uppercase tracking-wider border border-amber-500/40">
                  Featured Partner
                </span>
                <span className="text-xs font-bold text-slate-200">
                  FOR ADVERT BOOKING
                </span>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href="mailto:advert@levchary.com?subject=Inquiry%20for%20Homepage%20Advert%20Booking"
                  className="text-xs font-bold text-teal-300 hover:text-teal-200 transition-colors flex items-center gap-1.5 underline decoration-teal-400/50"
                >
                  <Mail className="w-3.5 h-3.5 text-teal-400" />
                  <span>Contact: advert@levchary.com</span>
                </a>
                <button
                  onClick={handleCopyEmail}
                  title="Copy advertising email"
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700 active:scale-95"
                >
                  {copiedEmail ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copy
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* ============================================================ */}
      {/* HIGH-RES LIGHTBOX MODAL WITH DOWNLOAD & SHARE                */}
      {/* ============================================================ */}
      {selectedAdvert && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedAdvert(null)}
        >
          <div
            className="relative w-full max-w-2xl bg-navy-950 border border-slate-700 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/70">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30 uppercase">
                  {selectedAdvert.media_type === "VIDEO" ? "Video Notice" : "Official Flyer"}
                </span>
                <h3 className="text-sm font-bold text-white truncate max-w-sm">
                  {selectedAdvert.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedAdvert(null)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
                title="Close viewer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Media Content Display */}
            <div className="relative bg-black flex items-center justify-center min-h-[300px] max-h-[58vh] overflow-hidden">
              {selectedAdvert.media_type === "VIDEO" ? (
                <video
                  src={selectedAdvert.media_url}
                  controls
                  autoPlay
                  className="w-full h-full max-h-[58vh] object-contain"
                />
              ) : (
                <img
                  src={selectedAdvert.media_url}
                  alt={selectedAdvert.title}
                  className="w-full h-full max-h-[58vh] object-contain"
                />
              )}
            </div>

            {/* Modal Footer & Actions */}
            <div className="p-5 bg-slate-900/90 border-t border-slate-800 space-y-4">
              {selectedAdvert.description && (
                <p className="text-xs text-slate-300 leading-relaxed">
                  {selectedAdvert.description}
                </p>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
                {/* External Action Button if URL provided */}
                {selectedAdvert.target_url && (
                  <Button asChild size="sm" variant="navy" className="text-xs gap-1.5 border border-slate-700">
                    <Link href={selectedAdvert.target_url}>
                      <span>Explore Further</span>
                      <ExternalLink className="w-3.5 h-3.5 text-teal-400" />
                    </Link>
                  </Button>
                )}

                <div className="flex items-center gap-2 ml-auto">
                  {/* Share on Socials Button */}
                  <button
                    onClick={() => handleShare(selectedAdvert)}
                    className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Share2 className="w-3.5 h-3.5 text-teal-400" />
                    <span>Share on Socials</span>
                  </button>

                  {/* Direct Download Button (Client Requirement) */}
                  {selectedAdvert.downloadable && (
                    <button
                      onClick={() => handleDownload(selectedAdvert)}
                      disabled={downloadingId === selectedAdvert.id}
                      className="px-4 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-md transition-all active:scale-95 disabled:opacity-50"
                    >
                      <Download className={`w-3.5 h-3.5 ${downloadingId === selectedAdvert.id ? "animate-bounce" : ""}`} />
                      <span>{downloadingId === selectedAdvert.id ? "Saving..." : "Download Flyer"}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}