type PropsType = {
  children: React.ReactElement;
  title: string;
  text?: string | React.ReactElement;
  render?: [any[], () => React.ReactElement];
  subTitle?: boolean;
};

export default function SectionCenter({
  children,
  title,
  text,
  render,
  subTitle = true,
}: Readonly<PropsType>) {
  const color = subTitle ? "bg-primary" : "bg-stone-200";

  return (
    <section className="mb-10">
      <div className="flex flex-col items-center justify-center mb-5">
        {subTitle && (
          <span className="text-sm px-2 py-1 rounded-lg bg-primary/10 text-primary">
            {text}
          </span>
        )}
        <div className="relative w-full">
          <div
            className={`absolute inset-0 m-auto w-full h-0.5 -z-10 ${color}`}
          >
            <div
              className={`absolute size-2 inset-y-0 my-auto rounded-full left-0 ${color}`}
            ></div>
            <div
              className={`absolute size-2 inset-y-0 my-auto bg-primary rounded-full right-0 ${color}`}
            ></div>
          </div>
          <div
            className={`flex items-center justify-center font-medium ${subTitle ? "text-2xl xs:text-3xl" : "text-xl"}`}
          >
            <h2
              className={`px-3 py-1 bg-stone-100 text-center ${subTitle ? "text-stone-700" : "text-stone-500"}`}
            >
              {title}
            </h2>
          </div>
        </div>
      </div>
      {children}
      {render && render[0].map(render[1])}
    </section>
  );
}
