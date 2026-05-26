import { useState } from 'react';
import { Modal, Label, Input, Select, Button, GhostButton } from '@bka-stuff/pe-mfe-utils';
import { useCreateBill } from '../../hooks/billHooks';
import { useGetAccounts } from '../../hooks/accountHooks';
import { OWNERS } from '../../config';

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const emptyForm = {
  name: '',
  owner: 'mine' as 'mine' | 'theirs',
  sourceId: '',
  description: '',
};

export default function AddBillModal({ onClose, isOpen }: Props) {
  const [form, setForm] = useState(emptyForm);
  const { data: accounts = [] } = useGetAccounts();
  const { mutate: createBill, isPending } = useCreateBill();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.sourceId) return;

    const payload: Record<string, any> = {
      name: form.name,
      owner: form.owner,
      sourceId: form.sourceId,
    };
    if (form.description) payload.description = form.description;

    createBill(payload, { onSuccess: closeModal });
  }

  function closeModal() {
    setForm(emptyForm);
    onClose();
  }

  return (
    <Modal isOpen={isOpen} close={closeModal}>
      <form onSubmit={handleSubmit} className="tw:flex tw:flex-col tw:gap-4 tw:py-[32px] tw:px-[48px]">
        <h1 className='tw:text-center tw:text-[24px]'>New Bill</h1>
        <div className="tw:flex tw:flex-col tw:gap-1">
          <Label text="Name *" />
          <Input
            name="name"
            type="text"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            autofocus
          />
        </div>

        <div className="tw:flex tw:flex-col tw:gap-1">
          <Label text="Owner *" />
          <Select
            name="owner"
            value={form.owner}
            onChange={e => setForm(f => ({ ...f, owner: e.target.value as 'mine' | 'theirs' }))}
          >
            {Object.entries(OWNERS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </Select>
        </div>

        <div className="tw:flex tw:flex-col tw:gap-1">
          <label className="tw:text-sm tw:font-medium tw:text-[#c4b5fd]">Account *</label>
          <Select
            name="sourceId"
            value={form.sourceId}
            onChange={e => setForm(f => ({ ...f, sourceId: e.target.value }))}
          >
            <option value="">Select account</option>
            {accounts.map((a: any) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </Select>
        </div>

        <div className="tw:flex tw:flex-col tw:gap-1">
          <Label text="Description" />
          <Input
            type="text"
            name="description"
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          />
        </div>

        <div className="tw:flex tw:justify-end tw:gap-2 tw:pt-2">
          <GhostButton text="Cancel" color='red' onClick={closeModal} />
          <Button
            last
            text={isPending ? 'Saving…' : 'Create'}
            color='green'
            onClick={handleSubmit}
            disabled={isPending || !form.name || !form.sourceId}
          />
        </div>
      </form>
    </Modal>
  );
}
