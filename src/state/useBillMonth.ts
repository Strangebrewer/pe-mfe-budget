import { create } from 'zustand';

export type BillMonthStore = {
  month: number;
  year: number;
  billMonth: string;
  setBillMonth: (date: Date) => void;
}

function formatBillMonth(date: Date) {
  const year = date.getFullYear();
  let month: number | string = date.getMonth() + 1;
  if (month < 10) month = `0${month}`;
  return `${year}-${month}`;
}

export const useBillMonthStore = create<BillMonthStore>((set) => {
  const now = new Date();
  return {
    month: now.getMonth() + 1,
    year: now.getFullYear(),
    billMonth: formatBillMonth(now),
    setBillMonth: (date: Date) => {
      set({
        billMonth: formatBillMonth(date),
        month: date.getMonth() + 1,
        year: date.getFullYear(),
      });
    },
  };
});
