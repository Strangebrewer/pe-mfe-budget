import BaseApi from "./baseApi";

class TransactionApi extends BaseApi {
  constructor() {
    super('transactions');
  }
}

export default new TransactionApi();
