"use client";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  //  Prevents Hydration Mismatch in Next.js
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null; // Ensures client-side rendering

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-md border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors duration-200"
        >
          {resolvedTheme === "dark" ? (
            <Moon className="h-5 w-5 text-gray-600 dark:text-blue-300" />
          ) : (
            <Sun className="h-5 w-5 text-gray-600" />
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="bg-white dark:bg-slate-900 border dark:border-slate-700 shadow-lg dark:shadow-slate-900/50 rounded-md z-50"
      >
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className="cursor-pointer flex items-center hover:bg-gray-100 dark:hover:bg-slate-800 dark:text-blue-100 transition-colors duration-150"
        >
          <Sun className="h-4 w-4 mr-2" />
          Light
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className="cursor-pointer flex items-center hover:bg-gray-100 dark:hover:bg-slate-800 dark:text-blue-100 transition-colors duration-150"
        >
          <Moon className="h-4 w-4 mr-2" />
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className="cursor-pointer flex items-center hover:bg-gray-100 dark:hover:bg-slate-800 dark:text-blue-100 transition-colors duration-150"
        >
          <svg className="h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
            <line x1="8" y1="21" x2="16" y2="21" />
            <line x1="12" y1="17" x2="12" y2="21" />
          </svg>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
