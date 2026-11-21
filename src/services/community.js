import { API_BASE_URL } from "../config/env";
import { api } from "../utils/axiosConfig";

const base = `${API_BASE_URL}/api`;
const get = async (path, config) => (await api.get(`${base}${path}`, config)).data;
const author = (id) => `/authors/${encodeURIComponent(id)}`;

export const fetchAuthor = (id, signal) => get(author(id), { signal });
export const fetchFormulaAuthor = (id, signal) =>
  get(`/authors/by-formula/${encodeURIComponent(id)}`, { signal });
export const fetchAuthorFormulas = (id, page, signal) =>
  get(`${author(id)}/formulas`, { params: { page, size: 12 }, signal });
export const saveAuthor = async (fields) => (await api.put(`${base}/authors/me`, fields)).data;
export const setFollowing = (id, enabled) =>
  api[enabled ? "put" : "delete"](`${base}${author(id)}/follow`);

export const fetchFormulaDetail = (id, signal) =>
  get(`/formulas/${encodeURIComponent(id)}`, { signal });
export const recordFormulaView = (id) => api.post(`${base}/formulas/${encodeURIComponent(id)}/views`);
export const submitReport = (target, id, payload) => {
  const path = target === "comment" ? "comments/" : "";
  return api.post(`${base}/formulas/${path}${encodeURIComponent(id)}/reports`, payload);
};
export const fetchReports = (page, signal) =>
  get("/formulas/admin/reports", { params: { page }, signal });
export const resolveReport = (id, decision, reason) =>
  api.put(`${base}/formulas/admin/reports/${encodeURIComponent(id)}`, { decision, reason });

export const fetchNotifications = (page, signal) => get("/notifications", { params: { page }, signal });
export const readNotification = (id) => api.put(`${base}/notifications/${encodeURIComponent(id)}/read`);
