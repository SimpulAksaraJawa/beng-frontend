import axios from "axios";

const BASE_URL =
    import.meta.env.MODE === "development"
        ? "http://localhost:5000/api"
        : "http://167.71.195.190/api";

const api = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
});

export default api;
