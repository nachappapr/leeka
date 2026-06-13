import { cn } from "@/lib/utils";
import {
  DataBody,
  DataCell,
  DataHead,
  DataHeader,
  DataRow,
  DataTable,
} from "@/components/ui/custom/data-table";
import {
  SkeletonBlock,
  SkeletonCircle,
  SkeletonPill,
} from "@/components/ui/custom/skeleton-shimmer";

export interface SkeletonTableColumn {
  kind: "avatar" | "text" | "pill" | "amount" | "action";
  bodyWidth?: string;
  headWidth?: string;
  align?: "left" | "right";
  cellClassName?: string;
}

export interface SkeletonTableProps {
  columns: ReadonlyArray<SkeletonTableColumn>;
  rows?: number;
  className?: string;
}

const KIND_DEFAULTS: Record<SkeletonTableColumn["kind"], { bodyWidth: string; headWidth: string }> =
  {
    avatar: { bodyWidth: "w-28", headWidth: "w-12" },
    text: { bodyWidth: "w-16", headWidth: "w-12" },
    pill: { bodyWidth: "w-16", headWidth: "w-12" },
    amount: { bodyWidth: "w-16", headWidth: "w-12" },
    action: { bodyWidth: "w-10", headWidth: "w-0" },
  };

function BodyCell({ col }: { col: SkeletonTableColumn }) {
  const bodyWidth = col.bodyWidth ?? KIND_DEFAULTS[col.kind].bodyWidth;
  const isRight = col.align === "right";

  if (col.kind === "avatar") {
    return (
      <div className="flex items-center gap-3">
        <SkeletonCircle className="size-8 shrink-0" />
        <div className="flex flex-col gap-2">
          <SkeletonBlock className="h-3 w-28" />
          <SkeletonBlock className="h-[9px] w-20 opacity-70" />
        </div>
      </div>
    );
  }

  if (col.kind === "pill") {
    return <SkeletonPill className={cn("h-5.5", bodyWidth)} />;
  }

  if (col.kind === "action") {
    return (
      <div className="flex justify-center">
        <SkeletonCircle className="size-10" />
      </div>
    );
  }

  const height = col.kind === "amount" ? "h-[13px]" : "h-[11px]";
  return <SkeletonBlock className={cn(height, bodyWidth, isRight && "ml-auto")} />;
}

export function SkeletonTable({ columns, rows = 6, className }: SkeletonTableProps) {
  return (
    <DataTable className={className}>
      <DataHeader>
        <DataRow className="cursor-default hover:bg-background">
          {columns.map((col, i) => {
            const headWidth = col.headWidth ?? KIND_DEFAULTS[col.kind].headWidth;
            const isRight = col.align === "right";
            return (
              <DataHead key={i} className={cn(col.cellClassName, isRight && "text-right")}>
                {headWidth !== "w-0" && (
                  <SkeletonBlock className={cn("h-[9px]", headWidth, isRight && "ml-auto")} />
                )}
              </DataHead>
            );
          })}
        </DataRow>
      </DataHeader>
      <DataBody>
        {Array.from({ length: rows }).map((_, rowIdx) => (
          <DataRow key={rowIdx} className="cursor-default hover:bg-background">
            {columns.map((col, colIdx) => {
              const isRight = col.align === "right";
              return (
                <DataCell key={colIdx} className={cn(col.cellClassName, isRight && "text-right")}>
                  <BodyCell col={col} />
                </DataCell>
              );
            })}
          </DataRow>
        ))}
      </DataBody>
    </DataTable>
  );
}
