'use client';

import * as React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Send, Mail } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

// Mock data for demonstration
const mockConversations = [
  {
    id: '1',
    userId: 'user-id-simin',
    name: 'سیمین دانشور',
    avatar: 'https://placehold.co/100x100.png',
    lastMessage: 'سلام! کتاب شما رو پیدا کردم.',
    lastMessageTime: '۱۰:۴۵',
    unread: 2,
  },
  {
    id: '2',
    userId: 'user-id-jalal',
    name: 'جلال آل احمد',
    avatar: 'https://placehold.co/100x100.png',
    lastMessage: 'متاسفانه امکانش نیست.',
    lastMessageTime: 'دیروز',
    unread: 0,
  },
];

const mockMessages: Record<string, {id: string, text: string, time: string, isOwn: boolean}[]> = {
    'user-id-simin': [
        { id: 'm1', text: 'سلام! کتاب شما رو پیدا کردم. کی می‌تونیم هماهنگ کنیم؟', time: '۱۰:۴۲', isOwn: false },
        { id: 'm2', text: 'سلام! خیلی ممنون. من آخر هفته تهران هستم.', time: '۱۰:۴۳', isOwn: true },
        { id: 'm3', text: 'عالیه. من هم همینطور. پیام میدم بهتون.', time: '۱۰:۴۵', isOwn: false },
    ],
    'user-id-jalal': [
        { id: 'm4', text: 'سلام. برای سفرتون جا دارید؟', time: 'دیروز', isOwn: true },
        { id: 'm5', text: 'بله، چطور؟', time: 'دیروز', isOwn: false },
    ]
};


export default function MessagesPage() {
  const searchParams = useSearchParams();
  const recipientId = searchParams.get('recipient');
  
  const [conversations, setConversations] = React.useState(mockConversations);
  const [selectedConversation, setSelectedConversation] = React.useState<(typeof mockConversations[0]) | null>(null);
  const [messages, setMessages] = React.useState<any[]>([]);
  const [newMessage, setNewMessage] = React.useState('');

  React.useEffect(() => {
    let convoToSelect = null;
    if (recipientId) {
        convoToSelect = conversations.find(c => c.userId === recipientId);
        if (!convoToSelect) {
            // In a real app, you would fetch the user's info here
            convoToSelect = {
                id: recipientId,
                userId: recipientId,
                name: `کاربر جدید`,
                avatar: 'https://placehold.co/100x100.png',
                lastMessage: 'یک مکالمه جدید شروع کنید...',
                lastMessageTime: '',
                unread: 0,
            };
            setConversations(prev => [convoToSelect!, ...prev]);
        }
    } else if (conversations.length > 0) {
        convoToSelect = conversations[0];
    }
    setSelectedConversation(convoToSelect);
  }, [recipientId]);

  React.useEffect(() => {
    if (selectedConversation) {
        setMessages((mockMessages as any)[selectedConversation.userId] || []);
    } else {
        setMessages([]);
    }
  }, [selectedConversation]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;
    const ownMessage = {
      id: `m${Date.now()}`,
      text: newMessage,
      time: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
      isOwn: true,
    };
    setMessages(prev => [...prev, ownMessage]);
    setNewMessage('');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 h-[calc(100vh-120px)] rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="col-span-1 border-e flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">پیام‌ها</h2>
        </div>
        <ScrollArea className="flex-1">
          {conversations.map((convo) => (
            <button 
              key={convo.id} 
              className={cn(
                "flex w-full items-center gap-3 p-4 text-right hover:bg-muted/50 transition-colors",
                selectedConversation?.id === convo.id && "bg-muted"
              )}
              onClick={() => setSelectedConversation(convo)}
            >
              <Avatar className="h-12 w-12">
                <AvatarImage src={convo.avatar} alt={convo.name} data-ai-hint="user portrait" />
                <AvatarFallback>{convo.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <p className="font-semibold truncate">{convo.name}</p>
                <p className="text-sm text-muted-foreground truncate">{convo.lastMessage}</p>
              </div>
              {convo.unread > 0 && (
                <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                  {convo.unread}
                </span>
              )}
            </button>
          ))}
        </ScrollArea>
      </div>
      <div className="col-span-1 md:col-span-2 lg:col-span-3 flex flex-col">
        {selectedConversation ? (
          <>
            <div className="flex items-center gap-3 p-3 border-b">
              <Avatar className="h-10 w-10">
                <AvatarImage src={selectedConversation.avatar} alt={selectedConversation.name} data-ai-hint="user portrait" />
                <AvatarFallback>{selectedConversation.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <h3 className="text-lg font-semibold">{selectedConversation.name}</h3>
            </div>
            <ScrollArea className="flex-1 p-4 lg:p-6 bg-muted/20">
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div key={msg.id} className={cn("flex items-end gap-2", msg.isOwn && "justify-end")}>
                    {!msg.isOwn && (
                      <Avatar className="h-8 w-8 self-start">
                        <AvatarImage src={selectedConversation.avatar} alt={selectedConversation.name} data-ai-hint="user portrait" />
                        <AvatarFallback>{selectedConversation.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    )}
                    <div className={cn(
                      "max-w-xs md:max-w-md lg:max-w-lg rounded-lg p-3",
                      msg.isOwn ? "bg-primary text-primary-foreground" : "bg-card border"
                    )}>
                      <p className="text-sm">{msg.text}</p>
                      <p className={cn(
                        "text-xs mt-1 text-right",
                        msg.isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
                      )}>{msg.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="p-4 border-t bg-background">
              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <Input 
                  placeholder="پیام خود را بنویسید..." 
                  className="flex-1"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  autoComplete="off"
                />
                <Button type="submit" size="icon" aria-label="ارسال پیام" disabled={!newMessage.trim()}>
                  <Send className="h-5 w-5"/>
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-center p-4">
             <div>
                <Mail className="h-12 w-12 text-muted-foreground/50 mx-auto" />
                <h3 className="text-xl font-bold tracking-tight mt-6">
                    بخش پیام‌رسانی
                </h3>
                <p className="text-sm text-muted-foreground mt-2 max-w-md">
                    یک گفتگو را برای مشاهده پیام‌ها انتخاب کنید یا یک گفتگوی جدید را از طریق کارت‌های درخواست و سفر شروع کنید.
                </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
