function SkeletonProductCard() {
  return (
    <div className="animate-pulse rounded-xl bg-white p-3">
      <div className="aspect-square w-full rounded-xl bg-stone-200" />
      <div className="mt-3 h-4 w-4/5 rounded bg-stone-200" />
      <div className="mt-2 h-3 w-full rounded bg-stone-100" />
      <div className="mt-3 h-8 rounded bg-stone-100" />
      <div className="mt-3 flex items-end justify-between">
        <div className="h-4 w-10 rounded bg-stone-200" />
        <div className="flex flex-col items-end gap-1.5">
          <div className="h-3 w-16 rounded bg-stone-100" />
          <div className="h-4 w-20 rounded bg-stone-200" />
        </div>
      </div>
    </div>
  );
}

export default SkeletonProductCard;
