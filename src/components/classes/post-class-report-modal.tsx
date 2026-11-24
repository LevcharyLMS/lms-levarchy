"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  FileText,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  MapPin,
  Video,
  AlertCircle,
  Send,
  Save,
  HelpCircle,
} from "lucide-react";

export interface AttendanceItem {
  studentId: string;
  studentName: string;
  status: "PRESENT" | "ABSENT" | "LATE";
}

interface PostClassReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  classItem: {
    id: string;
    title: string;
    format: "VIRTUAL" | "PHYSICAL";
    class_type?: "ONE_ON_ONE" | "GROUP";
    instructor_id?: string;
    location_name?: string;
    location_id?: string;
  };
  bookingId?: string;
  instructorId: string;
  enrolledStudents?: Array<{ id: string; name: string }>;
  onReportSubmitted?: () => void;
}

export function PostClassReportModal({
  isOpen,
  onClose,
  classItem,
  bookingId,
  instructorId,
  enrolledStudents = [],
  onReportSubmitted,
}: PostClassReportModalProps) {
  const [sessionDate, setSessionDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [topicsCovered, setTopicsCovered] = useState("");
  const [homeworkAssigned, setHomeworkAssigned] = useState("");
  const [textClassComments, setTextClassComments] = useState("");
  const [privateNotes, setPrivateNotes] = useState("");
  const [attendance, setAttendance] = useState<AttendanceItem[]>(() => {
    if (enrolledStudents.length > 0) {
      return enrolledStudents.map((s) => ({
        studentId: s.id,
        studentName: s.name,
        status: "PRESENT",
      }));
    }
    return [
      { studentId: "std-sample", studentName: "Enrolled Student", status: "PRESENT" },
    ];
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const updateAttendanceStatus = (index: number, status: "PRESENT" | "ABSENT" | "LATE") => {
    setAttendance((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], status };
      return copy;
    });
  };

  const handleSubmit = async (submitStatus: "DRAFT" | "PENDING_ADMIN_REVIEW") => {
    setError(null);
    if (!topicsCovered.trim()) {
      setError("Please outline the topics covered in today's session.");
      return;
    }
    if (!textClassComments.trim()) {
      setError("Please enter the public text comments/feedback for platform users.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/class-reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classId: classItem.id,
          bookingId: bookingId || null,
          instructorId,
          format: classItem.format || "VIRTUAL",
          classType: classItem.class_type || "ONE_ON_ONE",
          sessionDate: new Date(sessionDate).toISOString(),
          locationId: classItem.location_id || null,
          topicsCovered,
          homeworkAssigned,
          instructorPrivateNotes: privateNotes,
          textClassComments,
          attendanceRecords: attendance,
          status: submitStatus,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to submit post-class report.");
      }

      setSuccess(true);
      setTimeout(() => {
        onReportSubmitted?.();
        onClose();
        setSuccess(false);
      }, 1800);
    } catch (err: any) {
      setError(err.message || "Failed to submit report. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Post-Class Report & Session Feedback"
      maxWidthClass="max-w-2xl"
    >
      <div className="space-y-5 py-2">
        {/* Class Banner */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-navy-950 text-sm">
                {classItem.title}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200 flex items-center gap-1">
                {classItem.format === "VIRTUAL" ? (
                  <>
                    <Video className="w-2.5 h-2.5" /> Virtual
                  </>
                ) : (
                  <>
                    <MapPin className="w-2.5 h-2.5" /> Physical ({classItem.location_name || "Venue"})
                  </>
                )}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Submit your session review below. Approved comments will be published on the platform for enrolled students and parents.
            </p>
          </div>
          <div className="text-right">
            <label className="text-[10px] font-medium text-slate-400 block mb-1">
              Session Date
            </label>
            <input
              type="date"
              value={sessionDate}
              onChange={(e) => setSessionDate(e.target.value)}
              className="text-xs border border-slate-200 rounded-md px-2 py-1 bg-white text-navy-950 focus:outline-teal-600"
            />
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Report submitted successfully! It has been placed in the Admin Review Queue and will be published over the platform upon approval.
            </span>
          </div>
        )}

        {/* Section 1: Attendance Checklist */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-navy-950 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-teal-600" />
              <span>Student Attendance ({attendance.length})</span>
            </label>
            <span className="text-[11px] text-slate-400">
              Mark attendance for this session
            </span>
          </div>
          <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 max-h-40 overflow-y-auto bg-white">
            {attendance.map((att, idx) => (
              <div
                key={att.studentId + idx}
                className="p-2.5 px-3 flex items-center justify-between text-xs hover:bg-slate-50/50 transition-colors"
              >
                <span className="font-medium text-slate-800">
                  {att.studentName}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => updateAttendanceStatus(idx, "PRESENT")}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1 transition-all ${
                      att.status === "PRESENT"
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-xs"
                        : "text-slate-500 hover:bg-slate-100 border border-transparent"
                    }`}
                  >
                    <CheckCircle2 className="w-3 h-3" /> Present
                  </button>
                  <button
                    type="button"
                    onClick={() => updateAttendanceStatus(idx, "LATE")}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1 transition-all ${
                      att.status === "LATE"
                        ? "bg-amber-100 text-amber-800 border border-amber-300 shadow-xs"
                        : "text-slate-500 hover:bg-slate-100 border border-transparent"
                    }`}
                  >
                    <Clock className="w-3 h-3" /> Late
                  </button>
                  <button
                    type="button"
                    onClick={() => updateAttendanceStatus(idx, "ABSENT")}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1 transition-all ${
                      att.status === "ABSENT"
                        ? "bg-red-100 text-red-800 border border-red-300 shadow-xs"
                        : "text-slate-500 hover:bg-slate-100 border border-transparent"
                    }`}
                  >
                    <XCircle className="w-3 h-3" /> Absent
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: Topics Covered & Homework */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-navy-950 flex items-center gap-1">
              <span>Topics Covered</span>
              <span className="text-red-500">*</span>
            </label>
            <Textarea
              rows={3}
              placeholder="e.g., Reviewed chapter 4 equations, practiced sample exercises..."
              value={topicsCovered}
              onChange={(e) => setTopicsCovered(e.target.value)}
              className="text-xs"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-navy-950 flex items-center gap-1">
              <span>Homework & Practice Assigned</span>
            </label>
            <Textarea
              rows={3}
              placeholder="e.g., Problems 12-25 on page 84; submit prior to next lesson..."
              value={homeworkAssigned}
              onChange={(e) => setHomeworkAssigned(e.target.value)}
              className="text-xs"
            />
          </div>
        </div>

        {/* Section 3: Text Class Comments (PUBLISHED OVER PLATFORM) */}
        <div className="space-y-1.5 p-3.5 rounded-xl bg-teal-50/60 border border-teal-200/80">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-teal-950 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>Text Class Comments (Platform Users View)</span>
              <span className="text-red-500">*</span>
            </label>
            <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-teal-100 text-teal-800 border border-teal-300">
              Published Over Platform
            </span>
          </div>
          <p className="text-[11px] text-teal-900/80">
            Write your session feedback, key takeaways, and praise for the cohort. Upon Admin approval, these comments become publicly visible to students and parents on the platform.
          </p>
          <Textarea
            rows={3}
            placeholder="Great participation today! Everyone demonstrated a solid understanding of the concepts..."
            value={textClassComments}
            onChange={(e) => setTextClassComments(e.target.value)}
            className="text-xs bg-white border-teal-200"
          />
        </div>

        {/* Section 4: Private Instructor Notes */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-600 flex items-center gap-1">
            <span>Private Instructor Notes</span>
            <span className="text-[10px] text-slate-400 font-normal">
              (Confidential — visible only to you and platform administrators)
            </span>
          </label>
          <Textarea
            rows={2}
            placeholder="Internal reminders, individual progress notes, or topics to revisit next session..."
            value={privateNotes}
            onChange={(e) => setPrivateNotes(e.target.value)}
            className="text-xs"
          />
        </div>

        {/* Governance Notice */}
        <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-900 flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>Publishing Notice:</strong> Per platform governance, submitted reports are reviewed by Admin before publishing live over the platform to students.
          </span>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={submitting}
            className="text-xs"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleSubmit("DRAFT")}
            disabled={submitting}
            className="text-xs gap-1 border-slate-300 text-slate-700"
          >
            <Save className="w-3.5 h-3.5" />
            Save as Draft
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => handleSubmit("PENDING_ADMIN_REVIEW")}
            disabled={submitting}
            className="text-xs gap-1.5 bg-teal-600 hover:bg-teal-700 text-white"
          >
            <Send className="w-3.5 h-3.5" />
            {submitting ? "Submitting..." : "Submit for Admin Approval"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
