export function getBillMonthForColumn(month: number, year: number, colIndex: number): string {
  // colIndex 0 = 2 months ago, 1 = 1 month ago, 2 = current
  let m = month - (2 - colIndex);
  let y = year;
  if (m <= 0) {
    m += 12;
    y -= 1;
  }
  const mm = m < 10 ? `0${m}` : `${m}`;
  return `${y}-${mm}`;
}

export function toDisplayAmount(amount?: number): string {
  if (amount === undefined || amount === null) return '';
  return (amount / 100).toFixed(2);
}

export function toStoredAmount(value: string): number {
  if (value.includes('.')) {
    return Math.round(parseFloat(value) * 100);
  }
  return parseInt(value, 10) * 100;
}
