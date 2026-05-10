export const get_country_by_api = "https://ipapi.co/json/"; //"https://api.country.is/";
const configuredApiEndpoint =
  import.meta.env.VITE_API_ENDPOINT || "http://127.0.0.1:8000";

export const api_endpoint = configuredApiEndpoint.replace(/\/$/, "");
export const api_ebdpoint_account = `${api_endpoint}/account/`;
