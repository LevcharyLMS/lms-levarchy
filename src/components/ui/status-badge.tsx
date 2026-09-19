import * as React from "react";
import { Badge } from "./badge";
import { CheckCircle2, Clock, AlertTriangle, XCircle, Video, MapPin, Users, User } from "lucide-react";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  switch (status.toUpperCase()) {
    case "CONFIRMED":
    case "APPROVED":
    case "ACTIVE":
    case "COMPLETED":
    case "SUCCEEDED":
    case "RESOLVED":
      return (
        <Badge variant="success" className={className}>
          <CheckCircle2 className="w-3 h-3 mr-1" />
          {status.replace(/_/g, " ")}
        </Badge>
      );

    case "PENDING":
    case "PENDING_PAYMENT":
    case "PAYMENT_PROCESSING":
    case "PENDING_REVIEW":
    case "OPEN":
    case "IN_PROGRESS":
      return (
        <Badge variant="warning" className={className}>
          <Clock className="w-3 h-3 mr-1" />
          {status.replace(/_/g, " ")}
        </Badge>
      );

    case "CANCELLED":
    case "REFUNDED":
    case "REJECTED":
    case "SUSPENDED":
    case "FAILED":
      return (
        <Badge variant="destructive" className={className}>
          <XCircle className="w-3 h-3 mr-1" />
          {status.replace(/_/g, " ")}
        </Badge>
      );

    case "RESUBMISSION_REQUIRED":
    case "REFUND_PENDING":
    case "WAITING_FOR_USER":
      return (
        <Badge variant="gold" className={className}>
          <AlertTriangle className="w-3 h-3 mr-1" />
          {status.replace(/_/g, " ")}
        </Badge>
      );

    case "VIRTUAL":
      return (
        <Badge variant="navy" className={className}>
          <Video className="w-3 h-3 mr-1" />
          Virtual Meet
        </Badge>
      );

    case "PHYSICAL":
      return (
        <Badge variant="secondary" className={className}>
          <MapPin className="w-3 h-3 mr-1 text-teal-600" />
          In-Person
        </Badge>
      );

    case "ONE_ON_ONE":
      return (
        <Badge variant="outline" className={className}>
          <User className="w-3 h-3 mr-1 text-slate-600" />
          1-on-1
        </Badge>
      );

    case "GROUP":
      return (
        <Badge variant="outline" className={className}>
          <Users className="w-3 h-3 mr-1 text-teal-600" />
          Group Cohort
        </Badge>
      );

    default:
      return (
        <Badge variant="secondary" className={className}>
          {status.replace(/_/g, " ")}
        </Badge>
      );
  }
}
