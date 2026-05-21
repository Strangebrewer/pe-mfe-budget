import { FC } from "react";
import { getBillMonthForColumn, sumByMonth, toDisplayAmount } from "../../utils/billUtils";

type IncomeRowProps = {
  transactions: any[];
  owner: 'theirs' | 'mine';
  month: number;
  year: number;
}

const IncomeRow: FC<IncomeRowProps> = ({ transactions, month, year }) => {
  function getTotalForColumn(colIndex: number): string {
    const total = sumByMonth(transactions, getBillMonthForColumn(month, year, colIndex));
    return total ? toDisplayAmount(total) : '';
  }

  return (
    <div className="tw:w-[540px] tw:flex tw:bg-greenAlpha">
      <div className="tw:w-[300px] tw:border tw:border-cellBorder tw:pl-[4px]">Income</div>
      {[0, 1, 2].map(colIndex => (
        <div key={colIndex} className="tw:w-[80px] tw:pr-[4px] tw:border tw:border-cellBorder tw:text-right">
          {getTotalForColumn(colIndex)}
        </div>
      ))}
    </div>
  );
};

export default IncomeRow;
