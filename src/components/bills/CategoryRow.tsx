import { FC } from 'react';
import {
  getBillMonthForColumn,
  sumByMonth,
  toDisplayAmount,
} from '../../utils/billUtils';
import { CategoryName } from '../../config';

type CategoryRowProps = {
  transactions: any[];
  owner: 'theirs' | 'mine';
  title: CategoryName;
  month: number;
  year: number;
};

const CategoryRow: FC<CategoryRowProps> = ({
  title,
  transactions,
  month,
  year,
}) => {
  function getTotalForColumn(colIndex: number): string {
    const total = sumByMonth(
      transactions,
      getBillMonthForColumn(month, year, colIndex),
    );
    return total ? toDisplayAmount(total) : '';
  }

  return (
    <div className="tw:w-[540px] tw:flex tw:bg-blueFaint">
      <div className="tw:w-[300px] tw:border tw:border-cellBorder tw:pl-[4px]">
        {title}
      </div>
      {[0, 1, 2].map((colIndex) => (
        <div
          key={colIndex}
          className="tw:w-[80px] tw:pr-[4px] tw:border tw:border-cellBorder tw:text-right"
        >
          {getTotalForColumn(colIndex)}
        </div>
      ))}
    </div>
  );
};

export default CategoryRow;
