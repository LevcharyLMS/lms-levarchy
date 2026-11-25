"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AdminHubHeader } from "@/components/admin/admin-hub-header";
import { useAuth } from "@/context/auth-context";
import {
  FileText,
  Shield,
  CheckCircle2,
  Calendar,
  Loader2,
  Save,
  Plus,
  Trash2,
  ExternalLink,
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Eye,
  Edit3,
  Columns,
  Hash,
  Sparkles,
  ChevronRight,
  Info,
  Download,
} from "lucide-react";

interface LegalSectionItem {
  id: string;
  title: string;
  paragraphs: string[];
}

export default function AdminLegalDocumentsPage() {
  const { user: currentAdmin } = useAuth();
  const [documents, setDocuments] = useState<Record<string, any>>({});
  const [selectedKey, setSelectedKey] = useState<string>("userAgreement");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveAlert, setSaveAlert] = useState<string | null>(null);

  // Form State for Selected Document
  const [editTitle, setEditTitle] = useState("");
  const [effectiveDate, setEffectiveDate] = useState("");
  const [lastUpdatedDate, setLastUpdatedDate] = useState("");
  const [sections, setSections] = useState<LegalSectionItem[]>([]);
  
  // Navigation & View Modes: "edit" | "split" | "preview"
  const [viewMode, setViewMode] = useState<"edit" | "split" | "preview">("split");
  const [activeSectionIdx, setActiveSectionIdx] = useState<number>(0);
  const textareaRefs = useRef<(HTMLTextAreaElement | null)[]>([]);

  const fetchDocs = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/legal");
      if (res.ok) {
        const data = await res.json();
        const docs = data.documents || {};
        setDocuments(docs);
        if (docs[selectedKey]) {
          populateForm(docs[selectedKey]);
        } else if (Object.keys(docs).length > 0) {
          const firstKey = Object.keys(docs)[0];
          setSelectedKey(firstKey);
          populateForm(docs[firstKey]);
        }
      }
    } catch (err) {
      console.error("Failed to fetch legal documents:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const parseDates = (rawDateStr: string = "") => {
    // If it has "Last Updated:" or "Last Revised:"
    let eff = rawDateStr;
    let upd = "";

    if (rawDateStr.includes("Last Updated:")) {
      const parts = rawDateStr.split("Last Updated:");
      eff = parts[0].replace(/•|-|,$/, "").trim();
      upd = parts[1].trim();
    } else if (rawDateStr.includes("Last Revised:")) {
      const parts = rawDateStr.split("Last Revised:");
      eff = parts[0].replace(/•|-|,$/, "").trim();
      upd = parts[1].trim();
    }
    // Clean leading "Effective Date:"
    eff = eff.replace(/^Effective Date:\s*/i, "").trim();
    upd = upd.replace(/^Last Updated:\s*/i, "").replace(/^Last Revised:\s*/i, "").trim();

    return {
      effective: eff || "October 7, 2026",
      updated: upd || eff || "October 7, 2026",
    };
  };

  const populateForm = (doc: any) => {
    setEditTitle(doc.title || "");
    const { effective, updated } = parseDates(doc.effectiveDate || "");
    setEffectiveDate(effective);
    setLastUpdatedDate(updated);

    const normalizedSections: LegalSectionItem[] = (doc.sections || []).map((sec: any) => {
      let rawParagraphs: string[] = [];
      if (Array.isArray(sec.paragraphs) && sec.paragraphs.length > 0) {
        rawParagraphs = sec.paragraphs;
      } else if (Array.isArray(sec.content) && sec.content.length > 0) {
        rawParagraphs = sec.content;
      } else if (typeof sec.content === "string") {
        rawParagraphs = sec.content.split("\n\n").filter(Boolean);
      }
      return {
        id: sec.id || `sec-${Date.now()}`,
        title: sec.title || sec.heading || "Untitled Section",
        paragraphs: rawParagraphs,
      };
    });

    setSections(normalizedSections);
    setActiveSectionIdx(0);
  };

  const handleSelectDoc = (key: string) => {
    setSelectedKey(key);
    if (documents[key]) {
      populateForm(documents[key]);
    }
  };

  const handleSectionTitleChange = (index: number, val: string) => {
    setSections((prev) => {
      const next = [...prev];
      next[index].title = val;
      return next;
    });
  };

  const handleSectionTextChange = (index: number, val: string) => {
    setSections((prev) => {
      const next = [...prev];
      next[index].paragraphs = val.split("\n\n").filter((p) => p.trim().length > 0);
      return next;
    });
  };

  const handleDeleteSection = (index: number) => {
    if (sections.length <= 1) {
      alert("Documents must have at least one section.");
      return;
    }
    setSections((prev) => prev.filter((_, i) => i !== index));
    if (activeSectionIdx >= index && activeSectionIdx > 0) {
      setActiveSectionIdx(activeSectionIdx - 1);
    }
  };

  const handleAddSection = () => {
    const newIdx = sections.length;
    setSections((prev) => [
      ...prev,
      {
        id: `sec-${Date.now()}`,
        title: `${prev.length + 1}. NEW SECTION TITLE`,
        paragraphs: ["Enter section content paragraphs here..."],
      },
    ]);
    setActiveSectionIdx(newIdx);
    setTimeout(() => {
      scrollToSection(newIdx);
    }, 50);
  };

  const scrollToSection = (idx: number) => {
    setActiveSectionIdx(idx);
    const el = document.getElementById(`editor-section-${idx}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Markdown Formatting Helper
  const applyFormatting = (prefix: string, suffix: string = "") => {
    const textarea = textareaRefs.current[activeSectionIdx];
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentVal = textarea.value;
    const selectedText = currentVal.substring(start, end);

    let replacement = "";
    if (prefix === "- " || prefix === "1. " || prefix === "> ") {
      // Line-based formatting
      const lines = selectedText ? selectedText.split("\n") : ["New item"];
      replacement = lines.map((l) => `${prefix}${l}`).join("\n");
    } else {
      // Inline wrapping like **bold** or *italic*
      replacement = selectedText ? `${prefix}${selectedText}${suffix}` : `${prefix}text${suffix}`;
    }

    const newVal = currentVal.substring(0, start) + replacement + currentVal.substring(end);
    handleSectionTextChange(activeSectionIdx, newVal);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + replacement.length - suffix.length);
    }, 10);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const combinedEffectiveDate = `Effective Date: ${effectiveDate} • Last Updated: ${lastUpdatedDate}`;

      const res = await fetch("/api/admin/legal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          docKey: selectedKey,
          title: editTitle,
          effectiveDate: combinedEffectiveDate,
          sections,
          adminId: currentAdmin?.id,
        }),
      });

      if (res.ok) {
        setSaveAlert(`"${editTitle}" successfully published and recorded in audit trail.`);
        setDocuments((prev) => ({
          ...prev,
          [selectedKey]: {
            ...prev[selectedKey],
            title: editTitle,
            effectiveDate: combinedEffectiveDate,
            sections,
          },
        }));
        setTimeout(() => setSaveAlert(null), 4000);
      }
    } catch (err) {
      console.error("Failed to save legal document:", err);
    } finally {
      setSaving(false);
    }
  };

  const settingsTabs = [
    { label: "Configuration", href: "/admin/settings" },
    { label: "Audit Trail", href: "/admin/audit-logs" },
    { label: "Legal Documents", href: "/admin/legal" },
  ];

  const getPublicLink = (key: string) => {
    if (key === "privacy" || key === "privacyPolicy") return "/privacy";
    if (key === "terms" || key === "userAgreement") return "/terms";
    if (key === "instructorAgreement") return "/instructor-agreement";
    if (key === "backgroundAuthorization" || key === "backgroundCheck") return "/background-check-authorization";
    return "/terms";
  };

  // Helper to render formatted markdown preview
  const renderFormattedParagraph = (para: string, pIdx: number) => {
    // If it starts with quote
    if (para.startsWith(">")) {
      return (
        <blockquote
          key={pIdx}
          className="border-l-4 border-teal-500 pl-4 py-1 italic bg-teal-50/50 rounded-r text-slate-700 text-xs"
        >
          {para.replace(/^>\s*/, "")}
        </blockquote>
      );
    }

    // Split items if bullets or numbered
    const lines = para.split("\n");
    const isBulletList = lines.every((l) => l.trim().startsWith("- ") || l.trim().startsWith("* "));
    const isNumList = lines.every((l) => /^\d+\.\s/.test(l.trim()));

    if (isBulletList && lines.length > 0) {
      return (
        <ul key={pIdx} className="list-disc pl-5 space-y-1 text-xs text-slate-700">
          {lines.map((l, lIdx) => (
            <li key={lIdx}>{formatInlineMarkdown(l.replace(/^[-*]\s*/, ""))}</li>
          ))}
        </ul>
      );
    }

    if (isNumList && lines.length > 0) {
      return (
        <ol key={pIdx} className="list-decimal pl-5 space-y-1 text-xs text-slate-700">
          {lines.map((l, lIdx) => (
            <li key={lIdx}>{formatInlineMarkdown(l.replace(/^\d+\.\s*/, ""))}</li>
          ))}
        </ol>
      );
    }

    return (
      <p key={pIdx} className="text-xs text-slate-700 leading-relaxed">
        {formatInlineMarkdown(para)}
      </p>
    );
  };

  const formatInlineMarkdown = (text: string) => {
    // Basic bold **text** and italic *text* rendering
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i} className="font-semibold text-navy-950">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith("*") && part.endsWith("*")) {
        return <em key={i} className="italic text-slate-800">{part.slice(1, -1)}</em>;
      }
      return part;
    });
  };

  const exportCurrentDocument = () => {
    const doc = documents[selectedKey];
    if (!doc) return;

    let content = `${doc.title}\n${doc.effectiveDate || `Effective Date: ${effectiveDate} • Last Updated: ${lastUpdatedDate}`}\n\n`;
    content += "============================================================\n\n";

    sections.forEach((sec, idx) => {
      content += `${idx + 1}. ${sec.title.toUpperCase()}\n\n`;
      sec.paragraphs.forEach((p) => {
        content += `${p}\n\n`;
      });
      content += "------------------------------------------------------------\n\n";
    });

    const filename = `levchary_${selectedKey}_${new Date().toISOString().split("T")[0]}.txt`;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <AdminHubHeader
        title="Settings & Audit Hub"
        badgeText="Legal Policies & Governance"
        description="Review and update official platform legal policies including User Agreement, Terms of Service, Privacy Policy, and Instructor Agreements."
        tabs={settingsTabs}
        actions={
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={exportCurrentDocument}
              className="h-8 text-xs border-slate-200 gap-1.5 text-teal-700 hover:bg-teal-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Selected Document</span>
            </Button>
          </div>
        }
      />

      {saveAlert && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{saveAlert}</span>
          </div>
          <button onClick={() => setSaveAlert(null)} className="underline font-semibold">
            Dismiss
          </button>
        </div>
      )}

      {/* Top Document Picker Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {Object.entries(documents).map(([key, doc]) => {
            const isSelected = selectedKey === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => handleSelectDoc(key)}
                className={`px-3 py-1.5 rounded-xl border transition-all text-xs flex items-center gap-2 whitespace-nowrap ${
                  isSelected
                    ? "bg-teal-50 border-teal-300 text-teal-950 font-bold shadow-xs"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <FileText className={`w-3.5 h-3.5 ${isSelected ? "text-teal-600" : "text-slate-400"}`} />
                <span>{doc.title || key}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button asChild variant="outline" size="sm" className="h-8 text-xs border-slate-200 gap-1.5">
            <a href={getPublicLink(selectedKey)} target="_blank" rel="noopener noreferrer">
              <span>Public Live View</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
          </Button>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => setViewMode("edit")}
              className={`px-2.5 py-1 rounded-lg font-medium flex items-center gap-1 transition-colors ${
                viewMode === "edit" ? "bg-white text-navy-950 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Edit3 className="w-3 h-3" />
              <span>Edit</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("split")}
              className={`px-2.5 py-1 rounded-lg font-medium flex items-center gap-1 transition-colors ${
                viewMode === "split" ? "bg-white text-navy-950 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Columns className="w-3 h-3" />
              <span>Split</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("preview")}
              className={`px-2.5 py-1 rounded-lg font-medium flex items-center gap-1 transition-colors ${
                viewMode === "preview" ? "bg-white text-navy-950 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Eye className="w-3 h-3" />
              <span>Preview</span>
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <Card className="border-slate-200">
          <CardContent className="p-16 text-center text-slate-400 text-xs">
            <Loader2 className="w-6 h-6 animate-spin text-teal-600 mx-auto mb-2" />
            Loading policy data and structure...
          </CardContent>
        </Card>
      ) : (
        <form onSubmit={handleSave} className="space-y-4">
          {/* Document Metadata Card */}
          <Card className="border-slate-200 shadow-xs">
            <CardContent className="p-4 sm:p-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div className="md:col-span-1 space-y-1">
                  <label className="text-xs font-semibold text-slate-700 block">
                    Document Title
                  </label>
                  <Input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="h-8.5 text-xs font-bold text-navy-950 bg-white"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-teal-600" />
                    <span>Effective Date</span>
                  </label>
                  <Input
                    value={effectiveDate}
                    onChange={(e) => setEffectiveDate(e.target.value)}
                    className="h-8.5 text-xs bg-white"
                    placeholder="e.g. October 7, 2026"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Last Revised / Updated Date</span>
                  </label>
                  <Input
                    value={lastUpdatedDate}
                    onChange={(e) => setLastUpdatedDate(e.target.value)}
                    className="h-8.5 text-xs bg-white"
                    placeholder="e.g. October 7, 2026"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Workspace (3-Pane / Split View) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Table of Contents (TOC) Sidebar */}
            <div className="lg:col-span-3 space-y-3">
              <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-xs sticky top-4">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                  <span className="text-[11px] font-bold text-navy-950 uppercase tracking-wider flex items-center gap-1.5">
                    <Hash className="w-3.5 h-3.5 text-teal-600" />
                    <span>Sections ({sections.length})</span>
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleAddSection}
                    className="h-6 px-2 text-[11px] text-teal-700 hover:bg-teal-50 gap-1 font-semibold"
                  >
                    <Plus className="w-3 h-3" /> Add
                  </Button>
                </div>

                <div className="space-y-1 max-h-[calc(100vh-320px)] overflow-y-auto no-scrollbar pr-1">
                  {sections.map((sec, idx) => {
                    const isActive = activeSectionIdx === idx;
                    return (
                      <button
                        key={sec.id || idx}
                        type="button"
                        onClick={() => scrollToSection(idx)}
                        className={`w-full text-left px-2.5 py-2 rounded-xl text-xs transition-all flex items-center justify-between group ${
                          isActive
                            ? "bg-teal-50 border border-teal-200 text-teal-950 font-bold"
                            : "hover:bg-slate-50 text-slate-600 border border-transparent"
                        }`}
                      >
                        <span className="truncate pr-2">
                          {sec.title || `Section ${idx + 1}`}
                        </span>
                        <span className={`text-[10px] shrink-0 px-1.5 py-0.5 rounded-full ${
                          isActive ? "bg-teal-200/60 text-teal-900" : "bg-slate-100 text-slate-500"
                        }`}>
                          {sec.paragraphs.length} ¶
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Middle Editor Pane */}
            <div className={`${
              viewMode === "preview" ? "hidden" : viewMode === "edit" ? "lg:col-span-9" : "lg:col-span-5"
            } space-y-4`}>
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
                {/* Markdown Formatting Toolbar */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 flex-wrap gap-2">
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                    <button
                      type="button"
                      title="Bold (**text**)"
                      onClick={() => applyFormatting("**", "**")}
                      className="p-1.5 rounded hover:bg-white text-slate-700 transition-colors"
                    >
                      <Bold className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      title="Italic (*text*)"
                      onClick={() => applyFormatting("*", "*")}
                      className="p-1.5 rounded hover:bg-white text-slate-700 transition-colors"
                    >
                      <Italic className="w-3.5 h-3.5" />
                    </button>
                    <div className="w-[1px] h-3.5 bg-slate-300 mx-1" />
                    <button
                      type="button"
                      title="Bullet List (- item)"
                      onClick={() => applyFormatting("- ")}
                      className="p-1.5 rounded hover:bg-white text-slate-700 transition-colors"
                    >
                      <List className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      title="Numbered List (1. item)"
                      onClick={() => applyFormatting("1. ")}
                      className="p-1.5 rounded hover:bg-white text-slate-700 transition-colors"
                    >
                      <ListOrdered className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      title="Blockquote (> quote)"
                      onClick={() => applyFormatting("> ")}
                      className="p-1.5 rounded hover:bg-white text-slate-700 transition-colors"
                    >
                      <Quote className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <span className="text-[10px] text-slate-400">
                    Active: Section {activeSectionIdx + 1}
                  </span>
                </div>

                {/* Section Cards */}
                <div className="space-y-4 max-h-[calc(100vh-340px)] overflow-y-auto pr-1">
                  {sections.map((sec, idx) => {
                    const paragraphsText = Array.isArray(sec.paragraphs) ? sec.paragraphs.join("\n\n") : "";
                    const isActive = activeSectionIdx === idx;

                    return (
                      <div
                        id={`editor-section-${idx}`}
                        key={sec.id || idx}
                        onClick={() => setActiveSectionIdx(idx)}
                        className={`p-4 rounded-xl border transition-all space-y-3 ${
                          isActive
                            ? "bg-slate-50/90 border-teal-400 shadow-xs ring-1 ring-teal-400"
                            : "bg-slate-50/50 border-slate-200 opacity-90"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1.5">
                            <span className="w-4 h-4 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center text-[10px] font-bold">
                              {idx + 1}
                            </span>
                            <span>Clause Section</span>
                          </span>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteSection(idx);
                            }}
                            title="Delete Section"
                            className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div>
                          <label className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider block mb-1">
                            Heading / Title
                          </label>
                          <Input
                            value={sec.title}
                            onChange={(e) => handleSectionTitleChange(idx, e.target.value)}
                            placeholder="Section Title..."
                            className="h-8 text-xs font-bold bg-white text-navy-950"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider block mb-1">
                            Paragraphs (Separate clauses with double enter)
                          </label>
                          <Textarea
                            ref={(el) => {
                              textareaRefs.current[idx] = el;
                            }}
                            value={paragraphsText}
                            onChange={(e) => handleSectionTextChange(idx, e.target.value)}
                            onFocus={() => setActiveSectionIdx(idx)}
                            rows={6}
                            className="text-xs bg-white font-sans leading-relaxed text-slate-700"
                            placeholder="Type paragraph content or format with toolbar..."
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Live Preview Pane */}
            <div className={`${
              viewMode === "edit" ? "hidden" : viewMode === "preview" ? "lg:col-span-9" : "lg:col-span-4"
            }`}>
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs sticky top-4 max-h-[calc(100vh-280px)] overflow-y-auto">
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-teal-600" />
                    <span className="text-xs font-bold text-navy-950">Live Document Preview</span>
                  </div>
                  <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                    Renders in real time
                  </span>
                </div>

                {/* Simulated Public Document Rendering */}
                <div className="space-y-6 prose-slate">
                  <div className="border-b border-slate-100 pb-3">
                    <h2 className="text-sm font-black text-navy-950 tracking-tight">{editTitle}</h2>
                    <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5">
                      <span>Effective: {effectiveDate}</span>
                      <span>•</span>
                      <span>Last Updated: {lastUpdatedDate}</span>
                    </p>
                  </div>

                  <div className="space-y-5">
                    {sections.map((sec, idx) => (
                      <div key={sec.id || idx} className="space-y-2">
                        <h3 className="text-xs font-bold text-navy-950 flex items-center gap-1.5">
                          <span>{sec.title}</span>
                        </h3>
                        <div className="space-y-2 pl-1">
                          {sec.paragraphs.map((para, pIdx) => renderFormattedParagraph(para, pIdx))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Save Action Bar */}
          <div className="sticky bottom-4 z-10 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border border-slate-200 shadow-md flex items-center justify-between">
            <div className="text-xs text-slate-500 flex items-center gap-2">
              <Shield className="w-4 h-4 text-teal-600" />
              <span>Saving will write to configuration and create an immutable audit record.</span>
            </div>

            <Button
              type="submit"
              disabled={saving}
              className="bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs h-9 px-6 gap-2 shadow-xs"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Publish Legal Agreement</span>
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
