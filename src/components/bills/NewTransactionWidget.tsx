import { Button, Card, Input, Label, Select } from '@bka-stuff/pe-mfe-utils';
import { useState } from 'react';
import { OWNERS } from '../../config';
import { useGetAccounts } from '../../hooks/accountHooks';
import { useCreateTransaction } from '../../hooks/transactionHooks';
import { toStoredAmount } from '../../utils/billUtils';

type Props = {
  categories: Record<string, any>[];
};

const NewTransactionWidget = ({ categories }: Props) => {
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [owner, setOwner] = useState<'mine' | 'hers'>('mine');
  const [sourceId, setSourceId] = useState('');
  const [month, setMonth] = useState(() =>
    new Date().toISOString().slice(0, 7),
  );
  const [description, setDescription] = useState('');
  const [shared, setShared] = useState(false);
  const [focusKey, setFocusKey] = useState(0);

  const { data: accounts = [] } = useGetAccounts();
  const { mutate: createTransaction } = useCreateTransaction();

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const parsed = parseFloat(amount);
    if (!amount || isNaN(parsed)) return;

    const payload: Record<string, any> = {
      amount: toStoredAmount(amount),
      month,
      owner,
      shared,
      type: 'debit',
    };
    if (categoryId) payload.categoryId = categoryId;
    if (sourceId) payload.sourceId = sourceId;
    if (description) payload.description = description;

    createTransaction(payload, {
      onSuccess: () => {
        setAmount('');
        setFocusKey((k) => k + 1);
      },
    });
  }

  return (
    <Card heading="New Transaction" size="lg">
      <form onSubmit={handleSave} className="tw:flex tw:flex-col tw:gap-1">
        <div className="tw:flex tw:flex-col tw:gap-1">
          <Label text="Amount" />
          <Input
            key={focusKey}
            name="amount"
            type="text"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            full
            autofocus
          />
        </div>

        <div className="tw:flex tw:flex-col tw:gap-1">
          <Label text="Description" />
          <Input
            name="description"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            full
          />
        </div>

        <div className="tw:flex tw:flex-col tw:gap-1">
          <Label text="Category" />
          <Select
            name="category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            full
          >
            <option value="">Select a category</option>
            {categories.map((c: any) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>

        <div className="tw:flex tw:items-center tw:justify-evenly tw:py-[8px]">
          <div className="tw:flex tw:items-center">
            <Label text="Owner" />
            <div className="tw:flex tw:pl-[12px]">
              {Object.entries(OWNERS).map(([key, label], i) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setOwner(key as 'mine' | 'hers');
                    setSourceId('');
                  }}
                  className={`tw:border tw:border-purple tw:px-2 tw:py-[1px] tw:font-bold tw:text-sm tw:cursor-pointer tw:transition-colors ${i === 0 ? 'tw:rounded-l' : 'tw:rounded-r'} ${owner === key ? 'tw:bg-purple tw:text-bg' : 'tw:bg-transparent tw:text-purple'}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="tw:flex tw:items-center tw:gap-3">
            <Label text="Shared:" />
            <input
              type="checkbox"
              checked={shared}
              onChange={(e) => setShared(e.target.checked)}
            />
          </div>
        </div>

        <div className="tw:flex tw:flex-col tw:gap-1">
          <Label text="Source" />
          <Select
            name="source"
            value={sourceId}
            onChange={(e) => setSourceId(e.target.value)}
            full
          >
            <option value="">Select a source</option>
            {accounts
              .filter((a: any) => a.owner === owner)
              .map((a: any) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
          </Select>
        </div>

        <div className="tw:flex tw:flex-col tw:gap-1">
          <Label text="Month" />
          <Input
            name="month"
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            full
          />
        </div>

        <div className="tw:flex tw:justify-end tw:pt-[8px]">
          <Button last text="Save" color="purple" type="submit" />
        </div>
      </form>
    </Card>
  );
};

export default NewTransactionWidget;
