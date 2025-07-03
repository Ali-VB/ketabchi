import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

export function ChatInterface() {
    return (
        <Card className="h-[75vh] flex">
            <div className="w-1/3 border-s">
                <div className="p-4 border-b">
                    <h3 className="font-semibold text-lg">پیام‌ها</h3>
                </div>
                <div className="p-2 space-y-2">
                    {/* Active Chat Item */}
                    <div className="flex items-center gap-3 p-2 rounded-lg bg-primary/10 cursor-pointer">
                        <Avatar>
                            <AvatarImage src="https://placehold.co/40x40.png" />
                            <AvatarFallback>ع</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-semibold">علی</p>
                            <p className="text-sm text-muted-foreground truncate">سلام! کتاب رو پیدا کردم...</p>
                        </div>
                    </div>
                     {/* Inactive Chat Item */}
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer">
                        <Avatar>
                            <AvatarImage src="https://placehold.co/40x40.png" />
                            <AvatarFallback>ز</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-semibold">زهرا</p>
                            <p className="text-sm text-muted-foreground truncate">متشکرم. منتظر خبرتون هستم.</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="w-2/3 flex flex-col">
                <div className="p-4 border-b flex items-center gap-3">
                    <Avatar>
                        <AvatarImage src="https://placehold.co/40x40.png" />
                        <AvatarFallback>ع</AvatarFallback>
                    </Avatar>
                    <h3 className="font-semibold text-lg">علی</h3>
                </div>
                <CardContent className="flex-1 p-4 space-y-4 overflow-y-auto">
                    {/* Received Message */}
                    <div className="flex items-end gap-2">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src="https://placehold.co/40x40.png" />
                            <AvatarFallback>ع</AvatarFallback>
                        </Avatar>
                        <div className="p-3 rounded-lg bg-muted">
                            <p>سلام، کتاب «کوری» رو براتون پیدا کردم. فقط لطفا تایید کنید که همین نسخه مد نظرتون هست.</p>
                            <p className="text-xs text-muted-foreground mt-1 text-right">۱۰:۳۰ صبح</p>
                        </div>
                    </div>
                    {/* Sent Message */}
                    <div className="flex items-end gap-2 justify-end">
                         <div className="p-3 rounded-lg bg-primary text-primary-foreground">
                            <p>عالیه! بله همین نسخه هست. خیلی ممنونم.</p>
                            <p className="text-xs text-primary-foreground/80 mt-1 text-left">۱۰:۳۲ صبح</p>
                        </div>
                        <Avatar className="h-8 w-8">
                            <AvatarImage src="https://placehold.co/40x40.png" />
                            <AvatarFallback>ش</AvatarFallback>
                        </Avatar>
                    </div>
                </CardContent>
                <div className="p-4 border-t">
                    <div className="relative">
                        <Input placeholder="پیام خود را بنویسید..." className="pe-12 h-12" />
                        <Button type="submit" size="icon" className="absolute left-2 top-1/2 -translate-y-1/2 h-9 w-9">
                            <Send className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </div>
        </Card>
    );
}
