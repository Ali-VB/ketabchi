'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { generatePlatformReport } from '@/ai/flows/generate-platform-report';
import { Loader2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar } from './ui/calendar';
import { DateRange } from 'react-day-picker';
import { addDays, format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';

export function ReportGenerator() {
  const [report, setReport] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(2024, 0, 20),
    to: addDays(new Date(2024, 0, 20), 7),
  });
  const [calendarType, setCalendarType] = useState<'gregorian' | 'jalali'>('jalali');
  const { toast } = useToast();

  const handleGenerateReport = async () => {
    if (!date?.from || !date?.to) {
        toast({
            title: "خطا",
            description: "لطفا بازه زمانی را انتخاب کنید.",
            variant: "destructive"
        })
        return;
    }
    
    setIsLoading(true);
    setReport('');
    try {
      const result = await generatePlatformReport({
        startDate: format(date.from, 'yyyy-MM-dd'),
        endDate: format(date.to, 'yyyy-MM-dd'),
      });
      setReport(result.report);
    } catch (error) {
      console.error('Failed to generate report:', error);
      toast({
            title: "خطا در ایجاد گزارش",
            description: "متاسفانه مشکلی در ارتباط با سرویس هوش مصنوعی پیش آمد.",
            variant: "destructive"
        })
    } finally {
      setIsLoading(false);
    }
  };

  const formatDateRange = (
    date: DateRange | undefined,
    calendar: 'gregorian' | 'jalali'
  ): string => {
    if (!date?.from) {
      return "یک تاریخ انتخاب کنید";
    }
  
    const formatOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
  
    const locale = calendar === 'jalali' ? 'fa-IR-u-ca-persian' : 'en-US';
    const formatter = new Intl.DateTimeFormat(locale, formatOptions);
    const fromDate = formatter.format(date.from);
  
    if (date.to) {
      const toDate = formatter.format(date.to);
      return `${fromDate} – ${toDate}`;
    }
  
    return fromDate;
  };


  return (
    <Card>
      <CardHeader>
        <CardTitle>ایجاد گزارش هفتگی پلتفرم</CardTitle>
        <CardDescription>
          با استفاده از هوش مصنوعی، گزارش استفاده از پلتفرم را برای بازه زمانی دلخواه ایجاد کنید.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
           <RadioGroup
            dir="rtl"
            value={calendarType}
            onValueChange={(value: 'gregorian' | 'jalali') => setCalendarType(value)}
            className="flex items-center gap-4"
            >
              <Label className="font-normal flex items-center gap-2 cursor-pointer">
                <RadioGroupItem value="jalali" id="jalali" />
                شمسی
              </Label>
              <Label className="font-normal flex items-center gap-2 cursor-pointer">
                <RadioGroupItem value="gregorian" id="gregorian" />
                میلادی
              </Label>
            </RadioGroup>

           <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={"outline"}
                className="w-[300px] justify-start text-right font-normal"
              >
                {formatDateRange(date, calendarType)}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={setDate}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>
        <Button onClick={handleGenerateReport} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="me-2 h-4 w-4 animate-spin" />
              در حال ایجاد گزارش...
            </>
          ) : (
            'ایجاد گزارش'
          )}
        </Button>
        {report && (
          <div className="space-y-2">
            <h3 className="font-semibold">گزارش تولید شده:</h3>
            <Textarea value={report} readOnly rows={15} className="bg-muted/50" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
