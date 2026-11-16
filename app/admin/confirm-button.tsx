"use client";

import type { ReactNode } from "react";

export default function ConfirmButton({ message, children }: { message: string; children: ReactNode }) {
  return (
    <button
      onClick={(e) => {
        if (!confirm(message)) e.preventDefault();
      }}
      className="text-sm text-red-600 underline"
    >
      {children}
    </button>
  );
}
