"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { LegalDocument, LegalSection } from "@/lib/legal-documents-data";
import {
  FileText,
  Shield,
  BookOpen,
  CheckCircle2,
  Printer,
  Search,
  ExternalLink,
  ChevronRight,
  ArrowUp,
  Clock,
  Sparkles,
  Info,
  Calendar,
} from "lucide-react";

export type LegalDocId =
  | "userAgreement"
  | "privacyPolicy"
  | "instructorAgreement"
  | "backgroundCheck";

interface LegalPageLayoutProps {
  currentDocId: LegalDocId;
  doc: LegalDocument;
  summaryHighlights: {
    targetAudience: string;
    keyPoints: string[];
    badge: string;
    badgeColor: string;
  };
}

const ALL_DOCS: Array<{
  id: LegalDocId;
  label: string;
  href: string;
  role: string;
  icon: any;
}> = [
  {
    id: "userAgreement",
    label: "User Agreement",
    href: "/terms",
    role: "Students & Tutors",
    icon: FileText,
  },
  {
    id: "privacyPolicy",
    label: "Privacy Policy",
    href: "/privacy",
    role: "Students & Tutors",
    icon: Shield,
  },
  {
    id: "instructorAgreement",
    label: "Instructor Agreement",
    href: "/instructor-agreement",
    role: "Faculty & Tutors Only",
    icon: BookOpen,
  },
  {
    id: "backgroundCheck",
    label: "Background Check Authorization",
    href: "/background-check-authorization",
    role: "Faculty & Tutors Only",
    icon: CheckCircle2,
  },
];

