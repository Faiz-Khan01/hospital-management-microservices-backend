import apiClient from "./apiClient";

const AuthService = {
    login: async (credentials) => {
        try {
            const response = await apiClient.post("/auth/login", credentials);
            const authData = response.data?.data || response.data;
            const { token, userId, id, name, username, email, role, status } = authData;

            if (token) {
                localStorage.setItem("token", token);
                const resolvedUserId = userId ?? id;
                if (resolvedUserId != null) {
                    localStorage.setItem("userId", String(resolvedUserId));
                }
                localStorage.setItem("username", name || username || email || credentials.username);
                localStorage.setItem("email", email || credentials.username);

                // Look up registered role in local registry if backend returned PATIENT or empty
                const registeredUsers = JSON.parse(localStorage.getItem("registered_users") || "[]");
                const matchedUser = registeredUsers.find(
                    u => (u.username?.toLowerCase() === (credentials.username || '').toLowerCase() ||
                          u.email?.toLowerCase() === (credentials.username || '').toLowerCase() ||
                          (email && u.email?.toLowerCase() === email.toLowerCase()))
                );

                let resolvedRole = String(role || "").replace(/^ROLE_/, "").trim();
                if ((!resolvedRole || resolvedRole === "PATIENT") && matchedUser && matchedUser.role && matchedUser.role !== "PATIENT") {
                    resolvedRole = matchedUser.role;
                } else if ((!resolvedRole || resolvedRole === "PATIENT") && (String(name || username || '').toLowerCase().startsWith('dr') || String(name || username || '').toLowerCase().includes('doctor'))) {
                    resolvedRole = "DOCTOR";
                }
                if (!resolvedRole) resolvedRole = "PATIENT";

                localStorage.setItem("role", resolvedRole);
                localStorage.setItem("status", status || "ACTIVE");
                localStorage.setItem("is_demo_mode", "false");
                return authData;
            }

            throw new Error("Authentication response did not include a token");
        } catch (error) {
            console.warn("Backend auth response failed, checking demo/fallback accounts for:", credentials?.username);
            const user = String(credentials?.username || '').trim().toLowerCase();
            const pass = String(credentials?.password || '').trim();

            // Fallback credentials for testing & offline mode
            if (
                (user === 'admin' || user === 'admin@hospital.com' || user === 'admin.director') &&
                (pass === 'admin123' || pass === 'password123' || pass === 'Password' || pass === 'admin')
            ) {
                const demoToken = "demo-jwt-session-token-hospitalsync-admin";
                localStorage.setItem("token", demoToken);
                localStorage.setItem("userId", "1");
                localStorage.setItem("username", "System Administrator");
                localStorage.setItem("email", "admin@hospital.com");
                localStorage.setItem("role", "ADMIN");
                localStorage.setItem("status", "ACTIVE");
                localStorage.setItem("is_demo_mode", "true");
                return { token: demoToken, username: "admin", role: "ROLE_ADMIN", userId: 1 };
            }

            if (
                (user === 'patient' || user === 'patient@hospital.com' || user === 'john.doe') &&
                (pass === 'patient123' || pass === 'password123' || pass === 'patient')
            ) {
                const demoToken = "demo-jwt-session-token-hospitalsync-patient";
                localStorage.setItem("token", demoToken);
                localStorage.setItem("userId", "19");
                localStorage.setItem("username", "John Doe");
                localStorage.setItem("email", "john.doe@patient.com");
                localStorage.setItem("role", "PATIENT");
                localStorage.setItem("status", "ACTIVE");
                localStorage.setItem("is_demo_mode", "true");
                return { token: demoToken, username: "patient", role: "ROLE_PATIENT", userId: 19 };
            }

            if (
                (user === 'doctor' || user === 'doctor@hospital.com' || user === 'dr.sarah' || user === 'dr. house' || user === 'house22@gmail.com') &&
                (pass === 'doctor123' || pass === 'password123' || pass === 'doctor' || pass === 'admin123')
            ) {
                const demoToken = "demo-jwt-session-token-hospitalsync-doctor";
                localStorage.setItem("token", demoToken);
                localStorage.setItem("userId", "112");
                localStorage.setItem("username", user.includes('house') ? "Dr. House" : "Dr. Sarah Jenkins");
                localStorage.setItem("email", user.includes('house') ? "house22@gmail.com" : "sarah.jenkins@hospital.com");
                localStorage.setItem("role", "DOCTOR");
                localStorage.setItem("status", "ACTIVE");
                localStorage.setItem("is_demo_mode", "true");
                return { token: demoToken, username: "doctor", role: "ROLE_DOCTOR", userId: 112 };
            }

            if (
                (user === 'pharmacist' || user === 'pharmacist@hospital.com' || user === 'pharma') &&
                (pass === 'pharma123' || pass === 'pharmacist123' || pass === 'password123' || pass === 'admin123')
            ) {
                const demoToken = "demo-jwt-session-token-hospitalsync-pharmacist";
                localStorage.setItem("token", demoToken);
                localStorage.setItem("userId", "3");
                localStorage.setItem("username", "Alex Rivera (R.Ph)");
                localStorage.setItem("email", "pharmacist@hospital.com");
                localStorage.setItem("role", "PHARMACIST");
                localStorage.setItem("status", "ACTIVE");
                localStorage.setItem("is_demo_mode", "true");
                return { token: demoToken, username: "pharmacist", role: "ROLE_PHARMACIST", userId: 3 };
            }

            if (
                (user === 'receptionist' || user === 'reception@hospital.com') &&
                (pass === 'reception123' || pass === 'password123' || pass === 'receptionist123')
            ) {
                const demoToken = "demo-jwt-session-token-hospitalsync-receptionist";
                localStorage.setItem("token", demoToken);
                localStorage.setItem("userId", "2");
                localStorage.setItem("username", "Emma Watson");
                localStorage.setItem("email", "reception@hospital.com");
                localStorage.setItem("role", "RECEPTIONIST");
                localStorage.setItem("status", "ACTIVE");
                localStorage.setItem("is_demo_mode", "true");
                return { token: demoToken, username: "receptionist", role: "ROLE_RECEPTIONIST", userId: 2 };
            }

            // Check dynamically registered demo users
            const registeredUsers = JSON.parse(localStorage.getItem("registered_users") || "[]");
            const matchedUser = registeredUsers.find(
                u => (u.username?.toLowerCase() === user || u.email?.toLowerCase() === user)
                  && (!pass || u.password === pass)
            );
            if (matchedUser) {
                const resolvedRole = String(matchedUser.role || "PATIENT").replace(/^ROLE_/, "");
                const demoToken = `demo-jwt-session-token-${matchedUser.username}`;
                localStorage.setItem("token", demoToken);
                localStorage.setItem("userId", String(matchedUser.id || 19));
                localStorage.setItem("username", matchedUser.name || matchedUser.username);
                localStorage.setItem("email", matchedUser.email);
                localStorage.setItem("role", resolvedRole);
                localStorage.setItem("status", "ACTIVE");
                localStorage.setItem("is_demo_mode", "true");
                return { token: demoToken, username: matchedUser.username, role: `ROLE_${resolvedRole}`, userId: matchedUser.id || 19 };
            }

            throw error;
        }
    },

    register: async (userData) => {
        const requestedRole = String(userData.role || "PATIENT").replace(/^ROLE_/, "").toUpperCase();
        const payload = {
            username: userData.username,
            name: userData.name || userData.username,
            email: userData.email,
            password: userData.password,
            role: requestedRole
        };

        const saveLocalUser = () => {
            const registeredUsers = JSON.parse(localStorage.getItem("registered_users") || "[]");
            const newUser = {
                id: Date.now(),
                username: userData.username,
                name: userData.name || userData.username,
                email: userData.email,
                password: userData.password,
                role: requestedRole
            };
            const filtered = registeredUsers.filter(
                u => u.username?.toLowerCase() !== userData.username?.toLowerCase()
                  && u.email?.toLowerCase() !== userData.email?.toLowerCase()
            );
            filtered.push(newUser);
            localStorage.setItem("registered_users", JSON.stringify(filtered));
            return newUser;
        };

        saveLocalUser();

        try {
            const response = await apiClient.post("/auth/register", payload);
            return response.data?.data || response.data;
        } catch (error) {
            if (error.response) {
                throw error;
            }
            console.warn("Backend auth registration offline, using local registry:", error);
            const user = saveLocalUser();
            return {
                message: "User registered successfully (offline mode)",
                ...user
            };
        }
    },

    logout: () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        localStorage.removeItem("username");
        localStorage.removeItem("role");
        localStorage.removeItem("email");
        localStorage.removeItem("status");
        localStorage.removeItem("is_demo_mode");
        window.location.reload();
    },

    getToken: () => {
        return localStorage.getItem("token");
    },

    getUsername: () => {
        return localStorage.getItem("username") || "Admin User";
    },

    getUserId: () => {
        const userId = localStorage.getItem("userId");
        return userId ? Number(userId) : 1;
    },

    getRole: () => {
        let role = localStorage.getItem("role") || "";
        if (!role || role === "PATIENT") {
            try {
                const email = (localStorage.getItem("email") || "").toLowerCase();
                const username = (localStorage.getItem("username") || "").toLowerCase();
                const registeredUsers = JSON.parse(localStorage.getItem("registered_users") || "[]");
                const matched = registeredUsers.find(
                    u => (u.email && u.email.toLowerCase() === email) ||
                         (u.username && u.username.toLowerCase() === username) ||
                         (u.name && u.name.toLowerCase() === username)
                );
                if (matched && matched.role && matched.role !== "PATIENT") {
                    localStorage.setItem("role", matched.role);
                    return matched.role;
                }
                if (username.startsWith("dr") || username.includes("doctor")) {
                    localStorage.setItem("role", "DOCTOR");
                    return "DOCTOR";
                }
            } catch (e) {}
        }
        return role;
    },

    getAuthUsers: () => apiClient.get("/auth/users"),

    approveRequestedRole: (userId) => apiClient.put(`/auth/users/${userId}/approve`),

    updateUserRole: (userId, role) => apiClient.put(`/auth/users/${userId}/role`, { role }),

    isDemoMode: () => {
        return localStorage.getItem("is_demo_mode") === "true";
    },

    isAuthenticated: () => {
        return !!localStorage.getItem("token");
    }
};

export default AuthService;