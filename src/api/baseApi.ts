import { axiosAuth, axiosPublic } from '../utils/axios';

export default class BaseApi {
  axiosWithAuth;
  axiosPublic;
  endpoint;
  constructor(endpoint: string) {
    this.axiosWithAuth = axiosAuth;
    this.axiosPublic = axiosPublic;
    this.endpoint = endpoint;
  }

  get(query?: Record<string, any>) {
    const searchParams = new URLSearchParams(query).toString();
    return this.axiosWithAuth.get(`${this.endpoint}${query ? '?' + searchParams : ''}`);
  }

  getOne(id: string) {
    return this.axiosWithAuth.get(`${this.endpoint}/${id}`);
  }

  create(data: Record<string, any>) {
    return this.axiosWithAuth.post(this.endpoint, data);
  }

  update(item: any) {
    return this.axiosWithAuth.put(`${this.endpoint}/${item.id}`, item);
  }

  delete(id: string) {
    return this.axiosWithAuth.delete(`${this.endpoint}/${id}`);
  }
}
