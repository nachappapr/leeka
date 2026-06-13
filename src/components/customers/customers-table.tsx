"use client";

import { useState } from "react";
import Link from "next/link";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from "@tanstack/react-table";

import { ArrowDown, ArrowUp, ChevronsUpDown, Search } from "@/components/icons";
import {
  DataBody,
  DataCell,
  DataHead,
  DataHeader,
  DataRow,
  DataTable,
} from "@/components/ui/custom/data-table";
import { InputField } from "@/components/ui/custom/input-field";
import { cn } from "@/lib/utils";
import type { Customer } from "@/lib/types";
import { customerColumns } from "./customers-columns";
import { customerFilter } from "./customers-filter";

interface CustomersTableProps {
  customers: ReadonlyArray<Customer>;
}

export function CustomersTable({ customers }: CustomersTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  // eslint-disable-next-line react-hooks/incompatible-library -- useReactTable mutates during render; "use no memo" opts out but the ESLint rule fires regardless
  const table = useReactTable({
    data: customers as Customer[],
    columns: customerColumns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: (value: string) => {
      setGlobalFilter(value);
    },
    globalFilterFn: customerFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const totalRows = table.getFilteredRowModel().rows.length;

  return (
    <div className="max-mobile:hidden">
      <div className="flex items-center border-b border-border px-6 py-4">
        <div className="relative flex-1 max-w-xs">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-ink-3"
            aria-hidden
          />
          <span id="customers-search-scope-hint" className="sr-only">
            Search filters the loaded customers. Load more to search all.
          </span>
          <InputField
            placeholder="Search customers…"
            value={globalFilter}
            onChange={(e) => table.setGlobalFilter(e.target.value)}
            className="pl-9"
            aria-label="Search customers"
            aria-describedby="customers-search-scope-hint"
          />
        </div>
        <p role="status" className="sr-only">
          {totalRows} customer{totalRows === 1 ? "" : "s"} found
        </p>
      </div>

      <DataTable aria-label="Customers" className="table-fixed">
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

      {totalRows === 0 && globalFilter && (
        <p role="status" className="py-12 text-center text-body-sm text-ink-3">
          No customers match &ldquo;{globalFilter}&rdquo;
        </p>
      )}
    </div>
  );
}
