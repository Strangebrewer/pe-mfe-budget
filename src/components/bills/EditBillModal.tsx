import { FC, useState, useEffect } from 'react';
import {
  Modal,
  Input,
  Select,
  InputGroup,
  ModalButtons,
  ModalContent,
} from '@bka-stuff/pe-mfe-utils';
import { useUpdateBill } from '../../hooks/billHooks';
import { useGetAccounts } from '../../hooks/accountHooks';
import { OWNERS } from '../../config';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  bill: any;
};

const EditBillModal: FC<Props> = ({ isOpen, onClose, bill }) => {
  const { data: accounts = [] } = useGetAccounts();
  const { mutate: updateBill, isPending } = useUpdateBill();

  const [form, setForm] = useState({
    owner: bill.owner ?? 'mine',
    sourceId: bill.sourceId ?? '',
    description: bill.description ?? '',
    name: bill.name ?? '',
  });

  // This useEffect is necessary because bill name is editable inline and in the modal
  //  and it won't be kept in sync without this effect.
  useEffect(() => {
    setForm({
      owner: bill.owner ?? 'mine',
      sourceId: bill.sourceId ?? '',
      description: bill.description ?? '',
      name: bill.name ?? '',
    });
  }, [bill, isOpen]);

  function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    updateBill({ ...bill, ...form }, { onSuccess: onClose });
  }

  return (
    <Modal isOpen={isOpen} close={onClose}>
      <ModalContent heading="Edit Bill">
        <form onSubmit={handleSubmit} className="tw:flex tw:flex-col tw:gap-4">
          <InputGroup label="Name">
            <Input
              type="text"
              name="name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </InputGroup>

          <InputGroup label="Owner">
            <Select
              name="owner"
              value={form.owner}
              onChange={(e) =>
                setForm((f) => ({ ...f, owner: e.target.value }))
              }
            >
              {Object.entries(OWNERS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </Select>
          </InputGroup>

          <InputGroup label="Account">
            <Select
              name="sourceId"
              value={form.sourceId}
              onChange={(e) =>
                setForm((f) => ({ ...f, sourceId: e.target.value }))
              }
            >
              <option value="">Select account</option>
              {accounts
                .filter((a: any) => a.owner === form.owner)
                .map((a: any) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
            </Select>
          </InputGroup>

          <InputGroup label="Description">
            <Input
              type="text"
              name="description"
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
            />
          </InputGroup>

          <ModalButtons
            onClose={onClose}
            onConfirm={handleSubmit}
            confirmText={isPending ? 'Saving…' : 'Save'}
            isDisabled={isPending}
          />
        </form>
      </ModalContent>
    </Modal>
  );
};

export default EditBillModal;
