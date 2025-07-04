import { cn } from "@/lib/utils";

export const HeroIllustration = ({ className }: { className?: string }) => {
  return (
    <div className={cn("relative aspect-square w-full max-w-md mx-auto", className)}>
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g  transform="translate(10, 0)">
                <path d="M43.0514 85.3521L144.332 35.7983C149.692 33.1504 155.823 38.0186 154.507 43.6823L130.631 143.98C129.351 149.499 122.427 152.096 117.802 148.65L96.8667 132.893C95.2751 131.721 94.2255 129.835 94.0152 127.811L90.2335 88.536C90.0125 86.396 91.8011 84.5826 93.9317 84.697L132.332 86.6669C134.204 86.7681 135.247 88.8953 134.02 90.1873L84.2889 142.352" stroke="hsl(var(--primary))" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M68 165L68 113C68 108.029 72.0294 104 77 104V104C81.9706 104 86 108.029 86 113L86 165" stroke="hsl(var(--accent))" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M128 165L128 113C128 108.029 123.971 104 119 104V104C114.029 104 110 108.029 110 113L110 165" stroke="hsl(var(--accent))" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M68 165C68 169.971 72.0294 174 77 174H119C123.971 174 128 169.971 128 165L86 165H110" stroke="hsl(var(--accent))" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="140" cy="140" r="40" fill="hsl(var(--primary))" opacity="0.1"/>
                <circle cx="60" cy="60" r="30" fill="hsl(var(--accent))" opacity="0.1"/>
            </g>
        </svg>
    </div>
  );
};
