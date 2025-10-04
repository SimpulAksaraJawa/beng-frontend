import axios from "axios";

const BASE_URL =
    import.meta.env.MODE === "development"
        ? "http://localhost:5000/api" // Might want to change port from 3000 to your desired port
        : "/api";

const api = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
});

export default api;
