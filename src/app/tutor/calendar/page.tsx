"use client";

import React from "react";
import Link from "next/link";
import { db } from "@/lib/data-store";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Clock, Video, MapPin, ExternalLink } from "lucide-react";

export default function TutorCalendarPage() {
  const tutorId = "usr-tut-1";
  const bookings = db.getBookings({ tutorId }).filter((b) => b.status === "CONFIRMED");

  const days = [
    { name: "Mon", date: "Sep 21" },
    { name: "Tue", date: "Sep 22" },
    { name: "Wed", date: "Sep 23" },
    { name: "Thu", date: "Sep 24" },
    { name: "Fri", date: "Sep 25" },
    { name: "Sat", date: "Sep 26" },
    { name: "Sun", date: "Sep 27" },
  ];

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-navy-950">
            Teaching Calendar
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Times displayed in America/New_York (EST).
          </p>
        </div>

        <Button asChild variant="default" size="sm">
          <Link href="/tutor/classes">Manage Classes</Link>
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((d, i) => (
          <div
            key={i}
            className={`p-3 rounded-xl text-center border transition-all ${
              i === 0 || i === 1 // Sunday / Monday
                ? "bg-teal-50/80 border-teal-300 shadow-xs"
                : "bg-white border-slate-200"
            }`}
          >
            <span className="text-[10px] font-bold uppercase text-slate-400 block">{d.name}</span>
            <span className="text-sm font-bold text-navy-950 block mt-0.5">{d.date}</span>
            {(i === 0 || i === 1) && (
              <span className="inline-block w-1.5 h-1.5 bg-teal-600 rounded-full mt-1.5" />
            )}
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <h2 className="text-sm font-bold text-navy-950 uppercase tracking-wider">
          Scheduled Teaching Sessions
        </h2>

        {bookings.map((bk) => (
          <Card key={bk.id} className="border-slate-200 shadow-xs">
            <CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <StatusBadge status={bk.format} />
                  <span className="text-xs text-slate-400 font-mono">#{bk.booking_number}</span>
                </div>
                <h3 className="text-base font-bold text-navy-950">
                  {bk.class_item?.title}
                </h3>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1 font-medium text-slate-800">
                    <Clock className="w-3.5 h-3.5 text-teal-600" />
                    {new Date(bk.start_time).toLocaleDateString()} at {new Date(bk.start_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                  <span>Student: {bk.student?.first_name} {bk.student?.last_name}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {bk.format === "VIRTUAL" && bk.meet_url && (
                  <Button asChild size="sm" variant="default" className="gap-1.5 shadow-xs">
                    <a href={bk.meet_url} target="_blank" rel="noopener noreferrer">
                      <Video className="w-3.5 h-3.5" /> Start Meet <ExternalLink className="w-3 h-3" />
                    </a>
                  </Button>
                )}
                {bk.format === "PHYSICAL" && (
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/classes/${bk.class_id}`}>
                      <MapPin className="w-3.5 h-3.5 mr-1" /> Center Directions
                    </Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
