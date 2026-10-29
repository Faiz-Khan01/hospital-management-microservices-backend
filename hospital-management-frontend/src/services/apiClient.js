import axios from "axios";

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1",
    headers: {
        "Content-Type": "application/json"
    }
});

// Add JWT automatically to protected requests
apiClient.interceptors.request.use(
    (config) => {

        const token = localStorage.getItem("token");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },

    (error) => {
        return Promise.reject(error);
    }
);

// Handle authentication errors
apiClient.interceptors.response.use(
    (response) => {
        return response;
    },

    (error) => {
        const isDemo = localStorage.getItem("is_demo_mode") === "true";
        const token = localStorage.getItem("token");
        const status = error.response?.status;

        // Log error only if it's not a harmless expected 401/403/404 during polling/demo fallback
        if (status !== 401 && status !== 403 && status !== 404) {
            console.error(
                "API Error:",
                status,
                error.response?.data
            );
        }

        if (status === 401) {
            // In demo or offline mode, do not invalidate local session or boot to login
            if (isDemo || token?.startsWith("demo-")) {
                return Promise.reject(error);
            }

            localStorage.removeItem("token");
            localStorage.removeItem("username");
            localStorage.removeItem("role");

            // Don't redirect login itself repeatedly
            if (!window.location.pathname.includes("/login")) {
                window.location.href = "/login";
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient;
