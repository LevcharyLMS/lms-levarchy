export default function Loading() {
  return (
    <div className="space-y-6 max-w-6xl">
      <div className="space-y-2">
        <div className="h-7 w-56 bg-slate-200/80 rounded-md animate-pulse" />
        <div className="h-4 w-72 bg-slate-100 rounded-md animate-pulse" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="p-6 rounded-2xl border border-slate-200/80 bg-white shadow-xs space-y-4 animate-pulse"
          >
            <div className="flex justify-between items-center">
              <div className="h-5 w-20 bg-slate-200 rounded-full" />
              <div className="h-5 w-16 bg-slate-200 rounded-md" />
            </div>
            <div className="h-6 w-3/4 bg-slate-200 rounded-md" />
            <div className="h-4 w-full bg-slate-100 rounded-md" />
            <div className="h-10 w-full bg-slate-100 rounded-lg" />
            <div className="h-9 w-full bg-slate-200 rounded-lg mt-4" />
          </div>
        ))}
      </div>
    </div>
  );
}
