"use client";

import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";

const useAuthCheck = (): void => {
  const router = useRouter();
  const pathname = usePathname();
  const auth = getAuth();
  const logoutTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Function to clear any existing logout timer
  const clearLogoutTimer = () => {
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }
  };

  // Function to perform logout
  const performLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("authToken");
      localStorage.removeItem("tokenExpiry");
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      // Still clear local storage and redirect even if Firebase logout fails
      localStorage.removeItem("authToken");
      localStorage.removeItem("tokenExpiry");
      router.push("/login");
    }
  };

  // Function to set up auto-logout timer
  const setupAutoLogout = (expiryTime: number) => {
    clearLogoutTimer();

    const timeLeft = expiryTime - Date.now();

    // Only set the timer if the token isn't already expired
    if (timeLeft > 0) {
      logoutTimerRef.current = setTimeout(() => {
        performLogout();
      }, timeLeft);
    } else {
      // Token is already expired, logout immediately
      performLogout();
    }
  };

  useEffect(() => {
    const protectedRoutes = ["/dashboard", "/profile", "/settings"];

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      const tokenExpiryStr = localStorage.getItem("tokenExpiry");
      const tokenExpiry = tokenExpiryStr ? parseInt(tokenExpiryStr) : null;

      // Clear any existing timer first
      clearLogoutTimer();

      if (!user || !tokenExpiry) {
        // User is not logged in or token expiry is missing
        if (protectedRoutes.some(route => pathname.startsWith(route))) {
          performLogout();
        }
      } else {
        if (Date.now() > tokenExpiry) {
          // Token has expired
          performLogout();
        } else {
          // Token is still valid, set up auto-logout
          setupAutoLogout(tokenExpiry);

          // If the user is on a non-protected route but is logged in, no need to redirect
        }
      }
    });

    // Clean up the auth listener and timer when component unmounts
    return () => {
      unsubscribe();
      clearLogoutTimer();
    };
  }, [pathname]); // Only re-run when pathname changes

  // Additional effect to handle token refresh
  useEffect(() => {
    // Check token expiry every minute to handle potential refresh
    const tokenCheckInterval = setInterval(() => {
      const tokenExpiryStr = localStorage.getItem("tokenExpiry");
      const tokenExpiry = tokenExpiryStr ? parseInt(tokenExpiryStr) : null;

      if (tokenExpiry) {
        const timeLeft = tokenExpiry - Date.now();
        // If token will expire in less than 5 minutes, we could refresh it here
        if (timeLeft > 0 && timeLeft < 5 * 60 * 1000) {
          // Implement token refresh logic here if you have refresh tokens
          // For now, we'll just update the auto-logout timer
          setupAutoLogout(tokenExpiry);
        }
      }
    }, 60000); // Check every minute

    return () => clearInterval(tokenCheckInterval);
  }, []);
};

export default useAuthCheck;
