import BaseApi from "./baseApi";

class BillApi extends BaseApi {
  constructor() {
    super('bills');
  }

  payBill(billId: string, data: Record<string, any>) {
    return this.axiosWithAuth.post(`${this.endpoint}/${billId}/pay`, data);
  }
}

export default new BillApi();
