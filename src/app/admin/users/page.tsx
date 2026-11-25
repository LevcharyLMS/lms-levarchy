"use client";

import React, { useState, useEffect, useMemo } from "react";
import { db } from "@/lib/data-store";
import { useAuth } from "@/context/auth-context";
import { UserProfile, UserRole } from "@/types";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { DataTable, Column } from "@/components/shared/data-table";
import { FilterBar } from "@/components/shared/filter-bar";
import { AdminHubHeader } from "@/components/admin/admin-hub-header";
import { UserX, UserCheck, Shield, CheckCircle2, RefreshCw } from "lucide-react";

export default function AdminUsersPage() {
  const { user: currentAdmin } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [actionAlert, setActionAlert] = useState<string | null>(null);

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

  const toggleAccountStatus = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    try {
      await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, accountStatus: newStatus }),
      });
    } catch {}

    db.updateProfile(userId, { account_status: newStatus as any });

    db.logAudit({
      actor_id: currentAdmin?.id || "usr-admin-1",
      actor_role: "ADMIN",
      action: `USER_STATUS_${newStatus}`,
      entity_type: "USER_PROFILE",
      entity_id: userId,
      metadata: { previous_status: currentStatus, new_status: newStatus },
    });

    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, account_status: newStatus as any } : u))
    );
    setActionAlert(`User status updated to ${newStatus}. Logged in audit trail.`);
    setTimeout(() => setActionAlert(null), 4000);
  };

  const columns: Column<UserProfile>[] = [
    {
      key: "name",
      header: "User Profile",
      sortable: true,
      render: (u) => (
        <div className="flex items-center gap-3">
          <Avatar className="w-8 h-8 ring-1 ring-slate-200">
            <AvatarImage src={u.avatar_url || ""} />
            <AvatarFallback>{u.first_name[0]}{u.last_name[0]}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-bold text-navy-950 text-xs">{u.first_name} {u.last_name}</p>
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
              : "bg-teal-100 text-teal-800"
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
          {u.city ? `${u.city}, ${u.state}` : "Remote"}
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
        <div className="flex items-center justify-end">
          {u.role !== "ADMIN" && (
            <Button
              variant={u.account_status === "ACTIVE" ? "destructive" : "outline"}
              size="sm"
              className="h-7 text-[11px] gap-1 px-2.5"
              onClick={() => toggleAccountStatus(u.id, u.account_status)}
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
            onClick={loadUsers}
            disabled={loading}
            className="h-8 text-xs border-slate-200 gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
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
    </div>
  );
}
