export default function DashboardLoading() {
  return (
    <div className="animate-pulse space-y-6 max-w-4xl">
      <div className="h-8 w-48 bg-white/5 rounded-xl" />
      <div className="h-4 w-32 bg-white/5 rounded-lg" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-40 bg-white/5 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
