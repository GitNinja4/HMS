import { useState, useEffect } from "react";

export interface Session {
  user: {
    id: string;
    name?: string;
    email?: string;
    role: string;
  };
}

/**
 * Custom hook to check if user is logged in by checking localStorage
 * This replaces better-auth's useSession hook
 */
export const useLocalSession = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [isPending, setIsPending] = useState(true);

  useEffect(() => {
    const checkSession = () => {
      const accessToken = localStorage.getItem("access_token");
      const userId = localStorage.getItem("user_id");
      const role = localStorage.getItem("role");
      const userName = localStorage.getItem("user_name");
      const userEmail = localStorage.getItem("user_email");

      if (accessToken && userId && role) {
        setSession({
          user: {
            id: userId,
            name: userName || undefined,
            email: userEmail || undefined,
            role: role,
          },
        });
      } else {
        setSession(null);
      }

      setIsPending(false);
    };

    // Check session on mount and when storage changes
    checkSession();

    const handleStorageChange = () => {
      checkSession();
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return { data: session, isPending };
};
