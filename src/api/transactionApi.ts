import BaseApig from './baseApi';

class TransactionApi extends BaseApig {
  constructor() {
    super('transactions');
  }
}

export default new TransactionApi();
