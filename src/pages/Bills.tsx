import { FC, useMemo, useRef, useState } from 'react';
import { useGetBills } from '../hooks/billHooks';
import { useBillMonthStore } from '../state/useBillMonth';
import BillRowHeader from '../components/bills/BillRowHeader';
import OwnerSection from '../components/bills/OwnerSection';
import TransferRow from '../components/bills/TransferRow';
import AddBillModal from '../components/bills/AddBillModal';
import { useGetTransactions } from '../hooks/transactionHooks';
import { useGetCategories } from '../hooks/categoryHooks';
import { useTransferStaleStore } from '../state/useTransferStale';
import { CategoryName, SHARED_CATEGORY_NAMES } from '../config';
import IncomeBlock from '../components/bills/IncomeBlock';
import { ActionButton, Card, useUserStore } from '@bka-stuff/pe-mfe-utils';
import NewTransactionWidget from '../components/bills/NewTransactionWidget';
import TotalsBlock from '../components/bills/TotalsBlock';
import MonthNav from '../components/MonthNav';

const TRANSACTION_COL_COUNT = 3;

const Bills: FC = () => {
  const { billMonth, month, year } = useBillMonthStore();
  const { user } = useUserStore();
  const cellRefs = useRef<Array<Array<HTMLInputElement | null>>>([]);
  const { data: bills } = useGetBills(billMonth);
  const { data: categories } = useGetCategories();

  const sharedCategoryIds = useMemo(
    () =>
      categories
        ?.filter((c: any) => SHARED_CATEGORY_NAMES.includes(c.name))
        .map((c: any) => c.id),
    [categories],
  );

  const { data: transactions } = useGetTransactions({
    month: billMonth,
    category: sharedCategoryIds?.join(),
  });

  const { data: income } = useGetTransactions({
    month: billMonth,
    income: true,
  });

  const splitIncome = useMemo(
    () => ({
      mine: income?.filter((t: any) => t.owner === 'mine') ?? [],
      theirs: income?.filter((t: any) => t.owner === 'theirs') ?? [],
    }),
    [income],
  );

  const sharedTransactions = useMemo(() => {
    const result: Record<'mine' | 'theirs', Record<CategoryName, any[]>> = {
      mine: { Food: [], Gas: [], Other: [] },
      theirs: { Food: [], Gas: [], Other: [] },
    };
    if (!transactions || !categories) return result;

    for (const name of SHARED_CATEGORY_NAMES) {
      const catId = categories.find((c: any) => c.name === name)?.id;
      result.mine[name] = transactions.filter(
        (t: any) => t.owner === 'mine' && t.categoryId === catId,
      );
      result.theirs[name] = transactions.filter(
        (t: any) => t.owner === 'theirs' && t.categoryId === catId,
      );
    }
    return result;
  }, [transactions, categories]);

  const [showAddBill, setShowAddBill] = useState(false);
  const { markTransferStale } = useTransferStaleStore();

  function registerRef(
    rowIndex: number,
    colIndex: number,
    el: HTMLInputElement | null,
  ) {
    if (!cellRefs.current[rowIndex]) {
      cellRefs.current[rowIndex] = new Array(TRANSACTION_COL_COUNT).fill(null);
    }
    cellRefs.current[rowIndex][colIndex] = el;
  }

  function focusDown(rowIndex: number, colIndex: number) {
    cellRefs.current[rowIndex + 1]?.[colIndex]?.focus();
  }

  function focusUp(rowIndex: number, colIndex: number) {
    cellRefs.current[rowIndex - 1]?.[colIndex]?.focus();
  }

  function focusRight(rowIndex: number, colIndex: number) {
    if (colIndex < 2) {
      cellRefs.current[rowIndex]?.[colIndex + 1]?.focus();
    } else {
      cellRefs.current[rowIndex + 1]?.[0]?.focus();
    }
  }

  function focusLeft(rowIndex: number, colIndex: number) {
    if (colIndex > 0) {
      cellRefs.current[rowIndex]?.[colIndex - 1]?.focus();
    } else {
      cellRefs.current[rowIndex - 1]?.[2]?.focus();
    }
  }

  const theirsBills = bills?.filter((b: any) => b.owner === 'theirs') ?? [];
  const mineBills = bills?.filter((b: any) => b.owner === 'mine') ?? [];

  return (
    <div className="tw:px-8 tw:pb-8">
      <h2 className="tw:my-4 tw:text-3xl tw:font-bold tw:text-center">
        Monthly Bills at a Glance
      </h2>

      <MonthNav onNavigate={markTransferStale} />

      <div className="tw:flex tw:justify-center tw:items-start tw:gap-[48px]">
        <AddBillModal
          isOpen={showAddBill}
          onClose={() => setShowAddBill(false)}
        />

        <Card>
          <div className="tw:w-[602px]">
            <h2 className="tw:text-3xl tw:font-bold tw:text-center tw:mb-3">
              Bills&nbsp;
              <ActionButton
                iconClass="fas fa-plus"
                onClick={() => setShowAddBill(true)}
              />
            </h2>

            <BillRowHeader />

            <OwnerSection
              owner="theirs"
              bills={theirsBills}
              categoryTransactions={sharedTransactions.theirs}
              income={splitIncome.theirs}
              month={month}
              year={year}
              rowOffset={0}
              registerRef={registerRef}
              onUp={focusUp}
              onDown={focusDown}
              onLeft={focusLeft}
              onRight={focusRight}
            />

            <OwnerSection
              owner="mine"
              bills={mineBills}
              categoryTransactions={sharedTransactions.mine}
              income={splitIncome.mine}
              month={month}
              year={year}
              rowOffset={theirsBills.length}
              registerRef={registerRef}
              onUp={focusUp}
              onDown={focusDown}
              onLeft={focusLeft}
              onRight={focusRight}
            />

            <TotalsBlock
              income={income ?? []}
              bills={bills ?? []}
              transactions={transactions ?? []}
              month={month}
              year={year}
            />

            <TransferRow
              splitIncome={splitIncome}
              bills={bills}
              sharedTransactions={sharedTransactions}
            />
          </div>
        </Card>

        <div className="tw:flex tw:flex-col tw:gap-[48px]">
          <IncomeBlock />
          <NewTransactionWidget categories={categories ?? []} />
        </div>
      </div>
    </div>
  );
};

export default Bills;
