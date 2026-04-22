import { FC, useEffect, useRef, useState } from 'react';
import { useCreateTransaction, useDeleteTransaction, useUpdateTransaction } from '../../hooks/transactionHooks';
import { toDisplayAmount, toStoredAmount } from '../../utils/billUtils';

type Props = {
  transaction?: any;
  categoryId: string;
  owner: string;
  month: string;
  descRef: (el: HTMLInputElement | null) => void;
  onEnterAmount: () => void;
  onUp: () => void;
  onLeft: () => void;
  onRight: () => void;
};

const CategoryTransactionRow: FC<Props> = ({
  transaction,
  categoryId,
  owner,
  month,
  descRef,
  onEnterAmount,
  onUp,
  onLeft,
  onRight,
}) => {
  const [desc, setDesc] = useState(transaction?.description ?? '');
  const [amount, setAmount] = useState(toDisplayAmount(transaction?.amount));
  const [amountError, setAmountError] = useState(false);

  const innerDescRef = useRef<HTMLInputElement>(null);
  const amountInputRef = useRef<HTMLInputElement>(null);
  const wasEnterFired = useRef(false);
  const isNavigatingAway = useRef(false);

  const { mutate: createTransaction } = useCreateTransaction();
  const { mutate: updateTransaction } = useUpdateTransaction();
  const { mutate: deleteTransaction } = useDeleteTransaction();

  useEffect(() => {
    setDesc(transaction?.description ?? '');
    setAmount(toDisplayAmount(transaction?.amount));
  }, [transaction?.id, transaction?.description, transaction?.amount]);

  function handleDescRef(el: HTMLInputElement | null) {
    (innerDescRef as any).current = el;
    descRef(el);
  }

  function commit(fromEnter: boolean) {
    const trimmedDesc = desc.trim();
    const trimmedAmount = amount.trim();

    if (!trimmedDesc && !trimmedAmount) {
      if (transaction) {
        deleteTransaction(transaction.id);
        if (fromEnter) onEnterAmount();
      }
      return;
    }

    if (!trimmedAmount) {
      if (fromEnter) {
        setAmountError(true);
        amountInputRef.current?.focus();
      }
      return;
    }

    setAmountError(false);
    const storedAmount = toStoredAmount(trimmedAmount);

    if (transaction) {
      const originalAmount = toStoredAmount(toDisplayAmount(transaction.amount));
      const originalDesc = transaction.description ?? '';
      if (storedAmount !== originalAmount || trimmedDesc !== originalDesc) {
        updateTransaction({ ...transaction, description: trimmedDesc, amount: storedAmount });
      }
      if (fromEnter) onEnterAmount();
    } else {
      createTransaction({
        description: trimmedDesc,
        amount: storedAmount,
        owner,
        categoryId,
        month,
        type: 'debit',
      });
      setDesc('');
      setAmount('');
      if (!isNavigatingAway.current) {
        requestAnimationFrame(() => {
          innerDescRef.current?.focus();
        });
      }
      isNavigatingAway.current = false;
    }
  }

  function handleDescKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      amountInputRef.current?.focus();
      return;
    }

    if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) return;

    e.preventDefault();

    if (desc.trim() && !amount.trim()) {
      amountInputRef.current?.focus();
      return;
    }

    if (e.key === 'ArrowRight') {
      amountInputRef.current?.focus();
    } else if (e.key === 'ArrowDown') {
      onEnterAmount();
    } else if (e.key === 'ArrowUp') {
      onUp();
    } else if (e.key === 'ArrowLeft') {
      onLeft();
    }
  }

  function handleAmountKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === 'ArrowDown') {
      e.preventDefault();
      wasEnterFired.current = true;
      commit(true);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      wasEnterFired.current = true;
      isNavigatingAway.current = true;
      commit(false);
      onUp();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      wasEnterFired.current = true;
      isNavigatingAway.current = true;
      commit(false);
      innerDescRef.current?.focus();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      wasEnterFired.current = true;
      isNavigatingAway.current = true;
      commit(false);
      onRight();
    }
  }

  function handleAmountBlur() {
    if (wasEnterFired.current) {
      wasEnterFired.current = false;
      return;
    }
    commit(false);
  }

  return (
    <div className="tw:flex">
      <input
        ref={handleDescRef}
        className="tw:w-[120px] tw:border tw:pl-[4px] tw:text-sm"
        value={desc}
        onChange={e => setDesc(e.target.value)}
        onKeyDown={handleDescKeyDown}
      />
      <input
        ref={amountInputRef}
        className={`tw:w-[60px] tw:border tw:pr-[4px] tw:text-right tw:text-sm${amountError ? ' tw:outline tw:outline-2 tw:outline-red-500' : ''}`}
        value={amount}
        onChange={e => {
          setAmount(e.target.value);
          if (amountError) setAmountError(false);
        }}
        onBlur={handleAmountBlur}
        onKeyDown={handleAmountKeyDown}
      />
    </div>
  );
};

export default CategoryTransactionRow;
