import { API_BASE_URL } from "../config/env";
import { api } from "../utils/axiosConfig";
const BASE_URL = `${API_BASE_URL}/api/formulas`;

export const fetchFormulas = async (token) => {
  const res = await api.get(`${BASE_URL}/getAll`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return await res.json();
};

export const executeFormula = async (name, body, token) => {
  const res = await api.post(`${BASE_URL}/execute?formulaName=${name}`, body, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return await res.text();
};

export const deleteFormula = async (id, token) => {
  await api.delete(`${BASE_URL}/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
