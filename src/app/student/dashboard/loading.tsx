export default function Loading() {
  return (
    <div className="space-y-6 max-w-7xl">
      <div className="h-28 w-full bg-slate-200/70 rounded-2xl animate-pulse" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-white border border-slate-200/80 rounded-xl p-4 animate-pulse" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-80 bg-white border border-slate-200/80 rounded-xl animate-pulse" />
        <div className="h-80 bg-white border border-slate-200/80 rounded-xl animate-pulse" />
      </div>
    </div>
  );
}
