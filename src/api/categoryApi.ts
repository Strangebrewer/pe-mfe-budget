import BaseApig from './baseApi';

class CategoryApi extends BaseApig {
  constructor() {
    super('categories');
  }
}

export default new CategoryApi();
