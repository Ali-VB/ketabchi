'use client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { Calendar } from "./ui/calendar";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useAuth } from "./auth-provider";
import { addTrip } from "@/lib/firebase/firestore";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";

const tripFormSchema = z.object({
  from_city: z.string().min(1, "شهر مبدا الزامی است."),
  to_city: z.string().min(1, "شهر مقصد الزامی است."),
  trip_date: z.date({
    required_error: "تاریخ سفر الزامی است.",
  }),
  capacity: z.coerce.number().min(0.1, "ظرفیت باید حداقل ۰.۱ کیلوگرم باشد."),
});

type TripFormValues = z.infer<typeof tripFormSchema>;

const formatPersianDate = (date: Date) => {
    if (!date) return '';
    try {
      return new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }).format(date);
    } catch (e) {
      return date.toDateString();
    }
  };

export function NewTripForm({ setDialogOpen, isHeroForm = false, onTripAdded }: { setDialogOpen: (open: boolean) => void; isHeroForm?: boolean; onTripAdded?: () => void; }) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const { user } = useAuth();

  const form = useForm<TripFormValues>({
    resolver: zodResolver(tripFormSchema),
    defaultValues: {
      from_city: '',
      to_city: '',
      capacity: 1,
    },
  });

  const onSubmit = async (data: TripFormValues) => {
    if (!user) {
      router.push('/login?redirect=/dashboard/trips?action=new');
      return;
    }
    
    setIsLoading(true);

    try {
      await addTrip({
        from_city: data.from_city,
        to_city: data.to_city,
        trip_date: format(data.trip_date, "yyyy-MM-dd"),
        capacity: data.capacity,
        userId: user.uid,
        user: {
            uid: user.uid,
            name: user.displayName || 'کاربر بی‌نام',
            avatar: user.photoURL
        }
      });
        
      toast({
          title: "سفر شما ثبت شد",
          description: "سفر شما با موفقیت اعلام شد و برای تطبیق با درخواست‌ها استفاده می‌شود.",
      });
      
      onTripAdded?.();
      form.reset();
      if (!isHeroForm) {
          setDialogOpen(false);
      } else {
        router.push('/dashboard/trips');
      }
    } catch (error) {
      toast({
          title: "خطا در ثبت سفر",
          description: "مشکلی در هنگام ثبت سفر شما پیش آمد. لطفا دوباره تلاش کنید.",
          variant: "destructive"
      })
    } finally {
      setIsLoading(false);
    }
  }
  
  const formContent = (
    <form onSubmit={form.handleSubmit(onSubmit)} className={cn('space-y-4 text-right', isHeroForm ? 'space-y-3' : 'p-1')}>
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="from_city"
          render={({ field }) => (
            <FormItem>
              <FormLabel>شهر مبدا (در ایران)</FormLabel>
              <FormControl>
                <Input placeholder="مثال: تهران" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="to_city"
          render={({ field }) => (
            <FormItem>
              <FormLabel>شهر مقصد (خارج از ایران)</FormLabel>
              <FormControl>
                <Input placeholder="مثال: تورنتو" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="trip_date"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>تاریخ سفر</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-right font-normal",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="ms-2 h-4 w-4" />
                    {field.value ? formatPersianDate(field.value) : <span>یک تاریخ انتخاب کنید</span>}
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={field.onChange}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="capacity"
        render={({ field }) => (
          <FormItem>
            <FormLabel>ظرفیت خالی (کیلوگرم)</FormLabel>
            <FormControl>
              <Input type="number" step="0.5" placeholder="مثال: 5" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="flex justify-end pt-2">
        <Button type="submit" size={isHeroForm ? "lg" : "default"} className={cn(isHeroForm && "w-full text-base font-bold")} disabled={isLoading}>
            {isLoading && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
            ثبت سفر
        </Button>
      </div>
    </form>
  );

  return (
    <Form {...form}>
        {formContent}
    </Form>
  );
}
