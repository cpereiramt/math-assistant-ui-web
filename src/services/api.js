import { API_BASE_URL } from "../config/env";
import { api } from "../utils/axiosConfig";
const BASE_URL = `${API_BASE_URL}/api/formulas`;

export const fetchFormulas = async () => {
  const res = await api.get(`${BASE_URL}/getAll`);
  return await res.data;
};

export const executeFormula = async (name, body) => {
  const res = await api.post(`${BASE_URL}/execute?formulaName=${name}`, body);
  return await res.data;
};

export const deleteFormula = async (id) => {
  await api.delete(`${BASE_URL}/${id}`);
};
