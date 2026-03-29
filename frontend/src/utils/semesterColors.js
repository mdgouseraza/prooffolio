/** Semester accent colors: 1–2 gold, 3–4 blue, 5–6 green, 7–8 purple */
export function semesterAccentClass(n) {
  const s = Number(n) || 1
  if (s <= 2) return 'from-amber-400/90 to-amber-600/80'
  if (s <= 4) return 'from-sky-400/90 to-indigo-600/80'
  if (s <= 6) return 'from-emerald-400/90 to-teal-600/80'
  return 'from-violet-400/90 to-purple-700/80'
}
