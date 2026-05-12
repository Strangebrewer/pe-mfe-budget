import { FC, useMemo, useRef, useState } from 'react';
import { useGetBills } from '../hooks/billHooks';
import { useBillMonthStore } from '../state/useBillMonth';
import BillRowHeader from '../components/bills/BillRowHeader';
import OwnerSection from '../components/bills/OwnerSection';
import TransferRow from '../components/bills/TransferRow';
import AddBillModal from '../components/bills/AddBillModal';
import { useGetTransactions } from '../hooks/transactionHooks';
import { useGetCategories } from '../hooks/categoryHooks';
import {
  calculateTransfer,
  getBillMonthForColumn,
  sumByMonth,
} from '../utils/billUtils';
import { useTransferStaleStore } from '../state/useTransferStale';
import { CategoryName, SHARED_CATEGORY_NAMES } from '../config';
import IncomeBlock from '../components/bills/IncomeBlock';
import { ActionButton, Input, Label } from '@bka-stuff/pe-mfe-utils';
import NewTransactionWidget from '../components/bills/NewTransactionWidget';

const TRANSACTION_COL_COUNT = 3;

const Bills: FC = () => {
  const { billMonth, month, year } = useBillMonthStore();
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
      hers: income?.filter((t: any) => t.owner === 'hers') ?? [],
    }),
    [income],
  );

  const sharedTransactions = useMemo(() => {
    const result: Record<'mine' | 'hers', Record<CategoryName, any[]>> = {
      mine: { Food: [], Gas: [], Other: [] },
      hers: { Food: [], Gas: [], Other: [] },
    };
    if (!transactions || !categories) return result;

    for (const name of SHARED_CATEGORY_NAMES) {
      const catId = categories.find((c: any) => c.name === name)?.id;
      result.mine[name] = transactions.filter(
        (t: any) => t.owner === 'mine' && t.categoryId === catId,
      );
      result.hers[name] = transactions.filter(
        (t: any) => t.owner === 'hers' && t.categoryId === catId,
      );
    }
    return result;
  }, [transactions, categories]);

  const [showAddBill, setShowAddBill] = useState(false);
  const [transfers, setTransfers] = useState<(number | null)[]>([
    null,
    null,
    null,
  ]);
  const { isTransferStale, clearTransferStale } = useTransferStaleStore();

  function handleCalculateTransfer() {
    const result = [0, 1, 2].map((colIndex) => {
      const bm = getBillMonthForColumn(month, year, colIndex);

      const mineIncome = sumByMonth(splitIncome.mine, bm);
      const hersIncome = sumByMonth(splitIncome.hers, bm);

      const mineBills = (bills ?? []).filter((b: any) => b.owner === 'mine');
      const hersBills = (bills ?? []).filter((b: any) => b.owner === 'hers');

      const mineBillTotal = mineBills
        .flatMap((b: any) => b.transactions ?? [])
        .filter((t: any) => t.month === bm)
        .reduce((sum: number, t: any) => sum + t.amount, 0);

      const hersBillTotal = hersBills
        .flatMap((b: any) => b.transactions ?? [])
        .filter((t: any) => t.month === bm)
        .reduce((sum: number, t: any) => sum + t.amount, 0);

      const mineCategoryTotal = sumByMonth(
        SHARED_CATEGORY_NAMES.flatMap((name) => sharedTransactions.mine[name]),
        bm,
      );

      const hersCategoryTotal = sumByMonth(
        SHARED_CATEGORY_NAMES.flatMap((name) => sharedTransactions.hers[name]),
        bm,
      );

      return calculateTransfer(
        mineIncome,
        hersIncome,
        mineBillTotal + mineCategoryTotal,
        hersBillTotal + hersCategoryTotal,
      );
    });
    setTransfers(result);
    clearTransferStale();
  }

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

  const hersBills = bills?.filter((b: any) => b.owner === 'hers') ?? [];
  const mineBills = bills?.filter((b: any) => b.owner === 'mine') ?? [];

  return (
    <div className="tw:flex tw:justify-center tw:items-start tw:gap-[48px] tw:px-8 tw:pt-8">
      <AddBillModal
        isOpen={showAddBill}
        onClose={() => setShowAddBill(false)}
      />
      <div className="tw:bg-surface tw:border tw:border-purpleBorder tw:rounded-lg tw:p-[36px] tw:pt-[24px] tw:shadow-[0_0_24px_rgba(188,19,254,0.2)]">
        <div className="tw:w-[590px]">
          <h2 className="tw:text-3xl tw:font-bold tw:text-center tw:mb-3">
            Bills&nbsp;
            <ActionButton
              iconClass="fas fa-plus"
              onClick={() => setShowAddBill(true)}
            />
          </h2>
          <div className="tw:ml-[48px]">
            <BillRowHeader />
          </div>
          <OwnerSection
            owner="hers"
            bills={hersBills}
            categoryTransactions={sharedTransactions.hers}
            income={splitIncome.hers}
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
            rowOffset={hersBills.length}
            registerRef={registerRef}
            onUp={focusUp}
            onDown={focusDown}
            onLeft={focusLeft}
            onRight={focusRight}
          />
          <div className="tw:ml-[48px] tw:mt-[8px]">
            <button
              onClick={handleCalculateTransfer}
              className="tw:border tw:border-[#51CB20] tw:text-[#51CB20] tw:bg-transparent tw:px-3 tw:py-1 tw:text-sm tw:rounded tw:cursor-pointer tw:hover:bg-[#51CB20] tw:hover:text-[#0d0a14] tw:transition-colors tw:mb-2"
            >
              Run the Numbas!
            </button>
            <TransferRow transfers={transfers} isStale={isTransferStale} />
          </div>
        </div>
      </div>
      <div className="tw:flex tw:flex-col tw:gap-[48px]">
        <div className="tw:bg-surface tw:border tw:border-purpleBorder tw:rounded-lg tw:p-[36px] tw:pt-[24px] tw:shadow-[0_0_24px_rgba(188,19,254,0.2)]">
          <IncomeBlock />
        </div>
        <div className="tw:bg-surface tw:border tw:border-purpleBorder tw:rounded-lg tw:p-[36px] tw:pt-[24px] tw:shadow-[0_0_24px_rgba(188,19,254,0.2)]">
          <NewTransactionWidget />
        </div>
      </div>
    </div>
  );
};

export default Bills;
