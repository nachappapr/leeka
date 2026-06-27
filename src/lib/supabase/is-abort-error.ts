function hasStringProp(
  obj: Record<string, unknown>,
  key: string,
): obj is Record<string, unknown> & Record<typeof key, string> {
  return typeof obj[key] === "string";
}

function isAbortLike(obj: Record<string, unknown>): boolean {
  const message = hasStringProp(obj, "message") ? obj.message : "";
  const hint = hasStringProp(obj, "hint") ? obj.hint : "";
  return (
    message.startsWith("AbortError") ||
    message.toLowerCase().includes("aborted") ||
    hint.toLowerCase().includes("aborted")
  );
}

export function isAbortError(err: unknown): boolean {
  if (err instanceof DOMException && err.name === "AbortError") return true;
  if (err !== null && typeof err === "object" && !Array.isArray(err)) {
    return isAbortLike(err as Record<string, unknown>);
  }
  return false;
}
