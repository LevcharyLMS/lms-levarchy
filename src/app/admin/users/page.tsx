"use client";

import React, { useState, useMemo } from "react";
import { db } from "@/lib/data-store";
import { UserProfile, UserRole } from "@/types";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { DataTable, Column } from "@/components/shared/data-table";
import { FilterBar } from "@/components/shared/filter-bar";
import { UserX, UserCheck, Shield, CheckCircle2 } from "lucide-react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>(db.getProfiles());
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [actionAlert, setActionAlert] = useState<string | null>(null);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (roleFilter !== "ALL" && u.role !== roleFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = `${u.first_name} ${u.last_name}`.toLowerCase().includes(q);
        const matchesEmail = u.email.toLowerCase().includes(q);
        return matchesName || matchesEmail;
      }
      return true;
    });
  }, [users, roleFilter, searchQuery]);

  const toggleAccountStatus = (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    const updated = db.updateProfile(userId, { account_status: newStatus as any });

    if (updated) {
      db.logAudit({
        actor_id: "usr-admin-1",
        actor_role: "ADMIN",
        action: `USER_STATUS_${newStatus}`,
        entity_type: "USER_PROFILE",
        entity_id: userId,
        metadata: { previous_status: currentStatus, new_status: newStatus },
      });

      setUsers([...db.getProfiles()]);
      setActionAlert(`User status updated to ${newStatus}. Logged in audit trail.`);
      setTimeout(() => setActionAlert(null), 4000);
    }
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
              : "bg-indigo-100 text-indigo-800"
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

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-navy-950">
            Platform User Directory
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage student, educator, and administrator accounts with strict server-side RBAC and suspension controls.
          </p>
        </div>
      </div>

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
          { id: "TUTOR", label: "Tutors" },
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
