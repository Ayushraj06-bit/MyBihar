/* ==========================================================================
   Chhath Puja 2026.
   Kartik Shukla Shashthi moves every year with the lunar calendar — confirm
   against the panchang before each season. This is the only place the dates
   live. Nahay Khay is the homecoming: the day the trains into Patna are full.
   ========================================================================== */
export const NAHAY_KHAY = '2026-11-13T00:00:00+05:30'

export const CHHATH_DAYS = [
  { hi: 'नहाय-खाय', en: 'Nahay Khay', iso: '2026-11-13T00:00:00+05:30' },
  { hi: 'खरना', en: 'Kharna', iso: '2026-11-14T00:00:00+05:30' },
  { hi: 'संध्या अर्घ्य', en: 'Sandhya Arghya', iso: '2026-11-15T00:00:00+05:30' },
  { hi: 'उषा अर्घ्य', en: 'Usha Arghya', iso: '2026-11-16T00:00:00+05:30' },
] as const

export function formatChhathDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'Asia/Kolkata' })
}
