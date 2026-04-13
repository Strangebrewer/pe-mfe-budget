import BaseApi from "./baseApi";

class AccountApi extends BaseApi {
  constructor() {
    super('accounts');
  }
}

export default new AccountApi();
