import axios from "axios";
import { createAuthClient } from "@bka-stuff/pe-mfe-utils";

const BASE_URL = process.env.API_URL || "http://localhost:8082";
const AUTH_URL = process.env.AUTH_URL || 'http://localhost:8080';

export const axiosAuth = axios.create({ baseURL: BASE_URL });
export const axiosPublic = axios.create({ baseURL: AUTH_URL }); // for token refresh
export const plainAxios = axios.create({ baseURL: BASE_URL }); // for unauthenticated calls

createAuthClient({
  axiosPublic,
  axiosAuth,
  onLogout: () => {
    // whatever the shell should do
    console.log("Logged out");
  },
}).attach();
