import { Mail } from 'lucide-react';

export default function MessagesPage() {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/10 p-12 text-center h-[75vh]">
      <Mail className="h-12 w-12 text-muted-foreground/50" />
      <h3 className="text-xl font-bold tracking-tight mt-6">
        بخش پیام‌رسانی در حال ساخت است
      </h3>
      <p className="text-sm text-muted-foreground mt-2 max-w-md">
        به زودی می‌توانید از طریق این بخش به راحتی با سایر کاربران برای هماهنگی
        در ارتباط باشید.
      </p>
    </div>
  );
}
