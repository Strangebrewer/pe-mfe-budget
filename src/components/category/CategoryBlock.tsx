import { FC, useRef } from 'react';
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

  const descRefs = useRef<(HTMLInputElement | null)[][]>([[], [], []]);

  function registerDescRef(colIdx: number, rowIdx: number, el: HTMLInputElement | null) {
    descRefs.current[colIdx][rowIdx] = el;
  }

  function focusDesc(colIdx: number, rowIdx: number) {
    descRefs.current[colIdx]?.[rowIdx]?.focus();
  }

  function getMonthLabel(colIdx: number): string {
    const base = new Date(year, month - 1);
    const date = colIdx === 2 ? base : subMonths(base, 2 - colIdx);
    return format(date, 'MMM');
  }

  function getTransactionsForColumn(colIdx: number): any[] {
    const bm = getBillMonthForColumn(month, year, colIdx);
    return transactions.filter(t => t.month === bm);
  }

  return (
    <div>
      <div className="tw:font-bold tw:text-base tw:mb-2">{categoryName}</div>
      <div className="tw:flex">
        {[0, 1, 2].map(colIdx => (
          <CategoryMonthColumn
            key={colIdx}
            month={getBillMonthForColumn(month, year, colIdx)}
            transactions={getTransactionsForColumn(colIdx)}
            categoryId={categoryId}
            owner={owner}
            monthLabel={getMonthLabel(colIdx)}
            registerDescRef={(rowIdx, el) => registerDescRef(colIdx, rowIdx, el)}
            focusDesc={(rowIdx) => focusDesc(colIdx, rowIdx)}
            onUp={(rowIdx) => focusDesc(colIdx, rowIdx - 1)}
            onLeft={(rowIdx) => focusDesc(colIdx - 1, rowIdx)}
            onRight={(rowIdx) => focusDesc(colIdx + 1, rowIdx)}
          />
        ))}
      </div>
    </div>
  );
};

export default CategoryBlock;
