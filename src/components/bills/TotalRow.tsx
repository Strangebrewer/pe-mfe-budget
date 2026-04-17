import { FC } from "react";
import { getBillMonthForColumn, toDisplayAmount } from "../../utils/billUtils";

type TotalRowProps = {
  bills: any[];
  transactions: any[];
  month: number;
  year: number;
}

const TotalRow: FC<TotalRowProps> = ({ bills, transactions, month, year }) => {
  function getTotalForColumn(colIndex: number): string {
    const billMonth = getBillMonthForColumn(month, year, colIndex);

    const billTotal = bills
      .flatMap((b: any) => b.transactions ?? [])
      .filter((t: any) => t.billMonth === billMonth)
      .reduce((sum: number, t: any) => sum + t.amount, 0);

    const categoryTotal = transactions
      .filter((t: any) => t.date.substring(0, 7) === billMonth)
      .reduce((sum: number, t: any) => sum + t.amount, 0);

    const total = billTotal + categoryTotal;
    return total ? toDisplayAmount(total) : '';
  }

  return (
    <div className="tw:w-[540px] tw:flex tw:bg-[#ff000022]">
      <div className="tw:w-[300px] tw:border tw:pl-[4px]">Total Expenses</div>
      {[0, 1, 2].map(colIndex => (
        <div key={colIndex} className="tw:w-[80px] tw:pr-[4px] tw:border tw:text-right">
          {getTotalForColumn(colIndex)}
        </div>
      ))}
    </div>
  );
};

export default TotalRow;
