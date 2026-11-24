export default function AdminLoading() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Skeleton */}
      <div className="h-20 w-full bg-white border border-slate-200/80 rounded-xl p-5 flex items-center justify-between animate-pulse">
        <div className="space-y-2">
          <div className="h-5 w-56 bg-slate-200 rounded-md" />
          <div className="h-3 w-80 bg-slate-100 rounded-md" />
        </div>
        <div className="h-8 w-28 bg-slate-200 rounded-lg" />
      </div>

      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-24 bg-white border border-slate-200/80 rounded-xl p-4 flex flex-col justify-between animate-pulse"
          >
            <div className="h-3 w-24 bg-slate-200 rounded" />
            <div className="h-6 w-16 bg-slate-200 rounded" />
          </div>
        ))}
      </div>

      {/* Main Table / Data Skeleton */}
      <div className="h-96 bg-white border border-slate-200/80 rounded-xl p-6 space-y-4 animate-pulse">
        <div className="flex justify-between items-center pb-4 border-b border-slate-100">
          <div className="h-4 w-40 bg-slate-200 rounded" />
          <div className="h-8 w-60 bg-slate-100 rounded-lg" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((row) => (
            <div key={row} className="h-10 bg-slate-50 border border-slate-100 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
