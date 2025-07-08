import Image from 'next/image';
import { cn } from "@/lib/utils";

export const Logo = ({ className }: { className?: string }) => {
  return (
    <div className={cn("relative h-full w-full", className)}>
      <Image
        src="/logo.png"
        alt="Ketabchi Logo"
        fill
        sizes="48px"
        className="object-contain"
      />
    </div>
  );
};
