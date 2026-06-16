export default function GalleryLoading() {
  return (
    <div className="min-h-screen bg-navy flex items-center justify-center">
      <div className="text-center space-y-4 animate-pulse">
        <div className="w-16 h-16 rounded-2xl bg-white/5 mx-auto" />
        <div className="h-5 w-40 bg-white/5 rounded-lg mx-auto" />
        <div className="h-3 w-24 bg-white/5 rounded mx-auto" />
      </div>
    </div>
  );
}
