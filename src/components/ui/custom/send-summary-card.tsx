import { ChannelChips } from "@/components/ui/custom/channel-chips";
import type { Invoice } from "@/lib/types";
import type { SendChannel } from "@/lib/types";

interface SendSummaryCardProps {
  invoice: Invoice;
  phone: string;
  channel: SendChannel;
  onChannelChange: (c: SendChannel) => void;
  isBusy: boolean;
  statusLabel: string;
  date: string;
}

export function SendSummaryCard({
  invoice,
  phone,
  channel,
  onChannelChange,
  isBusy,
  statusLabel,
  date,
}: SendSummaryCardProps) {
  return (
    <div className="rounded-lg border border-line bg-surface-2 px-4 py-3.5">
      {/* To row */}
      <div className="flex items-center justify-between gap-4 py-2">
        <span className="min-w-24 text-kicker font-bold uppercase tracking-wide text-ink-3">
          To
        </span>
        <div className="flex flex-col items-end text-right">
          <span className="text-body-sm font-bold text-ink">
            {invoice.customer}
          </span>
          <span className="text-label tabular-nums text-ink-3">{phone}</span>
        </div>
      </div>
      {/* Channel row */}
      <div className="flex items-center justify-between gap-4 border-t border-dashed border-line py-2 max-mobile:flex-col max-mobile:items-start max-mobile:gap-2">
        <span
          id="send-channel-label"
          className="min-w-24 text-kicker font-bold uppercase tracking-wide text-ink-3"
        >
          Channel
        </span>
        <ChannelChips
          channel={channel}
          onChannelChange={onChannelChange}
          disabled={isBusy}
        />
      </div>
      {/* Amount row */}
      <div className="flex items-center justify-between gap-4 border-t border-dashed border-line py-2">
        <span className="min-w-24 text-kicker font-bold uppercase tracking-wide text-ink-3">
          Amount
        </span>
        <div className="flex flex-col items-end text-right">
          <span className="text-lead font-bold tabular-nums text-ink">
            {invoice.amount}
          </span>
          <span className="text-label text-ink-3">
            {statusLabel.toLowerCase()} · {date}
          </span>
        </div>
      </div>
    </div>
  );
}
