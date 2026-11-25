"use client";

import React, { useState, useEffect } from "react";
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
  ExternalLink
} from "lucide-react";

export default function AdminLegalDocumentsPage() {
  const { user: currentAdmin } = useAuth();
  const [documents, setDocuments] = useState<Record<string, any>>({});
  const [selectedKey, setSelectedKey] = useState<string>("userAgreement");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveAlert, setSaveAlert] = useState<string | null>(null);

  // Form State for Selected Document
  const [editTitle, setEditTitle] = useState("");
  const [editDate, setEditDate] = useState("");
  const [sections, setSections] = useState<any[]>([]);

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

  const populateForm = (doc: any) => {
    setEditTitle(doc.title || "");
    setEditDate(doc.effectiveDate || "");

    // Normalizing section structure: handles both `paragraphs` array or legacy `content`
    const normalizedSections = (doc.sections || []).map((sec: any) => {
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
      // Splitting double newlines into distinct paragraphs
      next[index].paragraphs = val.split("\n\n").filter((p) => p.trim().length > 0);
      return next;
    });
  };

  const handleDeleteSection = (index: number) => {
    setSections((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddSection = () => {
    setSections((prev) => [
      ...prev,
      {
        id: `sec-${Date.now()}`,
        title: `${prev.length + 1}. NEW SECTION TITLE`,
        paragraphs: ["Enter section paragraphs here..."],
      },
    ]);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await fetch("/api/admin/legal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          docKey: selectedKey,
          title: editTitle,
          effectiveDate: editDate,
          sections,
          adminId: currentAdmin?.id,
        }),
      });

      if (res.ok) {
        setSaveAlert(`"${editTitle}" successfully updated and recorded in audit trail.`);
        // Refresh local cache
        setDocuments((prev) => ({
          ...prev,
          [selectedKey]: {
            ...prev[selectedKey],
            title: editTitle,
            effectiveDate: editDate,
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
    if (key === "privacy") return "/privacy";
    if (key === "terms" || key === "userAgreement") return "/terms";
    if (key === "instructorAgreement") return "/instructor-agreement";
    if (key === "backgroundAuthorization") return "/background-check-authorization";
    return "/terms";
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <AdminHubHeader
        title="Settings & Audit Hub"
        badgeText="Legal Policies & Governance"
        description="Review and update official platform legal policies including User Agreement, Terms of Service, Privacy Policy, and Instructor Agreements."
        tabs={settingsTabs}
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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Document Selection Sidebar */}
        <div className="lg:col-span-1 space-y-2">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 px-1 block">
            Published Agreements
          </span>
          {Object.entries(documents).map(([key, doc]) => {
            const isSelected = selectedKey === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => handleSelectDoc(key)}
                className={`w-full text-left p-3 rounded-xl border transition-all text-xs flex items-center justify-between ${
                  isSelected
                    ? "bg-teal-50 border-teal-300 text-teal-950 font-bold shadow-xs"
                    : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <FileText className={`w-4 h-4 shrink-0 ${isSelected ? "text-teal-600" : "text-slate-400"}`} />
                  <span className="truncate">{doc.title}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Document Editor Form */}
        <div className="lg:col-span-3">
          <Card className="border-slate-200 shadow-xs">
            <CardContent className="p-6">
              {loading ? (
                <div className="p-12 text-center text-slate-400 text-xs">
                  <Loader2 className="w-6 h-6 animate-spin text-teal-600 mx-auto mb-2" />
                  Loading legal policy data...
                </div>
              ) : (
                <form onSubmit={handleSave} className="space-y-6">
                  {/* Document Title & Effective Date Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                    <div className="flex-1 space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Agreement Document Title
                        </label>
                        <Input
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="h-9 text-xs font-bold text-navy-950"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>Effective Date Display</span>
                        </label>
                        <Input
                          value={editDate}
                          onChange={(e) => setEditDate(e.target.value)}
                          className="h-8 text-xs max-w-sm"
                          placeholder="e.g. Effective Date: October 7, 2026"
                          required
                        />
                      </div>
                    </div>

                    <div className="shrink-0 self-start sm:self-center">
                      <Button asChild variant="outline" size="sm" className="h-8 text-xs border-slate-200 gap-1.5">
                        <a href={getPublicLink(selectedKey)} target="_blank" rel="noopener noreferrer">
                          <span>View Live Page</span>
                          <ExternalLink className="w-3 h-3 text-slate-400" />
                        </a>
                      </Button>
                    </div>
                  </div>

                  {/* Section Content Blocks */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-navy-950 flex items-center gap-1.5">
                        <Shield className="w-4 h-4 text-teal-600" />
                        <span>Policy Sections ({sections.length})</span>
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs border-slate-200 gap-1 text-teal-700 hover:bg-teal-50"
                        onClick={handleAddSection}
                      >
                        <Plus className="w-3 h-3" /> Add Section
                      </Button>
                    </div>

                    <div className="space-y-4 max-h-[580px] overflow-y-auto pr-1">
                      {sections.map((sec, idx) => {
                        const paragraphsText = Array.isArray(sec.paragraphs)
                          ? sec.paragraphs.join("\n\n")
                          : "";

                        return (
                          <div key={sec.id || idx} className="p-4 bg-slate-50/80 border border-slate-200 rounded-xl space-y-2.5">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                                Section {idx + 1}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleDeleteSection(idx)}
                                title="Delete Section"
                                className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <Input
                              value={sec.title}
                              onChange={(e) => handleSectionTitleChange(idx, e.target.value)}
                              placeholder="Section title or number..."
                              className="h-8 text-xs font-bold bg-white text-navy-950"
                            />

                            <div>
                              <span className="block text-[10px] text-slate-400 mb-1">
                                Section Body (Separate paragraphs with double newlines):
                              </span>
                              <Textarea
                                value={paragraphsText}
                                onChange={(e) => handleSectionTextChange(idx, e.target.value)}
                                rows={5}
                                className="text-xs bg-white font-sans leading-relaxed text-slate-700"
                                placeholder="Enter section content paragraphs..."
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Submit Action */}
                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                    <Button
                      type="submit"
                      disabled={saving}
                      className="bg-teal-600 hover:bg-teal-700 text-white font-medium text-xs h-9 px-5 gap-1.5"
                    >
                      {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                      <span>Save Legal Agreement</span>
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
