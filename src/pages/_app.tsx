import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ThemeProvider } from "../context/ThemeContext";
import Navbar from "../components/Navbar";
import DarkModeToggle from "../components/DarkModeToggle";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { getAuthToken } from "../utils/auth";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const hideNavbarPaths = ["/login", "/register"];
  const showNavbar = !hideNavbarPaths.includes(router.pathname);
  const showDarkModeToggle = hideNavbarPaths.includes(router.pathname);

  useEffect(() => {
    // Add token to all fetch requests
    const originalFetch = window.fetch;
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      if (typeof input === 'string' && input.includes('api.escuelajs.co')) {
        const token = getAuthToken();
        if (token) {
          init = {
            ...init,
            headers: {
              ...init?.headers,
              'Authorization': `Bearer ${token}`,
            },
          };
        }
      }
      return originalFetch(input, init);
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {showNavbar ? (
          <Navbar />
        ) : (
          showDarkModeToggle && (
            <div className="absolute top-4 right-4 z-50">
              <DarkModeToggle />
            </div>
          )
        )}
        <main>
          <Component {...pageProps} />
        </main>
      </div>
    </ThemeProvider>
  );
}
