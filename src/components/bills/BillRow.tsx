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
  onEnter: (rowIndex: number, colIndex: number) => void;
}

const BillRow: FC<BillRowProps> = ({ bill, rowIndex, month, year, registerRef, onEnter }) => {
  const transactions: any[] = bill?.transactions ?? [];
  const { mutate: payBill } = usePayBill();
  const { mutate: updateTransaction } = useUpdateTransaction();
  const { mutate: deleteTransaction } = useDeleteTransaction();
  const wasEnterFired = useRef(false);

  function getTransactionForColumn(colIndex: number) {
    return transactions.find(t => t.billMonth === getBillMonthForColumn(month, year, colIndex));
  }

  const [values, setValues] = useState<string[]>([
    toDisplayAmount(getTransactionForColumn(0)?.amount),
    toDisplayAmount(getTransactionForColumn(1)?.amount),
    toDisplayAmount(getTransactionForColumn(2)?.amount),
  ]);

  useEffect(() => {
    setValues([
      toDisplayAmount(getTransactionForColumn(0)?.amount),
      toDisplayAmount(getTransactionForColumn(1)?.amount),
      toDisplayAmount(getTransactionForColumn(2)?.amount),
    ]);
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
      const today = new Date().toISOString().split('T')[0];
      payBill({
        billId: bill.id,
        amount,
        billMonth: getBillMonthForColumn(month, year, colIndex),
        date: today,
      });
    }
  }

  function handleKeyDown(colIndex: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      wasEnterFired.current = true;
      save(colIndex);
      onEnter(rowIndex, colIndex);
    }
  }

  function handleBlur(colIndex: number) {
    if (wasEnterFired.current) {
      wasEnterFired.current = false;
      return;
    }
    save(colIndex);
  }

  return (
    <div className="tw:w-[850px] tw:flex">
      <div className="tw:w-[300px] tw:border tw:pl-[4px]">{bill.name}</div>
      {[0, 1, 2].map(colIndex => (
        <input
          key={colIndex}
          ref={el => registerRef(rowIndex, colIndex, el)}
          className="tw:w-[80px] tw:pr-[4px] tw:border tw:text-right"
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
