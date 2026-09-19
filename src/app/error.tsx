"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("App error:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-16 text-center">
      <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center font-bold text-2xl mb-6 shadow-sm border border-red-100">
        !
      </div>
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl mb-3">
        Something went wrong
      </h1>
      <p className="max-w-md text-base text-slate-600 mb-8 leading-relaxed">
        An unexpected error occurred while processing your request. Please try again or return to the dashboard.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button
          onClick={() => reset()}
          variant="default"
          className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
        >
          Try Again
        </Button>
        <Button
          onClick={() => (window.location.href = "/")}
          variant="outline"
          className="border-slate-300 text-slate-700 hover:bg-slate-50"
        >
          Go Home
        </Button>
      </div>
    </div>
  );
}
