import { axiosAuth, axiosPublic } from '../utils/axios';
import { BaseRESTApi } from '@bka-stuff/pe-mfe-utils';

class AppBaseApi extends BaseRESTApi {
  constructor(endpoint: string) {
    super(endpoint, axiosAuth, axiosPublic);
  }
}

export default AppBaseApi;
