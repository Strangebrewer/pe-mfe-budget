import { FC, useState } from 'react';
import { toDisplayAmount } from '../../utils/billUtils';
import { OWNERS } from '../../config';
import { ActionButton } from '@bka-stuff/pe-mfe-utils';
import {
  calculateTransfer,
  getBillMonthForColumn,
  sumByMonth,
} from '../../utils/billUtils';
import { useBillMonthStore } from '../../state/useBillMonth';
import { SHARED_CATEGORY_NAMES } from '../../config';
import { useTransferStaleStore } from '../../state/useTransferStale';

type TransferRowProps = {
  splitIncome: Record<string, any>;
  bills: Record<string, any>;
  sharedTransactions: Record<string, any>;
};

const TransferRow: FC<TransferRowProps> = ({
  splitIncome,
  bills,
  sharedTransactions,
}) => {
  const { month, year } = useBillMonthStore();
  const [transfers, setTransfers] = useState<(number | null)[]>([
    null,
    null,
    null,
  ]);
  const { isTransferStale, clearTransferStale } = useTransferStaleStore();

  function getDisplay(transfer: number | null): string {
    if (transfer === null) return '';
    return toDisplayAmount(Math.abs(transfer));
  }

  function getDirection(transfer: number | null): string {
    if (transfer === null || transfer === 0) return '';
    return transfer > 0
      ? `${OWNERS.mine} → ${OWNERS.theirs}`
      : `${OWNERS.theirs} → ${OWNERS.mine}`;
  }

  function handleCalculateTransfer() {
    const result = [0, 1, 2].map((colIndex) => {
      const bm = getBillMonthForColumn(month, year, colIndex);

      const mineIncome = sumByMonth(splitIncome.mine, bm);
      const theirsIncome = sumByMonth(splitIncome.theirs, bm);

      const mineBills = (bills ?? []).filter((b: any) => b.owner === 'mine');
      const theirsBills = (bills ?? []).filter((b: any) => b.owner === 'theirs');

      const mineBillTotal = mineBills
        .flatMap((b: any) => b.transactions ?? [])
        .filter((t: any) => t.month === bm)
        .reduce((sum: number, t: any) => sum + t.amount, 0);

      const theirsBillTotal = theirsBills
        .flatMap((b: any) => b.transactions ?? [])
        .filter((t: any) => t.month === bm)
        .reduce((sum: number, t: any) => sum + t.amount, 0);

      const mineCategoryTotal = sumByMonth(
        SHARED_CATEGORY_NAMES.flatMap((name) => sharedTransactions.mine[name]),
        bm,
      );

      const theirsCategoryTotal = sumByMonth(
        SHARED_CATEGORY_NAMES.flatMap((name) => sharedTransactions.theirs[name]),
        bm,
      );

      return calculateTransfer(
        mineIncome,
        theirsIncome,
        mineBillTotal + mineCategoryTotal,
        theirsBillTotal + theirsCategoryTotal,
      );
    });
    setTransfers(result);
    clearTransferStale();
  }

  return (
    <div className="tw:w-[602px] tw:flex tw:bg-surface tw:text-primary tw:mb-[12px] tw:mt-[24px]">
      <div className="tw:w-[61px] tw:flex tw:justify-center">
        <ActionButton
          iconClass="fas fa-calculator"
          title="calculate transfer"
          color="green"
          onClick={handleCalculateTransfer}
        />
      </div>
      <div className="tw:w-[300px] tw:border tw:border-cellBorder tw:pl-[4px]">
        Transfer
      </div>
      {[0, 1, 2].map((colIndex) => (
        <div
          key={colIndex}
          className={`tw:w-[80px] tw:pr-[4px] tw:border tw:border-cellBorder tw:text-right${isTransferStale ? ' tw:outline tw:outline-red' : ''}`}
        >
          <div>{getDisplay(transfers[colIndex])}</div>
          <div className="tw:text-xs tw:text-purple">
            {getDirection(transfers[colIndex])}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TransferRow;
