function SkeletonBuilderCard() {
  return (
    <div className="animate-pulse rounded-xl bg-white p-4">
      <div className="flex items-center gap-3">
        <div className="size-16 shrink-0 rounded-full bg-stone-200" />
        <div className="flex-1">
          <div className="h-4 w-2/3 rounded bg-stone-200" />
          <div className="mt-2 h-3 w-1/3 rounded bg-stone-100" />
        </div>
      </div>
      <div className="mt-4 h-3 w-full rounded bg-stone-100" />
      <div className="mt-2 h-3 w-4/5 rounded bg-stone-100" />
      <div className="mt-4 h-8 rounded-lg bg-stone-100" />
    </div>
  );
}

export default SkeletonBuilderCard;
