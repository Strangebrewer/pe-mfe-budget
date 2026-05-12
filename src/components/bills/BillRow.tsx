import { FC, useEffect, useRef, useState } from "react";
import { usePayBill } from "../../hooks/billHooks";
import { useDeleteTransaction, useUpdateTransaction } from "../../hooks/transactionHooks";
import { getBillMonthForColumn, toDisplayAmount, toStoredAmount } from "../../utils/billUtils";

type BillRowProps = {
  bill: Record<string, any>;
  rowIndex: number;
  month: number;
  year: number;
  registerRef: (rowIndex: number, colIndex: number, el: HTMLInputElement | null) => void;
  onUp: (rowIndex: number, colIndex: number) => void;
  onDown: (rowIndex: number, colIndex: number) => void;
  onLeft: (rowIndex: number, colIndex: number) => void;
  onRight: (rowIndex: number, colIndex: number) => void;
}

const BillRow: FC<BillRowProps> = ({ bill, rowIndex, month, year, registerRef, onUp, onDown, onLeft, onRight }) => {
  const transactions: any[] = bill?.transactions ?? [];
  const { mutate: payBill } = usePayBill();
  const { mutate: updateTransaction } = useUpdateTransaction();
  const { mutate: deleteTransaction } = useDeleteTransaction();
  const wasKeyHandled = useRef(false);

  function getTransactionForColumn(colIndex: number) {
    return transactions.find(t => t.month === getBillMonthForColumn(month, year, colIndex));
  }

  function getColumnValues() {
    return [0, 1, 2].map(i => toDisplayAmount(getTransactionForColumn(i)?.amount));
  }

  const [values, setValues] = useState<string[]>(getColumnValues);

  useEffect(() => {
    setValues(getColumnValues());
  }, [bill]);

  function handleChange(colIndex: number, value: string) {
    setValues(prev => {
      const next = [...prev];
      next[colIndex] = value;
      return next;
    });
  }

  function save(colIndex: number) {
    const existing = values[colIndex].trim();
    const transaction = getTransactionForColumn(colIndex);

    if (!existing) {
      if (transaction) deleteTransaction(transaction.id);
      return;
    }

    const amount = toStoredAmount(existing);

    if (transaction) {
      const original = toStoredAmount(toDisplayAmount(transaction.amount));
      if (amount === original) return;
      updateTransaction({ ...transaction, amount });
    } else {
      payBill({
        billId: bill.id,
        amount,
        month: getBillMonthForColumn(month, year, colIndex),
      });
    }
  }

  function handleKeyDown(colIndex: number, e: React.KeyboardEvent<HTMLInputElement>) {
    const navKeys: Record<string, () => void> = {
      Enter:      () => onDown(rowIndex, colIndex),
      ArrowDown:  () => onDown(rowIndex, colIndex),
      ArrowUp:    () => onUp(rowIndex, colIndex),
      ArrowLeft:  () => onLeft(rowIndex, colIndex),
      ArrowRight: () => onRight(rowIndex, colIndex),
    };

    if (navKeys[e.key]) {
      e.preventDefault();
      wasKeyHandled.current = true;
      save(colIndex);
      navKeys[e.key]();
    }
  }

  function handleBlur(colIndex: number) {
    if (wasKeyHandled.current) {
      wasKeyHandled.current = false;
      return;
    }
    save(colIndex);
  }

  return (
    <div className="tw:w-[540px] tw:flex">
      <div className="tw:w-[300px] tw:border tw:border-cellBorder tw:pl-[4px]">{bill.name}</div>
      {[0, 1, 2].map(colIndex => (
        <input
          key={colIndex}
          ref={el => registerRef(rowIndex, colIndex, el)}
          className="tw:w-[80px] tw:pr-[4px] tw:border tw:border-cellBorder tw:text-right tw:bg-transparent tw:text-primary tw:focus:outline-none tw:focus:bg-[#ffffff0a]"
          value={values[colIndex]}
          onChange={e => handleChange(colIndex, e.target.value)}
          onBlur={() => handleBlur(colIndex)}
          onKeyDown={e => handleKeyDown(colIndex, e)}
        />
      ))}
    </div>
  );
};

export default BillRow;
