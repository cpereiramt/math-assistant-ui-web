const BASE_URL = "http://localhost:8080/api/formulas";

export const fetchFormulas = async (token) => {
  const res = await fetch(`${BASE_URL}/getAll`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return await res.json();
};

export const executeFormula = async (name, body, token) => {
  const res = await fetch(`${BASE_URL}/execute?formulaName=${name}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  return await res.text();
};

export const deleteFormula = async (id, token) => {
  await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
