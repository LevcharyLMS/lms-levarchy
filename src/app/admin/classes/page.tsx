"use client";

import React, { useState, useEffect, useMemo } from "react";
import { StatusBadge } from "@/components/ui/status-badge";
import { MoneyDisplay } from "@/components/ui/money-display";
import { Button } from "@/components/ui/button";
import { DataTable, Column } from "@/components/shared/data-table";
import { FilterBar } from "@/components/shared/filter-bar";
import { DetailDrawer } from "@/components/shared/detail-drawer";
import { StatCard } from "@/components/ui/stat-card";
import { AdminHubHeader } from "@/components/admin/admin-hub-header";
import {
  BookOpen,
  Video,
  MapPin,
  CheckCircle2,
  Users,
  Eye,
  Calendar,
  Layers,
} from "lucide-react";

export default function AdminClassesPage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formatFilter, setFormatFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState<any | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const loadClasses = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/classes");
      const data = await res.json();
      setClasses(data.classes || []);
    } catch (err) {
      console.error("Failed to load classes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClasses();
  }, []);

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus =
      currentStatus === "PUBLISHED" || currentStatus === "OPEN" ? "CANCELLED" : "PUBLISHED";
    await updateClassStatus(id, newStatus);
  };

  const updateClassStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch("/api/admin/classes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classId: id, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setActionNotice(`Class status updated to ${newStatus}.`);
        if (selectedClass && selectedClass.id === id) {
          setSelectedClass({ ...selectedClass, status: newStatus });
        }
        await loadClasses();
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const filteredClasses = useMemo(() => {
    return classes.filter((c) => {
      if (formatFilter !== "ALL" && c.format !== formatFilter) return false;
      if (statusFilter !== "ALL" && c.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const title = (c.title || "").toLowerCase();
        const tutor = `${c.tutor?.first_name || ""} ${c.tutor?.last_name || ""}`.toLowerCase();
        const category = (c.category?.name || "").toLowerCase();
        return title.includes(q) || tutor.includes(q) || category.includes(q);
      }
      return true;
    });
  }, [classes, formatFilter, statusFilter, searchQuery]);

  const pendingCount = classes.filter((c) => c.status === "PENDING_APPROVAL").length;
  const publishedCount = classes.filter(
    (c) => c.status === "PUBLISHED" || c.status === "OPEN"
  ).length;
  const totalCapacity = classes.reduce((sum, c) => sum + (c.capacity || 1), 0);
  const totalEnrolled = classes.reduce((sum, c) => sum + (c.enrolled_count || 0), 0);

  const columns: Column<any>[] = [
    {
      key: "title",
      header: "Class & Subject",
      sortable: true,
      render: (c) => (
        <div className="max-w-xs space-y-0.5">
          <p className="font-bold text-navy-950 truncate text-xs">{c.title}</p>
          <p className="text-[11px] text-slate-400">
            {c.category?.name || "General"} • {c.duration_minutes || 60} min
          </p>
        </div>
      ),
    },
    {
      key: "instructor",
      header: "Instructor",
      render: (c) => (
        <div>
          <p className="font-medium text-slate-900 text-xs">
            {c.tutor?.first_name} {c.tutor?.last_name}
          </p>
          <p className="text-[10px] text-slate-400 truncate max-w-[140px]">
            {c.tutor?.tutor_profile?.headline || "Verified Instructor"}
          </p>
        </div>
      ),
    },
    {
      key: "format",
      header: "Format & Type",
      render: (c) => (
        <div className="flex flex-col gap-1 items-start">
          <StatusBadge status={c.class_type} />
          <StatusBadge status={c.format} />
        </div>
      ),
    },
    {
      key: "price",
      header: "Tuition",
      sortable: true,
      render: (c) => (
        <span className="font-bold text-navy-950 text-xs">
          <MoneyDisplay cents={c.price} />
        </span>
      ),
    },
    {
      key: "enrollment",
      header: "Capacity",
      render: (c) => (
        <div className="space-y-1">
          <span className="text-xs font-semibold text-slate-800">
            {c.class_type === "GROUP" ? `${c.enrolled_count || 0} / ${c.capacity}` : "1-on-1"}
          </span>
          {c.class_type === "GROUP" && (
            <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full"
                style={{
                  width: `${Math.min(100, Math.round(((c.enrolled_count || 0) / (c.capacity || 1)) * 100))}%`,
                }}
              />
            </div>
          )}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (c) => <StatusBadge status={c.status} />,
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      render: (c) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-primary hover:bg-teal-50 flex items-center gap-1"
            onClick={() => setSelectedClass(c)}
          >
            <Eye className="w-3 h-3" />
            <span>Inspect</span>
          </Button>

          {c.status === "PENDING_APPROVAL" ? (
            <Button
              variant="default"
              size="sm"
              className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1"
              onClick={() => updateClassStatus(c.id, "PUBLISHED")}
            >
              <CheckCircle2 className="w-3 h-3" />
              <span>Approve & Publish</span>
            </Button>
          ) : (
            <Button
              variant={c.status === "CANCELLED" ? "default" : "outline"}
              size="sm"
              className="h-7 text-xs"
              onClick={() => toggleStatus(c.id, c.status)}
            >
              {c.status === "CANCELLED" ? "Reactivate" : "Cancel"}
            </Button>
          )}
        </div>
      ),
    },
  ];

  const academicTabs = [
    { label: "Classes & Approvals", href: "/admin/classes", badge: pendingCount > 0 ? pendingCount : undefined },
    { label: "Categories", href: "/admin/categories" },
    { label: "Subjects", href: "/admin/subjects" },
    { label: "Grades", href: "/admin/grades" },
    { label: "Physical Venues", href: "/admin/locations" },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <AdminHubHeader
        title="Academics & Curriculum Hub"
        badgeText="Catalog & Approvals"
        description="Oversee virtual classrooms, curriculum subjects, grade taxonomies, physical home visits, and learning centers."
        tabs={academicTabs}
        actions={
          <Button
            onClick={loadClasses}
            variant="outline"
            size="sm"
            className="h-8 text-xs border-slate-200"
            disabled={loading}
          >
            Refresh Catalog
          </Button>
        }
      />

      {actionNotice && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionNotice}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="underline font-semibold text-emerald-900">
            Dismiss
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
        <StatCard
          title="Total Classes"
          value={classes.length}
          subtitle="Catalog offerings"
          icon={Layers}
          variant="teal"
        />
        <StatCard
          title="Pending Approval"
          value={pendingCount}
          subtitle="Awaiting admin sign-off"
          icon={CheckCircle2}
          variant="amber"
        />
        <StatCard
          title="Published & Open"
          value={publishedCount}
          subtitle="Available for student booking"
          icon={BookOpen}
          variant="emerald"
        />
        <StatCard
          title="Total Enrolled"
          value={totalEnrolled}
          subtitle="Active student bookings"
          icon={Users}
          variant="purple"
        />
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Format:</span>
            {[
              { id: "ALL", label: "All Formats" },
              { id: "ONLINE_1ON1", label: "Online 1-on-1" },
              { id: "ONLINE_GROUP", label: "Online Group" },
              { id: "PHYSICAL_STUDENT_HOME", label: "Home Visit" },
              { id: "PHYSICAL_CENTER", label: "Learning Center" },
            ].map((fmt) => (
              <button
                key={fmt.id}
                onClick={() => setFormatFilter(fmt.id)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                  formatFilter === fmt.id
                    ? "bg-primary text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {fmt.label}
              </button>
            ))}

            <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block" />

            <span className="text-xs font-semibold text-slate-500">Status:</span>
            {["ALL", "PENDING_APPROVAL", "PUBLISHED", "OPEN", "CANCELLED"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                  statusFilter === st
                    ? "bg-primary text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {st === "PENDING_APPROVAL" ? "Pending Approval" : st}
              </button>
            ))}
          </div>

          <div className="w-full sm:w-64">
            <input
              type="text"
              placeholder="Search class or instructor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-8 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        data={filteredClasses}
        columns={columns}
        searchKey="title"
        emptyTitle="No classes found"
        emptyDescription="Classes created by approved faculty will appear here for administrative oversight."
      />

      {/* Detail Drawer */}
      <DetailDrawer
        isOpen={!!selectedClass}
        onClose={() => setSelectedClass(null)}
        title="Class Session Details"
        subtitle={`ID: ${selectedClass?.id || ""}`}
      >
        {selectedClass && (
          <div className="space-y-6 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-500">Class Status</span>
                <StatusBadge status={selectedClass.status} />
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-500">Delivery Format</span>
                <StatusBadge status={selectedClass.format} />
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-500">Type</span>
                <StatusBadge status={selectedClass.class_type} />
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-500">Duration</span>
                <span className="font-bold text-navy-950">{selectedClass.duration_minutes || 60} Minutes</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-500">Tuition Price</span>
                <span className="font-bold text-navy-950 text-sm">
                  <MoneyDisplay cents={selectedClass.price} />
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <span className="font-bold text-navy-950 block">Class Description</span>
              <p className="p-3 bg-white border border-slate-200 rounded-xl text-slate-700 leading-relaxed">
                {selectedClass.description || "Comprehensive curriculum tailored to student development goals."}
              </p>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2">
              <span className="font-bold text-navy-950 block">Instructor Information</span>
              <p className="font-semibold text-navy-950">
                {selectedClass.tutor?.first_name} {selectedClass.tutor?.last_name}
              </p>
              <p className="text-[11px] text-slate-500">
                {selectedClass.tutor?.tutor_profile?.headline || "Verified Academic Instructor"}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row gap-2">
              {selectedClass.status === "PENDING_APPROVAL" && (
                <Button
                  variant="default"
                  className="w-full h-9 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={() => updateClassStatus(selectedClass.id, "PUBLISHED")}
                >
                  Approve & Publish Class
                </Button>
              )}
              <Button
                variant={selectedClass.status === "CANCELLED" ? "default" : "destructive"}
                className="w-full h-9 text-xs"
                onClick={() => toggleStatus(selectedClass.id, selectedClass.status)}
              >
                {selectedClass.status === "CANCELLED" ? "Reactivate Class" : "Cancel Class (Remove from Marketplace)"}
              </Button>
            </div>
          </div>
        )}
      </DetailDrawer>
    </div>
  );
}
