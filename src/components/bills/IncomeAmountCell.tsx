import { FC, useEffect, useRef, useState } from 'react';
import {
  useCreateTransaction,
  useDeleteTransaction,
  useUpdateTransaction,
} from '../../hooks/transactionHooks';
import { toDisplayAmount, toStoredAmount } from '../../utils/billUtils';

type Props = {
  transaction?: any;
  owner: 'mine' | 'theirs';
  month: string;
  amountRef: (el: HTMLInputElement | null) => void;
  onUp: () => void;
  onDown: () => void;
  onLeft: () => void;
  onRight: () => void;
};

const IncomeAmountCell: FC<Props> = ({
  transaction,
  owner,
  month,
  amountRef,
  onUp,
  onDown,
  onLeft,
  onRight,
}) => {
  const [amount, setAmount] = useState(toDisplayAmount(transaction?.amount));
  const wasKeyHandled = useRef(false);

  const { mutate: createTransaction } = useCreateTransaction();
  const { mutate: updateTransaction } = useUpdateTransaction();
  const { mutate: deleteTransaction } = useDeleteTransaction();

  useEffect(() => {
    setAmount(toDisplayAmount(transaction?.amount));
  }, [transaction?.id, transaction?.amount]);

  function commit() {
    const trimmed = amount.trim();

    if (!trimmed) {
      if (transaction) deleteTransaction(transaction.id);
      return;
    }

    const storedAmount = toStoredAmount(trimmed);

    if (transaction) {
      const original = toStoredAmount(toDisplayAmount(transaction.amount));
      if (storedAmount !== original) {
        updateTransaction({ ...transaction, amount: storedAmount });
      }
    } else {
      createTransaction({
        owner,
        month,
        amount: storedAmount,
        income: true,
        type: 'credit',
      });
      setAmount('');
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    const navKeys: Record<string, () => void> = {
      Enter: onDown,
      ArrowDown: onDown,
      ArrowUp: onUp,
      ArrowLeft: onLeft,
      ArrowRight: onRight,
    };

    if (e.key === 'Tab') {
      e.preventDefault();
      wasKeyHandled.current = true;
      commit();
      onRight();
    } else if (navKeys[e.key]) {
      e.preventDefault();
      wasKeyHandled.current = true;
      commit();
      navKeys[e.key]();
    }
  }

  function handleBlur() {
    if (wasKeyHandled.current) {
      wasKeyHandled.current = false;
      return;
    }
    commit();
  }

  return (
    <input
      ref={amountRef}
      className="tw:w-[80px] tw:border tw:border-cellBorder tw:pr-[4px] tw:text-right tw:text-sm tw:bg-transparent tw:text-primary tw:focus:outline-none tw:focus:bg-[#ffffff0a]"
      value={amount}
      onChange={(e) => setAmount(e.target.value)}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
    />
  );
};

export default IncomeAmountCell;
