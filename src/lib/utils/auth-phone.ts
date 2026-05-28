function formatPhone(raw: string) {
  const d = raw.replace(/\D/g, "").slice(0, 10)
  if (d.length <= 5) return d
  return d.slice(0, 5) + " " + d.slice(5)
}

function validPhone(p: string) {
  return p.replace(/\D/g, "").length === 10
}

function padTime(n: number) {
  return String(n).padStart(2, "0")
}

export { formatPhone, validPhone, padTime }
