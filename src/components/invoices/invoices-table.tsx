"use client";

import { useEffect, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type PaginationState,
  type SortingState,
} from "@tanstack/react-table";

import {
  ArrowDown,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
} from "@/components/icons";
import {
  DataBody,
  DataCell,
  DataHead,
  DataHeader,
  DataRow,
  DataTable,
} from "@/components/ui/custom/data-table";
import { cn } from "@/lib/utils";
import type { Invoice } from "@/lib/types";
import { invoiceColumns } from "./invoices-columns";

const PAGE_SIZE = 5;

interface InvoicesTableProps {
  invoices: ReadonlyArray<Invoice>;
}

export function InvoicesTable({ invoices }: InvoicesTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  });

  // Reset to page 0 when the status filter upstream changes the invoices prop
  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [invoices]);

  // eslint-disable-next-line react-hooks/incompatible-library -- useReactTable mutates during render; component skips React Compiler memoization
  const table = useReactTable({
    data: invoices as Invoice[],
    columns: invoiceColumns,
    state: { sorting, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const { pageIndex, pageSize } = table.getState().pagination;
  const totalRows = invoices.length;
  const from = pageIndex * pageSize + 1;
  const to = Math.min((pageIndex + 1) * pageSize, totalRows);

  return (
    <div className="max-mobile:hidden">
      <DataTable aria-label="Invoices" className="table-fixed">
        <DataHeader>
          {table.getHeaderGroups().map((hg) => (
            <DataRow key={hg.id} className="cursor-default hover:bg-background">
              {hg.headers.map((header, i) => {
                const canSort = header.column.getCanSort();
                const sorted = header.column.getIsSorted();
                const isLast = i === hg.headers.length - 1;

                return (
                  <DataHead
                    key={header.id}
                    className={cn(
                      i === 0 && "w-2/6 pl-6",
                      i > 0 && !isLast && "w-1/6",
                      i === 4 && "text-right",
                      isLast && "w-15 pr-6",
                      canSort && "cursor-pointer select-none",
                    )}
                    aria-hidden={isLast || undefined}
                    onClick={
                      canSort
                        ? header.column.getToggleSortingHandler()
                        : undefined
                    }
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
                    {!isLast && (
                      <span className="inline-flex items-center gap-1">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                        {canSort && (
                          <span aria-hidden className="text-ink-3">
                            {sorted === "asc" ? (
                              <ArrowUp className="size-3" />
                            ) : sorted === "desc" ? (
                              <ArrowDown className="size-3" />
                            ) : (
                              <ChevronsUpDown className="size-3" />
                            )}
                          </span>
                        )}
                      </span>
                    )}
                  </DataHead>
                );
              })}
            </DataRow>
          ))}
        </DataHeader>
        <DataBody>
          {table.getRowModel().rows.map((row) => {
            return (
              <DataRow
                key={row.id}
                className="relative"
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

      {totalRows > pageSize && (
        <div className="flex items-center justify-between border-t border-border px-6 py-3">
          <p className="text-body-sm text-ink-3">
            {from}–{to} of {totalRows}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              aria-label="Previous page"
              className="inline-flex size-9 items-center justify-center rounded-full border border-border bg-card text-ink-2 hover:border-line-strong hover:bg-coral/5 hover:text-coral-press disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-press focus-visible:ring-offset-1"
            >
              <ChevronLeft className="size-4" aria-hidden />
            </button>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              aria-label="Next page"
              className="inline-flex size-9 items-center justify-center rounded-full border border-border bg-card text-ink-2 hover:border-line-strong hover:bg-coral/5 hover:text-coral-press disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-press focus-visible:ring-offset-1"
            >
              <ChevronRight className="size-4" aria-hidden />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
