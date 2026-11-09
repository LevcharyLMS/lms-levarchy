import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Compass, Home, Users, HelpCircle, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center px-4 py-16 text-center bg-gradient-to-b from-slate-50/50 to-white">
      {/* Visual Badge */}
      <div className="relative mb-6">
        <div className="w-20 h-20 bg-teal-50 text-teal-700 rounded-3xl flex items-center justify-center font-extrabold text-3xl shadow-sm border border-teal-100 ring-8 ring-teal-50/50">
          404
        </div>
      </div>

      <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-navy-950 mb-3">
        Page Not Found
      </h1>
      <p className="max-w-md text-sm sm:text-base text-slate-500 mb-8 leading-relaxed">
        The page you are looking for doesn&apos;t exist, was renamed, or has been moved. Explore our verified instructors or head back to the platform homepage.
      </p>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button asChild className="bg-teal-600 hover:bg-teal-700 text-white font-semibold shadow-sm h-10 px-5 gap-2">
          <Link href="/">
            <Home className="w-4 h-4" />
            <span>Return Home</span>
          </Link>
        </Button>
        <Button asChild variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50 h-10 px-5 gap-2">
          <Link href="/find-instructors">
            <Users className="w-4 h-4 text-teal-600" />
            <span>Browse Instructors</span>
          </Link>
        </Button>
        <Button asChild variant="ghost" className="text-slate-600 hover:text-slate-900 h-10 px-4 gap-2">
          <Link href="/contact">
            <HelpCircle className="w-4 h-4" />
            <span>Contact Support</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}
