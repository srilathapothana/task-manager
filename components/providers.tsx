"use client";

import { ThemeProvider } from "next-themes";
import { Toaster } from "react-hot-toast";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          className: "dark:bg-gray-800 dark:text-white",
          duration: 3000,
        }}
      />
    </ThemeProvider>
  );
}
