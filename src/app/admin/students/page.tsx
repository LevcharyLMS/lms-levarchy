"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/ui/status-badge";
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
  Phone,
  MapPin,
  FileText,
  Eye,
  Mail,
  BookOpen,
  Calendar,
  Users,
  GraduationCap,
  Download,
  AlertCircle,
  CheckCircle2
} from "lucide-react";

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [gradeFilter, setGradeFilter] = useState("ALL");
  const [actionAlert, setActionAlert] = useState<string | null>(null);

  // Modal / Drawer state
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Suspension Modal State
  const [suspendingStudent, setSuspendingStudent] = useState<any | null>(null);
  const [suspensionReason, setSuspensionReason] = useState("");
  const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/students");
      if (res.ok) {
        const data = await res.json();
        setStudents(data.students || []);
      }
    } catch (err) {
      console.error("Failed to load students:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleActionClick = (student: any) => {
    const isCurrentlyActive = (student.account_status || "ACTIVE") === "ACTIVE";
    if (isCurrentlyActive) {
      setSuspendingStudent(student);
      setSuspensionReason("");
      setIsSuspendModalOpen(true);
    } else {
      executeStatusUpdate(student.id, "ACTIVE", "Account reactivated by administrator");
    }
  };

  const confirmSuspension = () => {
    if (!suspendingStudent) return;
    executeStatusUpdate(
      suspendingStudent.id,
      "SUSPENDED",
      suspensionReason.trim() || "Policy compliance or safety review suspension"
    );
    setIsSuspendModalOpen(false);
    setSuspendingStudent(null);
  };

  const executeStatusUpdate = async (userId: string, nextStatus: "ACTIVE" | "SUSPENDED", noteText?: string) => {
    try {
      setUpdatingId(userId);
      await fetch("/api/admin/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, accountStatus: nextStatus, note: noteText }),
      });

      db.updateProfile(userId, { account_status: nextStatus as any });

      setStudents((prev) =>
        prev.map((s) => (s.id === userId ? { ...s, account_status: nextStatus } : s))
      );
      if (selectedStudent && selectedStudent.id === userId) {
        setSelectedStudent({ ...selectedStudent, account_status: nextStatus });
      }
      setActionAlert(`Student account marked as ${nextStatus}.${noteText ? ` Note: "${noteText}"` : ""}`);
      setTimeout(() => setActionAlert(null), 4000);
    } catch (err) {
      console.error("Failed to update student status:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const studentProfile = Array.isArray(s.student_profiles)
        ? s.student_profiles[0]
        : s.student_profiles;
      const grade = studentProfile?.grade_level || "Standard Curriculum";

      if (gradeFilter !== "ALL" && !grade.toLowerCase().includes(gradeFilter.toLowerCase())) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = `${s.first_name} ${s.last_name}`.toLowerCase().includes(q);
        const matchesEmail = (s.email || "").toLowerCase().includes(q);
        const matchesPhone = (s.phone || "").toLowerCase().includes(q);
        return matchesName || matchesEmail || matchesPhone;
      }

      return true;
    });
  }, [students, gradeFilter, searchQuery]);

  const openStudentModal = (s: any) => {
    setSelectedStudent(s);
    setIsDrawerOpen(true);
  };

  const studentBookings = useMemo(() => {
    if (!selectedStudent) return [];
    return db.getBookings().filter((b) => b.student_id === selectedStudent.id);
  }, [selectedStudent]);

  const exportStudentsCSV = () => {
    let csvContent = "ID,FirstName,LastName,Email,Phone,Grade,GuardianName,AccountStatus,CreatedAt\n";
    filteredStudents.forEach((s) => {
      const prof = Array.isArray(s.student_profiles) ? s.student_profiles[0] : s.student_profiles;
      const guardian = prof?.preferences?.guardian_name || "Self/Adult";
      csvContent += `"${s.id}","${s.first_name}","${s.last_name}","${s.email}","${s.phone || ""}","${prof?.grade_level || ""}","${guardian}","${s.account_status || "ACTIVE"}","${s.created_at || ""}"\n`;
    });
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `levchary_students_${new Date().toISOString().split("T")[0]}.csv`;
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
        badgeText="Enrolled Students"
        description="Student profiles, learning preferences, parent/guardian links, ID verification review, and platform access oversight."
        tabs={userTabs}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={exportStudentsCSV}
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

      {/* Filter Bar with Grade Level Dropdown & Search */}
      <FilterBar
        searchPlaceholder="Search students by name, email, or phone..."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        categories={[
          { id: "Middle School", label: "Middle School" },
          { id: "High School", label: "High School" },
          { id: "College", label: "College / University" },
          { id: "Adult", label: "Adult Learners" },
        ]}
        selectedCategory={gradeFilter}
        onCategorySelect={setGradeFilter}
        onReset={() => {
          setSearchQuery("");
          setGradeFilter("ALL");
        }}
        totalCount={filteredStudents.length}
      />

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-6 h-6 animate-spin text-teal-600 mx-auto mb-2" />
            <p className="text-xs text-slate-400">Loading enrolled students...</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No students found matching your search and grade filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="p-4">Student</th>
                  <th className="p-4">Guardian / Contact</th>
                  <th className="p-4">Grade & Goals</th>
                  <th className="p-4">Active Classes</th>
                  <th className="p-4">Account Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredStudents.map((s) => {
                  const isUpdating = updatingId === s.id;
                  const studentProfile = Array.isArray(s.student_profiles)
                    ? s.student_profiles[0]
                    : s.student_profiles;
                  const isSuspended = s.account_status === "SUSPENDED";
                  const bookingsCount = db.getBookings().filter((b) => b.student_id === s.id).length;
                  const guardianInfo = studentProfile?.preferences?.guardian_name || "Self / Adult Student";
                  const guardianContact = studentProfile?.preferences?.guardian_email || s.phone || "No alternate contact";

                  return (
                    <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-4">
                        <div
                          className="flex items-center gap-3 cursor-pointer group"
                          onClick={() => openStudentModal(s)}
                        >
                          <Avatar className="w-9 h-9 ring-1 ring-slate-200 group-hover:ring-teal-500 transition-colors">
                            <AvatarImage src={s.avatar_url || ""} />
                            <AvatarFallback className="bg-teal-50 text-teal-800 font-bold">
                              {(s.first_name?.[0] || "S") + (s.last_name?.[0] || "")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-bold text-navy-950 group-hover:text-teal-700 transition-colors">
                              {s.first_name} {s.last_name}
                            </p>
                            <p className="text-[11px] text-slate-400">{s.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <p className="text-slate-800 font-medium flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-teal-600" />
                          <span>{guardianInfo}</span>
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5 truncate max-w-[180px]">
                          {guardianContact}
                        </p>
                      </td>

                      <td className="p-4">
                        <p className="font-bold text-teal-800">
                          {studentProfile?.grade_level || "Standard Curriculum"}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate max-w-xs">
                          {studentProfile?.learning_goals || "General academic support"}
                        </p>
                      </td>

                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200 inline-flex items-center gap-1">
                          <BookOpen className="w-3 h-3 text-blue-600" />
                          <span>{bookingsCount} {bookingsCount === 1 ? "Class" : "Classes"}</span>
                        </span>
                      </td>

                      <td className="p-4">
                        <StatusBadge status={s.account_status || "ACTIVE"} />
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs border-slate-200 text-slate-600 gap-1"
                            onClick={() => openStudentModal(s)}
                          >
                            <Eye className="w-3.5 h-3.5 text-teal-600" /> View
                          </Button>
                          <Button
                            variant={isSuspended ? "outline" : "destructive"}
                            size="sm"
                            className="h-8 text-xs min-w-[85px]"
                            disabled={isUpdating}
                            onClick={() => handleActionClick(s)}
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

      {/* Student Profile Modal Drawer */}
      <DetailDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={selectedStudent ? `${selectedStudent.first_name} ${selectedStudent.last_name}` : "Student Profile"}
        subtitle={selectedStudent?.email}
        widthClass="max-w-lg"
      >
        {selectedStudent && (
          <div className="space-y-6 text-xs text-slate-700">
            {/* Header Avatar and Basic Info */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-4">
              <Avatar className="w-14 h-14 ring-2 ring-teal-600/20">
                <AvatarImage src={selectedStudent.avatar_url || ""} />
                <AvatarFallback className="text-base font-bold bg-teal-100 text-teal-800">
                  {selectedStudent.first_name?.[0]}{selectedStudent.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h3 className="font-bold text-sm text-navy-950">
                  {selectedStudent.first_name} {selectedStudent.last_name}
                </h3>
                <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                  <Mail className="w-3 h-3 text-slate-400" />
                  <span>{selectedStudent.email}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  <span>{selectedStudent.city ? `${selectedStudent.city}, ${selectedStudent.state || "US"}` : "Not specified"}</span>
                </div>
              </div>
            </div>

            {/* Account Status Badge */}
            <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
              <span className="font-bold text-navy-950">Account Status:</span>
              <StatusBadge status={selectedStudent.account_status || "ACTIVE"} />
            </div>

            {/* Parent & Guardian Section (K-12 Minor Protection) */}
            <div className="p-4 bg-purple-50/50 border border-purple-200/80 rounded-xl space-y-2.5">
              <div className="flex items-center gap-2 text-purple-900 font-bold">
                <Users className="w-4 h-4 text-purple-700" />
                <span>Parent / Guardian & Emergency Contact</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-[11px]">
                <div>
                  <span className="text-slate-400 block">Guardian Full Name:</span>
                  <span className="font-semibold text-navy-950">
                    {selectedStudent.student_profiles?.preferences?.guardian_name || "Self / Independent Adult"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Contact Phone / WhatsApp:</span>
                  <span className="font-semibold text-emerald-700 font-mono">
                    {selectedStudent.phone || "+1 (555) 234-5678"}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 block">Emergency / Alternate Email:</span>
                  <span className="font-semibold text-navy-950">
                    {selectedStudent.student_profiles?.preferences?.guardian_email || selectedStudent.email}
                  </span>
                </div>
              </div>
            </div>

            {/* Academic Information */}
            <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-navy-950 font-bold">
                <GraduationCap className="w-4 h-4 text-teal-600" />
                <span>Curriculum Tier & Goals</span>
              </div>
              <p className="text-[11px] text-slate-600">
                <strong className="text-navy-950">Target Level: </strong>
                {selectedStudent.student_profiles?.grade_level || "Standard Curriculum"}
              </p>
              <p className="text-[11px] text-slate-600">
                <strong className="text-navy-950">Learning Objectives: </strong>
                {selectedStudent.student_profiles?.learning_goals || "General academic and coursework support."}
              </p>
            </div>

            {/* Active Class Bookings & Attendance */}
            <div className="space-y-2.5">
              <h4 className="font-bold text-xs text-navy-950 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-teal-600" />
                <span>Enrolled Classes & Activity Ledger ({studentBookings.length})</span>
              </h4>
              {studentBookings.length === 0 ? (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center text-slate-400 text-[11px]">
                  No active or past class bookings found for this student.
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {studentBookings.map((b) => (
                    <div key={b.id} className="p-2.5 bg-white border border-slate-200 rounded-lg flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-navy-950 text-[11px]">
                          {b.class_item?.title || `Class Session #${b.booking_number}`}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {b.format} • Status: {b.status}
                        </p>
                      </div>
                      <span className="font-mono text-[11px] font-bold text-teal-700">
                        ${((b.financial_snapshot?.gross_amount || 0) / 100).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
              <Button
                variant={selectedStudent.account_status === "SUSPENDED" ? "default" : "destructive"}
                size="sm"
                className="h-8 text-xs"
                onClick={() => handleActionClick(selectedStudent)}
              >
                {selectedStudent.account_status === "SUSPENDED" ? "Reactivate Student" : "Suspend Student"}
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
      {isSuspendModalOpen && suspendingStudent && (
        <div className="fixed inset-0 z-50 bg-navy-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-navy-950">
                  Suspend {suspendingStudent.first_name} {suspendingStudent.last_name}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Enter an administrative note explaining why this student account is being suspended.
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">
                Suspension Reason & Notes:
              </label>
              <Textarea
                placeholder="e.g. Inappropriate communication with tutor, dispute investigation..."
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
                  setSuspendingStudent(null);
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
