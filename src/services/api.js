import { API_BASE_URL } from "../config/env";
import { api } from "../utils/axiosConfig";
const BASE_URL = `${API_BASE_URL}/api/formulas`;
const USERS_BASE_URL = `${API_BASE_URL}/api/users`;

export const fetchCurrentUserProfile = async () => {
  const res = await api.get(`${USERS_BASE_URL}/me`);
  return res.data;
};

export const fetchFormulas = async () => {
  const res = await api.get(`${BASE_URL}/public`);
  return await res.data;
};

export const searchFormulas = async ({
  q,
  groups = [],
  type,
  page = 0,
  size = 12,
  sortBy = "name",
  direction = "ASC",
} = {}) => {
  const params = { scope: "PUBLIC", page, size, sortBy, direction };
  if (q?.trim()) params.q = q.trim();
  if (groups.length) params.groups = groups.join(",");
  if (type) params.type = type;

  const res = await api.get(`${BASE_URL}/search`, { params });
  return res.data;
};

export const fetchMostRatedFormulas = async ({ page = 0, size = 12, days = 30 } = {}) =>
  (await api.get(`${BASE_URL}/ranking`, { params: { page, size, days } })).data;

export const fetchMyFormulas = async () => {
  const res = await api.get(`${BASE_URL}/mine`);
  return await res.data;
};

export const fetchMyFormula = async (id) => {
  const res = await api.get(`${BASE_URL}/mine/${id}`);
  return await res.data;
};

export const validateMyFormula = async (body, formulaId) => {
  const res = await api.post(`${BASE_URL}/mine/validate`, body, { params: { formulaId } });
  return await res.data;
};

export const fetchFormulaBuilderCatalog = async () => {
  const res = await api.get(`${BASE_URL}/builder/catalog`);
  return await res.data;
};

export const previewBuilderFormula = async (formula, variables, formulaId) => {
  const res = await api.post(`${BASE_URL}/builder/preview`, {
    formula,
    variables,
  }, { params: { formulaId } });
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

export const publishMyFormula = async (id) => {
  const res = await api.post(`${BASE_URL}/mine/${id}/publish`);
  return res.data;
};

export const rateFormula = async (id, value) => {
  const res = await api.post(`${BASE_URL}/${id}/ratings`, { value });
  return res.data;
};

export const removeFormulaRating = async (id) => {
  const res = await api.delete(`${BASE_URL}/${id}/ratings`);
  return res.data;
};

export const fetchFormulaComments = async (
  id,
  { page = 0, size = 20 } = {},
) => {
  const res = await api.get(`${BASE_URL}/${id}/comments`, {
    params: { page, size },
  });
  return res.data;
};

export const fetchFormulaCommentReplies = async (
  formulaId,
  commentId,
  { page = 0, size = 20 } = {},
) => {
  const res = await api.get(
    `${BASE_URL}/${formulaId}/comments/${commentId}/replies`,
    {
      params: { page, size },
    },
  );
  return res.data;
};

export const addFormulaComment = async (id, body) => {
  const res = await api.post(`${BASE_URL}/${id}/comments`, body);
  return res.data;
};

export const updateFormulaComment = async (commentId, body) => {
  const res = await api.patch(`${BASE_URL}/comments/${commentId}`, body);
  return res.data;
};

export const deleteFormulaComment = async (commentId) => {
  await api.delete(`${BASE_URL}/comments/${commentId}`);
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

export const fetchFormulaVersions = async (id, signal) => {
  const res = await api.get(`${BASE_URL}/${encodeURIComponent(id)}/versions`, { signal });
  return res.data;
};

export const fetchPendingFormulas = async (signal) => {
  const res = await api.get(`${BASE_URL}/admin/pending`, { signal });
  return res.data;
};

export const reviewFormula = async (id, decision, reason) => {
  const res = await api.post(`${BASE_URL}/admin/${encodeURIComponent(id)}/${decision}`, { reason });
  return res.data;
};

export const reviseFormula = async (id, body) => {
  const res = await api.put(`${BASE_URL}/admin/${encodeURIComponent(id)}/revision`, body);
  return res.data;
};

export const fetchUnits = async (admin = false) =>
  (await api.get(`${BASE_URL}/${admin ? "admin/" : ""}units`)).data;

export const saveUnit = async (code, unit) =>
  (await api.put(`${BASE_URL}/admin/units/${encodeURIComponent(code)}`, unit)).data;

export const calculateFormula = async (inputs, mine = false) =>
  (await api.post(`${BASE_URL}/${mine ? "mine/" : ""}calculate`, inputs)).data;

export const calculatePreview = async (formula, inputs, formulaId, revision) =>
  (await api.post(
    revision ? `${BASE_URL}/admin/${formulaId}/calculate-preview` : `${BASE_URL}/builder/calculate`,
    { formula, inputs }, { params: revision ? undefined : { formulaId } },
  )).data;

export const validateFormulaRevision = async (formulaId, formula) =>
  (await api.post(`${BASE_URL}/admin/${formulaId}/validate-revision`, formula)).data;
