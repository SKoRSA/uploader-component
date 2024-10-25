// src/components/ui/Toast.tsx
import React, { useEffect } from "react";
import { CheckCircle, XCircle, AlertCircle, X } from "lucide-react";
import { cn } from "../../utils/cn";

export type ToastType = "success" | "error" | "info";

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    error: <XCircle className="w-5 h-5 text-red-500" />,
    info: <AlertCircle className="w-5 h-5 text-blue-500" />,
  };

  return (
    <div
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg",
        "animate-in slide-in-from-right-full fade-in duration-300",
        "bg-white border",
        type === "success" && "border-green-500",
        type === "error" && "border-red-500",
        type === "info" && "border-blue-500"
      )}
    >
      {icons[type]}
      <p className="text-sm">{message}</p>
      <button
        onClick={onClose}
        className="ml-4 p-1 hover:bg-gray-100 rounded-full"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
