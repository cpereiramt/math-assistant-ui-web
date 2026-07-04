import { API_BASE_URL } from "../config/env";
import { api } from "../utils/axiosConfig";
const BASE_URL = `${API_BASE_URL}/api/formulas`;

export const fetchFormulas = async () => {
  const res = await api.get(`${BASE_URL}/public`);
  return await res.data;
};

export const fetchMyFormulas = async () => {
  const res = await api.get(`${BASE_URL}/mine`);
  return await res.data;
};

export const fetchMyFormula = async (id) => {
  const res = await api.get(`${BASE_URL}/mine/${id}`);
  return await res.data;
};

export const validateMyFormula = async (body) => {
  const res = await api.post(`${BASE_URL}/mine/validate`, body);
  return await res.data;
};

export const createMyFormula = async (body) => {
  const res = await api.post(`${BASE_URL}/mine`, body);
  return await res.data;
};

export const updateMyFormula = async (id, body) => {
  const res = await api.put(`${BASE_URL}/mine/${id}`, body);
  return await res.data;
};

export const deleteMyFormula = async (id) => {
  const res = await api.delete(`${BASE_URL}/mine/${id}`);
  return await res.data;
};

export const executeFormula = async (body) => {
  const res = await api.post(`${BASE_URL}/execute`, body);
  return await res.data;
};

export const executeMyFormula = async (body) => {
  const res = await api.post(`${BASE_URL}/mine/execute`, body);
  return await res.data;
};

export const deleteFormula = async (id) => {
  await api.delete(`${BASE_URL}/${id}`);
};
