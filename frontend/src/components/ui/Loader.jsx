export default function Loader({ fullScreen = false }) {
  const spinner = (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className="w-12 h-12 border-4 border-brand-light border-t-brand rounded-full animate-spin" />
      <p className="text-xs font-semibold text-gray-500 animate-pulse">Loading delicious food...</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
        {spinner}
      </div>
    );
  }

  return (
    <div className="w-full flex items-center justify-center p-8">
      {spinner}
    </div>
  );
}

export function SkeletonReel() {
  return (
    <div className="w-full h-screen bg-gray-900 flex-shrink-0 animate-pulse relative flex flex-col justify-end p-6">
      <div className="h-6 bg-gray-800 rounded w-1/3 mb-2" />
      <div className="h-4 bg-gray-800 rounded w-2/3 mb-4" />
      <div className="h-12 bg-gray-800 rounded-xl w-full" />
    </div>
  );
}
