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
  Eye,
  Edit3,
  Loader2,
  ExternalLink,
  Save,
  Plus
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
        setDocuments(data.documents || {});
        if (data.documents?.[selectedKey]) {
          populateForm(data.documents[selectedKey]);
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
    setSections(doc.sections ? JSON.parse(JSON.stringify(doc.sections)) : []);
  };

  const handleSelectDoc = (key: string) => {
    setSelectedKey(key);
    if (documents[key]) {
      populateForm(documents[key]);
    }
  };

  const handleSectionHeadingChange = (index: number, val: string) => {
    setSections((prev) => {
      const next = [...prev];
      next[index].heading = val;
      return next;
    });
  };

  const handleSectionContentChange = (index: number, val: string) => {
    setSections((prev) => {
      const next = [...prev];
      next[index].content = val.split("\n\n").filter((p) => p.trim());
      return next;
    });
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
        setSaveAlert(`"${editTitle}" successfully updated and recorded in audit log.`);
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

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <AdminHubHeader
        title="Settings & Audit Hub"
        badgeText="Legal Policies & Governance"
        description="Review and update Terms of Service, Privacy Policy, Tutor Honor Code, and Background Check disclosures."
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
                  {/* Document Title & Effective Date */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-slate-100">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Legal Agreement Title
                      </label>
                      <Input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="h-9 text-xs"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>Effective Date Notice</span>
                      </label>
                      <Input
                        value={editDate}
                        onChange={(e) => setEditDate(e.target.value)}
                        className="h-9 text-xs"
                        placeholder="e.g. October 1, 2026"
                        required
                      />
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
                        className="h-7 text-xs border-slate-200 gap-1"
                        onClick={() =>
                          setSections([
                            ...sections,
                            { id: `sec-${Date.now()}`, heading: "New Section", content: ["Enter text..."] },
                          ])
                        }
                      >
                        <Plus className="w-3 h-3 text-teal-600" /> Add Section
                      </Button>
                    </div>

                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                      {sections.map((sec, idx) => (
                        <div key={sec.id || idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                          <label className="block text-[11px] font-bold text-navy-950">
                            Section {idx + 1} Heading
                          </label>
                          <Input
                            value={sec.heading}
                            onChange={(e) => handleSectionHeadingChange(idx, e.target.value)}
                            className="h-8 text-xs bg-white"
                          />
                          <label className="block text-[11px] font-semibold text-slate-500 mt-2">
                            Section Paragraphs (Separate paragraphs with double newlines)
                          </label>
                          <Textarea
                            value={Array.isArray(sec.content) ? sec.content.join("\n\n") : sec.content || ""}
                            onChange={(e) => handleSectionContentChange(idx, e.target.value)}
                            rows={3}
                            className="text-xs bg-white font-sans leading-relaxed"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Submit Action */}
                  <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
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
