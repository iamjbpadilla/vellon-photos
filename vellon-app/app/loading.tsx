export default function RootLoading() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] animate-pulse">
      <div className="border-b border-[#E5E7EB] h-16 flex items-center px-5 sm:px-8 justify-between max-w-5xl mx-auto">
        <div className="h-6 w-36 bg-[#E5E7EB] rounded-lg" />
        <div className="h-9 w-28 bg-[#E5E7EB] rounded-full" />
      </div>
      <div className="max-w-3xl mx-auto px-5 pt-24 text-center space-y-6">
        <div className="h-4 w-48 bg-[#E5E7EB] rounded-full mx-auto" />
        <div className="space-y-3">
          <div className="h-14 w-3/4 bg-[#E5E7EB] rounded-xl mx-auto" />
          <div className="h-14 w-1/2 bg-[#E5E7EB] rounded-xl mx-auto" />
        </div>
        <div className="h-px w-16 bg-[#D1C9B8] mx-auto" />
        <div className="space-y-2">
          <div className="h-4 w-2/3 bg-[#E5E7EB] rounded mx-auto" />
          <div className="h-4 w-1/2 bg-[#E5E7EB] rounded mx-auto" />
        </div>
        <div className="flex gap-3 justify-center">
          <div className="h-11 w-40 bg-[#E5E7EB] rounded-full" />
          <div className="h-11 w-40 bg-[#E5E7EB] rounded-full" />
        </div>
      </div>
    </div>
  );
}
