import SkeletonProductCard from "./SkeletonProductCard";

function SkeletonProductGrid({
  count = 5,
  cols = "grid-cols-1 min-[400px]:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5",
}: Readonly<{ count?: number; cols?: string }>) {
  return (
    <div className={`grid gap-5 ${cols}`}>
      {Array.from({ length: count }).map((_, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <SkeletonProductCard key={i} />
      ))}
    </div>
  );
}

export default SkeletonProductGrid;
