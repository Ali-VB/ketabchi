'use client';
import Link from 'next/link';
import Image from 'next/image';
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
        <section className="relative w-full h-[60vh] min-h-[450px] flex items-center justify-center text-center text-white">
            <Image
                src="/hero-background.png"
                alt="A person reading a book, line art."
                fill
                priority
                className="object-cover object-center brightness-50"
            />
            <div className="relative z-10 container flex flex-col items-center sm:items-end text-right">
                <div className="max-w-md space-y-6">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-bold font-headline drop-shadow-lg">کتاب‌های نایاب، در دستان شما</h1>
                        <p className="mt-4 text-lg md:text-xl text-primary-foreground/90 drop-shadow-md">
                           از هر کجای دنیا کتاب مورد نظرتان را درخواست دهید، یا در سفرتان کتابی را به دست کسی برسانید.
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 justify-end">
                         <Button onClick={() => handleLinkClick('/dashboard/requests?action=new')} size="lg" variant="secondary" className="bg-background/90 text-foreground hover:bg-background">
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
        </section>
    );
}
