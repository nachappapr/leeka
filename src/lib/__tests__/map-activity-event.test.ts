import { describe, it, expect } from "vitest";
import { mapActivityEvent, mapActivityTimeline } from "@/lib/invoice/map-activity-event";
import type { ActivityKind } from "@/lib/types/invoice";

function makeEvent(
  type: string,
  options: { id?: string; channel?: string | null; created_at?: string | null } = {},
) {
  return {
    id: options.id ?? "evt-1",
    type,
    channel: options.channel !== undefined ? options.channel : null,
    created_at: options.created_at !== undefined ? options.created_at : "2026-05-26T11:24:00Z",
  };
}

// ─── mapActivityEvent — known types ──────────────────────────────────────────

describe("mapActivityEvent — whatsapp.dispatched", () => {
  it("maps to kind sent with WhatsApp label and channel whatsapp", () => {
    const item = mapActivityEvent(makeEvent("whatsapp.dispatched", { channel: "whatsapp" }));
    expect(item.kind).toBe<ActivityKind>("sent");
    expect(item.label).toBe("Sent on WhatsApp");
    expect(item.channel).toBe("whatsapp");
  });
});

describe("mapActivityEvent — email.dispatched", () => {
  it("maps to kind sent with email label and channel email", () => {
    const item = mapActivityEvent(makeEvent("email.dispatched", { channel: "email" }));
    expect(item.kind).toBe<ActivityKind>("sent");
    expect(item.label).toBe("Sent over email");
    expect(item.channel).toBe("email");
  });
});

describe("mapActivityEvent — receipt.dispatched", () => {
  it("null channel → kind sent, label Receipt sent, channel null", () => {
    const item = mapActivityEvent(makeEvent("receipt.dispatched", { channel: null }));
    expect(item.kind).toBe<ActivityKind>("sent");
    expect(item.label).toBe("Receipt sent");
    expect(item.channel).toBeNull();
  });

  it("whatsapp channel → kind sent, label Receipt sent on WhatsApp, channel whatsapp", () => {
    const item = mapActivityEvent(makeEvent("receipt.dispatched", { channel: "whatsapp" }));
    expect(item.kind).toBe<ActivityKind>("sent");
    expect(item.label).toBe("Receipt sent on WhatsApp");
    expect(item.channel).toBe("whatsapp");
  });

  it("email channel → kind sent, label Receipt sent via email, channel email", () => {
    const item = mapActivityEvent(makeEvent("receipt.dispatched", { channel: "email" }));
    expect(item.kind).toBe<ActivityKind>("sent");
    expect(item.label).toBe("Receipt sent via email");
    expect(item.channel).toBe("email");
  });

  it("whatsapp receipt label is distinct from whatsapp.dispatched label", () => {
    const receipt = mapActivityEvent(makeEvent("receipt.dispatched", { channel: "whatsapp" }));
    const invoice = mapActivityEvent(makeEvent("whatsapp.dispatched", { channel: "whatsapp" }));
    expect(receipt.label).not.toBe(invoice.label);
  });
});

describe("mapActivityEvent — viewed", () => {
  it("null channel → Viewed by customer", () => {
    const item = mapActivityEvent(makeEvent("viewed", { channel: null }));
    expect(item.kind).toBe<ActivityKind>("viewed");
    expect(item.label).toBe("Viewed by customer");
    expect(item.channel).toBeNull();
  });

  it("whatsapp channel → Viewed on WhatsApp", () => {
    const item = mapActivityEvent(makeEvent("viewed", { channel: "whatsapp" }));
    expect(item.kind).toBe<ActivityKind>("viewed");
    expect(item.label).toBe("Viewed on WhatsApp");
    expect(item.channel).toBe("whatsapp");
  });

  it("email channel → Viewed via email", () => {
    const item = mapActivityEvent(makeEvent("viewed", { channel: "email" }));
    expect(item.kind).toBe<ActivityKind>("viewed");
    expect(item.label).toBe("Viewed via email");
    expect(item.channel).toBe("email");
  });
});

describe("mapActivityEvent — reminder_sent", () => {
  it("null channel → Reminder sent", () => {
    const item = mapActivityEvent(makeEvent("reminder_sent", { channel: null }));
    expect(item.kind).toBe<ActivityKind>("reminder");
    expect(item.label).toBe("Reminder sent");
    expect(item.channel).toBeNull();
  });

  it("whatsapp channel → Reminder sent on WhatsApp", () => {
    const item = mapActivityEvent(makeEvent("reminder_sent", { channel: "whatsapp" }));
    expect(item.kind).toBe<ActivityKind>("reminder");
    expect(item.label).toBe("Reminder sent on WhatsApp");
    expect(item.channel).toBe("whatsapp");
  });

  it("email channel → Reminder sent via email", () => {
    const item = mapActivityEvent(makeEvent("reminder_sent", { channel: "email" }));
    expect(item.kind).toBe<ActivityKind>("reminder");
    expect(item.label).toBe("Reminder sent via email");
    expect(item.channel).toBe("email");
  });
});

