const MONTH_INDEX: Record<string, number> = {
  jan: 0, january: 0,
  feb: 1, february: 1,
  mar: 2, march: 2,
  apr: 3, april: 3,
  may: 4,
  jun: 5, june: 5,
  jul: 6, july: 6,
  aug: 7, august: 7,
  sep: 8, sept: 8, september: 8,
  oct: 9, october: 9,
  nov: 10, november: 10,
  dec: 11, december: 11,
}

/** Parse common year, month-year, and date-range strings for newest-first sorting. */
export function parseDateForSort(dateStr?: string): number {
  if (!dateStr) return 0
  if (/\b(present|current|ongoing|in progress)\b/i.test(dateStr)) return Number.MAX_SAFE_INTEGER

  const monthDates: number[] = []
  const monthYearPattern = /\b(january|jan|february|feb|march|mar|april|apr|may|june|jun|july|jul|august|aug|september|sept|sep|october|oct|november|nov|december|dec)\s+(\d{4})\b/gi
  for (const match of dateStr.matchAll(monthYearPattern)) {
    monthDates.push(new Date(Number(match[2]), MONTH_INDEX[match[1].toLowerCase()]).getTime())
  }
  if (monthDates.length > 0) return Math.max(...monthDates)

  // Month picker values use YYYY-MM; year-only values are treated as January.
  const yearMonth = dateStr.match(/\b(\d{4})-(\d{1,2})\b/)
  if (yearMonth) {
    return new Date(Number(yearMonth[1]), Number(yearMonth[2]) - 1).getTime()
  }

  const years = [...dateStr.matchAll(/\b(\d{4})\b/g)].map((match) => Number(match[1]))
  if (years.length > 0) return new Date(Math.max(...years), 0).getTime()

  const parsedDate = Date.parse(dateStr)
  return Number.isNaN(parsedDate) ? 0 : parsedDate
}

/** Parse the first date in a formatted period, for experience tie-breaking. */
export function parseDateRangeStartForSort(dateRange?: string): number {
  if (!dateRange) return 0

  const monthYear = dateRange.match(/\b(january|jan|february|feb|march|mar|april|apr|may|june|jun|july|jul|august|aug|september|sept|sep|october|oct|november|nov|december|dec)\s+\d{4}\b/i)
  if (monthYear) return parseDateForSort(monthYear[0])

  const yearMonth = dateRange.match(/\b\d{4}-\d{1,2}\b/)
  if (yearMonth) return parseDateForSort(yearMonth[0])

  const year = dateRange.match(/\b\d{4}\b/)
  return year ? parseDateForSort(year[0]) : 0
}