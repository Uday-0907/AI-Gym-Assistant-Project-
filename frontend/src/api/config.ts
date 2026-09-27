export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL?.trim() || "http://127.0.0.1:8000"
).replace(/\/+$/, "");
