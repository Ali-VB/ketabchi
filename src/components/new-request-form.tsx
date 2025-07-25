
'use client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar as CalendarIcon, Loader2, PlusCircle, Trash2 } from 'lucide-react';
import { Calendar } from "./ui/calendar";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useAuth } from "./auth-provider";
import { addRequest } from "@/lib/firebase/firestore";
import { format } from "date-fns";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { ScrollArea } from "./ui/scroll-area";
import { DateRange } from "react-day-picker";

const bookSchema = z.object({
  title: z.string().min(1, "عنوان کتاب الزامی است."),
  author: z.string().min(1, "نویسنده الزامی است."),
  quantity: z.coerce.number().min(1, "تعداد باید حداقل ۱ باشد."),
});

const requestFormSchema = z.object({
  books: z.array(bookSchema).min(1, "حداقل یک کتاب باید اضافه شود."),
  from_city: z.string().min(1, "شهر مبدا الزامی است."),
  to_city: z.string().min(1, "شهر مقصد الزامی است."),
  deadline: z.object(
    {
      from: z.date({ required_error: "تاریخ شروع الزامی است." }),
      to: z.date({ required_error: "تاریخ پایان الزامی است." }),
    },
    { required_error: "بازه زمانی مهلت الزامی است." }
  ),
  weight: z.coerce.number().min(0.1, "وزن باید حداقل ۰.۱ کیلوگرم باشد.").optional(),
  description: z.string().optional(),
});

type RequestFormValues = z.infer<typeof requestFormSchema>;

export function NewRequestForm({ setDialogOpen, onPostSuccess }: { setDialogOpen: (open: boolean) => void; onPostSuccess?: () => void }) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const { user } = useAuth();

  const form = useForm<RequestFormValues>({
    resolver: zodResolver(requestFormSchema),
    defaultValues: {
      books: [{ title: '', author: '', quantity: 1 }],
      from_city: '',
      to_city: '',
      weight: 0.5,
      description: '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "books",
  });

  const onSubmit = async (data: RequestFormValues) => {
    if (!user) {
      router.push('/login?redirect=/dashboard/requests?action=new');
      return;
    }
    
    setIsLoading(true);

    try {
        await addRequest({
            books: data.books,
            from_city: data.from_city,
            to_city: data.to_city,
            deadline_start: format(data.deadline.from, "yyyy-MM-dd"),
            deadline_end: format(data.deadline.to, "yyyy-MM-dd"),
            weight: data.weight || 0.5,
            description: data.description || '',
            userId: user.uid,
            user: {
                uid: user.uid,
                displayName: user.displayName || 'کاربر بی‌نام',
                photoURL: user.photoURL,
                email: user.email
            }
        });

        toast({
            title: "درخواست ثبت شد",
            description: "درخواست کتاب شما با موفقیت ثبت شد و در پلتفرم نمایش داده می‌شود.",
        });
        
        onPostSuccess?.();
        form.reset();
        setDialogOpen(false);
    } catch (error) {
         toast({
            title: "خطا در ثبت درخواست",
            description: "مشکلی در هنگام ثبت درخواست شما پیش آمد. لطفا دوباره تلاش کنید.",
            variant: "destructive"
        })
    } finally {
        setIsLoading(false);
    }
  }

  const formatDateRange = (
    date: DateRange | undefined
  ): string => {
    if (!date?.from) {
      return "یک تاریخ انتخاب کنید";
    }
  
    const formatOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
  
    const locale = 'fa-IR-u-ca-persian';
    const formatter = new Intl.DateTimeFormat(locale, formatOptions);
    const fromDate = formatter.format(date.from);
  
    if (date.to) {
      const toDate = formatter.format(date.to);
      return `${fromDate} – ${toDate}`;
    }
  
    return fromDate;
  };
  
  const formContent = (
     <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 text-right p-1">
        
        <div className="space-y-2">
          <Label className="font-bold">کتاب‌ها</Label>
          <div className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="relative space-y-3 rounded-lg border bg-muted/30 p-4">
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute -top-3 -left-3 h-7 w-7 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/80"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
                <FormField
                  control={form.control}
                  name={`books.${index}.title`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>عنوان کتاب</FormLabel>
                      <FormControl>
                        <Input placeholder="مثال: شازده کوچولو" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-5 gap-3">
                  <div className="col-span-3">
                    <FormField
                      control={form.control}
                      name={`books.${index}.author`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>نویسنده</FormLabel>
                          <FormControl>
                            <Input placeholder="مثال: اگزوپری" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="col-span-2">
                    <FormField
                      control={form.control}
                      name={`books.${index}.quantity`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>تعداد</FormLabel>
                          <FormControl>
                            <Input type="number" min="1" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => append({ title: "", author: "", quantity: 1 })}
        >
          <PlusCircle className="me-2 h-4 w-4" />
          افزودن کتاب دیگر
        </Button>
        
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
            name="deadline"
            render={({ field }) => (
            <FormItem className="flex flex-col">
                <FormLabel>بازه زمانی مهلت</FormLabel>
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
                            {formatDateRange(field.value)}
                        </Button>
                        </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <Calendar
                        mode="range"
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
            name="weight"
            render={({ field }) => (
            <FormItem>
                <FormLabel>وزن تقریبی کل (کیلوگرم)</FormLabel>
                <FormControl>
                <Input type="number" step="0.1" placeholder="۰.۵" {...field} />
                </FormControl>
                <FormMessage />
            </FormItem>
            )}
        />
        <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
            <FormItem>
                <FormLabel>توضیحات (اختیاری)</FormLabel>
                <FormControl>
                <Textarea placeholder="اطلاعات تکمیلی مانند نسخه، ترجمه و..." {...field} />
                </FormControl>
                <FormMessage />
            </FormItem>
            )}
        />
        <div className="flex justify-end pt-2">
            <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
                ثبت درخواست
            </Button>
        </div>
      </form>
  )

  return (
    <Form {...form}>
      <ScrollArea className="h-[70vh] pr-4">
        {formContent}
      </ScrollArea>
    </Form>
  );
}
