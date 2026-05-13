import { FC } from 'react';
import {
  getBillMonthForColumn,
  sumByMonth,
  toDisplayAmount,
} from '../../utils/billUtils';

type Props = {
  income: any[];
  bills: any[];
  transactions: any[];
  month: number;
  year: number;
};

const TotalsBlock: FC<Props> = ({
  income,
  bills,
  transactions,
  month,
  year,
}) => {
  function getIncomeTotal(colIdx: number): number {
    return sumByMonth(income, getBillMonthForColumn(month, year, colIdx));
  }

  function getExpensesTotal(colIdx: number): number {
    const bm = getBillMonthForColumn(month, year, colIdx);
    const billTotal = bills
      .flatMap((b: any) => b.transactions ?? [])
      .filter((t: any) => t.month === bm)
      .reduce((s: number, t: any) => s + t.amount, 0);
    const categoryTotal = transactions
      .filter((t: any) => t.month === bm)
      .reduce((s: number, t: any) => s + t.amount, 0);
    return billTotal + categoryTotal;
  }

  function display(amount: number): string {
    return amount ? toDisplayAmount(amount) : '';
  }

  function displaySigned(amount: number): string {
    if (!amount) return '';
    return amount < 0
      ? `-${toDisplayAmount(-amount)}`
      : toDisplayAmount(amount);
  }

  const nameCell =
    'tw:w-[300px] tw:border tw:border-cellBorder tw:pl-[4px] tw:text-sm';
  const valueCell =
    'tw:w-[80px] tw:border tw:border-cellBorder tw:pr-[4px] tw:text-right tw:text-sm';

  return (
    <div className="tw:flex tw:border tw:border-purple tw:rounded-l tw:my-[12px]">
      <div className="tw:w-[60px] tw:flex tw:text-purple tw:border-r tw:border-purple">
        <p className="tw:m-auto">Totals</p>
      </div>
      <div className="tw:grow">
        <div className="tw:flex tw:bg-greenAlpha">
          <div className={nameCell}>Total Income</div>
          {[0, 1, 2].map((colIdx) => (
            <div key={colIdx} className={valueCell}>
              {display(getIncomeTotal(colIdx))}
            </div>
          ))}
        </div>
        <div className="tw:flex tw:bg-redAlpha">
          <div className={nameCell}>Total Expenses</div>
          {[0, 1, 2].map((colIdx) => (
            <div key={colIdx} className={valueCell}>
              {display(getExpensesTotal(colIdx))}
            </div>
          ))}
        </div>
        <div className="tw:flex tw:bg-greenAlpha">
          <div className={nameCell}>Total Leftover</div>
          {[0, 1, 2].map((colIdx) => {
            const leftover = getIncomeTotal(colIdx) - getExpensesTotal(colIdx);
            return (
              <div key={colIdx} className={valueCell}>
                {displaySigned(leftover)}
              </div>
            );
          })}
        </div>
        <div className="tw:flex">
          <div className={nameCell}>Leftover Each</div>
          {[0, 1, 2].map((colIdx) => {
            const each =
              (getIncomeTotal(colIdx) - getExpensesTotal(colIdx)) / 2;
            return (
              <div key={colIdx} className={valueCell}>
                {displaySigned(each)}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TotalsBlock;
