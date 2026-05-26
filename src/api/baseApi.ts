import { axiosAuth, axiosPublic } from "../utils/axios";

export default class BaseApi {
  axiosWithAuth;
  axiosPublic;
  endpoint;
  constructor(endpoint: string) {
    this.axiosWithAuth = axiosAuth;
    this.axiosPublic = axiosPublic;
    this.endpoint = endpoint;
  }

  get(query?: Record<string, any>, traceId?: string) {
    const searchParams = new URLSearchParams(query).toString();
    const headers: Record<string, any> = {};
    if (traceId) headers["X-Trace-ID"] = traceId;
    return this.axiosWithAuth.get(
      `${this.endpoint}${query ? "?" + searchParams : ""}`,
      { headers },
    );
  }

  getOne(id: string, traceId?: string) {
    const headers: Record<string, any> = {};
    if (traceId) headers["X-Trace-ID"] = traceId;
    return this.axiosWithAuth.get(`${this.endpoint}/${id}`, { headers });
  }

  create(data: Record<string, any>, traceId?: string) {
    const headers: Record<string, any> = {};
    if (traceId) headers["X-Trace-ID"] = traceId;
    return this.axiosWithAuth.post(this.endpoint, data, { headers });
  }

  update(item: any, traceId?: string) {
    const headers: Record<string, any> = {};
    if (traceId) headers["X-Trace-ID"] = traceId;
    return this.axiosWithAuth.put(`${this.endpoint}/${item.id}`, item, {
      headers,
    });
  }

  delete(id: string, traceId?: string) {
    const headers: Record<string, any> = {};
    if (traceId) headers["X-Trace-ID"] = traceId;
    return this.axiosWithAuth.delete(`${this.endpoint}/${id}`, { headers });
  }
}
