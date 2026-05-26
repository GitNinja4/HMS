import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import type { Route } from "./+types/root";
import "./app.css";
import { TooltipProvider } from "./components/ui/tooltip";
import { ThemeProvider } from "./components/provider/theme";
import ToastProvider from "./components/provider/toast";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var storageKey = "medflow-theme";
                  var defaultTheme = "system";
                  var theme = localStorage.getItem(storageKey) || defaultTheme;
                  var supportDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
                  
                  var root = document.documentElement;
                  root.classList.remove("light", "dark");
                  
                  if (theme === "dark" || (theme === "system" && supportDarkMode)) {
                    root.classList.add("dark");
                  } else {
                    root.classList.add("light");
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <TooltipProvider>{children}</TooltipProvider>
          <ToastProvider />
        </ThemeProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
    </QueryClientProvider>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Something Went Wrong";
  let details = "An unexpected error occurred. Please try again or contact support.";
  let stack: string | undefined;
  let status = 500;
  let isNotFound = false;

  // Log error to console (in dev mode) for debugging
  if (import.meta.env.DEV) {
    console.error("[ErrorBoundary]", error);
  }

  if (isRouteErrorResponse(error)) {
    status = error.status;
    isNotFound = status === 404;

    if (isNotFound) {
      message = "Page Not Found";
      details = "The page you're looking for doesn't exist or has been moved.";
    } else if (status === 401) {
      message = "Unauthorized";
      details = "You don't have permission to access this resource.";
    } else if (status === 403) {
      message = "Access Forbidden";
      details = "Your role doesn't have access to this resource.";
    } else {
      message = `Error ${status}`;
      details =
        error.statusText ||
        "An error occurred. Please try again or contact support.";
    }
  } else if (error && error instanceof Error) {
    message = "Runtime Error";
    details =
      import.meta.env.DEV
        ? error.message
        : "An unexpected error occurred. Our team has been notified.";
    if (import.meta.env.DEV) {
      stack = error.stack;
    }
  }

  // Only show detailed error info in development
  const isDev = import.meta.env.DEV;
  const errorId = Math.random().toString(36).slice(2, 11).toUpperCase();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
      <div className="max-w-2xl w-full space-y-6">
        {/* Main Error Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8 md:p-12 space-y-6">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="relative">
              <div className={`absolute inset-0 rounded-full blur-xl opacity-50 ${
                status === 404
                  ? "bg-amber-100 dark:bg-amber-900/30"
                  : "bg-red-100 dark:bg-red-900/30"
              }`} />
              <div className={`relative w-16 h-16 rounded-full flex items-center justify-center ${
                status === 404
                  ? "bg-amber-100 dark:bg-amber-900/20"
                  : "bg-red-100 dark:bg-red-900/20"
              }`}>
                <span className={`text-3xl font-black ${
                  status === 404
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-red-600 dark:text-red-400"
                }`}>
                  {status}
                </span>
              </div>
            </div>
          </div>

          {/* Error Content */}
          <div className="text-center space-y-3">
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white">
              {message}
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
              {details}
            </p>
          </div>

          {/* Error ID (for support reference) */}
          {!isDev && (
            <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-3 text-center">
              <p className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                Reference ID
              </p>
              <p className="font-mono text-sm font-bold text-slate-900 dark:text-slate-100">
                {errorId}
              </p>
            </div>
          )}

          {/* Development Stack Trace */}
          {isDev && stack && (
            <details className="text-left bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
              <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 transition">
                Stack Trace (Development Only)
              </summary>
              <pre className="p-4 overflow-x-auto text-xs text-slate-700 dark:text-slate-400 font-mono">
                <code>{stack}</code>
              </pre>
            </details>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              onClick={() => window.location.href = "/dashboard"}
              className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition disabled:opacity-50"
            >
              Go to Dashboard
            </button>
            <button
              onClick={() => window.location.href = "/"}
              className="flex-1 px-6 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg font-semibold transition"
            >
              Go to Home
            </button>
          </div>

          {/* Support Info */}
          {!isDev && (
            <div className="pt-4 border-t border-slate-200 dark:border-slate-700 text-center">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Need help? Contact{" "}
                <a
                  href="mailto:support@medflow.local"
                  className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                >
                  support@medflow.local
                </a>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
