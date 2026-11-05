import { apiClient, isDemoMode, demoStore, testBackendConnection } from "./client";

export const authApi = {
  async login(username, password) {
    if (isDemoMode()) {
      return {
        access: "demo_mock_jwt_access_token",
        refresh: "demo_mock_jwt_refresh_token",
        user: demoStore.user,
        isDemo: true,
      };
    }

    try {
      const response = await apiClient.post("/token/", {
        username,
        password,
      });

      // SimpleJWT returns { access, refresh }
      const data = response.data;
      const user = { username };
      return {
        access: data.access,
        refresh: data.refresh,
        user,
        isDemo: false,
      };
    } catch (err) {
      if (!err.response) {
        throw new Error(
          "Unable to connect to ConvergeDesk API at http://localhost:8000. Start Django server or use Demo Mode.",
          { cause: err }
        );
      }
      const msg = err.response.data?.detail || "Invalid credentials. Please check your username and password.";
      throw new Error(msg, { cause: err });
    }
  },

  async register(username, email, password) {
    if (isDemoMode()) {
      const newUser = {
        id: Date.now(),
        username,
        email,
      };
      demoStore.user = newUser;
      return {
        ...newUser,
        isDemo: true,
      };
    }

    try {
      const response = await apiClient.post("/register/", {
        username,
        email,
        password,
      });
      return response.data;
    } catch (err) {
      if (!err.response) {
        throw new Error(
          "Unable to reach backend server to register. Start Django or use Demo Mode.",
          { cause: err }
        );
      }
      const data = err.response.data;
      if (typeof data === "object") {
        const firstKey = Object.keys(data)[0];
        const val = data[firstKey];
        const msg = Array.isArray(val) ? val[0] : val;
        throw new Error(`${firstKey}: ${msg}`, { cause: err });
      }
      throw new Error("Registration failed. Please check the provided information.", { cause: err });
    }
  },

  async checkHealth() {
    return await testBackendConnection();
  },
};