describe("mapActivityEvent — paid", () => {
  it("maps to kind paid with Marked paid label", () => {
    const item = mapActivityEvent(makeEvent("paid", { channel: null }));
    expect(item.kind).toBe<ActivityKind>("paid");
    expect(item.label).toBe("Marked paid");
    expect(item.channel).toBeNull();
  });
});

describe("mapActivityEvent — overdue", () => {
  it("maps to kind overdue with Marked overdue label", () => {
    const item = mapActivityEvent(makeEvent("overdue", { channel: null }));
    expect(item.kind).toBe<ActivityKind>("overdue");
    expect(item.label).toBe("Marked overdue");
    expect(item.channel).toBeNull();
  });
});

// ─── mapActivityEvent — graceful degradation ─────────────────────────────────

describe("mapActivityEvent — unknown / forward-compatible types", () => {
  it("does not throw for an unknown type", () => {
    expect(() => mapActivityEvent(makeEvent("future_event_type"))).not.toThrow();
  });

  it("maps unknown type to kind other", () => {
    const item = mapActivityEvent(makeEvent("future_event_type"));
    expect(item.kind).toBe<ActivityKind>("other");
  });

  it("produces a non-empty label for an unknown type", () => {
    const item = mapActivityEvent(makeEvent("future_event_type"));
    expect(item.label.length).toBeGreaterThan(0);
  });

  it("humanizes type with dots into capitalized words", () => {
    const item = mapActivityEvent(makeEvent("custom.event.fired"));
    expect(item.label).toBe("Custom Event Fired");
  });

  it("humanizes type with underscores into capitalized words", () => {
    const item = mapActivityEvent(makeEvent("payment_initiated"));
    expect(item.label).toBe("Payment Initiated");
  });
});

// ─── mapActivityEvent — channel normalization ────────────────────────────────

describe("mapActivityEvent — channel normalization", () => {
  it("normalizes an unknown channel string to null", () => {
    const item = mapActivityEvent(makeEvent("viewed", { channel: "sms" }));
    expect(item.channel).toBeNull();
  });

  it("preserves id and isoDateTime from the input event", () => {
    const item = mapActivityEvent(
      makeEvent("paid", { id: "evt-abc", created_at: "2026-06-01T08:00:00Z" }),
    );
    expect(item.id).toBe("evt-abc");
    expect(item.isoDateTime).toBe("2026-06-01T08:00:00Z");
  });

  it("sets isoDateTime to empty string when created_at is null", () => {
    const item = mapActivityEvent(makeEvent("paid", { created_at: null }));
    expect(item.isoDateTime).toBe("");
  });
});

// ─── mapActivityTimeline — ordering ──────────────────────────────────────────

describe("mapActivityTimeline — deterministic ordering", () => {
  it("sorts newest-first by created_at", () => {
    const events = [
      makeEvent("viewed", { id: "evt-a", created_at: "2026-05-26T11:00:00Z" }),
      makeEvent("paid", { id: "evt-b", created_at: "2026-05-26T13:00:00Z" }),
      makeEvent("whatsapp.dispatched", {
        id: "evt-c",
        channel: "whatsapp",
        created_at: "2026-05-26T10:00:00Z",
      }),
    ];
    const result = mapActivityTimeline(events);
    expect(result.map((r) => r.id)).toEqual(["evt-b", "evt-a", "evt-c"]);
  });

  it("breaks equal-timestamp ties by id DESC for stable output", () => {
    const events = [
      makeEvent("viewed", { id: "evt-a", created_at: "2026-05-26T11:00:00Z" }),
      makeEvent("paid", { id: "evt-b", created_at: "2026-05-26T11:00:00Z" }),
    ];
    const result = mapActivityTimeline(events);
    // "evt-b" > "evt-a" lexicographically → evt-b appears first
    expect(result.map((r) => r.id)).toEqual(["evt-b", "evt-a"]);
  });

  it("produces the same order on repeated calls (no mutation of input array)", () => {
    const events = [
      makeEvent("viewed", { id: "evt-a", created_at: "2026-05-26T11:00:00Z" }),
      makeEvent("paid", { id: "evt-b", created_at: "2026-05-26T13:00:00Z" }),
    ];
    const r1 = mapActivityTimeline(events);
    const r2 = mapActivityTimeline(events);
    expect(r1.map((r) => r.id)).toEqual(r2.map((r) => r.id));
  });
});

// ─── mapActivityTimeline — null / empty input ─────────────────────────────────

describe("mapActivityTimeline — null / empty input", () => {
  it("returns [] for null", () => {
    expect(mapActivityTimeline(null)).toEqual([]);
  });

  it("returns [] for undefined", () => {
    expect(mapActivityTimeline(undefined)).toEqual([]);
  });

  it("returns [] for empty array", () => {
    expect(mapActivityTimeline([])).toEqual([]);
  });
});
