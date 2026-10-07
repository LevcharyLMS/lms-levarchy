"use client";

import React, { useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Users, ShieldCheck, CheckCircle2, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { JitsiClassroom } from "@/components/classroom/jitsi-classroom";
import { useAuth } from "@/context/auth-context";

export default function ClassroomPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const [sessionEnded, setSessionEnded] = useState(false);

  const rawRoomId = (params?.id as string) || "Levchary-Class-Session";
  const roomName = decodeURIComponent(rawRoomId);
  const classTitle = searchParams.get("title") || roomName.replace(/^Levchary-/, "").replace(/-/g, " ");

  const displayName = user
    ? `${user.first_name} ${user.last_name}`
    : "Levchary Student";
  const email = user?.email;

  const returnPath = user?.role === "TUTOR"
    ? "/tutor/dashboard"
    : user?.role === "ADMIN"
    ? "/admin/dashboard"
    : "/student/bookings";

  if (sessionEnded) {
    return (
      <div className="min-h-screen bg-navy-950 text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-6">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white mb-2">
          Class Session Concluded
        </h1>
        <p className="text-sm text-slate-400 max-w-md mb-8 leading-relaxed">
          Thank you for attending this tutorial session on Levchary LMS. Your attendance record has been preserved.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Button
            asChild
            className="bg-teal-500 hover:bg-teal-600 text-navy-950 font-bold gap-2"
          >
            <Link href={returnPath}>
              <Home className="w-4 h-4" />
              Return to Dashboard
            </Link>
          </Button>
          {user?.role === "STUDENT" && (
            <Button
              asChild
              variant="outline"
              className="border-slate-700 text-slate-200 hover:bg-slate-800"
            >
              <Link href="/student/reviews">Leave a Review</Link>
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100 overflow-hidden">
      {/* Classroom Top Bar */}
      <header className="h-14 bg-navy-950 border-b border-navy-900 px-4 sm:px-6 flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(returnPath)}
            className="text-slate-400 hover:text-white hover:bg-navy-900 gap-1.5 h-8 px-2 text-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </Button>

          <div className="h-5 w-px bg-navy-800 hidden sm:block" />

          <Logo variant="dark" imageClassName="h-7" showBadge badgeText="Classroom" />
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-navy-900/80 rounded-full border border-navy-800 text-xs text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-white truncate max-w-xs">{classTitle}</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-teal-400 bg-teal-950/60 border border-teal-800/60 px-2.5 py-1 rounded-md">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Encrypted</span>
          </div>

          <Button
            variant="destructive"
            size="sm"
            onClick={() => setSessionEnded(true)}
            className="h-8 text-xs font-semibold px-3 bg-red-600/90 hover:bg-red-600"
          >
            Leave Class
          </Button>
        </div>
      </header>

      {/* Embedded Video Area */}
      <main className="flex-1 p-2 sm:p-4 bg-slate-950 flex flex-col min-h-0">
        <JitsiClassroom
          roomName={roomName}
          displayName={displayName}
          email={email}
          subject={classTitle}
          onLeave={() => setSessionEnded(true)}
          className="flex-1 min-h-0"
        />
      </main>
    </div>
  );
}
