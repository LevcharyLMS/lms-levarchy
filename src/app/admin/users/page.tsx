"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { db } from "@/lib/data-store";
import { useAuth } from "@/context/auth-context";
import { UserProfile, UserRole } from "@/types";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { DataTable, Column } from "@/components/shared/data-table";
import { FilterBar } from "@/components/shared/filter-bar";
import { AdminHubHeader } from "@/components/admin/admin-hub-header";
import { DetailDrawer } from "@/components/shared/detail-drawer";
import { Textarea } from "@/components/ui/textarea";
import {
  UserX,
  UserCheck,
  Shield,
  CheckCircle2,
  Eye,
  Download,
  Calendar,
  Mail,
  MapPin,
  Clock,
  BookOpen,
  DollarSign,
  AlertCircle
} from "lucide-react";

export default function AdminUsersPage() {
  const { user: currentAdmin } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [actionAlert, setActionAlert] = useState<string | null>(null);

  // Detail Modal State
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Suspension Note Modal State
  const [suspendingUser, setSuspendingUser] = useState<UserProfile | null>(null);
  const [suspensionReason, setSuspensionReason] = useState("");
  const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      } else {
        setUsers(db.getProfiles());
      }
    } catch {
      setUsers(db.getProfiles());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (roleFilter !== "ALL" && u.role !== roleFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = `${u.first_name} ${u.last_name}`.toLowerCase().includes(q);
        const matchesEmail = (u.email || "").toLowerCase().includes(q);
        return matchesName || matchesEmail;
      }
      return true;
    });
  }, [users, roleFilter, searchQuery]);

  const handleActionClick = (u: UserProfile) => {
    if (u.account_status === "ACTIVE") {
      setSuspendingUser(u);
      setSuspensionReason("");
      setIsSuspendModalOpen(true);
    } else {
      executeStatusUpdate(u.id, "ACTIVE", "Account reactivated by administrator");
    }
  };

  const confirmSuspension = () => {
    if (!suspendingUser) return;
    executeStatusUpdate(
      suspendingUser.id,
      "SUSPENDED",
      suspensionReason.trim() || "Policy compliance or safety review suspension"
    );
    setIsSuspendModalOpen(false);
    setSuspendingUser(null);
  };

  const executeStatusUpdate = async (userId: string, nextStatus: "ACTIVE" | "SUSPENDED", noteText?: string) => {
    try {
      await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, accountStatus: nextStatus, note: noteText }),
      });
    } catch {}

    db.updateProfile(userId, { account_status: nextStatus as any });

    db.logAudit({
      actor_id: currentAdmin?.id || "usr-admin-1",
      actor_role: "ADMIN",
      action: `USER_STATUS_${nextStatus}`,
      entity_type: "USER_PROFILE",
      entity_id: userId,
      metadata: { new_status: nextStatus, note: noteText },
    });

    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, account_status: nextStatus as any } : u))
    );
    if (selectedUser && selectedUser.id === userId) {
      setSelectedUser({ ...selectedUser, account_status: nextStatus as any });
    }
    setActionAlert(`User marked as ${nextStatus}.${noteText ? ` Note logged: "${noteText}"` : ""}`);
    setTimeout(() => setActionAlert(null), 4000);
  };

  const openUserDetail = (u: UserProfile) => {
    setSelectedUser(u);
    setIsDrawerOpen(true);
  };

  // User-specific stats computation for detail drawer
  const userBookings = useMemo(() => {
    if (!selectedUser) return [];
    return db.getBookings().filter((b) => b.student_id === selectedUser.id || b.tutor_id === selectedUser.id);
  }, [selectedUser]);

  const userTransactions = useMemo(() => {
    if (!selectedUser) return [];
    const bookingIds = new Set(userBookings.map((b) => b.id).filter(Boolean));
    return db.state.transactions.filter((t) => t.booking_id && bookingIds.has(t.booking_id));
  }, [selectedUser, userBookings]);

  const exportUsersCSV = () => {
    let csvContent = "ID,FirstName,LastName,Email,Role,AccountStatus,VerificationStatus,CreatedAt\n";
    filteredUsers.forEach((u) => {
      csvContent += `"${u.id}","${u.first_name}","${u.last_name}","${u.email}","${u.role}","${u.account_status}","${u.verification_status}","${u.created_at || ""}"\n`;
    });
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `levchary_users_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns: Column<UserProfile>[] = [
    {
      key: "name",
      header: "User Profile",
      sortable: true,
      render: (u) => (
        <div
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => openUserDetail(u)}
        >
          <Avatar className="w-8 h-8 ring-1 ring-slate-200 group-hover:ring-teal-500 transition-colors">
            <AvatarImage src={u.avatar_url || ""} />
            <AvatarFallback>{u.first_name?.[0] || "U"}{u.last_name?.[0] || ""}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-bold text-navy-950 text-xs group-hover:text-teal-700 transition-colors">
              {u.first_name} {u.last_name}
            </p>
            <p className="text-[11px] text-slate-400">{u.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      sortable: true,
      render: (u) => (
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
            u.role === "ADMIN"
              ? "bg-purple-100 text-purple-900"
              : u.role === "TUTOR"
              ? "bg-teal-100 text-teal-800"
              : "bg-blue-100 text-blue-800"
          }`}
        >
          {u.role}
        </span>
      ),
    },
    {
      key: "location",
      header: "Location",
      render: (u) => (
        <span className="text-slate-500 text-xs">
          {u.city ? `${u.city}, ${u.state || "US"}` : "Remote"}
        </span>
      ),
    },
    {
      key: "account_status",
      header: "Status",
      render: (u) => <StatusBadge status={u.account_status} />,
    },
    {
      key: "verification_status",
      header: "Verification",
      render: (u) => <StatusBadge status={u.verification_status} />,
    },
    {
      key: "actions",
      header: "Access Controls",
      className: "text-right",
      render: (u) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-[11px] gap-1 px-2 border-slate-200 text-slate-600 hover:text-navy-950"
            onClick={() => openUserDetail(u)}
          >
            <Eye className="w-3 h-3 text-teal-600" /> Inspect
          </Button>
          {u.role !== "ADMIN" && (
            <Button
              variant={u.account_status === "ACTIVE" ? "destructive" : "outline"}
              size="sm"
              className="h-7 text-[11px] gap-1 px-2.5"
              onClick={() => handleActionClick(u)}
            >
              {u.account_status === "ACTIVE" ? (
                <>
                  <UserX className="w-3 h-3" /> Suspend
                </>
              ) : (
                <>
                  <UserCheck className="w-3 h-3" /> Reactivate
                </>
              )}
            </Button>
          )}
        </div>
      ),
    },
  ];

  const pendingVerificationsCount = db.state.verification_documents.filter(
    (d) => d.status === "PENDING_REVIEW"
  ).length;

  const userTabs = [
    { label: "All Users", href: "/admin/users" },
    { label: "Students", href: "/admin/students" },
    { label: "Instructors", href: "/admin/instructors" },
    { label: "Applications", href: "/admin/instructor-applications" },
    {
      label: "Verifications",
      href: "/admin/verifications",
      badge: pendingVerificationsCount > 0 ? pendingVerificationsCount : undefined,
    },
  ];

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Modern Hub Header with Sub-Tabs */}
      <AdminHubHeader
        title="People & Accounts Hub"
        badgeText="RBAC Authority"
        description="Oversee student enrollments, faculty profiles, candidate applications, and credential document verification."
        tabs={userTabs}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={exportUsersCSV}
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

      {/* Filter Bar with Role Chips */}
      <FilterBar
        searchPlaceholder="Search users by name or email..."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        categories={[
          { id: "STUDENT", label: "Students" },
          { id: "TUTOR", label: "Instructors" },
          { id: "ADMIN", label: "Admins" },
        ]}
        selectedCategory={roleFilter}
        onCategorySelect={setRoleFilter}
        onReset={() => {
          setSearchQuery("");
          setRoleFilter("ALL");
        }}
        totalCount={filteredUsers.length}
      />

      {/* Data Table */}
      <DataTable
        data={filteredUsers}
        columns={columns}
        searchPlaceholder="Filter listed users..."
        emptyTitle="No users match your filter"
        emptyDescription="Try clearing your search query or selecting another role category."
      />

      {/* User Detail Drawer */}
      <DetailDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={selectedUser ? `${selectedUser.first_name} ${selectedUser.last_name}` : "User Profile"}
        subtitle={selectedUser?.email}
        widthClass="max-w-lg"
      >
        {selectedUser && (
          <div className="space-y-6 text-xs text-slate-700">
            {/* Header Identity Card */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-4">
              <Avatar className="w-14 h-14 ring-2 ring-teal-600/20 shadow-xs">
                <AvatarImage src={selectedUser.avatar_url || ""} />
                <AvatarFallback className="text-base font-bold bg-teal-100 text-teal-800">
                  {selectedUser.first_name?.[0]}{selectedUser.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-navy-950">
                    {selectedUser.first_name} {selectedUser.last_name}
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-teal-800">
                    {selectedUser.role}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                  <Mail className="w-3 h-3 text-slate-400" />
                  <span>{selectedUser.email}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  <span>{selectedUser.city ? `${selectedUser.city}, ${selectedUser.state || "US"}` : "Remote Location"}</span>
                </div>
              </div>
            </div>

            {/* Account Status & Verification Summary */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Account Status
                </span>
                <StatusBadge status={selectedUser.account_status} />
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Verification
                </span>
                <StatusBadge status={selectedUser.verification_status} />
              </div>
            </div>

            {/* Registration Date & System Identifiers */}
            <div className="p-3.5 bg-slate-50/80 border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Registration Date:</span>
                </span>
                <span className="font-semibold text-navy-950">
                  {selectedUser.created_at ? selectedUser.created_at.split("T")[0] : "2026-01-15"}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500">System UUID:</span>
                <span className="font-mono text-slate-600 truncate max-w-[200px]">{selectedUser.id}</span>
              </div>
            </div>

            {/* Activity & Enrolled Classes Overview */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs text-navy-950 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-teal-600" />
                  <span>Associated Classes & Bookings ({userBookings.length})</span>
                </h4>
              </div>
              {userBookings.length === 0 ? (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center text-slate-400 text-[11px]">
                  No active or past class bookings found for this profile.
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {userBookings.map((b) => (
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

            {/* Financial Transactions Ledger */}
            <div className="space-y-2.5">
              <h4 className="font-bold text-xs text-navy-950 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-purple-700" />
                <span>Transaction History ({userTransactions.length})</span>
              </h4>
              {userTransactions.length === 0 ? (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center text-slate-400 text-[11px]">
                  No payment ledger transactions logged.
                </div>
              ) : (
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {userTransactions.map((tx) => (
                    <div key={tx.id} className="p-2 bg-slate-50 border border-slate-200 rounded text-[11px] flex justify-between items-center">
                      <div>
                        <span className="font-semibold text-navy-950">{tx.type}</span>
                        <span className="text-slate-400 block text-[10px]">{tx.created_at?.split("T")[0]}</span>
                      </div>
                      <span className="font-mono font-bold text-navy-950">${(tx.gross_amount / 100).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions Drawer Footer */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
              {selectedUser.role !== "ADMIN" && (
                <Button
                  variant={selectedUser.account_status === "ACTIVE" ? "destructive" : "default"}
                  size="sm"
                  className="h-8 text-xs gap-1"
                  onClick={() => handleActionClick(selectedUser)}
                >
                  {selectedUser.account_status === "ACTIVE" ? (
                    <>
                      <UserX className="w-3.5 h-3.5" /> Suspend Account
                    </>
                  ) : (
                    <>
                      <UserCheck className="w-3.5 h-3.5" /> Reactivate Account
                    </>
                  )}
                </Button>
              )}
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
      {isSuspendModalOpen && suspendingUser && (
        <div className="fixed inset-0 z-50 bg-navy-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-navy-950">
                  Suspend {suspendingUser.first_name} {suspendingUser.last_name}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Enter an administrative reason or audit note for suspending this account.
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">
                Suspension Reason & Notes:
              </label>
              <Textarea
                placeholder="e.g. Inappropriate conduct during session, identity clarification needed..."
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
                  setSuspendingUser(null);
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
