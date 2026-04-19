import { FC, useEffect, useRef, useState } from 'react';
import { useCreateTransaction, useDeleteTransaction, useUpdateTransaction } from '../../hooks/transactionHooks';
import { toDisplayAmount, toStoredAmount } from '../../utils/billUtils';

type Props = {
  transaction?: any;
  categoryId: string;
  owner: string;
  billMonth: string;
  descRef: (el: HTMLInputElement | null) => void;
  onEnterAmount: () => void;
};

const CategoryTransactionRow: FC<Props> = ({
  transaction,
  categoryId,
  owner,
  billMonth,
  descRef,
  onEnterAmount,
}) => {
  const [desc, setDesc] = useState(transaction?.description ?? '');
  const [amount, setAmount] = useState(toDisplayAmount(transaction?.amount));
  const [amountError, setAmountError] = useState(false);

  const innerDescRef = useRef<HTMLInputElement>(null);
  const amountInputRef = useRef<HTMLInputElement>(null);
  const wasEnterFired = useRef(false);

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
        date: `${billMonth}-01`,
      });
      setDesc('');
      setAmount('');
      requestAnimationFrame(() => {
        innerDescRef.current?.focus();
      });
    }
  }

  function handleDescKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      amountInputRef.current?.focus();
    }
  }

  function handleAmountKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      wasEnterFired.current = true;
      commit(true);
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
        className="tw:w-[160px] tw:border tw:pl-[4px] tw:text-sm"
        value={desc}
        onChange={e => setDesc(e.target.value)}
        onKeyDown={handleDescKeyDown}
      />
      <input
        ref={amountInputRef}
        className={`tw:w-[80px] tw:border tw:pr-[4px] tw:text-right tw:text-sm${amountError ? ' tw:outline tw:outline-2 tw:outline-red-500' : ''}`}
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
