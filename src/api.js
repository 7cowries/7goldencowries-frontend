const API_URL = process.env.REACT_APP_API_URL;

export async function apiGet(endpoint) {
  const res = await fetch(`${API_URL}${endpoint}`, {
    credentials: 'include', // important if using cookies/sessions
  });
  return res.json();
}

export async function apiPost(endpoint, body) {
  const res = await fetch(`${API_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body),
  });
  return res.json();
}
