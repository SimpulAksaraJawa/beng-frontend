import axios from "axios";

const BASE_URL =
    import.meta.env.MODE === "development"
        ? "http://localhost:5000/api"
        : "https://bengbeng.web.id/api"; //okay

const api = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
});

export default api;
