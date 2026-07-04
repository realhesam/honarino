"use client";

import { ReactNode } from "react";
import { HiInboxStack } from "react-icons/hi2";
import Pagination from "./Pagination";

export interface DataListColumn<T> {
  key: string;
  header: string;
  render: (item: T) => ReactNode;
  headerClassName?: string;
  cellClassName?: string;
}

interface DataListProps<T> {
  data: T[];
  keyExtractor: (item: T) => string;
  columns: DataListColumn<T>[];
  renderMobileCard: (item: T) => ReactNode;
  isLoading?: boolean;
  error?: string | null;
  emptyIcon?: ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  loadingLabel?: string;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  itemLabel: string;
}

export default function DataList<T>({
  data,
  keyExtractor,
  columns,
  renderMobileCard,
  isLoading = false,
  error = null,
  emptyIcon,
  emptyTitle = "موردی یافت نشد",
  emptyDescription = "در حال حاضر داده‌ای برای نمایش وجود ندارد.",
  loadingLabel = "در حال بارگذاری اطلاعات...",
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  itemLabel,
}: DataListProps<T>) {
  
  const showPagination = !isLoading && !error && data.length > 0;

  return (
    <div className="w-full h-full flex flex-col min-h-0 antialiased selection:bg-emerald-50 selection:text-emerald-700">
      
      {error && (
        <div className="mb-4 p-4 bg-rose-50/70 text-rose-800 text-xs font-semibold rounded-2xl border border-rose-100 shadow-sm flex items-center gap-2.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
          </span>
          {error}
        </div>
      )}

      <div className="flex-1 w-full bg-white border border-stone-200/70 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.012)] overflow-hidden flex flex-col justify-between min-h-0">
        
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-24 space-y-4">
            <div className="relative size-12 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-stone-100"></div>
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-emerald-600 animate-spin"></div>
            </div>
            <p className="text-xs font-medium text-stone-400/90 tracking-wide animate-pulse">{loadingLabel}</p>
          </div>
        ) : data.length === 0 ? (
          
         
          <div className="flex-1 flex flex-col items-center justify-center p-24 text-center max-w-md mx-auto">
            <div className="size-16 rounded-2xl bg-stone-50 border border-stone-100/80 flex items-center justify-center text-stone-400 shadow-xs mb-5 transition-all duration-300 hover:scale-105">
              {emptyIcon ?? <HiInboxStack className="size-7 text-stone-400/70" />}
            </div>
            <h3 className="text-sm font-bold text-stone-700 mb-2">{emptyTitle}</h3>
            <p className="text-xs font-medium text-stone-400 leading-relaxed">
              {emptyDescription}
            </p>
          </div>
        ) : (
          
         
          <div className="flex-1 flex flex-col min-h-0 w-full overflow-hidden">
            
            <div className="block lg:hidden flex-1 overflow-y-auto divide-y divide-stone-100/70">
              {data.map((item) => (
                <div 
                  key={keyExtractor(item)} 
                  className="p-2 transition-all duration-250 hover:bg-stone-50/40"
                >
                  {renderMobileCard(item)}
                </div>
              ))}
            </div>

            <div className="hidden lg:block flex-1 overflow-y-auto min-h-0">
              <table className="w-full text-right border-collapse table-auto">
                <thead>
                  <tr className="bg-stone-50/75 backdrop-blur-md sticky top-0 z-10 text-stone-500 text-[11px] font-bold uppercase tracking-wider border-b border-stone-200/60">
                    {columns.map((col, idx) => (
                      <th
                        key={col.key}
                        className={`p-5 font-bold text-stone-500/80 ${idx === 0 ? "pr-8" : ""} ${
                          idx === columns.length - 1 ? "pl-8" : ""
                        } ${col.headerClassName ?? ""}`}
                      >
                        {col.header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100/80 text-xs font-medium text-stone-600/90">
                  {data.map((item) => (
                    <tr
                      key={keyExtractor(item)}
                      className="hover:bg-stone-50/40 group transition-all duration-200 ease-out"
                    >
                      {columns.map((col, idx) => (
                        <td
                          key={col.key}
                          className={`p-5 transition-colors duration-200 ${idx === 0 ? "pr-8" : ""} ${
                            idx === columns.length - 1 ? "pl-8" : ""
                          } ${col.cellClassName ?? ""}`}
                        >
                          <div className="group-hover:text-stone-900 group-hover:translate-x-[-2px] transform transition-all duration-200">
                            {col.render(item)}
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {showPagination && (
          <div className="border-t border-stone-100 bg-stone-50/40 p-4 backdrop-blur-xs rounded-b-2xl mt-auto">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={onPageChange}
              itemLabel={itemLabel}
            />
          </div>
        )}
      </div>
    </div>
  );
}