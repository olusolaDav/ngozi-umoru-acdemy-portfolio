"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

import { Input, type InputProps } from "@/components/ui/input";

export function PasswordInput(props: InputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <Input
        {...props}
        type={visible ? "text" : "password"}
        className="h-12 rounded-2xl border-[#ddd5ca] bg-white pr-12 text-sm text-[#2b2337] placeholder:text-[#8e879a]"
      />
      <button
        type="button"
        onClick={() => setVisible((current) => !current)}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#746c81]"
        aria-label={visible ? "Hide password" : "Show password"}
      >
        {visible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}
