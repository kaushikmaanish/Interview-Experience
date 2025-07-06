"use client"
import { Toaster } from "react-hot-toast";

export function ToasterProvider() {
  return (
    <Toaster
  position="bottom-right"
  toastOptions={{
    className: "bg-gray-800 text-white shadow-lg rounded-lg px-4 py-2",
    style: {
      borderRadius: "10px",
      background: "#1e293b", // Dark blue/gray background
      color: "#f8fafc", // Light text color
      padding: "12px",
      border: "1px solid #334155",
    },
    success: {
      style: {
        background: "#22c55e", // Green success
        color: "#fff",
      },
      iconTheme: {
        primary: "#16a34a", // Darker green icon
        secondary: "#fff",
      },
    },
    error: {
      style: {
        background: "#ef4444", // Red error
        color: "#fff",
      },
      iconTheme: {
        primary: "#dc2626",
        secondary: "#fff",
      },
    },
  }}
/>
  )
}
