import { cn } from "@/lib/utils";

export const Logo = ({ className }: { className?: string }) => {
  return (
    <svg
      role="img"
      aria-label="Ketabchi Logo"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(className)}
    >
      <rect width="32" height="32" rx="8" fill="#2563EB" />
      <path
        d="M9 24V9C9 8.44772 9.44772 8 10 8H22C22.5523 8 23 8.44772 23 9V24L16 21L9 24Z"
        fill="white"
      />
      <path
        d="M19 18C19 16.3431 17.6569 15 16 15C14.3431 15 13 16.3431 13 18V20"
        stroke="#2563EB"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17.5 16L18.5 15"
        stroke="#2563EB"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
