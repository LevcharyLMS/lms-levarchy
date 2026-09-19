import React from "react";
import Link from "next/link";
import { ClassItem } from "@/types";
import { Card, CardContent } from "./card";
import { Avatar, AvatarImage, AvatarFallback } from "./avatar";
import { StatusBadge } from "./status-badge";
import { MoneyDisplay } from "./money-display";
import { Button } from "./button";
import { Clock, MapPin, Video, Users, ArrowRight } from "lucide-react";

interface ClassCardProps {
  classItem: ClassItem;
}

export function ClassCard({ classItem }: ClassCardProps) {
  const tutor = classItem.tutor;
  const isGroup = classItem.class_type === "GROUP";
  const seatsRemaining = classItem.capacity - classItem.enrolled_count;
  const isFull = isGroup && seatsRemaining <= 0;

  return (
    <Card className="hover:border-teal-500/50 hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <StatusBadge status={classItem.class_type} />
            <StatusBadge status={classItem.format} />
          </div>
          <MoneyDisplay cents={classItem.price} />
        </div>

        <h3 className="font-semibold text-base text-navy-950 line-clamp-2 leading-snug mb-2">
          {classItem.title}
        </h3>

        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
          {classItem.description}
        </p>

        {tutor && (
          <div className="flex items-center gap-2.5 py-2.5 px-3 bg-slate-50 rounded-lg mb-4">
            <Avatar className="w-8 h-8">
              <AvatarImage src={tutor.avatar_url || ""} />
              <AvatarFallback>{tutor.first_name[0]}{tutor.last_name[0]}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-xs font-medium text-navy-950 truncate">
                {tutor.first_name} {tutor.last_name}
              </p>
              <p className="text-[10px] text-slate-500 truncate">
                {classItem.subject?.name || "Academic Specialist"}
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{classItem.duration_minutes} mins</span>
          </div>

          {classItem.format === "VIRTUAL" ? (
            <div className="flex items-center gap-1.5 text-teal-700">
              <Video className="w-3.5 h-3.5 text-teal-600" />
              <span>Dedicated Meet</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 truncate text-slate-600">
              <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
              <span className="truncate">{classItem.location?.city || "Physical Center"}</span>
            </div>
          )}

          {isGroup && (
            <div className="col-span-2 flex items-center justify-between text-xs mt-1">
              <div className="flex items-center gap-1 text-slate-600">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                <span>Cohort Size: {classItem.capacity} max</span>
              </div>
              <span className={`font-semibold ${isFull ? "text-red-600" : "text-amber-600"}`}>
                {isFull ? "Class Full" : `${seatsRemaining} seats left`}
              </span>
            </div>
          )}
        </div>
      </CardContent>

      <div className="p-4 pt-0 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
        <span className="text-xs text-slate-500">
          {classItem.category?.name || "Education"}
        </span>
        <Button asChild size="sm" variant={isFull ? "secondary" : "default"} disabled={isFull} className="gap-1">
          <Link href={`/classes/${classItem.id}`}>
            {isFull ? "Full" : "View & Book"} <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </Button>
      </div>
    </Card>
  );
}
