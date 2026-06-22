const BASE_URL = "http://127.0.0.1:5000/api";

export const fetchData = async () => {
  const res = await fetch(`${BASE_URL}/data`);
  return res.json();
};

export const fetchMetrics = async () => {
  const res = await fetch(`${BASE_URL}/metrics`);
  return res.json();
};

export const createData = async (data) => {
  await fetch(`${BASE_URL}/data`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });
};

export const deleteData = async (id) => {
  await fetch(`${BASE_URL}/data/${id}`, {
    method: "DELETE"
  });
};

