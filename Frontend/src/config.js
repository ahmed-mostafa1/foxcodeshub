const trimTrailingSlash = (value) => value.replace(/\/+$/, "");

export const API_BASE_URL = trimTrailingSlash(
  process.env.REACT_APP_API_BASE_URL || "http://localhost:8000/api"
);

export const API_HOST = API_BASE_URL.replace(/\/api$/, "");

export const SITE_URL = trimTrailingSlash(
  process.env.REACT_APP_SITE_URL || "http://localhost:3000"
);

export const OAUTH_CLIENT_ID =
  process.env.REACT_APP_OAUTH_CLIENT_ID || "local-dev-client-id";


export const PAYPAL_CLIENT_ID = process.env.REACT_APP_PAYPAL_CLIENT_ID || "";
