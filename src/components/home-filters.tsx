'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, MapPin, Search } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

export function HomeFilters() {
  const [date, setDate] = useState<Date | undefined>();

  useEffect(() => {
    setDate(new Date());
  }, []);

  return (
    <div className="sticky top-[55px] z-40 border-b bg-background/80 py-4 backdrop-blur">
      <div className="container">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-6">
          <div className="relative flex-1">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="شهر مقصد"
              className="w-full rounded-full bg-background pe-10 h-12 text-base"
            />
          </div>
          <div className="relative flex-1">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-right font-normal rounded-full h-12 text-base',
                    !date && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="ms-2 h-5 w-5" />
                  {date ? new Intl.DateTimeFormat('fa-IR').format(date) : <span>تاریخ مورد نظر</span>}
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
          <Button size="lg" className="rounded-full h-12 w-full md:w-auto">
            <Search className="h-5 w-5 me-2" />
            جستجو
          </Button>
        </div>
      </div>
    </div>
  );
}
