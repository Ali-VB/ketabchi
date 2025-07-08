'use client';
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plane } from "lucide-react";
import { NewRequestForm } from './new-request-form';
import { NewTripForm } from './new-trip-form';

export function HeroSection() {
    return (
        <section className="w-full py-12 md:py-24 lg:py-32">
            <div className="container flex items-center justify-center px-4 md:px-6">
                <div className="w-full max-w-sm space-y-4">
                     <Tabs defaultValue="traveler" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 h-auto p-0 bg-transparent gap-2 mb-2">
                            <TabsTrigger value="requester" className="flex-col h-full items-center justify-center gap-1 rounded-lg border p-4 text-base data-[state=active]:border-primary data-[state=active]:bg-primary/5 data-[state=active]:shadow-md">
                                <div className='flex items-center gap-2'>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                                    <span className='font-bold'>درخواست کتاب دارم</span>
                                </div>
                            </TabsTrigger>
                            <TabsTrigger value="traveler" className="flex-col h-full items-center justify-center gap-1 rounded-lg border p-4 text-base data-[state=active]:border-primary data-[state=active]:bg-primary/5 data-[state=active]:shadow-md">
                                 <div className='flex items-center gap-2'>
                                    <Plane className="h-5 w-5" />
                                    <span className='font-bold'>مسافرم</span>
                                 </div>
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value="requester">
                            <Card className="rounded-lg shadow-xl border">
                                <CardContent className="p-4">
                                    <NewRequestForm setDialogOpen={() => {}} isHeroForm={true}/>
                                </CardContent>
                            </Card>
                        </TabsContent>
                        <TabsContent value="traveler">
                           <Card className="rounded-lg shadow-xl border">
                                <CardContent className="p-4">
                                    <NewTripForm setDialogOpen={() => {}} isHeroForm={true} />
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </section>
    );
}
