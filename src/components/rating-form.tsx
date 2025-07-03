'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export function RatingForm() {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
     toast({
        title: "امتیاز ثبت شد",
        description: "از اینکه نظر خود را ثبت کردید متشکریم.",
    })
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded-lg space-y-4 bg-muted/20">
      <div>
        <p className="mb-2 font-medium">لطفاً به این کاربر امتیاز دهید:</p>
        <div className="flex items-center gap-1" dir="ltr">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={cn(
                'h-8 w-8 cursor-pointer transition-colors',
                (hoverRating >= star || rating >= star) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
              )}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
            />
          ))}
        </div>
      </div>
      <div>
        <label htmlFor="comment" className="mb-2 font-medium block">نظر شما (اختیاری):</label>
        <Textarea id="comment" placeholder="تجربه خود را با این کاربر به اشتراک بگذارید..." />
      </div>
      <Button type="submit" disabled={rating === 0}>ثبت امتیاز</Button>
    </form>
  );
}
