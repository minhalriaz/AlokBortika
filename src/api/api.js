import axios from "axios";

const baseURL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL,
  withCredentials: true,
});

const getToken = () => {
  const userToken = localStorage.getItem("token");
  const orgToken = localStorage.getItem("orgToken");
  return { userToken, orgToken };
};

api.interceptors.request.use((config) => {
  const { userToken, orgToken } = getToken();
  const isOrganizationRequest =
    typeof config.url === "string" && config.url.startsWith("/organization");

  if (isOrganizationRequest) {
    // Org routes: only send org-authorization, never the user token
    if (orgToken) {
      config.headers["org-authorization"] = `Bearer ${orgToken}`;
    }
    delete config.headers.Authorization;
  } else {
    // All other routes: only send user token
    if (userToken) {
      config.headers.Authorization = `Bearer ${userToken}`;
    }
    delete config.headers["org-authorization"];
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      const requestUrl = error?.config?.url || "";
      const isOrgRequest = typeof requestUrl === "string" && requestUrl.startsWith("/organization");

      if (isOrgRequest) {
        localStorage.removeItem("orgToken");
        localStorage.removeItem("organization");
      } else {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }

    return Promise.reject(error);
  }
);

export default api;
