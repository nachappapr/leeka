"use client";

import { useState, useTransition } from "react";
import {
  Modal,
  ModalBody,
  ModalClose,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
} from "@/components/ui/custom/modal";
import { listItemsAction } from "@/app/(app)/settings/actions";
import type { SavedItem } from "@/lib/types/item";
import { formatRupees } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface InvoiceFormItemPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (item: SavedItem) => void;
}

export function InvoiceFormItemPicker({
  open,
  onOpenChange,
  onSelect,
}: InvoiceFormItemPickerProps) {
  const [items, setItems] = useState<SavedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [prevOpen, setPrevOpen] = useState(false);
  const [, startTransition] = useTransition();

  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open && items.length === 0) {
      setLoading(true);
      startTransition(async () => {
        const result = await listItemsAction();
        if (result.ok) {
          setItems(result.data);
        }
        setLoading(false);
      });
    }
  }

  function handleSelect(item: SavedItem) {
    onSelect(item);
    onOpenChange(false);
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent>
        <ModalHeader>
          <div className="flex min-w-0 flex-1 flex-col">
            <ModalTitle>From saved items</ModalTitle>
            <ModalDescription>
              Tap an item to prefill the line. You can edit the details after.
            </ModalDescription>
          </div>
          <ModalClose />
        </ModalHeader>

        <ModalBody className="pb-5">
          {loading ? (
            <div className="flex flex-col gap-2.5 py-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-14 rounded-lg bg-surface-2 animate-pulse" aria-hidden />
              ))}
            </div>
          ) : items.length === 0 ? (
            <p className="py-8 text-center text-body-sm text-ink-3">
              No saved items yet — add them in{" "}
              <span className="font-semibold text-ink-2">Settings → Saved items</span>
            </p>
          ) : (
            <ul className="flex flex-col divide-y divide-border">
              {items.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(item)}
                    className={cn(
                      "w-full flex items-center gap-3 py-3.5 text-left",
                      "transition-colors hover:bg-surface-2 rounded-lg px-2 -mx-2",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-press focus-visible:ring-offset-1",
                    )}
                  >
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="text-body-sm font-bold text-ink truncate">{item.name}</span>
                      {item.unit && <span className="text-caption text-ink-3">{item.unit}</span>}
                    </div>
                    <div className="flex flex-col items-end gap-0.5 shrink-0">
                      <span className="text-body-sm font-extrabold text-ink tabular">
                        {formatRupees(item.default_price)}
                      </span>
                      {item.default_gst_rate != null && (
                        <span className="text-caption text-ink-3">
                          GST {item.default_gst_rate}%
                        </span>
                      )}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
