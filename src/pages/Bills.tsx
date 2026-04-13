import { FC, useRef } from "react";
import { useGetBills } from "../hooks/billHooks";
import { useBillMonthStore } from "../state/useBillMonth";
import BillRowHeader from "../components/bills/BillRowHeader";
import BillRow from "../components/bills/BillRow";

const TRANSACTION_COL_COUNT = 3;

const Bills: FC = () => {
  const { billMonth, month, year } = useBillMonthStore();
  const cellRefs = useRef<Array<Array<HTMLInputElement | null>>>([]);
  const { data: bills } = useGetBills(billMonth);

  function registerRef(rowIndex: number, colIndex: number, el: HTMLInputElement | null) {
    if (!cellRefs.current[rowIndex]) {
      cellRefs.current[rowIndex] = new Array(TRANSACTION_COL_COUNT).fill(null);
    }
    cellRefs.current[rowIndex][colIndex] = el;
  }

  function focusNextRow(rowIndex: number, colIndex: number) {
    cellRefs.current[rowIndex + 1]?.[colIndex]?.focus();
  }

  return (
    <div>
      <h2>Bills</h2>
      <div className="tw:ml-[48px]">
        <BillRowHeader />
      </div>
      <div className="tw:flex">
        <div className="tw:w-[48px] tw:flex tw:border tw:bg-[pink]">
          <p className="tw:m-auto">Hers</p>
        </div>
        <div className="tw:grow">
          {bills?.length ? bills
            .filter((b: any) => b.owner === 'hers')
            .map((b: any, i: number) => (
              <BillRow
                key={b.id}
                bill={b}
                rowIndex={i}
                month={month}
                year={year}
                registerRef={registerRef}
                onEnter={focusNextRow}
              />
            )) : null}
        </div>
      </div>
      <div className="tw:flex">
        <div className="tw:w-[48px] tw:flex tw:border tw:bg-[blue]">
          <p className="tw:m-auto">Mine</p>
        </div>
        <div className="tw:grow">
          {bills?.length ? bills
            .filter((b: any) => b.owner === 'mine')
            .map((b: any, i: number) => (
              <BillRow
                key={b.id}
                bill={b}
                rowIndex={i}
                month={month}
                year={year}
                registerRef={registerRef}
                onEnter={focusNextRow}
              />
            )) : null}
        </div>
      </div>
    </div>
  );
};

export default Bills;
