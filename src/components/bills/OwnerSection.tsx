import { FC } from "react";
import { SHARED_CATEGORY_NAMES, CategoryName } from "../../config";

const sidebarStyles: Record<'mine' | 'hers', string> = {
  mine: 'tw:w-[48px] tw:flex tw:border tw:bg-[blue]',
  hers: 'tw:w-[48px] tw:flex tw:border tw:bg-[pink]',
};
import BillRow from "./BillRow";
import CategoryRow from "./CategoryRow";
import IncomeRow from "./IncomeRow";
import TotalRow from "./TotalRow";

type OwnerSectionProps = {
  owner: 'mine' | 'hers';
  bills: any[];
  categoryTransactions: Record<CategoryName, any[]>;
  income: any[];
  month: number;
  year: number;
  rowOffset: number;
  registerRef: (rowIndex: number, colIndex: number, el: HTMLInputElement | null) => void;
  onUp: (rowIndex: number, colIndex: number) => void;
  onDown: (rowIndex: number, colIndex: number) => void;
  onLeft: (rowIndex: number, colIndex: number) => void;
  onRight: (rowIndex: number, colIndex: number) => void;
}

const OwnerSection: FC<OwnerSectionProps> = ({
  owner, bills, categoryTransactions, income, month, year, rowOffset, registerRef, onUp, onDown, onLeft, onRight,
}) => {
  const allCategoryTransactions = SHARED_CATEGORY_NAMES.flatMap(name => categoryTransactions[name]);

  return (
    <div className="tw:flex">
      <div className={sidebarStyles[owner]}>
        <p className="tw:m-auto">{owner === 'mine' ? 'Mine' : 'Hers'}</p>
      </div>
      <div className="tw:grow">
        {bills.map((bill: any, i: number) => (
          <BillRow
            key={bill.id}
            bill={bill}
            rowIndex={rowOffset + i}
            month={month}
            year={year}
            registerRef={registerRef}
            onUp={onUp}
            onDown={onDown}
            onLeft={onLeft}
            onRight={onRight}
          />
        ))}
        {SHARED_CATEGORY_NAMES.map(name => (
          <CategoryRow
            key={name}
            title={name}
            owner={owner}
            transactions={categoryTransactions[name]}
            month={month}
            year={year}
          />
        ))}
        <TotalRow bills={bills} transactions={allCategoryTransactions} month={month} year={year} />
        <IncomeRow owner={owner} transactions={income} month={month} year={year} />
      </div>
    </div>
  );
};

export default OwnerSection;
