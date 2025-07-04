
'use client';
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Briefcase, Calendar, Package, Plane } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { cn } from '@/lib/utils';
import { NewRequestForm } from './new-request-form';


export function HeroSection() {
    const [date, setDate] = useState<Date | undefined>();

    return (
        <section className="w-full py-12 md:py-16 bg-muted/20">
            <div className="container px-4 md:px-6">
                <Tabs defaultValue="traveler" className="mx-auto max-w-2xl">
                    <TabsList className="grid w-full grid-cols-2 bg-transparent p-0">
                        <TabsTrigger value="traveler" className="text-base font-semibold data-[state=active]:bg-background data-[state=active]:shadow-md rounded-t-lg rounded-b-none h-16 flex flex-col sm:flex-row items-center justify-center gap-2">
                            <Briefcase className="h-6 w-6" />
                            مسافرم
                        </TabsTrigger>
                        <TabsTrigger value="requester" className="text-base font-semibold data-[state=active]:bg-background data-[state=active]:shadow-md rounded-t-lg rounded-b-none h-16 flex flex-col sm:flex-row items-center justify-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                            درخواست کتاب دارم
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="traveler">
                        <Card className="rounded-t-none shadow-lg">
                            <CardContent className="p-6 space-y-4">
                                <div className="text-center">
                                    <h3 className="text-xl font-bold">چمدون سفرت رو از بین کتاب‌های موجود پر کن</h3>
                                </div>
                                <form className="space-y-4">
                                    <div className="relative">
                                        <Plane className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground transform -rotate-45" />
                                        <Input type="text" placeholder="مبدا" className="w-full rounded-md bg-muted/50 ps-12 h-12 text-base" />
                                    </div>
                                    <div className="relative">
                                        <Plane className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground transform rotate-45" />
                                        <Input type="text" placeholder="مقصد" className="w-full rounded-md bg-muted/50 ps-12 h-12 text-base" />
                                    </div>
                                    <div className="relative">
                                         <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                  variant={"outline"}
                                                  className={cn(
                                                    'w-full justify-start text-right font-normal rounded-md h-12 text-base bg-muted/50 ps-12 border-0',
                                                    !date && 'text-muted-foreground'
                                                  )}
                                                >
                                                  {date ? new Intl.DateTimeFormat('fa-IR').format(date) : <span>تاریخ سفر</span>}
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
                                        <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                    </div>
                                    <Button size="lg" className="w-full rounded-md h-12 text-lg font-bold bg-slate-800 hover:bg-slate-900 text-white">
                                       جستجوی کتاب
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="requester">
                         <Card className="rounded-t-none shadow-lg">
                            <CardContent className="p-6 space-y-4">
                                <div className="text-center">
                                    <h3 className="text-xl font-bold">کتابی که می‌خوای رو درخواست بده</h3>
                                </div>
                                <NewRequestForm setDialogOpen={() => {}} />
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </section>
    )
}
