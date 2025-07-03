import { cn } from "@/lib/utils";

export const Logo = ({ className }: { className?: string }) => {
  return (
    <svg
      role="img"
      aria-label="Ketabchi Logo"
      className={cn("text-primary", className)}
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Frame */}
      <rect x="2" y="2" width="24" height="24" rx="6" stroke="currentColor" strokeWidth="2.5" />

      {/* Persian Letter 'Kaf' */}
      <path
        d="M20 15C20 11.6863 17.3137 9 14 9C10.6863 9 8 11.6863 8 15V19"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17 11L19 9"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
