import { cn } from "@/lib/utils";

export const HeroIllustration = ({ className }: { className?: string }) => {
  return (
    <div className={cn("relative aspect-video w-full max-w-lg mx-auto", className)}>
        <svg viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Subtle background wave with hardcoded color and opacity */}
            <path d="M-50 200 Q150 50, 450 200" fill="#32b889" fillOpacity="0.1" />
            
            {/* Suitcase/Book Icon with hardcoded colors */}
            <g transform="translate(125 40) scale(1.2)">
                {/* Suitcase Body */}
                <rect x="10" y="30" width="80" height="50" rx="8" stroke="#4a4a4a" strokeOpacity="0.7" strokeWidth="2" fill="#fcfaf8"/>
                
                {/* Suitcase Handle */}
                <path d="M40 30 V 20 A 10 10 0 0 1 60 20 V 30" stroke="#4a4a4a" strokeOpacity="0.7" strokeWidth="2" fill="none"/>
                
                {/* Book Pages */}
                <path d="M15 75 Q50 60 85 75" stroke="#4a4a4a" strokeOpacity="0.7" strokeWidth="2" fill="none" />
                <path d="M15 70 Q50 55 85 70" stroke="#4a4a4a" strokeOpacity="0.7" strokeWidth="2" fill="none" />
                <path d="M15 65 Q50 50 85 65" stroke="#4a4a4a" strokeOpacity="0.7" strokeWidth="2" fill="none" />
                
                 {/* Latches */}
                <rect x="25" y="22" width="10" height="8" rx="2" stroke="#4a4a4a" strokeOpacity="0.7" strokeWidth="1.5" fill="#fcfaf8" />
                <rect x="65" y="22" width="10" height="8" rx="2" stroke="#4a4a4a" strokeOpacity="0.7" strokeWidth="1.5" fill="#fcfaf8" />
            </g>
        </svg>
    </div>
  );
};
