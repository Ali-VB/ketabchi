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

export function ReportGenerator() {
  const [report, setReport] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(2024, 0, 20),
    to: addDays(new Date(2024, 0, 20), 7),
  });
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>ایجاد گزارش هفتگی پلتفرم</CardTitle>
        <CardDescription>
          با استفاده از هوش مصنوعی، گزارش استفاده از پلتفرم را برای بازه زمانی دلخواه ایجاد کنید.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2">
           <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={"outline"}
                className="w-[300px] justify-start text-right font-normal"
              >
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, "LLL dd, y")} -{" "}
                      {format(date.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(date.from, "LLL dd, y")
                  )
                ) : (
                  <span>یک تاریخ انتخاب کنید</span>
                )}
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
