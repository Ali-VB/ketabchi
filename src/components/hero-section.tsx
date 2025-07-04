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
import { Label } from './ui/label';


export function HeroSection() {
    const [date, setDate] = useState<Date | undefined>();

    return (
        <section className="w-full py-12 md:py-24 lg:py-32 overflow-hidden">
            <div className="container grid gap-12 px-4 md:grid-cols-2 md:items-center md:px-6 lg:gap-24">
                <div className="w-full max-w-md space-y-4 justify-self-center md:justify-self-end">
                     <Tabs defaultValue="requester" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 h-auto p-0 bg-transparent gap-2 mb-2">
                            <TabsTrigger value="requester" className="flex-col h-full items-start gap-1 rounded-lg border p-4 text-base data-[state=active]:border-primary data-[state=active]:bg-primary/5 data-[state=active]:shadow-md">
                                <div className='flex items-center gap-2'>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                                    <span className='font-bold'>درخواست کتاب دارم</span>
                                </div>
                                <p className='text-xs text-muted-foreground text-right mt-1'>کتاب مورد نظر خود را درخواست دهید.</p>
                            </TabsTrigger>
                            <TabsTrigger value="traveler" className="flex-col h-full items-start gap-1 rounded-lg border p-4 text-base data-[state=active]:border-primary data-[state=active]:bg-primary/5 data-[state=active]:shadow-md">
                                 <div className='flex items-center gap-2'>
                                    <Plane className="h-5 w-5" />
                                    <span className='font-bold'>مسافرم</span>
                                 </div>
                                <p className='text-xs text-muted-foreground text-right mt-1'>سفر خود را اعلام کنید و کمک کنید.</p>
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value="requester">
                            <Card className="rounded-lg shadow-xl border">
                                <CardContent className="p-6">
                                    <NewRequestForm setDialogOpen={() => {}} isHeroForm={true}/>
                                </CardContent>
                            </Card>
                        </TabsContent>
                        <TabsContent value="traveler">
                           <Card className="rounded-lg shadow-xl border">
                                <CardContent className="p-6">
                                    <form className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>مسیر سفر</Label>
                                            <Input type="text" placeholder="مبدا" className="w-full" />
                                            <Input type="text" placeholder="مقصد" className="w-full" />
                                        </div>
                                         <div className="space-y-2">
                                            <Label>تاریخ سفر</Label>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                      variant={"outline"}
                                                      className={cn(
                                                        'w-full justify-start text-right font-normal',
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
                 <div className="hidden md:block place-self-center">
                    <div className="relative aspect-video w-full max-w-lg mx-auto">
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
                </div>
            </div>
        </section>
    );
}
