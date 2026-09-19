"use client";

import React, { useState } from "react";
import { db } from "@/lib/data-store";
import { TutorAvailability } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { StatCard } from "@/components/ui/stat-card";
import {
  Clock,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Calendar,
  ShieldCheck,
  Ban,
} from "lucide-react";

export default function TutorAvailabilityPage() {
  const tutorId = "usr-tut-1";
  const [availability, setAvailability] = useState<TutorAvailability[]>(
    db.state.tutor_availability.filter((a) => a.tutor_id === tutorId)
  );

  const [blockedDates, setBlockedDates] = useState<string[]>([
    "2026-11-26", // Thanksgiving
    "2026-12-25", // Christmas
  ]);
  const [newBlockedDate, setNewBlockedDate] = useState("");

  const [newDay, setNewDay] = useState(1); // Monday
  const [newStart, setNewStart] = useState("09:00");
  const [newEnd, setNewEnd] = useState("17:00");
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  const handleAddSlot = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (newEnd <= newStart) {
      setErrorMessage("End time must be later than start time.");
      return;
    }

    // Check overlap for the same day
    const overlap = availability.some(
      (a) =>
        a.day_of_week === newDay &&
        ((newStart >= a.start_time && newStart < a.end_time) ||
          (newEnd > a.start_time && newEnd <= a.end_time))
    );

    if (overlap) {
      setErrorMessage("Ambiguity prevented: This window overlaps with an existing availability slot on this day.");
      return;
    }

    const newSlot: TutorAvailability = {
      id: `av-${Date.now()}`,
      tutor_id: tutorId,
      day_of_week: newDay,
      start_time: newStart,
      end_time: newEnd,
      is_active: true,
      created_at: new Date().toISOString(),
    };

    const updated = [...availability, newSlot];
    setAvailability(updated);
    db.state.tutor_availability.push(newSlot);
    setSavedMessage("Availability window saved. Students can book slots during these hours.");
  };

  const handleDeleteSlot = (id: string) => {
    const updated = availability.filter((a) => a.id !== id);
    setAvailability(updated);
    db.state.tutor_availability = db.state.tutor_availability.filter((a) => a.id !== id);
  };

  const handleAddBlockedDate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlockedDate || blockedDates.includes(newBlockedDate)) return;
    setBlockedDates([...blockedDates, newBlockedDate]);
    setNewBlockedDate("");
    setSavedMessage(`Blackout date ${newBlockedDate} added.`);
  };

  const handleRemoveBlockedDate = (date: string) => {
    setBlockedDates(blockedDates.filter((d) => d !== date));
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <h1 className="text-xl font-bold tracking-tight text-navy-950">
              Availability & Office Hours
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[10px] font-bold">
              Timezone: America/New_York (EST)
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Define your recurring weekly teaching windows and blackout exceptions for automated marketplace booking.
          </p>
        </div>
      </div>

      {savedMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{savedMessage}</span>
          </div>
          <button
            onClick={() => setSavedMessage(null)}
            className="underline font-semibold text-emerald-950"
          >
            Dismiss
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* KPI Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <StatCard
          title="Active Weekly Slots"
          value={availability.length}
          subtitle="Recurring time blocks"
          icon={Clock}
          variant="indigo"
        />
        <StatCard
          title="Blackout Date Exceptions"
          value={blockedDates.length}
          subtitle="Blocked calendar days"
          icon={Ban}
          variant="gold"
        />
        <StatCard
          title="Calendar Sync"
          value="Automated"
          subtitle="Real-time conflict detection"
          icon={ShieldCheck}
          variant="emerald"
        />
      </div>

      {/* Add New Slot Form */}
      <Card className="border-slate-200/80 shadow-xs bg-white">
        <CardContent className="p-5">
          <h2 className="text-sm font-bold text-navy-950 mb-3 flex items-center gap-1.5">
            <Plus className="w-4 h-4 text-primary" />
            <span>Add Recurring Weekly Teaching Slot</span>
          </h2>

          <form onSubmit={handleAddSlot} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Day of Week
              </label>
              <select
                value={newDay}
                onChange={(e) => setNewDay(Number(e.target.value))}
                className="w-full h-9 px-3 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:ring-1 focus:ring-primary outline-hidden"
              >
                {dayNames.map((d, i) => (
                  <option key={i} value={i}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Start Time
              </label>
              <Input
                type="time"
                value={newStart}
                onChange={(e) => setNewStart(e.target.value)}
                className="text-xs h-9 bg-slate-50 border-slate-200"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                End Time
              </label>
              <Input
                type="time"
                value={newEnd}
                onChange={(e) => setNewEnd(e.target.value)}
                className="text-xs h-9 bg-slate-50 border-slate-200"
                required
              />
            </div>

            <div>
              <Button
                type="submit"
                className="w-full h-9 text-xs bg-primary hover:bg-primary/90 text-white font-semibold"
              >
                Add Working Slot
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Active Slots Grid */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-xs text-navy-950 uppercase tracking-wider">
            Active Weekly Bookable Windows
          </h3>
          <span className="text-xs text-slate-400">{availability.length} active slots</span>
        </div>

        <div className="divide-y divide-slate-100">
          {availability.map((slot) => (
            <div
              key={slot.id}
              className="p-3.5 flex items-center justify-between hover:bg-slate-50 text-xs transition-colors"
            >
              <div className="flex items-center gap-4">
                <span className="font-bold text-navy-950 w-24">
                  {dayNames[slot.day_of_week]}
                </span>
                <span className="flex items-center gap-1.5 text-slate-600 font-mono">
                  <Clock className="w-3.5 h-3.5 text-primary" />
                  {slot.start_time} – {slot.end_time} EST
                </span>
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="text-red-600 hover:bg-red-50 h-7 text-xs"
                onClick={() => handleDeleteSlot(slot.id)}
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" /> Remove
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Blocked Date Exceptions */}
      <Card className="border-slate-200/80 shadow-xs bg-white">
        <CardContent className="p-5 space-y-3">
          <h3 className="font-bold text-xs text-navy-950 uppercase tracking-wider">
            Blackout Date Exceptions (Vacations / Holidays)
          </h3>
          <p className="text-xs text-slate-500">
            Students cannot schedule any classes on blackout dates regardless of weekly recurring hours.
          </p>

          <form onSubmit={handleAddBlockedDate} className="flex gap-2 max-w-sm">
            <Input
              type="date"
              value={newBlockedDate}
              onChange={(e) => setNewBlockedDate(e.target.value)}
              className="text-xs h-9 bg-slate-50 border-slate-200"
            />
            <Button
              type="submit"
              variant="outline"
              size="sm"
              className="h-9 text-xs border-slate-200 whitespace-nowrap"
            >
              Block Date
            </Button>
          </form>

          <div className="flex flex-wrap gap-2 pt-2">
            {blockedDates.map((date) => (
              <span
                key={date}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs border border-slate-200"
              >
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>{date}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveBlockedDate(date)}
                  className="text-slate-400 hover:text-red-600 ml-1"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
