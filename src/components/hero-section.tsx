
'use client';
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Plane } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { cn } from '@/lib/utils';
import { NewRequestForm } from './new-request-form';
import { HeroIllustration } from './hero-illustration';
import { Label } from './ui/label';


export function HeroSection() {
    const [date, setDate] = useState<Date | undefined>();

    return (
        <section className="w-full py-12 md:py-24 lg:py-32">
            <div className="container grid gap-12 px-4 md:grid-cols-2 md:items-center md:px-6 lg:gap-16">
                <div className="hidden md:block place-self-center">
                    <HeroIllustration className="w-full max-w-md" />
                </div>
                <div className="w-full max-w-md space-y-4 justify-self-center md:justify-self-end">
                     <Tabs defaultValue="requester" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 h-16 rounded-b-none rounded-t-lg p-0 border-b">
                            <TabsTrigger value="requester" className="flex h-full items-center gap-2 rounded-b-none rounded-tl-lg border-b-0 text-base data-[state=active]:bg-card data-[state=active]:shadow-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                                <span>درخواست کتاب دارم</span>
                            </TabsTrigger>
                            <TabsTrigger value="traveler" className="flex h-full items-center gap-2 rounded-b-none rounded-tr-lg border-b-0 text-base data-[state=active]:bg-card data-[state=active]:shadow-lg">
                                <Plane className="h-6 w-6" />
                                <span>مسافرم</span>
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value="requester">
                            <Card className="rounded-t-none shadow-xl">
                                <CardContent className="p-6">
                                    <NewRequestForm setDialogOpen={() => {}} isHeroForm={true}/>
                                </CardContent>
                            </Card>
                        </TabsContent>
                        <TabsContent value="traveler">
                           <Card className="rounded-t-none shadow-xl">
                                <CardContent className="p-6">
                                    <form className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>مسیر سفر</Label>
                                            <Input type="text" placeholder="مبدا" className="w-full bg-muted/50" />
                                            <Input type="text" placeholder="مقصد" className="w-full bg-muted/50" />
                                        </div>
                                         <div className="space-y-2">
                                            <Label>تاریخ سفر</Label>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                      variant={"outline"}
                                                      className={cn(
                                                        'w-full justify-start text-right font-normal bg-muted/50',
                                                        !date && 'text-muted-foreground'
                                                      )}
                                                    >
                                                        <Calendar className="ms-2 h-4 w-4" />
                                                        {date ? new Intl.DateTimeFormat('fa-IR').format(date) : <span>یک تاریخ انتخاب کنید</span>}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                      mode="single"
                                                      selected={date}
                                                      onSelect={setDate}
                                                      initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                        <Button size="lg" className="w-full text-base font-bold">
                                           جستجوی درخواست‌ها
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </section>
    )
}
