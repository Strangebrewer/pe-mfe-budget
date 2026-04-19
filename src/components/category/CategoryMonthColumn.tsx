import { FC, useRef } from 'react';
import { toDisplayAmount } from '../../utils/billUtils';
import CategoryTransactionRow from './CategoryTransactionRow';

type Props = {
  billMonth: string;
  transactions: any[];
  categoryId: string;
  owner: string;
  monthLabel: string;
};

const CategoryMonthColumn: FC<Props> = ({ billMonth, transactions, categoryId, owner, monthLabel }) => {
  const descRefs = useRef<(HTMLInputElement | null)[]>([]);

  function registerDescRef(rowIdx: number) {
    return (el: HTMLInputElement | null) => {
      descRefs.current[rowIdx] = el;
    };
  }

  function focusNextDesc(rowIdx: number) {
    descRefs.current[rowIdx + 1]?.focus();
  }

  const total = transactions.reduce((sum, t) => sum + t.amount, 0);
  const newRowIdx = transactions.length;

  return (
    <div className="tw:w-[240px]">
      <div className="tw:flex tw:border-b tw:border-gray-400 tw:pb-[2px] tw:mb-[2px]">
        <div className="tw:w-[160px] tw:pl-[4px] tw:font-semibold tw:text-sm">{monthLabel}</div>
        <div className="tw:w-[80px] tw:pr-[4px] tw:text-right tw:font-semibold tw:text-sm">
          {total ? toDisplayAmount(total) : ''}
        </div>
      </div>
      {transactions.map((t, rowIdx) => (
        <CategoryTransactionRow
          key={t.id}
          transaction={t}
          categoryId={categoryId}
          owner={owner}
          billMonth={billMonth}
          descRef={registerDescRef(rowIdx)}
          onEnterAmount={() => focusNextDesc(rowIdx)}
        />
      ))}
      <CategoryTransactionRow
        key="new-row"
        categoryId={categoryId}
        owner={owner}
        billMonth={billMonth}
        descRef={registerDescRef(newRowIdx)}
        onEnterAmount={() => focusNextDesc(newRowIdx)}
      />
    </div>
  );
};

export default CategoryMonthColumn;
