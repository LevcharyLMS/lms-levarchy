"use client";

import React, { useState } from "react";
import { LEGAL_DOCUMENTS, LegalDocument } from "@/lib/legal-documents-data";
import { X, Search, Printer, Shield, FileText, CheckCircle2, BookOpen, AlertCircle, ExternalLink } from "lucide-react";

export type LegalDocKey = "userAgreement" | "privacyPolicy" | "instructorAgreement" | "backgroundCheck";

interface LegalDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDoc?: LegalDocKey;
  allowedDocs?: LegalDocKey[];
  onAccept?: (docKey: LegalDocKey) => void;
  acceptedDocs?: Record<string, boolean>;
}

const DOC_METADATA: Record<LegalDocKey, { label: string; badge: string; icon: any; color: string }> = {
  userAgreement: {
    label: "User Agreement",
    badge: "Master Platform Terms",
    icon: FileText,
    color: "from-blue-600 to-indigo-600",
  },
  privacyPolicy: {
    label: "Privacy Policy",
    badge: "FERPA & GDPR Compliance",
    icon: Shield,
    color: "from-teal-600 to-emerald-600",
  },
  instructorAgreement: {
    label: "Instructor Agreement",
    badge: "Faculty Contractor Terms",
    icon: BookOpen,
    color: "from-purple-600 to-indigo-600",
  },
  backgroundCheck: {
    label: "Background Check Authorization",
    badge: "FCRA Vetting Consent",
    icon: CheckCircle2,
    color: "from-amber-600 to-orange-600",
  },
};

export function LegalDocumentModal({
  isOpen,
  onClose,
  initialDoc = "userAgreement",
  allowedDocs = ["userAgreement", "privacyPolicy", "instructorAgreement", "backgroundCheck"],
  onAccept,
  acceptedDocs = {},
}: LegalDocumentModalProps) {
  const [activeDocKey, setActiveDocKey] = useState<LegalDocKey>(initialDoc);
  const [searchQuery, setSearchQuery] = useState("");

  // Sync initialDoc when modal opens
  React.useEffect(() => {
    if (isOpen && initialDoc) {
      setActiveDocKey(initialDoc);
    }
  }, [isOpen, initialDoc]);

  if (!isOpen) return null;

  const currentDoc: LegalDocument = LEGAL_DOCUMENTS[activeDocKey] || LEGAL_DOCUMENTS.userAgreement;
  const meta = DOC_METADATA[activeDocKey] || DOC_METADATA.userAgreement;
  const Icon = meta.icon;

  const filteredSections = currentDoc.sections.filter((sec) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      sec.title.toLowerCase().includes(q) ||
      sec.paragraphs.some((p) => p.toLowerCase().includes(q))
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-4xl h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${meta.color} text-white flex items-center justify-center shadow-sm`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-navy-950">{currentDoc.title}</h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                  {meta.badge}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{currentDoc.effectiveDate}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:border-slate-300 rounded-lg shadow-2xs transition-colors"
              title="Print document"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Print</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-lg transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation & Search */}
        <div className="px-6 py-3 border-b border-slate-100 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          {/* Document Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
            {allowedDocs.map((key) => {
              const docMeta = DOC_METADATA[key];
              const isSelected = activeDocKey === key;
              const isAccepted = acceptedDocs[key];
              const TabIcon = docMeta.icon;
              return (
                <button
                  key={key}
                  onClick={() => {
                    setActiveDocKey(key);
                    setSearchQuery("");
                  }}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    isSelected
                      ? "bg-slate-900 text-white shadow-2xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <TabIcon className={`w-3.5 h-3.5 ${isSelected ? "text-white" : "text-slate-500"}`} />
                  <span>{docMeta.label}</span>
                  {isAccepted && (
                    <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0 ml-0.5" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search in document..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Document Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 text-slate-700 bg-white selection:bg-indigo-100">
          {searchQuery && (
            <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center justify-between">
              <span>Showing search results for: <strong>&quot;{searchQuery}&quot;</strong></span>
              <button
                onClick={() => setSearchQuery("")}
                className="underline font-medium hover:text-amber-950"
              >
                Clear
              </button>
            </div>
          )}

          {filteredSections.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-medium">No sections matched your query.</p>
            </div>
          ) : (
            filteredSections.map((sec, idx) => (
              <section key={idx} className="space-y-2 border-b border-slate-100 pb-5 last:border-b-0">
                <h3 className="text-sm font-bold text-navy-950 tracking-tight flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 inline-block"></span>
                  {sec.title}
                </h3>
                <div className="space-y-2.5 text-xs text-slate-600 leading-relaxed pl-3.5">
                  {sec.paragraphs.map((p, pIdx) => {
                    const isBullet = p.endsWith(";") || p.startsWith("-") || p.startsWith("•");
                    return (
                      <p
                        key={pIdx}
                        className={isBullet ? "pl-2 border-l-2 border-slate-200 text-slate-700" : ""}
                      >
                        {p}
                      </p>
                    );
                  })}
                </div>
              </section>
            ))
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <p className="text-[11px] text-slate-500 text-center sm:text-left">
            By agreeing on registration or verification, this electronic record is maintained in compliance with the Electronic Signatures in Global and National Commerce Act (E-SIGN).
          </p>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {onAccept && (
              <button
                type="button"
                onClick={() => {
                  onAccept(activeDocKey);
                }}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Mark as Reviewed</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-white transition-colors"
            >
              Done & Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