export function LegalPageLayout({
  currentDocId,
  doc,
  summaryHighlights,
}: LegalPageLayoutProps) {
  const [activeSectionId, setActiveSectionId] = useState<string>(
    doc.sections[0]?.id || "section-intro"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [showScrollTop, setShowScrollTop] = useState(false);

  // ScrollSpy to highlight active section in TOC
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);

      const sectionElements = doc.sections.map((s) => ({
        id: s.id,
        el: document.getElementById(s.id),
      }));

      const scrollPosition = window.scrollY + 160;

      for (let i = sectionElements.length - 1; i >= 0; i--) {
        const item = sectionElements[i];
        if (item.el && item.el.offsetTop <= scrollPosition) {
          setActiveSectionId(item.id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [doc.sections]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -90;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
      setActiveSectionId(id);
    }
  };

  const filteredSections = doc.sections.filter((sec) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      sec.title.toLowerCase().includes(q) ||
      sec.paragraphs.some((p) => p.toLowerCase().includes(q))
    );
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Top Header Hub */}
      <header className="border-b border-slate-200/80 bg-white sticky top-0 z-30 shadow-2xs backdrop-blur-md bg-white/95">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb & Global Doc Switcher Bar */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between py-3 gap-3 border-b border-slate-100">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Link href="/" className="hover:text-slate-900 transition-colors">
                Levchary
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-700 font-medium">Legal &amp; Trust Center</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-navy-950 font-bold truncate max-w-[200px] sm:max-w-none">
                {doc.title}
              </span>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 self-end md:self-auto">
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors"
                title="Print or Save PDF"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print / Save PDF</span>
              </button>
            </div>
          </div>

          {/* Hub Tab Switcher */}
          <nav className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2.5">
            {ALL_DOCS.map((item) => {
              const Icon = item.icon;
              const isActive = item.id === currentDocId;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
                    isActive
                      ? "bg-navy-950 text-white shadow-xs"
                      : "text-slate-600 hover:text-navy-950 hover:bg-slate-100"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-teal-300" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-normal ${
                      isActive ? "bg-white/20 text-white" : "bg-slate-200/70 text-slate-600"
                    }`}
                  >
                    {item.role.split(" ")[0]}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Two-Column Container */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Sticky Table of Contents (4 cols) */}
          <aside className="lg:col-span-4 sticky top-28 space-y-4 order-2 lg:order-1">
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-xs font-bold text-navy-950 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-teal-600" />
                  Table of Contents
                </h3>
                <span className="text-[11px] text-slate-400 font-medium">
                  {doc.sections.length} Sections
                </span>
              </div>

              {/* In-Document Quick Search */}
              <div className="relative my-3">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter clauses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              {/* Section Scroll Links */}
              <div className="max-h-[60vh] overflow-y-auto space-y-1 pr-1 text-xs">
                {filteredSections.map((sec) => {
                  const isActive = activeSectionId === sec.id;
                  return (
                    <button
                      key={sec.id}
                      onClick={() => scrollToSection(sec.id)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-all flex items-start gap-2 leading-snug group ${
                        isActive
                          ? "bg-teal-50 text-teal-900 font-semibold border-l-2 border-indigo-600"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                      }`}
                    >
                      <span
                        className={`text-[10px] mt-0.5 shrink-0 w-1.5 h-1.5 rounded-full ${
                          isActive ? "bg-teal-600" : "bg-slate-300 group-hover:bg-slate-400"
                        }`}
                      />
                      <span className="line-clamp-2">{sec.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Support / Legal Contact Card */}
            <div className="p-4 bg-slate-100/70 border border-slate-200 rounded-2xl text-xs space-y-2">
              <p className="font-semibold text-slate-800">Questions regarding these terms?</p>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                Contact our compliance &amp; legal counsel team for formal clarifications or data inquiries.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-1 font-semibold text-teal-600 hover:underline text-[11px]"
              >
                <span>Contact Legal Support</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </aside>

          {/* Right Column: Full Pristine Reading Pane (8 cols) */}
          <article className="lg:col-span-8 space-y-6 order-1 lg:order-2">
            {/* Document Header Card */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-5">
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-[11px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full ${summaryHighlights.badgeColor}`}
                  >
                    {summaryHighlights.badge}
                  </span>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>Applicable to: {summaryHighlights.targetAudience}</span>
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-navy-950 leading-tight">
                  {doc.title}
                </h1>
                <p className="text-xs text-slate-500 flex items-center gap-1.5 pt-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{doc.effectiveDate}</span>
                </p>
              </div>

              {/* Enterprise Plain-Language Executive Summary (Key Takeaways) */}
              <div className="p-5 rounded-2xl bg-teal-50/60 border border-teal-100/90 space-y-3">
                <div className="flex items-center gap-2 text-teal-950 font-bold text-xs uppercase tracking-wide">
                  <Sparkles className="w-4 h-4 text-teal-600" />
                  <span>Summary of Key Obligations &amp; Rights</span>
                </div>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-teal-950/80">
                  {summaryHighlights.keyPoints.map((pt, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                      <span className="leading-snug">{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Document Authentic Clauses */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-10 shadow-xs space-y-10">
              {filteredSections.map((section) => (
                <section
                  key={section.id}
                  id={section.id}
                  className="scroll-mt-32 space-y-3.5 border-b border-slate-100 pb-8 last:border-b-0 last:pb-0"
                >
                  <h2 className="text-base sm:text-lg font-bold text-navy-950 tracking-tight flex items-start gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-teal-600 shrink-0 mt-2" />
                    <span>{section.title}</span>
                  </h2>

                  <div className="space-y-3 text-[14px] text-slate-700 leading-relaxed pl-4 sm:pl-5">
                    {section.paragraphs.map((para, pIdx) => {
                      const isList =
                        para.endsWith(";") ||
                        para.startsWith("-") ||
                        para.startsWith("•") ||
                        (para.length < 90 && !para.endsWith("."));

                      return (
                        <p
                          key={pIdx}
                          className={
                            isList
                              ? "pl-3 border-l-2 border-teal-200 text-slate-800 font-medium py-0.5"
                              : ""
                          }
                        >
                          {para}
                        </p>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          </article>
        </div>
      </main>

      {/* Floating Scroll to Top button */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 p-3 bg-navy-950 text-white rounded-full shadow-lg hover:bg-navy-900 transition-all z-40"
          title="Scroll to top"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
