'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { analyzeUserRatings, type AnalyzeUserRatingsOutput } from '@/ai/flows/analyze-user-ratings';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { useToast } from '@/hooks/use-toast';

const mockRatings = [
    { rating: 5, comment: "عالی بود!" },
    { rating: 1, comment: "خیلی بد بود." },
    { rating: 5, comment: "عالی بود!" },
    { rating: 4, comment: "خوب بود." },
    { rating: 5, comment: "عالی بود!" },
]

export function RatingAnalyzer() {
  const [result, setResult] = useState<AnalyzeUserRatingsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleAnalyze = async () => {
    setIsLoading(true);
    setResult(null);
    try {
      const analysisResult = await analyzeUserRatings({
        userId: 'user123',
        ratings: mockRatings,
      });
      setResult(analysisResult);
    } catch (error) {
      console.error('Failed to analyze ratings:', error);
       toast({
            title: "خطا در تحلیل امتیازها",
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
        <CardTitle>تحلیلگر امتیاز با هوش مصنوعی</CardTitle>
        <CardDescription>
          امتیازهای ثبت‌شده برای یک کاربر را برای شناسایی فعالیت‌های مشکوک تحلیل کنید. این یک ابزار آزمایشی است.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={handleAnalyze} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="me-2 h-4 w-4 animate-spin" />
              در حال تحلیل...
            </>
          ) : (
            'شروع تحلیل امتیازهای نمونه'
          )}
        </Button>
        {result && (
          <Alert variant={result.isSuspicious ? 'destructive' : 'default'} className="bg-muted/50">
            <AlertTitle>{result.isSuspicious ? 'فعالیت مشکوک شناسایی شد' : 'فعالیت عادی'}</AlertTitle>
            <AlertDescription>
              {result.isSuspicious ? result.reason : 'هیچ فعالیت مشکوکی در امتیازهای این کاربر یافت نشد.'}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
