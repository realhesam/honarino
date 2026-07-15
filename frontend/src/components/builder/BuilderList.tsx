import type { BuilderType } from "@/types/builder";
import Builder from "./Builder";

function BuilderList({
  builders,
}: Readonly<{ builders: Array<BuilderType> }>) {
  if (builders.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-stone-400">
        تولیدی‌ای برای نمایش پیدا نشد.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {builders.map((builder) => (
        <Builder key={builder.id} builder={builder} />
      ))}
    </div>
  );
}

export default BuilderList;
