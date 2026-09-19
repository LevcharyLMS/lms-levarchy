import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-16 text-center">
      <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-bold text-2xl mb-6 shadow-sm border border-indigo-100">
        404
      </div>
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl mb-3">
        Page Not Found
      </h1>
      <p className="max-w-md text-base text-slate-600 mb-8 leading-relaxed">
        The page you are looking for doesn&apos;t exist or has been moved. Explore our verified tutors or head back to the homepage.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link href="/">
          <Button variant="default" className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm">
            Return Home
          </Button>
        </Link>
        <Link href="/find-tutors">
          <Button variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50">
            Browse Tutors
          </Button>
        </Link>
        <Link href="/contact">
          <Button variant="ghost" className="text-slate-600 hover:text-slate-900">
            Contact Support
          </Button>
        </Link>
      </div>
    </div>
  );
}
