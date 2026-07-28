import BaseApig from './baseApi';

class AccountApi extends BaseApig {
  constructor() {
    super('accounts');
  }
}

export default new AccountApi();
