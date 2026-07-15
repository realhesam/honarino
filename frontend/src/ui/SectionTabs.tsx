"use client";

import { useState } from "react";

interface Tab {
  name: string;
  label: string;
  icon?: React.ReactNode;
}

interface SectionTabsProps {
  tabs: Tab[];
  defaultTab?: string;
  onChange?: (name: string) => void;
  theme?: "primary" | "emerald";
}

// NOTE: Tailwind classes are written out fully (not interpolated) so the
// JIT compiler can find them at build time.
const THEME = {
  primary: {
    active:
      "bg-primary text-white border-primary shadow-lg shadow-primary/25",
  },
  emerald: {
    active:
      "bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-600/25",
  },
};

function SectionTabs({
  tabs,
  defaultTab,
  onChange,
  theme = "primary",
}: Readonly<SectionTabsProps>) {
  const [active, setActive] = useState(defaultTab ?? tabs[0]?.name);

  function handleClick(name: string) {
    setActive(name);
    onChange?.(name);
  }

  return (
    <div
      role="tablist"
      className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1"
    >
      {tabs.map((tab) => {
        const isActive = tab.name === active;
        return (
          <button
            key={tab.name}
            role="tab"
            aria-selected={isActive}
            onClick={() => handleClick(tab.name)}
            className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
              isActive
                ? THEME[theme].active
                : "border-stone-200 bg-white text-stone-500 hover:border-stone-300 hover:text-stone-700"
            }`}
          >
            {tab.icon && <span className="*:size-4">{tab.icon}</span>}
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export default SectionTabs;
