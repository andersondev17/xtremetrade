import React, { useState, useMemo } from "react";
import { ChevronUp, ChevronDown, MoveHorizontal, CornerDownRight, Info } from "lucide-react";

export interface ColumnDefinition<T> {
  key: string;
  header: string;
  sortable?: boolean;
  className?: string;
  headerClassName?: string;
  render?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDefinition<T>[];
  rowKey: (item: T) => string;
  initialSortKey?: string;
  initialSortDirection?: "asc" | "desc";
  emptyState?: React.ReactNode;
  pageSize?: number;
  hoverActive?: boolean;
}

/**
 * REUSABLE COLUMN STRATEGY DATATABLE
 * Abstraction layer for rendering flexible, customizable tables without duplicating structure.
 * Standardizes styling, sorting, pagination, and accessibility wrappers.
 */
export default function DataTable<T>({
  data,
  columns,
  rowKey,
  initialSortKey,
  initialSortDirection = "desc",
  emptyState,
  pageSize = 10,
  hoverActive = true,
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState<string | undefined>(initialSortKey);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">(initialSortDirection);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection("desc");
    }
    setCurrentPage(1);
  };

  // Sort and Paginate data
  const sortedAndPaginatedData = useMemo(() => {
    let result = [...data];

    // 1. Sort
    if (sortKey) {
      result.sort((a: any, b: any) => {
        const valA = a[sortKey];
        const valB = b[sortKey];

        if (valA === undefined || valB === undefined) return 0;

        const isNum = typeof valA === "number" && typeof valB === "number";
        if (isNum) {
          return sortDirection === "asc" ? valA - valB : valB - valA;
        }

        const strA = String(valA).toLowerCase();
        const strB = String(valB).toLowerCase();
        if (strA < strB) return sortDirection === "asc" ? -1 : 1;
        if (strA > strB) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    }

    // 2. Paginate
    const startIndex = (currentPage - 1) * pageSize;
    const paginated = result.slice(startIndex, startIndex + pageSize);

    return {
      paginated,
      totalCount: result.length,
      totalPages: Math.ceil(result.length / pageSize) || 1,
    };
  }, [data, sortKey, sortDirection, currentPage, pageSize]);

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-2xl border border-gray-200/60 bg-white shadow-sm select-none">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-gray-150 bg-gray-50/50 text-[10px] font-mono uppercase tracking-widest text-text-secondary font-bold">
              {columns.map((col) => {
                const isSortedCol = sortKey === col.key;
                return (
                  <th
                    key={col.key}
                    onClick={() => col.sortable && handleSort(col.key)}
                    className={`py-4 px-5 select-none ${col.sortable ? "cursor-pointer hover:bg-gray-150/40 transition-colors" : ""} ${col.headerClassName || ""}`}
                    role={col.sortable ? "button" : undefined}
                    tabIndex={col.sortable ? 0 : undefined}
                    onKeyDown={(e) => {
                      if (col.sortable && (e.key === "Enter" || e.key === " ")) {
                        handleSort(col.key);
                      }
                    }}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{col.header}</span>
                      {col.sortable && (
                        <span className="text-gray-400">
                          {isSortedCol ? (
                            sortDirection === "asc" ? (
                              <ChevronUp className="w-3.5 h-3.5 text-black" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5 text-black" />
                            )
                          ) : (
                            <MoveHorizontal className="w-3 h-3 opacity-30" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sortedAndPaginatedData.totalCount === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-12">
                  {emptyState || (
                    <div className="text-center py-8 text-xs text-text-tertiary font-mono flex flex-col items-center justify-center gap-2">
                      <CornerDownRight className="w-8 h-8 text-gray-300 animate-pulse" />
                      <span>No elements synchronized to the matrix.</span>
                    </div>
                  )}
                </td>
              </tr>
            ) : (
              sortedAndPaginatedData.paginated.map((item) => (
                <tr
                  key={rowKey(item)}
                  className={`transition-all ${hoverActive ? "hover:bg-gray-50/40" : ""}`}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`py-4 px-5 text-xs ${col.className || ""}`}
                    >
                      {col.render ? col.render(item) : (item as any)[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination component with Apple micro-design styling */}
      {sortedAndPaginatedData.totalPages > 1 && (
        <div className="flex items-center justify-between px-2 pt-2 text-xs font-mono">
          <div className="text-text-secondary text-[11px]">
            Showing <span className="font-bold text-text-primary">{(currentPage - 1) * pageSize + 1}</span> -{" "}
            <span className="font-bold text-text-primary">
              {Math.min(currentPage * pageSize, sortedAndPaginatedData.totalCount)}
            </span>{" "}
            of <span className="font-bold text-text-primary">{sortedAndPaginatedData.totalCount}</span> metrics
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3.5 py-1.5 border border-gray-250 bg-white text-text-primary hover:bg-gray-55 rounded-lg font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-all select-none cursor-pointer"
            >
              Previous
            </button>
            <div className="text-text-secondary">
              Page <span className="text-text-primary font-bold">{currentPage}</span> of{" "}
              <span className="text-text-primary font-bold">{sortedAndPaginatedData.totalPages}</span>
            </div>
            <button
              onClick={() => setCurrentPage((p) => Math.min(sortedAndPaginatedData.totalPages, p + 1))}
              disabled={currentPage === sortedAndPaginatedData.totalPages}
              className="px-3.5 py-1.5 border border-gray-250 bg-white text-text-primary hover:bg-gray-55 rounded-lg font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-all select-none cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
