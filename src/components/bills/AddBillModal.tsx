import { useState } from 'react';
import Modal from '../Modal';
import { useCreateBill } from '../../hooks/billHooks';
import { useGetAccounts } from '../../hooks/accountHooks';
import { useGetCategories } from '../../hooks/categoryHooks';
import { OWNERS } from '../../config';

type Props = {
  onClose: () => void;
};

const emptyForm = {
  name: '',
  owner: 'mine' as 'mine' | 'hers',
  sourceId: '',
  categoryId: '',
  dueDay: '',
  description: '',
  shared: false,
};

export default function AddBillModal({ onClose }: Props) {
  const [form, setForm] = useState(emptyForm);
  const { data: accounts = [] } = useGetAccounts();
  const { data: categories = [] } = useGetCategories();
  const { mutate: createBill, isPending } = useCreateBill();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.sourceId) return;

    const payload: Record<string, any> = {
      name: form.name,
      owner: form.owner,
      sourceId: form.sourceId,
      shared: form.shared,
    };
    if (form.categoryId) payload.categoryId = form.categoryId;
    if (form.dueDay) payload.dueDay = parseInt(form.dueDay, 10);
    if (form.description) payload.description = form.description;

    createBill(payload, { onSuccess: onClose });
  }

  return (
    <Modal title="New Bill" onClose={onClose}>
      <form onSubmit={handleSubmit} className="tw:flex tw:flex-col tw:gap-4">
        <div className="tw:flex tw:flex-col tw:gap-1">
          <label className="tw:text-sm tw:font-medium tw:text-gray-700">Name *</label>
          <input
            type="text"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            className="tw:border tw:rounded tw:px-3 tw:py-2 tw:text-sm"
            required
            autoFocus
          />
        </div>

        <div className="tw:flex tw:flex-col tw:gap-1">
          <label className="tw:text-sm tw:font-medium tw:text-gray-700">Owner *</label>
          <select
            value={form.owner}
            onChange={e => setForm(f => ({ ...f, owner: e.target.value as 'mine' | 'hers' }))}
            className="tw:border tw:rounded tw:px-3 tw:py-2 tw:text-sm"
          >
            {Object.entries(OWNERS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>

        <div className="tw:flex tw:flex-col tw:gap-1">
          <label className="tw:text-sm tw:font-medium tw:text-gray-700">Account *</label>
          <select
            value={form.sourceId}
            onChange={e => setForm(f => ({ ...f, sourceId: e.target.value }))}
            className="tw:border tw:rounded tw:px-3 tw:py-2 tw:text-sm"
            required
          >
            <option value="">Select account</option>
            {accounts.map((a: any) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </div>

        <div className="tw:flex tw:flex-col tw:gap-1">
          <label className="tw:text-sm tw:font-medium tw:text-gray-700">Category</label>
          <select
            value={form.categoryId}
            onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}
            className="tw:border tw:rounded tw:px-3 tw:py-2 tw:text-sm"
          >
            <option value="">None</option>
            {categories.map((c: any) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="tw:flex tw:flex-col tw:gap-1">
          <label className="tw:text-sm tw:font-medium tw:text-gray-700">Due Day</label>
          <input
            type="number"
            min={1}
            max={31}
            value={form.dueDay}
            onChange={e => setForm(f => ({ ...f, dueDay: e.target.value }))}
            className="tw:border tw:rounded tw:px-3 tw:py-2 tw:text-sm tw:w-24"
            placeholder="1–31"
          />
        </div>

        <div className="tw:flex tw:flex-col tw:gap-1">
          <label className="tw:text-sm tw:font-medium tw:text-gray-700">Description</label>
          <input
            type="text"
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            className="tw:border tw:rounded tw:px-3 tw:py-2 tw:text-sm"
          />
        </div>

        <label className="tw:flex tw:items-center tw:gap-2 tw:text-sm tw:text-gray-700">
          <input
            type="checkbox"
            checked={form.shared}
            onChange={e => setForm(f => ({ ...f, shared: e.target.checked }))}
          />
          Shared
        </label>

        <div className="tw:flex tw:justify-end tw:gap-2 tw:pt-2">
          <button
            type="button"
            onClick={onClose}
            className="tw:px-4 tw:py-2 tw:text-sm tw:border tw:rounded tw:text-gray-700 tw:hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending || !form.name || !form.sourceId}
            className="tw:px-4 tw:py-2 tw:text-sm tw:bg-blue-600 tw:text-white tw:rounded tw:hover:bg-blue-700 tw:disabled:opacity-50"
          >
            {isPending ? 'Saving…' : 'Create'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
