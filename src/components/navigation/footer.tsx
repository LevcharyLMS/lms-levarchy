"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/ui/logo";
import { ShieldCheck, Mail, MapPin, Phone } from "lucide-react";

export function Footer() {
  const pathname = usePathname();
  const [socialLinks, setSocialLinks] = useState({
    instagram: "https://instagram.com/levchary",
    youtube: "https://youtube.com/@levchary",
    whatsapp: "https://wa.me/18005550199",
    spotify: "https://open.spotify.com/user/levchary",
  });
  const [contactNumber, setContactNumber] = useState("+1 (800) 555-0199");
  const [officeAddress, setOfficeAddress] = useState("100 Innovation Way, Suite 400, Boston, MA 02110");

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await fetch("/api/admin/settings");
        if (res.ok) {
          const data = await res.json();
          const landing = data.settings?.landing_info;
          if (landing) {
            if (landing.contact_number) setContactNumber(landing.contact_number);
            if (landing.address) setOfficeAddress(landing.address);
            if (landing.social_links) {
              setSocialLinks((prev) => ({ ...prev, ...landing.social_links }));
            }
          }
        }
      } catch {}
    };
    loadSettings();
  }, []);

  const PORTAL_OR_AUTH_PREFIXES = [
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/tutor/application",
    "/instructor/application",
    "/student",
    "/tutor",
    "/instructor",
    "/admin",
    "/classroom",
  ];

  if (PORTAL_OR_AUTH_PREFIXES.some((r) => pathname === r || pathname.startsWith(r + "/"))) {
    return null;
  }

  const socialItems = [
    {
      name: "Instagram",
      href: socialLinks.instagram,
      path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z",
      hoverClass: "hover:bg-gradient-to-tr hover:from-amber-500 hover:via-rose-500 hover:to-purple-600 hover:text-white hover:border-transparent",
    },
    {
      name: "YouTube",
      href: socialLinks.youtube,
      path: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
      hoverClass: "hover:bg-red-600 hover:text-white hover:border-red-500",
    },
    {
      name: "WhatsApp",
      href: socialLinks.whatsapp,
      path: "M17.472 14.382c-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.096 3.2 5.077 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.85 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z",
      hoverClass: "hover:bg-emerald-600 hover:text-white hover:border-emerald-500",
    },
    {
      name: "Spotify",
      href: socialLinks.spotify,
      path: "M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z",
      hoverClass: "hover:bg-emerald-500 hover:text-white hover:border-emerald-400",
    },
  ];

  return (
    <footer className="bg-navy-950 text-slate-300 border-t border-navy-900 pt-16 pb-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-navy-800">
          {/* Brand & Vision */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center">
              <Logo variant="dark" showBadge badgeText="LMS" imageClassName="h-9" />
            </div>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              A company-controlled education marketplace connecting students with thoroughly vetted instructors for interactive virtual classrooms and supervised in-person learning sessions.
            </p>
            <div className="flex items-center gap-2 text-xs text-teal-400 font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>100% Identity-Verified Instructors & Safe Learning Escrow</span>
            </div>

            {/* Social Media Section */}
            <div className="pt-2">
              <span className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5">
                Connect With Us
              </span>
              <div className="flex items-center gap-2.5">
                {socialItems.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={item.name}
                    aria-label={`Follow Levchary on ${item.name}`}
                    className={`group w-9 h-9 rounded-lg bg-navy-900 border border-navy-800 text-slate-400 flex items-center justify-center transition-all duration-200 ${item.hoverClass}`}
                  >
                    <svg
                      className="w-4 h-4 fill-current transition-transform group-hover:scale-110"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path d={item.path} />
                    </svg>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Marketplace Discovery */}
          <div>
            <h4 className="text-white text-sm font-semibold tracking-wider uppercase mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/find-instructors" className="hover:text-teal-400 transition-colors">
                  Find Verified Instructors
                </Link>
              </li>
              <li>
                <Link href="/classes" className="hover:text-teal-400 transition-colors">
                  1-on-1 & Group Classes
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-teal-400 transition-colors">
                  How Levchary Works
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-teal-400 transition-colors">
                  Tuition & Pricing
                </Link>
              </li>
              <li>
                <Link href="/become-an-instructor" className="hover:text-teal-400 transition-colors">
                  Apply as an Instructor
                </Link>
              </li>
            </ul>
          </div>

          {/* Company & Support */}
          <div>
            <h4 className="text-white text-sm font-semibold tracking-wider uppercase mb-4">
              Platform & Help
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/about" className="hover:text-teal-400 transition-colors">
                  About Levchary
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-teal-400 transition-colors">
                  Frequently Asked Questions
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-teal-400 transition-colors">
                  Contact Support
                </Link>
              </li>
              <li>
                <Link href="/student/dashboard" className="hover:text-teal-400 transition-colors">
                  Student Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Official Contact Column */}
          <div>
            <h4 className="text-white text-sm font-semibold tracking-wider uppercase mb-4">
              Contact & HQ
            </h4>
            <div className="space-y-3 text-xs text-slate-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-teal-500 shrink-0 mt-0.5" />
                <span>{officeAddress}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-teal-500 shrink-0" />
                <span className="font-mono">{contactNumber}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-teal-500 shrink-0" />
                <span>support@levchary.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Legal Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Levchary LMS Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-slate-400 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-slate-400 transition-colors">
              Terms of Service
            </Link>
            <Link href="/instructor-agreement" className="hover:text-slate-400 transition-colors">
              Instructor Agreement
            </Link>
            <Link href="/background-check-authorization" className="hover:text-slate-400 transition-colors">
              Background Authorization
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
