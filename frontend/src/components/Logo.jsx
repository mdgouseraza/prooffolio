export function LogoMark({ size = 40, className = '' }) {
  const s = size
  const br = Math.max(8, Math.round(s * 0.35))
  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-[14px] border border-black/10 bg-[#0A0A14] ${className}`}
      style={{ width: s, height: s, borderRadius: br }}
      aria-hidden
    >
      <span
        className="font-[family-name:var(--font-syne)] font-extrabold leading-none text-[#A594FF]"
        style={{ fontSize: s * 0.38 }}
      >
        PF
      </span>
      <span
        className="absolute rounded-full bg-[#6EE7B7]"
        style={{
          width: Math.max(5, s * 0.2),
          height: Math.max(5, s * 0.2),
          right: s * 0.08,
          bottom: s * 0.08,
        }}
      />
    </div>
  )
}

export function Wordmark({ dark = true, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-1 font-[family-name:var(--font-syne)] ${className}`}>
      <span className="font-extrabold text-[#A594FF]">Proof</span>
      <span className={`font-normal ${dark ? 'text-white/70' : 'text-[#1A1830]'}`}>Folio</span>
    </span>
  )
}
