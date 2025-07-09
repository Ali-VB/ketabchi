'use client';

import * as React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Send, Mail, Loader2 } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import type { Conversation, Message, User } from '@/lib/types';
import { 
  getConversations, 
  getMessages, 
  sendMessage, 
  getOrCreateConversation,
  getUserProfile,
  getRequestById,
  getTripById,
  createMatch
} from '@/lib/firebase/firestore';
import { useToast } from '@/hooks/use-toast';


export default function MessagesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const recipientId = searchParams.get('recipient');
  const requestId = searchParams.get('requestId');
  const tripId = searchParams.get('tripId');
  
  const [conversations, setConversations] = React.useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = React.useState<Conversation | null>(null);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [newMessage, setNewMessage] = React.useState('');
  const [isLoadingConversations, setIsLoadingConversations] = React.useState(true);
  const [isSending, setIsSending] = React.useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = React.useState(false);
  const [isCreatingMatch, setIsCreatingMatch] = React.useState(false);
  
  const messagesEndRef = React.useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);


  // Fetch conversations for the logged-in user
  React.useEffect(() => {
    if (user) {
      setIsLoadingConversations(true);
      getConversations(user.uid)
        .then(setConversations)
        .catch(console.error)
        .finally(() => setIsLoadingConversations(false));
    }
  }, [user]);

  // Handle selecting or creating a new conversation
  React.useEffect(() => {
    if (user && recipientId && conversations.length >= 0) {
      const existingConvo = conversations.find(c => c.users.includes(recipientId));
      if (existingConvo) {
          setSelectedConversation(existingConvo);
      } else {
        setIsLoadingConversations(true);
        getOrCreateConversation(user.uid, recipientId)
        .then(async (convoId) => {
            const recipientProfile = await getUserProfile(recipientId);
            const newConversation: Conversation = {
                id: convoId,
                users: [user.uid, recipientId],
                lastMessage: 'یک مکالمه جدید شروع کنید...',
                lastMessageTimestamp: new Date().toISOString(),
                otherUser: {
                    uid: recipientId,
                    name: recipientProfile?.displayName || 'کاربر جدید',
                    avatar: recipientProfile?.photoURL || null,
                }
            };
            setConversations(prev => {
              if (prev.some(c => c.id === newConversation.id)) {
                return prev;
              }
              return [newConversation, ...prev];
            });
            setSelectedConversation(newConversation);
        })
        .catch(console.error)
        .finally(() => setIsLoadingConversations(false));
      }
    } else if (!recipientId && conversations.length > 0 && !selectedConversation) {
        setSelectedConversation(conversations[0]);
    }
  }, [recipientId, user, conversations]);


  // Listen for messages in the selected conversation
  React.useEffect(() => {
    if (selectedConversation) {
      setIsLoadingMessages(true);
      const unsubscribe = getMessages(selectedConversation.id, (newMessages) => {
        setMessages(newMessages);
        setIsLoadingMessages(false);
      });
      return () => unsubscribe();
    } else {
      setMessages([]);
    }
  }, [selectedConversation]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || !user) return;
    
    setIsSending(true);
    try {
      await sendMessage(selectedConversation.id, {
        text: newMessage,
        senderId: user.uid,
      });
      setNewMessage('');
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleCreateMatch = async () => {
    if (!requestId || !tripId || !user) return;

    setIsCreatingMatch(true);
    try {
        const request = await getRequestById(requestId);
        const trip = await getTripById(tripId);

        if (!request || !trip) {
            toast({ variant: 'destructive', title: 'خطا', description: 'درخواست یا سفر مورد نظر یافت نشد.' });
            throw new Error("Request or Trip not found.");
        }

        // A user can only accept a match for their own request
        if (request.userId !== user.uid) {
            toast({
                variant: 'destructive',
                title: 'خطای مجوز',
                description: 'شما مجاز به ایجاد این تراکنش نیستید.',
            });
            return;
        }

        await createMatch(request, trip);
        toast({
            title: "تراکنش با موفقیت ایجاد شد!",
            description: "اکنون می‌توانید وضعیت آن را در صفحه تطبیق‌ها ببینید.",
        });
        router.push('/dashboard/matches');

    } catch (error) {
        console.error("Error creating match:", error);
        toast({
            variant: "destructive",
            title: "خطا در ایجاد تراکنش",
            description: "متاسفانه مشکلی در هنگام ایجاد تراکنش پیش آمد.",
        });
    } finally {
        setIsCreatingMatch(false);
    }
}

  if (authLoading) {
    return <div className="flex h-full w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 h-[calc(100vh-120px)] rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="col-span-1 border-e flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">پیام‌ها</h2>
        </div>
        <ScrollArea className="flex-1">
          {isLoadingConversations ? (
             <div className="p-4 text-center text-sm text-muted-foreground">در حال بارگذاری...</div>
          ) : (
            conversations.map((convo) => (
              <button 
                key={convo.id} 
                className={cn(
                  "flex w-full items-center gap-3 p-4 text-right hover:bg-muted/50 transition-colors",
                  selectedConversation?.id === convo.id && "bg-muted"
                )}
                onClick={() => setSelectedConversation(convo)}
              >
                <Avatar className="h-12 w-12">
                  <AvatarImage src={convo.otherUser.avatar ?? 'https://placehold.co/100x100.png'} alt={convo.otherUser.name} data-ai-hint="user portrait" />
                  <AvatarFallback>{convo.otherUser.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden">
                  <p className="font-semibold truncate">{convo.otherUser.name}</p>
                  <p className="text-sm text-muted-foreground truncate">{convo.lastMessage}</p>
                </div>
              </button>
            ))
          )}
        </ScrollArea>
      </div>
      <div className="col-span-1 md:col-span-2 lg:col-span-3 flex flex-col">
        {selectedConversation ? (
          <>
            <div className="flex items-center gap-3 p-3 border-b">
              <Avatar className="h-10 w-10">
                <AvatarImage src={selectedConversation.otherUser.avatar ?? `https://placehold.co/100x100.png`} alt={selectedConversation.otherUser.name} data-ai-hint="user portrait" />
                <AvatarFallback>{selectedConversation.otherUser.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <h3 className="text-lg font-semibold">{selectedConversation.otherUser.name}</h3>
            </div>
            <ScrollArea className="flex-1 p-4 lg:p-6 bg-muted/20">
              <div className="space-y-4">
                {isLoadingMessages ? (
                  <div className="flex justify-center items-center h-full"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
                ) : (
                  messages.map((msg) => {
                    const isOwn = msg.senderId === user?.uid;
                    return (
                    <div key={msg.id} className={cn("flex items-end gap-2", isOwn && "justify-end")}>
                      {!isOwn && (
                        <Avatar className="h-8 w-8 self-start">
                          <AvatarImage src={selectedConversation.otherUser.avatar ?? `https://placehold.co/100x100.png`} alt={selectedConversation.otherUser.name} data-ai-hint="user portrait" />
                          <AvatarFallback>{selectedConversation.otherUser.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                      )}
                      <div className={cn(
                        "max-w-xs md:max-w-md lg:max-w-lg rounded-lg p-3",
                        isOwn ? "bg-primary text-primary-foreground" : "bg-card border"
                      )}>
                        <p className="text-sm">{msg.text}</p>
                        <p className={cn(
                          "text-xs mt-1 text-right",
                          isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
                        )}>{new Date(msg.timestamp).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                    )
                  })
                )}
                 <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
            {requestId && tripId && (
                <div className="p-4 border-t bg-accent/10">
                    <div className="flex items-center justify-between gap-4">
                        <div className="text-accent">
                            <p className="font-bold">مرحله بعد: شروع تراکنش</p>
                            <p className="text-sm text-accent/80">پس از توافق، برای امن‌سازی پرداخت روی دکمه کلیک کنید.</p>
                        </div>
                        <Button 
                            onClick={handleCreateMatch} 
                            disabled={isCreatingMatch} 
                            className="bg-accent text-accent-foreground hover:bg-accent/90 shrink-0"
                        >
                            {isCreatingMatch && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
                            شروع تراکنش
                        </Button>
                    </div>
                </div>
            )}
            <div className="p-4 border-t bg-background">
              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <Input 
                  placeholder="پیام خود را بنویسید..." 
                  className="flex-1"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  autoComplete="off"
                />
                <Button type="submit" size="icon" aria-label="ارسال پیام" disabled={!newMessage.trim() || isSending}>
                  {isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5"/>}
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
