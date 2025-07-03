import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RatingAnalyzer } from "@/components/rating-analyzer";
import { RatingForm } from "@/components/rating-form";

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight font-headline">پروفایل کاربری</h2>
        <p className="text-muted-foreground">اطلاعات کاربری خود را مشاهده و ویرایش کنید.</p>
      </div>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20 border-2 border-primary">
              <AvatarImage src="https://placehold.co/80x80.png" data-ai-hint="user portrait" />
              <AvatarFallback>ش</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl">شهریار</CardTitle>
              <CardDescription>عضو از ۱۴۰۳/۰۱/۱۵</CardDescription>
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
              <form className="space-y-4 max-w-lg">
                <div className="space-y-2">
                  <Label htmlFor="name">نام</Label>
                  <Input id="name" defaultValue="شهریار" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">ایمیل</Label>
                  <Input id="email" type="email" defaultValue="shahriar@example.com" disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="avatar">آدرس تصویر پروفایل</Label>
                  <Input id="avatar" defaultValue="https://placehold.co/80x80.png" />
                </div>
                <Button type="submit">ذخیره تغییرات</Button>
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
