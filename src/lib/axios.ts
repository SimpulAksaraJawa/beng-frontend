import axios from "axios";

const BASE_URL =
    import.meta.env.MODE === "development"
        ? "http://localhost:3000/api" // Might want to change port from 3000 to your desired port
        : "/api";

const api = axios.create({
    baseURL: BASE_URL,
});

export default api;
