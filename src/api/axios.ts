import axios from "axios";

const BASE_URL =
    import.meta.env.MODE === "development"
        ? "http://localhost:3000/api"
        : "https://api.bengbeng.web.id/api"; //okay

const api = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
});

export default api;
