import { FC } from 'react';
import { format, subMonths } from 'date-fns';
import { getBillMonthForColumn } from '../../utils/billUtils';
import { CategoryName } from '../../config';
import CategoryMonthColumn from './CategoryMonthColumn';

type Props = {
  categoryName: CategoryName;
  categoryId: string | undefined;
  owner: string;
  transactions: any[];
  month: number;
  year: number;
};

const CategoryBlock: FC<Props> = ({ categoryName, categoryId, owner, transactions, month, year }) => {
  if (!categoryId) return null;

  function getMonthLabel(colIdx: number): string {
    const base = new Date(year, month - 1);
    const date = colIdx === 2 ? base : subMonths(base, 2 - colIdx);
    return format(date, 'MMM');
  }

  function getTransactionsForColumn(colIdx: number): any[] {
    const bm = getBillMonthForColumn(month, year, colIdx);
    return transactions.filter(t => t.date?.substring(0, 7) === bm);
  }

  return (
    <div>
      <div className="tw:font-bold tw:text-base tw:mb-2">{categoryName}</div>
      <div className="tw:flex">
        {[0, 1, 2].map(colIdx => (
          <CategoryMonthColumn
            key={colIdx}
            billMonth={getBillMonthForColumn(month, year, colIdx)}
            transactions={getTransactionsForColumn(colIdx)}
            categoryId={categoryId}
            owner={owner}
            monthLabel={getMonthLabel(colIdx)}
          />
        ))}
      </div>
    </div>
  );
};

export default CategoryBlock;
