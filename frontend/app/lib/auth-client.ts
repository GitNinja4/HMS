// Custom auth client for HMS backend
// This replaces better-auth with a simpler implementation

const API_BASE_URL = "http://localhost:5000/api";

// Helper to check if localStorage is available
const isLocalStorageAvailable = typeof window !== "undefined" && typeof localStorage !== "undefined";

interface AuthTokens {
  access_token: string;
  refresh_token: string;
  user_id: number;
  role: string;
}

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  status?: string;
  email_verified?: boolean;
  image?: string;
}

interface Session {
  user: User | null;
  expires: string | null;
}

class AuthClient {
  private tokens: AuthTokens | null = null;
  private sessionListeners: Set<() => void> = new Set();

  async signup(email: string, password: string, name: string, role: string, organization: string): Promise<AuthTokens> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name, role }),
        credentials: "include",
      });

      if (!response.ok) {
        let errorMessage = "Signup failed";
        try {
          const error = await response.json();
          errorMessage = error.detail || error.message || errorMessage;
        } catch {
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const data: AuthTokens = await response.json();
      this.storeTokens(data);
      
      // Fetch and store full user data
      await this.fetchAndStoreUserData();
      
      return data;
    } catch (error) {
      if (error instanceof TypeError) {
        throw new Error("Failed to connect to server. Make sure the backend is running on http://localhost:5000");
      }
      throw error;
    }
  }

  async login(email: string, password: string): Promise<AuthTokens> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      if (!response.ok) {
        let errorMessage = "Login failed";
        try {
          const error = await response.json();
          errorMessage = error.detail || error.message || errorMessage;
        } catch {
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const data: AuthTokens = await response.json();
      this.storeTokens(data);
      
      // Fetch and store full user data
      await this.fetchAndStoreUserData();
      
      return data;
    } catch (error) {
      if (error instanceof TypeError) {
        throw new Error("Failed to connect to server. Make sure the backend is running on http://localhost:5000");
      }
      throw error;
    }
  }

  private async fetchAndStoreUserData(): Promise<void> {
    try {
      const token = this.getAccessToken();
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/auth/get-session`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const sessionData = await response.json();
        if (sessionData) {
          if (isLocalStorageAvailable) {
            localStorage.setItem("user_name", sessionData.name || "");
            localStorage.setItem("user_email", sessionData.email || "");
            localStorage.setItem("user_status", sessionData.status || "");
            localStorage.setItem("user_email_verified", sessionData.email_verified ? "true" : "false");
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch user data:", error);
      // Don't throw - let the flow continue even if user data fetch fails
    }
  }

  async getSession(): Promise<Session | null> {
    const token = this.getAccessToken();
    if (!token) return null;

    try {
      const response = await fetch(`${API_BASE_URL}/auth/get-session`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const sessionData = await response.json();
        if (sessionData) {
          return {
            user: {
              id: this.getUserId(),
              email: sessionData.email || "",
              name: sessionData.name || "",
              role: this.getRole(),
              status: sessionData.status,
              email_verified: sessionData.email_verified,
            },
            expires: null,
          };
        }
      }
    } catch (error) {
      console.error("Failed to get session:", error);
    }
    return null;
  }

  async logout(): Promise<void> {
    const token = this.getAccessToken();
    
    try {
      if (token) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch (error) {
      console.error("Logout request failed:", error);
      // Continue with local cleanup even if logout request fails
    } finally {
      this.clearTokens();
      this.notifySessionChange();
    }
  }

  async signOut(options?: { fetchOptions?: { onSuccess?: () => void; onError?: () => void } }): Promise<void> {
    try {
      await this.logout();
      options?.fetchOptions?.onSuccess?.();
    } catch (error) {
      options?.fetchOptions?.onError?.();
      throw error;
    }
  }

  async refreshToken(): Promise<AuthTokens | null> {
    const token = this.getRefreshToken();
    if (!token) return null;

    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: token }),
      });

      if (response.ok) {
        const data = await response.json();
        this.storeTokens({ ...data, user_id: this.getUserId(), role: this.getRole() });
        return data;
      }
    } catch (error) {
      console.error("Token refresh failed:", error);
    }
    return null;
  }

  private storeTokens(tokens: AuthTokens): void {
    if (isLocalStorageAvailable) {
      localStorage.setItem("access_token", tokens.access_token);
      localStorage.setItem("refresh_token", tokens.refresh_token);
      localStorage.setItem("user_id", tokens.user_id.toString());
      localStorage.setItem("role", tokens.role);
    }
    this.tokens = tokens;
  }

  private clearTokens(): void {
    if (isLocalStorageAvailable) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user_id");
      localStorage.removeItem("role");
      localStorage.removeItem("user_name");
      localStorage.removeItem("user_email");
      localStorage.removeItem("user_status");
      localStorage.removeItem("user_email_verified");
    }
    this.tokens = null;
  }

  private notifySessionChange(): void {
    this.sessionListeners.forEach(listener => listener());
  }

  subscribeToSessionChange(listener: () => void): () => void {
    this.sessionListeners.add(listener);
    return () => this.sessionListeners.delete(listener);
  }

  getAccessToken(): string | null {
    if (!isLocalStorageAvailable) return null;
    return localStorage.getItem("access_token");
  }

  getRefreshToken(): string | null {
    if (!isLocalStorageAvailable) return null;
    return localStorage.getItem("refresh_token");
  }

  getUserId(): number {
    if (!isLocalStorageAvailable) return 0;
    return parseInt(localStorage.getItem("user_id") || "0");
  }

  getRole(): string {
    if (!isLocalStorageAvailable) return "";
    return localStorage.getItem("role") || "";
  }

  getUserName(): string {
    if (!isLocalStorageAvailable) return "";
    return localStorage.getItem("user_name") || "";
  }

  getUserEmail(): string {
    if (!isLocalStorageAvailable) return "";
    return localStorage.getItem("user_email") || "";
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  useSession() {
    return {
      data: this.isAuthenticated() ? { 
        user: { 
          id: this.getUserId(), 
          role: this.getRole(),
          name: this.getUserName(),
          email: this.getUserEmail(),
        } 
      } : null,
      isPending: false,
    };
  }
}

export const authClient = new AuthClient();
