"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type OnChangeFn,
  type PaginationState,
  type SortingState,
} from "@tanstack/react-table";

import { ArrowDown, ArrowUp, ChevronsUpDown } from "@/components/icons";
import {
  DataBody,
  DataCell,
  DataHead,
  DataHeader,
  DataRow,
  DataTable,
} from "@/components/ui/custom/data-table";
import { TablePager } from "@/components/ui/custom/table-pager";
import { cn } from "@/lib/utils";
import type { Invoice } from "@/lib/types";
import { invoiceColumns } from "./invoices-columns";
import { invoiceRowHref } from "@/lib/invoice/invoice-detail-href";

interface InvoicesTableProps {
  invoices: ReadonlyArray<Invoice>;
  pageIndex: number;
  pageSize: number;
  pageCount: number;
  total?: number;
  isLoading: boolean;
  onPaginationChange: OnChangeFn<PaginationState>;
}

export function InvoicesTable({
  invoices,
  pageIndex,
  pageSize,
  pageCount,
  total,
  isLoading,
  onPaginationChange,
}: InvoicesTableProps) {
  const router = useRouter();
  const [sorting, setSorting] = useState<SortingState>([]);

  // eslint-disable-next-line react-hooks/incompatible-library -- useReactTable mutates during render; component skips React Compiler memoization
  const table = useReactTable({
    data: invoices as Invoice[],
    columns: invoiceColumns,
    state: { sorting, pagination: { pageIndex, pageSize } },
    manualPagination: true,
    pageCount,
    onSortingChange: setSorting,
    onPaginationChange,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const from = pageIndex * pageSize + 1;
  const to = pageIndex * pageSize + table.getRowModel().rows.length;

  return (
    <div
      className={cn(
        "relative max-mobile:hidden transition-opacity duration-150 motion-reduce:transition-none",
        isLoading && "pointer-events-none opacity-60",
      )}
    >
      <div
        aria-hidden
        className={cn(
          "absolute inset-x-0 top-0 h-0.5 animate-pulse bg-coral motion-reduce:animate-none",
          !isLoading && "hidden",
        )}
      />
      <DataTable aria-label="Invoices" className="table-fixed" aria-busy={isLoading || undefined}>
        <DataHeader>
          {table.getHeaderGroups().map((hg) => (
            <DataRow key={hg.id} className="cursor-default hover:bg-background">
              {hg.headers.map((header, i) => {
                const canSort = header.column.getCanSort();
                const sorted = header.column.getIsSorted();
                const isLast = i === hg.headers.length - 1;

                const sortIcon = (
                  <span aria-hidden className="text-ink-3">
                    {sorted === "asc" ? (
                      <ArrowUp className="size-3" />
                    ) : sorted === "desc" ? (
                      <ArrowDown className="size-3" />
                    ) : (
                      <ChevronsUpDown className="size-3" />
                    )}
                  </span>
                );

                return (
                  <DataHead
                    key={header.id}
                    className={cn(
                      i === 0 && "w-2/6 pl-6",
                      i > 0 && !isLast && "w-1/6",
                      i === 4 && "text-right",
                      isLast && "w-15 pr-6",
                    )}
                    aria-hidden={isLast || undefined}
                    aria-sort={
                      sorted === "asc"
                        ? "ascending"
                        : sorted === "desc"
                          ? "descending"
                          : canSort
                            ? "none"
                            : undefined
                    }
                  >
                    {!isLast &&
                      (canSort ? (
                        // Keyboard-operable sort control (WCAG 2.1.1): a real
                        // <button> in the header, not an onClick on the <th>.
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          className="inline-flex select-none items-center gap-1 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-press focus-visible:ring-offset-1"
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {sortIcon}
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1">
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </span>
                      ))}
                  </DataHead>
                );
              })}
            </DataRow>
          ))}
        </DataHeader>
        <DataBody>
          {table.getRowModel().rows.map((row) => {
            const detailHref = invoiceRowHref(row.original);
            return (
              <DataRow
                key={row.id}
                onClick={(e) => {
                  if (
                    (e.target as HTMLElement).closest(
                      'a, button, input, textarea, select, [role="menu"], [role="menuitem"], [data-slot="dropdown-menu-trigger"]',
                    )
                  )
                    return;
                  if (window.getSelection()?.toString()) return;
                  router.push(detailHref);
                }}
              >
                {row.getVisibleCells().map((cell, i) => {
                  const isLast = i === row.getVisibleCells().length - 1;
                  return (
                    <DataCell
                      key={cell.id}
                      className={cn(
                        i === 0 && "pl-6",
                        i === 4 && "text-right",
                        isLast && "pr-6 text-center",
                      )}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </DataCell>
                  );
                })}
              </DataRow>
            );
          })}
        </DataBody>
      </DataTable>

      {pageCount > 1 && (
        <TablePager
          from={from}
          to={to}
          total={total}
          canPreviousPage={table.getCanPreviousPage()}
          canNextPage={table.getCanNextPage()}
          isLoading={isLoading}
          onPrevious={() => table.previousPage()}
          onNext={() => table.nextPage()}
        />
      )}
    </div>
  );
}
