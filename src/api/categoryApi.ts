import BaseApi from "./baseApi";

class CategoryApi extends BaseApi {
  constructor() {
    super('categories');
  }
}

export default new CategoryApi();
