import Image from 'next/image';
import { cn } from "@/lib/utils";

export const HeroIllustration = ({ className }: { className?: string }) => {
  return (
    <div className={cn("relative aspect-video w-full max-w-lg mx-auto", className)}>
        <Image 
            src="https://placehold.co/800x600.png" 
            alt="Abstract illustration of travel and books"
            width={800}
            height={600}
            className="rounded-lg"
            data-ai-hint="travel books"
        />
    </div>
  );
};
