import { FC } from 'react';
import { toDisplayAmount } from '../../utils/billUtils';
import CategoryTransactionRow from './CategoryTransactionRow';

type Props = {
  month: string;
  transactions: any[];
  categoryId: string;
  owner: string;
  monthLabel: string;
  registerDescRef: (rowIdx: number, el: HTMLInputElement | null) => void;
  focusDesc: (rowIdx: number) => void;
  onUp: (rowIdx: number) => void;
  onLeft: (rowIdx: number) => void;
  onRight: (rowIdx: number) => void;
};

const CategoryMonthColumn: FC<Props> = ({
  month,
  transactions,
  categoryId,
  owner,
  monthLabel,
  registerDescRef,
  focusDesc,
  onUp,
  onLeft,
  onRight,
}) => {
  const total = transactions.reduce((sum, t) => sum + t.amount, 0);
  const newRowIdx = transactions.length;

  return (
    <div className="tw:w-[150px] tw:text-primary">
      <div className="tw:flex tw:border-b tw:border-purpleBorder tw:pb-[2px] tw:mb-[2px]">
        <div className="tw:w-[120px] tw:pl-[12px] tw:font-semibold tw:text-sm">
          {monthLabel}
        </div>
        <div className="tw:w-[60px] tw:pr-[4px] tw:text-right tw:font-semibold tw:text-sm">
          {total ? toDisplayAmount(total) : ''}
        </div>
      </div>
      {transactions.map((t, rowIdx) => (
        <CategoryTransactionRow
          key={t.id}
          transaction={t}
          categoryId={categoryId}
          owner={owner}
          month={month}
          descRef={(el) => registerDescRef(rowIdx, el)}
          onEnterAmount={() => focusDesc(rowIdx + 1)}
          onUp={() => onUp(rowIdx)}
          onLeft={() => onLeft(rowIdx)}
          onRight={() => onRight(rowIdx)}
        />
      ))}
      <CategoryTransactionRow
        key="new-row"
        categoryId={categoryId}
        owner={owner}
        month={month}
        descRef={(el) => registerDescRef(newRowIdx, el)}
        onEnterAmount={() => focusDesc(newRowIdx + 1)}
        onUp={() => onUp(newRowIdx)}
        onLeft={() => onLeft(newRowIdx)}
        onRight={() => onRight(newRowIdx)}
      />
    </div>
  );
};

export default CategoryMonthColumn;
