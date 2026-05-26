import { FC, useEffect, useRef, useState } from 'react';
import { ActionButton, DeleteConfirmationModal } from '@bka-stuff/pe-mfe-utils';
import {
  useDeleteBill,
  usePayBill,
  useUpdateBill,
} from '../../hooks/billHooks';
import {
  useDeleteTransaction,
  useUpdateTransaction,
} from '../../hooks/transactionHooks';
import {
  getBillMonthForColumn,
  toDisplayAmount,
  toStoredAmount,
} from '../../utils/billUtils';
import EditBillModal from './EditBillModal';

type BillRowProps = {
  bill: Record<string, any>;
  rowIndex: number;
  month: number;
  year: number;
  registerRef: (
    rowIndex: number,
    colIndex: number,
    el: HTMLInputElement | null,
  ) => void;
  onUp: (rowIndex: number, colIndex: number) => void;
  onDown: (rowIndex: number, colIndex: number) => void;
  onLeft: (rowIndex: number, colIndex: number) => void;
  onRight: (rowIndex: number, colIndex: number) => void;
};

const BillRow: FC<BillRowProps> = ({
  bill,
  rowIndex,
  month,
  year,
  registerRef,
  onUp,
  onDown,
  onLeft,
  onRight,
}) => {
  const transactions: any[] = bill?.transactions ?? [];
  const { mutate: payBill } = usePayBill();
  const { mutate: updateTransaction } = useUpdateTransaction();
  const { mutate: deleteTransaction } = useDeleteTransaction();
  const { mutate: updateBill } = useUpdateBill();
  const { mutate: deleteBill } = useDeleteBill();
  const wasKeyHandled = useRef(false);

  const [nameValue, setNameValue] = useState(bill.name ?? '');
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  useEffect(() => {
    setNameValue(bill.name ?? '');
  }, [bill]);

  function getTransactionForColumn(colIndex: number) {
    return transactions.find(
      (t) => t.month === getBillMonthForColumn(month, year, colIndex),
    );
  }

  function getColumnValues() {
    return [0, 1, 2].map((i) =>
      toDisplayAmount(getTransactionForColumn(i)?.amount),
    );
  }

  const [values, setValues] = useState<string[]>(getColumnValues);

  useEffect(() => {
    setValues(getColumnValues());
  }, [bill]);

  function handleChange(colIndex: number, value: string) {
    setValues((prev) => {
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

  function handleKeyDown(
    colIndex: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) {
    const navKeys: Record<string, () => void> = {
      Enter: () => onDown(rowIndex, colIndex),
      ArrowDown: () => onDown(rowIndex, colIndex),
      ArrowUp: () => onUp(rowIndex, colIndex),
      ArrowLeft: () => onLeft(rowIndex, colIndex),
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

  function handleNameBlur() {
    const trimmed = nameValue.trim();
    if (!trimmed || trimmed === bill.name) return;
    updateBill({ ...bill, name: trimmed });
  }

  return (
    <>
      <div className="tw:w-[540px] tw:flex">
        <div className="tw:w-[300px] tw:flex tw:border tw:border-cellBorder">
          <input
            className="tw:flex-1 tw:min-w-0 tw:pl-[4px] tw:bg-transparent tw:text-primary tw:focus:outline-none tw:focus:bg-[#ffffff0a]"
            value={nameValue}
            onChange={(e) => setNameValue(e.target.value)}
            onBlur={handleNameBlur}
          />
          <div className="tw:flex tw:items-center tw:pr-[2px] tw:gap-[4px]">
            <ActionButton
              size="sm"
              title="edit bill"
              color="blue"
              iconClass="fas fa-pen"
              onClick={() => setShowEdit(true)}
            />
            <ActionButton
              size="sm"
              title="delete bill"
              color="red"
              iconClass="fas fa-trash"
              onClick={() => setShowDelete(true)}
            />
          </div>
        </div>
        {[0, 1, 2].map((colIndex) => (
          <input
            key={colIndex}
            ref={(el) => registerRef(rowIndex, colIndex, el)}
            className="tw:w-[80px] tw:pr-[4px] tw:border tw:border-cellBorder tw:text-right tw:bg-transparent tw:text-primary tw:focus:outline-none tw:focus:bg-[#ffffff0a]"
            value={values[colIndex]}
            onChange={(e) => handleChange(colIndex, e.target.value)}
            onBlur={() => handleBlur(colIndex)}
            onKeyDown={(e) => handleKeyDown(colIndex, e)}
          />
        ))}
      </div>
      <EditBillModal
        isOpen={showEdit}
        onClose={() => setShowEdit(false)}
        bill={bill}
      />
      <DeleteConfirmationModal
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={() => deleteBill(bill.id)}
        name={bill.name}
      />
    </>
  );
};

export default BillRow;
