import { redirect } from "next/navigation";

export default function VerificationRedirect() {
  redirect("/instructor/settings?tab=verification");
}
