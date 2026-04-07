import BaseApi from "./baseApi";

class ThingApi extends BaseApi {
  constructor() {
    super('things');
  }
}

export default new ThingApi();
