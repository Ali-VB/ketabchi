'use client';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Plane } from "lucide-react";
import { useRouter } from 'next/navigation';
import { useAuth } from './auth-provider';

export function HeroSection() {
    const { user } = useAuth();
    const router = useRouter();

    const handleLinkClick = (path: string) => {
        if (!user) {
            router.push(`/login?redirect=${encodeURIComponent(path)}`);
        } else {
            router.push(path);
        }
    }

    return (
        <section className="w-full py-16 lg:py-20 bg-muted/30 border-b">
            <div className="container px-4 md:px-6">
                <div className="flex flex-col items-center space-y-4 text-center">
                    <div className="max-w-2xl mx-auto space-y-6">
                        <div>
                            <p className="mt-4 text-lg md:text-xl text-muted-foreground">
                               از مسافری بخواهید برایتان از ایران کتاب بیاورد، یا در سفرتان کتابی را به دست کسی برسانید.
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                             <Button onClick={() => handleLinkClick('/dashboard/requests?action=new')} size="lg" variant="secondary">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                                <span>درخواست کتاب دارم</span>
                            </Button>
                            <Button onClick={() => handleLinkClick('/dashboard/trips?action=new')} size="lg">
                                <Plane className="h-5 w-5" />
                                <span>مسافرم و جا دارم</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
