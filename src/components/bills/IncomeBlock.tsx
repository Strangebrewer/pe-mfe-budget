import { FC, useRef } from 'react';
import { format, subMonths } from 'date-fns';
import { useBillMonthStore } from '../../state/useBillMonth';
import { useGetTransactions } from '../../hooks/transactionHooks';
import { getBillMonthForColumn, toDisplayAmount } from '../../utils/billUtils';
import IncomeAmountCell from './IncomeAmountCell';
import { Card } from '@bka-stuff/pe-mfe-utils';

const IncomeBlock: FC = () => {
  const { billMonth, month, year } = useBillMonthStore();
  const { data: transactions = [] } = useGetTransactions({
    month: billMonth,
    income: true,
  });

  const cols = [0, 1, 2].map((colIdx) =>
    getBillMonthForColumn(month, year, colIdx),
  );

  function getMonthLabel(colIdx: number): string {
    const base = new Date(year, month - 1);
    const date = colIdx === 2 ? base : subMonths(base, 2 - colIdx);
    return format(date, 'MMM');
  }

  function getOwnerColTransactions(
    owner: 'mine' | 'theirs',
    colIdx: number,
  ): any[] {
    return transactions
      .filter((t: any) => t.month === cols[colIdx] && t.owner === owner)
      .sort((a: any, b: any) => (a.id < b.id ? -1 : 1));
  }

  const theirsByCol = [0, 1, 2].map((colIdx) =>
    getOwnerColTransactions('theirs', colIdx),
  );
  const mineByCol = [0, 1, 2].map((colIdx) =>
    getOwnerColTransactions('mine', colIdx),
  );

  const maxTheirsRows = Math.max(0, ...theirsByCol.map((t) => t.length)) + 1;
  const maxMineRows = Math.max(0, ...mineByCol.map((t) => t.length)) + 1;

  const theirsRefs = useRef<(HTMLInputElement | null)[][]>([]);
  const mineRefs = useRef<(HTMLInputElement | null)[][]>([]);

  function registerRef(
    refs: React.MutableRefObject<(HTMLInputElement | null)[][]>,
    rowIdx: number,
    colIdx: number,
  ) {
    return (el: HTMLInputElement | null) => {
      if (!refs.current[rowIdx]) refs.current[rowIdx] = [null, null, null];
      refs.current[rowIdx][colIdx] = el;
    };
  }

  function handleDown(
    refs: React.MutableRefObject<(HTMLInputElement | null)[][]>,
    rowIdx: number,
    colIdx: number,
  ) {
    refs.current[rowIdx + 1]?.[colIdx]?.focus();
  }

  function handleUp(
    refs: React.MutableRefObject<(HTMLInputElement | null)[][]>,
    rowIdx: number,
    colIdx: number,
  ) {
    refs.current[rowIdx - 1]?.[colIdx]?.focus();
  }

  function handleRight(
    refs: React.MutableRefObject<(HTMLInputElement | null)[][]>,
    rowIdx: number,
    colIdx: number,
  ) {
    if (colIdx < 2) {
      refs.current[rowIdx]?.[colIdx + 1]?.focus();
    } else {
      refs.current[rowIdx + 1]?.[0]?.focus();
    }
  }

  function handleLeft(
    refs: React.MutableRefObject<(HTMLInputElement | null)[][]>,
    rowIdx: number,
    colIdx: number,
  ) {
    if (colIdx > 0) {
      refs.current[rowIdx]?.[colIdx - 1]?.focus();
    } else {
      refs.current[rowIdx - 1]?.[2]?.focus();
    }
  }

  function getTotal(byCol: any[][], colIdx: number): string {
    const total = byCol[colIdx].reduce((sum, t) => sum + t.amount, 0);
    return total ? toDisplayAmount(total) : '';
  }

  function renderRows(
    byCol: any[][],
    owner: 'mine' | 'theirs',
    refs: React.MutableRefObject<(HTMLInputElement | null)[][]>,
    maxRows: number,
    onBoundaryDown?: (colIdx: number) => void,
    onBoundaryUp?: (colIdx: number) => void,
    onBoundaryRight?: () => void,
    onBoundaryLeft?: () => void,
  ) {
    return Array.from({ length: maxRows }, (_, rowIdx) => (
      <div key={rowIdx} className="tw:flex">
        {[0, 1, 2].map((colIdx) => (
          <IncomeAmountCell
            key={colIdx}
            transaction={byCol[colIdx][rowIdx]}
            owner={owner}
            month={cols[colIdx]}
            amountRef={registerRef(refs, rowIdx, colIdx)}
            onUp={() =>
              rowIdx > 0
                ? handleUp(refs, rowIdx, colIdx)
                : onBoundaryUp?.(colIdx)
            }
            onDown={() =>
              rowIdx < maxRows - 1
                ? handleDown(refs, rowIdx, colIdx)
                : onBoundaryDown?.(colIdx)
            }
            onLeft={() =>
              rowIdx === 0 && colIdx === 0
                ? onBoundaryLeft?.()
                : handleLeft(refs, rowIdx, colIdx)
            }
            onRight={() =>
              rowIdx === maxRows - 1 && colIdx === 2
                ? onBoundaryRight?.()
                : handleRight(refs, rowIdx, colIdx)
            }
          />
        ))}
      </div>
    ));
  }

  const sidebarBase =
    'tw:w-[80px] tw:flex tw:items-center tw:justify-center tw:border-r tw:text-sm tw:font-semibold';

  return (
    <Card heading="Income">
      <div className="tw:flex">
        <div className="tw:w-[80px]" />
        {[0, 1, 2].map((colIdx) => (
          <div
            key={colIdx}
            className="tw:w-[80px] tw:text-right tw:pr-[4px] tw:font-semibold tw:text-sm tw:text-muted"
          >
            {getMonthLabel(colIdx)}
          </div>
        ))}
      </div>

      <div className="tw:flex tw:bg-surface tw:text-primary">
        <div className="tw:w-[80px] tw:text-sm tw:pl-[4px] tw:text-red">
          Their Total
        </div>
        {[0, 1, 2].map((colIdx) => (
          <div
            key={colIdx}
            className="tw:w-[80px] tw:border tw:border-cellBorder tw:text-right tw:pr-[4px] tw:text-sm"
          >
            {getTotal(theirsByCol, colIdx)}
          </div>
        ))}
      </div>

      <div className="tw:flex tw:bg-surface tw:text-primary tw:mb-[12px]">
        <div className="tw:w-[80px] tw:text-sm tw:pl-[4px] tw:text-blue">
          My Total
        </div>
        {[0, 1, 2].map((colIdx) => (
          <div
            key={colIdx}
            className="tw:w-[80px] tw:border tw:border-cellBorder tw:text-right tw:pr-[4px] tw:text-sm"
          >
            {getTotal(mineByCol, colIdx)}
          </div>
        ))}
      </div>

      <div className="tw:flex tw:border tw:border-red tw:rounded-l tw:mb-[12px]">
        <div className={`${sidebarBase} tw:border-red tw:text-red`}>Theirs</div>
        <div>
          {renderRows(
            theirsByCol,
            'theirs',
            theirsRefs,
            maxTheirsRows,
            (colIdx) => mineRefs.current[0]?.[colIdx]?.focus(),
            undefined,
            () => mineRefs.current[0]?.[0]?.focus(),
          )}
        </div>
      </div>

      <div className="tw:flex tw:border tw:border-blue tw:rounded-l">
        <div className={`${sidebarBase} tw:border-blue tw:text-blue`}>Mine</div>
        <div>
          {renderRows(
            mineByCol,
            'mine',
            mineRefs,
            maxMineRows,
            undefined,
            (colIdx) => theirsRefs.current[maxTheirsRows - 1]?.[colIdx]?.focus(),
            undefined,
            () => theirsRefs.current[maxTheirsRows - 1]?.[2]?.focus(),
          )}
        </div>
      </div>
    </Card>
  );
};

export default IncomeBlock;
