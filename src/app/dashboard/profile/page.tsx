'use client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RatingAnalyzer } from '@/components/rating-analyzer';
import { RatingForm } from '@/components/rating-form';
import { useAuth } from '@/components/auth-provider';
import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { updateUserProfile } from '@/lib/firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const profileSchema = z.object({
  name: z.string().min(2, { message: 'نام باید حداقل ۲ حرف داشته باشد.' }),
  email: z.string().email(),
  avatar: z.string().url({ message: 'لطفاً یک آدرس معتبر وارد کنید.' }).or(z.literal('')),
});

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      email: '',
      avatar: '',
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        name: user.displayName || '',
        email: user.email || '',
        avatar: user.photoURL || '',
      });
    }
  }, [user, reset]);

  const getCreationDate = () => {
    if (user?.metadata.creationTime) {
      try {
        return new Intl.DateTimeFormat('fa-IR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        }).format(new Date(user.metadata.creationTime));
      } catch (e) {
        return user.metadata.creationTime.substring(0, 10);
      }
    }
    return '...';
  };

  const onSubmit = async (data: z.infer<typeof profileSchema>) => {
    setIsLoading(true);
    try {
      await updateUserProfile(data.name, data.avatar);
      toast({
        title: 'موفقیت‌آمیز',
        description: 'اطلاعات پروفایل شما با موفقیت به‌روزرسانی شد.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'خطا',
        description: 'مشکلی در به‌روزرسانی پروفایل رخ داد.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex h-96 w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight font-headline">پروفایل کاربری</h2>
        <p className="text-muted-foreground">
          اطلاعات کاربری خود را مشاهده و ویرایش کنید.
        </p>
      </div>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20 border-2 border-primary">
              <AvatarImage src={user.photoURL ?? ''} data-ai-hint="user portrait" />
              <AvatarFallback>
                {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl">{user.displayName || 'کاربر'}</CardTitle>
              <CardDescription>عضو از {getCreationDate()}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="info" className="w-full">
            <TabsList>
              <TabsTrigger value="info">اطلاعات شخصی</TabsTrigger>
              <TabsTrigger value="ratings">امتیازها و نظرات</TabsTrigger>
              <TabsTrigger value="analyzer">تحلیلگر امتیاز</TabsTrigger>
            </TabsList>
            <TabsContent value="info" className="mt-4">
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-4 max-w-lg"
              >
                <div className="space-y-2">
                  <Label htmlFor="name">نام</Label>
                   <Controller
                    name="name"
                    control={control}
                    render={({ field }) => <Input id="name" {...field} />}
                  />
                  {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">ایمیل</Label>
                   <Controller
                    name="email"
                    control={control}
                    render={({ field }) => <Input id="email" type="email" {...field} disabled />}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="avatar">آدرس تصویر پروفایل</Label>
                   <Controller
                    name="avatar"
                    control={control}
                    render={({ field }) => <Input id="avatar" {...field} />}
                  />
                  {errors.avatar && <p className="text-sm text-destructive">{errors.avatar.message}</p>}
                </div>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
                  ذخیره تغییرات
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="ratings" className="mt-4">
              <div className="space-y-4">
                <h3 className="font-semibold">یک کاربر را ارزیابی کنید</h3>
                <RatingForm />
                <h3 className="font-semibold mt-6">امتیازهای دریافت شده</h3>
                <p className="text-muted-foreground text-sm">به زودی...</p>
              </div>
            </TabsContent>
            <TabsContent value="analyzer" className="mt-4">
              <RatingAnalyzer />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
