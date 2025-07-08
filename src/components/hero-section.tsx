'use client';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Plane, Package } from "lucide-react";
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
                    <div className="mx-auto max-w-2xl space-y-8">
                        <div className="space-y-4">
                            <h1 className="text-2xl sm:text-3xl md:text-4xl font-display bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent leading-tight tracking-normal">
                               از مسافری بخواهید برایتان از ایران کتاب بیاورد،<br />یا در سفرتان کتابی را به دست کسی برسانید.
                            </h1>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                             <Button onClick={() => handleLinkClick('/dashboard/requests?action=new')} size="lg">
                                <Package className="h-5 w-5" />
                                <span>درخواست کتاب دارم</span>
                            </Button>
                            <Button onClick={() => handleLinkClick('/dashboard/trips?action=new')} size="lg" variant="secondary">
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
