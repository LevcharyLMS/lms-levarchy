import { redirect } from "next/navigation";

export default function ProfileRedirect() {
  redirect("/instructor/settings?tab=profile");
}
