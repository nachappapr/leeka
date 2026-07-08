"use client";

import { useState } from "react";
import Link from "next/link";
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
import type { Customer } from "@/lib/types";
import { customerColumns } from "./customers-columns";

interface CustomersTableProps {
  customers: ReadonlyArray<Customer>;
  pageIndex: number;
  pageSize: number;
  pageCount: number;
  total?: number;
  isLoading: boolean;
  onPaginationChange: OnChangeFn<PaginationState>;
  searchSlot: React.ReactNode;
  activeQuery: string | null;
  bodyRef?: React.RefObject<HTMLDivElement | null>;
}

export function CustomersTable({
  customers,
  pageIndex,
  pageSize,
  pageCount,
  total,
  isLoading,
  onPaginationChange,
  searchSlot,
  activeQuery,
  bodyRef,
}: CustomersTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  // eslint-disable-next-line react-hooks/incompatible-library -- useReactTable mutates during render; "use no memo" opts out but the ESLint rule fires regardless
  const table = useReactTable({
    data: customers as Customer[],
    columns: customerColumns,
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
    <div className="max-mobile:hidden">
      <div className="flex items-center border-b border-border px-6 py-4">{searchSlot}</div>

      <div
        ref={bodyRef}
        className={cn(
          "relative transition-opacity duration-150 motion-reduce:transition-none",
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

        <DataTable
          aria-label="Customers"
          className="table-fixed"
          aria-busy={isLoading || undefined}
        >
          <DataHeader>
            {table.getHeaderGroups().map((hg) => (
              <DataRow key={hg.id} className="cursor-default hover:bg-background">
                {hg.headers.map((header, i) => {
                  const canSort = header.column.getCanSort();
                  const sorted = header.column.getIsSorted();
                  const isFirst = i === 0;
                  const isLast = i === hg.headers.length - 1;

                  const sortIcon = canSort && (
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
                        isFirst && "w-2/6 pl-6",
                        !isFirst && !isLast && "w-1/6",
                        isLast && "w-1/6 pr-6 text-right",
                        i === 3 && "text-right",
                      )}
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
                      {canSort ? (
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
                      )}
                    </DataHead>
                  );
                })}
              </DataRow>
            ))}
          </DataHeader>
          <DataBody>
            {table.getRowModel().rows.map((row) => {
              const detailHref = `/customers/${row.original.id}`;
              return (
                <DataRow key={row.id} className="relative">
                  {row.getVisibleCells().map((cell, i) => {
                    const isFirst = i === 0;
                    const isLast = i === row.getVisibleCells().length - 1;
                    return (
                      <DataCell
                        key={cell.id}
                        className={cn(
                          isFirst && "pl-6",
                          isLast && "pr-6 text-right",
                          i === 3 && "text-right",
                        )}
                      >
                        {isFirst ? (
                          <Link
                            href={detailHref}
                            aria-label={`View ${row.original.name}`}
                            className="after:absolute after:inset-0 focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-coral-press focus-visible:after:ring-inset"
                          >
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </Link>
                        ) : (
                          flexRender(cell.column.columnDef.cell, cell.getContext())
                        )}
                      </DataCell>
                    );
                  })}
                </DataRow>
              );
            })}
          </DataBody>
        </DataTable>

        {customers.length === 0 && activeQuery && (
          <p className="py-12 text-center text-body-sm text-ink-3">
            No customers match &ldquo;{activeQuery}&rdquo;
          </p>
        )}

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
    </div>
  );
}
