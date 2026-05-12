import { Input, Label } from '@bka-stuff/pe-mfe-utils';
import { useState } from 'react';

type Props = {
  categories: Record<string, any>[];
};

const NewTransactionWidget = () => {
  const [amount, setAmount] = useState('');

  function saveTransaction() {}

  return (
    <div>
      <h2>New Transaction</h2>
      <form onSubmit={saveTransaction}>
        <Label text="Amount" />
        <Input
          name="transaction"
          type="text"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          full
          autofocus
        />
        <button hidden type="submit"></button>
      </form>
    </div>
  );
};

export default NewTransactionWidget;
