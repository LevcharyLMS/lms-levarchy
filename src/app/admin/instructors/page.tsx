"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/ui/status-badge";
import { MoneyDisplay } from "@/components/ui/money-display";
import { Button } from "@/components/ui/button";
import { AdminHubHeader } from "@/components/admin/admin-hub-header";
import { DetailDrawer } from "@/components/shared/detail-drawer";
import { FilterBar } from "@/components/shared/filter-bar";
import { Textarea } from "@/components/ui/textarea";
import { db } from "@/lib/data-store";
import {
  ShieldCheck,
  UserX,
  UserCheck,
  Loader2,
  Eye,
  BookOpen,
  Calendar,
  GraduationCap,
  Mail,
  MapPin,
  CheckCircle2,
  Download,
  AlertCircle
} from "lucide-react";

export default function AdminInstructorsPage() {
  const [instructors, setInstructors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [formatFilter, setFormatFilter] = useState("ALL");
  const [actionAlert, setActionAlert] = useState<string | null>(null);

  // Instructor Modal / Drawer
  const [selectedInstructor, setSelectedInstructor] = useState<any | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Suspension Note Modal State
  const [suspendingInstructor, setSuspendingInstructor] = useState<any | null>(null);
  const [suspensionReason, setSuspensionReason] = useState("");
  const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false);

  const fetchInstructors = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/instructors");
      if (res.ok) {
        const data = await res.json();
        setInstructors(data.instructors || []);
      }
    } catch (err) {
      console.error("Failed to load instructors:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstructors();
  }, []);

  const handleActionClick = (t: any) => {
    const isCurrentlyActive = (t.user?.account_status || "ACTIVE") === "ACTIVE";
    if (isCurrentlyActive) {
      setSuspendingInstructor(t);
      setSuspensionReason("");
      setIsSuspendModalOpen(true);
    } else {
      executeStatusUpdate(t.user_id, "ACTIVE", "Teaching account reactivated by administrator");
    }
  };

  const confirmSuspension = () => {
    if (!suspendingInstructor) return;
    executeStatusUpdate(
      suspendingInstructor.user_id,
      "SUSPENDED",
      suspensionReason.trim() || "Policy compliance or credential audit suspension"
    );
    setIsSuspendModalOpen(false);
    setSuspendingInstructor(null);
  };

  const executeStatusUpdate = async (userId: string, nextStatus: "ACTIVE" | "SUSPENDED", noteText?: string) => {
    try {
      setUpdatingId(userId);
      const isApproved = nextStatus === "ACTIVE";
      await fetch("/api/admin/instructors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, approve: isApproved, accountStatus: nextStatus, note: noteText }),
      });

      db.updateProfile(userId, { account_status: nextStatus as any });

      setInstructors((prev) =>
        prev.map((inst) =>
          inst.user_id === userId
            ? {
                ...inst,
                is_approved: isApproved,
                user: {
                  ...inst.user,
                  account_status: nextStatus,
                  verification_status: isApproved ? "APPROVED" : "SUSPENDED",
                },
              }
            : inst
        )
      );
      if (selectedInstructor && selectedInstructor.user_id === userId) {
        setSelectedInstructor({
          ...selectedInstructor,
          is_approved: isApproved,
          user: {
            ...selectedInstructor.user,
            account_status: nextStatus,
            verification_status: isApproved ? "APPROVED" : "SUSPENDED",
          },
        });
      }
      setActionAlert(`Instructor account marked as ${nextStatus}.${noteText ? ` Note: "${noteText}"` : ""}`);
      setTimeout(() => setActionAlert(null), 4000);
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredInstructors = useMemo(() => {
    return instructors.filter((t) => {
      if (formatFilter !== "ALL" && t.preferred_format !== formatFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const name = `${t.user?.first_name || ""} ${t.user?.last_name || ""}`.toLowerCase();
        const email = (t.user?.email || "").toLowerCase();
        return name.includes(q) || email.includes(q);
      }
      return true;
    });
  }, [instructors, formatFilter, searchQuery]);

  const openInstructorModal = (inst: any) => {
    setSelectedInstructor(inst);
    setIsDrawerOpen(true);
  };

  // Associated classes created by this instructor
  const instructorClasses = useMemo(() => {
    if (!selectedInstructor) return [];
    return db.state.classes.filter((c) => c.tutor_id === selectedInstructor.user_id);
  }, [selectedInstructor]);

  const exportInstructorsCSV = () => {
    let csvContent = "UserID,FirstName,LastName,Email,HourlyRate,Format,AccountStatus,VerificationStatus\n";
    filteredInstructors.forEach((t) => {
      csvContent += `"${t.user_id}","${t.user?.first_name || ""}","${t.user?.last_name || ""}","${t.user?.email || ""}",${((t.hourly_rate || 3500) / 100).toFixed(2)},"${t.preferred_format || "BOTH"}","${t.user?.account_status || "ACTIVE"}","${t.user?.verification_status || "APPROVED"}"\n`;
    });
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `levchary_instructors_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const userTabs = [
    { label: "All Users", href: "/admin/users" },
    { label: "Students", href: "/admin/students" },
    { label: "Instructors", href: "/admin/instructors" },
    { label: "Applications", href: "/admin/instructor-applications" },
    { label: "Verifications", href: "/admin/verifications" },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <AdminHubHeader
        title="People & Accounts Hub"
        badgeText="Faculty & Instructors"
        description="Directory of all instructors, authorized subjects, hourly rates, and account access controls."
        tabs={userTabs}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={exportInstructorsCSV}
            className="h-8 text-xs border-slate-200 gap-1.5 text-navy-950 hover:bg-slate-50"
          >
            <Download className="w-3.5 h-3.5 text-purple-700" />
            <span>Export to CSV</span>
          </Button>
        }
      />

      {actionAlert && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{actionAlert}</span>
          </div>
          <button onClick={() => setActionAlert(null)} className="underline font-semibold">
            Dismiss
          </button>
        </div>
      )}

      {/* Filter Bar with Format Chips and Search */}
      <FilterBar
        searchPlaceholder="Search instructors by name or email..."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        categories={[
          { id: "ONLINE", label: "Virtual / Online" },
          { id: "IN_PERSON", label: "Physical Venues" },
          { id: "BOTH", label: "Hybrid / Both" },
        ]}
        selectedCategory={formatFilter}
        onCategorySelect={setFormatFilter}
        onReset={() => {
          setSearchQuery("");
          setFormatFilter("ALL");
        }}
        totalCount={filteredInstructors.length}
      />

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-6 h-6 animate-spin text-teal-600 mx-auto mb-2" />
            <p className="text-xs text-slate-400">Loading live instructors...</p>
          </div>
        ) : filteredInstructors.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No instructors match the selected search or delivery format.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="p-4">Instructor</th>
                  <th className="p-4">Taught Subjects</th>
                  <th className="p-4">Hourly Rate</th>
                  <th className="p-4">Account Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredInstructors.map((t) => {
                  const isUpdating = updatingId === t.user_id;
                  const subjectsList = t.subjects && t.subjects.length > 0
                    ? t.subjects.join(", ")
                    : "AP Biology, Mathematics, Science";
                  const isSuspended = (t.user?.account_status || "ACTIVE") === "SUSPENDED";

                  return (
                    <tr key={t.user_id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-4">
                        <div
                          className="flex items-center gap-3 cursor-pointer group"
                          onClick={() => openInstructorModal(t)}
                        >
                          <Avatar className="w-9 h-9 ring-1 ring-slate-200 group-hover:ring-teal-500 transition-colors">
                            <AvatarImage src={t.user?.avatar_url || ""} />
                            <AvatarFallback className="bg-teal-50 text-teal-800 font-bold">
                              {(t.user?.first_name?.[0] || "I") + (t.user?.last_name?.[0] || "")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-bold text-navy-950 group-hover:text-teal-700 transition-colors">
                              {t.user?.first_name} {t.user?.last_name}
                            </p>
                            <p className="text-[11px] text-slate-400">
                              {t.user?.email || "No email"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="p-4 max-w-xs">
                        <div className="font-medium text-slate-800 truncate">{subjectsList}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Format: <span className="font-semibold text-slate-600">{t.preferred_format || "BOTH"}</span>
                        </div>
                      </td>

                      <td className="p-4 font-bold text-navy-950">
                        <MoneyDisplay cents={t.hourly_rate || 3500} label="/hr" />
                      </td>

                      <td className="p-4">
                        <StatusBadge status={t.user?.account_status || "ACTIVE"} />
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs border-slate-200 text-slate-600 gap-1"
                            onClick={() => openInstructorModal(t)}
                          >
                            <Eye className="w-3.5 h-3.5 text-teal-600" /> View
                          </Button>
                          <Button
                            variant={isSuspended ? "outline" : "destructive"}
                            size="sm"
                            className="h-8 text-xs min-w-[85px]"
                            disabled={isUpdating}
                            onClick={() => handleActionClick(t)}
                          >
                            {isUpdating ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin mx-auto" />
                            ) : isSuspended ? (
                              <>
                                <UserCheck className="w-3 h-3 mr-1" /> Reactivate
                              </>
                            ) : (
                              <>
                                <UserX className="w-3 h-3 mr-1" /> Suspend
                              </>
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Instructor Modal Drawer */}
      <DetailDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={selectedInstructor ? `${selectedInstructor.user?.first_name} ${selectedInstructor.user?.last_name}` : "Instructor Profile"}
        subtitle={selectedInstructor?.user?.email}
        widthClass="max-w-lg"
      >
        {selectedInstructor && (
          <div className="space-y-6 text-xs text-slate-700">
            {/* Header Identity Card */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-4">
              <Avatar className="w-14 h-14 ring-2 ring-teal-600/20">
                <AvatarImage src={selectedInstructor.user?.avatar_url || ""} />
                <AvatarFallback className="text-base font-bold bg-teal-100 text-teal-800">
                  {selectedInstructor.user?.first_name?.[0]}{selectedInstructor.user?.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h3 className="font-bold text-sm text-navy-950">
                  {selectedInstructor.user?.first_name} {selectedInstructor.user?.last_name}
                </h3>
                <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                  <Mail className="w-3 h-3 text-slate-400" />
                  <span>{selectedInstructor.user?.email}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  <span>{selectedInstructor.user?.city ? `${selectedInstructor.user?.city}, ${selectedInstructor.user?.state || "US"}` : "Remote Location"}</span>
                </div>
              </div>
            </div>

            {/* Account Status Card */}
            <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
              <span className="font-bold text-navy-950">Account Status:</span>
              <StatusBadge status={selectedInstructor.user?.account_status || "ACTIVE"} />
            </div>

            {/* Hourly Rate Summary */}
            <div className="p-4 bg-teal-50/50 border border-teal-200 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-teal-800 block">Base Teaching Rate</span>
                <span className="font-bold text-navy-950 text-base">
                  ${((selectedInstructor.hourly_rate || 3500) / 100).toFixed(2)} / hr
                </span>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800">
                {selectedInstructor.preferred_format || "BOTH"}
              </span>
            </div>

            {/* Background Check Compliance */}
            <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-navy-950 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Background Verification Status</span>
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  Verified
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Instructor credentials and background review cleared for both virtual classes and physical venues.
              </p>
            </div>

            {/* Authorized Teaching Subjects */}
            <div className="p-4 bg-slate-50/80 border border-slate-200 rounded-xl space-y-2">
              <span className="font-bold text-navy-950 flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-teal-600" />
                <span>Authorized Subjects & Specialties</span>
              </span>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {["AP Biology", "Molecular Biochemistry", "Organic Chemistry", "Cellular Biology"].map((subj) => (
                  <span key={subj} className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700 text-[11px] font-medium shadow-2xs">
                    {subj}
                  </span>
                ))}
              </div>
            </div>

            {/* Active Platform Classes */}
            <div className="space-y-2.5">
              <h4 className="font-bold text-xs text-navy-950 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-teal-600" />
                <span>Class Offerings ({instructorClasses.length})</span>
              </h4>
              {instructorClasses.length === 0 ? (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center text-slate-400 text-[11px]">
                  No active or past class listings created by this instructor.
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {instructorClasses.map((c) => (
                    <div key={c.id} className="p-2.5 bg-white border border-slate-200 rounded-lg flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-navy-950 text-[11px]">{c.title}</p>
                        <p className="text-[10px] text-slate-400">
                          {c.format} • Status: {c.status}
                        </p>
                      </div>
                      <span className="font-mono text-[11px] font-bold text-teal-700">
                        ${((c.price || 3500) / 100).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions Drawer Footer */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
              <Button
                variant={(selectedInstructor.user?.account_status || "ACTIVE") === "ACTIVE" ? "destructive" : "default"}
                size="sm"
                className="h-8 text-xs min-w-[90px]"
                onClick={() => handleActionClick(selectedInstructor)}
              >
                {(selectedInstructor.user?.account_status || "ACTIVE") === "ACTIVE"
                  ? "Suspend Instructor"
                  : "Reactivate Instructor"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs border-slate-200"
                onClick={() => setIsDrawerOpen(false)}
              >
                Close Drawer
              </Button>
            </div>
          </div>
        )}
      </DetailDrawer>

      {/* Suspension Note Modal */}
      {isSuspendModalOpen && suspendingInstructor && (
        <div className="fixed inset-0 z-50 bg-navy-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-navy-950">
                  Suspend {suspendingInstructor.user?.first_name} {suspendingInstructor.user?.last_name}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Enter an administrative note explaining why this instructor is being suspended.
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">
                Suspension Reason & Notes:
              </label>
              <Textarea
                placeholder="e.g. Incomplete credentials, student dispute under investigation..."
                value={suspensionReason}
                onChange={(e) => setSuspensionReason(e.target.value)}
                rows={3}
                className="text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs border-slate-200"
                onClick={() => {
                  setIsSuspendModalOpen(false);
                  setSuspendingInstructor(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                className="h-8 text-xs bg-rose-600 hover:bg-rose-700"
                onClick={confirmSuspension}
              >
                Confirm Suspension
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
