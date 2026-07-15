import SkeletonBuilderCard from "./SkeletonBuilderCard";

function SkeletonBuilderGrid({
  count = 4,
}: Readonly<{ count?: number }>) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <SkeletonBuilderCard key={i} />
      ))}
    </div>
  );
}

export default SkeletonBuilderGrid;
