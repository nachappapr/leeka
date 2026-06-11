"use client";

import { useEffect, useState, useTransition } from "react";
import { Edit, Trash2 } from "@/components/icons";
import { Card } from "@/components/ui/custom/card";
import { PillButton } from "@/components/ui/custom/pill-button";
import { IconButton } from "@/components/ui/custom/icon-button";
import { brandToast } from "@/components/ui/custom/brand-toast";
import { ItemFormModal } from "@/components/settings/item-form-modal";
import { listItemsAction, upsertItemAction, deleteItemAction } from "@/app/(app)/settings/actions";
import type { SavedItem } from "@/lib/types/item";
import type { ItemFormPayload } from "@/components/settings/item-form-modal";
import { formatRupees } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function ItemsSection() {
  const [items, setItems] = useState<SavedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<SavedItem | null>(null);
  const [, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      const result = await listItemsAction();
      if (result.ok) {
        setItems(result.data);
      }
      setLoading(false);
    });
  }, []);

  function openAdd() {
    setEditTarget(null);
    setModalOpen(true);
  }

  function openEdit(item: SavedItem) {
    setEditTarget(item);
    setModalOpen(true);
  }

  async function handleSave(payload: ItemFormPayload) {
    const result = await upsertItemAction(payload);
    if (!result.ok) {
      brandToast.error({ title: "Couldn't save item", sub: result.error });
      return;
    }
    const saved = result.data;
    setItems((prev) => {
      const idx = prev.findIndex((it) => it.id === saved.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [...prev, saved];
    });
    brandToast.success({ title: payload.id ? "Item updated" : "Item saved" });
  }

  function handleDeleteRequest(item: SavedItem) {
    brandToast.warn({
      title: `Delete "${item.name}"?`,
      sub: "This removes it from your catalogue. Past invoices are not affected.",
      duration: Infinity,
      actions: [
        {
          label: "Delete",
          primary: true,
          icon: <Trash2 className="size-3.5" aria-hidden />,
          onClick: () => confirmDelete(item.id),
        },
        { label: "Cancel" },
      ],
    });
  }

  async function confirmDelete(itemId: string) {
    const result = await deleteItemAction(itemId);
    if (!result.ok) {
      brandToast.error({ title: "Couldn't delete item", sub: result.error });
      return;
    }
    setItems((prev) => prev.filter((it) => it.id !== itemId));
    brandToast.success({ title: "Item deleted" });
  }

  function handleModalDelete(item: SavedItem) {
    setModalOpen(false);
    handleDeleteRequest(item);
  }

  const mode = editTarget ? "edit" : "add";

  return (
    <>
      <Card
        title="Saved items"
        headingLevel={3}
        action={
          <PillButton tone="secondary" size="sm" type="button" onClick={openAdd}>
            Add item
          </PillButton>
        }
      >
        <div className="px-6 py-5">
          <p className="mb-4 text-kicker font-extrabold uppercase tracking-wide text-ink-3">
            Your catalogue
            {items.length > 0 && (
              <span
                className={cn(
                  "ml-2 inline-flex items-center rounded-full px-2 py-0.5",
                  "bg-coral-soft text-coral-ink text-caption font-bold",
                )}
              >
                {items.length}
              </span>
            )}
          </p>

          {loading ? (
            <div className="flex flex-col gap-2.5">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 rounded-lg bg-surface-2 animate-pulse" aria-hidden />
              ))}
            </div>
          ) : items.length === 0 ? (
            <p className="py-6 text-center text-body-sm text-ink-3">
              No saved items yet. Add your first product or service.
            </p>
          ) : (
            <ul className="flex flex-col divide-y divide-border">
              {items.map((item) => (
                <li key={item.id} className="flex items-center gap-3 py-3.5">
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-body-sm font-bold text-ink truncate">{item.name}</span>
                      {item.unit && (
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full px-2 py-0.5",
                            "bg-surface-2 text-ink-3 text-caption font-semibold",
                          )}
                        >
                          {item.unit}
                        </span>
                      )}
                    </div>
                    {item.hsn_sac && (
                      <span className="text-caption text-ink-3">HSN/SAC: {item.hsn_sac}</span>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-0.5 shrink-0">
                    <span className="text-body-sm font-extrabold text-ink tabular">
                      {formatRupees(item.default_price)}
                    </span>
                    {item.default_gst_rate != null && (
                      <span className="text-caption text-ink-3">GST {item.default_gst_rate}%</span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <IconButton
                      type="button"
                      tone="ghost"
                      size="md"
                      aria-label={`Edit ${item.name}`}
                      onClick={() => openEdit(item)}
                    >
                      <Edit className="size-4" aria-hidden />
                    </IconButton>
                    <IconButton
                      type="button"
                      tone="destructive"
                      size="md"
                      aria-label={`Delete ${item.name}`}
                      onClick={() => handleDeleteRequest(item)}
                    >
                      <Trash2 className="size-4" aria-hidden />
                    </IconButton>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Card>

      <ItemFormModal
        mode={mode}
        initial={editTarget ?? undefined}
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSave={handleSave}
        onDelete={handleModalDelete}
      />
    </>
  );
}
